import { Leaf, Recycle, Package, ShieldCheck, Users, Sprout } from 'lucide-react';
import SectionIntro from '@/components/ui/SectionIntro';
import { BrandCard, BrandReveal } from '@/components/ui/animations/BrandMotion';
import styles from './FeatureGridSection.module.css';

const icons = {
  leaf: Leaf,
  recycle: Recycle,
  package: Package,
  shield: ShieldCheck,
  users: Users,
  sprout: Sprout,
};
export default function FeatureGridSection({ data }) {
  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <BrandReveal>
          <SectionIntro {...data} />
        </BrandReveal>
        <div className={styles.grid}>
          {(data.items || []).map((item, i) => {
            const Icon = icons[item.iconKey] || Leaf;
            return (
              <BrandCard key={i} className={styles.card}>
                <span className={styles.icon}>
                  <Icon size={28} strokeWidth={1.25} />
                </span>
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
