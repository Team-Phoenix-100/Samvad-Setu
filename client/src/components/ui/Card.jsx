import React from 'react';
import { motion } from 'framer-motion';

export default function Card({ children, className = '', hoverEffect = true, delay = 0, variant = 'glass' }) {
  const baseStyles = "overflow-hidden";
  const variants = {
    glass: "card-premium backdrop-blur-md bg-opacity-80",
    solid: "card-premium",
    ghost: "bg-transparent border-transparent"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: delay }}
      whileHover={hoverEffect ? { y: -4, transition: { duration: 0.2 } } : {}}
      className={`${baseStyles} ${variants[variant]} ${hoverEffect ? 'elevate-md' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
