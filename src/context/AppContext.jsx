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

const read = (key, fallback) => {
    try {
        return (
            JSON.parse(
                localStorage.getItem(key)
            ) ?? fallback
        );
    } catch {
        return fallback;
    }
};

// =====================================================
// MAP ORDER
// =====================================================

const mapOrder = (o) => ({
    ...o,

    userId: o.user_id,

    createdAt: o.created_at,

    updatedAt: o.updated_at,

    deliveryFee: Number(
        o.delivery_fee || 0
    ),

    subtotal: Number(
        o.subtotal || 0
    ),

    total: Number(
        o.total || 0
    ),

    slot: o.slot,

    frequency: o.frequency,

    customer: {
        name: o.customer_name,

        phone: o.customer_phone,

        email: o.customer_email,

        address: o.address,

        city: o.city,

        pincode: o.pincode,

        instructions: o.instructions,
    },

    items: (
        o.order_items || []
    ).map((i) => ({
        id: i.product_id,

        productId: i.product_id,

        name: i.name,

        unit: i.unit,

        price: Number(
            i.unit_price
        ),

        qty: i.qty,

        lineTotal: Number(
            i.line_total
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

export function AppProvider({
    children,
}) {

    // =================================================
    // STATE
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

    const [
        orders,
        setOrders,
    ] = useState([]);

    const [
        users,
        setUsers,
    ] = useState([]);

    const [
        cart,
        setCart,
    ] = useState(() =>
        read(CART_KEY, [])
    );

    const [
        theme,
        setTheme,
    ] = useState(
        () =>
            localStorage.getItem(
                THEME_KEY
            ) || "light"
    );

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
            .single();

        if (error) {
            throw error;
        }

        const profile = {
            ...data,

            email:
                data.email ||
                authUser.email,
        };

        setCurrentUser(profile);

        return profile;
    };


    // =================================================
    // AUTH SESSION
    // =================================================

    useEffect(() => {

        if (!supabase) {

            setProfileLoading(false);

            return;
        }

        let mounted = true;

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

                        }

                    } catch (e) {

                        setCloudError(
                            e.message
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


        const {
            data: listener,
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

                        return;
                    }

                    setTimeout(
                        () => {

                            loadProfile(
                                session.user
                            ).catch(
                                (e) =>
                                    setCloudError(
                                        e.message
                                    )
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

    const fetchOrders =
        async () => {

            if (
                !supabase ||
                !currentUser
            ) {

                return [];

            }

            const base =
                "*, order_items(*), order_status_history(*)";

            let query =
                supabase
                    .from("orders")
                    .select(base)
                    .order(
                        "created_at",
                        {
                            ascending: false,
                        }
                    );


            // Customer sees only own orders
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
        };


    // =================================================
    // FETCH USERS
    // =================================================

    const fetchUsers =
        async () => {

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
                        ascending: false,
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
    // INITIAL DATA LOAD
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


        Promise.all([
            fetchOrders(),

            currentUser.role ===
            "admin"
                ? fetchUsers()
                : Promise.resolve(),
        ]).catch(
            (e) =>
                setCloudError(
                    e.message
                )
        );

    }, [
        currentUser?.id,
        currentUser?.role,
    ]);


    // =================================================
    // REALTIME ORDER UPDATES
    // =================================================
    //
    // This is the important part.
    //
    // When Admin changes:
    //
    // Confirmed -> Cancelled
    //
    // Supabase sends an UPDATE event to every
    // connected user's browser.
    //
    // The customer's AppContext then refreshes
    // its orders automatically.
    //
    // =================================================

    useEffect(() => {

        if (
            !supabase ||
            !currentUser
        ) {

            return;
        }


        const channelName =
            `goo-orders-${currentUser.id}`;


        const channel =
            supabase
                .channel(channelName)

                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "orders",
                    },
                    async (payload) => {

                        console.log(
                            "Goo Amrutham order realtime update:",
                            payload
                        );


                        // ---------------------------------
                        // UPDATE LOCAL ORDER IMMEDIATELY
                        // ---------------------------------

                        if (
                            payload.eventType ===
                            "UPDATE"
                        ) {

                            const updated =
                                payload.new;


                            // Customer should only receive
                            // their own order changes.
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


                            setOrders(
                                (
                                    previous
                                ) =>
                                    previous.map(
                                        (
                                            order
                                        ) =>
                                            String(
                                                order.id
                                            ) ===
                                            String(
                                                updated.id
                                            )
                                                ? {
                                                    ...order,

                                                    ...mapOrder(
                                                        {
                                                            ...updated,

                                                            order_items:
                                                                order.order_items ||
                                                                [],

                                                            order_status_history:
                                                                order.order_status_history ||
                                                                [],
                                                        }
                                                    ),
                                                }
                                                : order
                                    )
                            );

                        }


                        // ---------------------------------
                        // REFRESH COMPLETE ORDER DATA
                        // ---------------------------------
                        //
                        // This loads order_items and
                        // order_status_history again.
                        //
                        // This is especially important
                        // when status history is updated.
                        //
                        // ---------------------------------

                        try {

                            await fetchOrders();

                        } catch (e) {

                            console.error(
                                "Realtime order refresh error:",
                                e
                            );

                            setCloudError(
                                e.message
                            );

                        }

                    }
                )

                .subscribe(
                    (status) => {

                        console.log(
                            `Orders realtime subscription: ${status}`
                        );

                    }
                );


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

    const register =
        async (payload) => {

            if (!supabase) {

                throw new Error(
                    "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
                );

            }


            const {
                data,
                error,
            } =
                await supabase.auth.signUp(
                    {
                        email:
                            payload.email
                                .trim()
                                .toLowerCase(),

                        password:
                            payload.password,

                        options: {
                            data: {
                                name:
                                    payload.name.trim(),

                                phone:
                                    payload.phone.trim(),
                            },
                        },
                    }
                );


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
            };
        };


    // =================================================
    // LOGIN
    // =================================================

    const login =
        async (
            email,
            password
        ) => {

            if (!supabase) {

                throw new Error(
                    "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
                );

            }


            const {
                data,
                error,
            } =
                await supabase.auth.signInWithPassword(
                    {
                        email:
                            email
                                .trim()
                                .toLowerCase(),

                        password,
                    }
                );


            if (error) {

                throw error;

            }


            if (data.user) {

                return loadProfile(
                    data.user
                );

            }

        };


    // =================================================
    // LOGOUT
    // =================================================

    const logout =
        async () => {

            if (supabase) {

                await supabase.auth.signOut();

            }

            setCurrentUser(
                null
            );

            setOrders([]);

            setUsers([]);

        };


    // =================================================
    // CART
    // =================================================

    const addToCart =
        (
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


    const updateCart =
        (
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


    const clearCart =
        () => {

            setCart([]);

        };


    // =================================================
    // CART ITEMS
    // =================================================

    const cartItems =
        useMemo(
            () => {

                return cart
                    .map(
                        (item) => {

                            const product =
                                products.find(
                                    (p) =>
                                        p.id ===
                                        item.productId
                                );


                            return product
                                ? {
                                    ...product,

                                    qty:
                                        item.qty,

                                    lineTotal:
                                        product.price *
                                        item.qty,
                                }
                                : null;

                        }
                    )
                    .filter(Boolean);

            },
            [cart]
        );


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


    const deliveryFee =
        cartTotal >= 200 ||
        cartTotal === 0
            ? 0
            : 20;


    // =================================================
    // CREATE ORDER
    // =================================================

    const createOrder =
        async (
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


            if (
                !cartItems.length
            ) {

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
                        id: data,
                    }
                    : data;


            const loaded =
                await fetchOrders();


            const created =
                loaded.find(
                    (order) =>
                        order.id ===
                        result.id
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


            // Refresh admin's own orders
            await fetchOrders();

        };

        const deleteOrder = async (orderId) => {
    if (!supabase || currentUser?.role !== "admin") {
        throw new Error("Admin access required.");
    }

    if (!orderId) {
        throw new Error("Order ID is required.");
    }

    const { error } = await supabase.rpc("delete_order", {
        p_order_id: orderId,
    });

    if (error) {
        throw error;
    }

    await fetchOrders();
};


    // =================================================
    // UPDATE PROFILE
    // =================================================

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


            const allowed = {
                name:
                    patch.name?.trim(),

                phone:
                    patch.phone?.trim(),

                address:
                    patch.address,

                city:
                    patch.city,

                pincode:
                    patch.pincode,
            };


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

        };


    // =================================================
    // CONTEXT VALUE
    // =================================================

    const value = {

        users,

        orders,

        currentUser,

        cart,

        cartItems,

        cartTotal,

        deliveryFee,

        theme,

        profileLoading,

        cloudError,

        supabaseConfigured,

        setTheme,

        register,

        login,

        logout,

        addToCart,

        updateCart,

        clearCart,

        createOrder,

        updateOrderStatus,

        deleteOrder,

        updateProfile,

        refreshOrders:
            fetchOrders,

        refreshUsers:
            fetchUsers,

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

export const useApp =
    () =>
        useContext(
            AppContext
        );