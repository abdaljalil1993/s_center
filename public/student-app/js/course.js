import { ApiError, apiGet, apiPost } from './api.js';
import { requireAuth } from './auth.js';
import { formatMoney, markdownLite } from './format.js';
import { initNav } from './nav.js';
import { setViewState, withSubmitLock } from './ui.js';

function getCourseContext() {
  const params = new URLSearchParams(window.location.search);
  return {
    id: Number(params.get('id') || 0),
    name: params.get('name') || 'تفاصيل المادة',
    price: params.get('price') || null,
  };
}

function isDirectVideo(url) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function isYouTubeHost(hostname) {
  const host = hostname.toLowerCase();
  return host === 'youtu.be' || host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com');
}

function toEmbeddableVideoUrl(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host === 'youtu.be') {
      const id = parsed.pathname.replace(/^\//, '');
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }

    if (host.endsWith('youtube.com')) {
      if (parsed.pathname === '/watch') {
        const id = parsed.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}?rel=0` : url;
      }

      if (parsed.pathname.startsWith('/shorts/')) {
        const id = parsed.pathname.split('/').filter(Boolean)[1];
        return id ? `https://www.youtube.com/embed/${id}?rel=0` : url;
      }

      if (parsed.pathname.startsWith('/embed/')) {
        return url;
      }
    }
  } catch (_error) {
    return url;
  }

  return url;
}

function renderVideo(url) {
  if (isDirectVideo(url)) {
    return `<video controls preload="metadata" src="${url}" class="student-media"></video>`;
  }

  const embeddableUrl = toEmbeddableVideoUrl(url);
  let referrerPolicy = 'no-referrer';
  try {
    const parsed = new URL(embeddableUrl);
    if (isYouTubeHost(parsed.hostname)) {
      // YouTube embeds may fail with error 153 when no referrer is sent.
      referrerPolicy = 'strict-origin-when-cross-origin';
    }
  } catch (_error) {
    referrerPolicy = 'no-referrer';
  }

  return `<iframe src="${embeddableUrl}" class="student-media" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="${referrerPolicy}"></iframe>`;
}

function renderLectureBody(lecture) {
  if (lecture.type === 'VIDEO' && lecture.url) {
    return renderVideo(lecture.url);
  }

  if (lecture.type === 'PDF' && lecture.url) {
    return `
      <iframe src="${lecture.url}" class="student-media" loading="lazy" referrerpolicy="no-referrer"></iframe>
      <a class="student-link" href="${lecture.url}" target="_blank" rel="noopener noreferrer">فتح ملف PDF في تبويب جديد</a>
    `;
  }

  if (lecture.type === 'TEXT') {
    return `<div class="student-richtext">${markdownLite(lecture.content || '')}</div>`;
  }

  return '<p class="student-muted">لا يوجد محتوى متاح.</p>';
}

function renderLectures(lectures) {
  if (!lectures.length) {
    return `
      <section class="student-state student-state-empty">
        <h3>لا توجد دروس منشورة</h3>
        <p>سيتم عرض الدروس هنا عند توفرها.</p>
      </section>
    `;
  }

  return lectures
    .map((lecture, index) => {
      if (lecture.locked) {
        return `
          <article class="student-card student-lecture locked">
            <div class="student-card-row">
              <h3>${index + 1}. ${lecture.title}</h3>
              <span class="student-badge warning">مقفل</span>
            </div>
            <p class="student-muted">🔒 اشترِ المادة للوصول إلى هذا الدرس.</p>
          </article>
        `;
      }

      return `
        <article class="student-card student-lecture">
          <div class="student-card-row">
            <h3>${index + 1}. ${lecture.title}</h3>
            <span class="student-badge">${lecture.type}</span>
          </div>
          ${renderLectureBody(lecture)}
        </article>
      `;
    })
    .join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  initNav('courses');
  await requireAuth();

  const state = document.getElementById('courseState');
  const list = document.getElementById('lectureList');
  const title = document.getElementById('courseTitle');
  const buyPanel = document.getElementById('buyPanel');
  const buyMessage = document.getElementById('buyMessage');
  const buyButton = document.getElementById('buyButton');

  if (!state || !list || !title || !buyPanel || !buyMessage || !buyButton) {
    return;
  }

  const context = getCourseContext();

  if (!context.id) {
    setViewState(state, {
      type: 'error',
      title: 'رابط غير صالح',
      message: 'معرف المادة غير موجود.',
      actionHref: '/student/index.html',
      actionLabel: 'عودة للرئيسية',
    });
    return;
  }

  title.textContent = context.name;

  async function loadLectures() {
    setViewState(state, {
      type: 'loading',
      title: 'جار تحميل الدروس',
      message: 'انتظر قليلًا...',
    });

    const lectures = await apiGet(`/courses/${context.id}/lectures`);
    list.innerHTML = renderLectures(lectures);
    setViewState(state, null);

    const hasLocked = lectures.some((lecture) => lecture.locked);
    if (hasLocked) {
      buyPanel.hidden = false;
      buyButton.textContent = context.price
        ? `شراء المادة (${formatMoney(context.price)} ل.س)`
        : 'شراء المادة';
    } else {
      buyPanel.hidden = true;
    }
  }

  buyButton.addEventListener('click', () => {
    buyMessage.textContent = '';

    void withSubmitLock(buyButton, async () => {
      try {
        const wallet = await apiGet('/wallet');
        const balanceText = formatMoney(wallet.balance);
        const priceText = context.price ? formatMoney(context.price) : 'غير محدد';
        const confirmed = window.confirm(`سعر المادة: ${priceText} ل.س\nرصيدك الحالي: ${balanceText} ل.س\nهل تريد المتابعة؟`);

        if (!confirmed) {
          return;
        }

        await apiPost(`/courses/${context.id}/purchase`, {}, { idempotent: true });
        buyMessage.textContent = 'تم الشراء بنجاح، يتم الآن فتح الدروس.';
        buyMessage.className = 'student-inline-message success';
        await loadLectures();
      } catch (error) {
        if (error instanceof ApiError && error.status === 400 && String(error.message).includes('Insufficient balance')) {
          buyMessage.innerHTML = 'رصيدك غير كافٍ لإتمام الشراء. <a href="/student/wallet.html">انتقل إلى شحن المحفظة</a>.';
          buyMessage.className = 'student-inline-message error';
          return;
        }

        buyMessage.textContent = error?.message || 'تعذر إتمام الشراء.';
        buyMessage.className = 'student-inline-message error';
      }
    });
  });

  try {
    await loadLectures();
  } catch (error) {
    setViewState(state, {
      type: 'error',
      title: 'تعذر تحميل الدروس',
      message: error?.message || 'حاول مرة أخرى.',
      actionHref: window.location.href,
      actionLabel: 'إعادة المحاولة',
    });
  }
});
