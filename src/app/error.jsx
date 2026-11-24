'use client';

import Button from '@/components/ui/Button';
import { Leaf } from 'lucide-react';
import styles from './states.module.css';

export default function ErrorPage({ reset }) {
  return (
    <div className={styles.state} role="alert">
      <Leaf size={45} strokeWidth={1} />
      <h1>Chưa thể tải nội dung.</h1>
      <p>Kết nối tạm thời gián đoạn. Bạn có thể thử lại sau giây lát.</p>
      <Button onClick={reset}>Thử lại</Button>
    </div>
  );
}
