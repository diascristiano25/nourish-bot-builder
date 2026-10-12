/**
 * Centralized animation configurations for Framer Motion
 * All variants use GPU-accelerated properties (transform, opacity) for 60fps performance
 */

import { Variants, TargetAndTransition } from "framer-motion";

// Fade animations
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export const fadeInScale: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// Slide animations
export const slideInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -40,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 40,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Stagger container for multiple children
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Individual stagger item (use inside staggerContainer)
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// Hover animations
export const liftHover: TargetAndTransition = {
  y: -4,
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  transition: { duration: 0.2, ease: "easeOut" },
};

export const glowHover: TargetAndTransition = {
  boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)",
  transition: { duration: 0.2 },
};

export const rotateHover: TargetAndTransition = {
  rotate: 2,
  transition: { duration: 0.2 },
};

// Pulse animation (infinite loop)
export const pulse: Variants = {
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Spring configurations
export const springBounce: TargetAndTransition = {
  transition: {
    type: "spring",
    stiffness: 400,
    damping: 10,
  },
};

export const springSmooth: TargetAndTransition = {
  transition: {
    type: "spring",
    stiffness: 100,
    damping: 20,
  },
};
