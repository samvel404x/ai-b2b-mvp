"use client";

import { useEffect, useState } from "react";

export function AnimatedNumber({ value, duration = 800, delay = 0 }) {
  const [displayValue, setDisplayValue] = useState(0); // Start at 0
  const [hasStarted, setHasStarted] = useState(delay === 0);
  
  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setHasStarted(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;
    
    let startTimestamp = null;
    const strVal = String(value);
    const numMatch = strVal.replace(/,/g, '').match(/[\d.]+/);
    
    if (!numMatch) {
      const frame = window.requestAnimationFrame(() => setDisplayValue(value));
      return () => window.cancelAnimationFrame(frame);
    }
    
    const targetStr = numMatch[0];
    const isFloat = targetStr.includes('.');
    const target = parseFloat(targetStr);
    const hasComma = strVal.includes(',');
    const prefixMatch = strVal.match(/^[^\d]+/);
    const suffixMatch = strVal.match(/[^\d]+$/);
    const prefix = prefixMatch ? prefixMatch[0] : '';
    const suffix = suffixMatch ? suffixMatch[0] : '';

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function: easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const current = easeProgress * target;
      
      let formatted = isFloat ? current.toFixed(2) : Math.floor(current).toString();
      if (hasComma) {
        formatted = parseFloat(formatted).toLocaleString('en-US', {
          minimumFractionDigits: isFloat ? 2 : 0,
          maximumFractionDigits: isFloat ? 2 : 0,
        });
      }
      
      setDisplayValue(`${prefix}${formatted}${suffix}`);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration, hasStarted]);

  return <>{displayValue || 0}</>;
}
