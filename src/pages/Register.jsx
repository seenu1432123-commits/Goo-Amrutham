import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import logo from "../assets/images/logo.jpeg";

export default function Register() {
    const { register, supabaseConfigured } = useApp();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const update = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        setError("");
    };

    const submit = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        const name = form.name.trim();
        const email = form.email.trim().toLowerCase();
        const phone = form.phone.replace(/\D/g, "");

        if (!supabaseConfigured) {
            setError("Supabase is not configured.");
            return;
        }

        if (!name) {
            setError("Please enter your name.");
            return;
        }

        if (!email) {
            setError("Please enter your email.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (
            phone &&
            !/^[6-9][0-9]{9}$/.test(phone)
        ) {
            setError(
                "Please enter a valid 10-digit mobile number."
            );
            return;
        }

        if (form.password.length < 6) {
            setError(
                "Password must be at least 6 characters."
            );
            return;
        }

        if (
            form.password !==
            form.confirmPassword
        ) {
            setError("Passwords do not match.");
            return;
        }

        setBusy(true);

        try {
            const result = await register({
                name,
                email,
                phone: phone
                    ? `+91${phone}`
                    : null,
                password: form.password,
            });

            if (
                result?.needsEmailConfirmation
            ) {
                setMessage(
                    "Account created! Please check your email and verify your account before signing in."
                );

                setForm({
                    name: "",
                    email,
                    phone: "",
                    password: "",
                    confirmPassword: "",
                });

                return;
            }

            navigate("/");
        } catch (err) {
            console.error(
                "Register error:",
                err
            );

            setError(
                err?.message ||
                    "Unable to create your account."
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <main className="register-page">

            <div className="register-container">

                {/* HEADER */}

                <header className="register-header">

                    <Link
                        to="/"
                        className="logo-link"
                    >
                        <img
                            src={logo}
                            alt="Goo Amrutham"
                        />
                    </Link>

                    <div>
                        <h1>Create account</h1>

                        <p>
                            Join Goo Amrutham
                        </p>
                    </div>

                </header>

                {/* FORM CARD */}

                <section className="register-card">

                    <div className="welcome">

                        <h2>
                            Welcome to
                            <span> Goo Amrutham</span>
                        </h2>

                        <p>
                            Create your account to
                            order fresh milk and manage
                            your deliveries.
                        </p>

                    </div>

                    {/* ERROR */}

                    {error && (
                        <div className="error-box">
                            <span>!</span>
                            <div>{error}</div>
                        </div>
                    )}

                    {/* SUCCESS */}

                    {message && (
                        <div className="success-box">
                            <span>✓</span>
                            <div>{message}</div>
                        </div>
                    )}

                    {!message && (
                        <form onSubmit={submit}>

                            {/* NAME */}

                            <div className="field">

                                <label>
                                    Full name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    autoComplete="name"
                                    value={form.name}
                                    onChange={(e) =>
                                        update(
                                            "name",
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                            {/* EMAIL */}

                            <div className="field">

                                <label>
                                    Email address
                                </label>

                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    value={form.email}
                                    onChange={(e) =>
                                        update(
                                            "email",
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                            {/* PHONE */}

                            <div className="field">

                                <label>
                                    Mobile number
                                    <small>
                                        Optional
                                    </small>
                                </label>

                                <div className="phone-input">

                                    <span>
                                        +91
                                    </span>

                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={10}
                                        autoComplete="tel"
                                        placeholder="10-digit number"
                                        value={form.phone}
                                        onChange={(e) =>
                                            update(
                                                "phone",
                                                e.target.value
                                                    .replace(
                                                        /\D/g,
                                                        ""
                                                    )
                                                    .slice(
                                                        0,
                                                        10
                                                    )
                                            )
                                        }
                                    />

                                </div>

                            </div>

                            {/* PASSWORD */}

                            <div className="field">

                                <label>
                                    Password
                                </label>

                                <div className="password-input">

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="At least 6 characters"
                                        autoComplete="new-password"
                                        value={
                                            form.password
                                        }
                                        onChange={(e) =>
                                            update(
                                                "password",
                                                e.target.value
                                            )
                                        }
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                    >
                                        {showPassword
                                            ? "Hide"
                                            : "Show"}
                                    </button>

                                </div>

                            </div>

                            {/* CONFIRM */}

                            <div className="field">

                                <label>
                                    Confirm password
                                </label>

                                <div className="password-input">

                                    <input
                                        type={
                                            showConfirm
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Enter password again"
                                        autoComplete="new-password"
                                        value={
                                            form.confirmPassword
                                        }
                                        onChange={(e) =>
                                            update(
                                                "confirmPassword",
                                                e.target.value
                                            )
                                        }
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirm(
                                                !showConfirm
                                            )
                                        }
                                    >
                                        {showConfirm
                                            ? "Hide"
                                            : "Show"}
                                    </button>

                                </div>

                            </div>

                            {/* SUBMIT */}

                            <button
                                type="submit"
                                disabled={
                                    busy ||
                                    !supabaseConfigured
                                }
                                className="create-button"
                            >
                                {busy
                                    ? "Creating account..."
                                    : "Create account"}
                            </button>

                        </form>
                    )}

                    {/* LOGIN */}

                    <div className="login-area">

                        <span>
                            Already have an account?
                        </span>

                        <Link to="/login">
                            Sign in
                        </Link>

                    </div>

                    <div className="terms">
                        By creating an account, you
                        agree to Goo Amrutham's terms
                        and privacy policy.
                    </div>

                </section>

            </div>

            <style>{`

                * {
                    box-sizing: border-box;
                }

                .register-page {
                    min-height: 100vh;
                    min-height: 100dvh;
                    background: #f6faf7;
                    padding: 30px 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-family: inherit;
                }

                .register-container {
                    width: 100%;
                    max-width: 470px;
                }

                /* HEADER */

                .register-header {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 18px;
                }

                .logo-link {
                    flex-shrink: 0;
                }

                .logo-link img {
                    width: 58px;
                    height: 58px;
                    object-fit: cover;
                    border-radius: 15px;
                    background: white;
                    padding: 3px;
                    box-shadow:
                        0 5px 18px
                        rgba(25,135,84,.12);
                }

                .register-header h1 {
                    margin: 0;
                    font-size: 24px;
                    line-height: 1.2;
                    font-weight: 800;
                    color: #18231d;
                }

                .register-header p {
                    margin: 3px 0 0;
                    font-size: 13px;
                    color: #7a877f;
                }

                /* CARD */

                .register-card {
                    background: white;
                    border-radius: 22px;
                    padding: 28px;
                    border: 1px solid #e6eee8;
                    box-shadow:
                        0 12px 40px
                        rgba(25,135,84,.07);
                }

                .welcome {
                    margin-bottom: 23px;
                }

                .welcome h2 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 800;
                    color: #1d2921;
                }

                .welcome h2 span {
                    color: #198754;
                }

                .welcome p {
                    margin: 7px 0 0;
                    color: #7b877f;
                    font-size: 13px;
                    line-height: 1.5;
                }

                /* FIELDS */

                .field {
                    margin-bottom: 16px;
                }

                .field label {
                    display: block;
                    font-size: 13px;
                    font-weight: 700;
                    color: #354239;
                    margin-bottom: 7px;
                }

                .field label small {
                    margin-left: 6px;
                    color: #9aa49e;
                    font-size: 10px;
                    font-weight: 500;
                }

                .field input {
                    width: 100%;
                    height: 50px;
                    border: 1px solid #dfe7e1;
                    border-radius: 11px;
                    background: #fbfdfb;
                    padding: 0 14px;
                    outline: none;
                    font-size: 14px;
                    color: #1c2820;
                    transition: .2s;
                }

                .field input:focus {
                    border-color: #198754;
                    background: white;
                    box-shadow:
                        0 0 0 3px
                        rgba(25,135,84,.08);
                }

                .field input::placeholder {
                    color: #a5aea8;
                }

                /* PHONE */

                .phone-input {
                    display: flex;
                    height: 50px;
                    border: 1px solid #dfe7e1;
                    border-radius: 11px;
                    overflow: hidden;
                    background: #fbfdfb;
                }

                .phone-input:focus-within {
                    border-color: #198754;
                    box-shadow:
                        0 0 0 3px
                        rgba(25,135,84,.08);
                    background: white;
                }

                .phone-input span {
                    width: 58px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f0f7f2;
                    color: #198754;
                    font-size: 13px;
                    font-weight: 800;
                    border-right: 1px solid #dfe7e1;
                }

                .phone-input input {
                    border: 0;
                    box-shadow: none;
                    border-radius: 0;
                    background: transparent;
                }

                .phone-input input:focus {
                    box-shadow: none;
                    border: 0;
                }

                /* PASSWORD */

                .password-input {
                    position: relative;
                }

                .password-input input {
                    padding-right: 65px;
                }

                .password-input button {
                    position: absolute;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    border: 0;
                    background: transparent;
                    color: #198754;
                    font-size: 11px;
                    font-weight: 800;
                    cursor: pointer;
                    padding: 8px;
                }

                /* BUTTON */

                .create-button {
                    width: 100%;
                    height: 52px;
                    margin-top: 5px;
                    border: 0;
                    border-radius: 12px;
                    background: #198754;
                    color: white;
                    font-size: 14px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: .2s;
                }

                .create-button:hover:not(:disabled) {
                    background: #157347;
                }

                .create-button:active:not(:disabled) {
                    transform: scale(.99);
                }

                .create-button:disabled {
                    opacity: .55;
                    cursor: not-allowed;
                }

                /* MESSAGES */

                .error-box,
                .success-box {
                    display: flex;
                    gap: 10px;
                    padding: 12px;
                    border-radius: 10px;
                    margin-bottom: 18px;
                    font-size: 12px;
                    line-height: 1.45;
                }

                .error-box {
                    background: #fff2f2;
                    color: #a52834;
                    border: 1px solid #f2c5c8;
                }

                .success-box {
                    background: #edf9f1;
                    color: #12683e;
                    border: 1px solid #c5e5cf;
                }

                .error-box span,
                .success-box span {
                    width: 20px;
                    height: 20px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    color: white;
                    font-weight: 800;
                }

                .error-box span {
                    background: #dc3545;
                }

                .success-box span {
                    background: #198754;
                }

                /* LOGIN */

                .login-area {
                    margin-top: 22px;
                    padding-top: 20px;
                    border-top: 1px solid #edf1ee;
                    text-align: center;
                    font-size: 12px;
                    color: #7b877f;
                }

                .login-area a {
                    color: #198754;
                    font-weight: 800;
                    text-decoration: none;
                    margin-left: 5px;
                }

                .terms {
                    text-align: center;
                    margin-top: 14px;
                    color: #a0aaa4;
                    font-size: 9px;
                    line-height: 1.5;
                }

                /* MOBILE */

                @media (max-width: 576px) {

                    .register-page {
                        padding:
                            16px
                            14px
                            24px;
                        align-items: flex-start;
                    }

                    .register-container {
                        max-width: 100%;
                    }

                    .register-header {
                        margin-top: 3px;
                        margin-bottom: 15px;
                    }

                    .logo-link img {
                        width: 50px;
                        height: 50px;
                        border-radius: 13px;
                    }

                    .register-header h1 {
                        font-size: 21px;
                    }

                    .register-header p {
                        font-size: 12px;
                    }

                    .register-card {
                        padding: 21px 17px;
                        border-radius: 18px;
                    }

                    .welcome {
                        margin-bottom: 20px;
                    }

                    .welcome h2 {
                        font-size: 18px;
                    }

                    .welcome p {
                        font-size: 12px;
                    }

                    .field {
                        margin-bottom: 14px;
                    }

                    .field label {
                        font-size: 12px;
                    }

                    .field input,
                    .phone-input {
                        height: 48px;
                    }

                    .field input {
                        font-size: 14px;
                    }

                    .create-button {
                        height: 50px;
                    }

                }

                @media (max-width: 360px) {

                    .register-page {
                        padding-left: 10px;
                        padding-right: 10px;
                    }

                    .register-card {
                        padding: 19px 14px;
                    }

                    .welcome h2 {
                        font-size: 17px;
                    }

                    .field input,
                    .phone-input {
                        height: 46px;
                    }

                }

            `}</style>

        </main>
    );
}