import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import family from "../assets/images/family-card.png";
import poster from "../assets/images/purity-poster.jpeg";

import farmMorning from "../assets/images/farm-morning.png";
import milking from "../assets/images/about-milking.png";
import filtering from "../assets/images/about-filtering.png";
import farmToHome from "../assets/images/about-farm-to-home.png";
import familyMilk from "../assets/images/about-family-milk.png";
import delivery from "../assets/images/about-delivery.png";
import homeMilk from "../assets/images/about-home-milk.png";

export default function About() {
    /* =========================================================
       SCROLL REVEAL
    ========================================================= */

    useEffect(() => {
        const elements = document.querySelectorAll(
            ".goo-reveal, .goo-reveal-left, .goo-reveal-right, .goo-scale"
        );

        if (!elements.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("goo-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -60px 0px",
            }
        );

        elements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, []);

    return (
        <main className="goo-about-page">

            {/* =====================================================
                HERO
            ===================================================== */}

            <section className="goo-about-hero">

                <div className="goo-hero-image">
                    <img
                        src={farmMorning}
                        alt="Goo Amrutham farm at sunrise"
                    />
                </div>

                <div className="goo-hero-overlay"></div>

                <div className="goo-hero-glow goo-glow-one"></div>
                <div className="goo-hero-glow goo-glow-two"></div>

                <div className="container goo-hero-container">

                    <div className="goo-hero-content">

                        <div className="goo-hero-mini">
                            <span></span>
                            GOO AMRUTHAM
                            <span></span>
                        </div>

                        <h1>
                            From our farms
                            <br />
                            <em>to your home.</em>
                        </h1>

                        <p>
                            A simple milk journey built around freshness,
                            care and the warmth of everyday family life.
                        </p>

                        <Link
                            to="/products"
                            className="goo-hero-btn"
                        >
                            <span>Explore Our Milk</span>
                            <strong>→</strong>
                        </Link>

                    </div>

                </div>

                <div className="goo-hero-bottom">
                    <span>Fresh beginnings</span>
                    <i></i>
                    <span>Farm to home</span>
                    <i></i>
                    <span>Everyday goodness</span>
                </div>

                <div className="goo-scroll-indicator">
                    <span>SCROLL</span>
                    <div></div>
                </div>

            </section>


            {/* =====================================================
                INTRO
            ===================================================== */}

            <section className="goo-intro goo-section">

                <div className="container">

                    <div className="goo-intro-grid">

                        <div className="goo-intro-copy goo-reveal-left">

                            <span className="goo-section-label">
                                GOO AMRUTHAM
                            </span>

                            <h2>
                                Milk that begins
                                <br />
                                <span>with a simple idea.</span>
                            </h2>

                            <p className="goo-lead">
                                Goo Amrutham brings the feeling of the
                                farm closer to everyday life — from the
                                early morning farm routine to the bottle
                                that reaches your home.
                            </p>

                            <p>
                                We believe a milk routine should feel
                                simple, dependable and connected to the
                                people and care behind every bottle.
                            </p>

                            <div className="goo-signature">
                                <span></span>
                                <strong>From our farms to your home</strong>
                            </div>

                        </div>


                        <div className="goo-intro-image-wrap goo-reveal-right">

                            <div className="goo-image-frame">

                                <img
                                    src={family}
                                    alt="Goo Amrutham family"
                                />

                                <div className="goo-image-shine"></div>

                            </div>

                            <div className="goo-floating-brand">

                                <small>GOO</small>

                                <small>Amrutham</small>

                                <p>Home Made Gee</p>

                            </div>

                            <div className="goo-floating-dot"></div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                FARM STORY
            ===================================================== */}

            <section className="goo-story">

                <div className="goo-story-image goo-reveal-left">

                    <img
                        src={milking}
                        alt="Traditional morning milking at the farm"
                    />

                    <div className="goo-story-image-overlay"></div>

                    <div className="goo-image-caption">
                        <span>THE FARM</span>
                        <strong>Where every journey begins</strong>
                    </div>

                </div>


                <div className="goo-story-content goo-reveal-right">

                    <span className="goo-section-label">
                        01 / THE BEGINNING
                    </span>

                    <h2>
                        Early mornings.
                        <br />
                        <span>Honest work.</span>
                    </h2>

                    <p>
                        Every day begins at the farm. Before the
                        world gets busy, the morning routine is
                        already underway.
                    </p>

                    <p>
                        It is this connection to the farm that
                        gives Goo Amrutham its identity — a milk
                        brand inspired by a simpler beginning.
                    </p>

                    <div className="goo-story-line">
                        <span></span>
                        <small>THE BEGINNING</small>
                    </div>

                    <div className="goo-big-number">
                        01
                    </div>

                </div>

            </section>


            {/* =====================================================
                QUALITY
            ===================================================== */}

            <section className="goo-quality goo-section">

                <div className="container">

                    <div className="goo-section-heading goo-reveal">

                        <span className="goo-section-label">
                            OUR CARE
                        </span>

                        <h2>
                            Carefully handled,
                            <br />
                            <span>thoughtfully delivered.</span>
                        </h2>

                        <p>
                            From collection to bottle, every stage is
                            part of the journey.
                        </p>

                    </div>


                    <div className="goo-quality-grid">

                        <div className="goo-quality-image goo-reveal-left">

                            <img
                                src={filtering}
                                alt="Milk being carefully filtered and bottled"
                            />

                            <div className="goo-quality-badge">
                                <span>PURE</span>
                                <strong>CARE</strong>
                            </div>

                        </div>


                        <div className="goo-quality-list">

                            <div
                                className="goo-quality-item goo-reveal-right"
                                style={{ "--delay": "0s" }}
                            >
                                <span className="goo-quality-number">
                                    01
                                </span>

                                <div>
                                    <h3>Careful handling</h3>
                                    <p>
                                        Milk is handled with attention
                                        throughout the preparation
                                        process.
                                    </p>
                                </div>

                            </div>


                            <div
                                className="goo-quality-item goo-reveal-right"
                                style={{ "--delay": ".12s" }}
                            >
                                <span className="goo-quality-number">
                                    02
                                </span>

                                <div>
                                    <h3>Clean preparation</h3>
                                    <p>
                                        A clean and organised process
                                        helps keep the journey from farm
                                        to bottle simple.
                                    </p>
                                </div>

                            </div>


                            <div
                                className="goo-quality-item goo-reveal-right"
                                style={{ "--delay": ".24s" }}
                            >
                                <span className="goo-quality-number">
                                    03
                                </span>

                                <div>
                                    <h3>Ready for your home</h3>
                                    <p>
                                        The final bottle becomes part of
                                        your family's everyday milk
                                        routine.
                                    </p>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                FARM TO HOME BANNER
            ===================================================== */}

            <section className="goo-farm-banner">

                <img
                    src={farmToHome}
                    alt="Goo Amrutham from farm to home"
                />

                <div className="goo-farm-overlay"></div>

                <div className="goo-farm-glow"></div>

                <div className="container goo-farm-content goo-reveal">

                    <span className="goo-section-label goo-light-label">
                        THE JOURNEY
                    </span>

                    <h2>
                        From our farm
                        <br />
                        <span>to your doorstep.</span>
                    </h2>

                    <p>
                        A journey that connects the people behind the
                        milk with the families who enjoy it.
                    </p>

                </div>

            </section>


            {/* =====================================================
                JOURNEY
            ===================================================== */}

            <section className="goo-journey goo-section">

                <div className="container">

                    <div className="goo-section-heading goo-reveal">

                        <span className="goo-section-label">
                            FARM TO HOME
                        </span>

                        <h2>
                            A simple journey.
                        </h2>

                        <p>
                            Five simple moments behind your everyday
                            bottle of milk.
                        </p>

                    </div>


                    <div className="goo-journey-grid">

                        <div
                            className="goo-journey-card goo-reveal"
                            style={{ "--delay": "0s" }}
                        >
                            <span className="goo-step-number">
                                01
                            </span>

                            <div className="goo-journey-icon">
                                🌅
                            </div>

                            <h3>Morning begins</h3>

                            <p>
                                The day starts at the farm.
                            </p>

                        </div>


                        <div
                            className="goo-journey-card goo-reveal"
                            style={{ "--delay": ".1s" }}
                        >
                            <span className="goo-step-number">
                                02
                            </span>

                            <div className="goo-journey-icon">
                                🐄
                            </div>

                            <h3>Milk collection</h3>

                            <p>
                                Milk begins its journey from the farm.
                            </p>

                        </div>


                        <div
                            className="goo-journey-card goo-reveal"
                            style={{ "--delay": ".2s" }}
                        >
                            <span className="goo-step-number">
                                03
                            </span>

                            <div className="goo-journey-icon">
                                🥛
                            </div>

                            <h3>Careful preparation</h3>

                            <p>
                                Milk is prepared and handled with care.
                            </p>

                        </div>


                        <div
                            className="goo-journey-card goo-reveal"
                            style={{ "--delay": ".3s" }}
                        >
                            <span className="goo-step-number">
                                04
                            </span>

                            <div className="goo-journey-icon">
                                🍾
                            </div>

                            <h3>Bottled</h3>

                            <p>
                                Prepared milk is placed into bottles.
                            </p>

                        </div>


                        <div
                            className="goo-journey-card goo-reveal"
                            style={{ "--delay": ".4s" }}
                        >
                            <span className="goo-step-number">
                                05
                            </span>

                            <div className="goo-journey-icon">
                                🏠
                            </div>

                            <h3>Your home</h3>

                            <p>
                                Your family's milk routine begins.
                            </p>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                WHY GOO
            ===================================================== */}

            <section className="goo-why">

                <div className="container">

                    <div className="goo-why-header goo-reveal">

                        <div>

                            <span className="goo-section-label">
                                WHY GOO AMRUTHAM
                            </span>

                            <h2>
                                More than just
                                <br />
                                <span>a bottle of milk.</span>
                            </h2>

                        </div>

                        <p>
                            We want the experience around your milk
                            routine to feel as thoughtful as the product
                            itself.
                        </p>

                    </div>


                    <div className="goo-why-grid">

                        <div
                            className="goo-why-card goo-reveal"
                            style={{ "--delay": "0s" }}
                        >
                            <div className="goo-why-number">
                                01
                            </div>

                            <div className="goo-why-icon">
                                🌱
                            </div>

                            <h3>Farm connection</h3>

                            <p>
                                A brand inspired by the connection
                                between farms and families.
                            </p>

                        </div>


                        <div
                            className="goo-why-card goo-reveal"
                            style={{ "--delay": ".1s" }}
                        >
                            <div className="goo-why-number">
                                02
                            </div>

                            <div className="goo-why-icon">
                                🤍
                            </div>

                            <h3>Made with care</h3>

                            <p>
                                Thoughtful handling from the beginning
                                of the milk journey.
                            </p>

                        </div>


                        <div
                            className="goo-why-card goo-reveal"
                            style={{ "--delay": ".2s" }}
                        >
                            <div className="goo-why-number">
                                03
                            </div>

                            <div className="goo-why-icon">
                                📦
                            </div>

                            <h3>Simple ordering</h3>

                            <p>
                                A modern ordering experience designed
                                around your routine.
                            </p>

                        </div>


                        <div
                            className="goo-why-card goo-reveal"
                            style={{ "--delay": ".3s" }}
                        >
                            <div className="goo-why-number">
                                04
                            </div>

                            <div className="goo-why-icon">
                                🏡
                            </div>

                            <h3>Family focused</h3>

                            <p>
                                Created for the everyday moments that
                                happen around the family table.
                            </p>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                FAMILY
            ===================================================== */}

            <section className="goo-family goo-section">

                <div className="container">

                    <div className="goo-family-grid">

                        <div className="goo-family-content goo-reveal-left">

                            <span className="goo-section-label">
                                FOR EVERY FAMILY
                            </span>

                            <h2>
                                Pure milk,
                                <br />
                                <span>everyday moments.</span>
                            </h2>

                            <p>
                                Milk is part of some of life's simplest
                                moments — breakfast, evening conversations,
                                cooking and time together.
                            </p>

                            <p>
                                Goo Amrutham is designed to become a
                                natural part of those everyday moments.
                            </p>

                            <Link
                                to="/products"
                                className="goo-outline-btn"
                            >
                                <span>Shop Milk</span>
                                <strong>→</strong>
                            </Link>

                        </div>


                        <div className="goo-family-image goo-reveal-right">

                            <img
                                src={familyMilk}
                                alt="Family enjoying Goo Amrutham milk"
                            />

                            <div className="goo-family-image-shine"></div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                DELIVERY
            ===================================================== */}

            <section className="goo-delivery">

                <div className="container">

                    <div className="goo-delivery-grid">

                        <div className="goo-delivery-image goo-reveal-left">

                            <img
                                src={delivery}
                                alt="Goo Amrutham milk delivered to a home"
                            />

                            <div className="goo-delivery-badge">
                                <span>FRESH</span>
                                <strong>TO HOME</strong>
                            </div>

                        </div>


                        <div className="goo-delivery-content goo-reveal-right">

                            <span className="goo-section-label">
                                TO YOUR DOOR
                            </span>

                            <h2>
                                From the farm...
                                <br />
                                <span>to your home.</span>
                            </h2>

                            <p>
                                The journey doesn't end at the farm.
                                It ends where it matters most — with you
                                and your family.
                            </p>


                            <div className="goo-delivery-points">

                                <div>
                                    <span>✓</span>
                                    <p>Easy online ordering</p>
                                </div>

                                <div>
                                    <span>✓</span>
                                    <p>Simple order tracking</p>
                                </div>

                                <div>
                                    <span>✓</span>
                                    <p>Convenient home delivery</p>
                                </div>

                                <div>
                                    <span>✓</span>
                                    <p>WhatsApp support</p>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                HOME MOMENT
            ===================================================== */}

            <section className="goo-home-moment goo-section">

                <div className="container">

                    <div className="goo-home-card">

                        <img
                            src={homeMilk}
                            alt="Family enjoying milk at home"
                        />

                        <div className="goo-home-overlay"></div>

                        <div className="goo-home-content goo-reveal">

                            <span className="goo-section-label goo-light-label">
                                EVERYDAY GOODNESS
                            </span>

                            <h2>
                                A bottle that
                                <br />
                                <span>belongs at home.</span>
                            </h2>

                            <p>
                                Simple. Familiar. Part of your everyday
                                family routine.
                            </p>

                            <Link
                                to="/products"
                                className="goo-light-btn"
                            >
                                <span>Order Your Milk</span>
                                <strong>→</strong>
                            </Link>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                POSTER
            ===================================================== */}

            <section className="goo-poster">

                <div className="container">

                    <div className="goo-poster-card goo-scale">

                        <img
                            src={poster}
                            alt="Goo Amrutham purity poster"
                        />

                    </div>

                </div>

            </section>


            {/* =====================================================
                FINAL CTA
            ===================================================== */}

            <section className="goo-final">

                <div className="goo-final-glow"></div>

                <div className="container">

                    <div className="goo-final-inner goo-reveal">

                        <div className="goo-final-logo">
                            <span></span>
                            GOO AMRUTHAM
                            <span></span>
                        </div>

                        <span className="goo-section-label">
                            GOO AMRUTHAM
                        </span>

                        <h2>
                            From our farms
                            <br />
                            <span>to your home.</span>
                        </h2>

                        <p>
                            Make Goo Amrutham part of your everyday milk
                            routine.
                        </p>

                        <Link
                            to="/products"
                            className="goo-final-btn"
                        >
                            <span>Start Your Milk Journey</span>
                            <strong>→</strong>
                        </Link>

                    </div>

                </div>

            </section>


            {/* =====================================================
                INTERNAL CSS
            ===================================================== */}

            <style>{`

                /* =====================================================
                   GLOBAL
                ===================================================== */

                .goo-about-page {
                    --goo-green: #198754;
                    --goo-dark-green: #0d3b27;
                    --goo-deep: #062c1b;
                    --goo-light: #f4faf6;
                    --goo-text: #18221c;
                    --goo-muted: #69756e;
                    --goo-border: rgba(25,135,84,.12);

                    position: relative;
                    overflow: hidden;

                    background:
                        linear-gradient(
                            180deg,
                            #ffffff 0%,
                            #fbfdfb 100%
                        );

                    color: var(--goo-text);
                }


                .goo-about-page *,
                .goo-about-page *::before,
                .goo-about-page *::after {
                    box-sizing: border-box;
                }


                .goo-about-page img {
                    display: block;
                    max-width: 100%;
                }


                .goo-section {
                    padding: 110px 0;
                }


                /* =====================================================
                   SECTION LABEL
                ===================================================== */

                .goo-section-label {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;

                    color: var(--goo-green);

                    font-size: 11px;
                    font-weight: 900;

                    letter-spacing: .18em;

                    text-transform: uppercase;
                }


                .goo-section-label::before {
                    content: "";

                    width: 24px;
                    height: 1px;

                    background: currentColor;
                }


                .goo-light-label {
                    color: rgba(255,255,255,.85);
                }


                /* =====================================================
                   REVEAL ANIMATIONS
                ===================================================== */

                .goo-reveal,
                .goo-reveal-left,
                .goo-reveal-right,
                .goo-scale {
                    opacity: 0;

                    transition:
                        opacity .9s cubic-bezier(.16,1,.3,1),
                        transform 1s cubic-bezier(.16,1,.3,1);
                }


                .goo-reveal {
                    transform: translateY(45px);
                    transition-delay: var(--delay, 0s);
                }


                .goo-reveal-left {
                    transform: translateX(-60px);
                }


                .goo-reveal-right {
                    transform: translateX(60px);
                    transition-delay: var(--delay, 0s);
                }


                .goo-scale {
                    transform: scale(.92);
                }


                .goo-visible {
                    opacity: 1;
                    transform: translate(0) scale(1);
                }


                /* =====================================================
                   HERO
                ===================================================== */

                .goo-about-hero {
                    position: relative;

                    min-height: 90vh;
                    min-height: 90svh;

                    overflow: hidden;

                    display: flex;
                    align-items: center;

                    background: #082c1b;
                }


                .goo-hero-image {
                    position: absolute;
                    inset: 0;

                    overflow: hidden;
                }


                .goo-hero-image img {
                    width: 100%;
                    height: 100%;

                    object-fit: cover;
                    object-position: center;

                    animation:
                        gooHeroZoom 14s
                        cubic-bezier(.2,.7,.2,1)
                        both;
                }


                @keyframes gooHeroZoom {

                    from {
                        transform: scale(1.13);
                    }

                    to {
                        transform: scale(1);
                    }

                }


                .goo-hero-overlay {
                    position: absolute;
                    inset: 0;

                    background:
                        linear-gradient(
                            90deg,
                            rgba(3,24,14,.88) 0%,
                            rgba(3,24,14,.62) 42%,
                            rgba(3,24,14,.18) 100%
                        );
                }


                .goo-hero-glow {
                    position: absolute;

                    width: 300px;
                    height: 300px;

                    border-radius: 50%;

                    background:
                        radial-gradient(
                            circle,
                            rgba(102,255,169,.2),
                            transparent 70%
                        );

                    filter: blur(10px);

                    pointer-events: none;

                    animation: gooGlowFloat 7s ease-in-out infinite;
                }


                .goo-glow-one {
                    right: -80px;
                    top: 12%;
                }


                .goo-glow-two {
                    left: 35%;
                    bottom: -120px;

                    animation-delay: -3s;
                }


                @keyframes gooGlowFloat {

                    0%,
                    100% {
                        transform: translate3d(0,0,0);
                    }

                    50% {
                        transform: translate3d(-20px,25px,0);
                    }

                }


                .goo-hero-container {
                    position: relative;
                    z-index: 3;
                }


                .goo-hero-content {
                    max-width: 720px;

                    color: #fff;

                    animation:
                        gooHeroContent
                        1s
                        .15s
                        cubic-bezier(.16,1,.3,1)
                        both;
                }


                @keyframes gooHeroContent {

                    from {
                        opacity: 0;
                        transform: translateY(35px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }

                }


                .goo-hero-mini {
                    display: flex;
                    align-items: center;
                    gap: 10px;

                    margin-bottom: 22px;

                    font-size: 11px;
                    font-weight: 800;

                    letter-spacing: .22em;

                    color: rgba(255,255,255,.8);
                }


                .goo-hero-mini span {
                    width: 30px;
                    height: 1px;

                    background: rgba(255,255,255,.65);
                }


                .goo-hero-content h1 {
                    margin: 0;

                    font-size:
                        clamp(
                            48px,
                            7vw,
                            92px
                        );

                    line-height: .98;

                    font-weight: 800;

                    letter-spacing: -.055em;
                }


                .goo-hero-content h1 em {
                    color: #b9e7ca;
                    font-style: normal;
                }


                .goo-hero-content p {
                    max-width: 580px;

                    margin:
                        28px 0 32px;

                    color: rgba(255,255,255,.78);

                    font-size: 17px;
                    line-height: 1.75;
                }


                .goo-hero-btn,
                .goo-final-btn,
                .goo-light-btn,
                .goo-outline-btn {
                    position: relative;

                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 20px;

                    min-height: 54px;

                    padding:
                        0 24px;

                    border-radius: 999px;

                    text-decoration: none;

                    font-size: 14px;
                    font-weight: 800;

                    overflow: hidden;

                    transition:
                        transform .35s ease,
                        box-shadow .35s ease,
                        background .35s ease;
                }


                .goo-hero-btn {
                    color: #fff;

                    background: var(--goo-green);

                    box-shadow:
                        0 15px 35px
                        rgba(25,135,84,.28);
                }


                .goo-hero-btn::before,
                .goo-final-btn::before,
                .goo-light-btn::before,
                .goo-outline-btn::before {
                    content: "";

                    position: absolute;

                    top: 0;
                    left: -120%;

                    width: 80%;
                    height: 100%;

                    background:
                        linear-gradient(
                            100deg,
                            transparent,
                            rgba(255,255,255,.35),
                            transparent
                        );

                    transform: skewX(-20deg);

                    transition: left .7s ease;
                }


                .goo-hero-btn:hover::before,
                .goo-final-btn:hover::before,
                .goo-light-btn:hover::before,
                .goo-outline-btn:hover::before {
                    left: 130%;
                }


                .goo-hero-btn strong,
                .goo-final-btn strong,
                .goo-light-btn strong,
                .goo-outline-btn strong {
                    font-size: 20px;

                    transition:
                        transform .3s ease;
                }


                .goo-hero-btn:hover,
                .goo-final-btn:hover,
                .goo-light-btn:hover,
                .goo-outline-btn:hover {
                    transform: translateY(-4px);
                }


                .goo-hero-btn:hover strong,
                .goo-final-btn:hover strong,
                .goo-light-btn:hover strong,
                .goo-outline-btn:hover strong {
                    transform: translateX(5px);
                }


                .goo-hero-bottom {
                    position: absolute;

                    z-index: 4;

                    left: 50%;
                    bottom: 28px;

                    transform: translateX(-50%);

                    display: flex;
                    align-items: center;
                    gap: 12px;

                    width: max-content;

                    color: rgba(255,255,255,.72);

                    font-size: 10px;
                    font-weight: 700;

                    letter-spacing: .12em;
                    text-transform: uppercase;
                }


                .goo-hero-bottom i {
                    width: 4px;
                    height: 4px;

                    border-radius: 50%;

                    background: #8bd0a4;
                }


                .goo-scroll-indicator {
                    position: absolute;

                    z-index: 4;

                    right: 28px;
                    bottom: 28px;

                    display: flex;
                    align-items: center;
                    gap: 12px;

                    color: rgba(255,255,255,.7);

                    font-size: 9px;
                    font-weight: 800;

                    letter-spacing: .18em;
                }


                .goo-scroll-indicator div {
                    position: relative;

                    width: 45px;
                    height: 1px;

                    overflow: hidden;

                    background: rgba(255,255,255,.25);
                }


                .goo-scroll-indicator div::after {
                    content: "";

                    position: absolute;

                    left: -100%;

                    width: 100%;
                    height: 100%;

                    background: #fff;

                    animation:
                        gooScrollLine
                        2s
                        ease-in-out
                        infinite;
                }


                @keyframes gooScrollLine {

                    0% {
                        left: -100%;
                    }

                    50% {
                        left: 100%;
                    }

                    100% {
                        left: 100%;
                    }

                }


                /* =====================================================
                   INTRO
                ===================================================== */

                .goo-intro {
                    background:
                        radial-gradient(
                            circle at 80% 30%,
                            rgba(25,135,84,.06),
                            transparent 35%
                        );
                }


                .goo-intro-grid {
                    display: grid;

                    grid-template-columns:
                        minmax(0, .9fr)
                        minmax(0, 1fr);

                    gap: 90px;

                    align-items: center;
                }


                .goo-intro-copy h2,
                .goo-section-heading h2,
                .goo-story-content h2,
                .goo-why-header h2,
                .goo-family-content h2,
                .goo-delivery-content h2 {
                    margin:
                        18px 0 25px;

                    color: var(--goo-text);

                    font-size:
                        clamp(
                            38px,
                            5vw,
                            64px
                        );

                    line-height: 1.02;

                    letter-spacing: -.045em;
                }


                .goo-intro-copy h2 span,
                .goo-story-content h2 span,
                .goo-section-heading h2 span,
                .goo-why-header h2 span,
                .goo-family-content h2 span,
                .goo-delivery-content h2 span {
                    color: var(--goo-green);
                }


                .goo-intro-copy p,
                .goo-family-content p,
                .goo-delivery-content > p {
                    max-width: 600px;

                    color: var(--goo-muted);

                    font-size: 16px;
                    line-height: 1.85;
                }


                .goo-intro-copy .goo-lead {
                    color: #4e5d55;

                    font-size: 18px;
                }


                .goo-signature {
                    display: flex;
                    align-items: center;
                    gap: 13px;

                    margin-top: 32px;

                    color: var(--goo-green);

                    font-size: 12px;
                    font-weight: 800;
                }


                .goo-signature span {
                    width: 40px;
                    height: 1px;

                    background: var(--goo-green);
                }


                .goo-intro-image-wrap {
                    position: relative;
                }


                .goo-image-frame {
                    position: relative;

                    overflow: hidden;

                    border-radius: 34px;

                    box-shadow:
                        0 30px 80px
                        rgba(0,0,0,.12);
                }


                .goo-image-frame img {
                    width: 100%;
                    height: 550px;

                    object-fit: cover;

                    transition:
                        transform 1s
                        cubic-bezier(.16,1,.3,1);
                }


                .goo-image-frame:hover img {
                    transform: scale(1.045);
                }


                .goo-image-shine {
                    position: absolute;
                    inset: 0;

                    pointer-events: none;

                    background:
                        linear-gradient(
                            110deg,
                            transparent 35%,
                            rgba(255,255,255,.25) 50%,
                            transparent 65%
                        );

                    transform: translateX(-120%);

                    transition:
                        transform 1s ease;
                }


                .goo-image-frame:hover .goo-image-shine {
                    transform: translateX(120%);
                }


                .goo-floating-brand {
                    position: absolute;

                    left: -35px;
                    bottom: 35px;

                    width: 170px;

                    padding: 20px;

                    border-radius: 22px;

                    background:
                        rgba(255,255,255,.9);

                    border:
                        1px solid
                        rgba(255,255,255,.8);

                    box-shadow:
                        0 20px 50px
                        rgba(0,0,0,.14);

                    backdrop-filter: blur(15px);
                    -webkit-backdrop-filter: blur(15px);

                    animation:
                        gooFloatingCard
                        4s
                        ease-in-out
                        infinite;
                }


                @keyframes gooFloatingCard {

                    0%,
                    100% {
                        transform: translateY(0);
                    }

                    50% {
                        transform: translateY(-10px);
                    }

                }


                .goo-floating-brand small {
                    display: block;

                    color: var(--goo-green);

                    font-size: 10px;
                    font-weight: 900;

                    letter-spacing: .18em;
                }


                .goo-floating-brand strong {
                    display: block;

                    margin-top: 2px;

                    color: var(--goo-dark-green);

                    font-size: 22px;
                }


                .goo-floating-brand span {
                    display: block;

                    margin-top: 3px;

                    color: #78847d;

                    font-size: 10px;
                }


                .goo-floating-dot {
                    position: absolute;

                    right: -15px;
                    top: 35px;

                    width: 70px;
                    height: 70px;

                    border-radius: 50%;

                    border:
                        1px solid
                        rgba(25,135,84,.18);

                    animation:
                        gooDotPulse
                        4s
                        ease-in-out
                        infinite;
                }


                @keyframes gooDotPulse {

                    0%,
                    100% {
                        transform: scale(1);
                        opacity: .6;
                    }

                    50% {
                        transform: scale(1.15);
                        opacity: 1;
                    }

                }


                /* =====================================================
                   STORY
                ===================================================== */

                .goo-story {
                    display: grid;

                    grid-template-columns:
                        1.1fr
                        .9fr;

                    min-height: 700px;

                    background: var(--goo-deep);
                }


                .goo-story-image {
                    position: relative;

                    min-height: 650px;

                    overflow: hidden;
                }


                .goo-story-image img {
                    width: 100%;
                    height: 100%;

                    object-fit: cover;

                    transition:
                        transform 1.2s
                        cubic-bezier(.16,1,.3,1);
                }


                .goo-story-image:hover img {
                    transform: scale(1.06);
                }


                .goo-story-image-overlay {
                    position: absolute;
                    inset: 0;

                    background:
                        linear-gradient(
                            180deg,
                            transparent 45%,
                            rgba(0,0,0,.6)
                        );
                }


                .goo-image-caption {
                    position: absolute;

                    left: 35px;
                    bottom: 35px;

                    display: flex;
                    flex-direction: column;
                    gap: 5px;

                    color: #fff;
                }


                .goo-image-caption span {
                    font-size: 10px;
                    font-weight: 800;

                    letter-spacing: .18em;
                }


                .goo-image-caption strong {
                    font-size: 22px;
                }


                .goo-story-content {
                    position: relative;

                    display: flex;
                    flex-direction: column;
                    justify-content: center;

                    padding:
                        90px 9vw 90px 7vw;

                    color: #fff;

                    overflow: hidden;
                }


                .goo-story-content::before {
                    content: "";

                    position: absolute;

                    width: 350px;
                    height: 350px;

                    right: -150px;
                    top: -100px;

                    border-radius: 50%;

                    background:
                        radial-gradient(
                            circle,
                            rgba(84,211,137,.13),
                            transparent 70%
                        );
                }


                .goo-story-content h2 {
                    color: #fff;
                }


                .goo-story-content h2 span {
                    color: #9dd9b3;
                }


                .goo-story-content p {
                    max-width: 550px;

                    color: rgba(255,255,255,.66);

                    font-size: 16px;
                    line-height: 1.85;
                }


                .goo-story-line {
                    display: flex;
                    align-items: center;
                    gap: 14px;

                    margin-top: 30px;
                }


                .goo-story-line span {
                    width: 50px;
                    height: 1px;

                    background: #73c591;
                }


                .goo-story-line small {
                    color: rgba(255,255,255,.5);

                    font-size: 9px;
                    font-weight: 800;

                    letter-spacing: .18em;
                }


                .goo-big-number {
                    position: absolute;

                    right: 35px;
                    bottom: 25px;

                    color: rgba(255,255,255,.035);

                    font-size: 180px;
                    font-weight: 900;

                    line-height: 1;
                }


                /* =====================================================
                   QUALITY
                ===================================================== */

                .goo-quality {
                    background: #fff;
                }


                .goo-section-heading {
                    max-width: 720px;

                    margin:
                        0 auto 65px;

                    text-align: center;
                }


                .goo-section-heading .goo-section-label {
                    justify-content: center;
                }


                .goo-section-heading p {
                    color: var(--goo-muted);

                    font-size: 16px;
                    line-height: 1.7;
                }


                .goo-quality-grid {
                    display: grid;

                    grid-template-columns:
                        1fr
                        .9fr;

                    gap: 70px;

                    align-items: center;
                }


                .goo-quality-image {
                    position: relative;

                    overflow: hidden;

                    border-radius: 30px;

                    box-shadow:
                        0 30px 70px
                        rgba(0,0,0,.11);
                }


                .goo-quality-image img {
                    width: 100%;
                    height: 520px;

                    object-fit: cover;

                    transition:
                        transform 1s
                        cubic-bezier(.16,1,.3,1);
                }


                .goo-quality-image:hover img {
                    transform: scale(1.06);
                }


                .goo-quality-badge {
                    position: absolute;

                    right: 22px;
                    bottom: 22px;

                    display: flex;
                    flex-direction: column;

                    padding: 15px 18px;

                    border-radius: 18px;

                    color: #fff;

                    background:
                        rgba(9,57,34,.85);

                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                }


                .goo-quality-badge span {
                    font-size: 9px;
                    letter-spacing: .2em;
                }


                .goo-quality-badge strong {
                    font-size: 18px;
                }


                .goo-quality-list {
                    display: flex;
                    flex-direction: column;
                }


                .goo-quality-item {
                    display: grid;

                    grid-template-columns: 60px 1fr;

                    gap: 20px;

                    padding:
                        28px 0;

                    border-bottom:
                        1px solid
                        #e9efeb;
                }


                .goo-quality-item:first-child {
                    border-top:
                        1px solid
                        #e9efeb;
                }


                .goo-quality-number {
                    color: var(--goo-green);

                    font-size: 13px;
                    font-weight: 900;
                }


                .goo-quality-item h3 {
                    margin: 0 0 8px;

                    font-size: 20px;
                    font-weight: 800;
                }


                .goo-quality-item p {
                    margin: 0;

                    color: var(--goo-muted);

                    font-size: 14px;
                    line-height: 1.7;
                }


                /* =====================================================
                   FARM BANNER
                ===================================================== */

                .goo-farm-banner {
                    position: relative;

                    min-height: 650px;

                    overflow: hidden;

                    display: flex;
                    align-items: center;

                    background: #082c1b;
                }


                .goo-farm-banner > img {
                    position: absolute;
                    inset: 0;

                    width: 100%;
                    height: 100%;

                    object-fit: cover;

                    transition:
                        transform 1.2s
                        cubic-bezier(.16,1,.3,1);
                }


                .goo-farm-banner:hover > img {
                    transform: scale(1.04);
                }


                .goo-farm-overlay {
                    position: absolute;
                    inset: 0;

                    background:
                        linear-gradient(
                            90deg,
                            rgba(3,28,17,.84),
                            rgba(3,28,17,.28)
                        );
                }


                .goo-farm-glow {
                    position: absolute;

                    width: 450px;
                    height: 450px;

                    right: -150px;
                    top: 50%;

                    transform: translateY(-50%);

                    border-radius: 50%;

                    background:
                        radial-gradient(
                            circle,
                            rgba(93,215,140,.18),
                            transparent 70%
                        );
                }


                .goo-farm-content {
                    position: relative;

                    z-index: 2;

                    color: #fff;
                }


                .goo-farm-content h2 {
                    margin:
                        20px 0;

                    color: #fff;

                    font-size:
                        clamp(
                            42px,
                            6vw,
                            76px
                        );

                    line-height: 1;

                    letter-spacing: -.05em;
                }


                .goo-farm-content h2 span {
                    color: #9fdbb5;
                }


                .goo-farm-content p {
                    max-width: 560px;

                    color: rgba(255,255,255,.7);

                    font-size: 17px;
                    line-height: 1.8;
                }


                /* =====================================================
                   JOURNEY
                ===================================================== */

                .goo-journey {
                    background:
                        #f5faf7;
                }


                .goo-journey-grid {
                    display: grid;

                    grid-template-columns:
                        repeat(5, 1fr);

                    gap: 14px;
                }


                .goo-journey-card {
                    position: relative;

                    min-height: 290px;

                    padding: 28px 22px;

                    overflow: hidden;

                    border:
                        1px solid
                        rgba(25,135,84,.1);

                    border-radius: 24px;

                    background:
                        rgba(255,255,255,.85);

                    box-shadow:
                        0 10px 30px
                        rgba(0,0,0,.035);

                    transition:
                        transform .4s ease,
                        box-shadow .4s ease,
                        border-color .4s ease;
                }


                .goo-journey-card::after {
                    content: "";

                    position: absolute;

                    width: 100px;
                    height: 100px;

                    right: -50px;
                    bottom: -50px;

                    border-radius: 50%;

                    background:
                        rgba(25,135,84,.08);

                    transition:
                        transform .5s ease;
                }


                .goo-journey-card:hover {
                    transform: translateY(-10px);

                    border-color:
                        rgba(25,135,84,.25);

                    box-shadow:
                        0 25px 55px
                        rgba(25,135,84,.1);
                }


                .goo-journey-card:hover::after {
                    transform: scale(2.5);
                }


                .goo-step-number {
                    color: #a5b2aa;

                    font-size: 11px;
                    font-weight: 900;

                    letter-spacing: .1em;
                }


                .goo-journey-icon {
                    width: 58px;
                    height: 58px;

                    margin:
                        28px 0 20px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    border-radius: 18px;

                    background: #eef8f1;

                    font-size: 27px;

                    transition:
                        transform .4s ease;
                }


                .goo-journey-card:hover .goo-journey-icon {
                    transform:
                        rotate(-7deg)
                        scale(1.08);
                }


                .goo-journey-card h3 {
                    margin-bottom: 9px;

                    font-size: 18px;
                    font-weight: 800;
                }


                .goo-journey-card p {
                    margin: 0;

                    color: var(--goo-muted);

                    font-size: 13px;
                    line-height: 1.65;
                }


                /* =====================================================
                   WHY
                ===================================================== */

                .goo-why {
                    padding: 110px 0;

                    color: #fff;

                    background:
                        linear-gradient(
                            135deg,
                            #07301c,
                            #0d4327
                        );
                }


                .goo-why-header {
                    display: grid;

                    grid-template-columns:
                        1fr
                        .7fr;

                    gap: 80px;

                    align-items: end;

                    margin-bottom: 60px;
                }


                .goo-why-header h2 {
                    color: #fff;
                }


                .goo-why-header h2 span {
                    color: #a5d9b7;
                }


                .goo-why-header p {
                    margin: 0;

                    color: rgba(255,255,255,.63);

                    font-size: 16px;
                    line-height: 1.8;
                }


                .goo-why-grid {
                    display: grid;

                    grid-template-columns:
                        repeat(4, 1fr);

                    gap: 14px;
                }


                .goo-why-card {
                    position: relative;

                    min-height: 330px;

                    padding: 28px;

                    overflow: hidden;

                    border:
                        1px solid
                        rgba(255,255,255,.1);

                    border-radius: 25px;

                    background:
                        rgba(255,255,255,.055);

                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);

                    transition:
                        transform .45s ease,
                        background .45s ease,
                        border-color .45s ease;
                }


                .goo-why-card::before {
                    content: "";

                    position: absolute;

                    inset: -100px;

                    border-radius: 50%;

                    background:
                        radial-gradient(
                            circle,
                            rgba(104,214,143,.13),
                            transparent 65%
                        );

                    opacity: 0;

                    transition:
                        opacity .5s ease;
                }


                .goo-why-card:hover {
                    transform: translateY(-9px);

                    background:
                        rgba(255,255,255,.09);

                    border-color:
                        rgba(255,255,255,.2);
                }


                .goo-why-card:hover::before {
                    opacity: 1;
                }


                .goo-why-number {
                    position: relative;

                    color: rgba(255,255,255,.38);

                    font-size: 11px;
                    font-weight: 900;
                }


                .goo-why-icon {
                    position: relative;

                    width: 62px;
                    height: 62px;

                    margin:
                        40px 0 24px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    border-radius: 20px;

                    background:
                        rgba(255,255,255,.08);

                    font-size: 28px;

                    transition:
                        transform .4s ease;
                }


                .goo-why-card:hover .goo-why-icon {
                    transform:
                        translateY(-5px)
                        rotate(-5deg);
                }


                .goo-why-card h3 {
                    position: relative;

                    margin-bottom: 10px;

                    font-size: 20px;
                }


                .goo-why-card p {
                    position: relative;

                    margin: 0;

                    color: rgba(255,255,255,.55);

                    font-size: 13px;
                    line-height: 1.7;
                }


                /* =====================================================
                   FAMILY
                ===================================================== */

                .goo-family {
                    background: #fff;
                }


                .goo-family-grid {
                    display: grid;

                    grid-template-columns:
                        .85fr
                        1.15fr;

                    gap: 80px;

                    align-items: center;
                }


                .goo-family-image {
                    position: relative;

                    overflow: hidden;

                    border-radius: 32px;

                    box-shadow:
                        0 30px 75px
                        rgba(0,0,0,.12);
                }


                .goo-family-image img {
                    width: 100%;
                    height: 570px;

                    object-fit: cover;

                    transition:
                        transform 1s
                        cubic-bezier(.16,1,.3,1);
                }


                .goo-family-image:hover img {
                    transform: scale(1.055);
                }


                .goo-family-image-shine {
                    position: absolute;
                    inset: 0;

                    background:
                        linear-gradient(
                            110deg,
                            transparent 35%,
                            rgba(255,255,255,.28),
                            transparent 65%
                        );

                    transform: translateX(-120%);

                    transition:
                        transform 1s ease;
                }


                .goo-family-image:hover
                .goo-family-image-shine {
                    transform: translateX(120%);
                }


                .goo-outline-btn {
                    margin-top: 25px;

                    color: var(--goo-green);

                    border:
                        1px solid
                        rgba(25,135,84,.3);

                    background: #fff;
                }


                .goo-outline-btn:hover {
                    color: #fff;

                    background: var(--goo-green);

                    box-shadow:
                        0 12px 30px
                        rgba(25,135,84,.18);
                }


                /* =====================================================
                   DELIVERY
                ===================================================== */

                .goo-delivery {
                    padding: 100px 0;

                    background:
                        #f4faf6;
                }


                .goo-delivery-grid {
                    display: grid;

                    grid-template-columns:
                        1fr
                        .9fr;

                    gap: 90px;

                    align-items: center;
                }


                .goo-delivery-image {
                    position: relative;

                    overflow: hidden;

                    border-radius: 30px;

                    box-shadow:
                        0 25px 60px
                        rgba(0,0,0,.1);
                }


                .goo-delivery-image img {
                    width: 100%;
                    height: 520px;

                    object-fit: cover;

                    transition:
                        transform 1s
                        cubic-bezier(.16,1,.3,1);
                }


                .goo-delivery-image:hover img {
                    transform: scale(1.055);
                }


                .goo-delivery-badge {
                    position: absolute;

                    left: 22px;
                    bottom: 22px;

                    padding: 14px 18px;

                    border-radius: 17px;

                    color: #fff;

                    background:
                        rgba(7,48,28,.86);

                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }


                .goo-delivery-badge span {
                    display: block;

                    font-size: 9px;
                    letter-spacing: .18em;
                }


                .goo-delivery-badge strong {
                    font-size: 17px;
                }


                .goo-delivery-points {
                    margin-top: 28px;

                    display: grid;

                    grid-template-columns:
                        1fr 1fr;

                    gap: 10px;
                }


                .goo-delivery-points div {
                    display: flex;
                    align-items: center;
                    gap: 10px;

                    padding: 13px;

                    border-radius: 14px;

                    background: #fff;

                    box-shadow:
                        0 5px 20px
                        rgba(0,0,0,.035);
                }


                .goo-delivery-points span {
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    flex: 0 0 auto;

                    width: 27px;
                    height: 27px;

                    border-radius: 50%;

                    color: #fff;

                    background: var(--goo-green);

                    font-size: 12px;
                    font-weight: 900;
                }


                .goo-delivery-points p {
                    margin: 0;

                    color: #47544d;

                    font-size: 12px;
                    font-weight: 700;
                }


                /* =====================================================
                   HOME MOMENT
                ===================================================== */

                .goo-home-moment {
                    background: #fff;
                }


                .goo-home-card {
                    position: relative;

                    min-height: 650px;

                    overflow: hidden;

                    border-radius: 35px;

                    background: #092d1b;
                }


                .goo-home-card > img {
                    position: absolute;
                    inset: 0;

                    width: 100%;
                    height: 100%;

                    object-fit: cover;

                    transition:
                        transform 1.2s
                        cubic-bezier(.16,1,.3,1);
                }


                .goo-home-card:hover > img {
                    transform: scale(1.04);
                }


                .goo-home-overlay {
                    position: absolute;
                    inset: 0;

                    background:
                        linear-gradient(
                            90deg,
                            rgba(3,28,17,.85),
                            rgba(3,28,17,.3)
                        );
                }


                .goo-home-content {
                    position: relative;

                    z-index: 2;

                    max-width: 650px;

                    padding:
                        100px 8%;
                }


                .goo-home-content h2 {
                    margin:
                        20px 0;

                    color: #fff;

                    font-size:
                        clamp(
                            42px,
                            6vw,
                            72px
                        );

                    line-height: 1;

                    letter-spacing: -.05em;
                }


                .goo-home-content h2 span {
                    color: #a4dbb6;
                }


                .goo-home-content p {
                    max-width: 520px;

                    color: rgba(255,255,255,.68);

                    font-size: 16px;
                    line-height: 1.8;
                }


                .goo-light-btn {
                    margin-top: 20px;

                    color: var(--goo-dark-green);

                    background: #fff;

                    box-shadow:
                        0 15px 35px
                        rgba(0,0,0,.18);
                }


                /* =====================================================
                   POSTER
                ===================================================== */

                .goo-poster {
                    padding:
                        70px 0 100px;

                    background: #fff;
                }


                .goo-poster-card {
                    position: relative;

                    max-width: 850px;

                    margin: auto;

                    overflow: hidden;

                    border-radius: 28px;

                    box-shadow:
                        0 30px 80px
                        rgba(0,0,0,.12);
                }


                .goo-poster-card img {
                    width: 100%;
                    height: auto;

                    transition:
                        transform 1s
                        cubic-bezier(.16,1,.3,1);
                }


                .goo-poster-card:hover img {
                    transform: scale(1.025);
                }


                /* =====================================================
                   FINAL CTA
                ===================================================== */

                .goo-final {
                    position: relative;

                    padding:
                        130px 0;

                    overflow: hidden;

                    color: #fff;

                    background:
                        linear-gradient(
                            135deg,
                            #07301c,
                            #0d492a
                        );
                }


                .goo-final::before,
                .goo-final::after {
                    content: "";

                    position: absolute;

                    border-radius: 50%;

                    pointer-events: none;
                }


                .goo-final::before {
                    width: 400px;
                    height: 400px;

                    top: -180px;
                    left: -120px;

                    background:
                        radial-gradient(
                            circle,
                            rgba(118,221,153,.16),
                            transparent 70%
                        );
                }


                .goo-final::after {
                    width: 500px;
                    height: 500px;

                    right: -220px;
                    bottom: -250px;

                    background:
                        radial-gradient(
                            circle,
                            rgba(118,221,153,.13),
                            transparent 70%
                        );
                }


                .goo-final-inner {
                    position: relative;

                    z-index: 2;

                    text-align: center;
                }


                .goo-final-logo {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;

                    margin-bottom: 25px;

                    color: rgba(255,255,255,.65);

                    font-size: 10px;
                    font-weight: 900;

                    letter-spacing: .22em;
                }


                .goo-final-logo span {
                    width: 30px;
                    height: 1px;

                    background:
                        rgba(255,255,255,.35);
                }


                .goo-final-inner
                .goo-section-label {
                    color: #9ad6ad;

                    justify-content: center;
                }


                .goo-final-inner h2 {
                    margin:
                        20px 0;

                    font-size:
                        clamp(
                            46px,
                            7vw,
                            82px
                        );

                    line-height: .98;

                    letter-spacing: -.055em;
                }


                .goo-final-inner h2 span {
                    color: #a8ddb9;
                }


                .goo-final-inner p {
                    margin:
                        0 auto 30px;

                    max-width: 540px;

                    color: rgba(255,255,255,.64);

                    font-size: 16px;
                    line-height: 1.8;
                }


                .goo-final-btn {
                    color: var(--goo-dark-green);

                    background: #fff;

                    box-shadow:
                        0 20px 45px
                        rgba(0,0,0,.18);
                }


                /* =====================================================
                   TABLET
                ===================================================== */

                @media (max-width: 1100px) {

                    .goo-section {
                        padding: 85px 0;
                    }


                    .goo-intro-grid {
                        gap: 50px;
                    }


                    .goo-journey-grid {
                        grid-template-columns:
                            repeat(3, 1fr);
                    }


                    .goo-journey-card:nth-child(4),
                    .goo-journey-card:nth-child(5) {
                        grid-column: span 1;
                    }


                    .goo-why-grid {
                        grid-template-columns:
                            repeat(2, 1fr);
                    }


                    .goo-why-card {
                        min-height: 280px;
                    }

                }


                /* =====================================================
                   MOBILE
                ===================================================== */

                @media (max-width: 767px) {

                    .goo-section {
                        padding: 65px 0;
                    }


                    .goo-about-hero {
                        min-height:
                            86svh;

                        min-height:
                            620px;
                    }


                    .goo-hero-image img {
                        object-position:
                            58% center;
                    }


                    .goo-hero-overlay {
                        background:
                            linear-gradient(
                                180deg,
                                rgba(3,24,14,.35) 0%,
                                rgba(3,24,14,.72) 55%,
                                rgba(3,24,14,.94) 100%
                            );
                    }


                    .goo-hero-container {
                        width: 100%;
                    }


                    .goo-hero-content {
                        padding:
                            80px 5px 80px;
                    }


                    .goo-hero-mini {
                        margin-bottom: 17px;

                        font-size: 9px;
                    }


                    .goo-hero-mini span {
                        width: 20px;
                    }


                    .goo-hero-content h1 {
                        font-size:
                            clamp(
                                45px,
                                14vw,
                                64px
                            );

                        letter-spacing: -.06em;
                    }


                    .goo-hero-content p {
                        margin:
                            20px 0 25px;

                        font-size: 14px;
                        line-height: 1.7;
                    }


                    .goo-hero-btn {
                        width: 100%;

                        min-height: 52px;
                    }


                    .goo-hero-bottom {
                        bottom: 22px;

                        width: 90%;

                        justify-content: center;

                        font-size: 8px;

                        gap: 7px;
                    }


                    .goo-hero-bottom span:nth-of-type(3) {
                        display: none;
                    }


                    .goo-hero-bottom i:last-of-type {
                        display: none;
                    }


                    .goo-scroll-indicator {
                        display: none;
                    }


                    /* INTRO */

                    .goo-intro-grid {
                        display: flex;
                        flex-direction: column;

                        gap: 45px;
                    }


                    .goo-intro-copy h2,
                    .goo-section-heading h2,
                    .goo-story-content h2,
                    .goo-why-header h2,
                    .goo-family-content h2,
                    .goo-delivery-content h2 {
                        font-size:
                            clamp(
                                36px,
                                10.5vw,
                                50px
                            );

                        line-height: 1.02;
                    }


                    .goo-intro-copy p,
                    .goo-family-content p,
                    .goo-delivery-content > p {
                        font-size: 14px;
                        line-height: 1.75;
                    }


                    .goo-intro-copy .goo-lead {
                        font-size: 16px;
                    }


                    .goo-signature {
                        margin-top: 25px;

                        font-size: 10px;
                    }


                    .goo-intro-image-wrap {
                        width: 100%;
                    }


                    .goo-image-frame {
                        border-radius: 24px;
                    }


                    .goo-image-frame img {
                        width: 100%;
                        height: 390px;

                        object-fit: cover;
                    }


                    .goo-floating-brand {
                        left: 15px;
                        bottom: 15px;

                        width: 145px;

                        padding: 15px;

                        border-radius: 18px;
                    }


                    .goo-floating-brand strong {
                        font-size: 19px;
                    }


                    .goo-floating-dot {
                        right: 8px;
                        top: 18px;

                        width: 45px;
                        height: 45px;
                    }


                    /* STORY */

                    .goo-story {
                        display: flex;
                        flex-direction: column;
                    }


                    .goo-story-image {
                        min-height: 430px;

                        width: 100%;
                    }


                    .goo-story-image img {
                        min-height: 430px;
                    }


                    .goo-image-caption {
                        left: 20px;
                        bottom: 20px;
                    }


                    .goo-image-caption strong {
                        font-size: 17px;
                    }


                    .goo-story-content {
                        padding:
                            60px 20px 80px;
                    }


                    .goo-story-content p {
                        font-size: 14px;
                    }


                    .goo-big-number {
                        right: 10px;
                        bottom: 5px;

                        font-size: 110px;
                    }


                    /* QUALITY */

                    .goo-section-heading {
                        margin-bottom: 40px;
                    }


                    .goo-section-heading h2 {
                        margin:
                            15px 0 18px;
                    }


                    .goo-section-heading p {
                        font-size: 14px;
                    }


                    .goo-quality-grid {
                        display: flex;
                        flex-direction: column;

                        gap: 35px;
                    }


                    .goo-quality-image {
                        width: 100%;

                        border-radius: 24px;
                    }


                    .goo-quality-image img {
                        width: 100%;
                        height: 330px;

                        object-fit: cover;
                    }


                    .goo-quality-item {
                        grid-template-columns:
                            40px 1fr;

                        gap: 12px;

                        padding:
                            22px 0;
                    }


                    .goo-quality-item h3 {
                        font-size: 17px;
                    }


                    .goo-quality-item p {
                        font-size: 13px;
                    }


                    /* FARM BANNER */

                    .goo-farm-banner {
                        min-height: 560px;
                    }


                    .goo-farm-overlay {
                        background:
                            linear-gradient(
                                180deg,
                                rgba(3,28,17,.28),
                                rgba(3,28,17,.9)
                            );
                    }


                    .goo-farm-content {
                        padding:
                            70px 20px;
                    }


                    .goo-farm-content h2 {
                        font-size:
                            clamp(
                                42px,
                                12vw,
                                58px
                            );
                    }


                    .goo-farm-content p {
                        font-size: 14px;
                    }


                    /* JOURNEY */

                    .goo-journey-grid {
                        display: grid;

                        grid-template-columns:
                            1fr 1fr;

                        gap: 10px;
                    }


                    .goo-journey-card {
                        min-height: 245px;

                        padding:
                            20px 17px;

                        border-radius: 20px;
                    }


                    .goo-journey-card:last-child {
                        grid-column:
                            1 / -1;

                        min-height: 210px;
                    }


                    .goo-journey-icon {
                        width: 50px;
                        height: 50px;

                        margin:
                            22px 0 16px;

                        border-radius: 15px;

                        font-size: 23px;
                    }


                    .goo-journey-card h3 {
                        font-size: 16px;
                    }


                    .goo-journey-card p {
                        font-size: 12px;
                    }


                    /* WHY */

                    .goo-why {
                        padding:
                            70px 0;
                    }


                    .goo-why-header {
                        display: block;

                        margin-bottom: 35px;
                    }


                    .goo-why-header p {
                        margin-top: 20px;

                        font-size: 14px;
                    }


                    .goo-why-grid {
                        grid-template-columns:
                            1fr 1fr;

                        gap: 10px;
                    }


                    .goo-why-card {
                        min-height: 260px;

                        padding: 20px;

                        border-radius: 20px;
                    }


                    .goo-why-icon {
                        width: 50px;
                        height: 50px;

                        margin:
                            25px 0 18px;

                        border-radius: 15px;

                        font-size: 22px;
                    }


                    .goo-why-card h3 {
                        font-size: 16px;
                    }


                    .goo-why-card p {
                        font-size: 12px;
                    }


                    /* FAMILY */

                    .goo-family-grid {
                        display: flex;
                        flex-direction: column;

                        gap: 35px;
                    }


                    .goo-family-image {
                        order: -1;

                        width: 100%;

                        border-radius: 24px;
                    }


                    .goo-family-image img {
                        width: 100%;
                        height: 390px;

                        object-fit: cover;
                    }


                    .goo-outline-btn {
                        width: 100%;

                        margin-top: 20px;
                    }


                    /* DELIVERY */

                    .goo-delivery {
                        padding:
                            65px 0;
                    }


                    .goo-delivery-grid {
                        display: flex;
                        flex-direction: column;

                        gap: 40px;
                    }


                    .goo-delivery-image {
                        width: 100%;

                        border-radius: 24px;
                    }


                    .goo-delivery-image img {
                        width: 100%;
                        height: 360px;

                        object-fit: cover;
                    }


                    .goo-delivery-points {
                        grid-template-columns:
                            1fr;

                        gap: 8px;
                    }


                    .goo-delivery-points div {
                        padding: 11px;
                    }


                    /* HOME */

                    .goo-home-card {
                        min-height:
                            560px;

                        border-radius: 25px;
                    }


                    .goo-home-overlay {
                        background:
                            linear-gradient(
                                180deg,
                                rgba(3,28,17,.25),
                                rgba(3,28,17,.9)
                            );
                    }


                    .goo-home-content {
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-end;

                        min-height: 560px;

                        padding:
                            40px 22px;
                    }


                    .goo-home-content h2 {
                        font-size:
                            clamp(
                                40px,
                                11vw,
                                56px
                            );
                    }


                    .goo-home-content p {
                        font-size: 14px;
                    }


                    .goo-light-btn {
                        width: 100%;
                    }


                    /* POSTER */

                    .goo-poster {
                        padding:
                            45px 0 65px;
                    }


                    .goo-poster-card {
                        border-radius: 20px;
                    }


                    /* FINAL */

                    .goo-final {
                        padding:
                            85px 0;
                    }


                    .goo-final-inner h2 {
                        font-size:
                            clamp(
                                44px,
                                12vw,
                                60px
                            );
                    }


                    .goo-final-inner p {
                        font-size: 14px;
                    }


                    .goo-final-btn {
                        width: 100%;
                    }

                }


                /* =====================================================
                   SMALL MOBILE
                ===================================================== */

                @media (max-width: 380px) {

                    .goo-section {
                        padding:
                            55px 0;
                    }


                    .goo-about-hero {
                        min-height:
                            600px;
                    }


                    .goo-hero-content h1 {
                        font-size: 43px;
                    }


                    .goo-image-frame img {
                        height: 330px;
                    }


                    .goo-floating-brand {
                        width: 130px;

                        padding: 13px;
                    }


                    .goo-floating-brand strong {
                        font-size: 17px;
                    }


                    .goo-story-image,
                    .goo-story-image img {
                        min-height: 370px;
                    }


                    .goo-quality-image img {
                        height: 290px;
                    }


                    .goo-journey-card {
                        min-height: 225px;

                        padding: 17px 14px;
                    }


                    .goo-why-card {
                        min-height: 245px;

                        padding: 17px;
                    }


                    .goo-family-image img {
                        height: 330px;
                    }


                    .goo-delivery-image img {
                        height: 310px;
                    }


                    .goo-home-card,
                    .goo-home-content {
                        min-height: 520px;
                    }

                }


                /* =====================================================
                   TOUCH DEVICES
                ===================================================== */

                @media (hover: none) {

                    .goo-image-frame:hover img,
                    .goo-story-image:hover img,
                    .goo-quality-image:hover img,
                    .goo-farm-banner:hover > img,
                    .goo-family-image:hover img,
                    .goo-delivery-image:hover img,
                    .goo-home-card:hover > img,
                    .goo-poster-card:hover img {
                        transform: none;
                    }


                    .goo-journey-card:hover,
                    .goo-why-card:hover {
                        transform: none;
                    }


                    .goo-hero-btn:hover,
                    .goo-final-btn:hover,
                    .goo-light-btn:hover,
                    .goo-outline-btn:hover {
                        transform: none;
                    }


                    .goo-image-shine,
                    .goo-family-image-shine {
                        display: none;
                    }

                }


                /* =====================================================
                   REDUCED MOTION
                ===================================================== */

                @media (prefers-reduced-motion: reduce) {

                    .goo-about-page *,
                    .goo-about-page *::before,
                    .goo-about-page *::after {
                        animation-duration:
                            .01ms !important;

                        animation-iteration-count:
                            1 !important;

                        scroll-behavior:
                            auto !important;

                        transition-duration:
                            .01ms !important;
                    }


                    .goo-reveal,
                    .goo-reveal-left,
                    .goo-reveal-right,
                    .goo-scale {
                        opacity: 1 !important;

                        transform:
                            none !important;
                    }

                }

            `}</style>

        </main>
    );
}