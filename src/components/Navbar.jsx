import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FaShoppingBag,
  FaUserCircle,
  FaMoon,
  FaSun,
  FaBars,
  FaUser,
  FaSignOutAlt,
  FaChevronDown,
  FaLeaf,
} from "react-icons/fa";

import { useApp } from "../context/AppContext";
import logo from "../assets/images/logo.jpeg";

export default function Navbar() {
  const {
    currentUser,
    logout,
    cartItems,
    theme,
    setTheme,
  } = useApp();

  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const profileRef = useRef(null);

  /* =====================================================
     SCROLL EFFECT
  ===================================================== */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };

    window.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =====================================================
     CLOSE PROFILE WHEN CLICKING OUTSIDE
  ===================================================== */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =====================================================
     LOCK BODY WHEN MOBILE MENU IS OPEN
  ===================================================== */

  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add(
        "goo-mobile-menu-open"
      );
    } else {
      document.body.classList.remove(
        "goo-mobile-menu-open"
      );
    }

    return () => {
      document.body.classList.remove(
        "goo-mobile-menu-open"
      );
    };
  }, [mobileOpen]);

  /* =====================================================
     PROFILE
  ===================================================== */

  const handleProfile = () => {
    setProfileOpen(false);
    setMobileOpen(false);
    navigate("/profile");
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = async () => {
    setProfileOpen(false);
    setMobileOpen(false);

    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  /* =====================================================
     CLOSE MENUS
  ===================================================== */

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setProfileOpen(false);
  };

  /* =====================================================
     NAVIGATION LINKS
  ===================================================== */

  const navLinks = [
    {
      to: "/",
      label: "Home",
    },
    {
      to: "/products",
      label: "Our Store",
    },
    {
      to: "/subscriptions",
      label: "My Subscriptions",
    },
    {
      to: "/about",
      label: "About",
    },
    {
      to: "/contact",
      label: "Contact",
    },
  ];

  /* =====================================================
     CART COUNT
  ===================================================== */

  const cartCount = Array.isArray(cartItems)
    ? cartItems.reduce(
        (total, item) =>
          total + Number(item.qty || 0),
        0
      )
    : 0;

  /* =====================================================
     NAV LINK
  ===================================================== */

  const renderNavLink = (link, mobile = false) => (
    <NavLink
      key={link.to}
      to={link.to}
      end={link.to === "/"}
      onClick={closeMobileMenu}
      className={({ isActive }) =>
        `goo-nav-link ${
          mobile ? "goo-mobile-nav-link" : ""
        } ${isActive ? "active" : ""}`
      }
    >
      <span>{link.label}</span>

      <span className="goo-nav-link-dot" />
    </NavLink>
  );

  return (
    <>
      {/* =================================================
          INTERNAL CSS
      ================================================= */}

      <style>{`

        /* ===============================================
           BASE
        =============================================== */

        .goo-navbar {
          position: sticky;
          top: 0;
          z-index: 1050;

          background:
            rgba(255, 255, 255, 0.88);

          backdrop-filter:
            blur(20px)
            saturate(150%);

          -webkit-backdrop-filter:
            blur(20px)
            saturate(150%);

          border-bottom:
            1px solid
            rgba(25, 135, 84, 0.08);

          transition:
            all 0.35s cubic-bezier(
              0.22,
              1,
              0.36,
              1
            );
        }

        .goo-navbar.scrolled {
          background:
            rgba(255, 255, 255, 0.96);

          box-shadow:
            0 10px 40px
            rgba(20, 60, 40, 0.09);

          border-bottom-color:
            rgba(25, 135, 84, 0.12);
        }

        .goo-nav-container {
          min-height: 76px;

          transition:
            min-height 0.35s ease;
        }

        .goo-navbar.scrolled
        .goo-nav-container {
          min-height: 66px;
        }

        /* ===============================================
           BRAND
        =============================================== */

        .goo-brand {
          position: relative;

          display: flex;
          align-items: center;

          gap: 11px;

          text-decoration: none;

          flex-shrink: 0;

          transition:
            transform 0.3s ease;
        }

        .goo-brand:hover {
          transform:
            translateY(-1px);
        }

        .goo-logo-wrap {
          position: relative;

          width: 50px;
          height: 50px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          padding: 2px;

          background:
            linear-gradient(
              135deg,
              #198754,
              #72c69b,
              #198754
            );

          box-shadow:
            0 6px 22px
            rgba(25, 135, 84, 0.18);

          transition:
            transform 0.4s
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            ),
            box-shadow 0.4s ease;
        }

        .goo-brand:hover
        .goo-logo-wrap {
          transform:
            rotate(-4deg)
            scale(1.06);

          box-shadow:
            0 9px 28px
            rgba(25, 135, 84, 0.28);
        }

        .goo-logo {
          width: 100%;
          height: 100%;

          object-fit: cover;

          border-radius: 50%;

          border: 2px solid white;

          display: block;
        }

        .goo-brand-text {
          display: flex;
          flex-direction: column;

          line-height: 1;
        }

        .goo-brand-name {
          color: #198754;

          font-size: 18px;
          font-weight: 800;

          letter-spacing: -0.3px;
        }

        .goo-brand-tagline {
          color: #7a887f;

          font-size: 9px;

          margin-top: 5px;

          letter-spacing: 0.7px;

          text-transform: uppercase;
        }

        .goo-brand-leaf {
          position: absolute;

          left: 36px;
          top: -4px;

          color: #79b798;

          font-size: 9px;

          opacity: 0;

          transform:
            translateY(5px)
            rotate(-15deg);

          transition:
            all 0.35s ease;
        }

        .goo-brand:hover
        .goo-brand-leaf {
          opacity: 1;

          transform:
            translateY(0)
            rotate(0);
        }

        /* ===============================================
           DESKTOP NAV
        =============================================== */

        .goo-desktop-nav {
          display: flex;

          align-items: center;

          justify-content: center;

          gap: 3px;

          margin-left: auto;
          margin-right: auto;
        }

        .goo-nav-link {
          position: relative;

          display: flex;
          align-items: center;
          justify-content: center;

          padding:
            10px 13px;

          color: #45574d;

          text-decoration: none;

          font-size: 13px;

          font-weight: 650;

          white-space: nowrap;

          border-radius: 30px;

          transition:
            color 0.25s ease,
            background 0.25s ease,
            transform 0.25s ease;
        }

        .goo-nav-link:hover {
          color: #198754;

          background:
            rgba(25, 135, 84, 0.055);

          transform:
            translateY(-1px);
        }

        .goo-nav-link.active {
          color: #198754;
        }

        .goo-nav-link-dot {
          position: absolute;

          left: 50%;
          bottom: 2px;

          width: 0;
          height: 3px;

          border-radius: 10px;

          background:
            linear-gradient(
              90deg,
              #198754,
              #73c49a
            );

          transform:
            translateX(-50%);

          transition:
            width 0.3s
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            );
        }

        .goo-nav-link.active
        .goo-nav-link-dot {
          width: 22px;
        }

        /* ===============================================
           RIGHT ACTIONS
        =============================================== */

        .goo-actions {
          display: flex;

          align-items: center;

          gap: 7px;

          flex-shrink: 0;
        }

        .goo-circle-btn {
          position: relative;

          width: 40px;
          height: 40px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          border:
            1px solid
            rgba(25, 135, 84, 0.11);

          background:
            rgba(246, 250, 248, 0.9);

          color: #198754;

          transition:
            transform 0.3s
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            ),
            background 0.25s ease,
            box-shadow 0.3s ease;
        }

        .goo-circle-btn:hover {
          transform:
            translateY(-3px)
            scale(1.04);

          background:
            #ffffff;

          box-shadow:
            0 8px 20px
            rgba(25, 135, 84, 0.13);
        }

        .goo-cart-count {
          position: absolute;

          top: -4px;
          right: -3px;

          min-width: 18px;
          height: 18px;

          padding: 0 4px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 20px;

          background:
            linear-gradient(
              135deg,
              #198754,
              #31a96d
            );

          color: white;

          font-size: 9px;
          font-weight: 800;

          border: 2px solid white;

          box-shadow:
            0 3px 8px
            rgba(25, 135, 84, 0.2);

          animation:
            gooBadgePop 0.35s
            ease-out;
        }

        @keyframes gooBadgePop {
          0% {
            transform:
              scale(0.5);
            opacity: 0;
          }

          70% {
            transform:
              scale(1.15);
          }

          100% {
            transform:
              scale(1);
            opacity: 1;
          }
        }

        /* ===============================================
           ACCOUNT BUTTON
        =============================================== */

        .goo-account-btn {
          min-height: 40px;

          display: flex;
          align-items: center;

          gap: 7px;

          padding:
            6px 12px;

          border-radius: 30px;

          border:
            1px solid
            rgba(25, 135, 84, 0.18);

          background:
            rgba(255, 255, 255, 0.8);

          color: #198754;

          font-size: 12px;

          font-weight: 700;

          transition:
            all 0.3s
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            );
        }

        .goo-account-btn:hover {
          transform:
            translateY(-2px);

          border-color:
            rgba(25, 135, 84, 0.35);

          box-shadow:
            0 7px 20px
            rgba(25, 135, 84, 0.11);
        }

        .goo-account-btn.open {
          background:
            linear-gradient(
              135deg,
              #198754,
              #229b62
            );

          color: white;

          border-color:
            transparent;

          box-shadow:
            0 7px 20px
            rgba(25, 135, 84, 0.2);
        }

        .goo-chevron {
          transition:
            transform 0.3s ease;
        }

        .goo-chevron.rotate {
          transform:
            rotate(180deg);
        }

        /* ===============================================
           LOGIN BUTTON
        =============================================== */

        .goo-login-btn {
          position: relative;

          overflow: hidden;

          border: 0;

          min-height: 40px;

          padding:
            7px 18px;

          border-radius: 30px;

          background:
            linear-gradient(
              135deg,
              #198754,
              #249d64
            );

          color: white;

          font-size: 13px;

          font-weight: 700;

          text-decoration: none;

          box-shadow:
            0 7px 18px
            rgba(25, 135, 84, 0.18);

          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .goo-login-btn::before {
          content: "";

          position: absolute;

          top: 0;
          left: -100%;

          width: 70%;
          height: 100%;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,0.3),
              transparent
            );

          transform:
            skewX(-20deg);

          transition:
            left 0.6s ease;
        }

        .goo-login-btn:hover {
          transform:
            translateY(-3px);

          color: white;

          box-shadow:
            0 11px 25px
            rgba(25, 135, 84, 0.27);
        }

        .goo-login-btn:hover::before {
          left: 130%;
        }

        /* ===============================================
           PROFILE DROPDOWN
        =============================================== */

        .goo-profile-dropdown {
          position: absolute;

          right: 0;
          top: calc(100% + 10px);

          width: 225px;

          padding: 8px;

          border:
            1px solid
            rgba(25, 135, 84, 0.1);

          border-radius: 17px;

          background:
            rgba(255, 255, 255, 0.97);

          backdrop-filter:
            blur(18px);

          -webkit-backdrop-filter:
            blur(18px);

          box-shadow:
            0 20px 50px
            rgba(20, 60, 40, 0.15);

          animation:
            gooDropdown 0.25s
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            );

          transform-origin:
            top right;
        }

        @keyframes gooDropdown {
          from {
            opacity: 0;

            transform:
              translateY(-8px)
              scale(0.96);
          }

          to {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);
          }
        }

        .goo-profile-item {
          width: 100%;

          display: flex;
          align-items: center;

          gap: 10px;

          padding:
            10px 11px;

          border: 0;

          border-radius: 11px;

          background: transparent;

          color: #31443a;

          text-align: left;

          font-size: 13px;

          transition:
            background 0.2s ease,
            transform 0.2s ease,
            color 0.2s ease;
        }

        .goo-profile-item:hover {
          background:
            #f0f8f4;

          color: #198754;

          transform:
            translateX(3px);
        }

        .goo-profile-item.danger:hover {
          background:
            #fff1f1;

          color:
            #dc3545;
        }

        .goo-profile-icon {
          width: 29px;
          height: 29px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background:
            #eef8f2;

          color: #198754;
        }

        .goo-profile-item.danger
        .goo-profile-icon {
          background:
            #fff0f0;

          color:
            #dc3545;
        }

        .goo-profile-divider {
          margin:
            7px 3px;

          border-color:
            #edf1ee;

          opacity: 1;
        }

        /* ===============================================
           MOBILE MENU BUTTON
        =============================================== */

        .goo-mobile-toggle {
          width: 42px;
          height: 42px;

          display: none;

          align-items: center;
          justify-content: center;

          border: 0;

          border-radius: 13px;

          background:
            #f1f8f4;

          color: #198754;

          font-size: 18px;

          transition:
            transform 0.25s ease,
            background 0.25s ease;
        }

        .goo-mobile-toggle:active {
          transform:
            scale(0.92);
        }

        /* ===============================================
           MOBILE PANEL
        =============================================== */

        .goo-mobile-panel {
          display: none;

          overflow: hidden;

          border-top:
            1px solid
            rgba(25, 135, 84, 0.08);

          background:
            rgba(255, 255, 255, 0.97);

          backdrop-filter:
            blur(20px);

          -webkit-backdrop-filter:
            blur(20px);
        }

        .goo-mobile-panel-inner {
          padding:
            10px 0 18px;
        }

        .goo-mobile-nav-link {
          justify-content: flex-start;

          width: 100%;

          padding:
            13px 12px;

          margin:
            2px 0;

          font-size: 15px;

          border-radius: 12px;
        }

        .goo-mobile-nav-link.active {
          background:
            #eff8f3;
        }

        .goo-mobile-nav-link-dot {
          display: none;
        }

        .goo-mobile-actions {
          display: flex;

          gap: 8px;

          padding-top: 10px;

          margin-top: 8px;

          border-top:
            1px solid
            #edf1ee;
        }

        .goo-mobile-order {
          flex: 1;

          min-height: 44px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              #198754,
              #249d64
            );

          color: white;

          text-decoration: none;

          font-size: 13px;

          font-weight: 700;

          box-shadow:
            0 8px 20px
            rgba(25, 135, 84, 0.18);
        }

        /* ===============================================
           MOBILE
        =============================================== */

        @media (max-width: 1199px) {

          .goo-nav-link {
            padding:
              10px 8px;

            font-size: 12px;
          }

          .goo-desktop-nav {
            gap: 1px;
          }

          .goo-brand-tagline {
            display: none;
          }

        }

        @media (max-width: 991px) {

          .goo-navbar {
            position: sticky;
          }

          .goo-nav-container {
            min-height: 68px;
          }

          .goo-navbar.scrolled
          .goo-nav-container {
            min-height: 64px;
          }

          .goo-desktop-nav {
            display: none;
          }

          .goo-mobile-toggle {
            display: flex;
          }

          .goo-mobile-panel {
            display: block;
          }

          .goo-actions {
            margin-left: auto;
          }

          .goo-account-btn {
            display: none;
          }

        }

        @media (max-width: 576px) {

          .goo-nav-container {
            padding-left: 13px;
            padding-right: 13px;
          }

          .goo-logo-wrap {
            width: 44px;
            height: 44px;
          }

          .goo-brand-name {
            font-size: 15px;
          }

          .goo-brand-tagline {
            display: block;

            font-size: 7px;

            margin-top: 4px;

            letter-spacing: 0.45px;
          }

          .goo-circle-btn {
            width: 38px;
            height: 38px;

            font-size: 13px;
          }

          .goo-mobile-toggle {
            width: 38px;
            height: 38px;
          }

          .goo-actions {
            gap: 5px;
          }

          .goo-mobile-panel-inner {
            padding-left: 4px;
            padding-right: 4px;
          }

        }

        /* ===============================================
           VERY SMALL PHONES
        =============================================== */

        @media (max-width: 360px) {

          .goo-brand-name {
            font-size: 14px;
          }

          .goo-brand-tagline {
            display: none;
          }

          .goo-logo-wrap {
            width: 40px;
            height: 40px;
          }

          .goo-circle-btn {
            width: 36px;
            height: 36px;
          }

          .goo-mobile-toggle {
            width: 36px;
            height: 36px;
          }

        }

        /* ===============================================
           ACCESSIBILITY
        =============================================== */

        @media (prefers-reduced-motion: reduce) {

          .goo-navbar,
          .goo-brand,
          .goo-logo-wrap,
          .goo-nav-link,
          .goo-circle-btn,
          .goo-account-btn,
          .goo-login-btn,
          .goo-profile-item {
            transition: none !important;
          }

          .goo-cart-count,
          .goo-profile-dropdown {
            animation: none !important;
          }

        }

        /* ===============================================
           DARK MODE SUPPORT
        =============================================== */

        body.dark .goo-navbar,
        [data-theme="dark"] .goo-navbar {
          background:
            rgba(18, 28, 23, 0.9);

          border-bottom-color:
            rgba(255,255,255,0.08);
        }

        body.dark .goo-navbar.scrolled,
        [data-theme="dark"] .goo-navbar.scrolled {
          background:
            rgba(18, 28, 23, 0.97);
        }

        body.dark .goo-brand-name,
        [data-theme="dark"] .goo-brand-name {
          color: #68c995;
        }

        body.dark .goo-brand-tagline,
        [data-theme="dark"] .goo-brand-tagline {
          color: #9aa89f;
        }

        body.dark .goo-nav-link,
        [data-theme="dark"] .goo-nav-link {
          color: #d5dfd9;
        }

        body.dark .goo-nav-link:hover,
        body.dark .goo-nav-link.active,
        [data-theme="dark"] .goo-nav-link:hover,
        [data-theme="dark"] .goo-nav-link.active {
          color: #68c995;
        }

        body.dark .goo-circle-btn,
        [data-theme="dark"] .goo-circle-btn {
          background:
            rgba(255,255,255,0.06);

          color: #68c995;

          border-color:
            rgba(255,255,255,0.1);
        }

        body.dark .goo-profile-dropdown,
        [data-theme="dark"] .goo-profile-dropdown {
          background:
            rgba(28, 40, 33, 0.98);

          border-color:
            rgba(255,255,255,0.08);
        }

        body.dark .goo-profile-item,
        [data-theme="dark"] .goo-profile-item {
          color: #d5dfd9;
        }

        body.dark .goo-profile-item:hover,
        [data-theme="dark"] .goo-profile-item:hover {
          background:
            rgba(104, 201, 149, 0.08);

          color: #68c995;
        }

        body.dark .goo-mobile-panel,
        [data-theme="dark"] .goo-mobile-panel {
          background:
            rgba(18, 28, 23, 0.98);

          border-top-color:
            rgba(255,255,255,0.08);
        }

        body.dark .goo-mobile-nav-link,
        [data-theme="dark"] .goo-mobile-nav-link {
          color: #d5dfd9;
        }

        body.dark .goo-mobile-nav-link.active,
        [data-theme="dark"] .goo-mobile-nav-link.active {
          background:
            rgba(104, 201, 149, 0.08);

          color: #68c995;
        }

        body.dark .goo-mobile-actions,
        [data-theme="dark"] .goo-mobile-actions {
          border-top-color:
            rgba(255,255,255,0.08);
        }

      `}</style>

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav
        className={`goo-navbar ${
          scrolled ? "scrolled" : ""
        }`}
      >
        <div className="container goo-nav-container d-flex align-items-center">

          {/* =================================================
              BRAND
          ================================================= */}

          <Link
            to="/"
            className="goo-brand"
            onClick={closeMobileMenu}
          >
            <span className="goo-logo-wrap">
              <img
                src={logo}
                alt="Goo Amrutham Milk"
                className="goo-logo"
              />
            </span>

            <FaLeaf className="goo-brand-leaf" />

            <span className="goo-brand-text">
              <span className="goo-brand-name">
                Goo Amrutham
              </span>

              <span className="goo-brand-tagline">
                Natural Fresh Milk
              </span>
            </span>
          </Link>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <div className="goo-desktop-nav">

            {navLinks.map((link) =>
              renderNavLink(link)
            )}

            {currentUser && (
              renderNavLink({
                to: "/orders",
                label: "My Orders",
              })
            )}

            {currentUser?.role === "admin" && (
              renderNavLink({
                to: "/admin",
                label: "Admin",
              })
            )}

          </div>

          {/* =================================================
              RIGHT ACTIONS
          ================================================= */}

          <div className="goo-actions">

            {/* THEME */}

            <button
              type="button"
              className="goo-circle-btn"
              onClick={() =>
                setTheme(
                  theme === "light"
                    ? "dark"
                    : "light"
                )
              }
              title="Change theme"
              aria-label="Change theme"
            >
              {theme === "light" ? (
                <FaMoon />
              ) : (
                <FaSun />
              )}
            </button>

            {/* CART */}

            <Link
              to="/cart"
              className="goo-circle-btn"
              title="Shopping Cart"
              aria-label="Shopping Cart"
              onClick={closeMobileMenu}
            >
              <FaShoppingBag />

              {cartCount > 0 && (
                <span className="goo-cart-count">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* USER */}

            {currentUser ? (
              <div
                className="position-relative"
                ref={profileRef}
              >
                <button
                  type="button"
                  className={`goo-account-btn ${
                    profileOpen
                      ? "open"
                      : ""
                  }`}
                  onClick={() =>
                    setProfileOpen(
                      !profileOpen
                    )
                  }
                  aria-expanded={
                    profileOpen
                  }
                >
                  <FaUserCircle size={17} />

                  <span>
                    {currentUser.name
                      ?.split(" ")[0] ||
                      "Account"}
                  </span>

                  <FaChevronDown
                    size={9}
                    className={`goo-chevron ${
                      profileOpen
                        ? "rotate"
                        : ""
                    }`}
                  />
                </button>

                {profileOpen && (
                  <div className="goo-profile-dropdown">

                    <button
                      type="button"
                      className="goo-profile-item"
                      onClick={
                        handleProfile
                      }
                    >
                      <span className="goo-profile-icon">
                        <FaUser />
                      </span>

                      <span>
                        My Profile
                      </span>
                    </button>

                    <button
                      type="button"
                      className="goo-profile-item"
                      onClick={() => {
                        setProfileOpen(
                          false
                        );

                        navigate(
                          "/orders"
                        );
                      }}
                    >
                      <span className="goo-profile-icon">
                        <FaShoppingBag />
                      </span>

                      <span>
                        My Orders
                      </span>
                    </button>

                    {currentUser.role ===
                      "admin" && (
                      <button
                        type="button"
                        className="goo-profile-item"
                        onClick={() => {
                          setProfileOpen(
                            false
                          );

                          navigate(
                            "/admin"
                          );
                        }}
                      >
                        <span className="goo-profile-icon">
                          <FaUser />
                        </span>

                        <span>
                          Admin Dashboard
                        </span>
                      </button>
                    )}

                    <hr className="goo-profile-divider" />

                    <button
                      type="button"
                      className="goo-profile-item danger"
                      onClick={
                        handleLogout
                      }
                    >
                      <span className="goo-profile-icon">
                        <FaSignOutAlt />
                      </span>

                      <span>
                        Logout
                      </span>
                    </button>

                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="goo-login-btn"
                onClick={
                  closeMobileMenu
                }
              >
                Login
              </Link>
            )}

            {/* MOBILE MENU */}

            <button
              type="button"
              className="goo-mobile-toggle"
              onClick={() =>
                setMobileOpen(
                  !mobileOpen
                )
              }
              aria-label="Toggle navigation"
              aria-expanded={
                mobileOpen
              }
            >
              {mobileOpen ? (
                <span
                  style={{
                    fontSize: "24px",
                    lineHeight: 1,
                  }}
                >
                  ×
                </span>
              ) : (
                <FaBars />
              )}
            </button>

          </div>
        </div>

        {/* =================================================
            MOBILE NAVIGATION
        ================================================= */}

        {mobileOpen && (
          <div className="goo-mobile-panel">

            <div className="container goo-mobile-panel-inner">

              {navLinks.map((link) =>
                renderNavLink(
                  link,
                  true
                )
              )}

              {currentUser && (
                renderNavLink(
                  {
                    to: "/orders",
                    label: "My Orders",
                  },
                  true
                )
              )}

              {currentUser?.role ===
                "admin" && (
                renderNavLink(
                  {
                    to: "/admin",
                    label: "Admin Dashboard",
                  },
                  true
                )
              )}

              {/* MOBILE ACTIONS */}

              <div className="goo-mobile-actions">

                <Link
                  to="/products"
                  className="goo-mobile-order"
                  onClick={
                    closeMobileMenu
                  }
                >
                  <FaShoppingBag
                    className="me-2"
                  />
                  Order Fresh Milk
                </Link>

                {!currentUser && (
                  <Link
                    to="/login"
                    className="btn btn-outline-success rounded-3 d-flex align-items-center justify-content-center px-3"
                    onClick={
                      closeMobileMenu
                    }
                  >
                    Login
                  </Link>
                )}

              </div>

              {/* MOBILE LOGOUT */}

              {currentUser && (
                <button
                  type="button"
                  className="goo-profile-item danger mt-2"
                  onClick={
                    handleLogout
                  }
                >
                  <span className="goo-profile-icon">
                    <FaSignOutAlt />
                  </span>

                  <span>
                    Logout
                  </span>
                </button>
              )}

            </div>
          </div>
        )}
      </nav>
    </>
  );
}