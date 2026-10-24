const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuToggle?.addEventListener('click', () => {
  const open = !nav.classList.contains('open');
  nav.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  const menuLabel = menuToggle.querySelector('.sr-only');
  if (menuLabel) menuLabel.textContent = open ? 'Chiudi menu' : 'Apri menu';
});

nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  document.body.classList.remove('menu-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  const menuLabel = menuToggle?.querySelector('.sr-only');
  if (menuLabel) menuLabel.textContent = 'Apri menu';
}));

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav?.classList.contains('open')) {
    nav.classList.remove('open');
    document.body.classList.remove('menu-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    const menuLabel = menuToggle?.querySelector('.sr-only');
    if (menuLabel) menuLabel.textContent = 'Apri menu';
    menuToggle?.focus();
  }
});

const currentPage = location.pathname.split('/').pop() || 'index.html';
nav?.querySelectorAll('a').forEach(link => {
  if (link.getAttribute('href') === currentPage) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  }
});

document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    observer.observe(item);
  });
} else {
  revealItems.forEach(item => item.classList.add('visible'));
}

document.querySelector('[data-contact-form]')?.addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = form.querySelector('[type="submit"]');
  const status = form.querySelector('[data-form-status]');
  const emailFallback = form.querySelector('[data-form-email-fallback]');
  const formData = new FormData(form);
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15000);

  const prepareEmailFallback = () => {
    if (!emailFallback) return;
    const lines = [
      `Nome e cognome: ${formData.get('name') || ''}`,
      `Email: ${formData.get('email') || ''}`,
      formData.get('phone') ? `Telefono: ${formData.get('phone')}` : null,
      formData.get('company') ? `Azienda: ${formData.get('company')}` : null,
      `Ambito: ${formData.get('service') || ''}`,
      '',
      'Progetto:',
      String(formData.get('message') || '')
    ].filter(line => line !== null);
    const subject = 'Richiesta di consulenza dal sito KemOps';
    emailFallback.href = `mailto:kemops.consulting@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    emailFallback.hidden = false;
  };

  if (submitButton) submitButton.disabled = true;
  if (emailFallback) emailFallback.hidden = true;
  form.setAttribute('aria-busy', 'true');
  if (status) status.textContent = 'Invio della richiesta in corso...';

  try {
    const response = await fetch('https://formsubmit.co/ajax/kemops.consulting@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
      signal: controller.signal
    });
    const result = await response.json();
    if (!response.ok || String(result.success).toLowerCase() !== 'true') {
      throw new Error('FormSubmit did not confirm the request');
    }
    form.reset();
    if (emailFallback) emailFallback.hidden = true;
    if (status) status.textContent = 'Richiesta inviata. Ti ricontatteremo per organizzare un primo confronto.';
  } catch (error) {
    prepareEmailFallback();
    if (error.name === 'AbortError') {
      if (status) status.textContent = 'Il servizio non ha confermato l’invio entro 15 secondi. La richiesta potrebbe comunque essere arrivata: controlla la casella prima di reinviarla. Se non la trovi, puoi preparare un’email con gli stessi dati qui sotto.';
    } else if (status) {
      status.textContent = 'Non ho ricevuto conferma dell’invio automatico. Controlla la casella; se la richiesta non è arrivata, puoi preparare un’email con gli stessi dati qui sotto.';
    }
  } finally {
    window.clearTimeout(timeoutId);
    form.removeAttribute('aria-busy');
    if (submitButton) submitButton.disabled = false;
  }
});
