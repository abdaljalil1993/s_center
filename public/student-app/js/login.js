import { ApiError, apiPost } from './api.js';
import { ensureDeviceId, redirectIfAuthenticated, setAccessToken } from './auth.js';
import { withSubmitLock } from './ui.js';

function setError(message) {
  const box = document.getElementById('authError');
  if (!box) {
    return;
  }
  box.textContent = message || '';
  box.hidden = !message;
}

function normalizeUsername(value) {
  return String(value || '').trim().toLowerCase();
}

document.addEventListener('DOMContentLoaded', async () => {
  await redirectIfAuthenticated();
  ensureDeviceId();

  const form = document.getElementById('loginForm');
  const submit = document.getElementById('loginSubmit');

  if (!form || !submit) {
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    setError('');

    void withSubmitLock(submit, async () => {
      const formData = new FormData(form);
      const username = normalizeUsername(formData.get('username'));
      const password = String(formData.get('password') || '');

      if (!username || !password) {
        setError('يرجى إدخال اسم المستخدم وكلمة المرور.');
        return;
      }

      try {
        const result = await apiPost('/auth/login', {
          username,
          password,
          device_id: ensureDeviceId(),
        }, {
          requiresAuth: false,
          skip401Redirect: true,
        });

        setAccessToken(result.token);
        window.location.href = '/student/index.html';
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status === 403 && String(error.message).includes('linked to another device')) {
            setError('هذا الحساب مرتبط بجهاز آخر. امسح بيانات المتصفح الحالي أو استخدم المتصفح المرتبط أصلًا.');
            return;
          }
          setError(error.message || 'تعذر تسجيل الدخول.');
          return;
        }

        setError('حدث خطأ غير متوقع. حاول لاحقًا.');
      }
    });
  });
});
