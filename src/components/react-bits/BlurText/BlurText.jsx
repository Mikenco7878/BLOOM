'use client';

// Adapted from React Bits BlurText (David Haz). CSS implementation preserves SSR text.
// https://reactbits.dev/text-animations/blur-text — license in THIRD_PARTY_NOTICES.txt.
import styles from './BlurText.module.css';

export default function BlurText({ text, className = '' }) {
  return <span className={`${styles.text} ${className}`}>{text}</span>;
}
