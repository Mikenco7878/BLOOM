import SectionIntro from '@/components/ui/SectionIntro';
import styles from './BudgetTableSection.module.css';

export default function BudgetTableSection({ data }) {
  const format = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: data.currency || 'VND' }).format(
      amount,
    );
  const total = (data.items || []).reduce((sum, item) => sum + item.amount, 0);
  return (
    <section className={`section ${styles.section}`}>
      <div className={`container ${styles.layout}`}>
        <SectionIntro {...data} />
        <div className={styles.tableWrap}>
          <table>
            <caption>{data.explanation}</caption>
            <thead>
              <tr>
                <th scope="col">Hạng mục dự kiến</th>
                <th scope="col">Ngân sách dự kiến</th>
              </tr>
            </thead>
            <tbody>
              {(data.items || []).map((item, i) => (
                <tr key={i}>
                  <th scope="row">{item.label}</th>
                  <td>{format(item.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Tổng dự kiến</th>
                <td>{format(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
}
