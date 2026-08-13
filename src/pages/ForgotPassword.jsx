import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaEnvelope,
  FaCheckCircle,
} from "react-icons/fa";

import {
  supabase,
  supabaseConfigured,
} from "../lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!supabaseConfigured || !supabase) {
      setError(
        "Password reset is currently unavailable. Please try again later."
      );
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      // ==========================================
      // PRODUCTION PASSWORD RESET URL
      // ==========================================

      const redirectTo =
        "https://goo-amrutham-5i1w.vercel.app/update-password";

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim().toLowerCase(),
          {
            redirectTo,
          }
        );

      if (error) {
        throw error;
      }

      setMessage(
        "Password reset link has been sent to your email. Please check your inbox."
      );

      setEmail("");
    } catch (err) {
      console.error(
        "Forgot password error:",
        err
      );

      setError(
        err?.message ||
          "Unable to send password reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="container py-4 py-md-5">

        <div className="row justify-content-center">

          <div className="col-12 col-sm-10 col-md-7 col-lg-5">

            <div className="card border-0 shadow-sm rounded-4">

              <div className="card-body p-3 p-sm-4 p-md-5">

                {/* HEADER */}

                <div className="text-center mb-4">

                  <div
                    className="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{
                      width: "64px",
                      height: "64px",
                      fontSize: "24px",
                    }}
                  >
                    <FaEnvelope />
                  </div>

                  <h2 className="fw-bold">
                    Forgot Password?
                  </h2>

                  <p className="text-muted mb-0">
                    Enter your registered email address and
                    we'll send you a password reset link.
                  </p>

                </div>


                {/* ERROR */}

                {error && (
                  <div className="alert alert-danger rounded-3">
                    {error}
                  </div>
                )}


                {/* SUCCESS */}

                {message && (
                  <div className="alert alert-success rounded-3">

                    <FaCheckCircle className="me-2" />

                    {message}

                  </div>
                )}


                {/* FORM */}

                <form onSubmit={handleSubmit}>

                  <div className="mb-3">

                    <label
                      htmlFor="reset-email"
                      className="form-label fw-semibold"
                    >
                      Email Address
                    </label>

                    <input
                      id="reset-email"
                      type="email"
                      className="form-control form-control-lg rounded-3"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      autoComplete="email"
                      inputMode="email"
                      autoCapitalize="none"
                      required
                      disabled={loading}
                    />

                  </div>


                  <button
                    type="submit"
                    className="btn btn-success btn-lg w-100 rounded-pill"
                    disabled={loading}
                  >
                    {loading
                      ? "Sending..."
                      : "Send Reset Link"}
                  </button>

                </form>


                {/* BACK TO LOGIN */}

                <div className="text-center mt-4">

                  <Link
                    to="/login"
                    className="text-success text-decoration-none fw-semibold"
                  >

                    <FaArrowLeft className="me-2" />

                    Back to Login

                  </Link>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}