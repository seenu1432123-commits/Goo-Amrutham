import React from "react";
import { FaInstagram, FaWhatsapp, FaFacebookF } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer mt-5">
      <div className="container py-5">
        <div className="row g-4">

          {/* BRAND */}
          <div className="col-12 col-lg-5">
            <h3>Goo Amrutham Milk</h3>

            <p>
              From our farms to your home.
            </p>

            <p className="small opacity-75">
              Fresh milk ordering, simple delivery tracking and WhatsApp
              support in one place.
            </p>
          </div>

          {/* EXPLORE */}
          <div className="col-6 col-lg-2">
            <h6>Explore</h6>

            <Link to="/">Home</Link>
            <Link to="/products">Our Milk</Link>
            <Link to="/subscriptions">My Subscriptions</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>

          {/* ACCOUNT */}
          <div className="col-6 col-lg-2">
            <h6>Account</h6>

            <Link to="/login">Login</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/subscriptions">My Subscriptions</Link>
          </div>

          {/* CONNECT */}
          <div className="col-12 col-lg-3">
            <h6>Connect</h6>

            <div className="socials">

              <a
                href="https://wa.me/918919597205"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
              >
                <FaWhatsapp />
              </a>

              <a
                href="#"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>

              <a
                href="#"
                aria-label="Facebook"
              >
                <FaFacebookF />
              </a>

            </div>

            <p className="small mt-3">
              WhatsApp: +91 8919597205
            </p>
          </div>

        </div>
      </div>

      <div className="footer-bottom">
        © 2026 Goo Amrutham Milk. All rights reserved.
      </div>
    </footer>
  );
}