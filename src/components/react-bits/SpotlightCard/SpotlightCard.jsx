'use client';

// Adapted from React Bits SpotlightCard. Fixed CSS spotlight removes dynamic inline styles.
// https://reactbits.dev/components/spotlight-card — license in THIRD_PARTY_NOTICES.txt.
import styles from './SpotlightCard.module.css';

export default function SpotlightCard({ children, className = '' }) {
  return <div className={`${styles.card} ${className}`}>{children}</div>;
}
