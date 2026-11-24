'use client';

import { useState } from 'react';

export default function useContactForm() {
  const [state, setState] = useState({ pending: false, message: '', errors: {}, success: false });
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setState({ pending: true, message: '', errors: {}, success: false });
    try {
      const response = await fetch('/api/v1/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.get('name'),
          email: fields.get('email'),
          phone: fields.get('phone'),
          subject: fields.get('subject'),
          message: fields.get('message'),
          consent: fields.get('consent') === 'on',
          website: fields.get('website') || '',
          sourcePath: window.location.pathname,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setState({
          pending: false,
          message: result.error?.message || 'Chưa thể gửi liên hệ. Vui lòng thử lại.',
          errors: result.error?.fields || {},
          success: false,
        });
        return;
      }
      form.reset();
      setState({
        pending: false,
        message: 'BLOOM đã nhận được lời nhắn. Cảm ơn bạn đã kết nối với chúng tôi.',
        errors: {},
        success: true,
      });
    } catch {
      setState({
        pending: false,
        message: 'Không thể kết nối. Thông tin bạn nhập vẫn được giữ lại, vui lòng thử lại.',
        errors: {},
        success: false,
      });
    }
  }
  return { ...state, submit };
}
