import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaCheckCircle,
  FaArrowLeft,
} from "react-icons/fa";

import { supabase } from "../lib/supabase";
import { useApp } from "../context/AppContext";

export default function Checkout() {
  const navigate = useNavigate();

  const {
    currentUser,
    cartItems,
    clearCart,
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [successOrderNumber, setSuccessOrderNumber] =
    useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    name: currentUser?.name || "",
    phone: currentUser?.phone || "",
    address: currentUser?.address || "",
    city: currentUser?.city || "",
    pincode: currentUser?.pincode || "",
    notes: "",
    slot: "Morning",
    frequency: "Daily",
  });

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
  ===================================================== */

  const deliveryFee = subtotal >= 500 ? 0 : 20;

  /* =====================================================
     TOTAL
  ===================================================== */

  const total = subtotal + deliveryFee;

  /* =====================================================
     HANDLE INPUT
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =====================================================
     ORDER NUMBER
  ===================================================== */

  const generateOrderNumber = () => {
    const date = new Date();

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    const random = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    return `GAM-${year}${month}${day}-${random}`;
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

    if (!cartItems || cartItems.length === 0) {
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

    try {
      setLoading(true);

      /* ---------------------------------------------
         GET SUPABASE USER
      --------------------------------------------- */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        navigate("/login");
        return;
      }

      /* ---------------------------------------------
         ORDER NUMBER
      --------------------------------------------- */

      const orderNumber =
        generateOrderNumber();

      /* ---------------------------------------------
         CREATE ORDER
      --------------------------------------------- */

      const {
        data: order,
        error: orderError,
      } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,

          order_number: orderNumber,

          customer_name:
            form.name.trim(),

          customer_phone:
            form.phone.trim(),

          customer_email:
            user.email || "",

          address:
            form.address.trim(),

          city:
            form.city.trim(),

          pincode:
            form.pincode.trim(),

          instructions:
            form.notes.trim(),

          slot:
            form.slot,

          frequency:
            form.frequency,

          subtotal:
            Number(
              subtotal.toFixed(2)
            ),

          delivery_fee:
            Number(
              deliveryFee.toFixed(2)
            ),

          total:
            Number(
              total.toFixed(2)
            ),

          /* IMPORTANT */
          status: "Order Placed",
        })
        .select()
        .single();

      if (orderError) {
        console.error(
          "Order creation error:",
          orderError
        );

        throw orderError;
      }

      /* ---------------------------------------------
         CREATE ORDER ITEMS
         
         IMPORTANT:
         These names EXACTLY match your Supabase table:
         
         order_id
         product_id
         name
         unit
         unit_price
         qty
         line_total
      --------------------------------------------- */

      const orderItems = cartItems.map(
        (item) => {
          const quantity = Number(
            item.qty || 1
          );

          const price = Number(
            item.price || 0
          );

          return {
            order_id: order.id,

            product_id: item.id
              ? String(item.id)
              : null,

            name:
              item.name ||
              "Milk Product",

            unit:
              item.unit || "",

            unit_price:
              price,

            qty:
              quantity,

            line_total:
              Number(
                (
                  price * quantity
                ).toFixed(2)
              ),
          };
        }
      );

      const {
        error: itemsError,
      } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error(
          "Order items error:",
          itemsError
        );

        throw itemsError;
      }

      /* ---------------------------------------------
         CREATE INITIAL TRACKING STATUS
      --------------------------------------------- */

      const {
        error: historyError,
      } = await supabase
        .from("order_status_history")
        .insert({
          order_id:
            order.id,

          status:
            "Order Placed",

          note:
            "Your Goo Amrutham Milk order has been placed successfully.",
        });

      if (historyError) {
        console.error(
          "Order history error:",
          historyError
        );

        /*
         * We don't fail the complete order here.
         * The order and items were already created.
         */
      }

      /* ---------------------------------------------
         CLEAR CART
      --------------------------------------------- */

      clearCart();

      /* ---------------------------------------------
         SUCCESS UI
      --------------------------------------------- */

      setSuccessOrderNumber(
        order.order_number
      );

      setOrderSuccess(true);

      /* ---------------------------------------------
         REDIRECT TO ORDERS
      --------------------------------------------- */

      setTimeout(() => {
        navigate("/orders");

        setTimeout(() => {
          window.location.reload();
        }, 300);
      }, 2500);

    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Something went wrong while placing your order. Please try again."
      );
    } finally {
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
              maxWidth: "460px",
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
                {" "}Goo Amrutham Milk
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

                {/* ERROR MESSAGE */}

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

                  {/* PLACE ORDER */}

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

                        Placing Your Order...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="me-2" />

                        Place Order • ₹
                        {total.toFixed(2)}
                      </>
                    )}

                  </button>

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
                            {price.toFixed(2)}
                          </small>

                        </div>

                        <strong>
                          ₹
                          {(
                            price *
                            quantity
                          ).toFixed(2)}
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
                    {subtotal.toFixed(2)}
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
                    {total.toFixed(2)}
                  </span>

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