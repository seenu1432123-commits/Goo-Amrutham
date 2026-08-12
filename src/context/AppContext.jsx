import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { products } from "../data/products";
import { supabase, supabaseConfigured } from "../lib/supabase";

const AppContext = createContext(null);
const CART_KEY = "goo_cart";
const THEME_KEY = "goo_theme";

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};

const mapOrder = (o) => ({
  ...o,
  userId: o.user_id,
  createdAt: o.created_at,
  updatedAt: o.updated_at,
  deliveryFee: Number(o.delivery_fee || 0),
  subtotal: Number(o.subtotal || 0),
  total: Number(o.total || 0),
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
  items: (o.order_items || []).map((i) => ({
    id: i.product_id,
    productId: i.product_id,
    name: i.name,
    unit: i.unit,
    price: Number(i.unit_price),
    qty: i.qty,
    lineTotal: Number(i.line_total),
  })),
  timeline: (o.order_status_history || []).map((h) => ({ status: h.status, time: h.created_at })),
});

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(supabaseConfigured);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [cart, setCart] = useState(() => read(CART_KEY, []));
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "light");
  const [cloudError, setCloudError] = useState("");

  useEffect(() => localStorage.setItem(CART_KEY, JSON.stringify(cart)), [cart]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const loadProfile = async (authUser) => {
    if (!authUser || !supabase) { setCurrentUser(null); return null; }
    const { data, error } = await supabase.from("profiles").select("*").eq("id", authUser.id).single();
    if (error) throw error;
    const profile = { ...data, email: data.email || authUser.email };
    setCurrentUser(profile);
    return profile;
  };

  useEffect(() => {
    if (!supabase) { setProfileLoading(false); return; }
    let mounted = true;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      try { if (session?.user) await loadProfile(session.user); }
      catch (e) { setCloudError(e.message); }
      finally { if (mounted) setProfileLoading(false); }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session?.user) { setCurrentUser(null); return; }
      setTimeout(() => loadProfile(session.user).catch(e => setCloudError(e.message)), 0);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  const fetchOrders = async () => {
    if (!supabase || !currentUser) return;
    const base = "*, order_items(*), order_status_history(*)";
    let query = supabase.from("orders").select(base).order("created_at", { ascending: false });
    if (currentUser.role !== "admin") query = query.eq("user_id", currentUser.id);
    const { data, error } = await query;
    if (error) throw error;
    const mapped = (data || []).map(mapOrder);
    setOrders(mapped);
    return mapped;
  };

  const fetchUsers = async () => {
    if (!supabase || currentUser?.role !== "admin") return;
    const { data, error } = await supabase.from("profiles").select("id,name,phone,email,city,pincode,role,created_at").order("created_at", { ascending: false });
    if (error) throw error;
    setUsers(data || []);
  };

  useEffect(() => {
    if (!currentUser || !supabase) { setOrders([]); setUsers([]); return; }
    Promise.all([fetchOrders(), currentUser.role === "admin" ? fetchUsers() : Promise.resolve()]).catch(e => setCloudError(e.message));
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => {
    if (!supabase || !currentUser) return;
    const filter = currentUser.role === "admin" ? undefined : `user_id=eq.${currentUser.id}`;
    let channel = supabase.channel(`goo-orders-${currentUser.id}`);
    const config = { event: "*", schema: "public", table: "orders" };
    if (filter) config.filter = filter;
    channel = channel.on("postgres_changes", config, () => {
      fetchOrders().catch(e => setCloudError(e.message));
    });
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUser?.id, currentUser?.role]);

  const register = async (payload) => {
    if (!supabase) throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
    const { data, error } = await supabase.auth.signUp({
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      options: { data: { name: payload.name.trim(), phone: payload.phone.trim() } },
    });
    if (error) throw error;
    if (data.session && data.user) await loadProfile(data.user);
    return { needsEmailConfirmation: !data.session };
  };

  const login = async (email, password) => {
    if (!supabase) throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) throw error;
    if (data.user) return loadProfile(data.user);
  };

  const logout = async () => { if (supabase) await supabase.auth.signOut(); setCurrentUser(null); };

  const addToCart = (productId, qty = 1) => setCart(prev => {
    const found = prev.find(i => i.productId === productId);
    return found ? prev.map(i => i.productId === productId ? { ...i, qty: i.qty + qty } : i) : [...prev, { productId, qty }];
  });
  const updateCart = (productId, qty) => setCart(prev => qty <= 0 ? prev.filter(i => i.productId !== productId) : prev.map(i => i.productId === productId ? { ...i, qty } : i));
  const clearCart = () => setCart([]);

  const cartItems = useMemo(() => cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return product ? { ...product, qty: item.qty, lineTotal: product.price * item.qty } : null;
  }).filter(Boolean), [cart]);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const deliveryFee = cartTotal >= 200 || cartTotal === 0 ? 0 : 20;

  const createOrder = async (customer) => {
    if (!supabase || !currentUser) throw new Error("Please sign in before ordering.");
    if (!cartItems.length) throw new Error("Your cart is empty.");
    const payload = cartItems.map(i => ({ product_id: i.id, qty: i.qty }));
    const { data, error } = await supabase.rpc("create_order", {
      p_items: payload,
      p_customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        city: customer.city,
        pincode: customer.pincode,
      },
      p_slot: customer.slot,
      p_frequency: customer.frequency,
      p_instructions: customer.instructions || "",
    });
    if (error) throw error;
    clearCart();
    const result = typeof data === "string" ? { id: data } : data;
    const loaded = await fetchOrders();
    const created = loaded.find(o => o.id === result.id);
    return created || { id: result.id, order_number: result.order_number };
  };

  const updateOrderStatus = async (orderId, status) => {
    if (!supabase || currentUser?.role !== "admin") throw new Error("Admin access required.");
    const { error } = await supabase.rpc("update_order_status", { p_order_id: orderId, p_status: status });
    if (error) throw error;
    await fetchOrders();
  };

  const updateProfile = async (patch) => {
    if (!supabase || !currentUser) return;
    const allowed = { name: patch.name?.trim(), phone: patch.phone?.trim(), address: patch.address, city: patch.city, pincode: patch.pincode };
    const { data, error } = await supabase.from("profiles").update(allowed).eq("id", currentUser.id).select("*").single();
    if (error) throw error;
    setCurrentUser(data);
  };

  const value = {
    users, orders, currentUser, cart, cartItems, cartTotal, deliveryFee, theme, profileLoading,
    cloudError, supabaseConfigured, setTheme, register, login, logout, addToCart, updateCart,
    clearCart, createOrder, updateOrderStatus, updateProfile, refreshOrders: fetchOrders, refreshUsers: fetchUsers,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
