import React, {
    useEffect,
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    useApp,
} from "../context/AppContext";

import logo from "../assets/images/logo.jpeg";


export default function Login() {

    const {
        login,
        sendPhoneOtp,
        verifyPhoneOtp,
        resendPhoneOtp,
        supabaseConfigured,
    } = useApp();


    const navigate =
        useNavigate();


    // =====================================================
    // LOGIN METHOD
    // =====================================================

    const [
        method,
        setMethod,
    ] = useState(
        "email"
    );


    // =====================================================
    // EMAIL
    // =====================================================

    const [
        emailForm,
        setEmailForm,
    ] = useState({
        email:
            "",
        password:
            "",
    });


    // =====================================================
    // PHONE
    // =====================================================

    const [
        phone,
        setPhone,
    ] = useState(
        ""
    );


    const [
        otp,
        setOtp,
    ] = useState(
        ""
    );


    const [
        phoneStep,
        setPhoneStep,
    ] = useState(
        "phone"
    );


    const [
        countdown,
        setCountdown,
    ] = useState(
        0
    );


    // =====================================================
    // COMMON
    // =====================================================

    const [
        error,
        setError,
    ] = useState(
        ""
    );


    const [
        message,
        setMessage,
    ] = useState(
        ""
    );


    const [
        busy,
        setBusy,
    ] = useState(
        false
    );


    // =====================================================
    // COUNTDOWN
    // =====================================================

    useEffect(
        () => {

            if (
                countdown <= 0
            ) {

                return;

            }


            const timer =
                setInterval(
                    () => {

                        setCountdown(
                            (
                                previous
                            ) =>
                                previous > 0
                                    ? previous - 1
                                    : 0
                        );

                    },
                    1000
                );


            return () =>
                clearInterval(
                    timer
                );

        },
        [
            countdown,
        ]
    );


    // =====================================================
    // CLEAR
    // =====================================================

    const clearMessages =
        () => {

            setError(
                ""
            );

            setMessage(
                ""
            );

        };


    // =====================================================
    // EMAIL LOGIN
    // =====================================================

    const submitEmailLogin =
        async (
            e
        ) => {

            e.preventDefault();

            clearMessages();

            setBusy(
                true
            );


            try {

                const user =
                    await login(
                        emailForm.email,
                        emailForm.password
                    );


                navigate(
                    user?.role ===
                        "admin"
                        ? "/admin"
                        : "/"
                );

            } catch (
            error
            ) {

                setError(
                    error?.message ||
                    "Unable to sign in."
                );

            } finally {

                setBusy(
                    false
                );

            }

        };


    // =====================================================
    // SEND OTP
    // =====================================================

    const sendPhoneOtpHandler =
        async () => {

            clearMessages();


            const cleanPhone =
                phone.replace(
                    /\D/g,
                    ""
                );


            if (
                cleanPhone.length !==
                10 ||
                !/^[6-9]/.test(
                    cleanPhone
                )
            ) {

                setError(
                    "Please enter a valid 10-digit Indian mobile number."
                );

                return;

            }


            setBusy(
                true
            );


            try {

                await sendPhoneOtp(
                    cleanPhone
                );


                setPhone(
                    cleanPhone
                );

                setOtp(
                    ""
                );

                setPhoneStep(
                    "otp"
                );

                setCountdown(
                    60
                );


                setMessage(
                    "OTP sent successfully. Please check your mobile."
                );

            } catch (
            error
            ) {

                console.error(
                    error
                );


                setError(
                    error?.message ||
                    "Unable to send OTP."
                );

            } finally {

                setBusy(
                    false
                );

            }

        };


    // =====================================================
    // VERIFY OTP
    // =====================================================

    const verifyPhoneOtpHandler =
        async () => {

            clearMessages();


            const cleanOtp =
                otp.replace(
                    /\D/g,
                    ""
                );


            if (
                cleanOtp.length !==
                4
            ) {

                setError(
                    "Please enter the 4-digit OTP."
                );

                return;

            }


            setBusy(
                true
            );


            try {

                const result =
                    await verifyPhoneOtp(
                        phone,
                        cleanOtp
                    );


                /*
                 * IMPORTANT
                 *
                 * MSG91 verification succeeded.
                 *
                 * However, MSG91 does not automatically
                 * create a Supabase Auth session.
                 */

                if (
                    result?.success
                ) {

                    setMessage(
                        "Mobile number verified successfully."
                    );


                    /*
                     * If a Supabase profile exists,
                     * show the user that verification
                     * succeeded but email/password
                     * authentication is still required.
                     */

                    if (
                        result?.profile
                    ) {

                        setTimeout(
                            () => {

                                setMessage(
                                    "Mobile verified. Please sign in with your email and password to access your account."
                                );

                            },
                            500
                        );

                    } else {

                        setTimeout(
                            () => {

                                setMessage(
                                    "Mobile verified successfully. Please create an account using this mobile number."
                                );

                            },
                            500
                        );

                    }

                }

            } catch (
            error
            ) {

                console.error(
                    error
                );


                setError(
                    error?.message ||
                    "Invalid or expired OTP."
                );

            } finally {

                setBusy(
                    false
                );

            }

        };


    // =====================================================
    // RESEND OTP
    // =====================================================

    const resendOtp =
        async () => {

            if (
                countdown > 0
            ) {

                return;

            }


            clearMessages();

            setOtp(
                ""
            );

            setBusy(
                true
            );


            try {

                await resendPhoneOtp(
                    phone
                );


                setCountdown(
                    60
                );


                setMessage(
                    "A new OTP has been sent."
                );

            } catch (
            error
            ) {

                setError(
                    error?.message ||
                    "Unable to resend OTP."
                );

            } finally {

                setBusy(
                    false
                );

            }

        };


    // =====================================================
    // CHANGE NUMBER
    // =====================================================

    const changePhone =
        () => {

            setPhoneStep(
                "phone"
            );

            setOtp(
                ""
            );

            setCountdown(
                0
            );

            clearMessages();

        };


    // =====================================================
    // SWITCH LOGIN
    // =====================================================

    const switchMethod =
        (
            newMethod
        ) => {

            setMethod(
                newMethod
            );

            setPhoneStep(
                "phone"
            );

            setOtp(
                ""
            );

            setCountdown(
                0
            );

            clearMessages();

        };


    // =====================================================
    // OTP SCREEN
    // =====================================================

    if (
        method === "phone" &&
        phoneStep === "otp"
    ) {

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
                        Enter the 6-digit OTP
                        sent to your mobile.
                    </p>


                    <div className="fw-bold text-success mb-3">

                        +91 {phone}

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


                    <label>

                        Enter OTP

                        <input
                            type="text"
                            className="form-control text-center"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={4}
                            minLength={4}
                            pattern="[0-9]{4}"
                            placeholder="••••"
                            value={otp}
                            autoFocus
                            onChange={(e) => {
                                const value = e.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 4);

                                setOtp(value);

                                if (error) {
                                    setError("");
                                }
                            }}
                            onKeyDown={(e) => {
                                if (
                                    e.key === "Enter" &&
                                    otp.length === 4 &&
                                    !busy
                                ) {
                                    e.preventDefault();
                                    verifyPhoneOtpHandler();
                                }
                            }}
                            style={{
                                fontSize: "24px",
                                letterSpacing: "8px",
                                textAlign: "center",
                                marginTop: "6px",
                                marginBottom: "16px",
                            }}
                        />

                    </label>


                    <button
                        type="button"
                        disabled={busy || otp.length !== 4}
                        onClick={verifyPhoneOtpHandler}
                        className="btn btn-success w-100 btn-lg rounded-pill"
                    >
                        {busy ? "Verifying..." : "Verify & Sign In"}
                    </button>

                    <button
                        type="button"
                        disabled={
                            busy ||
                            countdown >
                            0
                        }
                        onClick={
                            resendOtp
                        }
                        className="btn btn-outline-success w-100 rounded-pill mt-3"
                    >

                        {countdown >
                            0
                            ? `Resend OTP in ${countdown}s`
                            : "Resend OTP"
                        }

                    </button>


                    <button
                        type="button"
                        onClick={
                            changePhone
                        }
                        className="btn btn-link text-success mt-2"
                    >

                        Change mobile number

                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            switchMethod(
                                "email"
                            )
                        }
                        className="btn btn-link text-secondary"
                    >

                        Sign in with email instead

                    </button>

                </div>

            </main>

        );

    }


    // =====================================================
    // MAIN LOGIN
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
                    WELCOME BACK
                </span>


                <h1>
                    Sign in
                </h1>


                <p>
                    Access your orders,
                    live tracking and profile.
                </p>


                {!supabaseConfigured && (

                    <div className="alert alert-warning">

                        Supabase is not configured.

                        <br />

                        Check your
                        <code>
                            .env
                        </code>
                        file.

                    </div>

                )}


                {error && (

                    <div className="alert alert-danger">

                        {error}

                    </div>

                )}


                {message && (

                    <div className="alert alert-success">

                        {message}

                    </div>

                )}


                {/* ================================================= */}
                {/* EMAIL */}
                {/* ================================================= */}

                {method === "email" && (

                    <form
                        onSubmit={
                            submitEmailLogin
                        }
                    >

                        <label>

                            Email

                            <input
                                type="email"
                                className="form-control"
                                required
                                autoComplete="email"
                                value={
                                    emailForm.email
                                }
                                onChange={
                                    (
                                        e
                                    ) =>
                                        setEmailForm(
                                            {
                                                ...emailForm,

                                                email:
                                                    e.target.value,
                                            }
                                        )
                                }
                            />

                        </label>


                        <label>

                            Password

                            <input
                                type="password"
                                className="form-control"
                                required
                                autoComplete="current-password"
                                value={
                                    emailForm.password
                                }
                                onChange={
                                    (
                                        e
                                    ) =>
                                        setEmailForm(
                                            {
                                                ...emailForm,

                                                password:
                                                    e.target.value,
                                            }
                                        )
                                }
                            />

                        </label>


                        <div className="text-end mb-3">

                            <Link
                                to="/forgot-password"
                                className="text-success text-decoration-none fw-semibold"
                            >
                                Forgot Password?
                            </Link>

                        </div>


                        <button
                            type="submit"
                            disabled={
                                busy ||
                                !supabaseConfigured
                            }
                            className="btn btn-success w-100 btn-lg rounded-pill"
                        >

                            {busy
                                ? "Signing in..."
                                : "Sign In"
                            }

                        </button>

                    </form>

                )}


                {/* ================================================= */}
                {/* PHONE */}
                {/* ================================================= */}

                {method === "phone" && (

                    <div>

                        <label>

                            Mobile number

                            <div
                                className="input-group"
                                style={{
                                    marginTop:
                                        "6px",

                                    marginBottom:
                                        "16px",
                                }}
                            >

                                <span className="input-group-text">
                                    +91
                                </span>


                                <input
                                    type="tel"
                                    className="form-control"
                                    maxLength="10"
                                    inputMode="numeric"
                                    autoComplete="tel"
                                    placeholder="10-digit mobile number"
                                    value={
                                        phone
                                    }
                                    onChange={
                                        (
                                            e
                                        ) => {

                                            setPhone(
                                                e.target.value.replace(
                                                    /\D/g,
                                                    ""
                                                )
                                            );


                                            if (
                                                error
                                            ) {

                                                setError(
                                                    ""
                                                );

                                            }

                                        }
                                    }
                                    onKeyDown={
                                        (
                                            e
                                        ) => {

                                            if (
                                                e.key ===
                                                "Enter" &&
                                                phone.length ===
                                                10
                                            ) {

                                                e.preventDefault();

                                                sendPhoneOtpHandler();

                                            }

                                        }
                                    }
                                />

                            </div>

                        </label>


                        <button
                            type="button"
                            disabled={
                                busy ||
                                !supabaseConfigured ||
                                phone.length !==
                                10
                            }
                            onClick={
                                sendPhoneOtpHandler
                            }
                            className="btn btn-success w-100 btn-lg rounded-pill"
                        >

                            {busy
                                ? "Sending OTP..."
                                : "Send OTP"
                            }

                        </button>


                        <p className="text-muted small mt-3 mb-0">

                            We'll send a real
                            verification OTP
                            to your Indian
                            mobile number.

                        </p>

                    </div>

                )}


                {/* ================================================= */}
                {/* SWITCH */}
                {/* ================================================= */}

                <div className="mt-4">

                    {method === "email"
                        ? (

                            <button
                                type="button"
                                className="btn btn-outline-success w-100 rounded-pill"
                                onClick={() =>
                                    switchMethod(
                                        "phone"
                                    )
                                }
                            >

                                📱 Sign in with
                                Mobile Number

                            </button>

                        )
                        : (

                            <button
                                type="button"
                                className="btn btn-outline-success w-100 rounded-pill"
                                onClick={() =>
                                    switchMethod(
                                        "email"
                                    )
                                }
                            >

                                ✉️ Sign in with
                                Email & Password

                            </button>

                        )}

                </div>


                {/* ================================================= */}
                {/* GOOGLE */}
                {/* ================================================= */}

                <div className="my-4 d-flex align-items-center">

                    <div className="flex-grow-1 border-top" />

                    <span className="mx-3 text-muted small">
                        OR
                    </span>

                    <div className="flex-grow-1 border-top" />

                </div>


                <button
                    type="button"
                    disabled
                    className="btn btn-light border w-100 btn-lg rounded-pill"
                >

                    Continue with Google

                </button>


                {/* ================================================= */}
                {/* REGISTER */}
                {/* ================================================= */}

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