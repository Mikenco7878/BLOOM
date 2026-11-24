import Link from 'next/link';
import styles from './Button.module.css';

export default function Button({ href, children, variant = 'primary', className = '', ...props }) {
  const classes = `${styles.button} ${styles[variant] || styles.primary} ${className}`;
  return href ? (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  ) : (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
