import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheckCircle,
  FaCreditCard,
  FaMapMarkerAlt,
  FaShieldAlt,
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

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });

/* =========================================================
   DATE HELPERS
========================================================= */

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDays = (start, end) => {
  if (!start || !end) return 0;

  const startDate = new Date(
    `${start}T00:00:00`
  );

  const endDate = new Date(
    `${end}T00:00:00`
  );

  const difference =
    endDate.getTime() -
    startDate.getTime();

  if (difference < 0) return 0;

  return (
    Math.floor(
      difference /
        (1000 * 60 * 60 * 24)
    ) + 1
  );
};

/* =========================================================
   COMPONENT
========================================================= */

export default function SubscribeDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const { currentUser } = useApp();

  /*
    Product comes from ProductCard:

    navigate("/subscribe-details", {
      state: { product }
    })
  */

  const product =
    location.state?.product || null;

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

  const [paying, setPaying] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [savedSubscription, setSavedSubscription] =
    useState(null);

  /* =========================================================
     PREFILL USER DETAILS
  ========================================================= */

  useEffect(() => {
    if (!currentUser) return;

    setForm((previous) => ({
      ...previous,

      address:
        previous.address ||
        currentUser.address ||
        "",

      city:
        previous.city ||
        currentUser.city ||
        "",

      pincode:
        previous.pincode ||
        currentUser.pincode ||
        "",
    }));
  }, [currentUser]);

  /* =========================================================
     PRICE
  ========================================================= */

  const unitPrice = Number(
    product?.price || 0
  );

  const quantity =
    Number(form.quantity) || 1;

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

  /* =========================================================
     FORM UPDATE
  ========================================================= */

  const updateForm = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* =========================================================
     SAVE SUBSCRIPTION
  ========================================================= */

  const saveSubscription = async (
    paymentResponse
  ) => {
    if (!currentUser) {
      throw new Error(
        "Your login session expired. Please login again."
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
        product?.name ||
        product?.PR_NAME ||
        "Fresh Milk",

      unit:
        product?.unit ||
        product?.Quantity ||
        product?.quantity ||
        "",

      quantity,

      unit_price: unitPrice,

      frequency:
        form.frequency,

      delivery_slot:
        form.deliverySlot,

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

      total_amount:
        Number(
          totalAmount.toFixed(2)
        ),

      payment_method:
        "razorpay",

      payment_status:
        "Paid",

      razorpay_order_id:
        paymentResponse.razorpay_order_id,

      razorpay_payment_id:
        paymentResponse.razorpay_payment_id,

      razorpay_signature:
        paymentResponse.razorpay_signature,

      status:
        "Active",

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
    } =
      await supabase
        .from("subscriptions")
        .insert(
          subscriptionData
        )
        .select()
        .single();

    if (insertError) {
      console.error(
        "Subscription insert error:",
        insertError
      );

      throw new Error(
        insertError.message ||
          "Could not save subscription."
      );
    }

    return data;
  };

  /* =========================================================
     START PAYMENT
  ========================================================= */

  const startPayment = async () => {
    setError("");
    setSuccess("");

    if (!currentUser) {
      navigate("/login", {
        state: {
          from:
            "/subscribe-details",
          product,
        },
      });

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
      !Number.isFinite(
        totalAmount
      ) ||
      totalAmount <= 0
    ) {
      setError(
        "Invalid subscription amount."
      );

      return;
    }

    try {
      setPaying(true);

      /* ===============================================
         LOAD RAZORPAY
      =============================================== */

      const loaded =
        await loadRazorpay();

      if (!loaded) {
        throw new Error(
          "Razorpay could not be loaded."
        );
      }

      /* ===============================================
         CREATE RAZORPAY ORDER
      =============================================== */

      const {
        data: orderData,
        error: orderError,
      } =
        await supabase.functions.invoke(
          "create-razorpay-order",
          {
            body: {
              amount:
                Number(
                  totalAmount.toFixed(
                    2
                  )
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
          orderError.message
        );
      }

      if (
        !orderData?.success
      ) {
        throw new Error(
          orderData?.error ||
            "Unable to create payment order."
        );
      }

      /* ===============================================
         RAZORPAY OPTIONS
      =============================================== */

      const options = {
        key:
          orderData.key_id,

        amount:
          orderData.amount,

        currency:
          orderData.currency ||
          "INR",

        name:
          "Goo Amrutham",

        description:
          `Milk Subscription - ${
            product.name ||
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
          subscription:
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
          ondismiss: () => {
            setPaying(false);
          },
        },

        /* =============================================
           PAYMENT SUCCESS
        ============================================= */

        handler:
          async (response) => {
            try {
              setError("");
              setPaying(true);

              console.log(
                "Payment response:",
                response
              );

              /* =======================================
                 VERIFY PAYMENT
              ======================================= */

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
                "Verification:",
                verification
              );

              if (
                verificationError
              ) {
                throw new Error(
                  verificationError.message
                );
              }

              if (
                !verification?.success ||
                !verification?.verified
              ) {
                throw new Error(
                  verification?.error ||
                    "Payment verification failed."
                );
              }

              /* =======================================
                 INSERT SUBSCRIPTION
              ======================================= */

              const saved =
                await saveSubscription(
                  response
                );

              setSavedSubscription(
                saved
              );

              setSuccess(
                "Payment successful! Your subscription is active."
              );

              setPaying(false);

              /*
                Go to My Subscriptions after
                successful database insertion.
              */

              setTimeout(() => {
                navigate(
                  "/subscriptions",
                  {
                    replace: true,
                  }
                );
              }, 1200);
            } catch (err) {
              console.error(
                "Post-payment error:",
                err
              );

              setError(
                err?.message ||
                  "Payment succeeded, but the subscription could not be saved."
              );

              setPaying(false);
            }
          },
      };

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
        "Payment error:",
        err
      );

      setError(
        err?.message ||
          "Unable to start payment."
      );

      setPaying(false);
    }
  };

  /* =========================================================
     LOGIN REQUIRED
  ========================================================= */

  if (!currentUser) {
    return (
      <>
        <style>{styles}</style>

        <main className="subscribe-page">
          <div className="subscribe-card empty-card">

            <div className="milk-icon">
              🥛
            </div>

            <h2>
              Login Required
            </h2>

            <p>
              Please login to create
              your milk subscription.
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

  /* =========================================================
     PRODUCT MISSING
  ========================================================= */

  if (!product) {
    return (
      <>
        <style>{styles}</style>

        <main className="subscribe-page">
          <div className="subscribe-card empty-card">

            <div className="milk-icon">
              🥛
            </div>

            <h2>
              Product Not Selected
            </h2>

            <p>
              Please choose a milk
              product first.
            </p>

            <button
              className="primary-btn"
              onClick={() =>
                navigate("/products")
              }
            >
              Browse Products
            </button>

          </div>
        </main>
      </>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <>
      <style>{styles}</style>

      <main className="subscribe-page">

        <div className="subscribe-container">

          {/* HEADER */}

          <div className="page-header">

            <button
              className="back-btn"
              onClick={() =>
                navigate(-1)
              }
            >
              <FaArrowLeft />
            </button>

            <div>
              <span>
                GOO AMRUTHAM
              </span>

              <h1>
                Subscribe to Milk
              </h1>

              <p>
                Fresh milk delivered
                to your home.
              </p>
            </div>

          </div>

          {/* SUCCESS */}

          {success && (
            <div className="success-box">
              <FaCheckCircle />

              <div>
                <strong>
                  Payment Successful
                </strong>

                <small>
                  Your subscription has
                  been activated.
                </small>
              </div>
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          {/* PRODUCT */}

          <section className="subscribe-card">

            <div className="product-row">

              <div className="product-icon">
                🥛
              </div>

              <div className="product-info">

                <strong>
                  {product.name}
                </strong>

                <small>
                  {product.unit}
                </small>

              </div>

              <strong className="price">
                ₹{unitPrice.toFixed(2)}
              </strong>

            </div>

            {/* PERIOD */}

            <div className="section-title">
              <FaCalendarAlt />
              Subscription Period
            </div>

            <div className="two-col">

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
                  Subscription Duration
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

            <div className="section-title">
              Daily Quantity
            </div>

            <div className="quantity-box">

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

            <div className="section-title">
              Delivery Frequency
            </div>

            <div className="options">

              {[
                "Daily",
                "Weekly",
                "Monthly",
              ].map(
                (option) => (
                  <button
                    key={option}
                    type="button"
                    className={
                      form.frequency ===
                      option
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      updateForm(
                        "frequency",
                        option
                      )
                    }
                  >
                    {option}
                  </button>
                )
              )}

            </div>

            {/* DELIVERY SLOT */}

            <div className="section-title">
              Delivery Slot
            </div>

            <div className="options">

              {[
                "Morning",
                "Evening",
              ].map(
                (option) => (
                  <button
                    key={option}
                    type="button"
                    className={
                      form.deliverySlot ===
                      option
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      updateForm(
                        "deliverySlot",
                        option
                      )
                    }
                  >
                    {option ===
                    "Morning"
                      ? "🌅 "
                      : "🌆 "}
                    {option}
                  </button>
                )
              )}

            </div>

            {/* ADDRESS */}

            <div className="section-title">
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

            <div className="two-col">

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
                  maxLength="6"
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

              <div className="payment-icon">
                <FaCreditCard />
              </div>

              <div>
                <strong>
                  Secure Online Payment
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
                {totalAmount.toFixed(
                  2
                )}
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

.subscribe-page {
  min-height: 80vh;
  background: #f5f8f5;
  padding: 20px 10px 40px;
  color: #17351f;
}

.subscribe-container {
  width: 100%;
  max-width: 560px;
  margin: auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.back-btn {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 9px;
  background: #e7f5eb;
  color: #198754;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.page-header span {
  color: #198754;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: .8px;
}

.page-header h1 {
  margin: 2px 0;
  font-size: 21px;
  font-weight: 800;
}

.page-header p {
  margin: 0;
  color: #758078;
  font-size: 10px;
}

.subscribe-card {
  background: #fff;
  border-radius: 15px;
  padding: 14px;
  box-shadow: 0 5px 22px rgba(20,60,35,.07);
}

.product-row {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px;
  background: #f2f8f3;
  border-radius: 11px;
}

.product-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #fff;
  display: grid;
  place-items: center;
  font-size: 22px;
}

.product-info {
  flex: 1;
}

.product-info strong,
.product-info small {
  display: block;
}

.product-info strong {
  font-size: 12px;
}

.product-info small {
  font-size: 9px;
  color: #748078;
}

.price {
  color: #198754;
  font-size: 13px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 13px 0 6px;
  font-size: 10px;
  font-weight: 800;
}

.section-title svg {
  color: #198754;
  font-size: 10px;
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
}

.two-col label {
  display: block;
  font-size: 8px;
  color: #68766d;
  margin-bottom: 4px;
}

input,
textarea {
  width: 100%;
  border: 1px solid #dce7df;
  background: #fbfdfb;
  border-radius: 8px;
  padding: 8px;
  outline: none;
  font-size: 11px;
}

input {
  height: 36px;
}

textarea {
  height: 58px;
  resize: vertical;
}

input:focus,
textarea:focus {
  border-color: #198754;
}

.duration {
  margin-top: 7px;
  padding: 7px 9px;
  border-radius: 8px;
  background: #eaf7ee;
  display: flex;
  justify-content: space-between;
  font-size: 9px;
}

.duration strong {
  color: #198754;
}

.quantity-box {
  height: 36px;
  border: 1px solid #dce7df;
  border-radius: 8px;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.quantity-box button {
  width: 40px;
  height: 36px;
  border: 0;
  background: #f0f6f2;
  color: #198754;
  font-size: 18px;
  cursor: pointer;
}

.quantity-box strong {
  flex: 1;
  text-align: center;
  font-size: 12px;
}

.quantity-box span {
  padding-right: 8px;
  color: #718078;
  font-size: 9px;
}

.options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 7px;
}

.options button {
  border: 1px solid #dce7df;
  background: #fff;
  border-radius: 8px;
  padding: 8px 4px;
  font-size: 9px;
  cursor: pointer;
}

.options button.selected {
  border-color: #198754;
  background: #eef9f2;
  color: #198754;
  font-weight: 800;
}

.payment-box {
  margin-top: 13px;
  padding: 9px;
  border: 1px solid #cfe5d6;
  background: #f1faf4;
  border-radius: 9px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.payment-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #198754;
  color: white;
  display: grid;
  place-items: center;
}

.payment-box > div:nth-child(2) {
  flex: 1;
}

.payment-box strong,
.payment-box small {
  display: block;
}

.payment-box strong {
  font-size: 10px;
}

.payment-box small {
  font-size: 8px;
  color: #758279;
  margin-top: 2px;
}

.payment-box > svg {
  color: #198754;
  font-size: 12px;
}

.secure {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #758279;
  font-size: 8px;
  margin-top: 6px;
}

.secure svg {
  color: #198754;
}

.total {
  margin-top: 11px;
  padding-top: 9px;
  border-top: 1px solid #edf1ee;
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
  font-size: 9px;
}

.total small {
  color: #9aa59e;
  font-size: 8px;
  margin-top: 2px;
}

.total > strong {
  color: #198754;
  font-size: 20px;
}

.pay-btn,
.primary-btn {
  width: 100%;
  min-height: 39px;
  border: 0;
  border-radius: 9px;
  margin-top: 10px;
  background: #198754;
  color: white;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.pay-btn:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.loader {
  width: 13px;
  height: 13px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.success-box,
.error-box {
  border-radius: 9px;
  padding: 9px;
  margin-bottom: 10px;
  font-size: 10px;
}

.success-box {
  display: flex;
  gap: 7px;
  background: #e7f7ed;
  color: #176b3f;
}

.success-box strong,
.success-box small {
  display: block;
}

.success-box small {
  margin-top: 2px;
  font-size: 8px;
}

.error-box {
  background: #fff0f0;
  color: #b02a37;
  border: 1px solid #f3d0d0;
}

.empty-card {
  max-width: 400px;
  margin: 60px auto;
  text-align: center;
  padding: 30px 20px;
}

.milk-icon {
  font-size: 38px;
  margin-bottom: 8px;
}

.empty-card h2 {
  margin: 0;
  font-size: 18px;
}

.empty-card p {
  color: #718078;
  font-size: 10px;
}

.primary-btn {
  max-width: 200px;
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 430px) {
  .subscribe-page {
    padding: 12px 7px 25px;
  }

  .subscribe-card {
    padding: 11px;
  }

  .page-header h1 {
    font-size: 18px;
  }
}
`;