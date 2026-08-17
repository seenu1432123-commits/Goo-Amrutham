import React from "react";

import family from "../assets/images/family-card.png";
import poster from "../assets/images/purity-poster.jpeg";

// Add these images to:
// src/assets/images/

import farmMorning from "../assets/images/farm-morning.png";
import milking from "../assets/images/about-milking.png";
import filtering from "../assets/images/about-filtering.png";
import farmToHome from "../assets/images/about-farm-to-home.png";
import familyMilk from "../assets/images/about-family-milk.png";
import delivery from "../assets/images/about-delivery.png";
import homeMilk from "../assets/images/about-home-milk.png";

export default function About() {
    return (
        <main className="about-page">

            {/* =====================================================
                HERO
            ===================================================== */}
            <section className="about-hero">
                <div className="about-hero-image">
                    <img
                        src={farmMorning}
                        alt="Goo Amrutham farm at sunrise"
                    />
                </div>

                <div className="about-hero-overlay"></div>

                <div className="container about-hero-content">
                
                    <h1 className="text-white">
                        From our farms
                        <br />
                        <span className="text-white">to your home.</span>
                    </h1>

                    <p>
                        A simple milk journey built around freshness,
                        care and the warmth of everyday family life.
                    </p>

                    <a href="/products" className="about-hero-btn btn btn-success text-white">
                        Explore Our Milk
                        <span>→</span>
                    </a>
                </div>

                <div className="about-hero-bottom">
                    <span>Fresh beginnings</span>
                    <span>•</span>
                    <span>Farm to home</span>
                </div>
            </section>


            {/* =====================================================
                INTRO
            ===================================================== */}
            <section className="about-intro section-space">
                <div className="container">
                    <div className="about-intro-grid">

                        <div className="about-intro-copy">
                            <span className="section-label">
                                GOO AMRUTHAM
                            </span>

                            <h2>
                                Milk that begins
                                <br />
                                with a simple idea.
                            </h2>

                            <p className="about-lead">
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

                            <div className="about-signature">
                                <span className="signature-line"></span>
                                <span>From our farms to your home</span>
                            </div>
                        </div>

                        <div className="about-intro-image">
                            <img
                                src={family}
                                alt="Goo Amrutham family"
                            />

                            <div className="floating-brand-card">
                                <span>GOO</span>
                                <strong>Amrutham</strong>
                                <small>Milk</small>
                            </div>
                        </div>

                    </div>
                </div>
            </section>


            {/* =====================================================
                FARM STORY
            ===================================================== */}
            <section className="story-feature">
                <div className="container-fluid px-0">
                    <div className="story-feature-grid">

                        <div className="story-feature-image">
                            <img
                                src={milking}
                                alt="Traditional morning milking at the farm"
                            />
                        </div>

                        <div className="story-feature-content">
                            <span className="section-label">
                                01 / THE BEGINNING
                            </span>

                            <h2>
                                Early mornings.
                                <br />
                                Honest work.
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

                            <div className="story-number">
                                01
                            </div>
                        </div>

                    </div>
                </div>
            </section>


            {/* =====================================================
                QUALITY
            ===================================================== */}
            <section className="quality-section section-space">
                <div className="container">

                    <div className="section-heading centered">
                        <span className="section-label">
                            OUR CARE
                        </span>

                        <h2>
                            Carefully handled,
                            <br />
                            thoughtfully delivered.
                        </h2>

                        <p>
                            From collection to bottle, every stage is
                            part of the journey.
                        </p>
                    </div>

                    <div className="quality-grid">

                        <div className="quality-image">
                            <img
                                src={filtering}
                                alt="Milk being carefully filtered and bottled"
                            />
                        </div>

                        <div className="quality-content">

                            <div className="quality-item">
                                <span>01</span>

                                <div>
                                    <h3>Careful handling</h3>
                                    <p>
                                        Milk is handled with attention
                                        throughout the preparation
                                        process.
                                    </p>
                                </div>
                            </div>

                            <div className="quality-item">
                                <span>02</span>

                                <div>
                                    <h3>Clean preparation</h3>
                                    <p>
                                        A clean and organised process
                                        helps keep the journey from farm
                                        to bottle simple.
                                    </p>
                                </div>
                            </div>

                            <div className="quality-item">
                                <span>03</span>

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
            <section className="farm-home-section">
                <img
                    src={farmToHome}
                    alt="Goo Amrutham from farm to home"
                />

                <div className="farm-home-overlay"></div>

                <div className="container farm-home-content">
                    <span className="section-label light">
                        THE JOURNEY
                    </span>

                    <h2>
                        From our farm
                        <br />
                        to your doorstep.
                    </h2>

                    <p>
                        A journey that connects the people behind the
                        milk with the families who enjoy it.
                    </p>
                </div>
            </section>


            {/* =====================================================
                JOURNEY STEPS
            ===================================================== */}
            <section className="journey-section section-space">
                <div className="container">

                    <div className="section-heading centered">
                        <span className="section-label">
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

                    <div className="journey-grid">

                        <div className="journey-card">
                            <span>01</span>
                            <div className="journey-icon">🌅</div>
                            <h3>Morning begins</h3>
                            <p>
                                The day starts at the farm.
                            </p>
                        </div>

                        <div className="journey-card">
                            <span>02</span>
                            <div className="journey-icon">🐄</div>
                            <h3>Milk collection</h3>
                            <p>
                                Milk begins its journey from the farm.
                            </p>
                        </div>

                        <div className="journey-card">
                            <span>03</span>
                            <div className="journey-icon">🥛</div>
                            <h3>Careful preparation</h3>
                            <p>
                                Milk is prepared and handled with care.
                            </p>
                        </div>

                        <div className="journey-card">
                            <span>04</span>
                            <div className="journey-icon">🍾</div>
                            <h3>Bottled</h3>
                            <p>
                                Prepared milk is placed into bottles.
                            </p>
                        </div>

                        <div className="journey-card">
                            <span>05</span>
                            <div className="journey-icon">🏠</div>
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
            <section className="why-goo-section">
                <div className="container">

                    <div className="why-goo-header">
                        <div>
                            <span className="section-label">
                                WHY GOO AMRUTHAM
                            </span>

                            <h2>
                                More than just
                                <br />
                                a bottle of milk.
                            </h2>
                        </div>

                        <p>
                            We want the experience around your milk
                            routine to feel as thoughtful as the product
                            itself.
                        </p>
                    </div>

                    <div className="why-goo-grid">

                        <div className="why-card">
                            <div className="why-card-number">01</div>
                            <div className="why-card-icon">🌱</div>
                            <h3>Farm connection</h3>
                            <p>
                                A brand inspired by the connection
                                between farms and families.
                            </p>
                        </div>

                        <div className="why-card">
                            <div className="why-card-number">02</div>
                            <div className="why-card-icon">🤍</div>
                            <h3>Made with care</h3>
                            <p>
                                Thoughtful handling from the beginning
                                of the milk journey.
                            </p>
                        </div>

                        <div className="why-card">
                            <div className="why-card-number">03</div>
                            <div className="why-card-icon">📦</div>
                            <h3>Simple ordering</h3>
                            <p>
                                A modern ordering experience designed
                                around your routine.
                            </p>
                        </div>

                        <div className="why-card">
                            <div className="why-card-number">04</div>
                            <div className="why-card-icon">🏡</div>
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
            <section className="family-story section-space">
                <div className="container">

                    <div className="family-story-grid">

                        <div className="family-story-content">
                            <span className="section-label">
                                FOR EVERY FAMILY
                            </span>

                            <h2>
                                Pure milk,
                                <br />
                                everyday moments.
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

                            <a
                                href="/products"
                                className="premium-outline-btn"
                            >
                                Shop Milk
                                <span>→</span>
                            </a>
                        </div>

                        <div className="family-story-image">
                            <img
                                src={familyMilk}
                                alt="Family enjoying Goo Amrutham milk"
                            />
                        </div>

                    </div>

                </div>
            </section>


            {/* =====================================================
                DELIVERY
            ===================================================== */}
            <section className="delivery-section">
                <div className="container">

                    <div className="delivery-grid">

                        <div className="delivery-image">
                            <img
                                src={delivery}
                                alt="Goo Amrutham milk delivered to a home"
                            />
                        </div>

                        <div className="delivery-content">
                            <span className="section-label">
                                TO YOUR DOOR
                            </span>

                            <h2>
                                From the farm...
                                <br />
                                to your home.
                            </h2>

                            <p>
                                The journey doesn't end at the farm.
                                It ends where it matters most — with you
                                and your family.
                            </p>

                            <div className="delivery-points">
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
            <section className="home-moment section-space">
                <div className="container">

                    <div className="home-moment-card">

                        <img
                            src={homeMilk}
                            alt="Family enjoying milk at home"
                        />

                        <div className="home-moment-overlay"></div>

                        <div className="home-moment-content">
                            <span className="section-label light">
                                EVERYDAY GOODNESS
                            </span>

                            <h2>
                                A bottle that
                                <br />
                                belongs at home.
                            </h2>

                            <p>
                                Simple. Familiar. Part of your everyday
                                family routine.
                            </p>

                            <a
                                href="/products"
                                className="about-light-btn"
                            >
                                Order Your Milk
                                <span>→</span>
                            </a>
                        </div>

                    </div>

                </div>
            </section>


            {/* =====================================================
                BRAND POSTER
            ===================================================== */}
            <section className="poster-section">
                <div className="container">

                    <div className="poster-card">
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
            <section className="about-final-cta">
                <div className="container">

                    <div className="final-cta-inner">

                        <span className="section-label">
                            GOO AMRUTHAM
                        </span>

                        <h2>
                            From our farms
                            <br />
                            to your home.
                        </h2>

                        <p>
                            Make Goo Amrutham part of your everyday milk
                            routine.
                        </p>

                        <a
                            href="/products"
                            className="final-cta-btn"
                        >
                            Start Your Milk Journey
                            <span>→</span>
                        </a>

                    </div>

                </div>
            </section>

        </main>
    );
}