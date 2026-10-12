/**
 * useAnimations - Custom hook for animation control and state
 * Provides utilities for managing animation triggers, visibility, and performance
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { prefersReducedMotion, getAccessibleMotionConfig } from "@/lib/animation-utils";

interface AnimationControlConfig {
  autoStart?: boolean;
  reduceMotion?: boolean;
  duration?: number;
}

export interface UseAnimationsReturn {
  isAnimating: boolean;
  isVisible: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  toggle: () => void;
  prefersReduced: boolean;
  motionConfig: { duration: number };
}

/**
 * Hook for controlling animation states and providing accessibility support
 */
export function useAnimations(config: AnimationControlConfig = {}): UseAnimationsReturn {
  const {
    autoStart = false,
    reduceMotion: forceReduceMotion = false,
    duration = 0.3,
  } = config;

  const [isAnimating, setIsAnimating] = useState(autoStart);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const prefersReduced = forceReduceMotion || prefersReducedMotion();

  useEffect(() => {
    if (autoStart) {
      setIsVisible(true);
    }
  }, [autoStart]);

  const start = useCallback(() => {
    setIsAnimating(true);
    if (!prefersReduced) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, 50);
    } else {
      setIsVisible(true);
    }
  }, [prefersReduced]);

  const stop = useCallback(() => {
    setIsAnimating(false);
    setIsVisible(false);
  }, []);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsAnimating(false);
    setIsVisible(false);
  }, []);

  const toggle = useCallback(() => {
    setIsAnimating((prev) => !prev);
    setIsVisible((prev) => !prev);
  }, []);

  const motionConfig = getAccessibleMotionConfig(duration);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isAnimating,
    isVisible,
    start,
    stop,
    reset,
    toggle,
    prefersReduced,
    motionConfig,
  };
}

/**
 * Hook for detecting if element is in viewport and triggering animations
 */
export function useInViewAnimation(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        if (ref.current && observer) {
          observer.unobserve(ref.current);
        }
      }
    }, { threshold: 0.1, ...options });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return { ref, isInView };
}
