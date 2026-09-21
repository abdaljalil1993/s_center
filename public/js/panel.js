(() => {
  const csrfTokenInput = document.querySelector('input[name="csrf_token"]');
  const csrfToken = csrfTokenInput ? csrfTokenInput.value : '';

  document.querySelectorAll('[data-confirm]').forEach((element) => {
    element.addEventListener('click', (event) => {
      const message = element.getAttribute('data-confirm') || '';
      if (!window.confirm(message)) {
        event.preventDefault();
      }
    });
  });

  document.querySelectorAll('[data-modal-open]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const modalId = trigger.getAttribute('data-modal-open');
      if (!modalId) {
        return;
      }
      const modal = document.getElementById(modalId);
      if (!modal) {
        return;
      }

      const fillJson = trigger.getAttribute('data-modal-fill');
      if (fillJson) {
        try {
          const fillData = JSON.parse(fillJson);
          modal.querySelectorAll('[data-fill]').forEach((field) => {
            const key = field.getAttribute('data-fill');
            if (key && Object.prototype.hasOwnProperty.call(fillData, key)) {
              if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
                field.value = fillData[key] ?? '';
              }
            }
          });
        } catch (error) {
          console.error(error);
        }
      }

      const action = trigger.getAttribute('data-modal-action');
      if (action) {
        const form = modal.querySelector('form');
        if (form) {
          form.setAttribute('action', action);
        }
      }

      modal.classList.add('open');
    });
  });

  document.querySelectorAll('[data-modal-close]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const modal = trigger.closest('.panel-modal');
      if (modal) {
        modal.classList.remove('open');
      }
    });
  });

  document.querySelectorAll('.panel-modal').forEach((modal) => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.classList.remove('open');
      }
    });
  });

  document.querySelectorAll('[data-chart]').forEach((canvas) => {
    const chartType = canvas.getAttribute('data-chart');
    const chartData = canvas.getAttribute('data-chart-data');
    if (!chartType || !chartData || typeof Chart === 'undefined') {
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(chartData);
    } catch (error) {
      return;
    }

    new Chart(canvas, {
      type: chartType,
      data: parsed.data,
      options: {
        maintainAspectRatio: false,
        ...(parsed.options || {}),
      },
    });
  });
})();
