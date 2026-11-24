import { Leaf, Users, ShieldCheck } from 'lucide-react';
import SectionIntro from '@/components/ui/SectionIntro';
import { BrandCard } from '@/components/ui/animations/BrandMotion';
import styles from './EsgGridSection.module.css';

const icons = { leaf: Leaf, users: Users, shield: ShieldCheck };
const labels = ['ENVIRONMENTAL', 'SOCIAL', 'GOVERNANCE'];
export default function EsgGridSection({ data }) {
  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <SectionIntro {...data} />
        <div className={styles.grid}>
          {(data.items || []).map((item, i) => {
            const Icon = icons[item.iconKey] || Leaf;
            return (
              <BrandCard className={styles.card} key={i}>
                <Icon size={33} strokeWidth={1.15} aria-hidden="true" />
                <span className={styles.label}>{labels[i]}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </BrandCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
