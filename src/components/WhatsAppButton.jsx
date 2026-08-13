import React from "react";
import { FaWhatsapp } from "react-icons/fa";

const NUMBER = "918919597205";

export default function WhatsAppButton({ message = "Hello Goo Amrutham Milk, I want to order fresh milk." }) {
  const href = `https://wa.me/${NUMBER}?text=${encodeURIComponent(message)}`;
  return <a className="whatsapp-float" href={href} target="_blank" rel="noreferrer" aria-label="Order on WhatsApp"><FaWhatsapp/></a>;
}