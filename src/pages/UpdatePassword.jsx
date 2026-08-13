import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  FaLock,
  FaCheckCircle,
  FaArrowLeft,
} from "react-icons/fa";

import { supabase } from "../lib/supabase";

export default function UpdatePassword() {

  const navigate = useNavigate();

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [recoveryReady, setRecoveryReady] =
    useState(false);


  useEffect(() => {

    let mounted = true;

    const checkRecoverySession = async () => {

      const {
        data,
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (data?.session) {
        setRecoveryReady(true);
      } else {
        setError(
          "This password reset link is invalid or has expired. Please request a new link."
        );
      }

      setCheckingSession(false);
    };


    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        (event, session) => {

          if (
            event === "PASSWORD_RECOVERY" &&
            session
          ) {

            setRecoveryReady(true);
            setCheckingSession(false);

          }

        }
      );


    checkRecoverySession();


    return () => {

      mounted = false;

      listener?.subscription?.unsubscribe();

    };

  }, []);


  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setMessage("");


    if (password.length < 6) {

      setError(
        "Password must be at least 6 characters."
      );

      return;
    }


    if (password !== confirmPassword) {

      setError(
        "Passwords do not match."
      );

      return;
    }


    setLoading(true);


    try {

      const {
        error,
      } =
        await supabase.auth.updateUser({
          password,
        });


      if (error) {
        throw error;
      }


      setMessage(
        "Your password has been updated successfully."
      );


      setPassword("");
      setConfirmPassword("");


      setTimeout(() => {

        navigate("/login");

      }, 2000);


    } catch (err) {

      console.error(
        "Password update error:",
        err
      );

      setError(
        err?.message ||
          "Unable to update password."
      );

    } finally {

      setLoading(false);

    }

  };


  if (checkingSession) {

    return (

      <main className="page">

        <div className="container py-5">

          <div className="text-center py-5">

            <div
              className="spinner-border text-success"
              role="status"
            />

            <p className="text-muted mt-3">
              Checking password reset link...
            </p>

          </div>

        </div>

      </main>

    );

  }


  return (

    <main className="page">

      <div className="container py-5">

        <div className="row justify-content-center">

          <div className="col-12 col-md-7 col-lg-5">

            <div className="card border-0 shadow-sm rounded-4">

              <div className="card-body p-4 p-md-5">

                <div className="text-center mb-4">

                  <div
                    className="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{
                      width: "64px",
                      height: "64px",
                      fontSize: "24px",
                    }}
                  >
                    <FaLock />
                  </div>

                  <h2 className="fw-bold">
                    Create New Password
                  </h2>

                  <p className="text-muted mb-0">
                    Enter your new password below.
                  </p>

                </div>


                {error && (

                  <div className="alert alert-danger rounded-3">

                    {error}

                  </div>

                )}


                {message && (

                  <div className="alert alert-success rounded-3">

                    <FaCheckCircle className="me-2" />

                    {message}

                  </div>

                )}


                {recoveryReady && !message && (

                  <form
                    onSubmit={handleSubmit}
                  >

                    <div className="mb-3">

                      <label className="form-label fw-semibold">
                        New Password
                      </label>

                      <input
                        type="password"
                        className="form-control form-control-lg rounded-3"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) =>
                          setPassword(
                            e.target.value
                          )
                        }
                        autoComplete="new-password"
                        required
                      />

                      <small className="text-muted">
                        Minimum 6 characters.
                      </small>

                    </div>


                    <div className="mb-4">

                      <label className="form-label fw-semibold">
                        Confirm Password
                      </label>

                      <input
                        type="password"
                        className="form-control form-control-lg rounded-3"
                        placeholder="Confirm new password"
                        value={
                          confirmPassword
                        }
                        onChange={(e) =>
                          setConfirmPassword(
                            e.target.value
                          )
                        }
                        autoComplete="new-password"
                        required
                      />

                    </div>


                    <button
                      type="submit"
                      className="btn btn-success btn-lg w-100 rounded-pill"
                      disabled={loading}
                    >

                      {loading
                        ? "Updating..."
                        : "Update Password"}

                    </button>

                  </form>

                )}


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