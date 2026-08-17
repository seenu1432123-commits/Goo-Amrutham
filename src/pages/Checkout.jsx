import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaCheckCircle,
  FaArrowLeft,
  FaMoneyBillWave,
  FaCreditCard,
  FaClock,
  FaCalendarAlt,
  FaShieldAlt,
  FaShoppingBasket,
  FaTruck,
  FaLeaf,
  FaChevronRight,
} from "react-icons/fa";

import { supabase } from "../lib/supabase";
import { useApp } from "../context/AppContext";

/* =====================================================
   LOAD RAZORPAY CHECKOUT
===================================================== */

const loadRazorpay = () => {
  return new Promise((resolve) => {
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
};

/* =====================================================
   CHECKOUT
===================================================== */

export default function Checkout() {
  const navigate = useNavigate();

  const {
    currentUser,
    cartItems,
    clearCart,
  } = useApp();

  const [loading, setLoading] = useState(false);

  const [orderSuccess, setOrderSuccess] =
    useState(false);

  const [successOrderNumber, setSuccessOrderNumber] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  /* =====================================================
     FORM
  ===================================================== */

  const [form, setForm] = useState({
    name: currentUser?.name || "",
    phone: currentUser?.phone || "",
    address: currentUser?.address || "",
    city: currentUser?.city || "",
    pincode: currentUser?.pincode || "",
    notes: "",
    slot: "Morning",
    frequency: "Daily",
    paymentMethod: "razorpay",
  });

  /* =====================================================
     HANDLE FORM CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  /* =====================================================
     SELECT OPTION HELPERS
  ===================================================== */

  const selectSlot = (slot) => {
    setForm((previous) => ({
      ...previous,
      slot,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const selectFrequency = (frequency) => {
    setForm((previous) => ({
      ...previous,
      frequency,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const selectPayment = (paymentMethod) => {
    setForm((previous) => ({
      ...previous,
      paymentMethod,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  /* =====================================================
     SUBTOTAL
  ===================================================== */

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.qty || 0);

      return total + price * qty;
    }, 0);
  }, [cartItems]);

  /* =====================================================
     DELIVERY FEE

     Existing project behavior preserved:
     delivery fee = 0
  ===================================================== */

  const deliveryFee = 0;

  /* =====================================================
     TOTAL
  ===================================================== */

  const total = subtotal + deliveryFee;

  /* =====================================================
     ITEM COUNT
  ===================================================== */

  const itemCount = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.qty || 0),
      0
    );
  }, [cartItems]);

  /* =====================================================
     CHECK PRODUCT AVAILABILITY
  ===================================================== */

  const checkProductAvailability = async () => {
    if (!cartItems || cartItems.length === 0) {
      return {
        available: false,
        message: "Your cart is empty.",
      };
    }

    const itemsPayload = cartItems.map((item) => ({
      product_id: String(
        item.id || item.product_id
      ),
      qty: Number(item.qty || 1),
    }));

    const {
      data,
      error,
    } = await supabase.rpc(
      "check_order_availability",
      {
        p_items: itemsPayload,
      }
    );

    if (error) {
      console.error(
        "Product availability check error:",
        error
      );

      throw new Error(
        "Unable to check product availability. Please try again."
      );
    }

    if (
      !data?.success ||
      data?.available !== true
    ) {
      return {
        available: false,
        message:
          data?.message ||
          "A selected product is unavailable.",
      };
    }

    return {
      available: true,
      message: "",
    };
  };

  /* =====================================================
     CREATE GOO AMRUTHAM ORDER

     Used by:
     1. COD
     2. Razorpay after verification
  ===================================================== */

  const createGooOrder = async (
    user,
    paymentMethod,
    razorpayData = null
  ) => {
    const itemsPayload = cartItems.map((item) => ({
      product_id: String(
        item.id || item.product_id
      ),
      qty: Number(item.qty || 1),
    }));

    const {
      data: createdOrder,
      error: createOrderError,
    } = await supabase.rpc(
      "create_order",
      {
        p_items: itemsPayload,

        p_customer: {
          name: form.name.trim(),

          phone: form.phone.trim(),

          email: user.email || "",

          address: form.address.trim(),

          city: form.city.trim(),

          pincode: form.pincode.trim(),
        },

        p_slot: form.slot,

        p_frequency: form.frequency,

        p_instructions:
          form.notes.trim(),

        p_payment_method:
          paymentMethod,
      }
    );

    if (createOrderError) {
      console.error(
        "Create order error:",
        createOrderError
      );

      throw createOrderError;
    }

    const orderId =
      typeof createdOrder === "string"
        ? createdOrder
        : createdOrder?.id;

    const orderNumber =
      createdOrder?.order_number || "";

    if (!orderId) {
      throw new Error(
        "Order was created but the order ID could not be found."
      );
    }

    /* =================================================
       FINALIZE RAZORPAY PAYMENT
    ================================================= */

    if (
      paymentMethod === "razorpay" &&
      razorpayData
    ) {
      const {
        error: paymentFinalizeError,
      } = await supabase.rpc(
        "finalize_order_payment",
        {
          p_order_id: orderId,

          p_razorpay_order_id:
            razorpayData.razorpay_order_id,

          p_razorpay_payment_id:
            razorpayData.razorpay_payment_id,

          p_razorpay_signature:
            razorpayData.razorpay_signature,
        }
      );

      if (paymentFinalizeError) {
        console.error(
          "Payment finalization error:",
          paymentFinalizeError
        );

        throw paymentFinalizeError;
      }
    }

    return {
      id: orderId,
      orderNumber,
    };
  };

  /* =====================================================
     SEND RAZORPAY ORDER CONFIRMATION EMAIL

     Existing behavior preserved.
  ===================================================== */

  const sendOrderConfirmationEmail = async (
    user,
    createdOrder,
    razorpayData
  ) => {
    const emailItems = cartItems.map(
      (item) => {
        const quantity =
          Number(item.qty || 1);

        const unitPrice =
          Number(item.price || 0);

        return {
          name:
            item.name ||
            item.PR_NAME ||
            "Milk Product",

          unit:
            item.unit ||
            item.Quantity ||
            item.quantity ||
            "",

          quantity,

          unit_price: unitPrice,

          line_total:
            unitPrice * quantity,
        };
      }
    );

    const emailOrder = {
      order_number:
        createdOrder.orderNumber ||
        "GAM-ORDER",

      customer_name:
        form.name.trim(),

      customer_email:
        user.email || "",

      address:
        form.address.trim(),

      city:
        form.city.trim(),

      pincode:
        form.pincode.trim(),

      slot:
        form.slot,

      frequency:
        form.frequency,

      instructions:
        form.notes.trim(),

      subtotal,

      delivery_fee:
        deliveryFee,

      total,

      payment_method:
        "razorpay",

      payment_status:
        "Paid",

      razorpay_order_id:
        razorpayData?.razorpay_order_id ||
        "",

      razorpay_payment_id:
        razorpayData?.razorpay_payment_id ||
        "",

      items:
        emailItems,
    };

    const {
      data,
      error,
    } =
      await supabase.functions.invoke(
        "send-order-email",
        {
          body: {
            order: emailOrder,
          },
        }
      );

    if (error) {
      console.error(
        "Order confirmation email error:",
        error
      );

      throw new Error(
        error.message ||
          "Order was placed, but the confirmation email could not be sent."
      );
    }

    if (!data?.success) {
      console.error(
        "Email function error:",
        data
      );

      throw new Error(
        data?.error ||
          "Order was placed, but the confirmation email could not be sent."
      );
    }

    return data;
  };

  /* =====================================================
     COMPLETE SUCCESS
  ===================================================== */

  const completeOrderSuccess = (
    orderNumber
  ) => {
    clearCart();

    setSuccessOrderNumber(
      orderNumber ||
        "Order Placed"
    );

    setOrderSuccess(true);

    setLoading(false);

    setTimeout(() => {
      navigate("/orders");

      setTimeout(() => {
        window.location.reload();
      }, 300);
    }, 2500);
  };

  /* =====================================================
     PLACE ORDER
  ===================================================== */

  const placeOrder = async (e) => {
    e.preventDefault();

    setErrorMessage("");

    /* LOGIN CHECK */

    if (!currentUser) {
      navigate("/login");
      return;
    }

    /* CART CHECK */

    if (
      !cartItems ||
      cartItems.length === 0
    ) {
      navigate("/products");
      return;
    }

    /* FORM VALIDATION */

    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.pincode.trim()
    ) {
      setErrorMessage(
        "Please fill in all required delivery details."
      );

      return;
    }

    /* PAYMENT VALIDATION */

    if (
      ![
        "razorpay",
        "cod",
      ].includes(
        form.paymentMethod
      )
    ) {
      setErrorMessage(
        "Please select a valid payment method."
      );

      return;
    }

    try {
      setLoading(true);

      /* =================================================
         CHECK PRODUCT AVAILABILITY
      ================================================= */

      const availability =
        await checkProductAvailability();

      if (
        !availability.available
      ) {
        setErrorMessage(
          availability.message
        );

        setLoading(false);

        return;
      }

      /* =================================================
         GET SUPABASE USER
      ================================================= */

      const {
        data: {
          user,
        },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (
        userError ||
        !user
      ) {
        navigate("/login");

        setLoading(false);

        return;
      }

      /* =================================================
         CASH ON DELIVERY

         Razorpay is NOT loaded for COD.
      ================================================= */

      if (
        form.paymentMethod ===
        "cod"
      ) {
        try {
          const created =
            await createGooOrder(
              user,
              "cod"
            );

          completeOrderSuccess(
            created.orderNumber
          );

          return;
        } catch (codError) {
          console.error(
            "COD order error:",
            codError
          );

          throw codError;
        }
      }

      /* =================================================
         ONLINE PAYMENT
      ================================================= */

      const razorpayLoaded =
        await loadRazorpay();

      if (!razorpayLoaded) {
        throw new Error(
          "Unable to load Razorpay. Please check your internet connection and try again."
        );
      }

      /* =================================================
         CREATE RAZORPAY ORDER
      ================================================= */

      const {
        data: razorpayOrder,
        error:
          razorpayOrderError,
      } =
        await supabase.functions.invoke(
          "create-razorpay-order",
          {
            body: {
              amount:
                Number(
                  total.toFixed(2)
                ),

              receipt:
                `GAM-${Date.now()}`,
            },
          }
        );

      if (razorpayOrderError) {
        console.error(
          "Razorpay order error:",
          razorpayOrderError
        );

        throw new Error(
          razorpayOrderError.message ||
            "Unable to create payment order."
        );
      }

      if (
        !razorpayOrder?.success ||
        !razorpayOrder?.order_id
      ) {
        throw new Error(
          razorpayOrder?.error ||
            "Unable to create Razorpay order."
        );
      }

      /* =================================================
         RAZORPAY OPTIONS
      ================================================= */

      const options = {
        key:
          razorpayOrder.key_id,

        amount:
          razorpayOrder.amount,

        currency:
          razorpayOrder.currency ||
          "INR",

        name:
          "Goo Amrutham Milk",

        description:
          "Fresh Natural Milk Order",

        order_id:
          razorpayOrder.order_id,

        prefill: {
          name:
            form.name.trim(),

          email:
            user.email || "",

          contact:
            form.phone.trim(),
        },

        notes: {
          address:
            form.address.trim(),

          city:
            form.city.trim(),

          pincode:
            form.pincode.trim(),
        },

        theme: {
          color:
            "#198754",
        },

        modal: {
          ondismiss: () => {
            setLoading(false);

            setErrorMessage(
              "Payment was cancelled. Your order has not been placed."
            );
          },
        },

        /* =================================================
           RAZORPAY SUCCESS
        ================================================= */

        handler:
          async function (
            response
          ) {
            try {
              setLoading(true);

              setErrorMessage("");

              /* VERIFY PAYMENT */

              const {
                data:
                  verification,
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

              if (
                verificationError
              ) {
                console.error(
                  "Payment verification error:",
                  verificationError
                );

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

              /* CREATE + FINALIZE ORDER */

              const created =
                await createGooOrder(
                  user,
                  "razorpay",
                  response
                );

              /* SEND EMAIL */

              await sendOrderConfirmationEmail(
                user,
                created,
                response
              );

              /* SUCCESS */

              completeOrderSuccess(
                created.orderNumber ||
                  response.razorpay_order_id
              );
            } catch (error) {
              console.error(
                "Payment completion error:",
                error
              );

              setErrorMessage(
                error?.message ||
                  "Payment was successful, but we could not complete your order. Please contact Goo Amrutham support."
              );

              setLoading(false);
            }
          },
      };

      /* =================================================
         CREATE RAZORPAY INSTANCE
      ================================================= */

      const razorpay =
        new window.Razorpay(
          options
        );

      /* PAYMENT FAILED */

      razorpay.on(
        "payment.failed",
        function (
          response
        ) {
          console.error(
            "Razorpay payment failed:",
            response
          );

          setLoading(false);

          setErrorMessage(
            response?.error
              ?.description ||
              "Payment failed. Your order has not been placed."
          );
        }
      );

      /* OPEN PAYMENT */

      razorpay.open();
    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to place your order. Please try again."
      );

      setLoading(false);
    }
  };

  /* =====================================================
     NOT LOGGED IN
  ===================================================== */

  if (!currentUser) {
    return (
      <>
        <style>{checkoutStyles}</style>

        <div className="goo-checkout-page">
          <div className="goo-simple-state">
            <div className="goo-state-icon">
              <FaUser />
            </div>

            <h2>Please Login</h2>

            <p>
              Login to place your
              Goo Amrutham Milk order.
            </p>

            <button
              type="button"
              className="goo-primary-btn"
              onClick={() =>
                navigate("/login")
              }
            >
              Login
              <FaChevronRight />
            </button>
          </div>
        </div>
      </>
    );
  }

  /* =====================================================
     EMPTY CART
  ===================================================== */

  if (
    !cartItems ||
    cartItems.length === 0
  ) {
    return (
      <>
        <style>{checkoutStyles}</style>

        <div className="goo-checkout-page">
          <div className="goo-simple-state">
            <div className="goo-state-icon">
              <FaShoppingBasket />
            </div>

            <h2>Your Cart is Empty</h2>

            <p>
              Add some fresh Goo Amrutham
              Milk products first.
            </p>

            <button
              type="button"
              className="goo-primary-btn"
              onClick={() =>
                navigate("/products")
              }
            >
              Browse Fresh Milk
              <FaChevronRight />
            </button>
          </div>
        </div>
      </>
    );
  }

  /* =====================================================
     MAIN CHECKOUT
  ===================================================== */

  return (
    <>
      <style>{checkoutStyles}</style>

      {/* =================================================
          SUCCESS OVERLAY
      ================================================= */}

      {orderSuccess && (
        <div className="goo-success-overlay">
          <div className="goo-success-card">

            <div className="goo-success-icon">
              <FaCheckCircle />
            </div>

            <span className="goo-success-label">
              GOO AMRUTHAM MILK
            </span>

            <h2>
              Order Successfully
              Placed!
            </h2>

            <p>
              Thank you for choosing
              <strong>
                {" "}
                Goo Amrutham Milk
              </strong>
              .
            </p>

            <div className="goo-order-number">
              <span>
                YOUR ORDER NUMBER
              </span>

              <strong>
                {successOrderNumber}
              </strong>
            </div>

            <div className="goo-redirect">
              <span className="goo-spinner" />

              Taking you to your orders...
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          PAGE
      ================================================= */}

      <main className="goo-checkout-page">

        <div className="goo-checkout-container">

          {/* HEADER */}

          <div className="goo-checkout-header">

            <button
              type="button"
              className="goo-back-btn"
              onClick={() =>
                navigate("/cart")
              }
            >
              <FaArrowLeft />
              <span>Back to Cart</span>
            </button>

            <div className="goo-header-title">
              <span>CHECKOUT</span>

              <h1>
                Complete your order
              </h1>

              <p>
                Fresh goodness is just
                a few steps away.
              </p>
            </div>

            <div className="goo-header-badge">
              <FaLeaf />
              Fresh & Natural
            </div>

          </div>


          {/* ERROR */}

          {errorMessage && (
            <div className="goo-error">
              <span>!</span>

              <div>
                <strong>
                  We couldn't complete
                  your request
                </strong>

                <p>
                  {errorMessage}
                </p>
              </div>
            </div>
          )}


          <form
            onSubmit={placeOrder}
            className="goo-checkout-grid"
          >

            {/* =================================================
                LEFT COLUMN
            ================================================= */}

            <div className="goo-main-column">

              {/* DELIVERY DETAILS */}

              <section className="goo-panel">

                <div className="goo-panel-heading">

                  <div className="goo-step">
                    01
                  </div>

                  <div>
                    <span>
                      DELIVERY
                    </span>

                    <h2>
                      Where should we
                      deliver?
                    </h2>
                  </div>

                </div>


                <div className="goo-form-grid">

                  {/* NAME */}

                  <div className="goo-field full">

                    <label>
                      <FaUser />
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  {/* PHONE */}

                  <div className="goo-field full">

                    <label>
                      <FaPhone />
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  {/* ADDRESS */}

                  <div className="goo-field full">

                    <label>
                      <FaMapMarkerAlt />
                      Delivery Address
                    </label>

                    <textarea
                      name="address"
                      rows="3"
                      placeholder="House number, street, area..."
                      value={form.address}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  {/* CITY */}

                  <div className="goo-field">

                    <label>
                      City
                    </label>

                    <input
                      type="text"
                      name="city"
                      placeholder="Your city"
                      value={form.city}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  {/* PINCODE */}

                  <div className="goo-field">

                    <label>
                      PIN Code
                    </label>

                    <input
                      type="text"
                      name="pincode"
                      placeholder="6 digit PIN"
                      maxLength="6"
                      value={form.pincode}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  {/* NOTES */}

                  <div className="goo-field full">

                    <label>
                      Delivery Instructions
                      <span>
                        Optional
                      </span>
                    </label>

                    <textarea
                      name="notes"
                      rows="2"
                      placeholder="Example: Leave the bottle near the gate."
                      value={form.notes}
                      onChange={handleChange}
                    />

                  </div>

                </div>

              </section>


              {/* DELIVERY PREFERENCE */}

              <section className="goo-panel">

                <div className="goo-panel-heading">

                  <div className="goo-step">
                    02
                  </div>

                  <div>
                    <span>
                      DELIVERY PREFERENCE
                    </span>

                    <h2>
                      Choose your routine
                    </h2>
                  </div>

                </div>


                {/* SLOT */}

                <div className="goo-option-section">

                  <label className="goo-option-title">
                    <FaClock />
                    Delivery Slot
                  </label>

                  <div className="goo-option-grid">

                    <button
                      type="button"
                      className={`goo-choice ${
                        form.slot ===
                        "Morning"
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        selectSlot(
                          "Morning"
                        )
                      }
                    >
                      <div className="goo-choice-icon">
                        🌅
                      </div>

                      <div>
                        <strong>
                          Morning
                        </strong>

                        <small>
                          Fresh milk to start
                          your day
                        </small>
                      </div>

                      {form.slot ===
                        "Morning" && (
                        <FaCheckCircle className="goo-choice-check" />
                      )}
                    </button>


                    <button
                      type="button"
                      className={`goo-choice ${
                        form.slot ===
                        "Evening"
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        selectSlot(
                          "Evening"
                        )
                      }
                    >
                      <div className="goo-choice-icon">
                        🌆
                      </div>

                      <div>
                        <strong>
                          Evening
                        </strong>

                        <small>
                          Convenient evening
                          delivery
                        </small>
                      </div>

                      {form.slot ===
                        "Evening" && (
                        <FaCheckCircle className="goo-choice-check" />
                      )}
                    </button>

                  </div>

                </div>


                {/* FREQUENCY */}

                <div className="goo-option-section">

                  <label className="goo-option-title">
                    <FaCalendarAlt />
                    Delivery Frequency
                  </label>

                  <div className="goo-frequency-grid">

                    {[
                      {
                        value:
                          "Daily",
                        title:
                          "Daily",
                        text:
                          "Every day",
                        icon:
                          "🥛",
                      },
                      {
                        value:
                          "Weekly",
                        title:
                          "Weekly",
                        text:
                          "Every week",
                        icon:
                          "📅",
                      },
                      {
                        value:
                          "One Time",
                        title:
                          "One Time",
                        text:
                          "Single order",
                        icon:
                          "🛒",
                      },
                    ].map(
                      (option) => (
                        <button
                          type="button"
                          key={
                            option.value
                          }
                          className={`goo-frequency ${
                            form.frequency ===
                            option.value
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            selectFrequency(
                              option.value
                            )
                          }
                        >
                          <span>
                            {
                              option.icon
                            }
                          </span>

                          <strong>
                            {
                              option.title
                            }
                          </strong>

                          <small>
                            {
                              option.text
                            }
                          </small>

                          {form.frequency ===
                            option.value && (
                            <FaCheckCircle />
                          )}
                        </button>
                      )
                    )}

                  </div>

                </div>

              </section>


              {/* PAYMENT */}

              <section className="goo-panel">

                <div className="goo-panel-heading">

                  <div className="goo-step">
                    03
                  </div>

                  <div>
                    <span>
                      PAYMENT
                    </span>

                    <h2>
                      How would you like
                      to pay?
                    </h2>
                  </div>

                </div>


                <div className="goo-payment-grid">

                  {/* RAZORPAY */}

                  <button
                    type="button"
                    className={`goo-payment-card ${
                      form.paymentMethod ===
                      "razorpay"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      selectPayment(
                        "razorpay"
                      )
                    }
                  >

                    <div className="goo-payment-icon online">
                      <FaCreditCard />
                    </div>

                    <div className="goo-payment-content">

                      <strong>
                        Online Payment
                      </strong>

                      <span>
                        UPI, cards & net banking
                      </span>

                    </div>

                    <div className="goo-radio">
                      {form.paymentMethod ===
                        "razorpay" && (
                        <span />
                      )}
                    </div>

                  </button>


                  {/* COD */}

                  <button
                    type="button"
                    className={`goo-payment-card ${
                      form.paymentMethod ===
                      "cod"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      selectPayment(
                        "cod"
                      )
                    }
                  >

                    <div className="goo-payment-icon cash">
                      <FaMoneyBillWave />
                    </div>

                    <div className="goo-payment-content">

                      <strong>
                        Cash on Delivery
                      </strong>

                      <span>
                        Pay when your milk arrives
                      </span>

                    </div>

                    <div className="goo-radio">
                      {form.paymentMethod ===
                        "cod" && (
                        <span />
                      )}
                    </div>

                  </button>

                </div>


                <div className="goo-security-note">

                  <FaShieldAlt />

                  <span>
                    {form.paymentMethod ===
                    "cod"
                      ? "Pay safely in cash when your fresh milk is delivered."
                      : "Secure payment powered by Razorpay. Your payment details are protected."}
                  </span>

                </div>

              </section>

            </div>


            {/* =================================================
                RIGHT COLUMN
            ================================================= */}

            <aside className="goo-summary-column">

              <div className="goo-summary">

                {/* SUMMARY HEADER */}

                <div className="goo-summary-header">

                  <div>
                    <span>
                      YOUR CART
                    </span>

                    <h2>
                      Order Summary
                    </h2>
                  </div>

                  <div className="goo-cart-count">
                    {itemCount}
                  </div>

                </div>


                {/* ITEMS */}

                <div className="goo-summary-items">

                  {cartItems.map(
                    (item, index) => {
                      const quantity =
                        Number(
                          item.qty || 1
                        );

                      const price =
                        Number(
                          item.price || 0
                        );

                      const lineTotal =
                        price *
                        quantity;

                      return (
                        <div
                          className="goo-summary-item"
                          key={
                            item.id ||
                            item.product_id ||
                            index
                          }
                        >

                          <div className="goo-product-placeholder">
                            🥛
                          </div>

                          <div className="goo-summary-product">

                            <strong>
                              {item.name ||
                                "Milk Product"}
                            </strong>

                            <span>
                              {quantity} × ₹
                              {price.toFixed(
                                2
                              )}
                            </span>

                          </div>

                          <strong className="goo-line-price">
                            ₹
                            {lineTotal.toFixed(
                              2
                            )}
                          </strong>

                        </div>
                      );
                    }
                  )}

                </div>


                {/* PRICE BREAKDOWN */}

                <div className="goo-price-box">

                  <div>
                    <span>
                      Subtotal
                    </span>

                    <strong>
                      ₹
                      {subtotal.toFixed(
                        2
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Delivery
                    </span>

                    <strong className="free">
                      {deliveryFee ===
                      0
                        ? "FREE"
                        : `₹${deliveryFee.toFixed(
                            2
                          )}`}
                    </strong>
                  </div>

                </div>


                {/* TOTAL */}

                <div className="goo-total-row">

                  <div>
                    <span>
                      TOTAL
                    </span>

                    <small>
                      Inclusive of delivery
                    </small>
                  </div>

                  <strong>
                    ₹
                    {total.toFixed(
                      2
                    )}
                  </strong>

                </div>


                {/* SELECTED DELIVERY */}

                <div className="goo-selected-box">

                  <div className="goo-mini-icon">
                    <FaTruck />
                  </div>

                  <div>

                    <span>
                      DELIVERY
                    </span>

                    <strong>
                      {form.slot}
                    </strong>

                    <small>
                      {form.frequency}
                    </small>

                  </div>

                </div>


                {/* SELECTED PAYMENT */}

                <div className="goo-selected-payment">

                  {form.paymentMethod ===
                  "cod" ? (
                    <FaMoneyBillWave />
                  ) : (
                    <FaCreditCard />
                  )}

                  <div>

                    <span>
                      PAYMENT
                    </span>

                    <strong>
                      {form.paymentMethod ===
                      "cod"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </strong>

                  </div>

                </div>


                {/* PLACE ORDER */}

                <button
                  type="submit"
                  className="goo-place-order"
                  disabled={loading}
                >

                  {loading ? (
                    <>
                      <span className="goo-button-spinner" />

                      {form.paymentMethod ===
                      "cod"
                        ? "Placing Order..."
                        : "Starting Secure Payment..."}
                    </>
                  ) : (
                    <>
                      <span>
                        {form.paymentMethod ===
                        "cod"
                          ? "PLACE ORDER"
                          : "PAY SECURELY"}
                      </span>

                      <strong>
                        ₹
                        {total.toFixed(
                          2
                        )}
                      </strong>
                    </>
                  )}

                </button>


                {/* TRUST */}

                <div className="goo-summary-trust">

                  <div>
                    <FaShieldAlt />

                    <span>
                      Secure checkout
                    </span>
                  </div>

                  <div>
                    <FaLeaf />

                    <span>
                      Fresh & natural
                    </span>
                  </div>

                </div>

              </div>

            </aside>

          </form>

        </div>

      </main>
    </>
  );
}


/* =====================================================
   CHECKOUT STYLES
===================================================== */

const checkoutStyles = `

/* =====================================================
   ROOT
===================================================== */

.goo-checkout-page {
  min-height: 100vh;
  background:
    linear-gradient(
      180deg,
      #f8faf6 0%,
      #ffffff 55%,
      #f7faf5 100%
    );

  color: #173b24;

  padding: 28px 0 70px;
}

.goo-checkout-container {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
}


/* =====================================================
   HEADER
===================================================== */

.goo-checkout-header {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 30px;
}

.goo-back-btn {
  border: 0;
  background: transparent;

  display: inline-flex;
  align-items: center;
  gap: 9px;

  color: #198754;

  font-weight: 700;

  cursor: pointer;

  padding: 8px 0;

  transition:
    transform .2s ease,
    color .2s ease;
}

.goo-back-btn:hover {
  color: #116c43;
  transform: translateX(-3px);
}

.goo-header-title {
  text-align: center;
}

.goo-header-title > span {
  display: block;

  color: #198754;

  font-size: 11px;

  font-weight: 800;

  letter-spacing: 2.5px;

  margin-bottom: 5px;
}

.goo-header-title h1 {
  margin: 0;

  color: #173b24;

  font-size: clamp(27px, 3vw, 38px);

  font-weight: 800;

  letter-spacing: -1px;
}

.goo-header-title p {
  margin: 6px 0 0;

  color: #718078;

  font-size: 14px;
}

.goo-header-badge {
  display: inline-flex;

  align-items: center;

  gap: 8px;

  padding: 10px 15px;

  background: #edf7ef;

  border: 1px solid #d6eadb;

  border-radius: 999px;

  color: #198754;

  font-size: 12px;

  font-weight: 700;
}

.goo-header-badge svg {
  font-size: 13px;
}


/* =====================================================
   ERROR
===================================================== */

.goo-error {
  display: flex;

  align-items: flex-start;

  gap: 13px;

  background: #fff3f2;

  border: 1px solid #f3cdca;

  color: #8b3029;

  border-radius: 16px;

  padding: 15px 18px;

  margin-bottom: 22px;
}

.goo-error > span {
  width: 25px;
  height: 25px;

  flex: 0 0 25px;

  display: flex;

  align-items: center;
  justify-content: center;

  background: #c94a40;

  color: white;

  border-radius: 50%;

  font-weight: 800;
}

.goo-error strong {
  display: block;

  font-size: 14px;

  margin-bottom: 2px;
}

.goo-error p {
  margin: 0;

  font-size: 13px;
}


/* =====================================================
   GRID
===================================================== */

.goo-checkout-grid {
  display: grid;

  grid-template-columns:
    minmax(0, 1.55fr)
    minmax(330px, .9fr);

  gap: 24px;

  align-items: start;
}

.goo-main-column {
  display: flex;

  flex-direction: column;

  gap: 20px;
}


/* =====================================================
   PANELS
===================================================== */

.goo-panel {
  background: #ffffff;

  border: 1px solid #e5ebe6;

  border-radius: 22px;

  padding: 28px;

  box-shadow:
    0 8px 30px rgba(23, 59, 36, .055);
}

.goo-panel-heading {
  display: flex;

  align-items: flex-start;

  gap: 15px;

  margin-bottom: 26px;
}

.goo-step {
  width: 39px;
  height: 39px;

  flex: 0 0 39px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 12px;

  background: #eaf5ed;

  color: #198754;

  font-size: 12px;

  font-weight: 900;

  letter-spacing: .5px;
}

.goo-panel-heading > div:last-child > span {
  display: block;

  color: #198754;

  font-size: 10px;

  font-weight: 800;

  letter-spacing: 1.8px;

  margin-bottom: 3px;
}

.goo-panel-heading h2 {
  margin: 0;

  color: #173b24;

  font-size: 21px;

  font-weight: 800;
}


/* =====================================================
   FORM
===================================================== */

.goo-form-grid {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 18px;
}

.goo-field {
  min-width: 0;
}

.goo-field.full {
  grid-column: 1 / -1;
}

.goo-field label {
  display: flex;

  align-items: center;

  gap: 7px;

  margin-bottom: 8px;

  color: #34473b;

  font-size: 13px;

  font-weight: 700;
}

.goo-field label svg {
  color: #198754;

  font-size: 12px;
}

.goo-field label span {
  margin-left: auto;

  color: #a0aaa4;

  font-size: 10px;

  font-weight: 600;
}

.goo-field input,
.goo-field textarea {
  width: 100%;

  border: 1px solid #dce4de;

  background: #fbfcfb;

  border-radius: 12px;

  padding: 13px 14px;

  outline: none;

  color: #173b24;

  font-family: inherit;

  font-size: 14px;

  transition:
    border-color .2s ease,
    box-shadow .2s ease,
    background .2s ease;
}

.goo-field input {
  height: 48px;
}

.goo-field textarea {
  resize: vertical;

  min-height: 78px;
}

.goo-field input::placeholder,
.goo-field textarea::placeholder {
  color: #a4aea7;
}

.goo-field input:focus,
.goo-field textarea:focus {
  border-color: #198754;

  background: #ffffff;

  box-shadow:
    0 0 0 4px rgba(25, 135, 84, .08);
}


/* =====================================================
   DELIVERY OPTIONS
===================================================== */

.goo-option-section {
  margin-bottom: 25px;
}

.goo-option-section:last-child {
  margin-bottom: 0;
}

.goo-option-title {
  display: flex;

  align-items: center;

  gap: 8px;

  color: #34473b;

  font-size: 13px;

  font-weight: 800;

  margin-bottom: 11px;
}

.goo-option-title svg {
  color: #198754;
}

.goo-option-grid {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 12px;
}

.goo-choice {
  position: relative;

  display: flex;

  align-items: center;

  gap: 12px;

  width: 100%;

  text-align: left;

  border: 1px solid #dfe7e1;

  background: #ffffff;

  border-radius: 15px;

  padding: 14px;

  cursor: pointer;

  color: #173b24;

  transition:
    border-color .2s ease,
    background .2s ease,
    transform .2s ease,
    box-shadow .2s ease;
}

.goo-choice:hover {
  transform: translateY(-1px);

  border-color: #9cc9aa;

  box-shadow:
    0 5px 16px rgba(23, 59, 36, .06);
}

.goo-choice.selected {
  border-color: #198754;

  background: #f1f9f3;

  box-shadow:
    0 0 0 2px rgba(25, 135, 84, .07);
}

.goo-choice-icon {
  width: 43px;
  height: 43px;

  flex: 0 0 43px;

  display: flex;

  align-items: center;
  justify-content: center;

  background: #f3f7f3;

  border-radius: 12px;

  font-size: 21px;
}

.goo-choice strong {
  display: block;

  font-size: 14px;

  margin-bottom: 3px;
}

.goo-choice small {
  display: block;

  color: #7b8880;

  font-size: 11px;

  line-height: 1.4;
}

.goo-choice-check {
  position: absolute;

  right: 13px;

  top: 13px;

  color: #198754;

  font-size: 15px;
}


/* =====================================================
   FREQUENCY
===================================================== */

.goo-frequency-grid {
  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 10px;
}

.goo-frequency {
  position: relative;

  border: 1px solid #dfe7e1;

  background: white;

  border-radius: 15px;

  padding: 15px 10px;

  cursor: pointer;

  text-align: center;

  color: #173b24;

  transition:
    border-color .2s ease,
    background .2s ease,
    transform .2s ease;
}

.goo-frequency:hover {
  transform: translateY(-1px);

  border-color: #9cc9aa;
}

.goo-frequency.selected {
  border-color: #198754;

  background: #f1f9f3;
}

.goo-frequency > span {
  display: block;

  font-size: 22px;

  margin-bottom: 7px;
}

.goo-frequency strong {
  display: block;

  font-size: 13px;

  margin-bottom: 3px;
}

.goo-frequency small {
  display: block;

  color: #7b8880;

  font-size: 10px;
}

.goo-frequency > svg {
  position: absolute;

  top: 9px;
  right: 9px;

  color: #198754;

  font-size: 13px;
}


/* =====================================================
   PAYMENT
===================================================== */

.goo-payment-grid {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 12px;
}

.goo-payment-card {
  position: relative;

  display: flex;

  align-items: center;

  gap: 13px;

  width: 100%;

  border: 1px solid #dfe7e1;

  background: #ffffff;

  border-radius: 16px;

  padding: 16px;

  text-align: left;

  cursor: pointer;

  color: #173b24;

  transition:
    border-color .2s ease,
    background .2s ease,
    box-shadow .2s ease;
}

.goo-payment-card:hover {
  border-color: #9cc9aa;
}

.goo-payment-card.selected {
  border-color: #198754;

  background: #f1f9f3;

  box-shadow:
    0 0 0 2px rgba(25, 135, 84, .07);
}

.goo-payment-icon {
  width: 43px;
  height: 43px;

  flex: 0 0 43px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 12px;

  font-size: 17px;
}

.goo-payment-icon.online {
  background: #eaf5ed;

  color: #198754;
}

.goo-payment-icon.cash {
  background: #fff4df;

  color: #b77b19;
}

.goo-payment-content {
  min-width: 0;
}

.goo-payment-content strong {
  display: block;

  font-size: 13px;

  margin-bottom: 3px;
}

.goo-payment-content span {
  display: block;

  color: #7b8880;

  font-size: 10px;

  line-height: 1.4;
}

.goo-radio {
  width: 19px;
  height: 19px;

  flex: 0 0 19px;

  margin-left: auto;

  border: 1.5px solid #c7d2ca;

  border-radius: 50%;

  display: flex;

  align-items: center;
  justify-content: center;
}

.goo-payment-card.selected .goo-radio {
  border-color: #198754;
}

.goo-radio span {
  width: 9px;
  height: 9px;

  border-radius: 50%;

  background: #198754;
}

.goo-security-note {
  display: flex;

  align-items: center;

  gap: 9px;

  margin-top: 15px;

  padding: 11px 13px;

  background: #f7faf7;

  border-radius: 10px;

  color: #68766d;

  font-size: 11px;

  line-height: 1.5;
}

.goo-security-note svg {
  color: #198754;

  flex: 0 0 auto;
}


/* =====================================================
   SUMMARY
===================================================== */

.goo-summary-column {
  position: sticky;

  top: 90px;
}

.goo-summary {
  overflow: hidden;

  background: #ffffff;

  border: 1px solid #dfe8e1;

  border-radius: 22px;

  box-shadow:
    0 12px 35px rgba(23, 59, 36, .08);
}

.goo-summary-header {
  display: flex;

  align-items: center;

  justify-content: space-between;

  padding: 23px 23px 18px;

  border-bottom: 1px solid #edf1ee;
}

.goo-summary-header > div:first-child > span {
  display: block;

  color: #198754;

  font-size: 9px;

  font-weight: 900;

  letter-spacing: 1.8px;

  margin-bottom: 4px;
}

.goo-summary-header h2 {
  margin: 0;

  color: #173b24;

  font-size: 21px;

  font-weight: 800;
}

.goo-cart-count {
  width: 34px;
  height: 34px;

  display: flex;

  align-items: center;
  justify-content: center;

  background: #eaf5ed;

  color: #198754;

  border-radius: 10px;

  font-size: 12px;

  font-weight: 800;
}


/* =====================================================
   SUMMARY ITEMS
===================================================== */

.goo-summary-items {
  padding: 5px 23px 4px;
}

.goo-summary-item {
  display: flex;

  align-items: center;

  gap: 11px;

  padding: 13px 0;

  border-bottom: 1px dashed #e3e9e4;
}

.goo-summary-item:last-child {
  border-bottom: 0;
}

.goo-product-placeholder {
  width: 47px;
  height: 47px;

  flex: 0 0 47px;

  display: flex;

  align-items: center;
  justify-content: center;

  background: #f3f7f3;

  border-radius: 12px;

  font-size: 23px;
}

.goo-summary-product {
  min-width: 0;

  flex: 1;
}

.goo-summary-product strong {
  display: block;

  color: #263b2d;

  font-size: 12px;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;

  margin-bottom: 4px;
}

.goo-summary-product span {
  color: #8a958e;

  font-size: 10px;
}

.goo-line-price {
  color: #263b2d;

  font-size: 12px;

  white-space: nowrap;
}


/* =====================================================
   PRICE
===================================================== */

.goo-price-box {
  margin: 5px 23px 0;

  padding: 14px 0;

  border-top: 1px solid #edf1ee;

  border-bottom: 1px solid #edf1ee;
}

.goo-price-box > div {
  display: flex;

  align-items: center;

  justify-content: space-between;

  margin: 7px 0;
}

.goo-price-box span {
  color: #7c8980;

  font-size: 12px;
}

.goo-price-box strong {
  color: #34473b;

  font-size: 12px;
}

.goo-price-box .free {
  color: #198754;
}


/* =====================================================
   TOTAL
===================================================== */

.goo-total-row {
  display: flex;

  align-items: center;

  justify-content: space-between;

  padding: 18px 23px;
}

.goo-total-row span {
  display: block;

  color: #173b24;

  font-size: 14px;

  font-weight: 900;

  letter-spacing: .4px;
}

.goo-total-row small {
  display: block;

  margin-top: 3px;

  color: #8a958e;

  font-size: 9px;
}

.goo-total-row > strong {
  color: #198754;

  font-size: 25px;

  font-weight: 900;
}


/* =====================================================
   SELECTED DELIVERY
===================================================== */

.goo-selected-box {
  display: flex;

  align-items: center;

  gap: 11px;

  margin: 0 23px 9px;

  padding: 12px;

  background: #f6faf6;

  border: 1px solid #e2eee4;

  border-radius: 13px;
}

.goo-mini-icon {
  width: 36px;
  height: 36px;

  display: flex;

  align-items: center;
  justify-content: center;

  background: #eaf5ed;

  color: #198754;

  border-radius: 10px;
}

.goo-selected-box span,
.goo-selected-payment span {
  display: block;

  color: #8a958e;

  font-size: 8px;

  font-weight: 800;

  letter-spacing: 1.2px;

  margin-bottom: 2px;
}

.goo-selected-box strong {
  display: inline-block;

  color: #263b2d;

  font-size: 11px;

  margin-right: 6px;
}

.goo-selected-box small {
  color: #7c8980;

  font-size: 10px;
}


/* =====================================================
   SELECTED PAYMENT
===================================================== */

.goo-selected-payment {
  display: flex;

  align-items: center;

  gap: 11px;

  margin: 0 23px 15px;

  padding: 7px 0;

  color: #198754;
}

.goo-selected-payment > svg {
  font-size: 18px;
}

.goo-selected-payment strong {
  color: #34473b;

  font-size: 11px;
}


/* =====================================================
   PLACE ORDER
===================================================== */

.goo-place-order {
  width: calc(100% - 46px);

  margin: 0 23px;

  min-height: 56px;

  border: 0;

  border-radius: 15px;

  background:
    linear-gradient(
      135deg,
      #198754,
      #157347
    );

  color: white;

  display: flex;

  align-items: center;

  justify-content: space-between;

  padding: 0 19px;

  cursor: pointer;

  font-weight: 900;

  box-shadow:
    0 9px 20px rgba(25, 135, 84, .22);

  transition:
    transform .2s ease,
    box-shadow .2s ease,
    opacity .2s ease;
}

.goo-place-order:hover:not(:disabled) {
  transform: translateY(-2px);

  box-shadow:
    0 12px 25px rgba(25, 135, 84, .28);
}

.goo-place-order:disabled {
  opacity: .7;

  cursor: not-allowed;
}

.goo-place-order > span {
  font-size: 12px;

  letter-spacing: .5px;
}

.goo-place-order > strong {
  font-size: 16px;
}


/* =====================================================
   BUTTON SPINNER
===================================================== */

.goo-button-spinner {
  width: 18px;
  height: 18px;

  border: 2px solid rgba(255,255,255,.35);

  border-top-color: white;

  border-radius: 50%;

  animation:
    goo-spin .7s linear infinite;

  margin-right: 9px;
}

@keyframes goo-spin {
  to {
    transform: rotate(360deg);
  }
}


/* =====================================================
   SUMMARY TRUST
===================================================== */

.goo-summary-trust {
  display: flex;

  justify-content: center;

  gap: 17px;

  padding: 15px 10px 19px;
}

.goo-summary-trust > div {
  display: flex;

  align-items: center;

  gap: 5px;

  color: #8a958e;

  font-size: 9px;
}

.goo-summary-trust svg {
  color: #198754;

  font-size: 10px;
}


/* =====================================================
   SIMPLE STATE
===================================================== */

.goo-simple-state {
  width: min(500px, calc(100% - 32px));

  margin: 80px auto;

  padding: 45px 30px;

  text-align: center;

  background: white;

  border: 1px solid #e2e9e3;

  border-radius: 24px;

  box-shadow:
    0 12px 35px rgba(23, 59, 36, .07);
}

.goo-state-icon {
  width: 75px;
  height: 75px;

  margin: 0 auto 20px;

  display: flex;

  align-items: center;
  justify-content: center;

  background: #eaf5ed;

  color: #198754;

  border-radius: 22px;

  font-size: 28px;
}

.goo-simple-state h2 {
  color: #173b24;

  font-size: 25px;

  font-weight: 800;

  margin-bottom: 8px;
}

.goo-simple-state p {
  color: #7a877f;

  font-size: 14px;

  margin-bottom: 25px;
}

.goo-primary-btn {
  display: inline-flex;

  align-items: center;

  gap: 10px;

  border: 0;

  background: #198754;

  color: white;

  border-radius: 999px;

  padding: 13px 23px;

  font-weight: 700;

  cursor: pointer;

  box-shadow:
    0 8px 18px rgba(25, 135, 84, .18);
}


/* =====================================================
   SUCCESS OVERLAY
===================================================== */

.goo-success-overlay {
  position: fixed;

  inset: 0;

  z-index: 9999;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 20px;

  background:
    rgba(11, 27, 17, .58);

  backdrop-filter:
    blur(9px);
}

.goo-success-card {
  width: min(450px, 100%);

  padding: 40px 32px;

  text-align: center;

  background: white;

  border-radius: 26px;

  box-shadow:
    0 25px 70px rgba(0,0,0,.22);

  animation:
    goo-success-in .35s ease;
}

@keyframes goo-success-in {
  from {
    opacity: 0;
    transform: translateY(15px) scale(.97);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.goo-success-icon {
  width: 86px;
  height: 86px;

  margin: 0 auto 19px;

  display: flex;

  align-items: center;
  justify-content: center;

  background: #eaf7ed;

  color: #198754;

  border-radius: 50%;

  font-size: 53px;
}

.goo-success-label {
  display: block;

  color: #198754;

  font-size: 9px;

  font-weight: 900;

  letter-spacing: 2px;

  margin-bottom: 8px;
}

.goo-success-card h2 {
  color: #173b24;

  font-size: 25px;

  font-weight: 850;

  margin: 0 0 8px;
}

.goo-success-card > p {
  color: #718078;

  font-size: 13px;

  margin: 0 0 20px;
}

.goo-order-number {
  padding: 14px;

  background: #f5f8f5;

  border-radius: 13px;

  margin-bottom: 19px;
}

.goo-order-number span {
  display: block;

  color: #8b968e;

  font-size: 8px;

  font-weight: 800;

  letter-spacing: 1.5px;

  margin-bottom: 5px;
}

.goo-order-number strong {
  color: #173b24;

  font-size: 17px;
}

.goo-redirect {
  display: flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  color: #8a958e;

  font-size: 11px;
}

.goo-spinner {
  width: 14px;
  height: 14px;

  border: 2px solid #d9e7dd;

  border-top-color: #198754;

  border-radius: 50%;

  animation:
    goo-spin .7s linear infinite;
}


/* =====================================================
   TABLET
===================================================== */

@media (max-width: 991px) {

  .goo-checkout-grid {
    grid-template-columns: 1fr;
  }

  .goo-summary-column {
    position: static;
  }

  .goo-summary {
    max-width: none;
  }

  .goo-header-badge {
    display: none;
  }

}


/* =====================================================
   MOBILE
===================================================== */

@media (max-width: 767px) {

  .goo-checkout-page {
    padding: 18px 0 45px;
  }

  .goo-checkout-container {
    width: min(
      100% - 22px,
      600px
    );
  }

  .goo-checkout-header {
    display: block;

    margin-bottom: 20px;
  }

  .goo-back-btn {
    margin-bottom: 17px;
  }

  .goo-header-title {
    text-align: left;
  }

  .goo-header-title h1 {
    font-size: 28px;
  }

  .goo-header-title p {
    font-size: 12px;
  }

  .goo-panel {
    padding: 20px 16px;

    border-radius: 18px;
  }

  .goo-panel-heading {
    margin-bottom: 20px;
  }

  .goo-panel-heading h2 {
    font-size: 18px;
  }

  .goo-form-grid {
    grid-template-columns: 1fr;

    gap: 15px;
  }

  .goo-field.full {
    grid-column: auto;
  }

  .goo-option-grid {
    grid-template-columns: 1fr;
  }

  .goo-frequency-grid {
    grid-template-columns: 1fr 1fr 1fr;

    gap: 7px;
  }

  .goo-frequency {
    padding: 12px 6px;
  }

  .goo-frequency > span {
    font-size: 19px;
  }

  .goo-frequency strong {
    font-size: 11px;
  }

  .goo-frequency small {
    font-size: 9px;
  }

  .goo-payment-grid {
    grid-template-columns: 1fr;
  }

  .goo-summary-header {
    padding: 19px 17px 15px;
  }

  .goo-summary-items {
    padding-left: 17px;
    padding-right: 17px;
  }

  .goo-price-box {
    margin-left: 17px;
    margin-right: 17px;
  }

  .goo-total-row {
    padding-left: 17px;
    padding-right: 17px;
  }

  .goo-selected-box,
  .goo-selected-payment {
    margin-left: 17px;
    margin-right: 17px;
  }

  .goo-place-order {
    width: calc(100% - 34px);

    margin-left: 17px;
    margin-right: 17px;
  }

  .goo-success-card {
    padding: 32px 20px;
  }

}


/* =====================================================
   SMALL MOBILE
===================================================== */

@media (max-width: 430px) {

  .goo-frequency-grid {
    grid-template-columns: 1fr;
  }

  .goo-frequency {
    display: flex;

    align-items: center;

    text-align: left;

    gap: 9px;

    padding: 11px;
  }

  .goo-frequency > span {
    margin: 0;
  }

  .goo-frequency strong {
    margin: 0;
  }

  .goo-frequency small {
    margin-left: auto;
  }

  .goo-frequency > svg {
    position: static;
  }

  .goo-choice {
    padding: 12px;
  }

  .goo-choice-icon {
    width: 39px;
    height: 39px;

    flex-basis: 39px;
  }

}

`;