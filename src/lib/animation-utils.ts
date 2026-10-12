/**
 * Animation helper functions for timing and orchestration
 */

/**
 * Calculate staggered delay for animated items
 * @param index - Index of the item in the list
 * @param baseDelay - Base delay in milliseconds (default: 100ms)
 * @returns Delay in seconds for Framer Motion
 */
export function getStaggerDelay(index: number, baseDelay: number = 100): number {
  return (index * baseDelay) / 1000;
}

/**
 * Calculate animation duration based on content complexity
 * @param contentLength - Length of content (e.g., string length, number of items)
 * @param minDuration - Minimum duration in ms (default: 300)
 * @param maxDuration - Maximum duration in ms (default: 800)
 * @returns Duration in seconds
 */
export function adaptiveDuration(
  contentLength: number,
  minDuration: number = 300,
  maxDuration: number = 800
): number {
  const normalized = Math.min(contentLength / 100, 1);
  const duration = minDuration + normalized * (maxDuration - minDuration);
  return duration / 1000;
}

/**
 * Generate easing function name based on animation type
 * @param type - Animation type: 'entrance', 'exit', 'subtle'
 * @returns Framer Motion easing string
 */
export function getEasing(type: "entrance" | "exit" | "subtle" = "entrance"): string {
  const easings = {
    entrance: "easeOut",
    exit: "easeIn",
    subtle: "easeInOut",
  };
  return easings[type];
}

/**
 * Create a spring transition config
 * @param responsive - Whether to adjust for device capabilities (default: true)
 * @returns Spring transition object
 */
export function springTransition(responsive: boolean = true) {
  // On mobile or low-end devices, reduce spring stiffness
  const stiffness = responsive && window.innerWidth < 768 ? 100 : 200;
  const damping = responsive && window.innerWidth < 768 ? 20 : 15;

  return {
    type: "spring" as const,
    stiffness,
    damping,
  };
}

/**
 * Debounce animation trigger to prevent excessive re-renders
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounceAnimation<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 150
): T {
  let timeoutId: NodeJS.Timeout;

  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  }) as T;
}

/**
 * Throttle animation callback to maintain 60fps
 * @param callback - Function to throttle
 * @param limit - Throttle interval in milliseconds
 * @returns Throttled function
 */
export function throttleAnimation<T extends (...args: any[]) => void>(
  callback: T,
  limit: number = 16 // ~60fps
): T {
  let inThrottle: boolean;

  return ((...args: any[]) => {
    if (!inThrottle) {
      callback(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  }) as T;
}

/**
 * Check if user prefers reduced motion
 * @returns Boolean indicating if prefers-reduced-motion is set
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Get motion config with accessibility in mind
 * Reduces animations if user prefers reduced motion
 * @param normalDuration - Normal animation duration in seconds
 * @returns Motion config object
 */
export function getAccessibleMotionConfig(normalDuration: number = 0.3) {
  const reduced = prefersReducedMotion();
  return {
    duration: reduced ? 0 : normalDuration,
    transition: {
      duration: reduced ? 0 : normalDuration,
    },
  };
}
