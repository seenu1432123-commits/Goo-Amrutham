import React from "react";
import { FaCheckCircle } from "react-icons/fa";

const steps = ["Order Placed", "Confirmed", "Preparing", "Out for Delivery", "Delivered"];

export default function StatusTimeline({ order }) {
  const index = steps.indexOf(order.status);
  return (
    <div className="timeline">
      {steps.map((step, i) => {
        const done = i <= index;
        const found = order.timeline?.find(t => t.status === step);
        return <div className={`timeline-item ${done ? "done" : ""}`} key={step}>
          <div className="timeline-dot">{done && <FaCheckCircle/>}</div>
          <div><strong>{step}</strong>{found && <small>{new Date(found.time).toLocaleString()}</small>}</div>
        </div>
      })}
    </div>
  );
}