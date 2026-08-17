import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { products } from "../data/products";

import {
    supabase,
    supabaseConfigured,
} from "../lib/supabase";

const AppContext = createContext(null);

const CART_KEY = "goo_cart";
const THEME_KEY = "goo_theme";


// =====================================================
// LOCAL STORAGE
// =====================================================

const read = (key, fallback) => {
    try {
        const value = localStorage.getItem(key);

        if (!value) {
            return fallback;
        }

        return JSON.parse(value);
    } catch {
        return fallback;
    }
};


// =====================================================
// INDIAN PHONE NORMALIZER
// =====================================================

const normalizeIndianPhone = (phone) => {
    const value = String(phone || "").trim();

    if (!value) {
        throw new Error(
            "Please enter your mobile number."
        );
    }

    const digits = value.replace(/\D/g, "");

    let localNumber = digits;

    if (
        digits.length === 12 &&
        digits.startsWith("91")
    ) {
        localNumber = digits.slice(2);
    }

    if (localNumber.length !== 10) {
        throw new Error(
            "Please enter a valid 10-digit Indian mobile number."
        );
    }

    if (!/^[6-9]\d{9}$/.test(localNumber)) {
        throw new Error(
            "Please enter a valid Indian mobile number starting with 6, 7, 8 or 9."
        );
    }

    return `+91${localNumber}`;
};


// MSG91 format:
// 919876543210
// NO +
// =====================================================

const msg91Phone = (phone) => {
    const normalized =
        normalizeIndianPhone(phone);

    return normalized.replace(
        /^\+/,
        ""
    );
};


// =====================================================
// MAP ORDER
// =====================================================

const mapOrder = (o) => ({
    ...o,

    userId:
        o.user_id,

    createdAt:
        o.created_at,

    updatedAt:
        o.updated_at,

    deliveryFee:
        Number(
            o.delivery_fee || 0
        ),

    subtotal:
        Number(
            o.subtotal || 0
        ),

    total:
        Number(
            o.total || 0
        ),

    totalAmount:
        Number(
            o.total_amount ||
            o.total ||
            0
        ),

    paymentMethod:
        o.payment_method ||
        "cod",

    paymentStatus:
        o.payment_status ||
        "Pending",

    razorpayOrderId:
        o.razorpay_order_id ||
        null,

    razorpayPaymentId:
        o.razorpay_payment_id ||
        null,

    razorpaySignature:
        o.razorpay_signature ||
        null,

    subscriptionId:
        o.subscription_id ||
        null,

    subscriptionDeliveryDate:
        o.subscription_delivery_date ||
        null,

    slot:
        o.slot,

    frequency:
        o.frequency,

    customer: {
        name:
            o.customer_name,

        phone:
            o.customer_phone,

        email:
            o.customer_email,

        address:
            o.address ||
            o.delivery_address ||
            "",

        city:
            o.city,

        pincode:
            o.pincode,

        instructions:
            o.instructions ||
            "",
    },

    items:
        (
            o.order_items ||
            []
        ).map((i) => ({
            id:
                i.product_id,

            productId:
                i.product_id,

            name:
                i.name,

            unit:
                i.unit,

            price:
                Number(
                    i.unit_price || 0
                ),

            qty:
                Number(
                    i.qty || 0
                ),

            lineTotal:
                Number(
                    i.line_total || 0
                ),
        })),

    timeline:
        (
            o.order_status_history ||
            []
        ).map((h) => ({
            status:
                h.status,

            time:
                h.created_at,
        })),
});


// =====================================================
// APP PROVIDER
// =====================================================

export function AppProvider({
    children,
}) {

    // =================================================
    // AUTH
    // =================================================

    const [
        currentUser,
        setCurrentUser,
    ] = useState(null);

    const [
        profileLoading,
        setProfileLoading,
    ] = useState(
        supabaseConfigured
    );


    // =================================================
    // ORDERS
    // =================================================

    const [
        orders,
        setOrders,
    ] = useState([]);

    const [
        ordersLoading,
        setOrdersLoading,
    ] = useState(false);


    // =================================================
    // USERS
    // =================================================

    const [
        users,
        setUsers,
    ] = useState([]);


    // =================================================
    // CART
    // =================================================

    const [
        cart,
        setCart,
    ] = useState(() =>
        read(
            CART_KEY,
            []
        )
    );


    // =================================================
    // THEME
    // =================================================

    const [
        theme,
        setTheme,
    ] = useState(
        () =>
            localStorage.getItem(
                THEME_KEY
            ) || "light"
    );


    // =================================================
    // CLOUD ERROR
    // =================================================

    const [
        cloudError,
        setCloudError,
    ] = useState("");


    // =================================================
    // CART STORAGE
    // =================================================

    useEffect(() => {

        localStorage.setItem(
            CART_KEY,
            JSON.stringify(cart)
        );

    }, [cart]);


    // =================================================
    // THEME
    // =================================================

    useEffect(() => {

        document.documentElement.dataset.theme =
            theme;

        localStorage.setItem(
            THEME_KEY,
            theme
        );

    }, [theme]);


    // =================================================
    // LOAD PROFILE
    // =================================================

    const loadProfile = async (
        authUser
    ) => {

        if (
            !authUser ||
            !supabase
        ) {

            setCurrentUser(null);

            return null;
        }

        const {
            data,
            error,
        } = await supabase
            .from("profiles")
            .select("*")
            .eq(
                "id",
                authUser.id
            )
            .maybeSingle();

        if (error) {
            throw error;
        }


        // ---------------------------------------------
        // CREATE PROFILE IF MISSING
        // ---------------------------------------------

        if (!data) {

            const metadata =
                authUser.user_metadata ||
                {};

            const phone =
                authUser.phone ||
                metadata.phone ||
                null;

            const email =
                authUser.email ||
                metadata.email ||
                null;

            const name =
                metadata.name ||
                metadata.full_name ||
                "Goo Amrutham Customer";


            const {
                data:
                    createdProfile,
                error:
                    createError,
            } = await supabase
                .from("profiles")
                .insert({
                    id:
                        authUser.id,

                    name,

                    phone,

                    email,

                    role:
                        "customer",
                })
                .select("*")
                .single();


            if (createError) {

                const {
                    data:
                        existingProfile,
                    error:
                        retryError,
                } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq(
                        "id",
                        authUser.id
                    )
                    .maybeSingle();


                if (
                    retryError ||
                    !existingProfile
                ) {
                    throw createError;
                }


                const profile = {
                    ...existingProfile,

                    email:
                        existingProfile.email ||
                        authUser.email ||
                        null,

                    phone:
                        existingProfile.phone ||
                        authUser.phone ||
                        null,
                };

                setCurrentUser(profile);

                return profile;
            }


            const profile = {
                ...createdProfile,

                email:
                    createdProfile.email ||
                    authUser.email ||
                    null,

                phone:
                    createdProfile.phone ||
                    authUser.phone ||
                    null,
            };

            setCurrentUser(profile);

            return profile;
        }


        // ---------------------------------------------
        // EXISTING PROFILE
        // ---------------------------------------------

        const profile = {
            ...data,

            email:
                data.email ||
                authUser.email ||
                null,

            phone:
                data.phone ||
                authUser.phone ||
                null,
        };

        setCurrentUser(profile);

        return profile;
    };


    // =================================================
    // SUPABASE SESSION
    // =================================================

    useEffect(() => {

        if (!supabase) {

            setProfileLoading(false);

            return;
        }

        let mounted = true;


        // ---------------------------------------------
        // INITIAL SESSION
        // ---------------------------------------------

        supabase.auth
            .getSession()
            .then(
                async ({
                    data: {
                        session,
                    },
                }) => {

                    if (!mounted) {
                        return;
                    }

                    try {

                        if (
                            session?.user
                        ) {

                            await loadProfile(
                                session.user
                            );

                        } else {

                            setCurrentUser(
                                null
                            );
                        }

                    } catch (error) {

                        console.error(
                            "Profile loading error:",
                            error
                        );

                        setCloudError(
                            error.message
                        );

                    } finally {

                        if (mounted) {

                            setProfileLoading(
                                false
                            );
                        }
                    }
                }
            );


        // ---------------------------------------------
        // AUTH LISTENER
        // ---------------------------------------------

        const {
            data:
                listener,
        } =
            supabase.auth.onAuthStateChange(
                (
                    _event,
                    session
                ) => {

                    if (!mounted) {
                        return;
                    }

                    if (
                        !session?.user
                    ) {

                        setCurrentUser(
                            null
                        );

                        setOrders([]);

                        setUsers([]);

                        setProfileLoading(
                            false
                        );

                        return;
                    }


                    setTimeout(
                        () => {

                            loadProfile(
                                session.user
                            ).catch(
                                (error) => {

                                    console.error(
                                        "Auth profile error:",
                                        error
                                    );

                                    setCloudError(
                                        error.message
                                    );
                                }
                            );

                        },
                        0
                    );
                }
            );


        return () => {

            mounted = false;

            listener.subscription.unsubscribe();

        };

    }, []);


    // =================================================
    // FETCH ORDERS
    // =================================================

    const fetchOrders = async () => {

        if (
            !supabase ||
            !currentUser
        ) {

            return [];
        }

        setOrdersLoading(true);

        try {

            let query =
                supabase
                    .from("orders")
                    .select(
                        "*, order_items(*), order_status_history(*)"
                    )
                    .order(
                        "created_at",
                        {
                            ascending:
                                false,
                        }
                    );


            if (
                currentUser.role !==
                "admin"
            ) {

                query =
                    query.eq(
                        "user_id",
                        currentUser.id
                    );
            }


            const {
                data,
                error,
            } = await query;


            if (error) {
                throw error;
            }


            const mapped =
                (
                    data ||
                    []
                ).map(
                    mapOrder
                );


            setOrders(mapped);

            return mapped;

        } catch (error) {

            console.error(
                "Fetch orders error:",
                error
            );

            setCloudError(
                error.message
            );

            throw error;

        } finally {

            setOrdersLoading(false);
        }
    };


    // =================================================
    // FETCH USERS
    // =================================================

    const fetchUsers = async () => {

        if (
            !supabase ||
            currentUser?.role !==
            "admin"
        ) {
            return;
        }


        const {
            data,
            error,
        } = await supabase
            .from("profiles")
            .select(
                "id,name,phone,email,city,pincode,role,created_at"
            )
            .order(
                "created_at",
                {
                    ascending:
                        false,
                }
            );


        if (error) {
            throw error;
        }


        setUsers(
            data || []
        );
    };


    // =================================================
    // INITIAL DATA
    // =================================================

    useEffect(() => {

        if (
            !currentUser ||
            !supabase
        ) {

            setOrders([]);

            setUsers([]);

            return;
        }


        setCloudError("");


        Promise.all([
            fetchOrders(),

            currentUser.role ===
            "admin"
                ? fetchUsers()
                : Promise.resolve(),
        ]).catch(
            (error) => {

                console.error(
                    "Initial data load error:",
                    error
                );

                setCloudError(
                    error.message
                );
            }
        );

    }, [
        currentUser?.id,
        currentUser?.role,
    ]);


    // =================================================
    // REALTIME ORDERS
    // =================================================

    useEffect(() => {

        if (
            !supabase ||
            !currentUser
        ) {
            return;
        }


        const channel =
            supabase
                .channel(
                    `goo-orders-${currentUser.id}`
                )


                // -------------------------------------
                // INSERT
                // -------------------------------------

                .on(
                    "postgres_changes",
                    {
                        event:
                            "INSERT",

                        schema:
                            "public",

                        table:
                            "orders",
                    },
                    async (
                        payload
                    ) => {

                        const newOrder =
                            payload.new;


                        if (
                            currentUser.role !==
                            "admin" &&
                            String(
                                newOrder.user_id
                            ) !==
                            String(
                                currentUser.id
                            )
                        ) {
                            return;
                        }


                        try {
                            await fetchOrders();
                        } catch (error) {
                            console.error(
                                "Realtime INSERT error:",
                                error
                            );
                        }
                    }
                )


                // -------------------------------------
                // UPDATE
                // -------------------------------------

                .on(
                    "postgres_changes",
                    {
                        event:
                            "UPDATE",

                        schema:
                            "public",

                        table:
                            "orders",
                    },
                    async (
                        payload
                    ) => {

                        const updated =
                            payload.new;


                        if (
                            currentUser.role !==
                            "admin" &&
                            String(
                                updated.user_id
                            ) !==
                            String(
                                currentUser.id
                            )
                        ) {
                            return;
                        }


                        try {
                            await fetchOrders();
                        } catch (error) {
                            console.error(
                                "Realtime UPDATE error:",
                                error
                            );
                        }
                    }
                )


                // -------------------------------------
                // DELETE
                // -------------------------------------

                .on(
                    "postgres_changes",
                    {
                        event:
                            "DELETE",

                        schema:
                            "public",

                        table:
                            "orders",
                    },
                    (
                        payload
                    ) => {

                        const deletedId =
                            payload.old?.id;


                        if (!deletedId) {
                            return;
                        }


                        setOrders(
                            (
                                previous
                            ) =>
                                previous.filter(
                                    (
                                        order
                                    ) =>
                                        String(
                                            order.id
                                        ) !==
                                        String(
                                            deletedId
                                        )
                                )
                        );
                    }
                )


                .subscribe();


        return () => {

            supabase.removeChannel(
                channel
            );
        };

    }, [
        currentUser?.id,
        currentUser?.role,
    ]);


    // =================================================
    // REGISTER EMAIL
    // =================================================

    const register = async (
        payload
    ) => {

        if (!supabase) {

            throw new Error(
                "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
            );
        }


        const email =
            String(
                payload.email || ""
            )
                .trim()
                .toLowerCase();


        const password =
            payload.password;


        const name =
            String(
                payload.name || ""
            ).trim();


        if (!email) {
            throw new Error(
                "Please enter your email."
            );
        }

        if (!password) {
            throw new Error(
                "Please enter your password."
            );
        }

        if (!name) {
            throw new Error(
                "Please enter your name."
            );
        }


        const {
            data,
            error,
        } =
            await supabase.auth.signUp({
                email,

                password,

                options: {
                    data: {
                        name,

                        phone:
                            payload.phone ||
                            null,
                    },
                },
            });


        if (error) {
            throw error;
        }


        if (
            data.session &&
            data.user
        ) {

            await loadProfile(
                data.user
            );
        }


        return {
            needsEmailConfirmation:
                !data.session,

            user:
                data.user,

            session:
                data.session,
        };
    };


    // =====================================================
    // MSG91 - WAIT FOR WIDGET
    // =====================================================

  const waitForMSG91 = async (timeout = 10000) => {

    if (
        window.MSG91_READY &&
        typeof window.sendOtp === "function"
    ) {
        return true;
    }


    if (window.MSG91_READY_PROMISE) {

        try {

            await Promise.race([
                window.MSG91_READY_PROMISE,

                new Promise(
                    (_, reject) =>
                        setTimeout(
                            () =>
                                reject(
                                    new Error(
                                        "MSG91 widget loading timed out."
                                    )
                                ),
                            timeout
                        )
                )
            ]);

        } catch {
            // Continue to final validation below.
        }
    }


    const start =
        Date.now();


    while (
        Date.now() - start <
        timeout
    ) {

        if (
            typeof window.sendOtp ===
            "function"
        ) {

            window.MSG91_READY =
                true;

            return true;
        }


        await new Promise(
            (resolve) =>
                setTimeout(
                    resolve,
                    200
                )
        );
    }


    return false;
};


    // =====================================================
    // MSG91 - SEND OTP
    // =====================================================

    const sendPhoneOtp = async (phone) => {

    const cleanPhone =
        String(phone || "")
            .replace(/\D/g, "");


    if (
        !/^[6-9][0-9]{9}$/.test(
            cleanPhone
        )
    ) {

        throw new Error(
            "Please enter a valid 10-digit Indian mobile number."
        );
    }


    const ready =
        await waitForMSG91();


    if (!ready) {

        throw new Error(
            "MSG91 OTP widget is not ready. Please refresh the page and try again."
        );
    }


    if (
        typeof window.sendOtp !==
        "function"
    ) {

        throw new Error(
            "MSG91 sendOtp method is unavailable. Make sure exposeMethods is enabled in your MSG91 widget."
        );
    }


    const fullPhone =
        `91${cleanPhone}`;


    console.log(
        "MSG91 sending OTP to:",
        fullPhone
    );


    try {

        const result =
            await window.sendOtp(
                fullPhone
            );


        console.log(
            "MSG91 sendOtp response:",
            result
        );


        return {
            success: true,

            phone:
                `+91${cleanPhone}`,

            data:
                result,
        };

    } catch (
        error
    ) {

        console.error(
            "MSG91 sendOtp error:",
            error
        );


        throw new Error(
            error?.message ||
            "Unable to send OTP through MSG91."
        );
    }
};

    // =====================================================
    // MSG91 - VERIFY OTP
    // =====================================================

 const verifyPhoneOtp = async (phone, otp) => {
    const cleanPhone = String(phone || "").replace(/\D/g, "");
    const cleanOtp = String(otp || "").replace(/\D/g, "");

    if (!/^[6-9][0-9]{9}$/.test(cleanPhone)) {
        throw new Error("Invalid mobile number.");
    }

    if (cleanOtp.length !== 4) {
        throw new Error("Please enter the 4-digit OTP.");
    }

    const ready = await waitForMSG91();

    if (!ready) {
        throw new Error("MSG91 OTP widget is not ready.");
    }

    if (typeof window.verifyOtp !== "function") {
        throw new Error(
            "MSG91 verifyOtp method is unavailable. Make sure exposeMethods is enabled."
        );
    }

    try {
        // 1. Verify OTP with MSG91
        const msg91Result = await window.verifyOtp(cleanOtp);

        console.log("MSG91 OTP verified:", msg91Result);

        const normalizedPhone = `+91${cleanPhone}`;

        // 2. Ask Supabase Edge Function to authenticate this phone
        const { data, error } = await supabase.functions.invoke(
            "phone-login",
            {
                body: {
                    phone: normalizedPhone,
                },
            }
        );

        if (error) {
            console.error("Phone login function error:", error);
            throw error;
        }

        if (!data?.access_token || !data?.refresh_token) {
            throw new Error(
                "Supabase authentication session was not returned."
            );
        }

        // 3. Establish Supabase Auth session
        const { data: sessionData, error: sessionError } =
            await supabase.auth.setSession({
                access_token: data.access_token,
                refresh_token: data.refresh_token,
            });

        if (sessionError) {
            throw sessionError;
        }

        const user = sessionData?.user;

        if (!user) {
            throw new Error(
                "Supabase user was not created."
            );
        }

        console.log(
            "Supabase authenticated user:",
            user.id
        );

        // 4. Load profile
        const {
            data: profile,
            error: profileError,
        } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

        if (profileError) {
            throw profileError;
        }

        if (!profile) {
            throw new Error(
                "Authentication succeeded, but the customer profile was not found."
            );
        }

        setCurrentUser(profile);

        return {
            success: true,
            phone: normalizedPhone,
            profile,
            msg91: msg91Result,
        };

    } catch (error) {
        console.error(
            "MSG91/Supabase verification error:",
            error
        );

        throw new Error(
            error?.message ||
            "Invalid or expired OTP."
        );
    }
};


    // =====================================================
    // MSG91 - RESEND OTP
    // =====================================================

    const resendPhoneOtp = async (
        phone
    ) => {

        const available =
            await waitForMSG91();


        if (!available) {

            throw new Error(
                "MSG91 OTP widget is not ready."
            );
        }


        return new Promise(
            (
                resolve,
                reject
            ) => {

                const success =
                    (data) => {

                        console.log(
                            "MSG91 OTP resent:",
                            data
                        );


                        resolve({
                            success:
                                true,

                            data,
                        });
                    };


                const failure =
                    (error) => {

                        console.error(
                            "MSG91 resend error:",
                            error
                        );


                        reject(
                            new Error(
                                getMSG91ErrorMessage(
                                    error,
                                    "Unable to resend OTP."
                                )
                            )
                        );
                    };


                try {

                    /*
                     * null = default retry
                     * channel configured in
                     * MSG91 widget.
                     */

                    window.retryOtp(
                        null,
                        success,
                        failure
                    );

                } catch (error) {

                    failure(error);
                }
            }
        );
    };


    // =====================================================
    // FIND / CREATE PHONE PROFILE
    // =====================================================

    const findOrCreatePhoneProfile =
        async (
            phone
        ) => {

            if (!supabase) {

                throw new Error(
                    "Supabase is not configured."
                );
            }


            const normalized =
                normalizeIndianPhone(
                    phone
                );


            // -----------------------------------------
            // FIND EXISTING PROFILE
            // -----------------------------------------

            const {
                data:
                    existing,
                error:
                    findError,
            } = await supabase
                .from("profiles")
                .select("*")
                .eq(
                    "phone",
                    normalized
                )
                .maybeSingle();


            if (
                findError
            ) {

                console.error(
                    "Phone profile lookup error:",
                    findError
                );
            }


            if (existing) {

                setCurrentUser(
                    existing
                );

                return existing;
            }


            /*
             * IMPORTANT:
             *
             * MSG91 authentication is separate
             * from Supabase Auth.
             *
             * There is therefore no
             * auth.users.id available here.
             *
             * We do NOT insert a fake UUID into
             * profiles.id.
             *
             * If your profiles.id has a FK to
             * auth.users(id), phone-only login
             * requires a server-side Supabase
             * Auth flow.
             */

            throw new Error(
                "MSG91 OTP was verified, but this project still needs a Supabase Auth user for phone-only login. Your profiles.id appears to depend on auth.users. Keep email login for now, or add a Supabase Edge Function to create a session after MSG91 verification."
            );
        };


    // =====================================================
    // LOGIN WITH PHONE
    // =====================================================

    const loginWithPhone = async (
        phone,
        otp
    ) => {

        if (!otp) {

            return sendPhoneOtp(
                phone
            );
        }


        return verifyPhoneOtp(
            phone,
            otp
        );
    };


    // =====================================================
    // EMAIL LOGIN
    // =====================================================

    const login = async (
        email,
        password
    ) => {

        if (!supabase) {

            throw new Error(
                "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
            );
        }


        const cleanEmail =
            String(
                email || ""
            )
                .trim()
                .toLowerCase();


        if (!cleanEmail) {

            throw new Error(
                "Please enter your email."
            );
        }


        const {
            data,
            error,
        } =
            await supabase.auth.signInWithPassword({
                email:
                    cleanEmail,

                password,
            });


        if (error) {

            const message =
                String(
                    error.message || ""
                ).toLowerCase();


            if (
                message.includes(
                    "email not confirmed"
                ) ||
                message.includes(
                    "email not verified"
                )
            ) {

                throw new Error(
                    "Your email has not been verified yet. Please check your email and click the verification link."
                );
            }


            throw new Error(
                "Invalid email or password. Please check your details and try again."
            );
        }


        if (!data?.user) {

            throw new Error(
                "Unable to sign in. Please try again."
            );
        }


        return loadProfile(
            data.user
        );
    };


    // =====================================================
    // RESEND EMAIL
    // =====================================================

    const resendVerificationEmail =
        async (
            email
        ) => {

            if (!supabase) {

                throw new Error(
                    "Supabase is not configured."
                );
            }


            const cleanEmail =
                String(
                    email || ""
                )
                    .trim()
                    .toLowerCase();


            if (!cleanEmail) {

                throw new Error(
                    "Please enter your email address."
                );
            }


            const redirectUrl =
                `${window.location.origin}/login`;


            const {
                error,
            } =
                await supabase.auth.resend({
                    type:
                        "signup",

                    email:
                        cleanEmail,

                    options: {
                        emailRedirectTo:
                            redirectUrl,
                    },
                });


            if (error) {
                throw error;
            }


            return true;
        };


    // =====================================================
    // LOGOUT
    // =====================================================

    const logout = async () => {

        if (supabase) {

            const {
                error,
            } =
                await supabase.auth.signOut();


            if (error) {
                throw error;
            }
        }


        setCurrentUser(null);

        setOrders([]);

        setUsers([]);

        setCloudError("");
    };


    // =====================================================
    // CART
    // =====================================================

    const addToCart = (
        productId,
        qty = 1
    ) => {

        setCart(
            (
                previous
            ) => {

                const found =
                    previous.find(
                        (
                            item
                        ) =>
                            item.productId ===
                            productId
                    );


                if (found) {

                    return previous.map(
                        (
                            item
                        ) =>
                            item.productId ===
                            productId
                                ? {
                                    ...item,

                                    qty:
                                        item.qty +
                                        qty,
                                }
                                : item
                    );
                }


                return [
                    ...previous,

                    {
                        productId,

                        qty,
                    },
                ];
            }
        );
    };


    const updateCart = (
        productId,
        qty
    ) => {

        setCart(
            (
                previous
            ) =>
                qty <= 0
                    ? previous.filter(
                        (
                            item
                        ) =>
                            item.productId !==
                            productId
                    )
                    : previous.map(
                        (
                            item
                        ) =>
                            item.productId ===
                            productId
                                ? {
                                    ...item,

                                    qty,
                                }
                                : item
                    )
        );
    };


    const clearCart = () => {

        setCart([]);
    };


    // =====================================================
    // CART ITEMS
    // =====================================================

    const cartItems =
        useMemo(
            () => {

                return cart
                    .map(
                        (
                            item
                        ) => {

                            const product =
                                products.find(
                                    (
                                        p
                                    ) =>
                                        p.id ===
                                        item.productId
                                );


                            if (!product) {
                                return null;
                            }


                            return {
                                ...product,

                                qty:
                                    item.qty,

                                lineTotal:
                                    product.price *
                                    item.qty,
                            };
                        }
                    )
                    .filter(Boolean);

            },
            [cart]
        );


    // =====================================================
    // CART TOTAL
    // =====================================================

    const cartTotal =
        cartItems.reduce(
            (
                sum,
                item
            ) =>
                sum +
                item.lineTotal,
            0
        );


    // =====================================================
    // DELIVERY FEE
    // =====================================================

    const deliveryFee = 0;


    // =====================================================
    // CREATE ORDER
    // =====================================================

    const createOrder = async (
        customer
    ) => {

        if (
            !supabase ||
            !currentUser
        ) {

            throw new Error(
                "Please sign in before ordering."
            );
        }


        if (!cartItems.length) {

            throw new Error(
                "Your cart is empty."
            );
        }


        const payload =
            cartItems.map(
                (
                    item
                ) => ({
                    product_id:
                        item.id,

                    qty:
                        item.qty,
                })
            );


        const {
            data,
            error,
        } =
            await supabase.rpc(
                "create_order",
                {
                    p_items:
                        payload,

                    p_customer: {
                        name:
                            customer.name,

                        phone:
                            customer.phone,

                        email:
                            customer.email,

                        address:
                            customer.address,

                        city:
                            customer.city,

                        pincode:
                            customer.pincode,
                    },

                    p_slot:
                        customer.slot,

                    p_frequency:
                        customer.frequency,

                    p_instructions:
                        customer.instructions ||
                        "",

                    p_payment_method:
                        customer.paymentMethod ||
                        "cod",
                }
            );


        if (error) {
            throw error;
        }


        clearCart();


        const result =
            typeof data ===
            "string"
                ? {
                    id:
                        data,
                }
                : data;


        const loaded =
            await fetchOrders();


        const created =
            loaded.find(
                (
                    order
                ) =>
                    String(
                        order.id
                    ) ===
                    String(
                        result.id
                    )
            );


        return (
            created || {
                id:
                    result.id,

                order_number:
                    result.order_number,
            }
        );
    };


    // =====================================================
    // UPDATE ORDER STATUS
    // =====================================================

    const updateOrderStatus =
        async (
            orderId,
            status
        ) => {

            if (
                !supabase ||
                currentUser?.role !==
                "admin"
            ) {

                throw new Error(
                    "Admin access required."
                );
            }


            const {
                error,
            } =
                await supabase.rpc(
                    "update_order_status",
                    {
                        p_order_id:
                            orderId,

                        p_status:
                            status,
                    }
                );


            if (error) {
                throw error;
            }


            await fetchOrders();
        };


    // =====================================================
    // DELETE ORDER
    // =====================================================

    const deleteOrder =
        async (
            orderId
        ) => {

            if (
                !supabase ||
                currentUser?.role !==
                "admin"
            ) {

                throw new Error(
                    "Admin access required."
                );
            }


            if (!orderId) {

                throw new Error(
                    "Order ID is required."
                );
            }


            const {
                error,
            } =
                await supabase.rpc(
                    "delete_order",
                    {
                        p_order_id:
                            orderId,
                    }
                );


            if (error) {
                throw error;
            }


            setOrders(
                (
                    previous
                ) =>
                    previous.filter(
                        (
                            order
                        ) =>
                            String(
                                order.id
                            ) !==
                            String(
                                orderId
                            )
                    )
            );
        };


    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    const updateProfile =
        async (
            patch
        ) => {

            if (
                !supabase ||
                !currentUser
            ) {
                return;
            }


            const allowed = {};


            if (
                patch.name !==
                undefined
            ) {
                allowed.name =
                    String(
                        patch.name
                    ).trim();
            }


            if (
                patch.phone !==
                undefined
            ) {
                allowed.phone =
                    patch.phone
                        ? normalizeIndianPhone(
                            patch.phone
                        )
                        : null;
            }


            if (
                patch.address !==
                undefined
            ) {
                allowed.address =
                    patch.address;
            }


            if (
                patch.city !==
                undefined
            ) {
                allowed.city =
                    patch.city;
            }


            if (
                patch.pincode !==
                undefined
            ) {
                allowed.pincode =
                    patch.pincode;
            }


            const {
                data,
                error,
            } =
                await supabase
                    .from("profiles")
                    .update(
                        allowed
                    )
                    .eq(
                        "id",
                        currentUser.id
                    )
                    .select("*")
                    .single();


            if (error) {
                throw error;
            }


            setCurrentUser(
                data
            );


            return data;
        };


    // =====================================================
    // CLEAR CLOUD ERROR
    // =====================================================

    const clearCloudError = () => {

        setCloudError("");
    };


    // =====================================================
    // CONTEXT
    // =====================================================

    const value = {

        // DATA
        users,

        orders,

        currentUser,

        cart,

        cartItems,

        cartTotal,

        deliveryFee,

        theme,

        profileLoading,

        ordersLoading,

        cloudError,

        supabaseConfigured,


        // SETTINGS
        setTheme,

        clearCloudError,


        // AUTH
        register,

        login,

        sendPhoneOtp,

        verifyPhoneOtp,

        resendPhoneOtp,

        loginWithPhone,

        resendVerificationEmail,

        logout,


        // CART
        addToCart,

        updateCart,

        clearCart,


        // ORDERS
        createOrder,

        updateOrderStatus,

        deleteOrder,

        refreshOrders:
            fetchOrders,


        // USERS
        refreshUsers:
            fetchUsers,


        // PROFILE
        updateProfile,
    };


    return (
        <AppContext.Provider
            value={value}
        >
            {children}
        </AppContext.Provider>
    );
}


// =====================================================
// MSG91 ERROR HELPER
// =====================================================

function getMSG91ErrorMessage(
    error,
    fallback
) {

    if (!error) {
        return fallback;
    }


    if (
        typeof error ===
        "string"
    ) {
        return error;
    }


    if (
        error.message
    ) {
        return error.message;
    }


    if (
        error.error
    ) {
        return typeof error.error ===
            "string"
            ? error.error
            : JSON.stringify(
                error.error
            );
    }


    if (
        error.type
    ) {
        return error.type;
    }


    try {

        return JSON.stringify(
            error
        );

    } catch {

        return fallback;
    }
}


// =====================================================
// USE APP
// =====================================================

export const useApp = () =>
    useContext(
        AppContext
    );