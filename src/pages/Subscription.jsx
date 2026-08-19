import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheckCircle,
  FaCreditCard,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaSyncAlt,
} from "react-icons/fa";

import { supabase } from "../lib/supabase";
import { useApp } from "../context/AppContext";

/* =========================================================
   RAZORPAY LOADER
========================================================= */

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });

/* =========================================================
   DATE HELPERS
========================================================= */

const getToday = () => {
  const d = new Date();

  return `${d.getFullYear()}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const getDays = (start, end) => {
  if (!start || !end) return 0;

  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);

  const diff = endDate.getTime() - startDate.getTime();

  if (diff < 0) return 0;

  return Math.floor(diff / 86400000) + 1;
};

/* =========================================================
   FORMAT DATE
========================================================= */

const formatDate = (date) => {
  if (!date) return "-";

  try {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return date;
  }
};

/* =========================================================
   COMPONENT
========================================================= */

export default function Subscription() {
  const navigate = useNavigate();
  const location = useLocation();

  const { currentUser } = useApp();

  /*
   * Product is passed from ProductCard:
   *
   * navigate("/subscription", {
   *   state: { product }
   * })
   *
   * If user simply opens /subscriptions,
   * product will be null and existing subscriptions
   * will still be displayed.
   */
  const product = location.state?.product || null;

  /* =======================================================
     STATE
  ======================================================= */

  const [form, setForm] = useState({
    startDate: getToday(),
    endDate: "",
    quantity: 1,
    frequency: "Daily",
    deliverySlot: "Morning",
    address: "",
    city: "",
    pincode: "",
  });

  const [subscriptions, setSubscriptions] = useState([]);

  const [loadingSubscriptions, setLoadingSubscriptions] =
    useState(false);

  const [paying, setPaying] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /* =======================================================
     PREFILL USER
  ======================================================= */

  useEffect(() => {
    if (!currentUser) return;

    setForm((prev) => ({
      ...prev,

      address:
        prev.address ||
        currentUser.address ||
        "",

      city:
        prev.city ||
        currentUser.city ||
        "",

      pincode:
        prev.pincode ||
        currentUser.pincode ||
        "",
    }));
  }, [currentUser]);

  /* =======================================================
     LOAD USER SUBSCRIPTIONS
     
     THIS IS THE IMPORTANT FIX.
     
     The subscription is loaded from Supabase whenever
     the page opens/reloads.
  ======================================================= */

  const loadSubscriptions = async () => {
    if (!currentUser?.id) {
      setSubscriptions([]);
      return;
    }

    try {
      setLoadingSubscriptions(true);
      setError("");

      console.log(
        "Loading subscriptions for user:",
        currentUser.id
      );

      const { data, error: fetchError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", {
          ascending: false,
        });

      if (fetchError) {
        console.error(
          "Subscription fetch error:",
          fetchError
        );

        throw fetchError;
      }

      console.log(
        "Subscriptions loaded:",
        data
      );

      setSubscriptions(data || []);
    } catch (err) {
      console.error(
        "Unable to load subscriptions:",
        err
      );

      setError(
        err?.message ||
          "Unable to load your subscriptions."
      );
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, [currentUser?.id]);

  /* =======================================================
     PRICE
  ======================================================= */

  const unitPrice = Number(product?.price || 0);

  const quantity = Number(form.quantity) || 1;

  const days = useMemo(
    () =>
      getDays(
        form.startDate,
        form.endDate
      ),
    [
      form.startDate,
      form.endDate,
    ]
  );

  const totalAmount =
    unitPrice *
    quantity *
    days;

  /* =======================================================
     FORM UPDATE
  ======================================================= */

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* =======================================================
     SAVE SUBSCRIPTION
  ======================================================= */

  const saveSubscription = async (paymentResponse) => {
    if (!currentUser?.id) {
      throw new Error(
        "User session expired. Please login again."
      );
    }

    const productId = String(
      product?.id ||
        product?.product_id ||
        ""
    );

    if (!productId) {
      throw new Error(
        "Product ID is missing."
      );
    }

    const subscriptionData = {
      user_id: currentUser.id,

      product_id: productId,

      product_name:
        product.name ||
        product.PR_NAME ||
        "Fresh Milk",

      unit:
        product.unit ||
        product.Quantity ||
        product.quantity ||
        "",

      quantity,

      unit_price: unitPrice,

      frequency: form.frequency,

      delivery_slot: form.deliverySlot,

      delivery_address:
        form.address.trim(),

      city:
        form.city.trim(),

      pincode:
        form.pincode.trim(),

      start_date:
        form.startDate,

      end_date:
        form.endDate,

      total_amount: Number(
        totalAmount.toFixed(2)
      ),

      payment_method: "razorpay",

      payment_status: "Paid",

      razorpay_order_id:
        paymentResponse.razorpay_order_id,

      razorpay_payment_id:
        paymentResponse.razorpay_payment_id,

      razorpay_signature:
        paymentResponse.razorpay_signature,

      status: "Active",

      next_delivery_date:
        form.startDate,

      updated_at:
        new Date().toISOString(),
    };

    console.log(
      "Inserting subscription:",
      subscriptionData
    );

    const {
      data,
      error: insertError,
    } = await supabase
      .from("subscriptions")
      .insert(subscriptionData)
      .select("*")
      .single();

    if (insertError) {
      console.error(
        "Subscription insert error:",
        insertError
      );

      throw new Error(
        insertError.message ||
          "Unable to save subscription."
      );
    }

    console.log(
      "Subscription successfully inserted:",
      data
    );

    return data;
  };

  /* =======================================================
     START PAYMENT
  ======================================================= */

  const startPayment = async () => {
    setError("");
    setSuccess("");

    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!product) {
      setError(
        "Please select a milk product first."
      );
      return;
    }

    if (!form.startDate) {
      setError(
        "Please select a start date."
      );
      return;
    }

    if (!form.endDate) {
      setError(
        "Please select an end date."
      );
      return;
    }

    if (
      form.endDate <
      form.startDate
    ) {
      setError(
        "End date cannot be before start date."
      );
      return;
    }

    if (days <= 0) {
      setError(
        "Please select a valid subscription period."
      );
      return;
    }

    if (!form.address.trim()) {
      setError(
        "Please enter your delivery address."
      );
      return;
    }

    if (!form.city.trim()) {
      setError(
        "Please enter your city."
      );
      return;
    }

    if (
      !/^\d{6}$/.test(
        form.pincode.trim()
      )
    ) {
      setError(
        "Please enter a valid 6-digit pincode."
      );
      return;
    }

    if (
      !Number.isFinite(totalAmount) ||
      totalAmount <= 0
    ) {
      setError(
        "Invalid subscription amount."
      );
      return;
    }

    try {
      setPaying(true);

      /* ===================================================
         LOAD RAZORPAY
      =================================================== */

      const loaded =
        await loadRazorpay();

      if (!loaded || !window.Razorpay) {
        throw new Error(
          "Razorpay could not be loaded."
        );
      }

      /* ===================================================
         CREATE RAZORPAY ORDER
      =================================================== */

      const {
        data: orderData,
        error: orderError,
      } = await supabase.functions.invoke(
        "create-razorpay-order",
        {
          body: {
            amount: Number(
              totalAmount.toFixed(2)
            ),

            receipt:
              `GAM-SUB-${Date.now()}`,
          },
        }
      );

      console.log(
        "Razorpay order:",
        orderData
      );

      if (orderError) {
        throw new Error(
          orderError.message ||
            "Unable to create Razorpay order."
        );
      }

      if (!orderData?.success) {
        throw new Error(
          orderData?.error ||
            "Razorpay order creation failed."
        );
      }

      if (!orderData.order_id) {
        throw new Error(
          "Razorpay order ID was not returned."
        );
      }

      if (!orderData.key_id) {
        throw new Error(
          "Razorpay Key ID was not returned."
        );
      }

      /* ===================================================
         RAZORPAY OPTIONS
      =================================================== */

      const options = {
        key: orderData.key_id,

        amount: orderData.amount,

        currency:
          orderData.currency ||
          "INR",

        name: "Goo Amrutham",

        description:
          `Milk Subscription - ${
            product.name ||
            product.PR_NAME ||
            "Fresh Milk"
          }`,

        order_id:
          orderData.order_id,

        prefill: {
          name:
            currentUser.name ||
            "",

          email:
            currentUser.email ||
            "",

          contact:
            currentUser.phone ||
            "",
        },

        notes: {
          source:
            "Goo Amrutham",

          start_date:
            form.startDate,

          end_date:
            form.endDate,

          quantity:
            String(quantity),

          frequency:
            form.frequency,

          delivery_slot:
            form.deliverySlot,
        },

        theme: {
          color: "#198754",
        },

        modal: {
          escape: true,

          ondismiss: () => {
            setPaying(false);
          },
        },

        /* ================================================
           PAYMENT SUCCESS
        ================================================= */

        handler: async (response) => {
          console.log(
            "Razorpay success:",
            response
          );

          try {
            setPaying(true);
            setError("");

            /* ==========================================
               VERIFY PAYMENT
            ========================================== */

            const {
              data: verification,
              error:
                verificationError,
            } =
              await supabase.functions.invoke(
                "verify-razorpay-payment",
                {
                  body: {
                    razorpay_order_id:
                      response.razorpay_order_id,

                    razorpay_payment_id:
                      response.razorpay_payment_id,

                    razorpay_signature:
                      response.razorpay_signature,
                  },
                }
              );

            console.log(
              "Payment verification:",
              verification
            );

            if (verificationError) {
              throw new Error(
                verificationError.message ||
                  "Payment verification failed."
              );
            }

            if (
              !verification?.success ||
              !verification?.verified
            ) {
              throw new Error(
                verification?.error ||
                  "Payment could not be verified."
              );
            }

            /* ==========================================
               INSERT SUBSCRIPTION
            ========================================== */

            const saved =
              await saveSubscription(
                response
              );

            /* ==========================================
               IMPORTANT:
               Add immediately to local list.
            ========================================== */

            setSubscriptions((prev) => [
              saved,
              ...prev,
            ]);

            setSuccess(
              "Payment successful! Your subscription is active."
            );

            setPaying(false);

            /*
             * Clear product state from URL navigation
             * while keeping the user on subscriptions page.
             */
            navigate("/subscriptions", {
              replace: true,
            });

            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          } catch (err) {
            console.error(
              "Post-payment error:",
              err
            );

            setError(
              err?.message ||
                "Payment succeeded, but subscription could not be saved."
            );

            setPaying(false);

            /*
             * Reload from database in case the
             * insert actually succeeded.
             */
            await loadSubscriptions();
          }
        },
      };

      /* ===================================================
         OPEN RAZORPAY
      =================================================== */

      const razorpay =
        new window.Razorpay(
          options
        );

      razorpay.on(
        "payment.failed",
        (response) => {
          console.error(
            "Payment failed:",
            response
          );

          setPaying(false);

          setError(
            response?.error
              ?.description ||
              "Payment failed."
          );
        }
      );

      razorpay.open();
    } catch (err) {
      console.error(
        "Payment start error:",
        err
      );

      setError(
        err?.message ||
          "Unable to start payment."
      );

      setPaying(false);
    }
  };

  /* =======================================================
     NOT LOGGED IN
  ======================================================= */

  if (!currentUser) {
    return (
      <>
        <style>{styles}</style>

        <main className="sub-page">
          <div className="sub-box login-box">
            <div className="milk">
              🥛
            </div>

            <h2>
              Login Required
            </h2>

            <p>
              Login to manage your milk
              subscriptions.
            </p>

            <button
              className="primary-btn"
              onClick={() =>
                navigate("/login")
              }
            >
              Login
            </button>
          </div>
        </main>
      </>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <>
      <style>{styles}</style>

      <main className="sub-page">
        <div className="sub-container">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="sub-header">
            <button
              className="back-btn"
              onClick={() =>
                navigate(-1)
              }
            >
              <FaArrowLeft />
            </button>

            <div className="header-content">
              <span>
                GOO AMRUTHAM
              </span>

              <h1>
                My Subscriptions
              </h1>

              <p>
                Manage your milk deliveries
              </p>
            </div>

            <button
              className="refresh-btn"
              onClick={
                loadSubscriptions
              }
              disabled={
                loadingSubscriptions
              }
            >
              <FaSyncAlt
                className={
                  loadingSubscriptions
                    ? "rotate"
                    : ""
                }
              />
            </button>
          </div>

          {/* =================================================
              SUCCESS
          ================================================= */}

          {success && (
            <div className="success-box">
              <FaCheckCircle />

              <div>
                <strong>
                  Payment Successful
                </strong>

                <small>
                  {success}
                </small>
              </div>
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          {/* =================================================
              EXISTING SUBSCRIPTIONS
          ================================================= */}

          <section className="subscription-list">

            <div className="list-title">
              <div>
                <h2>
                  Active Subscriptions
                </h2>

                <span>
                  {subscriptions.length}{" "}
                  subscription
                  {subscriptions.length !== 1
                    ? "s"
                    : ""}
                </span>
              </div>
            </div>

            {loadingSubscriptions ? (
              <div className="loading-card">
                <span className="big-loader" />
                <p>
                  Loading your subscriptions...
                </p>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="empty-card">
                <div className="empty-icon">
                  🥛
                </div>

                <h3>
                  No subscriptions yet
                </h3>

                <p>
                  Choose fresh milk and start
                  your first subscription.
                </p>

                <button
                  className="primary-btn"
                  onClick={() =>
                    navigate("/products")
                  }
                >
                  Browse Milk
                </button>
              </div>
            ) : (
              <div className="subscription-cards">

                {subscriptions.map(
                  (sub) => (
                    <div
                      className="active-card"
                      key={sub.id}
                    >

                      {/* TOP */}

                      <div className="active-top">

                        <div className="active-icon">
                          🥛
                        </div>

                        <div className="active-info">
                          <span>
                            {String(
                              sub.status ||
                                "Active"
                            ).toUpperCase()}
                          </span>

                          <h3>
                            {sub.product_name ||
                              "Fresh Milk"}
                          </h3>

                          <small>
                            {sub.quantity || 1}{" "}
                            {sub.unit || ""}
                            {" • "}
                            {sub.frequency ||
                              "Daily"}
                          </small>
                        </div>

                        <b className="paid-badge">
                          PAID
                        </b>

                      </div>

                      {/* DETAILS */}

                      <div className="mini-grid">

                        <div>
                          <small>
                            START
                          </small>

                          <strong>
                            {formatDate(
                              sub.start_date
                            )}
                          </strong>
                        </div>

                        <div>
                          <small>
                            END
                          </small>

                          <strong>
                            {formatDate(
                              sub.end_date
                            )}
                          </strong>
                        </div>

                        <div>
                          <small>
                            DELIVERY
                          </small>

                          <strong>
                            {sub.delivery_slot ||
                              "Morning"}
                          </strong>
                        </div>

                        <div>
                          <small>
                            NEXT DELIVERY
                          </small>

                          <strong>
                            {formatDate(
                              sub.next_delivery_date ||
                                sub.start_date
                            )}
                          </strong>
                        </div>

                      </div>

                      {/* ADDRESS */}

                      {sub.delivery_address && (
                        <div className="address-row">
                          <FaMapMarkerAlt />

                          <span>
                            {sub.delivery_address}
                            {sub.city
                              ? `, ${sub.city}`
                              : ""}
                            {sub.pincode
                              ? ` - ${sub.pincode}`
                              : ""}
                          </span>
                        </div>
                      )}

                      {/* TOTAL */}

                      <div className="paid-total">

                        <span>
                          Amount Paid
                        </span>

                        <strong>
                          ₹
                          {Number(
                            sub.total_amount ||
                              0
                          ).toFixed(2)}
                        </strong>

                      </div>

                      <div className="paid-message">
                        <FaCheckCircle />

                        Subscription successfully
                        activated.
                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </section>

          {/* =================================================
              NEW SUBSCRIPTION
              
              Only show form when a product was selected.
          ================================================= */}

          {product && (
            <section className="sub-box new-subscription">

              <div className="new-title">
                <div>
                  <span>
                    NEW SUBSCRIPTION
                  </span>

                  <h2>
                    Start Milk Delivery
                  </h2>
                </div>
              </div>

              {/* PRODUCT */}

              <div className="product-row">

                <div className="product-icon">
                  🥛
                </div>

                <div className="product-info">

                  <strong>
                    {product.name ||
                      product.PR_NAME ||
                      "Fresh Milk"}
                  </strong>

                  <small>
                    {product.unit ||
                      product.Quantity ||
                      product.quantity ||
                      "Milk"}
                  </small>

                </div>

                <strong className="green-price">
                  ₹
                  {unitPrice.toFixed(2)}
                </strong>

              </div>

              {/* DATES */}

              <div className="section-label">
                <FaCalendarAlt />
                Subscription Period
              </div>

              <div className="two-columns">

                <div>
                  <label>
                    Start Date
                  </label>

                  <input
                    type="date"
                    min={getToday()}
                    value={
                      form.startDate
                    }
                    onChange={(e) =>
                      updateForm(
                        "startDate",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label>
                    End Date
                  </label>

                  <input
                    type="date"
                    min={
                      form.startDate ||
                      getToday()
                    }
                    value={
                      form.endDate
                    }
                    onChange={(e) =>
                      updateForm(
                        "endDate",
                        e.target.value
                      )
                    }
                  />
                </div>

              </div>

              {days > 0 && (
                <div className="duration">
                  <span>
                    Subscription duration
                  </span>

                  <strong>
                    {days}{" "}
                    {days === 1
                      ? "day"
                      : "days"}
                  </strong>
                </div>
              )}

              {/* QUANTITY */}

              <div className="section-label">
                Daily Quantity
              </div>

              <div className="quantity">

                <button
                  type="button"
                  onClick={() =>
                    updateForm(
                      "quantity",
                      Math.max(
                        1,
                        quantity - 1
                      )
                    )
                  }
                >
                  −
                </button>

                <strong>
                  {quantity}
                </strong>

                <span>
                  {product.unit ||
                    "unit"}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    updateForm(
                      "quantity",
                      quantity + 1
                    )
                  }
                >
                  +
                </button>

              </div>

              {/* FREQUENCY */}

              <div className="section-label">
                Delivery Frequency
              </div>

              <div className="small-options">

                <button
                  type="button"
                  className={
                    form.frequency ===
                    "Daily"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    updateForm(
                      "frequency",
                      "Daily"
                    )
                  }
                >
                  🥛 Daily
                </button>

                <button
                  type="button"
                  className={
                    form.frequency ===
                    "Weekly"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    updateForm(
                      "frequency",
                      "Weekly"
                    )
                  }
                >
                  📅 Weekly
                </button>

              </div>

              {/* DELIVERY SLOT */}

              <div className="section-label">
                Delivery Slot
              </div>

              <div className="small-options">

                <button
                  type="button"
                  className={
                    form.deliverySlot ===
                    "Morning"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    updateForm(
                      "deliverySlot",
                      "Morning"
                    )
                  }
                >
                  🌅 Morning
                </button>

                <button
                  type="button"
                  className={
                    form.deliverySlot ===
                    "Evening"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    updateForm(
                      "deliverySlot",
                      "Evening"
                    )
                  }
                >
                  🌆 Evening
                </button>

              </div>

              {/* ADDRESS */}

              <div className="section-label">
                <FaMapMarkerAlt />
                Delivery Address
              </div>

              <textarea
                placeholder="House number, street, area..."
                value={
                  form.address
                }
                onChange={(e) =>
                  updateForm(
                    "address",
                    e.target.value
                  )
                }
              />

              <div className="two-columns">

                <div>
                  <label>
                    City
                  </label>

                  <input
                    type="text"
                    placeholder="City"
                    value={
                      form.city
                    }
                    onChange={(e) =>
                      updateForm(
                        "city",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label>
                    Pincode
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit pincode"
                    value={
                      form.pincode
                    }
                    onChange={(e) =>
                      updateForm(
                        "pincode",
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                  />
                </div>

              </div>

              {/* PAYMENT */}

              <div className="payment-box">

                <FaCreditCard />

                <div>
                  <strong>
                    Online Payment
                  </strong>

                  <small>
                    UPI • Cards • Net Banking
                  </small>
                </div>

                <FaCheckCircle />

              </div>

              <div className="secure">
                <FaShieldAlt />

                Secure payment powered by
                Razorpay
              </div>

              {/* TOTAL */}

              <div className="total">

                <div>
                  <span>
                    ₹
                    {(
                      unitPrice *
                      quantity
                    ).toFixed(2)}
                    {" "} / day
                  </span>

                  <small>
                    {days || 0} days
                  </small>
                </div>

                <strong>
                  ₹
                  {totalAmount.toFixed(2)}
                </strong>

              </div>

              {/* PAY */}

              <button
                type="button"
                className="pay-btn"
                disabled={
                  paying ||
                  !form.startDate ||
                  !form.endDate ||
                  days <= 0
                }
                onClick={
                  startPayment
                }
              >
                {paying ? (
                  <>
                    <span className="loader" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCreditCard />
                    Pay ₹
                    {totalAmount.toFixed(
                      2
                    )}
                  </>
                )}
              </button>

            </section>
          )}

        </div>
      </main>
    </>
  );
}

/* =========================================================
   STYLES
========================================================= */
const styles = `
* {
  box-sizing: border-box;
}

/* =========================================================
   PAGE
========================================================= */

.sub-page {
  min-height: 75vh;
  background:
    radial-gradient(circle at 10% 0%, rgba(25,135,84,.06), transparent 30%),
    radial-gradient(circle at 90% 20%, rgba(25,135,84,.04), transparent 28%),
    #f5f8f5;
  padding: 35px 20px 60px;
  color: #17351f;
  animation: pageReveal .6s ease both;
}

.sub-container {
  width: 100%;
  max-width: 1100px;
  margin: auto;
}


/* =========================================================
   HEADER
========================================================= */

.sub-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
  animation: fadeDown .65s ease both;
}

.back-btn,
.refresh-btn {
  width: 46px;
  height: 46px;
  border: 0;
  border-radius: 13px;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
  transition:
    transform .25s ease,
    background .25s ease,
    box-shadow .25s ease;
}

.back-btn {
  background: #e7f5eb;
  color: #198754;
}

.back-btn:hover {
  transform: translateX(-3px);
  background: #d9f0e1;
  box-shadow: 0 8px 20px rgba(25,135,84,.12);
}

.refresh-btn {
  margin-left: auto;
  background: #fff;
  color: #198754;
  border: 1px solid #e0e9e2;
}

.refresh-btn:hover {
  transform: rotate(12deg);
  background: #f0f9f3;
  box-shadow: 0 8px 20px rgba(25,135,84,.10);
}

.refresh-btn:disabled {
  opacity: .5;
}

.rotate {
  animation: spin .8s linear infinite;
}

.header-content {
  flex: 1;
}

.sub-header span,
.new-title span {
  color: #198754;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.sub-header h1 {
  margin: 4px 0;
  font-size: 32px;
  line-height: 1.15;
  font-weight: 850;
  letter-spacing: -.5px;
}

.sub-header p {
  margin: 0;
  color: #748078;
  font-size: 14px;
}


/* =========================================================
   COMMON CARDS
========================================================= */

.sub-box,
.active-card {
  background: rgba(255,255,255,.96);
  border-radius: 20px;
  padding: 24px;
  box-shadow:
    0 10px 35px rgba(20,60,35,.07),
    0 2px 8px rgba(20,60,35,.04);
  margin-bottom: 18px;
  animation: cardReveal .65s cubic-bezier(.22,.61,.36,1) both;
  transition:
    transform .3s ease,
    box-shadow .3s ease,
    border-color .3s ease;
}

.sub-box:hover {
  box-shadow:
    0 18px 45px rgba(20,60,35,.10),
    0 4px 12px rgba(20,60,35,.05);
}

.success-box,
.error-box {
  border-radius: 13px;
  padding: 14px 16px;
  margin-bottom: 16px;
  font-size: 13px;
  animation: alertReveal .45s ease both;
}

.success-box {
  display: flex;
  gap: 10px;
  background: linear-gradient(135deg, #e7f7ed, #f4fbf6);
  color: #176b3f;
  border: 1px solid #cce8d5;
}

.success-box strong,
.success-box small {
  display: block;
}

.success-box small {
  margin-top: 3px;
  font-size: 11px;
}

.error-box {
  background: #fff0f0;
  color: #b02a37;
  border: 1px solid #f3d0d0;
}


/* =========================================================
   SUBSCRIPTION LIST
========================================================= */

.subscription-list {
  margin-bottom: 24px;
}

.list-title {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.list-title h2 {
  margin: 0;
  font-size: 21px;
  font-weight: 800;
}

.list-title span {
  color: #7c8880;
  font-size: 12px;
}

.subscription-cards {
  display: grid;
  gap: 14px;
}


/* =========================================================
   ACTIVE CARD
========================================================= */

.active-card {
  border: 1px solid #cfe7d6;
  box-shadow:
    0 8px 25px rgba(25,135,84,.07),
    inset 0 1px 0 rgba(255,255,255,.8);
}

.active-card:hover {
  transform: translateY(-5px);
  border-color: #a9d7b8;
  box-shadow:
    0 18px 40px rgba(25,135,84,.12),
    0 5px 15px rgba(25,135,84,.05);
}

.active-card:nth-child(1) {
  animation-delay: .08s;
}

.active-card:nth-child(2) {
  animation-delay: .16s;
}

.active-card:nth-child(3) {
  animation-delay: .24s;
}

.active-card:nth-child(4) {
  animation-delay: .32s;
}

.active-top {
  display: flex;
  align-items: center;
  gap: 14px;
}

.active-icon {
  width: 56px;
  height: 56px;
  border-radius: 15px;
  background: linear-gradient(145deg, #f0f8f2, #e5f4e9);
  display: grid;
  place-items: center;
  font-size: 28px;
  flex-shrink: 0;
  transition: transform .3s ease;
}

.active-card:hover .active-icon {
  transform: scale(1.08) rotate(-3deg);
}

.active-info {
  flex: 1;
  min-width: 0;
}

.active-info span {
  color: #198754;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .7px;
}

.active-info h3 {
  margin: 4px 0 2px;
  font-size: 18px;
}

.active-info small {
  color: #78847c;
  font-size: 11px;
}

.paid-badge {
  background: #dff5e8;
  color: #198754;
  border-radius: 50px;
  padding: 7px 11px;
  font-size: 9px;
  font-weight: 800;
  transition: transform .25s ease;
}

.active-card:hover .paid-badge {
  transform: scale(1.06);
}


/* =========================================================
   DETAILS
========================================================= */

.mini-grid {
  margin-top: 15px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.mini-grid div {
  background: linear-gradient(145deg, #f7faf8, #f2f7f3);
  padding: 12px;
  border-radius: 11px;
  transition:
    transform .25s ease,
    background .25s ease;
}

.mini-grid div:hover {
  transform: translateY(-2px);
  background: #edf7f0;
}

.mini-grid small,
.mini-grid strong {
  display: block;
}

.mini-grid small {
  color: #849087;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: .4px;
}

.mini-grid strong {
  margin-top: 4px;
  font-size: 12px;
}

.address-row {
  margin-top: 12px;
  display: flex;
  align-items: flex-start;
  gap: 7px;
  color: #657169;
  font-size: 11px;
  line-height: 1.5;
}

.address-row svg {
  color: #198754;
  margin-top: 2px;
  flex-shrink: 0;
}

.paid-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 13px;
  padding-top: 13px;
  border-top: 1px dashed #dce7df;
}

.paid-total span {
  color: #718078;
  font-size: 12px;
}

.paid-total strong {
  color: #198754;
  font-size: 23px;
}

.paid-message {
  margin-top: 10px;
  padding: 10px;
  background: #eef9f2;
  color: #176b3f;
  border-radius: 9px;
  font-size: 10px;
  display: flex;
  align-items: center;
  gap: 7px;
}


/* =========================================================
   EMPTY / LOADING
========================================================= */

.empty-card,
.loading-card {
  background: #fff;
  border-radius: 20px;
  padding: 55px 25px;
  text-align: center;
  box-shadow: 0 10px 35px rgba(20,60,35,.06);
  animation: cardReveal .6s ease both;
}

.empty-icon {
  font-size: 48px;
  animation: gentleFloat 3s ease-in-out infinite;
}

.empty-card h3 {
  margin: 12px 0 5px;
  font-size: 20px;
}

.empty-card p {
  margin: 0 0 18px;
  color: #7a857e;
  font-size: 13px;
}

.loading-card p {
  color: #758078;
  font-size: 12px;
}

.big-loader {
  width: 34px;
  height: 34px;
  border: 4px solid #dcebe1;
  border-top-color: #198754;
  border-radius: 50%;
  display: inline-block;
  animation: spin .7s linear infinite;
}


/* =========================================================
   NEW SUBSCRIPTION
========================================================= */

.new-subscription {
  margin-top: 22px;
  animation-delay: .15s;
}

.new-title {
  margin-bottom: 16px;
}

.new-title h2 {
  margin: 4px 0 0;
  font-size: 24px;
}


/* =========================================================
   PRODUCT
========================================================= */

.product-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 15px;
  background: linear-gradient(135deg, #f2f8f3, #f7fbf8);
  border-radius: 14px;
  border: 1px solid #e0eee4;
  transition:
    transform .3s ease,
    box-shadow .3s ease;
}

.product-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(25,135,84,.07);
}

.product-icon {
  width: 55px;
  height: 55px;
  border-radius: 14px;
  background: #fff;
  display: grid;
  place-items: center;
  font-size: 29px;
  box-shadow: 0 5px 15px rgba(20,60,35,.06);
}

.product-info {
  flex: 1;
}

.product-info strong {
  display: block;
  font-size: 16px;
}

.product-info small {
  color: #718078;
  font-size: 11px;
}

.green-price {
  color: #198754;
  font-size: 18px;
}


/* =========================================================
   FORM
========================================================= */

.section-label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 800;
  margin: 18px 0 8px;
}

.section-label svg {
  color: #198754;
  font-size: 12px;
}

.two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.two-columns label {
  display: block;
  color: #68766d;
  font-size: 10px;
  margin-bottom: 5px;
}

input,
textarea {
  width: 100%;
  border: 1px solid #dce7df;
  background: #fbfdfb;
  border-radius: 10px;
  padding: 11px;
  outline: none;
  font-size: 13px;
  transition:
    border-color .25s ease,
    box-shadow .25s ease,
    background .25s ease;
}

input {
  height: 44px;
}

textarea {
  height: 80px;
  resize: vertical;
}

input:hover,
textarea:hover {
  border-color: #b9d8c3;
}

input:focus,
textarea:focus {
  border-color: #198754;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(25,135,84,.08);
}

.duration {
  margin-top: 9px;
  padding: 10px 12px;
  background: #eaf7ee;
  border-radius: 9px;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  animation: softReveal .35s ease both;
}

.duration strong {
  color: #198754;
}


/* =========================================================
   QUANTITY
========================================================= */

.quantity {
  height: 44px;
  border: 1px solid #dce7df;
  border-radius: 10px;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.quantity button {
  width: 50px;
  height: 44px;
  border: 0;
  background: #f0f6f2;
  color: #198754;
  font-size: 22px;
  cursor: pointer;
  transition:
    background .2s ease,
    transform .2s ease;
}

.quantity button:hover {
  background: #dff1e5;
}

.quantity button:active {
  transform: scale(.9);
}

.quantity strong {
  flex: 1;
  text-align: center;
  font-size: 15px;
}

.quantity span {
  color: #718078;
  font-size: 11px;
  padding-right: 12px;
}


/* =========================================================
   OPTIONS
========================================================= */

.small-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.small-options button {
  border: 1px solid #dce7df;
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  font-size: 12px;
  cursor: pointer;
  transition:
    transform .25s ease,
    border-color .25s ease,
    background .25s ease,
    box-shadow .25s ease;
}

.small-options button:hover {
  transform: translateY(-2px);
  border-color: #a9d7b8;
  box-shadow: 0 6px 15px rgba(25,135,84,.07);
}

.small-options button.selected {
  border: 1.5px solid #198754;
  background: #eef9f2;
  color: #198754;
  font-weight: 800;
  box-shadow: 0 5px 15px rgba(25,135,84,.08);
}


/* =========================================================
   PAYMENT
========================================================= */

.payment-box {
  margin-top: 20px;
  padding: 14px;
  border: 1px solid #cfe5d6;
  background: linear-gradient(135deg, #f1faf4, #f8fcf9);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition:
    transform .3s ease,
    box-shadow .3s ease;
}

.payment-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(25,135,84,.08);
}

.payment-box > svg:first-child {
  width: 38px;
  height: 38px;
  padding: 10px;
  border-radius: 10px;
  background: #198754;
  color: #fff;
}

.payment-box div {
  flex: 1;
}

.payment-box strong,
.payment-box small {
  display: block;
}

.payment-box strong {
  font-size: 13px;
}

.payment-box small {
  color: #758279;
  font-size: 10px;
  margin-top: 3px;
}

.payment-box > svg:last-child {
  color: #198754;
  font-size: 15px;
  animation: checkPulse 2s ease-in-out infinite;
}

.secure {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #758279;
  font-size: 10px;
  margin-top: 8px;
}

.secure svg {
  color: #198754;
}


/* =========================================================
   TOTAL
========================================================= */

.total {
  border-top: 1px solid #edf1ee;
  margin-top: 16px;
  padding-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.total span,
.total small {
  display: block;
}

.total span {
  color: #718078;
  font-size: 11px;
}

.total small {
  color: #9aa59e;
  font-size: 9px;
  margin-top: 3px;
}

.total > strong {
  color: #198754;
  font-size: 27px;
}


/* =========================================================
   BUTTONS
========================================================= */

.pay-btn,
.primary-btn {
  width: 100%;
  border: 0;
  border-radius: 11px;
  min-height: 48px;
  margin-top: 14px;
  background: linear-gradient(
    135deg,
    #198754,
    #157347
  );
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 8px 20px rgba(25,135,84,.18);
  transition:
    transform .25s ease,
    box-shadow .25s ease,
    filter .25s ease;
}

.pay-btn:hover:not(:disabled),
.primary-btn:hover {
  transform: translateY(-3px);
  box-shadow:
    0 14px 30px rgba(25,135,84,.24);
  filter: brightness(1.04);
}

.pay-btn:active:not(:disabled),
.primary-btn:active {
  transform: translateY(-1px) scale(.99);
}

.pay-btn:disabled {
  opacity: .55;
  cursor: not-allowed;
  box-shadow: none;
}

.primary-btn {
  max-width: 260px;
  margin-left: auto;
  margin-right: auto;
}

.loader {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}


/* =========================================================
   LOGIN
========================================================= */

.login-box {
  text-align: center;
  padding: 55px 30px;
  max-width: 500px;
  margin: 70px auto;
}

.login-box .milk {
  font-size: 52px;
  animation: gentleFloat 3s ease-in-out infinite;
}

.login-box h2 {
  margin: 8px 0;
  font-size: 25px;
}

.login-box p {
  color: #718078;
  font-size: 13px;
}


/* =========================================================
   PREMIUM ANIMATIONS
========================================================= */

@keyframes pageReveal {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes fadeDown {
  from {
    opacity: 0;
    transform: translateY(-18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cardReveal {
  from {
    opacity: 0;
    transform: translateY(25px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes alertReveal {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes softReveal {
  from {
    opacity: 0;
    transform: scale(.98);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes gentleFloat {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-7px);
  }
}

@keyframes checkPulse {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.15);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


/* =========================================================
   REDUCED MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}


/* =========================================================
   MOBILE
   IMPORTANT:
   YOUR EXISTING MOBILE DESIGN IS PRESERVED
========================================================= */

@media (max-width: 430px) {
  .sub-page {
    padding: 12px 7px 25px;
  }

  .sub-box,
  .active-card {
    padding: 11px;
  }

  .sub-header h1 {
    font-size: 18px;
  }

  .two-columns {
    gap: 6px;
  }
}


/* =========================================================
   MOBILE ORIGINAL SIZING OVERRIDE
   Keeps the existing compact mobile appearance
========================================================= */

@media (max-width: 767px) {

  .sub-page {
    min-height: 75vh;
    background: #f5f8f5;
    padding: 16px 10px 35px;
  }

  .sub-container {
    width: 100%;
    max-width: 560px;
  }

  .sub-header {
    gap: 8px;
    margin-bottom: 12px;
  }

  .back-btn,
  .refresh-btn {
    width: 32px;
    height: 32px;
    border-radius: 9px;
  }

  .sub-header span,
  .new-title span {
    font-size: 8px;
    letter-spacing: .7px;
  }

  .sub-header h1 {
    margin: 2px 0;
    font-size: 19px;
  }

  .sub-header p {
    font-size: 9px;
  }

  .sub-box,
  .active-card {
    border-radius: 13px;
    padding: 13px;
    margin-bottom: 11px;
  }

  .success-box,
  .error-box {
    border-radius: 9px;
    padding: 9px;
    margin-bottom: 10px;
    font-size: 10px;
  }

  .success-box small {
    font-size: 8px;
  }

  .list-title h2 {
    font-size: 13px;
  }

  .list-title span {
    font-size: 8px;
  }

  .subscription-cards {
    gap: 8px;
  }

  .active-top {
    gap: 8px;
  }

  .active-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    font-size: 20px;
  }

  .active-info span {
    font-size: 7px;
  }

  .active-info h3 {
    margin: 2px 0 1px;
    font-size: 13px;
  }

  .active-info small {
    font-size: 8px;
  }

  .paid-badge {
    padding: 4px 7px;
    font-size: 7px;
  }

  .mini-grid {
    margin-top: 9px;
    grid-template-columns: 1fr 1fr;
    gap: 5px;
  }

  .mini-grid div {
    padding: 7px;
    border-radius: 7px;
  }

  .mini-grid small {
    font-size: 7px;
  }

  .mini-grid strong {
    margin-top: 2px;
    font-size: 9px;
  }

  .address-row {
    margin-top: 7px;
    gap: 5px;
    font-size: 8px;
  }

  .paid-total {
    margin-top: 8px;
    padding-top: 8px;
  }

  .paid-total span {
    font-size: 9px;
  }

  .paid-total strong {
    font-size: 17px;
  }

  .paid-message {
    margin-top: 7px;
    padding: 7px;
    font-size: 8px;
  }

  .empty-card,
  .loading-card {
    border-radius: 13px;
    padding: 25px 15px;
  }

  .empty-icon {
    font-size: 30px;
  }

  .empty-card h3 {
    margin: 7px 0 3px;
    font-size: 14px;
  }

  .empty-card p {
    margin: 0 0 10px;
    font-size: 9px;
  }

  .loading-card p {
    font-size: 9px;
  }

  .big-loader {
    width: 22px;
    height: 22px;
    border-width: 3px;
  }

  .new-subscription {
    margin-top: 12px;
  }

  .new-title {
    margin-bottom: 9px;
  }

  .new-title h2 {
    margin: 2px 0 0;
    font-size: 15px;
  }

  .product-row {
    gap: 9px;
    padding: 9px;
    border-radius: 11px;
  }

  .product-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    font-size: 21px;
  }

  .product-info strong {
    font-size: 12px;
  }

  .product-info small {
    font-size: 9px;
  }

  .green-price {
    font-size: 13px;
  }

  .section-label {
    gap: 5px;
    font-size: 10px;
    margin: 11px 0 6px;
  }

  .section-label svg {
    font-size: 10px;
  }

  .two-columns {
    grid-template-columns: 1fr 1fr;
    gap: 7px;
  }

  .two-columns label {
    font-size: 8px;
    margin-bottom: 4px;
  }

  input,
  textarea {
    border-radius: 8px;
    padding: 8px;
    font-size: 11px;
  }

  input {
    height: 36px;
  }

  textarea {
    height: 58px;
  }

  .duration {
    margin-top: 7px;
    padding: 7px 9px;
    border-radius: 8px;
    font-size: 9px;
  }

  .quantity {
    height: 35px;
    border-radius: 8px;
  }

  .quantity button {
    width: 38px;
    height: 35px;
    font-size: 18px;
  }

  .quantity strong {
    font-size: 12px;
  }

  .quantity span {
    font-size: 9px;
    padding-right: 9px;
  }

  .small-options {
    gap: 7px;
  }

  .small-options button {
    border-radius: 8px;
    padding: 8px;
    font-size: 10px;
  }

  .payment-box {
    margin-top: 12px;
    padding: 9px;
    border-radius: 9px;
    gap: 8px;
  }

  .payment-box > svg:first-child {
    width: 30px;
    height: 30px;
    padding: 8px;
    border-radius: 8px;
  }

  .payment-box strong {
    font-size: 10px;
  }

  .payment-box small {
    font-size: 8px;
    margin-top: 2px;
  }

  .payment-box > svg:last-child {
    font-size: 12px;
  }

  .secure {
    gap: 5px;
    font-size: 8px;
    margin-top: 6px;
  }

  .total {
    margin-top: 10px;
    padding-top: 9px;
  }

  .total span {
    font-size: 9px;
  }

  .total small {
    font-size: 8px;
    margin-top: 2px;
  }

  .total > strong {
    font-size: 20px;
  }

  .pay-btn,
  .primary-btn {
    border-radius: 9px;
    min-height: 38px;
    margin-top: 10px;
    font-size: 11px;
  }

  .primary-btn {
    max-width: 220px;
  }

  .loader {
    width: 13px;
    height: 13px;
  }

  .login-box {
    padding: 30px 15px;
  }

  .login-box .milk {
    font-size: 34px;
  }

  .login-box h2 {
    margin: 5px 0;
    font-size: 17px;
  }

  .login-box p {
    font-size: 10px;
  }
}
`;