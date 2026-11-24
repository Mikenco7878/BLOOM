import { Sprout } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './CtaBannerSection.module.css';

export default function CtaBannerSection({ data }) {
  return (
    <section
      className={`section ${styles.section} ${data.variant === 'cream' ? styles.cream : ''}`}
    >
      <div className={`container ${styles.layout}`}>
        <Sprout className={styles.plant} size={180} strokeWidth={0.45} aria-hidden="true" />
        <div>
          {data.eyebrow && <span className="eyebrow">{data.eyebrow}</span>}
          <h2>{data.heading}</h2>
          <p>{data.description}</p>
          {data.cta?.href && (
            <Button href={data.cta.href} variant={data.variant === 'cream' ? 'primary' : 'light'}>
              {data.cta.label}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
