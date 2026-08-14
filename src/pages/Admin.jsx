import React, { useEffect, useMemo, useState } from "react";
import {
  FaUsers,
  FaShoppingBag,
  FaRupeeSign,
  FaCreditCard,
  FaTruck,
  FaSearch,
  FaDownload,
  FaSyncAlt,
  FaCalendarDay,
  FaClock,
  FaCheckCircle,
  FaPause,
  FaPlay,
  FaTimes,
  FaEye,
  FaFilter,
  FaChartLine,
  FaBoxOpen,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaBars,
  FaChevronRight,
  FaArrowUp,
  FaUserShield,
} from "react-icons/fa";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";

const ORDER_STATUSES = [
  "Order Placed",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const statusMeta = {
  "Order Placed": { className: "status-neutral", dot: "dot-neutral" },
  Confirmed: { className: "status-blue", dot: "dot-blue" },
  Preparing: { className: "status-orange", dot: "dot-orange" },
  "Out for Delivery": { className: "status-cyan", dot: "dot-cyan" },
  Delivered: { className: "status-green", dot: "dot-green" },
  Cancelled: { className: "status-red", dot: "dot-red" },
};

const subscriptionMeta = {
  Active: "status-green",
  Paused: "status-orange",
  Cancelled: "status-red",
  Completed: "status-blue",
};

const money = (value) => Number(value || 0).toLocaleString("en-IN");

const dateOnly = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const dateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const customerName = (order) =>
  order?.customer?.name || order?.customer_name || "Customer";

const customerPhone = (order) =>
  order?.customer?.phone || order?.customer_phone || "No phone";

const customerEmail = (order) =>
  order?.customer?.email || order?.customer_email || "No email";

const orderTotal = (order) =>
  Number(order?.total ?? order?.total_amount ?? 0);

function StatusBadge({ status }) {
  const meta = statusMeta[status] || statusMeta["Order Placed"];
  return (
    <span className={`admin-status ${meta.className}`}>
      <span className={`status-dot ${meta.dot}`} />
      {status || "Unknown"}
    </span>
  );
}

function StatCard({ label, value, sub, icon, tone = "green", onClick }) {
  return (
    <button
      type="button"
      className={`admin-stat stat-${tone}`}
      onClick={onClick}
      disabled={!onClick}
    >
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </button>
  );
}

export default function Admin() {
  const {
    currentUser,
    users,
    orders,
    updateOrderStatus,
    refreshOrders,
  } = useApp();

  const [tab, setTab] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  // Keeps a successfully deleted order out of the UI immediately, even if the
  // AppContext refresh returns stale data for a moment.
  const [deletedOrderIds, setDeletedOrderIds] = useState(() => new Set());
  const [paymentQuery, setPaymentQuery] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");

  const safeOrders = useMemo(
    () => (Array.isArray(orders) ? orders : []).filter((order) => !deletedOrderIds.has(order.id)),
    [orders, deletedOrderIds]
  );
  const safeUsers = Array.isArray(users) ? users : [];

  const today = new Date().toISOString().split("T")[0];

  const todaysOrders = useMemo(
    () =>
      safeOrders.filter((o) => {
        const value = o.createdAt || o.created_at;
        return value && new Date(value).toISOString().split("T")[0] === today;
      }),
    [safeOrders, today]
  );

  const isRevenueOrder = (order) =>
    String(order?.status || "").trim().toLowerCase() !== "cancelled";

  const todaysRevenue = useMemo(
    () =>
      todaysOrders
        .filter(isRevenueOrder)
        .reduce((sum, o) => sum + orderTotal(o), 0),
    [todaysOrders]
  );

  const totalRevenue = useMemo(
    () =>
      safeOrders
        .filter(isRevenueOrder)
        .reduce((sum, o) => sum + orderTotal(o), 0),
    [safeOrders]
  );

  const activeDeliveries = useMemo(
    () =>
      safeOrders.filter(
        (o) => o.status !== "Delivered" && o.status !== "Cancelled"
      ).length,
    [safeOrders]
  );

  const deliveredOrders = useMemo(
    () => safeOrders.filter((o) => o.status === "Delivered").length,
    [safeOrders]
  );

  const cancelledOrders = useMemo(
    () => safeOrders.filter((o) => o.status === "Cancelled").length,
    [safeOrders]
  );

  const pendingOrders = useMemo(
    () =>
      safeOrders.filter(
        (o) =>
          o.status !== "Delivered" &&
          o.status !== "Out for Delivery" &&
          o.status !== "Cancelled"
      ).length,
    [safeOrders]
  );

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();

    return safeOrders.filter((order) => {
      const text = [
        order.id,
        order.order_number,
        customerName(order),
        customerPhone(order),
        customerEmail(order),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!q || text.includes(q)) &&
        (statusFilter === "All" || order.status === statusFilter)
      );
    });
  }, [safeOrders, query, statusFilter]);

  const paymentRecords = useMemo(() => {
    const q = paymentQuery.trim().toLowerCase();
    return safeOrders.filter((order) => {
      const text = [
        order.id,
        order.order_number,
        customerName(order),
        customerPhone(order),
        customerEmail(order),
        order.payment_method,
        order.payment_status,
        order.razorpay_order_id,
        order.razorpay_payment_id,
      ].filter(Boolean).join(" ").toLowerCase();

      return (
        (!q || text.includes(q)) &&
        (paymentStatusFilter === "All" || String(order.payment_status || "Pending") === paymentStatusFilter)
      );
    });
  }, [safeOrders, paymentQuery, paymentStatusFilter]);

  const paymentSummary = useMemo(() => {
    const paid = safeOrders.filter((o) => String(o.payment_status || "Pending").toLowerCase() === "paid");
    const pending = safeOrders.filter((o) => String(o.payment_status || "Pending").toLowerCase() === "pending");
    const failed = safeOrders.filter((o) => ["failed", "failure"].includes(String(o.payment_status || "").toLowerCase()));
    return {
      paidCount: paid.length,
      pendingCount: pending.length,
      failedCount: failed.length,
      paidAmount: paid.reduce((sum, o) => sum + orderTotal(o), 0),
    };
  }, [safeOrders]);

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((s) => s.status === "Active").length,
    [subscriptions]
  );

  const pausedSubscriptions = useMemo(
    () => subscriptions.filter((s) => s.status === "Paused").length,
    [subscriptions]
  );

  const cancelledSubscriptions = useMemo(
    () => subscriptions.filter((s) => s.status === "Cancelled").length,
    [subscriptions]
  );

  const loadSubscriptions = async () => {
    try {
      setLoadingSubscriptions(true);
      setErr("");

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error(error);
      setErr(error?.message || "Unable to load subscriptions.");
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === "admin") loadSubscriptions();
  }, [currentUser?.role]);

  const showSuccess = (message, duration = 3000) => {
    setSuccess(message);
    window.setTimeout(() => setSuccess(""), duration);
  };

  const changeStatus = async (id, status) => {
    try {
      setErr("");
      await updateOrderStatus(id, status);
      setSelectedOrder((previous) =>
        previous?.id === id ? { ...previous, status } : previous
      );
      showSuccess(`Order status updated to "${status}".`);
    } catch (error) {
      console.error(error);
      setErr(error?.message || "Unable to update order status.");
    }
  };

  const deleteOrder = async (id) => {
    const order = safeOrders.find((item) => item.id === id);
    if (!order) return;

    const orderLabel = order.order_number || order.id;

    if (!window.confirm(`Delete order ${orderLabel}? This action cannot be undone.`)) {
      return;
    }

    try {
      setErr("");
      setLoading(true);

      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Update this component immediately. This fixes the case where the
      // database delete succeeds but the AppContext still contains the old
      // orders array, so the row used to remain visible until a full reload.
      setDeletedOrderIds((previous) => {
        const next = new Set(previous);
        next.add(id);
        return next;
      });

      if (selectedOrder?.id === id) {
        setSelectedOrder(null);
      }

      // Refresh the shared order state as well. The local deleted-id set keeps
      // the UI correct even if this refresh briefly returns stale data.
      if (refreshOrders) {
        try {
          await refreshOrders();
        } catch (refreshError) {
          console.warn("Order deleted, but refreshOrders failed:", refreshError);
        }
      }

      showSuccess(`Order ${orderLabel} deleted successfully.`);
    } catch (error) {
      console.error("Delete order error:", error);
      setErr(error?.message || "Unable to delete order. Check the Supabase DELETE policy.");
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionStatus = async (id, status) => {
    try {
      setErr("");

      const { error } = await supabase
        .from("subscriptions")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      setSubscriptions((previous) =>
        previous.map((s) => (s.id === id ? { ...s, status } : s))
      );

      showSuccess(`Subscription ${status.toLowerCase()}.`);
    } catch (error) {
      console.error(error);
      setErr(error?.message || "Unable to update subscription.");
    }
  };

  const refreshAll = async () => {
    try {
      setLoading(true);
      setErr("");

      if (refreshOrders) await refreshOrders();
      await loadSubscriptions();

      showSuccess("Dashboard refreshed successfully.", 2500);
    } catch (error) {
      console.error(error);
      setErr(error?.message || "Refresh failed.");
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (rows, filename) => {
    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportOrdersCSV = () => {
    downloadCSV(
      [
        [
          "Order ID",
          "Customer",
          "Phone",
          "Email",
          "Address",
          "Total",
          "Status",
          "Created",
        ],
        ...safeOrders.map((order) => [
          order.order_number || order.id || "",
          customerName(order),
          customerPhone(order),
          customerEmail(order),
          order.address || order.delivery_address || order.customer?.address || "",
          orderTotal(order),
          order.status || "",
          order.createdAt || order.created_at || "",
        ]),
      ],
      "goo-amrutham-orders.csv"
    );
  };

  const exportPaymentsCSV = () => {
    downloadCSV(
      [
        [
          "Order ID",
          "Customer",
          "Phone",
          "Email",
          "Amount",
          "Payment Method",
          "Payment Status",
          "Razorpay Order ID",
          "Razorpay Payment ID",
          "Razorpay Signature",
          "Order Status",
          "Created",
        ],
        ...paymentRecords.map((order) => [
          order.order_number || order.id || "",
          customerName(order),
          customerPhone(order),
          customerEmail(order),
          orderTotal(order),
          order.payment_method || "COD",
          order.payment_status || "Pending",
          order.razorpay_order_id || "",
          order.razorpay_payment_id || "",
          order.razorpay_signature || "",
          order.status || "",
          order.createdAt || order.created_at || "",
        ]),
      ],
      "goo-amrutham-payments.csv"
    );
  };

  const exportSubscriptionsCSV = () => {
    downloadCSV(
      [
        [
          "Subscription ID",
          "User ID",
          "Product",
          "Unit",
          "Quantity",
          "Price",
          "Frequency",
          "Delivery Slot",
          "Address",
          "City",
          "Pincode",
          "Status",
          "Next Delivery",
          "Created",
        ],
        ...subscriptions.map((s) => [
          s.id,
          s.user_id,
          s.product_name,
          s.unit,
          s.quantity,
          s.unit_price,
          s.frequency,
          s.delivery_slot,
          s.delivery_address,
          s.city,
          s.pincode,
          s.status,
          s.next_delivery_date,
          s.created_at,
        ]),
      ],
      "goo-amrutham-subscriptions.csv"
    );
  };

  if (currentUser?.role !== "admin") {
    return (
      <main className="page">
        <div className="container py-5">
          <div className="admin-access-card">
            <div className="admin-access-icon">🔐</div>
            <span className="admin-kicker">SECURE AREA</span>
            <h1>Admin Access Only</h1>
            <p>
              Sign in with an administrator account to access the Goo Amrutham
              management dashboard.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const navItems = [
    { id: "dashboard", label: "Overview", icon: <FaChartLine /> },
    { id: "orders", label: "Orders", icon: <FaShoppingBag />, count: safeOrders.length },
    { id: "payments", label: "Payments", icon: <FaCreditCard />, count: paymentSummary.paidCount },
    { id: "customers", label: "Customers", icon: <FaUsers />, count: safeUsers.length },
    {
      id: "subscriptions",
      label: "Subscriptions",
      icon: <FaBoxOpen />,
      count: activeSubscriptions,
    },
  ];

  return (
    <main className="admin-page">
      <style>{`
        .admin-page {
          --green:#168653;
          --green-dark:#0c613a;
          --green-soft:#eaf7ef;
          --ink:#16231d;
          --muted:#718078;
          --line:#e5ece8;
          --surface:#fff;
          --bg:#f5f8f6;
          min-height:100vh;
          background:
            radial-gradient(circle at 90% 0%, rgba(22,134,83,.10), transparent 28%),
            linear-gradient(180deg,#f8fbf9 0%,#f3f7f5 100%);
          color:var(--ink);
        }
        .admin-shell {
          display:grid;
          grid-template-columns:250px minmax(0,1fr);
          min-height:100vh;
        }
        .admin-sidebar {
          background:#10231a;
          color:#dce9e2;
          padding:24px 16px;
          position:sticky;
          top:0;
          height:100vh;
          display:flex;
          flex-direction:column;
          z-index:20;
        }
        .admin-brand {
          display:flex;
          align-items:center;
          gap:12px;
          padding:6px 10px 28px;
          color:#fff;
          text-decoration:none;
        }
        .brand-mark {
          width:44px;height:44px;border-radius:14px;
          display:grid;place-items:center;
          background:linear-gradient(135deg,#24ad70,#118052);
          box-shadow:0 10px 28px rgba(36,173,112,.25);
          font-size:21px;
        }
        .brand-name{font-weight:800;letter-spacing:.4px}
        .brand-sub{font-size:11px;color:#8ca99a;letter-spacing:1.5px}
        .admin-nav-label{
          font-size:10px;text-transform:uppercase;letter-spacing:1.7px;
          color:#789184;font-weight:800;padding:0 10px 10px;
        }
        .admin-nav{display:grid;gap:6px}
        .admin-nav button{
          width:100%;border:0;background:transparent;color:#a9beb3;
          border-radius:13px;padding:12px 13px;text-align:left;
          display:flex;align-items:center;gap:12px;font-weight:650;
          transition:.18s ease;cursor:pointer;
        }
        .admin-nav button:hover{background:rgba(255,255,255,.06);color:#fff}
        .admin-nav button.active{
          background:linear-gradient(90deg,rgba(35,173,112,.20),rgba(35,173,112,.08));
          color:#fff;box-shadow:inset 3px 0 0 #32bd7b;
        }
        .nav-icon{width:22px;text-align:center}
        .nav-count{
          margin-left:auto;min-width:23px;height:23px;padding:0 7px;
          display:grid;place-items:center;border-radius:99px;
          background:rgba(255,255,255,.08);font-size:11px;
        }
        .admin-sidebar-footer{
          margin-top:auto;padding:15px 10px;border-top:1px solid rgba(255,255,255,.08);
        }
        .admin-user-mini{display:flex;align-items:center;gap:10px}
        .admin-avatar{
          width:38px;height:38px;border-radius:12px;background:#1d6246;
          display:grid;place-items:center;color:#fff;font-weight:800;
        }
        .admin-user-name{font-size:13px;font-weight:750;color:#fff}
        .admin-user-role{font-size:11px;color:#88a394}
        .admin-main{min-width:0;padding:26px 30px 50px}
        .admin-topbar{
          display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:24px;
        }
        .admin-kicker{
          font-size:11px;letter-spacing:1.8px;color:var(--green);font-weight:850;
        }
        .admin-title{font-size:clamp(1.55rem,3vw,2.15rem);font-weight:850;letter-spacing:-.8px;margin:4px 0}
        .admin-subtitle{color:var(--muted);margin:0;font-size:14px}
        .admin-actions{display:flex;align-items:center;gap:9px}
        .admin-action{
          border:1px solid var(--line);background:#fff;color:#405047;
          border-radius:12px;padding:10px 14px;font-weight:700;
          box-shadow:0 5px 18px rgba(25,53,40,.05);
        }
        .admin-action:hover{border-color:#b8d7c5;color:var(--green)}
        .admin-action.primary{background:var(--green);color:#fff;border-color:var(--green)}
        .admin-action.primary:hover{background:var(--green-dark);color:#fff}
        .admin-mobile-menu{display:none}
        .admin-alert{
          border:1px solid transparent;border-radius:14px;padding:12px 15px;margin-bottom:16px;
          display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:14px;
        }
        .admin-alert.error{background:#fff1f1;color:#a82c2c;border-color:#ffd6d6}
        .admin-alert.success{background:#edf9f1;color:#15703f;border-color:#ccebd8}
        .admin-alert button{border:0;background:transparent;font-size:20px;color:inherit}
        .admin-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:16px}
        .admin-stat{
          border:1px solid var(--line);background:#fff;border-radius:18px;padding:19px;
          text-align:left;box-shadow:0 7px 28px rgba(25,53,40,.055);
          min-width:0;cursor:default;
        }
        button.admin-stat{cursor:pointer}
        .admin-stat:disabled{cursor:default}
        .stat-top{display:flex;justify-content:space-between;gap:12px;align-items:center}
        .stat-label{font-size:11px;font-weight:850;letter-spacing:1px;color:#7a8981}
        .stat-icon{
          width:40px;height:40px;border-radius:12px;display:grid;place-items:center;font-size:15px;
        }
        .stat-green .stat-icon{background:#e8f7ee;color:#168653}
        .stat-blue .stat-icon{background:#edf2ff;color:#4b63d3}
        .stat-gold .stat-icon{background:#fff6dc;color:#b27b00}
        .stat-cyan .stat-icon{background:#e8f8fb;color:#07869f}
        .stat-value{font-size:28px;font-weight:850;letter-spacing:-1px;margin-top:14px}
        .stat-sub{font-size:12px;color:#738078;margin-top:3px}
        .admin-content-card{
          background:#fff;border:1px solid var(--line);border-radius:20px;
          box-shadow:0 9px 34px rgba(25,53,40,.055);overflow:hidden;
        }
        .section-head{
          display:flex;align-items:center;justify-content:space-between;gap:14px;
          padding:20px 22px;border-bottom:1px solid var(--line);
        }
        .section-title{font-size:17px;font-weight:850;margin:0}
        .section-desc{font-size:12px;color:var(--muted);margin:4px 0 0}
        .section-body{padding:22px}
        .overview-grid{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(260px,.85fr);gap:18px}
        .inner-panel{border:1px solid var(--line);border-radius:17px;overflow:hidden;background:#fff}
        .inner-panel-head{padding:16px 17px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center}
        .inner-panel-head strong{font-size:14px}
        .mini-link{border:0;background:transparent;color:var(--green);font-weight:750;font-size:12px}
        .table-wrap{overflow:auto}
        .admin-table{width:100%;border-collapse:collapse;min-width:700px}
        .admin-table th{
          background:#f8faf9;color:#77847d;font-size:10px;text-transform:uppercase;
          letter-spacing:1px;text-align:left;padding:12px 15px;border-bottom:1px solid var(--line);
          white-space:nowrap;
        }
        .admin-table td{padding:14px 15px;border-bottom:1px solid #edf2ef;font-size:13px;vertical-align:middle}
        .admin-table tr:last-child td{border-bottom:0}
        .admin-table tbody tr:hover{background:#fbfdfc}
        .order-number{font-weight:800}
        .muted-line{display:block;color:#8a968f;font-size:11px;margin-top:3px}
        .customer-cell{display:flex;align-items:center;gap:10px;min-width:180px}
        .customer-avatar{
          width:34px;height:34px;border-radius:10px;display:grid;place-items:center;
          background:#eaf7ef;color:var(--green);font-weight:850;flex:none;
        }
        .admin-status{
          display:inline-flex;align-items:center;gap:7px;border-radius:99px;
          padding:7px 10px;font-size:11px;font-weight:800;white-space:nowrap;
        }
        .status-dot{width:7px;height:7px;border-radius:50%}
        .status-green{background:#e9f8ef;color:#167544}.dot-green{background:#25a866}
        .status-red{background:#fff0f0;color:#b52f35}.dot-red{background:#e04b52}
        .status-orange{background:#fff5df;color:#9b6800}.dot-orange{background:#e5a523}
        .status-blue{background:#eef2ff;color:#4c5fc0}.dot-blue{background:#6175e8}
        .status-cyan{background:#e9f8fb;color:#087f94}.dot-cyan{background:#17a2ba}
        .status-neutral{background:#f0f3f2;color:#65736b}.dot-neutral{background:#89968f}
        .delivery-panel{
          border-radius:17px;padding:22px;color:#fff;
          background:linear-gradient(145deg,#0e6740,#1b9b61);
          min-height:100%;
        }
        .delivery-panel h3{font-size:20px;font-weight:850;margin:16px 0 6px}
        .delivery-panel p{font-size:12px;line-height:1.6;opacity:.75}
        .delivery-row{display:flex;justify-content:space-between;padding:13px 0;border-bottom:1px solid rgba(255,255,255,.16);font-size:13px}
        .delivery-row:last-child{border-bottom:0}
        .subscription-mini-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:18px}
        .mini-stat{border-radius:15px;padding:16px}
        .mini-stat small{display:block;color:#718078;font-size:11px}
        .mini-stat strong{display:block;font-size:24px;margin-top:5px}
        .mini-green{background:#eaf8ef;color:#147344}.mini-orange{background:#fff6e1;color:#976a08}.mini-red{background:#fff0f0;color:#b32e34}
        .toolbar{padding:18px 20px;border-bottom:1px solid var(--line);display:flex;gap:10px;flex-wrap:wrap}
        .search-box{flex:1 1 320px;position:relative}
        .search-box svg{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#93a098}
        .admin-input,.admin-select{
          width:100%;border:1px solid var(--line);background:#fbfcfb;border-radius:12px;
          min-height:42px;padding:9px 12px 9px 38px;outline:none;font-size:13px;
        }
        .admin-select{padding-left:12px;min-width:190px}
        .admin-input:focus,.admin-select:focus{border-color:#91c8a9;box-shadow:0 0 0 3px rgba(22,134,83,.08);background:#fff}
        .toolbar-actions{display:flex;gap:8px}
        .empty-state{text-align:center;padding:60px 20px;color:#7c8982}
        .empty-icon{width:60px;height:60px;border-radius:18px;background:#f0f5f2;display:grid;place-items:center;margin:0 auto 14px;font-size:25px}
        .mobile-list{display:none}
        .customer-list{display:grid;grid-template-columns:repeat(3,1fr);gap:13px}
        .customer-card{border:1px solid var(--line);border-radius:16px;padding:17px;background:#fff;width:540px}
        .customer-head{display:flex;align-items:center;gap:11px}
        .customer-card .customer-avatar{width:43px;height:43px;border-radius:13px}
        .customer-card h4{font-size:14px;margin:0;font-weight:800}
        .customer-info{display:grid;gap:7px;margin-top:15px;color:#69776f;font-size:12px}
        .customer-info span{display:flex;gap:8px;align-items:flex-start}
        .customer-footer{display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--line);margin-top:15px;padding-top:12px;font-size:11px;color:#88948e}
        .role-badge{border-radius:99px;padding:5px 8px;background:#f0f2f1;color:#47554e;font-weight:800}
        .role-admin{background:#16231d;color:#fff}
        .sub-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:18px 20px;border-bottom:1px solid var(--line)}
        .sub-stat{padding:14px;border-radius:14px}
        .sub-stat span{font-size:11px;color:#6e7d75}
        .sub-stat strong{display:block;font-size:22px;margin-top:4px}
        .sub-green{background:#eaf8ef}.sub-orange{background:#fff6df}.sub-red{background:#fff0f0}
        .subscription-cards{display:none}
        .payment-summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:13px;padding:18px 20px;border-bottom:1px solid var(--line)}
        .payment-summary-card{border-radius:15px;padding:16px;border:1px solid var(--line)}
        .payment-summary-card span{display:block;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;color:#718078}
        .payment-summary-card strong{display:block;font-size:24px;margin-top:5px}
        .payment-summary-card small{display:block;color:#7a8981;margin-top:3px}
        .payment-summary-card.paid{background:#eaf8ef}.payment-summary-card.paid strong{color:#167544}
        .payment-summary-card.pending{background:#fff6df}.payment-summary-card.pending strong{color:#9b6800}
        .payment-summary-card.failed{background:#fff0f0}.payment-summary-card.failed strong{color:#b52f35}
        .payment-id-cell{display:block;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:monospace;font-size:11px;color:#66746d}
        .payment-details-box{background:#f7faf8}
        .payment-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
        .payment-detail-grid>div{background:#fff;border:1px solid #e7eeea;border-radius:12px;padding:12px}
        .payment-detail-grid span{display:block;font-size:10px;color:#839087;text-transform:uppercase;letter-spacing:.8px;font-weight:800}
        .payment-detail-grid strong{display:block;margin-top:6px;font-size:12px;word-break:break-all}
        .payment-mobile-id{margin-top:13px;padding:10px 12px;background:#f7faf8;border-radius:12px;border:1px solid #edf2ef}
        .payment-mobile-id small,.payment-mobile-id span{display:block}
        .payment-mobile-id small{color:#839087;font-size:10px;text-transform:uppercase;font-weight:800;letter-spacing:.6px}
        .payment-mobile-id span{font-size:11px;margin-top:4px;word-break:break-all;font-family:monospace}
        .modal-backdrop-custom{
          position:fixed;inset:0;background:rgba(8,25,17,.62);backdrop-filter:blur(7px);
          z-index:1000;display:grid;place-items:center;padding:18px;
        }
        .order-modal{
          width:min(900px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:24px;
          box-shadow:0 30px 80px rgba(0,0,0,.25);
        }
        .modal-top{padding:20px 22px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
        .modal-close{border:0;background:#f2f5f3;width:36px;height:36px;border-radius:11px}
        .modal-body-custom{padding:22px}
        .modal-status{padding:14px 16px;border-radius:16px;margin-bottom:15px}
        .detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .detail-box{background:#f7faf8;border:1px solid #edf2ef;border-radius:15px;padding:15px}
        .detail-box.full{grid-column:1/-1}
        .detail-label{font-size:10px;color:#839087;letter-spacing:1px;font-weight:850;text-transform:uppercase}
        .detail-value{font-size:13px;font-weight:700;margin-top:7px;line-height:1.5}
        .item-list{border:1px solid var(--line);border-radius:15px;padding:15px;margin-top:12px}
        .item-row{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #edf2ef;font-size:13px}
        .item-row:last-child{border-bottom:0}
        .modal-footer-custom{padding:17px 22px;border-top:1px solid var(--line);display:flex;justify-content:flex-end;gap:9px}
        .admin-access-card{max-width:470px;margin:70px auto;background:#fff;border:1px solid var(--line);border-radius:24px;padding:45px 30px;text-align:center;box-shadow:0 20px 55px rgba(25,53,40,.08)}
        .admin-access-icon{font-size:52px;margin-bottom:14px}
        .admin-access-card h1{font-size:27px;font-weight:850;margin:8px 0}
        .admin-access-card p{color:var(--muted);line-height:1.6;margin:0}
        @media (max-width:1100px){
          .admin-shell{grid-template-columns:82px minmax(0,1fr)}
          .admin-sidebar{padding:20px 11px}
          .brand-copy,.admin-nav-label,.admin-nav button span:not(.nav-icon),.admin-user-copy{display:none}
          .admin-brand{justify-content:center;padding-left:0;padding-right:0}
          .admin-nav button{justify-content:center;padding:13px}
          .nav-count{display:none}
          .admin-sidebar-footer{padding-left:0;padding-right:0}
          .admin-user-mini{justify-content:center}
          .admin-stats{grid-template-columns:repeat(2,1fr)}
          .customer-list{grid-template-columns:repeat(2,1fr)}
        }
        @media (max-width:800px){
          .admin-main{padding:18px 14px 40px}
          .admin-topbar{align-items:flex-start}
          .admin-mobile-menu{display:grid}
          .admin-sidebar{display:none}
          .admin-shell{display:block}
          .admin-stats{gap:10px}
          .admin-stat{padding:15px}
          .stat-value{font-size:24px}
          .overview-grid{grid-template-columns:1fr}
          .customer-list{grid-template-columns:1fr}
          .desktop-orders{display:none}
          .mobile-list{display:grid;gap:10px;padding:13px}
          .order-mobile-card{border:1px solid var(--line);border-radius:16px;padding:15px}
          .sub-grid{grid-template-columns:repeat(3,1fr)}
          .subscription-table{display:none}
          .subscription-cards{display:grid;gap:10px;padding:13px}
        }
        @media (max-width:560px){
          .admin-title{font-size:22px}
          .admin-subtitle{font-size:12px}
          .admin-actions .refresh-text{display:none}
          .admin-actions button{width:40px;padding:10px}
          .admin-stats{grid-template-columns:1fr 1fr}
          .stat-label{font-size:9px}
          .stat-icon{width:34px;height:34px}
          .stat-value{font-size:22px;margin-top:10px}
          .section-head,.section-body{padding:16px}
          .subscription-mini-grid{grid-template-columns:1fr}
          .payment-summary-grid{grid-template-columns:1fr}
          .payment-detail-grid{grid-template-columns:1fr}
          .sub-grid{padding:12px;gap:7px}
          .sub-stat{padding:11px}
          .sub-stat strong{font-size:19px}
          .detail-grid{grid-template-columns:1fr}
          .detail-box.full{grid-column:auto}
          .modal-footer-custom{flex-direction:column}
          .modal-footer-custom .admin-select,.modal-footer-custom .admin-action{width:100%}
        }
      `}</style>

      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <div className="brand-mark">🥛</div>
            <div className="brand-copy">
              <div className="brand-name">Goo Amrutham</div>
              <div className="brand-sub">ADMIN PORTAL</div>
            </div>
          </div>

          <div className="admin-nav-label">Management</div>
          <nav className="admin-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={tab === item.id ? "active" : ""}
                onClick={() => setTab(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className="nav-count">{item.count}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <div className="admin-user-mini">
              <div className="admin-avatar">
                {(currentUser?.name || "A").charAt(0).toUpperCase()}
              </div>
              <div className="admin-user-copy">
                <div className="admin-user-name">{currentUser?.name || "Administrator"}</div>
                <div className="admin-user-role">
                  <FaUserShield className="me-1" /> Admin
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="admin-main">
          <header className="admin-topbar">
            <div>
              <div className="admin-kicker">GOO AMRUTHAM • MANAGEMENT</div>
              <h1 className="admin-title">
                {tab === "dashboard"
                  ? "Good day, Administrator"
                  : navItems.find((x) => x.id === tab)?.label}
              </h1>
              <p className="admin-subtitle">
                {tab === "dashboard"
                  ? "Monitor orders, customers and milk delivery operations."
                  : "Manage your Goo Amrutham operations from one place."}
              </p>
            </div>

            <div className="admin-actions">
              <button
                type="button"
                className="admin-action admin-mobile-menu"
                onClick={() => setMobileNav((v) => !v)}
                title="Menu"
              >
                <FaBars />
              </button>
              <button
                type="button"
                className="admin-action"
                onClick={refreshAll}
                disabled={loading}
                title="Refresh"
              >
                <FaSyncAlt className={loading ? "fa-spin" : ""} />
                <span className="refresh-text ms-2">
                  {loading ? "Refreshing" : "Refresh"}
                </span>
              </button>
            </div>
          </header>

          {mobileNav && (
            <div className="admin-content-card mb-3">
              <div className="section-body" style={{ padding: 8 }}>
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="admin-action w-100 text-start mb-1"
                    style={{
                      borderColor: tab === item.id ? "#b9dec8" : "#e5ece8",
                      background: tab === item.id ? "#eaf7ef" : "#fff",
                      color: tab === item.id ? "#168653" : "#405047",
                    }}
                    onClick={() => {
                      setTab(item.id);
                      setMobileNav(false);
                    }}
                  >
                    <span className="me-2">{item.icon}</span>
                    {item.label}
                    {item.count !== undefined && (
                      <span className="float-end">{item.count}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {err && (
            <div className="admin-alert error">
              <span><strong>Error:</strong> {err}</span>
              <button type="button" onClick={() => setErr("")}>×</button>
            </div>
          )}

          {success && (
            <div className="admin-alert success">
              <span><FaCheckCircle className="me-2" />{success}</span>
              <button type="button" onClick={() => setSuccess("")}>×</button>
            </div>
          )}

          <div className="admin-stats">
            <StatCard
              label="TOTAL ORDERS"
              value={safeOrders.length}
              sub={`${todaysOrders.length} placed today`}
              icon={<FaShoppingBag />}
              tone="green"
              onClick={() => setTab("orders")}
            />
            <StatCard
              label="CUSTOMERS"
              value={safeUsers.length}
              sub="Registered users"
              icon={<FaUsers />}
              tone="blue"
              onClick={() => setTab("customers")}
            />
            <StatCard
              label="TOTAL REVENUE"
              value={`₹${money(totalRevenue)}`}
              sub={`₹${money(todaysRevenue)} today`}
              icon={<FaRupeeSign />}
              tone="gold"
            />
            <StatCard
              label="ACTIVE DELIVERIES"
              value={activeDeliveries}
              sub={`${deliveredOrders} delivered`}
              icon={<FaTruck />}
              tone="cyan"
              onClick={() => setTab("orders")}
            />
          </div>

          <div className="admin-content-card">
            {tab === "dashboard" && (
              <div className="section-body">
                <div className="overview-grid">
                  <div className="inner-panel">
                    <div className="inner-panel-head">
                      <div>
                        <strong>Recent Orders</strong>
                        <div className="section-desc">Latest customer activity</div>
                      </div>
                      <button
                        type="button"
                        className="mini-link"
                        onClick={() => setTab("orders")}
                      >
                        View all <FaChevronRight size={9} />
                      </button>
                    </div>

                    <div className="table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {safeOrders.slice(0, 8).map((order) => (
                            <tr key={order.id}>
                              <td>
                                <span className="order-number">
                                  {order.order_number || order.id}
                                </span>
                                <span className="muted-line">
                                  {dateOnly(order.createdAt || order.created_at)}
                                </span>
                              </td>
                              <td>
                                <div className="customer-cell">
                                  <div className="customer-avatar">
                                    {customerName(order).charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <strong>{customerName(order)}</strong>
                                    <span className="muted-line">{customerPhone(order)}</span>
                                  </div>
                                </div>
                              </td>
                              <td><strong>₹{money(orderTotal(order))}</strong></td>
                              <td><StatusBadge status={order.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {!safeOrders.length && (
                      <div className="empty-state">
                        <div className="empty-icon">📦</div>
                        <strong>No orders yet</strong>
                      </div>
                    )}
                  </div>

                  <div className="delivery-panel">
                    <FaTruck size={25} />
                    <h3>Delivery Overview</h3>
                    <p>Keep track of every order as it moves from confirmation to the customer's doorstep.</p>

                    <div className="delivery-row">
                      <span>Active deliveries</span>
                      <strong>{activeDeliveries}</strong>
                    </div>
                    <div className="delivery-row">
                      <span>Pending orders</span>
                      <strong>{pendingOrders}</strong>
                    </div>
                    <div className="delivery-row">
                      <span>Delivered</span>
                      <strong>{deliveredOrders}</strong>
                    </div>
                    <div className="delivery-row">
                      <span>Cancelled</span>
                      <strong>{cancelledOrders}</strong>
                    </div>
                  </div>
                </div>

                <div className="inner-panel mt-3">
                  <div className="inner-panel-head">
                    <div>
                      <strong>Business Snapshot</strong>
                      <div className="section-desc">Today's key operational numbers</div>
                    </div>
                  </div>
                  <div className="subscription-mini-grid p-3">
                    <div className="mini-stat mini-green">
                      <small><FaCalendarDay className="me-1" /> Today's orders</small>
                      <strong>{todaysOrders.length}</strong>
                    </div>
                    <div className="mini-stat mini-orange">
                      <small><FaClock className="me-1" /> Pending</small>
                      <strong>{pendingOrders}</strong>
                    </div>
                    <div className="mini-stat mini-red">
                      <small><FaTimes className="me-1" /> Cancelled</small>
                      <strong>{cancelledOrders}</strong>
                    </div>
                  </div>
                </div>

                <div className="inner-panel mt-3">
                  <div className="inner-panel-head">
                    <div>
                      <strong>Subscription Overview</strong>
                      <div className="section-desc">Recurring milk delivery health</div>
                    </div>
                    <button
                      type="button"
                      className="mini-link"
                      onClick={() => setTab("subscriptions")}
                    >
                      Manage <FaChevronRight size={9} />
                    </button>
                  </div>
                  <div className="subscription-mini-grid p-3">
                    <div className="mini-stat mini-green">
                      <small>Active subscriptions</small>
                      <strong>{activeSubscriptions}</strong>
                    </div>
                    <div className="mini-stat mini-orange">
                      <small>Paused subscriptions</small>
                      <strong>{pausedSubscriptions}</strong>
                    </div>
                    <div className="mini-stat mini-red">
                      <small>Cancelled subscriptions</small>
                      <strong>{cancelledSubscriptions}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "orders" && (
              <>
                <div className="section-head">
                  <div>
                    <h2 className="section-title">Order Management</h2>
                    <p className="section-desc">Search, review and update customer orders.</p>
                  </div>
                  <button type="button" className="admin-action primary" onClick={exportOrdersCSV}>
                    <FaDownload className="me-2" /> Export CSV
                  </button>
                </div>

                <div className="toolbar">
                  <div className="search-box">
                    <FaSearch />
                    <input
                      className="admin-input"
                      placeholder="Search order, customer, phone or email..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <div>
                    <select
                      className="admin-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="All">All statuses</option>
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="desktop-orders table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Update</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <span className="order-number">{order.order_number || order.id}</span>
                            <span className="muted-line">{dateTime(order.createdAt || order.created_at)}</span>
                          </td>
                          <td>
                            <div className="customer-cell">
                              <div className="customer-avatar">
                                {customerName(order).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <strong>{customerName(order)}</strong>
                                <span className="muted-line">{customerPhone(order)}</span>
                                <span className="muted-line">{customerEmail(order)}</span>
                              </div>
                            </div>
                          </td>
                          <td><strong>₹{money(orderTotal(order))}</strong></td>
                          <td><StatusBadge status={order.status} /></td>
                          <td>
                            <select
                              className="admin-select"
                              style={{ minWidth: 165, paddingLeft: 10 }}
                              value={order.status}
                              onChange={(e) => changeStatus(order.id, e.target.value)}
                            >
                              {ORDER_STATUSES.map((status) => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <div className="d-flex gap-1 flex-wrap">
                              <button
                                type="button"
                                className="admin-action"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <FaEye className="me-1" /> View
                              </button>
                              <button
                                type="button"
                                className="admin-action"
                                style={{ color: "#b52f35", borderColor: "#f1caca" }}
                                onClick={() => deleteOrder(order.id)}
                                disabled={loading}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mobile-list">
                  {filteredOrders.map((order) => (
                    <div className="order-mobile-card" key={order.id}>
                      <div className="d-flex justify-content-between gap-3">
                        <div>
                          <small className="muted-line">ORDER</small>
                          <strong>{order.order_number || order.id}</strong>
                          <span className="muted-line">{dateTime(order.createdAt || order.created_at)}</span>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>

                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <div>
                          <strong>{customerName(order)}</strong>
                          <span className="muted-line">{customerPhone(order)}</span>
                        </div>
                        <strong className="text-success">₹{money(orderTotal(order))}</strong>
                      </div>

                      <select
                        className="admin-select mt-3"
                        style={{ paddingLeft: 10 }}
                        value={order.status}
                        onChange={(e) => changeStatus(order.id, e.target.value)}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>

                      <button
                        type="button"
                        className="admin-action w-100 mt-2"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <FaEye className="me-2" /> View order details
                      </button>

                      <button
                        type="button"
                        className="admin-action w-100 mt-2"
                        style={{ color: "#b52f35", borderColor: "#f1caca" }}
                        onClick={() => deleteOrder(order.id)}
                        disabled={loading}
                      >
                        Delete Order
                      </button>
                    </div>
                  ))}
                </div>

                {!filteredOrders.length && (
                  <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h3 className="fw-bold">No orders found</h3>
                    <p>Try changing your search or status filter.</p>
                  </div>
                )}
              </>
            )}

            {tab === "payments" && (
              <>
                <div className="section-head">
                  <div>
                    <h2 className="section-title">Payment History</h2>
                    <p className="section-desc">View payment status, methods and Razorpay transaction details from the orders table.</p>
                  </div>
                  <button type="button" className="admin-action primary" onClick={exportPaymentsCSV}>
                    <FaDownload className="me-2" /> Export CSV
                  </button>
                </div>

                <div className="payment-summary-grid">
                  <div className="payment-summary-card paid">
                    <span>Paid Amount</span>
                    <strong>₹{money(paymentSummary.paidAmount)}</strong>
                    <small>{paymentSummary.paidCount} paid transactions</small>
                  </div>
                  <div className="payment-summary-card pending">
                    <span>Pending</span>
                    <strong>{paymentSummary.pendingCount}</strong>
                    <small>Awaiting payment</small>
                  </div>
                  <div className="payment-summary-card failed">
                    <span>Failed</span>
                    <strong>{paymentSummary.failedCount}</strong>
                    <small>Failed payment records</small>
                  </div>
                </div>

                <div className="toolbar">
                  <div className="search-box">
                    <FaSearch />
                    <input
                      className="admin-input"
                      placeholder="Search order, customer, payment ID or method..."
                      value={paymentQuery}
                      onChange={(e) => setPaymentQuery(e.target.value)}
                    />
                  </div>
                  <select
                    className="admin-select"
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  >
                    <option value="All">All payment statuses</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                <div className="desktop-orders table-wrap">
                  <table className="admin-table payment-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Payment Status</th>
                        <th>Razorpay Payment ID</th>
                        <th>Date</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentRecords.map((order) => {
                        const paymentStatus = order.payment_status || "Pending";
                        const normalized = String(paymentStatus).toLowerCase();
                        const statusClass = normalized === "paid" ? "status-green" : normalized === "pending" ? "status-orange" : "status-red";
                        const dotClass = normalized === "paid" ? "dot-green" : normalized === "pending" ? "dot-orange" : "dot-red";
                        return (
                          <tr key={order.id}>
                            <td>
                              <span className="order-number">{order.order_number || order.id}</span>
                              <span className="muted-line">{order.status || "Order Placed"}</span>
                            </td>
                            <td>
                              <div className="customer-cell">
                                <div className="customer-avatar">{customerName(order).charAt(0).toUpperCase()}</div>
                                <div>
                                  <strong>{customerName(order)}</strong>
                                  <span className="muted-line">{customerPhone(order)}</span>
                                </div>
                              </div>
                            </td>
                            <td><strong>₹{money(orderTotal(order))}</strong></td>
                            <td>{order.payment_method || "COD"}</td>
                            <td>
                              <span className={`admin-status ${statusClass}`}>
                                <span className={`status-dot ${dotClass}`} />
                                {paymentStatus}
                              </span>
                            </td>
                            <td>
                              <span className="payment-id-cell">{order.razorpay_payment_id || "—"}</span>
                            </td>
                            <td>{dateTime(order.createdAt || order.created_at)}</td>
                            <td>
                              <button type="button" className="admin-action" onClick={() => setSelectedOrder(order)}>
                                <FaEye className="me-1" /> View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mobile-list">
                  {paymentRecords.map((order) => {
                    const paymentStatus = order.payment_status || "Pending";
                    const normalized = String(paymentStatus).toLowerCase();
                    const statusClass = normalized === "paid" ? "status-green" : normalized === "pending" ? "status-orange" : "status-red";
                    const dotClass = normalized === "paid" ? "dot-green" : normalized === "pending" ? "dot-orange" : "dot-red";
                    return (
                      <div className="order-mobile-card" key={order.id}>
                        <div className="d-flex justify-content-between gap-2">
                          <div>
                            <small className="muted-line">PAYMENT</small>
                            <strong>{order.order_number || order.id}</strong>
                            <span className="muted-line">{dateTime(order.createdAt || order.created_at)}</span>
                          </div>
                          <span className={`admin-status ${statusClass}`}>
                            <span className={`status-dot ${dotClass}`} />{paymentStatus}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div><strong>{customerName(order)}</strong><span className="muted-line">{order.payment_method || "COD"}</span></div>
                          <strong className="text-success">₹{money(orderTotal(order))}</strong>
                        </div>
                        <div className="payment-mobile-id">
                          <small>Razorpay Payment ID</small>
                          <span>{order.razorpay_payment_id || "Not available"}</span>
                        </div>
                        <button type="button" className="admin-action w-100 mt-2" onClick={() => setSelectedOrder(order)}>
                          <FaEye className="me-2" /> View payment details
                        </button>
                      </div>
                    );
                  })}
                </div>

                {!paymentRecords.length && (
                  <div className="empty-state">
                    <div className="empty-icon">💳</div>
                    <h3 className="fw-bold">No payment records found</h3>
                    <p>Try changing your search or payment status filter.</p>
                  </div>
                )}
              </>
            )}

            {tab === "customers" && (
              <>
                <div className="section-head">
                  <div>
                    <h2 className="section-title">Customer Management</h2>
                    <p className="section-desc">View registered customers and account information.</p>
                  </div>
                  <span className="admin-status status-green">
                    <span className="status-dot dot-green" />
                    {safeUsers.length} customers
                  </span>
                </div>

                <div className="section-body">
                  <div className="customer-list d-flex flex-wrap">
                    {safeUsers.map((user) => (
                      <div className="customer-card m-auto" key={user.id}>
                        <div className="customer-head">
                          <div className="customer-avatar">
                            {(user.name || "C").charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-grow-1 min-w-0">
                            <h4>{user.name || "Customer"}</h4>
                            <span className="muted-line text-truncate">ID: {user.id}</span>
                          </div>
                          <span className={`role-badge ${user.role === "admin" ? "role-admin" : ""}`}>
                            {user.role || "customer"}
                          </span>
                        </div>

                        <div className="customer-info">
                          <span><FaPhone className="text-success" /> {user.phone || "No phone"}</span>
                          <span><FaEnvelope className="text-success" /> {user.email || "No email"}</span>
                          <span><FaMapMarkerAlt className="text-success" /> {user.city || "No city"}</span>
                        </div>

                        <div className="customer-footer">
                          <span>Joined {dateOnly(user.created_at)}</span>
                          <span>{user.pincode || ""}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {!safeUsers.length && (
                    <div className="empty-state">
                      <div className="empty-icon">👥</div>
                      <strong>No customers registered yet.</strong>
                    </div>
                  )}
                </div>
              </>
            )}

            {tab === "subscriptions" && (
              <>
                <div className="section-head">
                  <div>
                    <h2 className="section-title">Milk Subscriptions</h2>
                    <p className="section-desc">Manage recurring milk delivery subscriptions.</p>
                  </div>
                  <button type="button" className="admin-action primary" onClick={exportSubscriptionsCSV}>
                    <FaDownload className="me-2" /> Export CSV
                  </button>
                </div>

                <div className="sub-grid">
                  <div className="sub-stat sub-green">
                    <span>Active</span>
                    <strong>{activeSubscriptions}</strong>
                  </div>
                  <div className="sub-stat sub-orange">
                    <span>Paused</span>
                    <strong>{pausedSubscriptions}</strong>
                  </div>
                  <div className="sub-stat sub-red">
                    <span>Cancelled</span>
                    <strong>{cancelledSubscriptions}</strong>
                  </div>
                </div>

                {loadingSubscriptions ? (
                  <div className="empty-state">
                    <div className="spinner-border text-success" />
                    <p className="mt-3">Loading subscriptions...</p>
                  </div>
                ) : (
                  <>
                    <div className="subscription-table table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Customer</th>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Frequency</th>
                            <th>Delivery</th>
                            <th>Next Delivery</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subscriptions.map((s) => {
                            const customer =
                              safeUsers.find(
                                (u) => String(u.id) === String(s.user_id)
                              ) || {};

                            return (
                              <tr key={s.id}>
                                <td>
                                  <strong>
                                    {customer.name || customer.email || "Customer"}
                                  </strong>
                                  <span className="muted-line">{customer.phone || "No phone"}</span>
                                </td>
                                <td>
                                  <strong>{s.product_name || "Milk Product"}</strong>
                                  <span className="muted-line">{s.unit || "—"}</span>
                                </td>
                                <td>{s.quantity ?? 0}</td>
                                <td>₹{Number(s.unit_price ?? 0).toFixed(2)}</td>
                                <td>{s.frequency || "—"}</td>
                                <td>{s.delivery_slot || "—"}</td>
                                <td>
                                  {s.next_delivery_date
                                    ? dateOnly(`${s.next_delivery_date}T00:00:00`)
                                    : "Not scheduled"}
                                </td>
                                <td>
                                  <span className={`admin-status ${subscriptionMeta[s.status] || "status-neutral"}`}>
                                    <span className="status-dot dot-green" />
                                    {s.status || "Unknown"}
                                  </span>
                                </td>
                                <td>
                                  <div className="d-flex gap-1">
                                    {s.status === "Active" && (
                                      <button
                                        type="button"
                                        className="admin-action"
                                        onClick={() => updateSubscriptionStatus(s.id, "Paused")}
                                        title="Pause"
                                      >
                                        <FaPause />
                                      </button>
                                    )}
                                    {s.status === "Paused" && (
                                      <button
                                        type="button"
                                        className="admin-action primary"
                                        onClick={() => updateSubscriptionStatus(s.id, "Active")}
                                        title="Resume"
                                      >
                                        <FaPlay />
                                      </button>
                                    )}
                                    {s.status !== "Cancelled" && (
                                      <button
                                        type="button"
                                        className="admin-action"
                                        style={{ color: "#b52f35" }}
                                        onClick={() => updateSubscriptionStatus(s.id, "Cancelled")}
                                        title="Cancel"
                                      >
                                        <FaTimes />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="subscription-cards">
                      {subscriptions.map((s) => {
                        const customer =
                          safeUsers.find(
                            (u) => String(u.id) === String(s.user_id)
                          ) || {};

                        return (
                          <div className="order-mobile-card" key={s.id}>
                            <div className="d-flex justify-content-between gap-2">
                              <div>
                                <strong>{customer.name || customer.email || "Customer"}</strong>
                                <span className="muted-line">{customer.phone || "No phone"}</span>
                              </div>
                              <span className={`admin-status ${subscriptionMeta[s.status] || "status-neutral"}`}>
                                <span className="status-dot dot-green" />
                                {s.status || "Unknown"}
                              </span>
                            </div>

                            <div className="row g-3 mt-1">
                              <div className="col-6">
                                <small className="muted-line">Product</small>
                                <strong>{s.product_name || "Milk Product"}</strong>
                              </div>
                              <div className="col-6">
                                <small className="muted-line">Quantity</small>
                                <strong>{s.quantity ?? 0} {s.unit || ""}</strong>
                              </div>
                              <div className="col-6">
                                <small className="muted-line">Price</small>
                                <strong className="text-success">₹{Number(s.unit_price ?? 0).toFixed(2)}</strong>
                              </div>
                              <div className="col-6">
                                <small className="muted-line">Frequency</small>
                                <strong>{s.frequency || "—"}</strong>
                              </div>
                              <div className="col-12">
                                <small className="muted-line">Delivery</small>
                                <strong>{s.delivery_slot || "—"}</strong>
                              </div>
                              <div className="col-12">
                                <small className="muted-line">Address</small>
                                <div>{s.delivery_address || "Address not available"}</div>
                                <small className="text-muted">{s.city || "—"} - {s.pincode || "—"}</small>
                              </div>
                              <div className="col-12">
                                <small className="muted-line">Next delivery</small>
                                <strong>
                                  {s.next_delivery_date
                                    ? dateOnly(`${s.next_delivery_date}T00:00:00`)
                                    : "Not scheduled"}
                                </strong>
                              </div>
                            </div>

                            <div className="d-flex gap-2 mt-3">
                              {s.status === "Active" && (
                                <button
                                  type="button"
                                  className="admin-action"
                                  onClick={() => updateSubscriptionStatus(s.id, "Paused")}
                                >
                                  <FaPause className="me-2" /> Pause
                                </button>
                              )}
                              {s.status === "Paused" && (
                                <button
                                  type="button"
                                  className="admin-action primary"
                                  onClick={() => updateSubscriptionStatus(s.id, "Active")}
                                >
                                  <FaPlay className="me-2" /> Resume
                                </button>
                              )}
                              {s.status !== "Cancelled" && (
                                <button
                                  type="button"
                                  className="admin-action"
                                  style={{ color: "#b52f35" }}
                                  onClick={() => updateSubscriptionStatus(s.id, "Cancelled")}
                                >
                                  <FaTimes className="me-2" /> Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {!subscriptions.length && (
                      <div className="empty-state">
                        <div className="empty-icon">🥛</div>
                        <h3>No subscriptions</h3>
                        <p>No customers have created milk subscriptions yet.</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      {selectedOrder && (
        <div
          className="modal-backdrop-custom"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="order-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-top">
              <div>
                <div className="admin-kicker">ORDER DETAILS</div>
                <h2 className="fw-bold mb-1 mt-1">
                  {selectedOrder.order_number || selectedOrder.id}
                </h2>
                <small className="text-muted">
                  {dateTime(selectedOrder.createdAt || selectedOrder.created_at)}
                </small>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedOrder(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body-custom">
              <div className={`modal-status ${statusMeta[selectedOrder.status]?.className || "status-neutral"}`}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="fw-bold">CURRENT STATUS</small>
                    <div className="fs-5 fw-bold mt-1">{selectedOrder.status}</div>
                  </div>
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-box">
                  <div className="detail-label">Customer</div>
                  <div className="detail-value">
                    {customerName(selectedOrder)}
                    <div className="text-muted fw-normal mt-1">
                      <FaPhone className="me-1 text-success" /> {customerPhone(selectedOrder)}
                    </div>
                    <div className="text-muted fw-normal mt-1">
                      <FaEnvelope className="me-1 text-success" /> {customerEmail(selectedOrder)}
                    </div>
                  </div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Payment</div>
                  <div className="detail-value">
                    <strong>{selectedOrder.payment_method || "COD"}</strong>
                    <div className="text-muted fw-normal mt-1">
                      Status: {selectedOrder.payment_status || "Pending"}
                    </div>
                    <div className="text-muted fw-normal mt-1">
                      Amount: ₹{money(selectedOrder.total_amount ?? selectedOrder.total)}
                    </div>
                  </div>
                </div>

                <div className="detail-box full payment-details-box">
                  <div className="detail-label">Payment Transaction Details</div>
                  <div className="payment-detail-grid">
                    <div><span>Razorpay Order ID</span><strong>{selectedOrder.razorpay_order_id || "Not available"}</strong></div>
                    <div><span>Razorpay Payment ID</span><strong>{selectedOrder.razorpay_payment_id || "Not available"}</strong></div>
                    <div className="signature-field"><span>Razorpay Signature</span><strong>{selectedOrder.razorpay_signature || "Not available"}</strong></div>
                    <div><span>Payment Status</span><strong>{selectedOrder.payment_status || "Pending"}</strong></div>
                  </div>
                </div>

                <div className="detail-box full">
                  <div className="detail-label">Delivery Address</div>
                  <div className="detail-value">
                    <FaMapMarkerAlt className="text-success me-1" />
                    {selectedOrder.address ||
                      selectedOrder.delivery_address ||
                      selectedOrder.customer?.address ||
                      "Address not available"}
                  </div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Delivery Slot</div>
                  <div className="detail-value">{selectedOrder.slot || "—"}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Frequency</div>
                  <div className="detail-value">{selectedOrder.frequency || "One Time"}</div>
                </div>

                <div className="detail-box full">
                  <div className="detail-label">Order Items</div>
                  <div className="item-list">
                    {(selectedOrder.items || []).map((item) => (
                      <div
                        className="item-row"
                        key={item.id || item.productId}
                      >
                        <span>
                          {item.name || item.unit} × {item.qty}
                        </span>
                        <strong>₹{money(item.lineTotal)}</strong>
                      </div>
                    ))}

                    <div className="item-row">
                      <span>Delivery</span>
                      <strong>
                        {selectedOrder.deliveryFee
                          ? `₹${money(selectedOrder.deliveryFee)}`
                          : "FREE"}
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between pt-3">
                      <strong>Order Total</strong>
                      <strong className="text-success fs-5">
                        ₹{money(orderTotal(selectedOrder))}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer-custom">
              <button
                type="button"
                className="admin-action"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="admin-action"
                style={{ color: "#b52f35", borderColor: "#f1caca" }}
                onClick={() => deleteOrder(selectedOrder.id)}
                disabled={loading}
              >
                Delete Order
              </button>

              <select
                className="admin-select"
                style={{ width: 220, paddingLeft: 12 }}
                value={selectedOrder.status}
                onChange={(e) => changeStatus(selectedOrder.id, e.target.value)}
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
