import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
}) {
  const reduceMotion = useReducedMotion();

  const directions = {
    up: { y: 35 },
    down: { y: -35 },
    left: { x: -45 },
    right: { x: 45 },
  };

  const initial = reduceMotion
    ? { opacity: 0 }
    : {
        opacity: 0,
        ...directions[direction],
      };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: reduceMotion ? 0.3 : 0.75,
        delay: reduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}