import SectionIntro from '@/components/ui/SectionIntro';
import styles from './TimelineSection.module.css';

const statuses = { PLANNED: 'Dự kiến', IN_PROGRESS: 'Đang thực hiện', COMPLETED: 'Hoàn thành' };
export default function TimelineSection({ data }) {
  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <SectionIntro {...data} />
        <ol className={styles.list}>
          {(data.milestones || []).map((item, i) => (
            <li key={i} className={styles[item.status] || ''}>
              <span className={styles.marker} aria-hidden="true" />
              <div>
                <span className={styles.status}>{statuses[item.status] || 'Dự kiến'}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
