import SectionIntro from '@/components/ui/SectionIntro';
import { Plus } from 'lucide-react';
import styles from './FaqSection.module.css';

export default function FaqSection({ data }) {
  return (
    <section className={`section ${styles.section}`}>
      <div className={`container ${styles.layout}`}>
        <SectionIntro {...data} />
        <div className={styles.list}>
          {(data.items || []).map((item, i) => (
            <details key={i}>
              <summary>
                {item.question}
                <Plus size={20} strokeWidth={1.3} aria-hidden="true" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
