import React, { useState } from "react";
import {
  FaPlus,
  FaShoppingCart,
  FaSyncAlt,
  FaArrowRight,
  FaCheck,
} from "react-icons/fa";

import { useApp } from "../context/AppContext";
import { createSubscription } from "../services/subscriptionService";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {
  const { addToCart, currentUser } = useApp();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [frequency, setFrequency] = useState("Daily");
  const [deliverySlot, setDeliverySlot] = useState("Morning");

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [added, setAdded] = useState(false);

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = () => {
    addToCart(product.id);

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1400);
  };

  // =====================================================
  // SUBSCRIBE
  // =====================================================

  const handleOpenSubscription = () => {
    setError("");
    setMessage("");

    if (!currentUser) {
      navigate("/login");
      return;
    }

    navigate("/subscribe-details", {
      state: {
        product,
      },
    });
  };

  // =====================================================
  // CREATE SUBSCRIPTION
  // =====================================================

  const handleSubscribe = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!currentUser) {
      setError("Please login first.");
      return;
    }

    if (!deliveryAddress.trim()) {
      setError("Please enter your delivery address.");
      return;
    }

    if (!city.trim()) {
      setError("Please enter your city.");
      return;
    }

    if (!pincode.trim()) {
      setError("Please enter your pincode.");
      return;
    }

    if (pincode.trim().length !== 6) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    try {
      setLoading(true);

      await createSubscription({
        userId: currentUser.id,
        product,
        quantity,
        frequency,
        deliverySlot,
        deliveryAddress,
        city,
        pincode,
      });

      setMessage("Subscription created successfully! 🥛");

      setTimeout(() => {
        setShowModal(false);
        setMessage("");
      }, 1500);
    } catch (err) {
      console.error("Subscription error:", err);

      setError(
        err?.message ||
        "Unable to create subscription. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* =====================================================
          INTERNAL CSS
      ===================================================== */}
<style>{`

/* =========================================================
   GOO AMRUTHAM — PREMIUM PRODUCT CARD
   Mobile-first + responsive + premium animation
========================================================= */

.goo-product-card {
  position: relative;
  height: 100%;
  overflow: hidden;

  display: flex;
  flex-direction: column;

  background: rgba(255,255,255,.98);

  border: 1px solid rgba(25,135,84,.10);
  border-radius: 26px;

  box-shadow:
    0 12px 35px rgba(0,0,0,.055),
    0 3px 10px rgba(0,0,0,.025);

  transform: translate3d(0,0,0);

  transition:
    transform .45s cubic-bezier(.2,.8,.2,1),
    box-shadow .45s ease,
    border-color .35s ease;

  animation:
    gooProductReveal .7s cubic-bezier(.16,1,.3,1) both;
}

/* PREMIUM GLOW */

.goo-product-card::before {
  content: "";

  position: absolute;
  inset: 0;

  pointer-events: none;

  background:
    radial-gradient(
      circle at 100% 0%,
      rgba(25,135,84,.12),
      transparent 34%
    );

  opacity: 0;

  transition: opacity .45s ease;

  z-index: 0;
}

/* LIGHT SHINE */

.goo-product-card::after {
  content: "";

  position: absolute;

  top: 0;
  left: -120%;

  width: 70%;
  height: 100%;

  pointer-events: none;

  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,.22),
      transparent
    );

  transform: skewX(-18deg);

  transition: left .8s ease;

  z-index: 5;
}

.goo-product-card:hover {
  transform: translate3d(0,-9px,0);

  border-color:
    rgba(25,135,84,.22);

  box-shadow:
    0 25px 65px rgba(25,135,84,.13),
    0 10px 25px rgba(0,0,0,.07);
}

.goo-product-card:hover::before {
  opacity: 1;
}

.goo-product-card:hover::after {
  left: 140%;
}


/* =========================================================
   CARD REVEAL
========================================================= */

@keyframes gooProductReveal {

  0% {
    opacity: 0;
    transform:
      translate3d(0,25px,0)
      scale(.97);
  }

  100% {
    opacity: 1;
    transform:
      translate3d(0,0,0)
      scale(1);
  }

}


/* =========================================================
   PRODUCT IMAGE
   IMPORTANT:
   NO PADDING
   100% WIDTH
========================================================= */

.goo-product-image {

  position: relative;

  width: 100%;

  height: 260px;

  flex-shrink: 0;

  overflow: hidden;

  display: block;

  background:
    linear-gradient(
      145deg,
      #f4faf6,
      #ffffff
    );

  border-radius:
    26px 26px 0 0;
}


/* IMAGE ITSELF */

.goo-product-image img {

  display: block;

  width: 100%;
  height: 100%;

  max-width: none;

  padding: 0;
  margin: 0;

  border: 0;

  object-fit: cover;

  object-position: center center;

  transform:
    translate3d(0,0,0)
    scale(1);

  transition:
    transform .8s cubic-bezier(.2,.8,.2,1),
    filter .5s ease;

  will-change: transform;
}


/* IMAGE ZOOM */

.goo-product-card:hover
.goo-product-image img {

  transform:
    translate3d(0,0,0)
    scale(1.07);

  filter:
    saturate(1.05)
    contrast(1.02);
}


/* IMAGE SHINE */

.goo-product-image::after {

  content: "";

  position: absolute;

  inset: 0;

  pointer-events: none;

  background:
    linear-gradient(
      110deg,
      transparent 35%,
      rgba(255,255,255,.45) 50%,
      transparent 65%
    );

  transform:
    translateX(-130%);

  transition:
    transform .85s ease;

  z-index: 2;
}

.goo-product-card:hover
.goo-product-image::after {

  transform:
    translateX(130%);
}


/* =========================================================
   PRODUCT BADGE
========================================================= */

.goo-product-badge {

  position: absolute;

  top: 15px;
  left: 15px;

  z-index: 4;

  display: inline-flex;

  align-items: center;
  justify-content: center;

  padding:
    7px 13px;

  border-radius: 999px;

  color: #fff;

  background:
    linear-gradient(
      135deg,
      #198754,
      #157347
    );

  font-size: 11px;

  font-weight: 800;

  letter-spacing: .05em;

  text-transform: uppercase;

  box-shadow:
    0 8px 22px rgba(25,135,84,.25);

  animation:
    gooBadgeFloat 3s ease-in-out infinite;
}

@keyframes gooBadgeFloat {

  0%,
  100% {
    transform:
      translateY(0);
  }

  50% {
    transform:
      translateY(-4px);
  }

}


/* =========================================================
   PRODUCT CONTENT
========================================================= */

.goo-product-content {

  position: relative;

  z-index: 3;

  flex: 1;

  display: flex;

  flex-direction: column;

  padding: 21px;
}


/* UNIT */

.goo-product-unit {

  margin-bottom: 4px;

  font-size: 11px;

  font-weight: 800;

  color: #7c8a82;

  letter-spacing: .06em;

  text-transform: uppercase;
}


/* TITLE */

.goo-product-title {

  margin:
    4px 0 7px;

  color: #18221c;

  font-size: 20px;

  font-weight: 800;

  line-height: 1.25;

  letter-spacing: -.02em;
}


/* DESCRIPTION */

.goo-product-description {

  margin-bottom: 18px;

  min-height: 44px;

  color: #6c7771;

  font-size: 14px;

  line-height: 1.55;
}


/* =========================================================
   PRICE + ACTION AREA
========================================================= */

.goo-product-bottom {

  margin-top: auto;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 12px;
}


/* PRICE */

.goo-product-price {

  flex-shrink: 0;

  color: #198754;

  font-size: 24px;

  font-weight: 900;

  line-height: 1;

  letter-spacing: -.04em;
}


/* =========================================================
   BUTTON AREA
========================================================= */

.goo-product-actions {

  display: flex;

  align-items: center;

  justify-content: flex-end;

  gap: 8px;

  min-width: 0;
}


/* BUTTON */

.goo-product-btn {

  position: relative;

  overflow: hidden;

  min-height: 44px;

  border-radius: 999px !important;

  font-size: 13px;

  font-weight: 700;

  white-space: nowrap;

  transition:
    transform .25s ease,
    box-shadow .25s ease,
    background .25s ease;

  will-change: transform;
}


/* BUTTON SHINE */

.goo-product-btn::before {

  content: "";

  position: absolute;

  top: -30%;

  left: -120px;

  width: 80px;

  height: 160%;

  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,.38),
      transparent
    );

  transform:
    rotate(20deg);

  transition:
    left .65s ease;

  pointer-events: none;
}

.goo-product-btn:hover::before {
  left: 130%;
}


/* BUTTON HOVER */

.goo-product-btn:hover {

  transform:
    translateY(-2px);

  box-shadow:
    0 9px 24px rgba(25,135,84,.18);
}


/* BUTTON PRESS */

.goo-product-btn:active {

  transform:
    scale(.95);
}


/* =========================================================
   ADD TO CART SUCCESS
========================================================= */

.goo-added {

  animation:
    gooAddedPop .45s
    cubic-bezier(.2,.8,.2,1);
}

@keyframes gooAddedPop {

  0% {
    transform: scale(1);
  }

  40% {
    transform: scale(1.08);
  }

  70% {
    transform: scale(.97);
  }

  100% {
    transform: scale(1);
  }

}


/* =========================================================
   SUBSCRIPTION BACKDROP
========================================================= */

.goo-subscription-backdrop {

  position: fixed;

  inset: 0;

  z-index: 2000;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 18px;

  background:
    rgba(4,18,10,.64);

  backdrop-filter:
    blur(14px);

  -webkit-backdrop-filter:
    blur(14px);

  animation:
    gooBackdropIn .3s ease both;
}

@keyframes gooBackdropIn {

  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }

}


/* =========================================================
   SUBSCRIPTION MODAL
========================================================= */

.goo-subscription-modal {

  width:
    min(720px, 100%);

  max-height:
    92vh;

  overflow-y:
    auto;

  background:
    #fff;

  border-radius:
    28px;

  box-shadow:
    0 35px 100px rgba(0,0,0,.28);

  animation:
    gooModalIn
    .55s
    cubic-bezier(.16,1,.3,1)
    both;

  overscroll-behavior:
    contain;
}

@keyframes gooModalIn {

  from {

    opacity: 0;

    transform:
      translateY(35px)
      scale(.94);
  }

  to {

    opacity: 1;

    transform:
      translateY(0)
      scale(1);
  }

}


/* =========================================================
   MODAL HEADER
========================================================= */

.goo-modal-header {

  position: sticky;

  top: 0;

  z-index: 5;

  padding: 21px;

  background:
    rgba(255,255,255,.94);

  backdrop-filter:
    blur(14px);

  -webkit-backdrop-filter:
    blur(14px);

  border-bottom:
    1px solid #edf1ee;
}


/* =========================================================
   MODAL BODY
========================================================= */

.goo-modal-body {

  padding: 22px;
}


/* =========================================================
   MODAL FOOTER
========================================================= */

.goo-modal-footer {

  position: sticky;

  bottom: 0;

  z-index: 5;

  padding:
    15px 22px;

  background:
    rgba(255,255,255,.95);

  backdrop-filter:
    blur(14px);

  -webkit-backdrop-filter:
    blur(14px);

  border-top:
    1px solid #edf1ee;
}


/* =========================================================
   MODAL PRODUCT PREVIEW
========================================================= */

.goo-modal-product {

  display: flex;

  align-items: center;

  gap: 15px;

  padding: 15px;

  border-radius: 20px;

  background:
    linear-gradient(
      135deg,
      #f2faf5,
      #fff
    );

  border:
    1px solid
    rgba(25,135,84,.08);
}

.goo-modal-product img {

  width: 70px;

  height: 70px;

  flex-shrink: 0;

  padding: 0;

  object-fit: cover;

  border-radius: 18px;

  box-shadow:
    0 8px 20px rgba(0,0,0,.08);
}


/* =========================================================
   FORM
========================================================= */

.goo-form-control {

  width: 100%;

  min-height: 48px;

  border-radius: 14px !important;

  border:
    1px solid #dfe7e2 !important;

  transition:
    border-color .25s ease,
    box-shadow .25s ease,
    transform .25s ease;
}

.goo-form-control:focus {

  border-color:
    #198754 !important;

  box-shadow:
    0 0 0 4px
    rgba(25,135,84,.10) !important;

  transform:
    translateY(-1px);
}


/* =========================================================
   FREQUENCY BUTTON
========================================================= */

.goo-frequency-btn {

  min-height: 46px;

  border-radius:
    14px !important;

  font-weight: 700;

  transition:
    transform .25s ease,
    background .25s ease,
    box-shadow .25s ease;
}

.goo-frequency-btn:hover {

  transform:
    translateY(-2px);
}

.goo-frequency-btn:active {

  transform:
    scale(.97);
}


/* =========================================================
   TABLET
========================================================= */

@media (max-width: 991px) {

  .goo-product-image {

    height: 245px;
  }

  .goo-product-content {

    padding: 19px;
  }

  .goo-product-title {

    font-size: 19px;
  }

  .goo-product-price {

    font-size: 22px;
  }

}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 767px) {

  .goo-product-card {

    width: 100%;

    border-radius:
      22px;

    box-shadow:
      0 9px 28px rgba(0,0,0,.055);

    animation-duration:
      .55s;
  }


  /* FULL WIDTH IMAGE */

  .goo-product-image {

    width: 100%;

    height: 230px;

    min-height: 230px;

    max-height: 230px;

    border-radius:
      22px 22px 0 0;
  }


  .goo-product-image img {

    width: 100%;

    height: 100%;

    object-fit: cover;

    object-position:
      center center;
  }


  /* BADGE */

  .goo-product-badge {

    top: 12px;

    left: 12px;

    padding:
      6px 10px;

    font-size:
      10px;
  }


  /* CONTENT */

  .goo-product-content {

    padding:
      16px;
  }


  .goo-product-unit {

    font-size:
      10px;
  }


  .goo-product-title {

    font-size:
      18px;

    line-height:
      1.25;

    margin-bottom:
      7px;
  }


  .goo-product-description {

    min-height:
      auto;

    margin-bottom:
      15px;

    font-size:
      13px;

    line-height:
      1.5;
  }


  /* PRICE + BUTTONS */

  .goo-product-bottom {

    display:
      flex;

    flex-direction:
      column;

    align-items:
      stretch;

    gap:
      13px;
  }


  .goo-product-price {

    font-size:
      22px;
  }


  .goo-product-actions {

    width:
      100%;

    display:
      grid;

    grid-template-columns:
      1fr 1fr;

    gap:
      8px;
  }


  .goo-product-btn {

    width:
      100%;

    min-height:
      46px;

    padding-left:
      8px !important;

    padding-right:
      8px !important;

    font-size:
      12px;
  }


  /* MODAL */

  .goo-subscription-backdrop {

    align-items:
      flex-end;

    padding:
      0;
  }


  .goo-subscription-modal {

    width:
      100%;

    max-width:
      100%;

    max-height:
      94vh;

    border-radius:
      25px 25px 0 0;

    animation:
      gooMobileModalIn
      .5s
      cubic-bezier(.16,1,.3,1)
      both;
  }


  @keyframes gooMobileModalIn {

    from {

      opacity:
        0;

      transform:
        translateY(100%);
    }

    to {

      opacity:
        1;

      transform:
        translateY(0);
    }
  }


  .goo-modal-header {

    padding:
      17px;
  }


  .goo-modal-body {

    padding:
      17px;
  }


  .goo-modal-footer {

    padding:
      13px 17px;

    display:
      grid !important;

    grid-template-columns:
      1fr 1.45fr;

    gap:
      8px;
  }


  .goo-modal-footer button {

    width:
      100%;

    min-height:
      46px;
  }


  .goo-modal-product {

    padding:
      12px;

    gap:
      12px;
  }


  .goo-modal-product img {

    width:
      58px;

    height:
      58px;

    border-radius:
      15px;
  }

}


/* =========================================================
   SMALL MOBILE
========================================================= */

@media (max-width: 480px) {

  .goo-product-card {

    border-radius:
      20px;
  }


  .goo-product-image {

    height:
      215px;

    min-height:
      215px;

    max-height:
      215px;

    border-radius:
      20px 20px 0 0;
  }


  .goo-product-content {

    padding:
      15px;
  }


  .goo-product-title {

    font-size:
      17px;
  }


  .goo-product-description {

    font-size:
      12.5px;
  }


  .goo-product-price {

    font-size:
      21px;
  }


  .goo-product-btn {

    min-height:
      44px;

    font-size:
      11.5px;
  }


  .goo-product-btn svg {

    font-size:
      12px;
  }

}


/* =========================================================
   VERY SMALL PHONES
========================================================= */

@media (max-width: 380px) {

  .goo-product-image {

    height:
      195px;

    min-height:
      195px;

    max-height:
      195px;
  }


  .goo-product-content {

    padding:
      13px;
  }


  .goo-product-title {

    font-size:
      16px;
  }


  .goo-product-description {

    font-size:
      12px;

    line-height:
      1.45;
  }


  .goo-product-price {

    font-size:
      20px;
  }


  .goo-product-actions {

    gap:
      6px;
  }


  .goo-product-btn {

    min-height:
      43px;

    padding-left:
      5px !important;

    padding-right:
      5px !important;

    font-size:
      11px;
  }

}


/* =========================================================
   TOUCH DEVICES
   Avoid desktop hover effects on phones
========================================================= */

@media (hover: none) {

  .goo-product-card:hover {

    transform:
      none;

    box-shadow:
      0 9px 28px rgba(0,0,0,.055);
  }


  .goo-product-card:hover::before {

    opacity:
      0;
  }


  .goo-product-card:hover::after {

    left:
      -120%;
  }


  .goo-product-card:hover
  .goo-product-image img {

    transform:
      none;

    filter:
      none;
  }


  .goo-product-card:hover
  .goo-product-image::after {

    transform:
      translateX(-130%);
  }


  .goo-product-btn:hover {

    transform:
      none;

    box-shadow:
      none;
  }

}


/* =========================================================
   ACCESSIBILITY
========================================================= */

@media (prefers-reduced-motion: reduce) {

  .goo-product-card,
  .goo-product-card::after,
  .goo-product-image img,
  .goo-product-image::after,
  .goo-product-btn,
  .goo-product-badge,
  .goo-subscription-modal,
  .goo-subscription-backdrop {

    animation:
      none !important;

    transition:
      none !important;
  }

}


/* =========================================================
   DARK MODE SUPPORT
========================================================= */

[data-theme="dark"] .goo-product-card {

  background:
    #101814;

  border-color:
    rgba(255,255,255,.08);

  box-shadow:
    0 15px 40px rgba(0,0,0,.22);
}


[data-theme="dark"] .goo-product-title {

  color:
    #f1f7f3;
}


[data-theme="dark"] .goo-product-description {

  color:
    #aab8b0;
}


[data-theme="dark"] .goo-product-image {

  background:
    linear-gradient(
      145deg,
      #152019,
      #101814
    );
}


/* =========================================================
   PREVENT IMAGE OVERFLOW
========================================================= */

.goo-product-image,
.goo-product-image img {

  box-sizing:
    border-box;
}


/* =========================================================
   MOBILE IMAGE PERFORMANCE
========================================================= */

@media (max-width: 767px) {

  .goo-product-image img {

    backface-visibility:
      hidden;

    -webkit-backface-visibility:
      hidden;

    transform:
      translateZ(0);
  }

}

`}</style>


      {/* =====================================================
          PRODUCT CARD
      ===================================================== */}

      <div className="goo-product-card">

        {/* IMAGE */}

        <div className="goo-product-image">

          {product.badge && (
            <span className="goo-product-badge">
              ✦ {product.badge}
            </span>
          )}

          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
          />

        </div>


        {/* CONTENT */}

        <div className="goo-product-content">

          <div className="goo-product-unit">
            {product.unit}
          </div>

          <h5 className="goo-product-title">
            {product.name}
          </h5>

          <p className="goo-product-description">
            {product.description}
          </p>


          {/* PRICE + ACTIONS */}

          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">

            <strong className="goo-product-price">
              ₹{product.price}
            </strong>


            <div className="goo-product-actions">

              {/* ADD */}

              <button
                type="button"
                className={`btn btn-success goo-product-btn ${added ? "goo-added" : ""
                  }`}
                onClick={handleAddToCart}
                title="Add to cart"
              >

                {added ? (
                  <>
                    <FaCheck />
                    <span className="ms-1">
                      Added
                    </span>
                  </>
                ) : (
                  <>
                    <FaShoppingCart />
                    <span className="ms-1">
                      Add
                    </span>
                  </>
                )}

              </button>


              {/* SUBSCRIBE */}

              <button
                type="button"
                className="btn btn-outline-success goo-product-btn"
                onClick={handleOpenSubscription}
              >
                <FaSyncAlt className="me-1" />
                Subscribe
              </button>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          SUBSCRIPTION MODAL
      ===================================================== */}

      {showModal && (

        <div
          className="goo-subscription-backdrop"
          role="dialog"
          aria-modal="true"
        >

          <div className="goo-subscription-modal">

            {/* HEADER */}

            <div className="goo-modal-header d-flex justify-content-between align-items-center">

              <div>

                <div className="small text-success fw-bold mb-1">
                  GOO AMRUTHAM
                </div>

                <h5 className="fw-bold mb-1">
                  Subscribe to {product.name}
                </h5>

                <small className="text-muted">
                  Fresh delivery, made simple.
                </small>

              </div>

              <button
                type="button"
                className="btn-close"
                onClick={() => setShowModal(false)}
                disabled={loading}
              />

            </div>


            {/* FORM */}

            <form onSubmit={handleSubscribe}>

              <div className="goo-modal-body">


                {/* PRODUCT */}

                <div className="goo-modal-product mb-4">

                  <img
                    src={product.image}
                    alt={product.name}
                  />

                  <div className="flex-grow-1">

                    <div className="fw-bold">
                      {product.name}
                    </div>

                    <small className="text-muted">
                      {product.unit}
                    </small>

                  </div>

                  <strong className="text-success fs-5">
                    ₹{product.price}
                  </strong>

                </div>


                {/* QUANTITY */}

                <div className="mb-4">

                  <label className="form-label fw-bold">
                    Quantity
                  </label>

                  <div className="input-group">

                    <button
                      type="button"
                      className="btn btn-outline-success"
                      onClick={() =>
                        setQuantity(
                          Math.max(1, quantity - 1)
                        )
                      }
                      disabled={loading}
                    >
                      −
                    </button>

                    <input
                      type="number"
                      className="form-control text-center goo-form-control"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.max(
                            1,
                            Number(e.target.value) || 1
                          )
                        )
                      }
                      disabled={loading}
                    />

                    <button
                      type="button"
                      className="btn btn-outline-success"
                      onClick={() =>
                        setQuantity(quantity + 1)
                      }
                      disabled={loading}
                    >
                      +
                    </button>

                  </div>

                </div>


                {/* FREQUENCY */}

                <div className="mb-4">

                  <label className="form-label fw-bold">
                    Delivery Frequency
                  </label>

                  <div className="row g-2">

                    {[
                      "Daily",
                      "Weekly",
                      "Monthly",
                    ].map((option) => (

                      <div
                        className="col-4"
                        key={option}
                      >

                        <button
                          type="button"
                          className={`btn w-100 goo-frequency-btn ${frequency === option
                            ? "btn-success"
                            : "btn-outline-success"
                            }`}
                          onClick={() =>
                            setFrequency(option)
                          }
                          disabled={loading}
                        >
                          {option}
                        </button>

                      </div>

                    ))}

                  </div>

                </div>


                {/* DELIVERY SLOT */}

                <div className="mb-4">

                  <label className="form-label fw-bold">
                    Delivery Slot
                  </label>

                  <select
                    className="form-select goo-form-control"
                    value={deliverySlot}
                    onChange={(e) =>
                      setDeliverySlot(e.target.value)
                    }
                    disabled={loading}
                  >

                    <option value="Morning">
                      🌅 Morning
                    </option>

                    <option value="Evening">
                      🌇 Evening
                    </option>

                  </select>

                </div>


                {/* ADDRESS */}

                <div className="mb-4">

                  <label className="form-label fw-bold">
                    Delivery Address
                  </label>

                  <textarea
                    className="form-control goo-form-control"
                    rows="3"
                    placeholder="House number, street, area..."
                    value={deliveryAddress}
                    onChange={(e) =>
                      setDeliveryAddress(e.target.value)
                    }
                    disabled={loading}
                  />

                </div>


                {/* CITY + PIN */}

                <div className="row g-3">

                  <div className="col-12 col-sm-6">

                    <label className="form-label fw-bold">
                      City
                    </label>

                    <input
                      type="text"
                      className="form-control goo-form-control"
                      placeholder="Your city"
                      value={city}
                      onChange={(e) =>
                        setCity(e.target.value)
                      }
                      disabled={loading}
                    />

                  </div>


                  <div className="col-12 col-sm-6">

                    <label className="form-label fw-bold">
                      Pincode
                    </label>

                    <input
                      type="text"
                      className="form-control goo-form-control"
                      placeholder="6-digit pincode"
                      maxLength="6"
                      inputMode="numeric"
                      value={pincode}
                      onChange={(e) =>
                        setPincode(
                          e.target.value.replace(
                            /\D/g,
                            ""
                          )
                        )
                      }
                      disabled={loading}
                    />

                  </div>

                </div>


                {/* ERROR */}

                {error && (

                  <div className="alert alert-danger mt-4 rounded-4">
                    {error}
                  </div>

                )}


                {/* SUCCESS */}

                {message && (

                  <div className="alert alert-success mt-4 rounded-4 d-flex align-items-center gap-2">

                    <FaCheck />

                    {message}

                  </div>

                )}

              </div>


              {/* FOOTER */}

              <div className="goo-modal-footer d-flex justify-content-end gap-2">

                <button
                  type="button"
                  className="btn btn-light rounded-pill px-4"
                  onClick={() =>
                    setShowModal(false)
                  }
                  disabled={loading}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="btn btn-success rounded-pill px-4"
                  disabled={loading}
                >

                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />

                      Creating...
                    </>
                  ) : (
                    <>
                      <FaSyncAlt className="me-2" />

                      Start Subscription

                      <FaArrowRight className="ms-2" />
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </>
  );
}