import React, { useState } from "react";
import { FaPlus, FaShoppingCart, FaSyncAlt } from "react-icons/fa";
import { useApp } from "../context/AppContext";
import { createSubscription } from "../services/subscriptionService";

export default function ProductCard({ product }) {
  const { addToCart, currentUser } = useApp();

  const [showModal, setShowModal] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [frequency, setFrequency] = useState("Daily");
  const [deliverySlot, setDeliverySlot] = useState("Morning");

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ---------------------------------------
  // ADD TO CART
  // ---------------------------------------

  const handleAddToCart = () => {
    addToCart(product.id);
  };

  // ---------------------------------------
  // OPEN SUBSCRIPTION MODAL
  // ---------------------------------------

  const handleOpenSubscription = () => {
    setError("");
    setMessage("");

    if (!currentUser) {
      setError("Please login before creating a subscription.");
      return;
    }

    setShowModal(true);
  };

  // ---------------------------------------
  // CREATE SUBSCRIPTION
  // ---------------------------------------

  const handleSubscribe = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!currentUser) {
      setError("Please login first.");
      return;
    }

    if (!deliveryAddress.trim()) {
      setError("Please enter your delivery address.");
      return;
    }

    if (!city.trim()) {
      setError("Please enter your city.");
      return;
    }

    if (!pincode.trim()) {
      setError("Please enter your pincode.");
      return;
    }

    if (pincode.trim().length < 5) {
      setError("Please enter a valid pincode.");
      return;
    }

    try {
      setLoading(true);

      await createSubscription({
        userId: currentUser.id,
        product,
        quantity,
        frequency,
        deliverySlot,
        deliveryAddress,
        city,
        pincode,
      });

      setMessage("Subscription created successfully! 🥛");

      // Close after a short success message
      setTimeout(() => {
        setShowModal(false);
        setMessage("");
      }, 1500);
    } catch (err) {
      console.error("Subscription error:", err);

      setError(
        err?.message ||
          "Unable to create subscription. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ============================= */}
      {/* PRODUCT CARD */}
      {/* ============================= */}

      <div className="product-card h-100">
        <div className="product-image-wrap">
          {product.badge && (
            <span className="product-badge">
              {product.badge}
            </span>
          )}

          <img
            src={product.image}
            alt={product.name}
          />
        </div>

        <div className="p-4">
          <p className="text-muted small mb-1">
            {product.unit}
          </p>

          <h5>{product.name}</h5>

          <p className="small text-secondary">
            {product.description}
          </p>

          <div className="d-flex justify-content-between align-items-center gap-2">
            <strong className="price">
              ₹{product.price}
            </strong>

            <div className="d-flex gap-2">
              {/* ADD TO CART */}

              <button
                type="button"
                className="btn btn-success rounded-pill"
                onClick={handleAddToCart}
                title="Add to cart"
              >
                <FaPlus />
                <span className="ms-1">Add</span>
              </button>

              {/* SUBSCRIBE */}

              <button
                type="button"
                className="btn btn-outline-success rounded-pill"
                onClick={handleOpenSubscription}
                title="Subscribe"
              >
                <FaSyncAlt />
                <span className="ms-1">Subscribe</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================= */}
      {/* SUBSCRIPTION MODAL */}
      {/* ============================= */}

      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor: "rgba(0,0,0,0.55)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow">

              {/* HEADER */}

              <div className="modal-header border-0">
                <div>
                  <h5 className="modal-title fw-bold">
                    Subscribe to {product.name}
                  </h5>

                  <small className="text-muted">
                    Regular fresh milk delivery from Goo Amrutham
                  </small>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                />
              </div>

              {/* BODY */}

              <form onSubmit={handleSubscribe}>
                <div className="modal-body">

                  {/* PRODUCT */}

                  <div className="card border-0 bg-light rounded-4 mb-4">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">

                        <div>
                          <h6 className="fw-bold mb-1">
                            {product.name}
                          </h6>

                          <small className="text-muted">
                            {product.unit}
                          </small>
                        </div>

                        <strong className="text-success">
                          ₹{product.price}
                        </strong>

                      </div>
                    </div>
                  </div>

                  {/* QUANTITY */}

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Quantity
                    </label>

                    <div className="input-group">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          setQuantity(
                            Math.max(1, quantity - 1)
                          )
                        }
                        disabled={loading}
                      >
                        −
                      </button>

                      <input
                        type="number"
                        className="form-control text-center"
                        min="1"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(
                              1,
                              Number(e.target.value) || 1
                            )
                          )
                        }
                        disabled={loading}
                      />

                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          setQuantity(quantity + 1)
                        }
                        disabled={loading}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* FREQUENCY */}

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Delivery Frequency
                    </label>

                    <div className="row g-2">

                      {["Daily", "Weekly", "Monthly"].map(
                        (option) => (
                          <div
                            className="col-4"
                            key={option}
                          >
                            <button
                              type="button"
                              className={`btn w-100 rounded-pill ${
                                frequency === option
                                  ? "btn-success"
                                  : "btn-outline-success"
                              }`}
                              onClick={() =>
                                setFrequency(option)
                              }
                              disabled={loading}
                            >
                              {option}
                            </button>
                          </div>
                        )
                      )}

                    </div>
                  </div>

                  {/* DELIVERY SLOT */}

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Delivery Slot
                    </label>

                    <select
                      className="form-select rounded-3"
                      value={deliverySlot}
                      onChange={(e) =>
                        setDeliverySlot(e.target.value)
                      }
                      disabled={loading}
                    >
                      <option value="Morning">
                        Morning
                      </option>

                      <option value="Evening">
                        Evening
                      </option>
                    </select>
                  </div>

                  {/* ADDRESS */}

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Delivery Address
                    </label>

                    <textarea
                      className="form-control rounded-3"
                      rows="2"
                      placeholder="Enter your delivery address"
                      value={deliveryAddress}
                      onChange={(e) =>
                        setDeliveryAddress(e.target.value)
                      }
                      disabled={loading}
                    />
                  </div>

                  {/* CITY + PINCODE */}

                  <div className="row g-3">

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        City
                      </label>

                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="Enter city"
                        value={city}
                        onChange={(e) =>
                          setCity(e.target.value)
                        }
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Pincode
                      </label>

                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="Enter pincode"
                        maxLength="6"
                        value={pincode}
                        onChange={(e) =>
                          setPincode(
                            e.target.value.replace(
                              /\D/g,
                              ""
                            )
                          )
                        }
                        disabled={loading}
                      />
                    </div>

                  </div>

                  {/* SUCCESS */}

                  {message && (
                    <div className="alert alert-success mt-4 mb-0">
                      {message}
                    </div>
                  )}

                  {/* ERROR */}

                  {error && (
                    <div className="alert alert-danger mt-4 mb-0">
                      {error}
                    </div>
                  )}

                </div>

                {/* FOOTER */}

                <div className="modal-footer border-0">

                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() =>
                      setShowModal(false)
                    }
                    disabled={loading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-success rounded-pill px-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FaSyncAlt className="me-2" />
                        Start Subscription
                      </>
                    )}
                  </button>

                </div>
              </form>

            </div>
          </div>
        </div>
      )}
    </>
  );
}