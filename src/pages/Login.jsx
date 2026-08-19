import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaArrowRight, FaShieldAlt } from "react-icons/fa";
import { useApp } from "../context/AppContext";
import logo from "../assets/images/logo.jpeg";

export default function Login() {
    const { login, supabaseConfigured } = useApp();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!supabaseConfigured) {
            setError(
                "Login service is not configured. Please check your Supabase settings."
            );
            return;
        }

        if (!form.email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        if (!form.password) {
            setError("Please enter your password.");
            return;
        }

        setBusy(true);

        try {
            const user = await login(
                form.email.trim(),
                form.password
            );

            if (
                user?.role === "admin" ||
                user?.profile?.role === "admin"
            ) {
                navigate("/admin");
            } else {
                navigate("/");
            }
        } catch (err) {
            console.error("Login error:", err);

            setError(
                err?.message ||
                    "Unable to sign in. Please check your email and password."
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <main className="goo-login-page">

            {/* Animated background */}
            <div className="goo-login-bg">
                <div className="goo-blob goo-blob-one" />
                <div className="goo-blob goo-blob-two" />
                <div className="goo-blob goo-blob-three" />
            </div>

            <div className="goo-login-container">

                {/* =========================================
                    LEFT BRAND PANEL
                ========================================= */}

                <section className="goo-login-brand">

                    <div className="goo-brand-glow" />

                    <div className="goo-brand-content">

                        <div className="goo-logo-wrapper">
                            <img
                                src={logo}
                                alt="Goo Amrutham"
                            />
                        </div>

                        <span className="goo-brand-badge">
                            100% NATURAL • FARM FRESH
                        </span>

                        <h1>
                            Welcome back to
                            <span> Goo Amrutham</span>
                        </h1>

                        <p>
                            Fresh, natural goodness delivered
                            straight from our fields to your home.
                        </p>

                        <div className="goo-brand-line" />

                        <div className="goo-brand-points">

                            <div>
                                <span>✓</span>
                                Pure & Natural Milk
                            </div>

                            <div>
                                <span>✓</span>
                                Fresh Farm-to-Home Delivery
                            </div>

                            <div>
                                <span>✓</span>
                                Easy Subscription Management
                            </div>

                        </div>

                    </div>

                </section>

                {/* =========================================
                    LOGIN CARD
                ========================================= */}

                <section className="goo-login-section">

                    <div className="goo-login-card">

                        {/* Mobile logo */}
                        <div className="goo-mobile-logo">
                            <img
                                src={logo}
                                alt="Goo Amrutham"
                            />
                        </div>

                        <div className="goo-login-header">

                            <span className="goo-small-label">
                                WELCOME BACK
                            </span>

                            <h2>
                                Sign in
                            </h2>

                            <p>
                                Access your orders,
                                subscriptions and account.
                            </p>

                        </div>

                        {/* Error */}
                        {error && (
                            <div className="goo-login-error">
                                <div className="goo-error-icon">
                                    !
                                </div>

                                <div>
                                    {error}
                                </div>
                            </div>
                        )}

                        {!supabaseConfigured && (
                            <div className="goo-login-warning">
                                Login service is currently
                                unavailable. Please check your
                                Supabase configuration.
                            </div>
                        )}

                        {/* =================================
                            FORM
                        ================================= */}

                        <form onSubmit={handleSubmit}>

                            {/* Email */}

                            <div className="goo-field">

                                <label htmlFor="email">
                                    Email address
                                </label>

                                <div className="goo-input-wrapper">

                                    <span className="goo-input-icon">
                                        @
                                    </span>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        disabled={busy}
                                    />

                                </div>

                            </div>

                            {/* Password */}

                            <div className="goo-field">

                                <div className="goo-password-label">

                                    <label htmlFor="password">
                                        Password
                                    </label>

                                    <Link
                                        to="/forgot-password"
                                        className="goo-forgot"
                                    >
                                        Forgot password?
                                    </Link>

                                </div>

                                <div className="goo-input-wrapper">

                                    <span className="goo-input-icon">
                                        •
                                    </span>

                                    <input
                                        id="password"
                                        name="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        disabled={busy}
                                    />

                                    <button
                                        type="button"
                                        className="goo-password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                (prev) => !prev
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                            <FaEyeSlash />
                                        ) : (
                                            <FaEye />
                                        )}
                                    </button>

                                </div>

                            </div>

                            {/* Remember */}

                            <div className="goo-login-options">

                                <label className="goo-checkbox">

                                    <input type="checkbox" />

                                    <span>
                                        Remember me
                                    </span>

                                </label>

                            </div>

                            {/* Submit */}

                            <button
                                type="submit"
                                disabled={
                                    busy ||
                                    !supabaseConfigured
                                }
                                className="goo-login-button"
                            >

                                {busy ? (
                                    <>
                                        <span className="goo-spinner" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <FaArrowRight />
                                    </>
                                )}

                            </button>

                        </form>

                        {/* Security */}

                        <div className="goo-security">

                            <FaShieldAlt />

                            <span>
                                Your account information is securely
                                protected.
                            </span>

                        </div>

                        {/* Divider */}

                        <div className="goo-divider">
                            <span>NEW TO GOO AMRUTHAM?</span>
                        </div>

                        {/* Register */}

                        <Link
                            to="/register"
                            className="goo-create-account"
                        >
                            Create an account
                            <FaArrowRight />
                        </Link>

                        {/* Footer */}

                        <p className="goo-login-footer">
                            From our fields to your home 🥛
                        </p>

                    </div>

                </section>

            </div>

        </main>
    );
}