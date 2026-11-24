'use client';

import { Leaf, Mail, Phone } from 'lucide-react';
import Button from '@/components/ui/Button';
import useContactForm from '@/hooks/useContactForm';
import styles from './ContactFormSection.module.css';

export default function ContactFormSection({ data, settings = {}, submissionSuccess = false }) {
  const { pending, message, errors, success, submit } = useContactForm();
  const displayMessage =
    message ||
    (!pending && submissionSuccess
      ? 'BLOOM đã nhận được lời nhắn. Cảm ơn bạn đã kết nối với chúng tôi.'
      : '');
  const displaySuccess = message ? success : submissionSuccess;
  const error = (name) =>
    errors[name] ? (
      <span className={styles.fieldError} id={`contact-${name}-error`}>
        {Array.isArray(errors[name]) ? errors[name].join('. ') : errors[name]}
      </span>
    ) : null;
  const attrs = (name) => ({
    id: `contact-${name}`,
    name,
    'aria-invalid': !!errors[name],
    'aria-describedby': errors[name] ? `contact-${name}-error` : undefined,
  });
  return (
    <section id="contact-form" className={`section ${styles.section}`}>
      <div className={`container ${styles.layout}`}>
        <div className={styles.intro}>
          <span className="eyebrow">CÙNG NHAU KẾT NỐI</span>
          <h2>{data.heading}</h2>
          <p>{data.intro}</p>
          {settings.email && (
            <a href={`mailto:${settings.email}`}>
              <Mail size={20} />
              {settings.email}
            </a>
          )}
          {settings.phone && (
            <a href={`tel:${settings.phone}`}>
              <Phone size={20} />
              {settings.phone}
            </a>
          )}
          <div className={styles.privacy}>
            <Leaf size={25} strokeWidth={1.2} />
            <p>Thông tin của bạn chỉ được dùng để tiếp nhận và phản hồi yêu cầu liên hệ.</p>
          </div>
        </div>
        <form className={styles.form} onSubmit={submit} action="/api/v1/contacts" method="post">
          <div className={styles.fields}>
            <div>
              <label htmlFor="contact-name">
                Họ và tên <span>*</span>
              </label>
              <input
                {...attrs('name')}
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                placeholder="Tên của bạn"
              />
              {error('name')}
            </div>
            <div>
              <label htmlFor="contact-email">
                Email <span>*</span>
              </label>
              <input
                {...attrs('email')}
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                placeholder="ban@example.com"
              />
              {error('email')}
            </div>
          </div>
          <div className={styles.fields}>
            <div>
              <label htmlFor="contact-phone">
                Số điện thoại <small>(không bắt buộc)</small>
              </label>
              <input
                {...attrs('phone')}
                type="tel"
                maxLength={20}
                autoComplete="tel"
                placeholder="Số điện thoại của bạn"
              />
              {error('phone')}
            </div>
            <div>
              <label htmlFor="contact-subject">
                Bạn muốn tìm hiểu <span>*</span>
              </label>
              <select {...attrs('subject')} required defaultValue="">
                <option value="" disabled>
                  Chọn chủ đề
                </option>
                <option value="PRODUCT">Thông tin sản phẩm</option>
                <option value="PARTNERSHIP">Hợp tác dự án</option>
                <option value="DISTRIBUTION">Hợp tác phân phối</option>
                <option value="OTHER">Nội dung khác</option>
              </select>
              {error('subject')}
            </div>
          </div>
          <div>
            <label htmlFor="contact-message">
              Lời nhắn của bạn <span>*</span>
            </label>
            <textarea
              {...attrs('message')}
              required
              minLength={10}
              maxLength={3000}
              rows={5}
              placeholder="Chia sẻ câu hỏi hoặc ý tưởng của bạn cùng BLOOM…"
            />
            {error('message')}
          </div>
          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor="contact-website">Website</label>
            <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <label className={styles.consent} htmlFor="contact-consent">
            <input {...attrs('consent')} type="checkbox" required />
            <span>
              Tôi đồng ý để BLOOM sử dụng thông tin đã cung cấp nhằm phản hồi yêu cầu liên hệ này.
            </span>
          </label>
          {error('consent')}
          <Button type="submit" disabled={pending}>
            {pending ? 'Đang gửi lời nhắn…' : 'Gửi liên hệ'}
          </Button>
          {displayMessage && (
            <p
              role={displaySuccess ? 'status' : 'alert'}
              className={displaySuccess ? styles.success : styles.error}
            >
              {displayMessage}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
