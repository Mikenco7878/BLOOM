import Button from '@/components/ui/Button';
import { Sprout } from 'lucide-react';
import styles from './states.module.css';

export default function NotFound() {
  return (
    <div className={styles.state}>
      <Sprout size={50} strokeWidth={1} />
      <span className="eyebrow">BLOOM · 404</span>
      <h1>Trang này chưa nảy mầm.</h1>
      <p>Đường dẫn có thể đã thay đổi hoặc nội dung chưa được xuất bản.</p>
      <Button href="/">Về trang chủ</Button>
    </div>
  );
}
