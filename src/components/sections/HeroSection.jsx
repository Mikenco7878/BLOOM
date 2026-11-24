import { Leaf } from 'lucide-react';
import Button from '@/components/ui/Button';
import MediaImage from '@/components/ui/MediaImage';
import { BrandHeadline } from '@/components/ui/animations/BrandMotion';
import styles from './HeroSection.module.css';

export default function HeroSection({ data, media = {}, isPrimaryHero = true }) {
  const image = media[data.imageId];
  const Heading = isPrimaryHero ? 'h1' : 'h2';
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.layout}`}>
        <div className={styles.content}>
          <span className="eyebrow">
            <span className={styles.line} />
            {data.eyebrow}
          </span>
          <Heading className={styles.heading}>
            <BrandHeadline text={data.heading} />
          </Heading>
          <p className={styles.description}>{data.description}</p>
          <div className={styles.buttons}>
            {data.primaryCta?.href && (
              <Button href={data.primaryCta.href}>{data.primaryCta.label}</Button>
            )}
            {data.secondaryCta?.href && (
              <Button variant="secondary" href={data.secondaryCta.href}>
                {data.secondaryCta.label}
              </Button>
            )}
          </div>
          <div className={styles.note}>
            <Leaf size={20} strokeWidth={1.4} />
            <span>Hướng đến nông nghiệp tuần hoàn</span>
          </div>
        </div>
        <figure className={styles.visual}>
          <div className={styles.imageFrame}>
            {image ? (
              <MediaImage asset={image} priority className={styles.image} />
            ) : (
              <div className={styles.placeholder}>
                <Leaf size={90} strokeWidth={0.65} />
                <span>Hình ảnh đang được cập nhật</span>
              </div>
            )}
            <div className={styles.visualLabel}>
              <span className={styles.leafMark}>
                <Leaf size={21} strokeWidth={1.3} />
              </span>
              <div>
                <strong>Bắt đầu từ thiên nhiên</strong>
                <span>Tiếp nối giá trị xơ dừa</span>
              </div>
            </div>
          </div>
          {image?.caption && <figcaption>{image.caption}</figcaption>}
        </figure>
      </div>
      <div className={styles.bottom}>
        <div className={`container ${styles.bottomInner}`}>
          <span>NGUYÊN LIỆU QUEN THUỘC</span>
          <span className={styles.dot} />
          <span>TƯ DUY TUẦN HOÀN</span>
          <span className={styles.dot} />
          <span>KHỞI ĐẦU CÓ TRÁCH NHIỆM</span>
        </div>
      </div>
    </section>
  );
}
