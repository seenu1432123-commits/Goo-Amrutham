import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaPause,
  FaPlay,
  FaTimes,
} from "react-icons/fa";

import { supabase } from "../lib/supabase";
import { useApp } from "../context/AppContext";

export default function Subscription() {
  const navigate = useNavigate();

  const { currentUser } = useApp();

  const [subscriptions, setSubscriptions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadSubscriptions = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const {
      data,
      error,
    } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      setError(error.message);
    } else {
      setSubscriptions(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadSubscriptions();
  }, [currentUser]);

  const updateStatus = async (
    id,
    status
  ) => {
    const { error } =
      await supabase
        .from("subscriptions")
        .update({
          status,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id)
        .eq(
          "user_id",
          currentUser.id
        );

    if (error) {
      setError(error.message);
      return;
    }

    loadSubscriptions();
  };

  if (!currentUser) {
    return (
      <div className="container py-5 text-center">
        <h2 className="fw-bold">
          Login Required
        </h2>

        <p className="text-muted">
          Please login to manage your
          milk subscriptions.
        </p>

        <button
          className="btn btn-success rounded-pill px-4"
          onClick={() =>
            navigate("/login")
          }
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <main className="container py-5">

      <div className="mb-4">
        <span className="badge text-bg-success rounded-pill">
          GOO AMRUTHAM
        </span>

        <h1 className="fw-bold mt-2">
          My Subscriptions
        </h1>

        <p className="text-muted">
          Manage your regular fresh milk
          deliveries.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">

          <div
            className="spinner-border text-success"
            role="status"
          />

          <p className="text-muted mt-3">
            Loading subscriptions...
          </p>

        </div>
      ) : subscriptions.length === 0 ? (

        <div className="card border-0 shadow-sm rounded-4">

          <div className="card-body text-center p-5">

            <div className="display-3">
              🥛
            </div>

            <h3 className="fw-bold mt-3">
              No subscriptions yet
            </h3>

            <p className="text-muted">
              Start a regular fresh milk
              delivery subscription.
            </p>

            <button
              className="btn btn-success rounded-pill px-4"
              onClick={() =>
                navigate("/products")
              }
            >
              Browse Milk Products
            </button>

          </div>

        </div>

      ) : (

        <div className="row g-4">

          {subscriptions.map(
            (subscription) => (

              <div
                className="col-md-6 col-xl-4"
                key={subscription.id}
              >

                <div className="card border-0 shadow-sm rounded-4 h-100">

                  <div className="card-body p-4">

                    <div className="d-flex justify-content-between align-items-start">

                      <div>
                        <h5 className="fw-bold mb-1">
                          {subscription.product_name}
                        </h5>

                        <small className="text-muted">
                          {subscription.unit}
                        </small>
                      </div>

                      <span
                        className={`badge rounded-pill ${
                          subscription.status ===
                          "Active"
                            ? "text-bg-success"
                            : subscription.status ===
                              "Paused"
                            ? "text-bg-warning"
                            : "text-bg-secondary"
                        }`}
                      >
                        {subscription.status}
                      </span>

                    </div>

                    <hr />

                    <div className="mb-2">
                      <strong>
                        Quantity:
                      </strong>{" "}
                      {subscription.quantity}
                    </div>

                    <div className="mb-2">
                      <strong>
                        Price:
                      </strong>{" "}
                      ₹
                      {Number(
                        subscription.unit_price
                      ).toFixed(2)}
                    </div>

                    <div className="mb-2">
                      <strong>
                        Frequency:
                      </strong>{" "}
                      {subscription.frequency}
                    </div>

                    <div className="mb-2">
                      <strong>
                        Delivery:
                      </strong>{" "}
                      {subscription.delivery_slot}
                    </div>

                    <div className="mb-3">
                      <strong>
                        Next Delivery:
                      </strong>{" "}
                      {subscription.next_delivery_date ||
                        "Not scheduled"}
                    </div>

                    {subscription.status ===
                      "Active" && (

                      <button
                        className="btn btn-warning w-100 rounded-pill mb-2"
                        onClick={() =>
                          updateStatus(
                            subscription.id,
                            "Paused"
                          )
                        }
                      >
                        <FaPause className="me-2" />
                        Pause Subscription
                      </button>

                    )}

                    {subscription.status ===
                      "Paused" && (

                      <button
                        className="btn btn-success w-100 rounded-pill mb-2"
                        onClick={() =>
                          updateStatus(
                            subscription.id,
                            "Active"
                          )
                        }
                      >
                        <FaPlay className="me-2" />
                        Resume Subscription
                      </button>

                    )}

                    {subscription.status !==
                      "Cancelled" && (

                      <button
                        className="btn btn-outline-danger w-100 rounded-pill"
                        onClick={() =>
                          updateStatus(
                            subscription.id,
                            "Cancelled"
                          )
                        }
                      >
                        <FaTimes className="me-2" />
                        Cancel Subscription
                      </button>

                    )}

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </main>
  );
}