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
// ORDER MAPPER
// =====================================================

const mapOrder = (o) => ({
    ...o,

    userId: o.user_id,

    createdAt: o.created_at,

    updatedAt: o.updated_at,

    deliveryFee: Number(o.delivery_fee || 0),

    subtotal: Number(o.subtotal || 0),

    total: Number(o.total || 0),

    totalAmount: Number(
        o.total_amount ||
        o.total ||
        0
    ),

    paymentMethod:
        o.payment_method || "cod",

    paymentStatus:
        o.payment_status || "Pending",

    razorpayOrderId:
        o.razorpay_order_id || null,

    razorpayPaymentId:
        o.razorpay_payment_id || null,

    razorpaySignature:
        o.razorpay_signature || null,

    subscriptionId:
        o.subscription_id || null,

    subscriptionDeliveryDate:
        o.subscription_delivery_date || null,

    slot: o.slot,

    frequency: o.frequency,

    customer: {
        name: o.customer_name,

        phone: o.customer_phone,

        email: o.customer_email,

        address:
            o.address ||
            o.delivery_address ||
            "",

        city: o.city,

        pincode: o.pincode,

        instructions:
            o.instructions || "",
    },

    items: (
        o.order_items || []
    ).map((i) => ({
        id: i.product_id,

        productId: i.product_id,

        name: i.name,

        unit: i.unit,

        price: Number(
            i.unit_price || 0
        ),

        qty: Number(i.qty || 0),

        lineTotal: Number(
            i.line_total || 0
        ),
    })),

    timeline: (
        o.order_status_history || []
    ).map((h) => ({
        status: h.status,

        time: h.created_at,
    })),
});

// =====================================================
// APP PROVIDER
// =====================================================

export function AppProvider({ children }) {

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
    ] = useState(supabaseConfigured);

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
    // SUBSCRIPTIONS
    // =================================================

    const [
        subscriptions,
        setSubscriptions,
    ] = useState([]);

    const [
        subscriptionsLoading,
        setSubscriptionsLoading,
    ] = useState(false);

    // =================================================
    // CART
    // =================================================

    const [
        cart,
        setCart,
    ] = useState(() =>
        read(CART_KEY, [])
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

    const loadProfile = async (authUser) => {

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
            .eq("id", authUser.id)
            .maybeSingle();

        if (error) {
            throw error;
        }

        // =============================================
        // CREATE PROFILE IF MISSING
        // =============================================

        if (!data) {

            const metadata =
                authUser.user_metadata || {};

            const name =
                metadata.name ||
                metadata.full_name ||
                "Goo Amrutham Customer";

            const phone =
                metadata.phone ||
                authUser.phone ||
                null;

            const email =
                authUser.email ||
                null;

            const {
                data: createdProfile,
                error: createError,
            } = await supabase
                .from("profiles")
                .insert({
                    id: authUser.id,

                    name,

                    phone,

                    email,

                    role: "customer",
                })
                .select("*")
                .single();

            if (createError) {

                // Profile may have been created
                // by another request at the same time.

                const {
                    data: existingProfile,
                    error: retryError,
                } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", authUser.id)
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

        // =============================================
        // EXISTING PROFILE
        // =============================================

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

        // =============================================
        // INITIAL SESSION
        // =============================================

        const loadSession = async () => {

            try {

                const {
                    data,
                    error,
                } =
                    await supabase.auth.getSession();

                if (!mounted) {
                    return;
                }

                if (error) {
                    throw error;
                }

                if (data?.session?.user) {

                    await loadProfile(
                        data.session.user
                    );

                } else {

                    setCurrentUser(null);
                }

            } catch (error) {

                console.error(
                    "Session error:",
                    error
                );

                if (mounted) {
                    setCloudError(
                        error.message
                    );
                }

            } finally {

                if (mounted) {
                    setProfileLoading(false);
                }
            }
        };

        loadSession();

        // =============================================
        // AUTH STATE LISTENER
        // =============================================

        const {
            data: listener,
        } =
            supabase.auth.onAuthStateChange(
                (
                    event,
                    session
                ) => {

                    if (!mounted) {
                        return;
                    }

                    if (!session?.user) {

                        setCurrentUser(null);

                        setOrders([]);

                        setUsers([]);

                        setSubscriptions([]);

                        setProfileLoading(false);

                        return;
                    }

                    // Avoid doing Supabase queries
                    // directly inside the auth callback.

                    setTimeout(() => {

                        loadProfile(
                            session.user
                        ).catch((error) => {

                            console.error(
                                "Auth profile error:",
                                error
                            );

                            setCloudError(
                                error.message
                            );

                        });

                    }, 0);
                }
            );

        return () => {

            mounted = false;

            listener?.subscription?.unsubscribe();
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
                            ascending: false,
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
                (data || []).map(
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
            return [];
        }

        const {
            data,
            error,
        } =
            await supabase
                .from("profiles")
                .select(
                    "id,name,phone,email,city,pincode,role,created_at"
                )
                .order(
                    "created_at",
                    {
                        ascending: false,
                    }
                );

        if (error) {
            throw error;
        }

        setUsers(data || []);

        return data || [];
    };

    // =================================================
    // FETCH SUBSCRIPTIONS
    // =================================================

    const fetchSubscriptions = async () => {

        if (
            !supabase ||
            !currentUser
        ) {

            setSubscriptions([]);

            return [];
        }

        setSubscriptionsLoading(true);

        try {

            let query =
                supabase
                    .from("subscriptions")
                    .select("*")
                    .order(
                        "created_at",
                        {
                            ascending: false,
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
            } =
                await query;

            if (error) {
                throw error;
            }

            setSubscriptions(
                data || []
            );

            return data || [];

        } catch (error) {

            console.error(
                "Fetch subscriptions error:",
                error
            );

            setCloudError(
                error.message
            );

            throw error;

        } finally {

            setSubscriptionsLoading(
                false
            );
        }
    };

    // =================================================
    // REALTIME SUBSCRIPTIONS
    // =================================================

    useEffect(() => {

        if (
            !supabase ||
            !currentUser?.id
        ) {
            return;
        }

        fetchSubscriptions().catch(
            (error) => {
                console.error(
                    "Subscription initial load error:",
                    error
                );
            }
        );

        const channel =
            supabase
                .channel(
                    `user-subscriptions-${currentUser.id}`
                )
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "subscriptions",
                        filter:
                            `user_id=eq.${currentUser.id}`,
                    },
                    (payload) => {

                        if (
                            payload.eventType ===
                            "UPDATE"
                        ) {

                            setSubscriptions(
                                (previous) =>
                                    previous.map(
                                        (
                                            subscription
                                        ) =>
                                            String(
                                                subscription.id
                                            ) ===
                                            String(
                                                payload.new.id
                                            )
                                                ? {
                                                    ...subscription,
                                                    ...payload.new,
                                                }
                                                : subscription
                                    )
                            );
                        }

                        if (
                            payload.eventType ===
                            "INSERT"
                        ) {

                            setSubscriptions(
                                (previous) => [
                                    payload.new,
                                    ...previous,
                                ]
                            );
                        }

                        if (
                            payload.eventType ===
                            "DELETE"
                        ) {

                            setSubscriptions(
                                (previous) =>
                                    previous.filter(
                                        (
                                            subscription
                                        ) =>
                                            String(
                                                subscription.id
                                            ) !==
                                            String(
                                                payload.old.id
                                            )
                                    )
                            );
                        }
                    }
                )
                .subscribe();

        return () => {

            supabase.removeChannel(
                channel
            );
        };

    }, [currentUser?.id]);

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

            setSubscriptions([]);

            return;
        }

        setCloudError("");

        Promise.all([
            fetchOrders(),

            fetchSubscriptions(),

            currentUser.role === "admin"
                ? fetchUsers()
                : Promise.resolve(),
        ]).catch((error) => {

            console.error(
                "Initial data load error:",
                error
            );

            setCloudError(
                error.message
            );
        });

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

                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "orders",
                    },
                    async (payload) => {

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
                                "Realtime order insert error:",
                                error
                            );
                        }
                    }
                )

                .on(
                    "postgres_changes",
                    {
                        event: "UPDATE",
                        schema: "public",
                        table: "orders",
                    },
                    async (payload) => {

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
                                "Realtime order update error:",
                                error
                            );
                        }
                    }
                )

                .on(
                    "postgres_changes",
                    {
                        event: "DELETE",
                        schema: "public",
                        table: "orders",
                    },
                    (payload) => {

                        const deletedId =
                            payload.old?.id;

                        if (!deletedId) {
                            return;
                        }

                        setOrders(
                            (previous) =>
                                previous.filter(
                                    (order) =>
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
    // REGISTER
    // =================================================

    const register = async (payload) => {

        if (!supabase) {
            throw new Error(
                "Supabase is not configured."
            );
        }

        const name =
            String(
                payload.name || ""
            ).trim();

        const email =
            String(
                payload.email || ""
            )
                .trim()
                .toLowerCase();

        const password =
            String(
                payload.password || ""
            );

        const phone =
            String(
                payload.phone || ""
            ).trim();

        if (!name) {
            throw new Error(
                "Please enter your name."
            );
        }

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

        if (password.length < 6) {
            throw new Error(
                "Password must be at least 6 characters."
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
                            phone || null,
                    },
                },
            });

        if (error) {
            throw error;
        }

        // Email confirmation enabled
        if (
            data.user &&
            !data.session
        ) {

            return {
                needsEmailConfirmation:
                    true,

                user:
                    data.user,

                session:
                    null,
            };
        }

        // Email confirmation disabled
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
                false,

            user:
                data.user,

            session:
                data.session,
        };
    };

    // =================================================
    // EMAIL LOGIN
    // =================================================

    const login = async (
        email,
        password
    ) => {

        if (!supabase) {
            throw new Error(
                "Supabase is not configured."
            );
        }

        const cleanEmail =
            String(email || "")
                .trim()
                .toLowerCase();

        if (!cleanEmail) {
            throw new Error(
                "Please enter your email."
            );
        }

        if (!password) {
            throw new Error(
                "Please enter your password."
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

    // =================================================
    // RESEND EMAIL VERIFICATION
    // =================================================

    const resendVerificationEmail =
        async (email) => {

            if (!supabase) {
                throw new Error(
                    "Supabase is not configured."
                );
            }

            const cleanEmail =
                String(email || "")
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
                    type: "signup",

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

    // =================================================
    // LOGOUT
    // =================================================

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

        setSubscriptions([]);

        setCloudError("");
    };

    // =================================================
    // CART
    // =================================================

    const addToCart = (
        productId,
        qty = 1
    ) => {

        setCart(
            (previous) => {

                const found =
                    previous.find(
                        (item) =>
                            item.productId ===
                            productId
                    );

                if (found) {

                    return previous.map(
                        (item) =>
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
            (previous) =>
                qty <= 0
                    ? previous.filter(
                        (item) =>
                            item.productId !==
                            productId
                    )
                    : previous.map(
                        (item) =>
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

    // =================================================
    // CART ITEMS
    // =================================================

    const cartItems =
        useMemo(() => {

            return cart
                .map((item) => {

                    const product =
                        products.find(
                            (p) =>
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
                })
                .filter(Boolean);

        }, [cart]);

    // =================================================
    // CART TOTAL
    // =================================================

    const cartTotal =
        cartItems.reduce(
            (sum, item) =>
                sum +
                item.lineTotal,
            0
        );

    // =================================================
    // DELIVERY FEE
    // =================================================

    const deliveryFee = 0;

    // =================================================
    // CREATE ORDER
    // =================================================

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
                (item) => ({
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
            typeof data === "string"
                ? {
                    id: data,
                }
                : data;

        const loaded =
            await fetchOrders();

        const created =
            loaded.find(
                (order) =>
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

    // =================================================
    // UPDATE ORDER STATUS
    // =================================================

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

    // =================================================
    // DELETE ORDER
    // =================================================

    const deleteOrder =
        async (orderId) => {

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
                (previous) =>
                    previous.filter(
                        (order) =>
                            String(
                                order.id
                            ) !==
                            String(
                                orderId
                            )
                    )
            );
        };

    // =================================================
    // UPDATE PROFILE
    // =================================================

    const updateProfile =
        async (patch) => {

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

            // Phone is still allowed as a
            // normal profile/contact field.
            // It is NOT used for authentication.

            if (
                patch.phone !==
                undefined
            ) {
                allowed.phone =
                    patch.phone
                        ? String(
                            patch.phone
                        ).trim()
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
                    .update(allowed)
                    .eq(
                        "id",
                        currentUser.id
                    )
                    .select("*")
                    .single();

            if (error) {
                throw error;
            }

            setCurrentUser(data);

            return data;
        };

    // =================================================
    // CLEAR CLOUD ERROR
    // =================================================

    const clearCloudError = () => {
        setCloudError("");
    };

    // =================================================
    // CONTEXT VALUE
    // =================================================

    const value = {

        // DATA

        users,

        orders,

        subscriptions,

        currentUser,

        cart,

        cartItems,

        cartTotal,

        deliveryFee,

        theme,

        profileLoading,

        ordersLoading,

        subscriptionsLoading,

        cloudError,

        supabaseConfigured,

        // SETTINGS

        setTheme,

        clearCloudError,

        // AUTH

        register,

        login,

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

        // SUBSCRIPTIONS

        refreshSubscriptions:
            fetchSubscriptions,

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
// USE APP
// =====================================================

export const useApp = () =>
    useContext(
        AppContext
    );