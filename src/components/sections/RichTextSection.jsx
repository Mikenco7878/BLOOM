import MediaImage from '@/components/ui/MediaImage';
import { BrandReveal } from '@/components/ui/animations/BrandMotion';
import styles from './RichTextSection.module.css';

export default function RichTextSection({ data, media = {} }) {
  return (
    <section className={`section ${styles.section}`}>
      <BrandReveal className={`container ${styles.content}`}>
        {data.eyebrow && <span className="eyebrow">{data.eyebrow}</span>}
        <h2>{data.heading}</h2>
        {(data.paragraphs || []).map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
        {media[data.imageId] && <MediaImage asset={media[data.imageId]} className={styles.image} />}
      </BrandReveal>
    </section>
  );
}
