    import React from "react";
import { Link } from "react-router-dom";
import {
  FaLeaf,
  FaTruck,
  FaGlassWhiskey,
  FaSeedling,
  FaArrowRight,
} from "react-icons/fa";

import ProductCard from "../components/ProductCard";
import { products } from "../data/products";
import { testimonials, faqs } from "../data/content";

import hero from "../assets/images/hero-field.jpeg";
import family from "../assets/images/family-organic.png";
import homeBottle from "../assets/images/home-bottlee.jpg";
import logo from "../assets/images/logo.jpeg";
import familycurd from "../assets/images/curd-family.png";

export default function Home() {
  return (
    <main>

      {/* =====================================================
          HERO IMAGE SLIDER
      ===================================================== */}

      <section className="goo-slider-section">

        <div
          id="gooHeroCarousel"
          className="carousel slide carousel-fade"
          data-bs-ride="carousel"
          data-bs-interval="4000"
        >

          {/* SLIDE INDICATORS */}
          <div className="carousel-indicators">
            <button
              type="button"
              data-bs-target="#gooHeroCarousel"
              data-bs-slide-to="0"
              className="active"
              aria-current="true"
              aria-label="Slide 1"
            ></button>

            <button
              type="button"
              data-bs-target="#gooHeroCarousel"
              data-bs-slide-to="1"
              aria-label="Slide 2"
            ></button>

            <button
              type="button"
              data-bs-target="#gooHeroCarousel"
              data-bs-slide-to="2"
              aria-label="Slide 3"
            ></button>
          </div>

          <div className="carousel-inner">

            {/* =================================================
                SLIDE 1
            ================================================= */}

            <div className="carousel-item active">

              <img
                src={hero}
                className="goo-slide-image"
                alt="Fresh Goo Amrutham milk from green farms"
              />

              <div className="goo-slide-overlay"></div>

              <div className="goo-slide-content">
                <span className="eyebrow slider-eyebrow">
                  <FaLeaf /> FROM OUR FARMS TO YOUR HOME
                </span>

                <h1>
                  Fresh milk.
                  <br />
                  <span>Simple delivery.</span>
                </h1>

                <p>
                  Fresh and natural Goo Amrutham milk delivered
                  straight to your doorstep.
                </p>

                <div className="slider-buttons">
                  <Link
                    to="/products"
                    className="btn btn-success btn-lg rounded-pill px-4"
                  >
                    Order Fresh Milk <FaArrowRight />
                  </Link>

                  <Link
                    to="/about"
                    className="btn btn-light btn-lg rounded-pill px-4"
                  >
                    Our Story
                  </Link>
                </div>

                <div className="slider-trust">
                  <span>✓ Fresh daily</span>
                  <span>✓ Glass bottle</span>
                  <span>✓ Home delivery</span>
                </div>
              </div>

            

            </div>


            {/* =================================================
                SLIDE 2
            ================================================= */}

            <div className="carousel-item">

              <img
                src={familycurd}
                className="goo-slide-image"
                alt="Family enjoying Goo Amrutham milk"
              />

              <div className="goo-slide-overlay"></div>

              <div className="goo-slide-content">

                <span className="eyebrow slider-eyebrow">
                  <FaSeedling /> GOODNESS FOR EVERY FAMILY
                </span>

                <h1>
                  Pure goodness.
                  <br />
                  <span>Made for your family.</span>
                </h1>

                <p>
                  Bring natural goodness and freshness to your
                  family's everyday routine.
                </p>

                <div className="slider-buttons">

                  <Link
                    to="/products"
                    className="btn btn-success btn-lg rounded-pill px-4"
                  >
                    Shop Now <FaArrowRight />
                  </Link>

                  <Link
                    to="/about"
                    className="btn btn-light btn-lg rounded-pill px-4"
                  >
                    Learn More
                  </Link>

                </div>

              </div>

            </div>


            {/* =================================================
                SLIDE 3
            ================================================= */}

            <div className="carousel-item">

              <img
                src={homeBottle}
                className="goo-slide-image"
                alt="Goo Amrutham milk bottle"
              />

              <div className="goo-slide-overlay"></div>

              <div className="goo-slide-content slider-product-content">


                <span className="eyebrow slider-eyebrow">
                  <FaGlassWhiskey /> FRESH • PURE • NATURAL
                </span>

                <h1>
                  From our farms
                  <br />
                  <span>to your home.</span>
                </h1>

                <p>
                  Fresh milk in reusable glass bottles,
                  delivered with care.
                </p>

                <Link
                  to="/products"
                  className="btn btn-success btn-lg rounded-pill px-4"
                >
                  Start Ordering <FaArrowRight />
                </Link>

              </div>

            </div>

          </div>


          {/* PREVIOUS BUTTON */}
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#gooHeroCarousel"
            data-bs-slide="prev"
          >
            <span
              className="carousel-control-prev-icon"
              aria-hidden="true"
            ></span>

            <span className="visually-hidden">
              Previous
            </span>
          </button>


          {/* NEXT BUTTON */}
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#gooHeroCarousel"
            data-bs-slide="next"
          >
            <span
              className="carousel-control-next-icon"
              aria-hidden="true"
            ></span>

            <span className="visually-hidden">
              Next
            </span>
          </button>

        </div>

      </section>


      {/* =====================================================
          TRUST STRIP
      ===================================================== */}

      <section className="trust-strip">
        <div className="container">
          <div className="row g-3">

            {[
              [FaLeaf, "Natural focus", "Thoughtful sourcing"],
              [FaGlassWhiskey, "Eco packaging", "Reusable glass bottle"],
              [FaTruck, "Home delivery", "Choose your slot"],
              [FaSeedling, "Farmer first", "Support local farming"],
            ].map(([Icon, a, b]) => (

              <div
                className="col-6 col-lg-3"
                key={a}
              >

                <div className="trust-card">

                  <Icon />

                  <div>
                    <b>{a}</b>
                    <small>{b}</small>
                  </div>

                </div>

              </div>

            ))}

          </div>
        </div>
      </section>


      {/* =====================================================
          STORY
      ===================================================== */}

      <section className="story-section section-pad">

        <div className="container">

          <div className="row align-items-center g-5">

            <div className="col-lg-6">

              <img
                className="story-img"
                src={family}
                alt="Family enjoying milk"
              />

            </div>

            <div className="col-lg-6">

              <span className="eyebrow">
                THE GOO AMRUTHAM WAY
              </span>

              <h2>
                From the farm to your family table.
              </h2>

              <p>
                Our website is designed around one simple idea:
                make ordering local milk as easy as ordering
                anything online, while keeping the experience
                warm and personal.
              </p>

              <div className="check-list">

                <div>✓ Easy online ordering</div>
                <div>✓ WhatsApp order sharing</div>
                <div>✓ Order status tracking</div>
                <div>✓ Quick reorder from history</div>

              </div>

              <Link
                to="/about"
                className="btn btn-dark rounded-pill mt-3"
              >
                Discover our story
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          WHY US
      ===================================================== */}

      <section className="section-pad">

        <div className="container">

          <div className="section-heading">

            <div>

              <span className="eyebrow">
                WHY US
              </span>

              <h2>
                Built for everyday families
              </h2>

            </div>

          </div>

          <div className="row g-4">

            {[
              "Fresh & convenient",
              "Track every order",
              "WhatsApp support",
              "Simple subscriptions",
            ].map((x, i) => (

              <div
                className="col-sm-6 col-lg-3"
                key={x}
              >

                <div className="feature-box">

                  <div className="feature-num">
                    0{i + 1}
                  </div>

                  <h5>{x}</h5>

                  <p>
                    Everything you need for a smooth
                    milk delivery routine.
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="cta-section">

        <div className="container">

          <div className="cta-card">

            <div>

              <span className="eyebrow">
                READY WHEN YOU ARE
              </span>

              <h2>
                Make your morning milk one tap away.
              </h2>

              <p>
                Sign in, add your quantity and place your
                order in minutes.
              </p>

            </div>

            <Link
              to="/products"
              className="btn btn-light btn-lg rounded-pill"
            >
              Start Ordering
            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          ORDER TRACKING
      ===================================================== */}

      <section className="section-pad">

        <div className="container">

          <div className="row align-items-center g-5">

            <div className="col-lg-5">

              <img
                src={homeBottle}
                className="clean-bottle"
                alt="Goo Amrutham milk bottle"
              />

            </div>

            <div className="col-lg-7">

              <span className="eyebrow">
                A BETTER ROUTINE
              </span>

              <h2>
                Know where your order is.
              </h2>

              <p>
                Once you place an order, your account keeps
                the details in one place. Check status,
                delivery slot, order total and reorder in
                seconds.
              </p>

              <div className="row g-3">

                <div className="col-sm-6">

                  <div className="soft-card">

                    <b>
                      Live status timeline
                    </b>

                    <small>
                      Placed → Confirmed → Preparing →
                      Delivery → Delivered
                    </small>

                  </div>

                </div>

                <div className="col-sm-6">

                  <div className="soft-card">

                    <b>
                      Fast reorder
                    </b>

                    <small>
                      Repeat a previous basket without
                      rebuilding it.
                    </small>

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

      <section className="section-pad bg-soft">

        <div className="container">

          <div className="section-heading">

            <div>

              <span className="eyebrow">
                REVIEWS
              </span>

              <h2>
                What customers say
              </h2>

            </div>

          </div>

          <div className="row g-4">

            {testimonials.map((t) => (

              <div
                className="col-md-4"
                key={t.name}
              >

                <div className="review-card">

                  <div className="stars">
                    ★★★★★
                  </div>

                  <p>
                    “{t.text}”
                  </p>

                  <b>
                    {t.name}
                  </b>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          FAQ
      ===================================================== */}

      <section className="section-pad">

        <div className="container">

          <div className="section-heading">

            <div>

              <span className="eyebrow">
                FAQ
              </span>

              <h2>
                Common questions
              </h2>

            </div>

          </div>

          <div
            className="accordion"
            id="faq"
          >

            {faqs.map(([q, a], i) => (

              <div
                className="accordion-item"
                key={q}
              >

                <h2 className="accordion-header">

                  <button
                    className={`accordion-button ${
                      i ? "collapsed" : ""
                    }`}
                    data-bs-toggle="collapse"
                    data-bs-target={`#f${i}`}
                  >
                    {q}
                  </button>

                </h2>

                <div
                  id={`f${i}`}
                  className={`accordion-collapse collapse ${
                    i === 0 ? "show" : ""
                  }`}
                  data-bs-parent="#faq"
                >

                  <div className="accordion-body">
                    {a}
                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

    </main>
  );
}
