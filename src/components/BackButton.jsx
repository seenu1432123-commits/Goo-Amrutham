import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on Home page
  if (location.pathname === "/") {
    return null;
  }

  const handleBack = () => {
    // Go to previous page
    navigate(-1);
  };

  return (
    <div className="container pt-3">
      <button
        type="button"
        onClick={handleBack}
        className="btn btn-light border rounded-pill px-3 py-2 fw-semibold shadow-sm"
        style={{
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.classList.add("shadow");
        }}
        onMouseLeave={(e) => {
          e.currentTarget.classList.remove("shadow");
        }}
      >
        <FaArrowLeft className="me-2 text-success" />
        Back
      </button>
    </div>
  );
}