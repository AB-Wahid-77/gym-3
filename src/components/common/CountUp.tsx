// ============================================================================
// IRONFORGE - CountUp Component
// Gently counts up numbers on initial load, respects prefers-reduced-motion.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface CountUpProps {
  end: number;
  duration?: number; // in milliseconds
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  end,
  duration = 800,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const { reduceMotion } = useTheme();
  const [count, setCount] = useState<number>(reduceMotion ? end : 0);

  useEffect(() => {
    if (reduceMotion) {
      setCount(end);
      return;
    }

    let start = 0;
    const startTime = performance.now();

    const updateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * easeOut);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(updateCount);
  }, [end, duration, reduceMotion]);

  return (
    <span className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};
