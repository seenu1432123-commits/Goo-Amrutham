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
   CHECKOUT COMPONENT
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

    // NEW:
    // razorpay = online payment
    // cod = cash on delivery
    paymentMethod: "razorpay",
  });

  /* =====================================================
     UPDATE FORM
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
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

     ₹500 or more = FREE
     Below ₹500 = ₹20
  ===================================================== */

  const deliveryFee =
    subtotal >= 500 ? 0 : 20;

  /* =====================================================
     TOTAL
  ===================================================== */

  const total =
    subtotal + deliveryFee;

  /* =====================================================
     CHECK PRODUCT AVAILABILITY
  ===================================================== */

  const checkProductAvailability = async () => {
    if (
      !cartItems ||
      cartItems.length === 0
    ) {
      return {
        available: false,
        message: "Your cart is empty.",
      };
    }

    const itemsPayload =
      cartItems.map((item) => ({
        product_id: String(
          item.id ||
            item.product_id
        ),

        qty: Number(
          item.qty || 1
        ),
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
     CREATE ORDER

     Used by BOTH:

     1. Cash on Delivery
     2. Razorpay after successful verification
  ===================================================== */

  const createGooOrder = async (
    user,
    paymentMethod,
    razorpayData = null
  ) => {
    const itemsPayload =
      cartItems.map((item) => ({
        product_id: String(
          item.id ||
            item.product_id
        ),

        qty: Number(
          item.qty || 1
        ),
      }));

    const {
      data: createdOrder,
      error: createOrderError,
    } =
      await supabase.rpc(
        "create_order",
        {
          p_items:
            itemsPayload,

          p_customer: {
            name:
              form.name.trim(),

            phone:
              form.phone.trim(),

            email:
              user.email || "",

            address:
              form.address.trim(),

            city:
              form.city.trim(),

            pincode:
              form.pincode.trim(),
          },

          p_slot:
            form.slot,

          p_frequency:
            form.frequency,

          p_instructions:
            form.notes.trim(),

          /*
             NEW PAYMENT METHOD

             "cod"
             or
             "razorpay"
          */
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
      typeof createdOrder ===
      "string"
        ? createdOrder
        : createdOrder?.id;

    const orderNumber =
      createdOrder?.order_number ||
      "";

    if (!orderId) {
      throw new Error(
        "Order was created but the order ID could not be found."
      );
    }

    /* =================================================
       FINALIZE RAZORPAY PAYMENT
       
       COD DOES NOT COME HERE.
    ================================================= */

    if (
      paymentMethod ===
        "razorpay" &&
      razorpayData
    ) {
      const {
        error:
          paymentFinalizeError,
      } =
        await supabase.rpc(
          "finalize_order_payment",
          {
            p_order_id:
              orderId,

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

      /*
         Give AppContext a moment to fetch the
         newly created order.
      */

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

    /* -----------------------------------------------
       LOGIN CHECK
    ----------------------------------------------- */

    if (!currentUser) {
      navigate("/login");
      return;
    }

    /* -----------------------------------------------
       CART CHECK
    ----------------------------------------------- */

    if (
      !cartItems ||
      cartItems.length === 0
    ) {
      navigate("/products");
      return;
    }

    /* -----------------------------------------------
       FORM VALIDATION
    ----------------------------------------------- */

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

    /* -----------------------------------------------
       PAYMENT METHOD VALIDATION
    ----------------------------------------------- */

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
         CHECK PRODUCT AVAILABILITY FIRST
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
         
         IMPORTANT:
         COD DOES NOT LOAD RAZORPAY.
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
         
         Everything below this point is Razorpay.
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
              amount: Number(
                total.toFixed(2)
              ),

              receipt:
                `GAM-${Date.now()}`,
            },
          }
        );

      if (
        razorpayOrderError
      ) {
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

        /* ---------------------------------------------
           PAYMENT WINDOW CLOSED
        --------------------------------------------- */

        modal: {
          ondismiss: () => {
            setLoading(false);

            setErrorMessage(
              "Payment was cancelled. Your order has not been placed."
            );
          },
        },

        /* ---------------------------------------------
           PAYMENT SUCCESS
        --------------------------------------------- */

        handler:
          async function (
            response
          ) {
            try {
              setLoading(true);

              setErrorMessage("");

              /* =========================================
                 VERIFY RAZORPAY PAYMENT
              ========================================= */

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

              /* =========================================
                 PAYMENT VERIFIED
                 
                 NOW CREATE GOO AMRUTHAM ORDER
              ========================================= */

              const created =
                await createGooOrder(
                  user,
                  "razorpay",
                  response
                );

              /* =========================================
                 SUCCESS
              ========================================= */

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

      /* =================================================
         PAYMENT FAILED
      ================================================= */

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

      /* =================================================
         OPEN PAYMENT WINDOW
      ================================================= */

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
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">

            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body text-center p-5">

                <FaUser
                  size={45}
                  className="text-success mb-3"
                />

                <h3 className="fw-bold">
                  Please Login
                </h3>

                <p className="text-muted">
                  Login to place your
                  Goo Amrutham Milk order.
                </p>

                <button
                  type="button"
                  className="btn btn-success rounded-pill px-4"
                  onClick={() =>
                    navigate("/login")
                  }
                >
                  Login
                </button>

              </div>
            </div>

          </div>
        </div>
      </div>
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
      <div className="container py-5">
        <div className="row justify-content-center">

          <div className="col-md-6">

            <div className="card border-0 shadow-sm rounded-4">

              <div className="card-body text-center p-5">

                <div className="display-3 mb-3">
                  🥛
                </div>

                <h3 className="fw-bold">
                  Your Cart is Empty
                </h3>

                <p className="text-muted">
                  Add some fresh
                  Goo Amrutham Milk
                  products first.
                </p>

                <button
                  type="button"
                  className="btn btn-success rounded-pill px-4"
                  onClick={() =>
                    navigate("/products")
                  }
                >
                  Browse Fresh Milk
                </button>

              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN CHECKOUT
  ===================================================== */

  return (
    <>
      {/* =================================================
          SUCCESS OVERLAY
      ================================================= */}

      {orderSuccess && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background:
              "rgba(0, 0, 0, 0.45)",
            backdropFilter:
              "blur(5px)",
            zIndex: 9999,
          }}
        >

          <div
            className="bg-white rounded-4 shadow-lg text-center p-4 p-md-5 mx-3"
            style={{
              maxWidth:
                "460px",
              width: "100%",
            }}
          >

            <div
              className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10"
              style={{
                width: "90px",
                height: "90px",
              }}
            >

              <FaCheckCircle
                className="text-success"
                size={55}
              />

            </div>

            <h2 className="fw-bold text-success mb-2">
              Order Successfully Placed!
            </h2>

            <p className="text-muted mb-4">
              Thank you for choosing
              <strong>
                {" "}
                Goo Amrutham Milk
              </strong>.
            </p>

            <div className="bg-light rounded-3 p-3 mb-4">

              <small className="text-muted d-block mb-1">
                Your Order Number
              </small>

              <strong className="fs-5">
                {successOrderNumber}
              </strong>

            </div>

            <div className="d-flex justify-content-center align-items-center gap-2 text-muted">

              <span
                className="spinner-border spinner-border-sm text-success"
                role="status"
              />

              <small>
                Taking you to your orders...
              </small>

            </div>

          </div>
        </div>
      )}

      {/* =================================================
          MAIN PAGE
      ================================================= */}

      <div className="container py-4 py-md-5">

        <button
          type="button"
          className="btn btn-link text-success text-decoration-none px-0 mb-4 fw-semibold"
          onClick={() =>
            navigate("/cart")
          }
        >
          <FaArrowLeft className="me-2" />
          Back to Cart
        </button>

        <div className="row g-4">

          {/* =================================================
              DELIVERY DETAILS
          ================================================= */}

          <div className="col-lg-7">

            <div className="card border-0 shadow-sm rounded-4">

              <div className="card-body p-4 p-md-5">

                <h2 className="fw-bold mb-1">
                  Delivery Details
                </h2>

                <p className="text-muted mb-4">
                  Tell us where you'd like
                  your fresh milk delivered.
                </p>

                {errorMessage && (
                  <div
                    className="alert alert-danger rounded-3"
                    role="alert"
                  >
                    {errorMessage}
                  </div>
                )}

                <form
                  onSubmit={placeOrder}
                >

                  {/* NAME */}

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      <FaUser className="text-success me-2" />
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      className="form-control form-control-lg rounded-3"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  {/* PHONE */}

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      <FaPhone className="text-success me-2" />
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      className="form-control form-control-lg rounded-3"
                      placeholder="Enter your phone number"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  {/* ADDRESS */}

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      <FaMapMarkerAlt className="text-success me-2" />
                      Delivery Address
                    </label>

                    <textarea
                      name="address"
                      className="form-control rounded-3"
                      rows="3"
                      placeholder="House number, street, area..."
                      value={form.address}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  {/* CITY + PIN */}

                  <div className="row">

                    <div className="col-md-6 mb-3">

                      <label className="form-label fw-semibold">
                        City
                      </label>

                      <input
                        type="text"
                        name="city"
                        className="form-control form-control-lg rounded-3"
                        placeholder="City"
                        value={form.city}
                        onChange={handleChange}
                        required
                      />

                    </div>

                    <div className="col-md-6 mb-3">

                      <label className="form-label fw-semibold">
                        PIN Code
                      </label>

                      <input
                        type="text"
                        name="pincode"
                        className="form-control form-control-lg rounded-3"
                        placeholder="PIN Code"
                        maxLength="6"
                        value={form.pincode}
                        onChange={handleChange}
                        required
                      />

                    </div>

                  </div>

                  {/* DELIVERY SLOT */}

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Delivery Slot
                    </label>

                    <select
                      name="slot"
                      className="form-select form-select-lg rounded-3"
                      value={form.slot}
                      onChange={handleChange}
                    >

                      <option value="Morning">
                        Morning
                      </option>

                      <option value="Evening">
                        Evening
                      </option>

                    </select>

                  </div>

                  {/* FREQUENCY */}

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Delivery Frequency
                    </label>

                    <select
                      name="frequency"
                      className="form-select form-select-lg rounded-3"
                      value={form.frequency}
                      onChange={handleChange}
                    >

                      <option value="Daily">
                        Daily
                      </option>

                      <option value="Weekly">
                        Weekly
                      </option>

                      <option value="One Time">
                        One Time
                      </option>

                    </select>

                  </div>

                  {/* NOTES */}

                  <div className="mb-4">

                    <label className="form-label fw-semibold">
                      Delivery Instructions
                    </label>

                    <textarea
                      name="notes"
                      className="form-control rounded-3"
                      rows="2"
                      placeholder="Example: Leave the bottle near the gate."
                      value={form.notes}
                      onChange={handleChange}
                    />

                  </div>

                  {/* =================================================
                      PAYMENT METHOD
                  ================================================= */}

                  <div className="mb-4">

                    <label className="form-label fw-bold">
                      Payment Method
                    </label>

                    <div className="row g-3">

                      {/* ONLINE PAYMENT */}

                      <div className="col-md-6">

                        <label
                          className={`w-100 p-3 rounded-4 border ${
                            form.paymentMethod ===
                            "razorpay"
                              ? "border-success bg-success bg-opacity-10"
                              : "border-light-subtle"
                          }`}
                          style={{
                            cursor:
                              "pointer",
                          }}
                        >

                          <div className="d-flex align-items-center gap-3">

                            <input
                              type="radio"
                              name="paymentMethod"
                              value="razorpay"
                              checked={
                                form.paymentMethod ===
                                "razorpay"
                              }
                              onChange={
                                handleChange
                              }
                              className="form-check-input"
                            />

                            <div>

                              <div className="fw-bold">

                                <FaCreditCard className="text-success me-2" />

                                Online Payment

                              </div>

                              <small className="text-muted">
                                Pay securely using Razorpay
                              </small>

                            </div>

                          </div>

                        </label>

                      </div>

                      {/* CASH ON DELIVERY */}

                      <div className="col-md-6">

                        <label
                          className={`w-100 p-3 rounded-4 border ${
                            form.paymentMethod ===
                            "cod"
                              ? "border-success bg-success bg-opacity-10"
                              : "border-light-subtle"
                          }`}
                          style={{
                            cursor:
                              "pointer",
                          }}
                        >

                          <div className="d-flex align-items-center gap-3">

                            <input
                              type="radio"
                              name="paymentMethod"
                              value="cod"
                              checked={
                                form.paymentMethod ===
                                "cod"
                              }
                              onChange={
                                handleChange
                              }
                              className="form-check-input"
                            />

                            <div>

                              <div className="fw-bold">

                                <FaMoneyBillWave className="text-success me-2" />

                                Cash on Delivery

                              </div>

                              <small className="text-muted">
                                Pay when your milk is delivered
                              </small>

                            </div>

                          </div>

                        </label>

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      PLACE ORDER BUTTON
                  ================================================= */}

                  <button
                    type="submit"
                    className="btn btn-success btn-lg w-100 rounded-pill fw-bold py-3"
                    disabled={loading}
                  >

                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        />

                        {form.paymentMethod ===
                        "cod"
                          ? "Placing Order..."
                          : "Starting Secure Payment..."}
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="me-2" />

                        {form.paymentMethod ===
                        "cod"
                          ? `Place Order • ₹${total.toFixed(
                              2
                            )}`
                          : `Pay ₹${total.toFixed(
                              2
                            )}`}
                      </>
                    )}

                  </button>

                  {/* PAYMENT INFORMATION */}

                  <div className="text-center mt-3">

                    <small className="text-muted">

                      {form.paymentMethod ===
                      "cod"
                        ? "💵 Pay cash when your milk is delivered"
                        : "🔒 Secure payment powered by Razorpay"}

                    </small>

                  </div>

                </form>

              </div>
            </div>

          </div>

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <div className="col-lg-5">

            <div
              className="card border-0 shadow-sm rounded-4 sticky-lg-top"
              style={{
                top: "100px",
              }}
            >

              <div className="card-body p-4">

                <h4 className="fw-bold mb-4">
                  Order Summary
                </h4>

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

                    return (
                      <div
                        key={
                          item.id ||
                          item.product_id ||
                          index
                        }
                        className="d-flex justify-content-between align-items-start mb-3"
                      >

                        <div className="me-3">

                          <div className="fw-semibold">
                            {item.name ||
                              "Milk Product"}
                          </div>

                          <small className="text-muted">
                            {quantity} × ₹
                            {price.toFixed(
                              2
                            )}
                          </small>

                        </div>

                        <strong>
                          ₹
                          {(
                            price *
                            quantity
                          ).toFixed(
                            2
                          )}
                        </strong>

                      </div>
                    );
                  }
                )}

                <hr />

                <div className="d-flex justify-content-between mb-2">

                  <span className="text-muted">
                    Subtotal
                  </span>

                  <strong>
                    ₹
                    {subtotal.toFixed(
                      2
                    )}
                  </strong>

                </div>

                <div className="d-flex justify-content-between mb-3">

                  <span className="text-muted">
                    Delivery
                  </span>

                  <strong
                    className={
                      deliveryFee === 0
                        ? "text-success"
                        : ""
                    }
                  >

                    {deliveryFee === 0
                      ? "FREE"
                      : `₹${deliveryFee.toFixed(
                          2
                        )}`}

                  </strong>

                </div>

                <hr />

                <div className="d-flex justify-content-between align-items-center">

                  <span className="fs-5 fw-bold">
                    Total
                  </span>

                  <span className="fs-4 fw-bold text-success">
                    ₹
                    {total.toFixed(
                      2
                    )}
                  </span>

                </div>

                {/* SELECTED PAYMENT METHOD */}

                <div className="mt-4 p-3 rounded-4 bg-light">

                  <div className="small text-muted mb-1">
                    Payment Method
                  </div>

                  <div className="fw-bold">

                    {form.paymentMethod ===
                    "cod" ? (
                      <>
                        <FaMoneyBillWave className="text-success me-2" />

                        Cash on Delivery
                      </>
                    ) : (
                      <>
                        <FaCreditCard className="text-success me-2" />

                        Online Payment
                      </>
                    )}

                  </div>

                </div>

                <div className="alert alert-success border-0 rounded-3 mt-4 mb-0">

                  <div className="fw-semibold mb-1">
                    🥛 Fresh & Natural
                  </div>

                  <small>
                    Your Goo Amrutham Milk
                    will be delivered fresh
                    to your doorstep.
                  </small>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </>
  );
}