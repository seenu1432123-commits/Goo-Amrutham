import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide Back button on Home page
  if (location.pathname === "/" || location.pathname === "/admin") {
    return null;
  }

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Go back"
      className="back-floating-button"
    >
      <FaArrowLeft size={20} />
      <span>Back</span>
    </button>
  );
}