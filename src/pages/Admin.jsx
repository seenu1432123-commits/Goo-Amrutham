import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaUsers,
  FaShoppingBag,
  FaRupeeSign,
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
} from "react-icons/fa";

import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";

// =====================================================
// ORDER STATUS
// =====================================================

const orderStatuses = [
  "Order Placed",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
];

// =====================================================
// ADMIN COMPONENT
// =====================================================

export default function Admin() {
  // ---------------------------------------------------
  // APP CONTEXT
  // ---------------------------------------------------

  const {
    currentUser,
    users,
    orders,
    updateOrderStatus,
    refreshOrders,
  } = useApp();

  // ---------------------------------------------------
  // STATE
  // ---------------------------------------------------

  const [tab, setTab] = useState("dashboard");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingSubscriptions, setLoadingSubscriptions] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);

  // =====================================================
  // SAFE DATA
  // =====================================================

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeUsers = Array.isArray(users) ? users : [];

  // =====================================================
  // TODAY
  // =====================================================

  const todayString = useMemo(() => {
    const today = new Date();

    return (
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0")
    );
  }, []);

  // =====================================================
  // LOAD SUBSCRIPTIONS
  // =====================================================

  const loadSubscriptions = async () => {
    try {
      setLoadingSubscriptions(true);
      setErr("");

      const {
        data,
        error,
      } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setSubscriptions(data || []);
    } catch (error) {
      console.error(
        "Subscription loading error:",
        error
      );

      setErr(
        error?.message ||
          "Unable to load subscriptions."
      );
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  // =====================================================
  // LOAD SUBSCRIPTIONS WHEN ADMIN OPENS
  // =====================================================

  useEffect(() => {
    if (currentUser?.role === "admin") {
      loadSubscriptions();
    }
  }, [currentUser]);

  // =====================================================
  // TODAY'S ORDERS
  // =====================================================

  const todaysOrders = useMemo(() => {
    return safeOrders.filter((order) => {
      const date =
        order.createdAt ||
        order.created_at;

      if (!date) {
        return false;
      }

      const orderDate =
        new Date(date);

      const formatted =
        orderDate.getFullYear() +
        "-" +
        String(
          orderDate.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
          orderDate.getDate()
        ).padStart(2, "0");

      return formatted === todayString;
    });
  }, [safeOrders, todayString]);

  // =====================================================
  // TODAY'S REVENUE
  // =====================================================

  const todaysRevenue = useMemo(() => {
    return todaysOrders.reduce(
      (total, order) =>
        total +
        Number(
          order.total ??
            order.total_amount ??
            0
        ),
      0
    );
  }, [todaysOrders]);

  // =====================================================
  // TOTAL REVENUE
  // =====================================================

  const totalRevenue = useMemo(() => {
    return safeOrders.reduce(
      (total, order) =>
        total +
        Number(
          order.total ??
            order.total_amount ??
            0
        ),
      0
    );
  }, [safeOrders]);

  // =====================================================
  // ACTIVE DELIVERIES
  // =====================================================

  const activeDeliveries = useMemo(() => {
    return safeOrders.filter(
      (order) =>
        order.status !== "Delivered"
    ).length;
  }, [safeOrders]);

  // =====================================================
  // DELIVERED ORDERS
  // =====================================================

  const deliveredOrders = useMemo(() => {
    return safeOrders.filter(
      (order) =>
        order.status === "Delivered"
    ).length;
  }, [safeOrders]);

  // =====================================================
  // PENDING ORDERS
  // =====================================================

  const pendingOrders = useMemo(() => {
    return safeOrders.filter(
      (order) =>
        order.status !== "Delivered" &&
        order.status !== "Out for Delivery"
    ).length;
  }, [safeOrders]);

  // =====================================================
  // FILTER ORDERS
  // =====================================================

  const filteredOrders = useMemo(() => {
    const search =
      q.trim().toLowerCase();

    return safeOrders.filter(
      (order) => {
        const customer =
          order.customer || {};

        const text = `
          ${order.id || ""}
          ${order.order_number || ""}
          ${customer.name || ""}
          ${customer.phone || ""}
          ${customer.email || ""}
          ${order.customer_name || ""}
          ${order.customer_phone || ""}
          ${order.customer_email || ""}
        `.toLowerCase();

        const matchesSearch =
          !search ||
          text.includes(search);

        const matchesStatus =
          statusFilter === "All" ||
          order.status === statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    safeOrders,
    q,
    statusFilter,
  ]);

  // =====================================================
  // SUBSCRIPTION COUNTS
  // =====================================================

  const activeSubscriptions =
    useMemo(
      () =>
        subscriptions.filter(
          (subscription) =>
            subscription.status ===
            "Active"
        ).length,
      [subscriptions]
    );

  // =====================================================
  // CHANGE ORDER STATUS
  // =====================================================

  const changeStatus = async (
    id,
    status
  ) => {
    try {
      setErr("");
      setSuccess("");

      await updateOrderStatus(
        id,
        status
      );

      setSuccess(
        `Order status updated to "${status}".`
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error(error);

      setErr(
        error?.message ||
          "Unable to update order status."
      );
    }
  };

  // =====================================================
  // UPDATE SUBSCRIPTION STATUS
  // =====================================================

  const updateSubscriptionStatus =
    async (
      id,
      status
    ) => {
      try {
        setErr("");
        setSuccess("");

        const {
          error,
        } = await supabase
          .from("subscriptions")
          .update({
            status,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", id);

        if (error) {
          throw error;
        }

        setSubscriptions(
          (previous) =>
            previous.map(
              (subscription) =>
                subscription.id === id
                  ? {
                      ...subscription,
                      status,
                    }
                  : subscription
            )
        );

        setSuccess(
          `Subscription ${status.toLowerCase()}.`
        );

        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } catch (error) {
        console.error(error);

        setErr(
          error?.message ||
            "Unable to update subscription."
        );
      }
    };

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setErr("");
      setSuccess("");

      if (refreshOrders) {
        await refreshOrders();
      }

      await loadSubscriptions();

      setSuccess(
        "Dashboard refreshed successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (error) {
      console.error(error);

      setErr(
        error?.message ||
          "Refresh failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EXPORT CSV HELPER
  // =====================================================

  const downloadCSV = (
    rows,
    filename
  ) => {
    const csv = rows
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value ?? ""
              ).replaceAll(
                '"',
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =====================================================
  // EXPORT ORDERS
  // =====================================================

  const exportOrdersCSV = () => {
    const rows = [
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

      ...safeOrders.map(
        (order) => {
          const customer =
            order.customer || {};

          return [
            order.order_number ||
              order.id ||
              "",

            customer.name ||
              order.customer_name ||
              "",

            customer.phone ||
              order.customer_phone ||
              "",

            customer.email ||
              order.customer_email ||
              "",

            order.address ||
              order.delivery_address ||
              "",

            order.total ??
              order.total_amount ??
              0,

            order.status || "",

            order.createdAt ||
              order.created_at ||
              "",
          ];
        }
      ),
    ];

    downloadCSV(
      rows,
      "goo-amrutham-orders.csv"
    );
  };

  // =====================================================
  // EXPORT SUBSCRIPTIONS
  // =====================================================

  const exportSubscriptionsCSV =
    () => {
      const rows = [
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

        ...subscriptions.map(
          (subscription) => [
            subscription.id,
            subscription.user_id,
            subscription.product_name,
            subscription.unit,
            subscription.quantity,
            subscription.unit_price,
            subscription.frequency,
            subscription.delivery_slot,
            subscription.delivery_address,
            subscription.city,
            subscription.pincode,
            subscription.status,
            subscription.next_delivery_date,
            subscription.created_at,
          ]
        ),
      ];

      downloadCSV(
        rows,
        "goo-amrutham-subscriptions.csv"
      );
    };

  // =====================================================
  // ADMIN PROTECTION
  // =====================================================

  if (
    currentUser?.role !== "admin"
  ) {
    return (
      <main className="page">
        <div className="container py-5">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body text-center p-5">

              <div
                style={{
                  fontSize: "4rem",
                }}
              >
                🔐
              </div>

              <h1 className="fw-bold mt-3">
                Admin Access Only
              </h1>

              <p className="text-muted mb-0">
                Sign in with an administrator
                account to access the
                Goo Amrutham dashboard.
              </p>

            </div>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="page admin-page">

      <div className="container-fluid px-3 px-lg-4 py-4">

        {/* HEADER */}

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

          <div>
            <div className="text-success fw-bold small">
              GOO AMRUTHAM
            </div>

            <h1 className="fw-bold mb-1">
              Business Dashboard
            </h1>

            <p className="text-muted mb-0">
              Manage customers, orders,
              deliveries and subscriptions.
            </p>
          </div>

          <div className="d-flex gap-2 flex-wrap">

            <button
              type="button"
              className="btn btn-outline-success rounded-pill px-3"
              onClick={handleRefresh}
              disabled={loading}
            >
              <FaSyncAlt
                className={
                  loading
                    ? "me-2 fa-spin"
                    : "me-2"
                }
              />

              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <button
              type="button"
              className="btn btn-success rounded-pill px-3"
              onClick={exportOrdersCSV}
            >
              <FaDownload className="me-2" />
              Export Orders
            </button>

          </div>
        </div>

        {/* ALERTS */}

        {err && (
          <div
            className="alert alert-danger alert-dismissible fade show rounded-4"
            role="alert"
          >
            <strong>
              Something went wrong:
            </strong>{" "}
            {err}

            <button
              type="button"
              className="btn-close"
              onClick={() =>
                setErr("")
              }
            />
          </div>
        )}

        {success && (
          <div
            className="alert alert-success alert-dismissible fade show rounded-4"
            role="alert"
          >
            <FaCheckCircle className="me-2" />
            {success}

            <button
              type="button"
              className="btn-close"
              onClick={() =>
                setSuccess("")
              }
            />
          </div>
        )}

        {/* MAIN STATS */}

        <div className="row g-3 mb-4">

          <div className="col-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">

                <div className="d-flex justify-content-between">

                  <div>
                    <small className="text-muted">
                      Total Orders
                    </small>

                    <h2 className="fw-bold mb-0 mt-2">
                      {safeOrders.length}
                    </h2>
                  </div>

                  <div
                    className="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center"
                    style={{
                      width: 48,
                      height: 48,
                    }}
                  >
                    <FaShoppingBag />
                  </div>

                </div>

                <small className="text-success">
                  {todaysOrders.length} today
                </small>

              </div>
            </div>
          </div>

          <div className="col-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">

                <div className="d-flex justify-content-between">

                  <div>
                    <small className="text-muted">
                      Customers
                    </small>

                    <h2 className="fw-bold mb-0 mt-2">
                      {safeUsers.length}
                    </h2>
                  </div>

                  <div
                    className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                    style={{
                      width: 48,
                      height: 48,
                    }}
                  >
                    <FaUsers />
                  </div>

                </div>

                <small className="text-muted">
                  Registered users
                </small>

              </div>
            </div>
          </div>

          <div className="col-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">

                <div className="d-flex justify-content-between">

                  <div>
                    <small className="text-muted">
                      Total Revenue
                    </small>

                    <h2 className="fw-bold mb-0 mt-2">
                      ₹
                      {totalRevenue.toLocaleString(
                        "en-IN"
                      )}
                    </h2>
                  </div>

                  <div
                    className="rounded-circle bg-warning-subtle text-warning d-flex align-items-center justify-content-center"
                    style={{
                      width: 48,
                      height: 48,
                    }}
                  >
                    <FaRupeeSign />
                  </div>

                </div>

                <small className="text-success">
                  ₹
                  {todaysRevenue.toLocaleString(
                    "en-IN"
                  )}{" "}
                  today
                </small>

              </div>
            </div>
          </div>

          <div className="col-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">

                <div className="d-flex justify-content-between">

                  <div>
                    <small className="text-muted">
                      Active Deliveries
                    </small>

                    <h2 className="fw-bold mb-0 mt-2">
                      {activeDeliveries}
                    </h2>
                  </div>

                  <div
                    className="rounded-circle bg-info-subtle text-info d-flex align-items-center justify-content-center"
                    style={{
                      width: 48,
                      height: 48,
                    }}
                  >
                    <FaTruck />
                  </div>

                </div>

                <small className="text-muted">
                  {deliveredOrders} delivered
                </small>

              </div>
            </div>
          </div>

        </div>

        {/* SECONDARY STATS */}

        <div className="row g-3 mb-4">

          <div className="col-6 col-md-3">
            <div className="card border-0 bg-light rounded-4">
              <div className="card-body">
                <FaCalendarDay className="text-success mb-2" />

                <div className="text-muted small">
                  Today's Orders
                </div>

                <h4 className="fw-bold mb-0">
                  {todaysOrders.length}
                </h4>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="card border-0 bg-light rounded-4">
              <div className="card-body">
                <FaClock className="text-warning mb-2" />

                <div className="text-muted small">
                  Pending Orders
                </div>

                <h4 className="fw-bold mb-0">
                  {pendingOrders}
                </h4>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="card border-0 bg-light rounded-4">
              <div className="card-body">
                <FaCheckCircle className="text-success mb-2" />

                <div className="text-muted small">
                  Delivered
                </div>

                <h4 className="fw-bold mb-0">
                  {deliveredOrders}
                </h4>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="card border-0 bg-light rounded-4">
              <div className="card-body">
                <FaShoppingBag className="text-primary mb-2" />

                <div className="text-muted small">
                  Active Subscriptions
                </div>

                <h4 className="fw-bold mb-0">
                  {activeSubscriptions}
                </h4>
              </div>
            </div>
          </div>

        </div>

        {/* TABS */}

        <div className="card border-0 shadow-sm rounded-4">

          <div className="card-body p-0">

            <div className="d-flex overflow-auto border-bottom">

              <button
                type="button"
                className={`btn rounded-0 px-4 py-3 ${
                  tab === "dashboard"
                    ? "text-success fw-bold border-bottom border-success border-3"
                    : "text-muted"
                }`}
                onClick={() =>
                  setTab("dashboard")
                }
              >
                📊 Dashboard
              </button>

              <button
                type="button"
                className={`btn rounded-0 px-4 py-3 ${
                  tab === "orders"
                    ? "text-success fw-bold border-bottom border-success border-3"
                    : "text-muted"
                }`}
                onClick={() =>
                  setTab("orders")
                }
              >
                📦 Orders
              </button>

              <button
                type="button"
                className={`btn rounded-0 px-4 py-3 ${
                  tab === "customers"
                    ? "text-success fw-bold border-bottom border-success border-3"
                    : "text-muted"
                }`}
                onClick={() =>
                  setTab("customers")
                }
              >
                👥 Customers
              </button>

              <button
                type="button"
                className={`btn rounded-0 px-4 py-3 ${
                  tab === "subscriptions"
                    ? "text-success fw-bold border-bottom border-success border-3"
                    : "text-muted"
                }`}
                onClick={() =>
                  setTab(
                    "subscriptions"
                  )
                }
              >
                🥛 Subscriptions
              </button>

            </div>

            {/* =====================================
                DASHBOARD TAB
            ====================================== */}

            {tab === "dashboard" && (
              <div className="p-4">

                <div className="row g-4">

                  <div className="col-lg-8">

                    <h5 className="fw-bold mb-3">
                      Recent Orders
                    </h5>

                    <div className="table-responsive">

                      <table className="table align-middle">

                        <thead>
                          <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Status</th>
                          </tr>
                        </thead>

                        <tbody>

                          {safeOrders
                            .slice(0, 8)
                            .map(
                              (order) => {
                                const customer =
                                  order.customer ||
                                  {};

                                return (
                                  <tr
                                    key={
                                      order.id
                                    }
                                  >

                                    <td>
                                      <strong>
                                        {order.order_number ||
                                          order.id}
                                      </strong>

                                      <small className="d-block text-muted">
                                        {new Date(
                                          order.createdAt ||
                                            order.created_at
                                        ).toLocaleDateString(
                                          "en-IN"
                                        )}
                                      </small>
                                    </td>

                                    <td>
                                      {customer.name ||
                                        order.customer_name ||
                                        "Customer"}
                                    </td>

                                    <td>
                                      ₹
                                      {Number(
                                        order.total ??
                                          order.total_amount ??
                                          0
                                      ).toLocaleString(
                                        "en-IN"
                                      )}
                                    </td>

                                    <td>
                                      <span
                                        className={`badge rounded-pill ${
                                          order.status ===
                                          "Delivered"
                                            ? "text-bg-success"
                                            : order.status ===
                                              "Out for Delivery"
                                            ? "text-bg-info"
                                            : order.status ===
                                              "Preparing"
                                            ? "text-bg-warning"
                                            : order.status ===
                                              "Confirmed"
                                            ? "text-bg-primary"
                                            : "text-bg-secondary"
                                        }`}
                                      >
                                        {
                                          order.status
                                        }
                                      </span>
                                    </td>

                                  </tr>
                                );
                              }
                            )}

                        </tbody>

                      </table>

                    </div>
                  </div>

                  <div className="col-lg-4">

                    <div className="p-4 rounded-4 bg-success text-white h-100">

                      <div className="mb-4">
                        <FaTruck size={28} />
                      </div>

                      <h4 className="fw-bold">
                        Delivery Overview
                      </h4>

                      <p className="opacity-75">
                        Keep track of today's
                        milk deliveries and
                        pending orders.
                      </p>

                      <div className="d-flex justify-content-between border-bottom border-white border-opacity-25 py-3">
                        <span>Active</span>
                        <strong>
                          {activeDeliveries}
                        </strong>
                      </div>

                      <div className="d-flex justify-content-between border-bottom border-white border-opacity-25 py-3">
                        <span>Delivered</span>
                        <strong>
                          {deliveredOrders}
                        </strong>
                      </div>

                      <div className="d-flex justify-content-between py-3">
                        <span>Pending</span>
                        <strong>
                          {pendingOrders}
                        </strong>
                      </div>

                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* =====================================
                ORDERS TAB
            ====================================== */}

            {tab === "orders" && (
              <div>

                <div className="p-3 border-bottom">

                  <div className="row g-2">

                    <div className="col-md-8">

                      <div className="input-group">

                        <span className="input-group-text bg-white">
                          <FaSearch />
                        </span>

                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search order, customer or phone..."
                          value={q}
                          onChange={(e) =>
                            setQ(
                              e.target.value
                            )
                          }
                        />

                      </div>

                    </div>

                    <div className="col-md-4">

                      <div className="input-group">

                        <span className="input-group-text bg-white">
                          <FaFilter />
                        </span>

                        <select
                          className="form-select"
                          value={
                            statusFilter
                          }
                          onChange={(e) =>
                            setStatusFilter(
                              e.target.value
                            )
                          }
                        >

                          <option value="All">
                            All Statuses
                          </option>

                          {orderStatuses.map(
                            (status) => (
                              <option
                                key={status}
                                value={status}
                              >
                                {status}
                              </option>
                            )
                          )}

                        </select>

                      </div>

                    </div>

                  </div>

                </div>

                <div className="table-responsive">

                  <table className="table table-hover align-middle mb-0">

                    <thead className="table-light">

                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Update</th>
                        <th>View</th>
                      </tr>

                    </thead>

                    <tbody>

                      {filteredOrders.map(
                        (order) => {

                          const customer =
                            order.customer ||
                            {};

                          /*
                           * IMPORTANT:
                           *
                           * Once an order is Delivered,
                           * the status dropdown is disabled.
                           *
                           * This prevents the admin from
                           * accidentally changing a completed
                           * order back to another status.
                           */

                          const isDelivered =
                            order.status ===
                            "Delivered";

                          return (
                            <tr
                              key={
                                order.id
                              }
                            >

                              <td>

                                <strong>
                                  {order.order_number ||
                                    order.id}
                                </strong>

                                <small className="d-block text-muted">
                                  {new Date(
                                    order.createdAt ||
                                      order.created_at
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </small>

                              </td>

                              <td>

                                <strong>
                                  {customer.name ||
                                    order.customer_name ||
                                    "Customer"}
                                </strong>

                                <small className="d-block text-muted">
                                  {customer.phone ||
                                    order.customer_phone ||
                                    "No phone"}
                                </small>

                                <small className="d-block text-muted">
                                  {customer.email ||
                                    order.customer_email ||
                                    ""}
                                </small>

                              </td>

                              <td>

                                <strong>
                                  ₹
                                  {Number(
                                    order.total ??
                                      order.total_amount ??
                                      0
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </strong>

                              </td>

                              <td>

                                <span
                                  className={`badge rounded-pill ${
                                    order.status ===
                                    "Delivered"
                                      ? "text-bg-success"
                                      : order.status ===
                                        "Out for Delivery"
                                      ? "text-bg-info"
                                      : order.status ===
                                        "Preparing"
                                      ? "text-bg-warning"
                                      : order.status ===
                                        "Confirmed"
                                      ? "text-bg-primary"
                                      : "text-bg-secondary"
                                  }`}
                                >
                                  {
                                    order.status
                                  }
                                </span>

                              </td>

                              <td>

                                {isDelivered ? (
                                  <div>
                                    <select
                                      className="form-select form-select-sm"
                                      value="Delivered"
                                      disabled
                                    >
                                      <option value="Delivered">
                                        Delivered
                                      </option>
                                    </select>

                                    <small className="text-success d-block mt-1">
                                      ✓ Completed
                                    </small>
                                  </div>
                                ) : (
                                  <select
                                    className="form-select form-select-sm"
                                    value={
                                      order.status
                                    }
                                    onChange={(e) =>
                                      changeStatus(
                                        order.id,
                                        e.target.value
                                      )
                                    }
                                  >

                                    {orderStatuses
                                      .filter(
                                        (status) => {
                                          /*
                                           * The current status
                                           * remains visible.
                                           *
                                           * Delivered is available
                                           * only when the order is
                                           * not already delivered.
                                           */
                                          return (
                                            status ===
                                              order.status ||
                                            status !==
                                              "Delivered"
                                          );
                                        }
                                      )
                                      .map(
                                        (
                                          status
                                        ) => (
                                          <option
                                            key={
                                              status
                                            }
                                            value={
                                              status
                                            }
                                          >
                                            {
                                              status
                                            }
                                          </option>
                                        )
                                      )}

                                  </select>
                                )}

                              </td>

                              <td>

                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-success rounded-pill"
                                  onClick={() =>
                                    setSelectedOrder(
                                      order
                                    )
                                  }
                                >
                                  <FaEye />
                                </button>

                              </td>

                            </tr>
                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>

                {!filteredOrders.length && (
                  <div className="text-center py-5">

                    <div
                      style={{
                        fontSize: "3rem",
                      }}
                    >
                      📦
                    </div>

                    <h5 className="fw-bold">
                      No orders found
                    </h5>

                    <p className="text-muted">
                      Try changing your
                      search or status
                      filter.
                    </p>

                  </div>
                )}

              </div>
            )}

            {/* =====================================
                CUSTOMERS TAB
            ====================================== */}

            {tab === "customers" && (
              <div>

                <div className="p-4 border-bottom">

                  <h5 className="fw-bold mb-1">
                    Customer Management
                  </h5>

                  <p className="text-muted mb-0">
                    Registered Goo Amrutham
                    customers.
                  </p>

                </div>

                <div className="table-responsive">

                  <table className="table table-hover align-middle mb-0">

                    <thead className="table-light">

                      <tr>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>City</th>
                        <th>Joined</th>
                        <th>Role</th>
                      </tr>

                    </thead>

                    <tbody>

                      {safeUsers.map(
                        (user) => (
                          <tr
                            key={
                              user.id
                            }
                          >

                            <td>
                              <strong>
                                {user.name ||
                                  "Customer"}
                              </strong>
                            </td>

                            <td>
                              {user.phone ||
                                "—"}
                            </td>

                            <td>
                              {user.email ||
                                "—"}
                            </td>

                            <td>
                              {user.city ||
                                "—"}
                            </td>

                            <td>
                              {user.created_at
                                ? new Date(
                                    user.created_at
                                  ).toLocaleDateString(
                                    "en-IN"
                                  )
                                : "—"}
                            </td>

                            <td>
                              <span
                                className={`badge rounded-pill ${
                                  user.role ===
                                  "admin"
                                    ? "text-bg-dark"
                                    : "text-bg-light"
                                }`}
                              >
                                {user.role ||
                                  "customer"}
                              </span>
                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

                {!safeUsers.length && (
                  <div className="text-center p-5 text-muted">
                    No customers registered
                    yet.
                  </div>
                )}

              </div>
            )}

            {/* =====================================
                SUBSCRIPTIONS TAB
            ====================================== */}

            {tab === "subscriptions" && (
              <div>

                <div className="p-4 border-bottom">

                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                    <div>

                      <h5 className="fw-bold mb-1">
                        Milk Subscriptions
                      </h5>

                      <p className="text-muted mb-0">
                        Manage regular milk
                        delivery subscriptions.
                      </p>

                    </div>

                    <button
                      type="button"
                      className="btn btn-success rounded-pill"
                      onClick={
                        exportSubscriptionsCSV
                      }
                    >
                      <FaDownload className="me-2" />
                      Export
                    </button>

                  </div>

                </div>

                {loadingSubscriptions ? (
                  <div className="text-center py-5">

                    <div
                      className="spinner-border text-success"
                      role="status"
                    />

                    <p className="text-muted mt-3">
                      Loading subscriptions...
                    </p>

                  </div>
                ) : (
                  <div className="table-responsive">

                    <table className="table table-hover align-middle mb-0">

                      <thead className="table-light">

                        <tr>
                          <th>Customer</th>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Frequency</th>
                          <th>Delivery</th>
                          <th>Address</th>
                          <th>Next Delivery</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>

                      </thead>

                      <tbody>

                        {subscriptions.map(
                          (
                            subscription
                          ) => {

                            const customer =
                              safeUsers.find(
                                (user) =>
                                  String(
                                    user.id
                                  ) ===
                                  String(
                                    subscription.user_id
                                  )
                              ) || {};

                            return (
                              <tr
                                key={
                                  subscription.id
                                }
                              >

                                {/* CUSTOMER */}

                                <td>

                                  <strong>
                                    {customer.name ||
                                      customer.full_name ||
                                      customer.email ||
                                      "Customer"}
                                  </strong>

                                  <small className="d-block text-muted">
                                    {customer.phone ||
                                      "No phone"}
                                  </small>

                                  <small className="d-block text-muted">
                                    {customer.email ||
                                      "No email"}
                                  </small>

                                </td>

                                {/* PRODUCT */}

                                <td>

                                  <strong>
                                    {subscription.product_name ||
                                      "Milk Product"}
                                  </strong>

                                  <small className="d-block text-muted">
                                    Unit:{" "}
                                    {subscription.unit ||
                                      "—"}
                                  </small>

                                </td>

                                {/* QUANTITY */}

                                <td>
                                  {
                                    subscription.quantity ??
                                    0
                                  }
                                </td>

                                {/* PRICE */}

                                <td>
                                  ₹
                                  {Number(
                                    subscription.unit_price ??
                                      0
                                  ).toFixed(2)}
                                </td>

                                {/* FREQUENCY */}

                                <td>
                                  <span className="fw-semibold">
                                    {subscription.frequency ||
                                      "—"}
                                  </span>
                                </td>

                                {/* DELIVERY */}

                                <td>
                                  <strong>
                                    {subscription.delivery_slot ||
                                      "—"}
                                  </strong>
                                </td>

                                {/* ADDRESS */}

                                <td>

                                  <div>
                                    {subscription.delivery_address ||
                                      "Address not available"}
                                  </div>

                                  <small className="d-block text-muted">
                                    City:{" "}
                                    {subscription.city ||
                                      "—"}
                                  </small>

                                  <small className="d-block text-muted">
                                    Pincode:{" "}
                                    {subscription.pincode ||
                                      "—"}
                                  </small>

                                </td>

                                {/* NEXT DELIVERY */}

                                <td>

                                  {subscription.next_delivery_date
                                    ? new Date(
                                        `${subscription.next_delivery_date}T00:00:00`
                                      ).toLocaleDateString(
                                        "en-IN"
                                      )
                                    : "Not scheduled"}

                                </td>

                                {/* STATUS */}

                                <td>

                                  <span
                                    className={`badge rounded-pill ${
                                      subscription.status ===
                                      "Active"
                                        ? "text-bg-success"
                                        : subscription.status ===
                                          "Paused"
                                        ? "text-bg-warning"
                                        : subscription.status ===
                                          "Cancelled"
                                        ? "text-bg-danger"
                                        : subscription.status ===
                                          "Completed"
                                        ? "text-bg-primary"
                                        : "text-bg-secondary"
                                    }`}
                                  >
                                    {subscription.status ||
                                      "Unknown"}
                                  </span>

                                </td>

                                {/* ACTION */}

                                <td>

                                  {subscription.status ===
                                    "Active" && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-warning rounded-pill me-1"
                                      title="Pause"
                                      onClick={() =>
                                        updateSubscriptionStatus(
                                          subscription.id,
                                          "Paused"
                                        )
                                      }
                                    >
                                      <FaPause />
                                    </button>
                                  )}

                                  {subscription.status ===
                                    "Paused" && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-success rounded-pill me-1"
                                      title="Resume"
                                      onClick={() =>
                                        updateSubscriptionStatus(
                                          subscription.id,
                                          "Active"
                                        )
                                      }
                                    >
                                      <FaPlay />
                                    </button>
                                  )}

                                  {subscription.status !==
                                    "Cancelled" &&
                                    subscription.status !==
                                      "Completed" && (
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger rounded-pill"
                                        title="Cancel"
                                        onClick={() =>
                                          updateSubscriptionStatus(
                                            subscription.id,
                                            "Cancelled"
                                          )
                                        }
                                      >
                                        <FaTimes />
                                      </button>
                                    )}

                                </td>

                              </tr>
                            );
                          }
                        )}

                      </tbody>

                    </table>

                  </div>
                )}

                {!loadingSubscriptions &&
                  !subscriptions.length && (
                    <div className="text-center py-5">

                      <div
                        style={{
                          fontSize: "3rem",
                        }}
                      >
                        🥛
                      </div>

                      <h5 className="fw-bold">
                        No subscriptions
                      </h5>

                      <p className="text-muted">
                        No customers have created
                        milk subscriptions yet.
                      </p>

                    </div>
                  )}

              </div>
            )}

          </div>
        </div>
      </div>

      {/* =================================================
          ORDER DETAILS MODAL
      ================================================= */}

      {selectedOrder && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor:
              "rgba(0,0,0,0.55)",
          }}
          onClick={() =>
            setSelectedOrder(null)
          }
        >

          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-content border-0 rounded-4 shadow">

              <div className="modal-header">

                <div>

                  <h5 className="modal-title fw-bold">
                    Order Details
                  </h5>

                  <small className="text-muted">
                    {selectedOrder.order_number ||
                      selectedOrder.id}
                  </small>

                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setSelectedOrder(
                      null
                    )
                  }
                />

              </div>

              <div className="modal-body">

                <div className="row g-3">

                  {/* CUSTOMER */}

                  <div className="col-md-6">

                    <div className="bg-light rounded-4 p-3">

                      <small className="text-muted">
                        Customer
                      </small>

                      <h6 className="fw-bold mt-1">
                        {selectedOrder
                          .customer
                          ?.name ||
                          selectedOrder.customer_name ||
                          "Customer"}
                      </h6>

                      <div>
                        📞{" "}
                        {selectedOrder
                          .customer
                          ?.phone ||
                          selectedOrder.customer_phone ||
                          "—"}
                      </div>

                      <div>
                        ✉️{" "}
                        {selectedOrder
                          .customer
                          ?.email ||
                          selectedOrder.customer_email ||
                          "—"}
                      </div>

                    </div>

                  </div>

                  {/* STATUS */}

                  <div className="col-md-6">

                    <div className="bg-light rounded-4 p-3">

                      <small className="text-muted">
                        Order Status
                      </small>

                      <div className="mt-2">

                        <span
                          className={`badge rounded-pill ${
                            selectedOrder.status ===
                            "Delivered"
                              ? "text-bg-success"
                              : "text-bg-secondary"
                          }`}
                        >
                          {
                            selectedOrder.status
                          }
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* ADDRESS */}

                  <div className="col-12">

                    <div className="bg-light rounded-4 p-3">

                      <small className="text-muted">
                        Delivery Address
                      </small>

                      <p className="mb-0 mt-1">
                        {selectedOrder.address ||
                          selectedOrder.delivery_address ||
                          "Address not available"}
                      </p>

                    </div>

                  </div>

                  {/* DELIVERY SLOT */}

                  <div className="col-md-6">

                    <div className="bg-light rounded-4 p-3">

                      <small className="text-muted">
                        Delivery Slot
                      </small>

                      <p className="fw-semibold mb-0 mt-1">
                        {selectedOrder.slot ||
                          "—"}
                      </p>

                    </div>

                  </div>

                  {/* PAYMENT */}

                  <div className="col-md-6">

                    <div className="bg-light rounded-4 p-3">

                      <small className="text-muted">
                        Payment
                      </small>

                      <p className="fw-semibold mb-0 mt-1">
                        {selectedOrder.payment_method ||
                          "COD"}
                      </p>

                    </div>

                  </div>

                  {/* TOTAL */}

                  <div className="col-12">

                    <div className="border rounded-4 p-3">

                      <div className="d-flex justify-content-between">

                        <span>
                          Order Total
                        </span>

                        <strong className="fs-5 text-success">
                          ₹
                          {Number(
                            selectedOrder.total ??
                              selectedOrder.total_amount ??
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-secondary rounded-pill"
                  onClick={() =>
                    setSelectedOrder(
                      null
                    )
                  }
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}


