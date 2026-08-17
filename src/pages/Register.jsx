import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import logo from "../assets/images/logo.jpeg";

export default function Register() {

    const {
        register,
        sendTestOtp,
        verifyTestOtp,
        supabaseConfigured,
    } = useApp();

    const navigate = useNavigate();


    const [step, setStep] = useState("form");

    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
    });

    const [otp, setOtp] = useState("");

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [busy, setBusy] = useState(false);

    const [countdown, setCountdown] = useState(0);


    // =====================================================
    // COUNTDOWN
    // =====================================================

    useEffect(() => {

        if (countdown <= 0) {
            return;
        }

        const timer =
            setInterval(() => {

                setCountdown(
                    previous =>
                        previous > 0
                            ? previous - 1
                            : 0
                );

            }, 1000);

        return () =>
            clearInterval(timer);

    }, [countdown]);


    // =====================================================
    // FIELD UPDATE
    // =====================================================

    const updateField = (
        field,
        value
    ) => {

        setForm(previous => ({
            ...previous,
            [field]: value,
        }));
    };


    // =====================================================
    // SEND OTP
    // =====================================================

    const handleSendOtp = async () => {

        setError("");
        setMessage("");

        const phone =
            form.phone.replace(
                /\D/g,
                ""
            );

        if (phone.length !== 10) {

            setError(
                "Please enter a valid 10-digit mobile number."
            );

            return;
        }

        setBusy(true);

        try {

            await sendTestOtp(
                phone
            );

            setStep("otp");

            setCountdown(60);

            setMessage(
                "Development OTP sent successfully."
            );

        } catch (err) {

            setError(
                err?.message ||
                "Unable to send OTP."
            );

        } finally {

            setBusy(false);
        }
    };


    // =====================================================
    // VERIFY OTP
    // =====================================================

    const handleVerifyOtp = async () => {

        setError("");
        setMessage("");

        if (
            otp.trim().length !== 6
        ) {

            setError(
                "Please enter the 6-digit OTP."
            );

            return;
        }

        setBusy(true);

        try {

            await verifyTestOtp(
                form.phone,
                otp
            );

            setMessage(
                "Mobile number verified successfully!"
            );

            // ---------------------------------------------
            // NOW CREATE THE SUPABASE ACCOUNT
            // ---------------------------------------------

            const result =
                await register(form);

            if (
                result?.needsEmailConfirmation
            ) {

                setError(
                    "Email confirmation is still enabled in Supabase. Please turn OFF Confirm email in Authentication settings."
                );

                return;
            }

            navigate("/");

        } catch (err) {

            setError(
                err?.message ||
                "Unable to verify mobile number."
            );

        } finally {

            setBusy(false);
        }
    };


    // =====================================================
    // RESEND OTP
    // =====================================================

    const resendOtp = async () => {

        if (countdown > 0) {
            return;
        }

        setOtp("");
        setError("");
        setMessage("");

        setBusy(true);

        try {

            await sendTestOtp(
                form.phone
            );

            setCountdown(60);

            setMessage(
                "A new development OTP has been generated."
            );

        } catch (err) {

            setError(
                err?.message ||
                "Unable to resend OTP."
            );

        } finally {

            setBusy(false);
        }
    };


    // =====================================================
    // OTP SCREEN
    // =====================================================

    if (step === "otp") {

        return (

            <main className="auth-page">

                <div className="auth-card">

                    <img
                        src={logo}
                        className="auth-logo"
                        alt="Goo Amrutham"
                    />

                    <span className="eyebrow">
                        MOBILE VERIFICATION
                    </span>

                    <h1>
                        Verify your number
                    </h1>

                    <p>
                        Enter the 6-digit OTP sent
                        to your mobile number.
                    </p>


                    <div className="fw-bold text-success mb-3">
                        +91 {form.phone}
                    </div>


                    {/* DEVELOPMENT NOTICE */}

                    <div className="alert alert-warning text-start">

                        <strong>
                            Development mode
                        </strong>

                        <div className="mt-2">

                            No SMS is being sent yet.

                        </div>

                        <div className="mt-1">

                            Use development OTP:

                            <strong className="ms-1">
                                123456
                            </strong>

                        </div>

                    </div>


                    {message && (
                        <div className="alert alert-success">
                            {message}
                        </div>
                    )}


                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}


                    {/* OTP */}

                    <label>
                        Enter OTP

                        <input
                            type="text"
                            className="form-control text-center"
                            inputMode="numeric"
                            maxLength="6"
                            autoComplete="one-time-code"
                            placeholder="123456"
                            value={otp}
                            onChange={(e) =>
                                setOtp(
                                    e.target.value
                                        .replace(
                                            /\D/g,
                                            ""
                                        )
                                )
                            }
                            style={{
                                fontSize: "24px",
                                letterSpacing: "8px",
                            }}
                        />

                    </label>


                    {/* VERIFY */}

                    <button
                        type="button"
                        disabled={
                            busy ||
                            otp.length !== 6
                        }
                        onClick={
                            handleVerifyOtp
                        }
                        className="btn btn-success w-100 btn-lg rounded-pill"
                    >

                        {busy
                            ? "Verifying..."
                            : "Verify Mobile"
                        }

                    </button>


                    {/* RESEND */}

                    <button
                        type="button"
                        disabled={
                            busy ||
                            countdown > 0
                        }
                        onClick={resendOtp}
                        className="btn btn-outline-success w-100 rounded-pill mt-3"
                    >

                        {countdown > 0
                            ? `Resend OTP in ${countdown}s`
                            : "Resend OTP"
                        }

                    </button>


                    {/* BACK */}

                    <button
                        type="button"
                        className="btn btn-link text-success mt-2"
                        onClick={() => {

                            setStep("form");
                            setOtp("");
                            setError("");
                            setMessage("");

                        }}
                    >
                        Change mobile number
                    </button>

                </div>

            </main>
        );
    }


    // =====================================================
    // REGISTRATION FORM
    // =====================================================

    return (

        <main className="auth-page">

            <div className="auth-card">

                <img
                    src={logo}
                    className="auth-logo"
                    alt="Goo Amrutham"
                />

                <span className="eyebrow">
                    JOIN GOO AMRUTHAM
                </span>

                <h1>
                    Create account
                </h1>

                <p>
                    Verify your mobile number
                    to create your account.
                </p>


                {!supabaseConfigured && (

                    <div className="alert alert-warning">

                        Supabase is not configured.

                    </div>

                )}


                {error && (

                    <div className="alert alert-danger">
                        {error}
                    </div>

                )}


                <form
                    onSubmit={(e) => {

                        e.preventDefault();

                        handleSendOtp();

                    }}
                >


                    {/* NAME */}

                    <label>
                        Full name

                        <input
                            type="text"
                            className="form-control"
                            required
                            autoComplete="name"
                            value={form.name}
                            onChange={(e) =>
                                updateField(
                                    "name",
                                    e.target.value
                                )
                            }
                        />

                    </label>


                    {/* MOBILE */}

                    <label>
                        Mobile number

                        <input
                            type="tel"
                            className="form-control"
                            required
                            pattern="[0-9]{10}"
                            maxLength="10"
                            inputMode="numeric"
                            autoComplete="tel"
                            placeholder="10-digit mobile number"
                            value={form.phone}
                            onChange={(e) =>
                                updateField(
                                    "phone",
                                    e.target.value.replace(
                                        /\D/g,
                                        ""
                                    )
                                )
                            }
                        />

                    </label>


                    {/* EMAIL */}

                    <label>
                        Email

                        <input
                            type="email"
                            className="form-control"
                            required
                            autoComplete="email"
                            value={form.email}
                            onChange={(e) =>
                                updateField(
                                    "email",
                                    e.target.value
                                )
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
                            minLength={8}
                            autoComplete="new-password"
                            placeholder="Minimum 8 characters"
                            value={form.password}
                            onChange={(e) =>
                                updateField(
                                    "password",
                                    e.target.value
                                )
                            }
                        />

                    </label>


                    {/* SEND OTP */}

                    <button
                        type="submit"
                        disabled={
                            busy ||
                            !supabaseConfigured
                        }
                        className="btn btn-success w-100 btn-lg rounded-pill"
                    >

                        {busy
                            ? "Sending OTP..."
                            : "Verify Mobile & Continue"
                        }

                    </button>

                </form>


                <p className="small mt-4 mb-0">

                    Already registered?{" "}

                    <Link to="/login">
                        Sign in
                    </Link>

                </p>

            </div>

        </main>
    );
}