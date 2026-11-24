import MediaImage from '@/components/ui/MediaImage';
import Button from '@/components/ui/Button';
import { BrandReveal } from '@/components/ui/animations/BrandMotion';
import styles from './ImageTextSection.module.css';

export default function ImageTextSection({ data, media = {} }) {
  const image = media[data.imageId];
  return (
    <section className={`section ${styles.section}`}>
      <BrandReveal
        className={`container ${styles.layout} ${data.imagePosition === 'right' ? styles.reversed : ''}`}
      >
        <figure className={styles.figure}>
          {image ? (
            <MediaImage asset={image} className={styles.image} />
          ) : (
            <div className={styles.empty}>Hình ảnh đang được cập nhật</div>
          )}
          {image?.caption && <figcaption>{image.caption}</figcaption>}
        </figure>
        <div className={styles.content}>
          {data.eyebrow && <span className="eyebrow">{data.eyebrow}</span>}
          <h2>{data.heading}</h2>
          {(data.paragraphs || []).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
          {data.cta?.href && (
            <Button variant="secondary" href={data.cta.href}>
              {data.cta.label}
            </Button>
          )}
        </div>
      </BrandReveal>
    </section>
  );
}
