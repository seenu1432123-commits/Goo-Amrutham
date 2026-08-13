import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaWhatsapp,
  FaTimesCircle,
  FaCheckCircle,
} from "react-icons/fa";
import { useApp } from "../context/AppContext";
import StatusTimeline from "../components/StatusTimeline";

export default function OrderDetails() {
  const { id } = useParams();
  const { orders, currentUser } = useApp();

  const o = orders.find(
    (x) =>
      x.id === id &&
      (x.userId === currentUser?.id ||
        currentUser?.role === "admin")
  );

  if (!o) {
    return (
      <main className="page">
        <div className="container empty-state">
          <h1>Order not found</h1>

          <Link to="/orders">
            Back to orders
          </Link>
        </div>
      </main>
    );
  }

  const msg = `Hello Goo Amrutham Milk, I am checking my order ${o.id}. Current status: ${o.status}.`;

  const isCancelled = o.status === "Cancelled";

  return (
    <main className="page">
      <div className="container">

        {/* =========================================
            HEADER
        ========================================== */}

        <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">

          <div>
            <span className="eyebrow">
              ORDER TRACKING
            </span>

            <h1>
              {o.order_number || o.id}
            </h1>

            <p className="mb-0">
              {new Date(o.createdAt).toLocaleString()}
              {" · "}
              {o.slot}
              {" · "}
              {o.frequency}
            </p>
          </div>

          <a
            className="btn btn-success rounded-pill"
            target="_blank"
            rel="noreferrer"
            href={`https://wa.me/917337382082?text=${encodeURIComponent(
              msg
            )}`}
          >
            <FaWhatsapp className="me-2" />
            WhatsApp Support
          </a>

        </div>


        {/* =========================================
            CANCELLED ORDER MESSAGE
        ========================================== */}

        {isCancelled && (
          <div
            className="alert alert-danger rounded-4 border-0 shadow-sm mb-4"
            role="alert"
          >
            <div className="d-flex align-items-start gap-3">

              <FaTimesCircle
                size={32}
                className="flex-shrink-0 mt-1"
              />

              <div>
                <h5 className="fw-bold mb-1">
                  Order Cancelled
                </h5>

                <p className="mb-2">
                  Your order has been cancelled by Goo
                  Amrutham.
                </p>

                <small>
                  If you believe this was cancelled by
                  mistake or you need more information,
                  please contact us through WhatsApp.
                </small>
              </div>

            </div>
          </div>
        )}


        {/* =========================================
            SUCCESS MESSAGE
        ========================================== */}

        {!isCancelled && o.status === "Delivered" && (
          <div
            className="alert alert-success rounded-4 border-0 shadow-sm mb-4"
            role="alert"
          >
            <div className="d-flex align-items-center gap-3">

              <FaCheckCircle size={28} />

              <div>
                <h5 className="fw-bold mb-0">
                  Order Delivered
                </h5>

                <small>
                  Your milk order has been successfully
                  delivered.
                </small>
              </div>

            </div>
          </div>
        )}


        {/* =========================================
            MAIN CONTENT
        ========================================== */}

        <div className="row g-4">

          {/* =====================================
              DELIVERY PROGRESS
          ====================================== */}

          <div className="col-lg-7">

            <div className="form-card">

              <h4>
                Delivery progress
              </h4>

              {isCancelled ? (
                <div className="py-4 text-center">

                  <FaTimesCircle
                    size={55}
                    className="text-danger mb-3"
                  />

                  <h5 className="fw-bold text-danger">
                    This order has been cancelled
                  </h5>

                  <p className="text-muted mb-0">
                    No further delivery updates will be
                    made for this order.
                  </p>

                </div>
              ) : (
                <StatusTimeline order={o} />
              )}

            </div>

          </div>


          {/* =====================================
              ORDER DETAILS
          ====================================== */}

          <div className="col-lg-5">

            <div className="summary-card">

              <h4>
                Order details
              </h4>


              {/* ORDER ITEMS */}

              {o.items.map((i) => (
                <div
                  className="summary-line"
                  key={i.id}
                >
                  <span>
                    {i.unit} × {i.qty}
                  </span>

                  <b>
                    ₹{i.lineTotal}
                  </b>
                </div>
              ))}


              <hr />


              {/* DELIVERY FEE */}

              <div className="summary-line">

                <span>
                  Delivery
                </span>

                <b>
                  {o.deliveryFee
                    ? "₹" + o.deliveryFee
                    : "FREE"}
                </b>

              </div>


              {/* TOTAL */}

              <div className="summary-line total">

                <span>
                  Total
                </span>

                <b>
                  ₹{o.total}
                </b>

              </div>


              {/* ADDRESS */}

              <p className="small mt-3 mb-0">

                <b>
                  Deliver to:
                </b>

                <br />

                {o.customer.address},{" "}
                {o.customer.city} -{" "}
                {o.customer.pincode}

              </p>


              {/* CANCELLED STATUS */}

              {isCancelled && (
                <div className="mt-4 p-3 rounded-4 bg-danger-subtle">

                  <div className="d-flex align-items-center gap-2">

                    <FaTimesCircle className="text-danger" />

                    <strong className="text-danger">
                      Order Cancelled
                    </strong>

                  </div>

                  <small className="text-muted d-block mt-1">
                    This order will not be delivered.
                  </small>

                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}