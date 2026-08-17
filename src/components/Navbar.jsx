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

  const profileRef = useRef(null);

  /* =========================================
     CLOSE PROFILE DROPDOWN WHEN CLICKING OUTSIDE
  ========================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* =========================================
     PROFILE
  ========================================= */

  const handleProfile = () => {
    setProfileOpen(false);
    navigate("/profile");
  };

  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = async () => {
    setProfileOpen(false);

    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  /* =========================================
     NAVBAR LINK STYLE
  ========================================= */

  const navLinkClass = ({ isActive }) =>
    `nav-link fw-semibold px-3 ${
      isActive ? "text-success" : "text-dark"
    }`;

  /* =========================================
     CLOSE MOBILE NAVBAR
  ========================================= */

  const closeMobileMenu = () => {
    const navbar = document.getElementById("gooAmruthamNavbar");

    if (navbar?.classList.contains("show")) {
      const button = document.querySelector(
        '[data-bs-target="#gooAmruthamNavbar"]'
      );

      if (button) {
        button.click();
      }
    }

    setProfileOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top border-bottom shadow-sm">
      <div className="container py-2">

        {/* =====================================
            BRAND
        ===================================== */}

        <Link
          to="/"
          className="navbar-brand d-flex align-items-center gap-2"
          onClick={closeMobileMenu}
        >
          <img
            src={logo}
            alt="Goo Amrutham Milk"
            width="48"
            height="48"
            className="rounded-circle object-fit-cover"
          />

          <div className="lh-sm">
            <div className="fw-bold text-success fs-5">
              Goo Amrutham
            </div>

            <small className="text-muted">
              Natural Fresh Milk
            </small>
          </div>
        </Link>

        {/* =====================================
            MOBILE MENU BUTTON
        ===================================== */}

        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#gooAmruthamNavbar"
          aria-controls="gooAmruthamNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <FaBars size={22} />
        </button>

        {/* =====================================
            NAVBAR CONTENT
        ===================================== */}

        <div
          className="collapse navbar-collapse"
          id="gooAmruthamNavbar"
        >

          {/* ===================================
              NAVIGATION LINKS
          =================================== */}

<ul className="navbar-nav mx-auto mb-2 mb-lg-0">

  <li className="nav-item">
    <NavLink
      to="/"
      className={navLinkClass}
      onClick={closeMobileMenu}
    >
      Home
    </NavLink>
  </li>

  <li className="nav-item">
    <NavLink
      to="/products"
      className={navLinkClass}
      onClick={closeMobileMenu}
    >
      Our Store
    </NavLink>
  </li>

  <li className="nav-item">
    <NavLink
      to="/subscriptions"
      className={navLinkClass}
      onClick={closeMobileMenu}
    >
      My Subscriptions
    </NavLink>
  </li>

  <li className="nav-item">
    <NavLink
      to="/about"
      className={navLinkClass}
      onClick={closeMobileMenu}
    >
      About
    </NavLink>
  </li>

  <li className="nav-item">
    <NavLink
      to="/contact"
      className={navLinkClass}
      onClick={closeMobileMenu}
    >
      Contact
    </NavLink>
  </li>

  {currentUser && (
    <li className="nav-item">
      <NavLink
        to="/orders"
        className={navLinkClass}
        onClick={closeMobileMenu}
      >
        My Orders
      </NavLink>
    </li>
  )}

  {currentUser?.role === "admin" && (
    <li className="nav-item">
      <NavLink
        to="/admin"
        className={navLinkClass}
        onClick={closeMobileMenu}
      >
        Admin
      </NavLink>
    </li>
  )}

</ul>

          {/* ===================================
              RIGHT SIDE
          =================================== */}

          <div className="d-flex align-items-center gap-2 navbar-actions flex-wrap">

            {/* DARK / LIGHT MODE */}

            <button
              type="button"
              className="btn btn-light border rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "42px",
                height: "42px",
                flexShrink: 0,
              }}
              onClick={() =>
                setTheme(
                  theme === "light" ? "dark" : "light"
                )
              }
              title="Change theme"
            >
              {theme === "light" ? <FaMoon /> : <FaSun />}
            </button>

            {/* CART */}

            <Link
              to="/cart"
              className="btn btn-light border rounded-circle position-relative d-flex align-items-center justify-content-center"
              style={{
                width: "42px",
                height: "42px",
                flexShrink: 0,
              }}
              title="Shopping Cart"
              onClick={closeMobileMenu}
            >
              <FaShoppingBag />

              {cartItems.length > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success"
                  style={{
                    fontSize: "10px",
                  }}
                >
                  {cartItems.reduce(
                    (total, item) => total + item.qty,
                    0
                  )}
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
                  className={`btn rounded-pill d-flex align-items-center gap-2 px-3 ${
                    profileOpen
                      ? "btn-success"
                      : "btn-outline-success"
                  }`}
                  onClick={() =>
                    setProfileOpen(!profileOpen)
                  }
                  aria-expanded={profileOpen}
                >
                  <FaUserCircle size={18} />

                  <span className="fw-semibold">
                    {currentUser.name
                      ?.split(" ")[0] || "Account"}
                  </span>

                  <FaChevronDown
                    size={10}
                    className={
                      profileOpen ? "rotate-180" : ""
                    }
                  />
                </button>

                {/* PROFILE DROPDOWN */}

                {profileOpen && (
                  <div
                    className="position-absolute end-0 mt-2 bg-white border rounded-3 shadow-lg p-2 profile-dropdown"
                    style={{
                      width: "210px",
                      zIndex: 1050,
                    }}
                  >

                    <button
                      type="button"
                      className="btn btn-light w-100 d-flex align-items-center gap-2 text-start mb-1"
                      onClick={handleProfile}
                    >
                      <FaUser className="text-success" />
                      <span>My Profile</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-light w-100 d-flex align-items-center gap-2 text-start mb-1"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/orders");
                      }}
                    >
                      <FaShoppingBag className="text-success" />
                      <span>My Orders</span>
                    </button>

                    {currentUser.role === "admin" && (
                      <button
                        type="button"
                        className="btn btn-light w-100 d-flex align-items-center gap-2 text-start mb-1"
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/admin");
                        }}
                      >
                        <FaUser className="text-success" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <hr className="my-2" />

                    <button
                      type="button"
                      className="btn btn-light w-100 d-flex align-items-center gap-2 text-start text-danger"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </button>

                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="btn btn-success rounded-pill px-4 fw-semibold"
                onClick={closeMobileMenu}
              >
                Login
              </Link>
            )}

          </div>

        </div>
      </div>
    </nav>
  );
}