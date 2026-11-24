import { Be_Vietnam_Pro, Lora } from 'next/font/google';
import '@/styles/tokens.css';
import '@/styles/reset.css';
import '@/styles/globals.css';
import '@/styles/utilities.css';

const bodyFont = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-bloom-body',
  display: 'swap',
});
const headingFont = Lora({
  weight: ['400', '500'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-bloom-heading',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  title: { default: 'BLOOM — Từ xơ dừa, nảy mầm giá trị mới', template: '%s' },
  description: 'BLOOM phát triển viên nén từ xơ dừa. Dự án EXE101 Group 1 — FPT University.',
  icons: { icon: '/brand/logo-placeholder.svg' },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={`${bodyFont.variable} ${headingFont.variable}`}
    >
      <body>
        <a href="#main-content" className="skip-link">
          Đến nội dung chính
        </a>
        {children}
      </body>
    </html>
  );
}
