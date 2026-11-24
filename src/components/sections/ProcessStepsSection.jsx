import { Sprout, FlaskConical, Layers3, ClipboardCheck } from 'lucide-react';
import SectionIntro from '@/components/ui/SectionIntro';
import MediaImage from '@/components/ui/MediaImage';
import styles from './ProcessStepsSection.module.css';

const icons = [Sprout, FlaskConical, Layers3, ClipboardCheck];
export default function ProcessStepsSection({ data, media = {} }) {
  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <SectionIntro {...data} />
        <ol className={styles.steps}>
          {(data.steps || []).map((step, i) => {
            const Icon = icons[i % icons.length];
            return (
              <li key={i}>
                <span className={styles.icon}>
                  <Icon size={27} strokeWidth={1.2} />
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                {media[step.imageId] && (
                  <MediaImage asset={media[step.imageId]} className={styles.image} />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
