export function setViewState(container, state) {
  if (!container) {
    return;
  }

  if (!state) {
    container.innerHTML = '';
    return;
  }

  const { type, title, message, actionHref, actionLabel } = state;
  const action = actionHref && actionLabel
    ? `<a class="student-btn student-btn-secondary" href="${actionHref}">${actionLabel}</a>`
    : '';

  container.innerHTML = `
    <section class="student-state student-state-${type}">
      <h3>${title || ''}</h3>
      <p>${message || ''}</p>
      ${action}
    </section>
  `;
}

export async function withSubmitLock(button, task) {
  if (!button || button.disabled) {
    return;
  }

  const originalText = button.textContent;
  button.disabled = true;
  button.classList.add('is-loading');

  try {
    await task();
  } finally {
    button.disabled = false;
    button.classList.remove('is-loading');
    button.textContent = originalText;
  }
}

export function setText(id, text) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = text;
  }
}
