"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValue, useSpring, useInView } from "framer-motion";
import { formatCurrency } from "@/lib/genius-data";

export function AnimatedMetric({
  value,
  format = "number",
  unit = "",
  className,
  duration = 800,
  delay = 0,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [displayValue, setDisplayValue] = useState(() => 
    format === "currency" ? formatCurrency(0) : `0${unit}`
  );
  
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
    mass: 1,
    duration: duration,
  });

  useEffect(() => {
    // Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isReduced = mediaQuery.matches;

    if (isReduced) {
      const timer = window.setTimeout(() => {
        setDisplayValue(format === "currency" ? formatCurrency(value) : `${value}${unit}`);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    if (isInView) {
      const timer = setTimeout(() => {
        motionValue.set(value);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [value, isInView, motionValue, delay, format, unit]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (isReduced) return;

      const rounded = Math.round(latest);
      if (format === "currency") {
        setDisplayValue(formatCurrency(rounded));
      } else {
        setDisplayValue(`${rounded}${unit}`);
      }
    });
  }, [springValue, format, unit]);

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
}
