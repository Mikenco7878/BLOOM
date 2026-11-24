import { Sprout } from 'lucide-react';
import SectionIntro from '@/components/ui/SectionIntro';
import MediaImage from '@/components/ui/MediaImage';
import styles from './TeamGridSection.module.css';

export default function TeamGridSection({ data, media = {} }) {
  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <SectionIntro {...data} />
        <div className={styles.grid}>
          {(data.members || []).map((member, i) => (
            <article className={styles.card} key={i}>
              {media[member.avatarId] ? (
                <MediaImage
                  asset={media[member.avatarId]}
                  className={styles.avatar}
                  sizes="200px"
                />
              ) : (
                <span className={styles.mark}>
                  <Sprout size={35} strokeWidth={1} aria-hidden="true" />
                </span>
              )}
              <div>
                <h3>{member.name}</h3>
                <span className={styles.role}>{member.role}</span>
                {member.description && <p>{member.description}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
