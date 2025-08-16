// Windows Privacy – minimal JS for Dark Mode-only site
// - Smooth in-page navigation
// - Respect reduced motion
// - Small helpers (details/summary focus)

(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Toast host
  const toastHost = document.createElement('div');
  toastHost.className = 'toasts';
  toastHost.setAttribute('role', 'status');
  toastHost.setAttribute('aria-live', 'polite');
  document.body.appendChild(toastHost);

  function toast(message, opts = {}) {
    const t = document.createElement('div');
    t.className = 'toast' + (opts.error ? ' toast--error' : '');
    t.textContent = message;
    toastHost.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }

  async function copyText(text) {
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, text.length);
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    }
  }

  // Smooth scroll for same-page links
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    // Move focus for accessibility
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  });

  // Make <details> keyboard friendly on open/close
  document.querySelectorAll('details').forEach((d) => {
    d.addEventListener('toggle', () => {
      if (d.open) {
        const summary = d.querySelector('summary');
        summary && summary.setAttribute('aria-expanded', 'true');
      } else {
        const summary = d.querySelector('summary');
        summary && summary.setAttribute('aria-expanded', 'false');
      }
    });
  });
  
  // Copy-to-clipboard for buttons with [data-clipboard]
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-clipboard]');
    if (!btn) return;
    const text = btn.getAttribute('data-clipboard') || '';
    const ok = await copyText(text);
    const successLabel = btn.getAttribute('data-clipboard-label') || 'Befehl kopiert';
    const errorLabel = btn.getAttribute('data-clipboard-error') || 'Kopieren fehlgeschlagen';
    toast(ok ? successLabel : errorLabel, { error: !ok });
  });
})();

