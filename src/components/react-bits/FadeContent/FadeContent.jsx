'use client';

// Adapted from React Bits FadeContent. Class-based animation; content stays visible without JS.
// https://reactbits.dev/animations/fade-content — license in THIRD_PARTY_NOTICES.txt.
import { useEffect, useRef } from 'react';
import styles from './FadeContent.module.css';

export default function FadeContent({ children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !window.IntersectionObserver
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          ref.current?.classList.add(styles.reveal);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
