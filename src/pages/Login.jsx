import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import logo from "../assets/images/logo.jpeg";

export default function Login() {
  const { login, supabaseConfigured } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setBusy(true);

    try {
      const u = await login(form.email, form.password);

      navigate(u?.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(
        err?.message ||
          "Unable to sign in. Please check your email and password."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">

        {/* LOGO */}
        <img
          src={logo}
          className="auth-logo"
          alt="Goo Amrutham"
        />

        <span className="eyebrow">
          WELCOME BACK
        </span>

        <h1>Sign in</h1>

        <p>
          Access your orders, live tracking and profile.
        </p>

        {/* SUPABASE WARNING */}
        {!supabaseConfigured && (
          <div className="alert alert-warning">
            Supabase is not configured yet. Add the values from{" "}
            <code>.env</code>.
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={submit}>

          {/* EMAIL */}
          <label>
            Email

            <input
              type="email"
              className="form-control"
              required
              autoComplete="email"
              inputMode="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />
          </label>

          {/* PASSWORD */}
          <label>
            Password

            <input
              type="password"
              className="form-control"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
            />
          </label>

          {/* FORGOT PASSWORD */}
          <div className="text-end mb-3">
            <Link
              to="/forgot-password"
              className="text-success text-decoration-none fw-semibold"
            >
              Forgot Password?
            </Link>
          </div>

          {/* SIGN IN */}
          <button
            type="submit"
            disabled={busy || !supabaseConfigured}
            className="btn btn-success w-100 btn-lg rounded-pill"
          >
            {busy ? "Signing in…" : "Sign In"}
          </button>

        </form>

        {/* REGISTER */}
        <p className="small mt-4 mb-0">
          New customer?{" "}
          <Link to="/register">
            Create an account
          </Link>
        </p>

      </div>
    </main>
  );
}