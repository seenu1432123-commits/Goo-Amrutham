import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaLeaf,
  FaTruck,
  FaGlassWhiskey,
  FaSeedling,
  FaArrowRight,
  FaCheck,
  FaHeart,
  FaStar,
  FaRecycle,
  FaHome,
} from "react-icons/fa";

import { testimonials, faqs } from "../data/content";

import hero from "../assets/images/hero-field.jpeg";
import family from "../assets/images/family-organic.png";
import homeBottle from "../assets/images/home-bottlee.jpg";
import familycurd from "../assets/images/curd-family.png";

export default function Home() {

  /* =====================================================
     SCROLL REVEAL
  ===================================================== */

  useEffect(() => {

    const elements =
      document.querySelectorAll(".goo-reveal");

    const observer =
      new IntersectionObserver(
        (entries) => {

          entries.forEach((entry) => {

            if (entry.isIntersecting) {

              entry.target.classList.add(
                "goo-visible"
              );

            }

          });

        },
        {
          threshold: 0.12,
        }
      );

    elements.forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();

  }, []);

  return (

    <main className="goo-home">

      {/* =====================================================
          PREMIUM HERO
      ===================================================== */}

      <section className="goo-premium-hero">

        <img
          src={hero}
          alt="Goo Amrutham farm"
          className="goo-hero-bg"
        />

        <div className="goo-hero-gradient" />

        {/* Floating organic particles */}

        <div className="goo-particle particle-one">
          <FaLeaf />
        </div>

        <div className="goo-particle particle-two">
          <FaLeaf />
        </div>

        <div className="goo-particle particle-three">
          <FaSeedling />
        </div>

        <div className="container">

          <div className="goo-hero-content">

            <div className="goo-pill">

              <span className="goo-pulse-dot" />

              FARM FRESH • EVERY MORNING

            </div>

            <h1>

              Pure mornings.

              <br />

              <span>
                Naturally delivered.
              </span>

            </h1>

            <p>

              Fresh Goo Amrutham milk,
              thoughtfully sourced from our farms
              and delivered straight to your home.

            </p>

            <div className="goo-hero-buttons">

              <Link
                to="/products"
                className="goo-primary-btn"
              >

                Start Your Morning

                <FaArrowRight />

              </Link>

              <Link
                to="/about"
                className="goo-glass-btn"
              >

                Discover Goo Amrutham

              </Link>

            </div>

            <div className="goo-mini-trust">

              <span>
                <FaCheck />
                Fresh daily
              </span>

              <span>
                <FaCheck />
                Reusable glass
              </span>

              <span>
                <FaCheck />
                Home delivery
              </span>

            </div>

          </div>

        </div>

        {/* Bottom wave */}

        <div className="goo-hero-bottom" />

      </section>


      {/* =====================================================
          FLOATING TRUST CARDS
      ===================================================== */}

      <section className="goo-floating-trust">

        <div className="container">

          <div className="goo-trust-grid">

            {[
              [
                FaLeaf,
                "Natural",
                "Thoughtful sourcing",
              ],
              [
                FaGlassWhiskey,
                "Reusable",
                "Glass bottle delivery",
              ],
              [
                FaTruck,
                "Reliable",
                "Doorstep delivery",
              ],
              [
                FaHeart,
                "Family First",
                "Made with care",
              ],
            ].map(
              ([Icon, title, text], index) => (

                <div
                  className="goo-trust-item goo-reveal"
                  key={title}
                  style={{
                    transitionDelay:
                      `${index * 80}ms`,
                  }}
                >

                  <div className="goo-icon-circle">

                    <Icon />

                  </div>

                  <div>

                    <strong>
                      {title}
                    </strong>

                    <span>
                      {text}
                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </section>


      {/* =====================================================
          BRAND INTRO
      ===================================================== */}

      <section className="goo-story">

        <div className="container">

          <div className="row align-items-center g-5">

            <div className="col-lg-6 goo-reveal">

              <div className="goo-image-stack">

                <img
                  src={family}
                  alt="Goo Amrutham family"
                  className="goo-story-image"
                />

                <div className="goo-floating-badge">

                  <FaLeaf />

                  <div>

                    <strong>
                      Farm to Home
                    </strong>

                    <span>
                      With care
                    </span>

                  </div>

                </div>

              </div>

            </div>


            <div className="col-lg-6 goo-reveal">

              <span className="goo-label">

                THE GOO AMRUTHAM WAY

              </span>

              <h2>

                Your morning deserves
                <span> something better.</span>

              </h2>

              <p className="goo-large-text">

                We believe milk should feel simple,
                fresh and personal. Goo Amrutham
                brings the farm closer to your family
                through a thoughtful everyday
                delivery experience.

              </p>

              <div className="goo-check-list">

                <div>
                  <FaCheck />
                  Easy online ordering
                </div>

                <div>
                  <FaCheck />
                  Convenient home delivery
                </div>

                <div>
                  <FaCheck />
                  Simple subscriptions
                </div>

                <div>
                  <FaCheck />
                  Order tracking
                </div>

              </div>

              <Link
                to="/about"
                className="goo-dark-btn"
              >

                Our Story

                <FaArrowRight />

              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FARM → HOME EXPERIENCE
      ===================================================== */}

      <section className="goo-process-section">

        <div className="goo-process-bg" />

        <div className="container position-relative">

          <div className="text-center goo-reveal">

            <span className="goo-label light-label">

              FROM FARM TO YOUR DOOR

            </span>

            <h2 className="goo-white-heading">

              A simpler journey
              <br />

              <span>to your morning.</span>

            </h2>

          </div>


          <div className="goo-process-line">

            {[
              [
                "01",
                FaSeedling,
                "Our Farms",
                "Carefully sourced from local farms.",
              ],

              [
                "02",
                FaGlassWhiskey,
                "Prepared",
                "Handled with freshness in mind.",
              ],

              [
                "03",
                FaTruck,
                "Delivered",
                "Brought directly to your doorstep.",
              ],

              [
                "04",
                FaHome,
                "Your Home",
                "Ready for your family's morning.",
              ],
            ].map(
              ([number, Icon, title, text], index) => (

                <div
                  className="goo-process-card goo-reveal"
                  key={number}
                  style={{
                    transitionDelay:
                      `${index * 120}ms`,
                  }}
                >

                  <div className="goo-process-number">

                    {number}

                  </div>

                  <div className="goo-process-icon">

                    <Icon />

                  </div>

                  <h4>
                    {title}
                  </h4>

                  <p>
                    {text}
                  </p>

                </div>

              )
            )}

          </div>

        </div>

      </section>


      {/* =====================================================
          PREMIUM FAMILY SECTION
      ===================================================== */}

      <section className="goo-family-section">

        <div className="container">

          <div className="row align-items-center g-5">

            <div className="col-lg-6 order-lg-2 goo-reveal">

              <div className="goo-family-image-wrap">

                <img
                  src={familycurd}
                  alt="Family enjoying Goo Amrutham"
                  className="goo-family-image"
                />

                <div className="goo-image-glow" />

              </div>

            </div>


            <div className="col-lg-6 order-lg-1 goo-reveal">

              <span className="goo-label">

                MADE FOR REAL LIFE

              </span>

              <h2>

                Goodness that
                <span> fits your routine.</span>

              </h2>

              <p className="goo-large-text">

                Whether it is your morning coffee,
                children's breakfast or a quiet evening
                at home, Goo Amrutham is designed to
                become a simple part of everyday life.

              </p>


              <div className="goo-stat-row">

                <div>

                  <strong>
                    100%
                  </strong>

                  <span>
                    Care driven
                  </span>

                </div>

                <div>

                  <strong>
                    24/7
                  </strong>

                  <span>
                    Easy ordering
                  </span>

                </div>

                <div>

                  <strong>
                    1 tap
                  </strong>

                  <span>
                    Reordering
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          ECO SECTION
      ===================================================== */}

      <section className="goo-eco-section">

        <div className="container">

          <div className="goo-eco-card goo-reveal">

            <div className="goo-eco-content">

              <div className="goo-eco-icon">

                <FaRecycle />

              </div>

              <span className="goo-label">

                A LITTLE BETTER FOR TOMORROW

              </span>

              <h2>

                Fresh milk.
                <br />
                Less waste.

              </h2>

              <p>

                Our reusable glass bottle experience
                helps make your everyday milk routine
                more thoughtful.

              </p>

              <Link
                to="/about"
                className="goo-light-green-btn"
              >

                Learn More

                <FaArrowRight />

              </Link>

            </div>

            <div className="goo-eco-decoration">

              <FaLeaf />

              <FaLeaf />

              <FaSeedling />

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          BOTTLE FEATURE
      ===================================================== */}

      <section className="goo-bottle-section">

        <div className="container">

          <div className="row align-items-center">

            <div className="col-lg-5 goo-reveal">

              <div className="goo-bottle-wrap">

                <div className="goo-bottle-orbit" />

                <img
                  src={homeBottle}
                  alt="Goo Amrutham bottle"
                  className="goo-bottle"
                />

              </div>

            </div>


            <div className="col-lg-7 goo-reveal">

              <span className="goo-label">

                YOUR MILK ROUTINE, SIMPLIFIED

              </span>

              <h2>

                Everything you need.
                <span> Nothing complicated.</span>

              </h2>

              <p className="goo-large-text">

                Your account keeps your delivery
                experience organized, from ordering
                to tracking and reordering.

              </p>

              <div className="goo-feature-list">

                <div>

                  <span>
                    01
                  </span>

                  <div>
                    <strong>
                      Easy ordering
                    </strong>

                    <p>
                      Choose what you need in seconds.
                    </p>
                  </div>

                </div>

                <div>

                  <span>
                    02
                  </span>

                  <div>
                    <strong>
                      Track your order
                    </strong>

                    <p>
                      Stay updated from confirmation
                      to delivery.
                    </p>
                  </div>

                </div>

                <div>

                  <span>
                    03
                  </span>

                  <div>
                    <strong>
                      Reorder quickly
                    </strong>

                    <p>
                      Repeat your routine without
                      starting again.
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          REVIEWS
      ===================================================== */}

      <section className="goo-review-section">

        <div className="container">

          <div className="text-center goo-reveal">

            <span className="goo-label">

              FROM OUR CUSTOMERS

            </span>

            <h2>

              Loved by families.

            </h2>

          </div>


          <div className="row g-4 mt-3">

            {testimonials.map(
              (testimonial, index) => (

                <div
                  className="col-md-4 goo-reveal"
                  key={testimonial.name}
                  style={{
                    transitionDelay:
                      `${index * 100}ms`,
                  }}
                >

                  <div className="goo-review-card">

                    <div className="goo-stars">

                      <FaStar />
                      <FaStar />
                      <FaStar />
                      <FaStar />
                      <FaStar />

                    </div>

                    <p>

                      “{testimonial.text}”

                    </p>

                    <div className="goo-review-user">

                      <div className="goo-avatar">

                        {testimonial.name
                          ?.charAt(0)
                          ?.toUpperCase()}

                      </div>

                      <strong>

                        {testimonial.name}

                      </strong>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </section>


      {/* =====================================================
          FAQ
      ===================================================== */}

      <section className="goo-faq-section">

        <div className="container">

          <div className="text-center goo-reveal">

            <span className="goo-label">

              FAQ

            </span>

            <h2>

              Everything made simple.

            </h2>

          </div>


          <div
            className="accordion goo-faq"
            id="gooFaq"
          >

            {faqs.map(
              ([question, answer], index) => (

                <div
                  className="accordion-item goo-reveal"
                  key={question}
                >

                  <h2 className="accordion-header">

                    <button
                      className={`accordion-button ${
                        index
                          ? "collapsed"
                          : ""
                      }`}
                      data-bs-toggle="collapse"
                      data-bs-target={`#gooFaq${index}`}
                    >

                      {question}

                    </button>

                  </h2>

                  <div
                    id={`gooFaq${index}`}
                    className={`accordion-collapse collapse ${
                      index === 0
                        ? "show"
                        : ""
                    }`}
                    data-bs-parent="#gooFaq"
                  >

                    <div className="accordion-body">

                      {answer}

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="goo-final-cta">

        <div className="goo-cta-glow" />

        <div className="container position-relative">

          <div className="goo-final-content goo-reveal">

            <span className="goo-pill">

              <FaLeaf />

              START FRESH

            </span>

            <h2>

              Bring the farm
              <br />

              <span>closer to home.</span>

            </h2>

            <p>

              Make your everyday milk routine
              simpler with Goo Amrutham.

            </p>

            <Link
              to="/products"
              className="goo-primary-btn"
            >

              Start Ordering

              <FaArrowRight />

            </Link>

          </div>

        </div>

      </section>

    </main>

  );
}