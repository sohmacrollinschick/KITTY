const API = '/api';

async function getSessionUser() {
  const res = await fetch('/api/auth/me', {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    }
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user || null;
}

async function getSettings() {
  const res = await fetch(`${API}/settings`);
  if (!res.ok) return null;
  return res.json();
}

function renderUserNavbar() {
  const nav = document.querySelector('.nav-links');
  if (!nav) return;

  nav.innerHTML = `
    <a href="/home">Home</a>
    <a href="/kittens">Available Kittens</a>
    <a href="/contact">Contact</a>
    <a href="#" data-logout>Logout</a>
  `;

  nav.querySelector('[data-logout]')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
      }
    });
    localStorage.removeItem('token');
    window.location.href = '/login';
  });
}

async function bindGlobalSettings() {
  const settings = await getSettings();
  if (!settings) return;

  document.querySelectorAll('[data-business-name]').forEach((el) => {
    el.textContent = settings.businessName || 'Velvet Paws Cattery';
  });

  document.querySelectorAll('[data-contact-email]').forEach((el) => {
    el.textContent = settings.contactEmail || 'hello@example.com';
  });

  document.querySelectorAll('[data-phone]').forEach((el) => {
    el.textContent = settings.phone || 'Not provided';
  });

  const logo = document.querySelector('[data-logo]');
  if (logo && settings.logo) logo.src = settings.logo;

  if (settings.brandColors) {
    const root = document.documentElement;
    if (settings.brandColors.primary) root.style.setProperty('--gold', settings.brandColors.primary);
    if (settings.brandColors.accent) root.style.setProperty('--rose', settings.brandColors.accent);
    if (settings.brandColors.background) root.style.setProperty('--bg', settings.brandColors.background);
  }
}

function markActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach((a) => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}

function setupMobileNav() {
  const navWrap = document.querySelector('.nav-wrap');
  const nav = document.querySelector('.nav-links');
  if (!navWrap || !nav) return;

  let toggle = document.querySelector('.nav-toggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Toggle navigation menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Menu';
    navWrap.insertBefore(toggle, nav);
  }

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

(async () => {
  const user = await getSessionUser();
  if (!user) {
    window.location.href = '/login';
    return;
  }

  if (user.role === 'admin') {
    window.location.href = '/admin/dashboard';
    return;
  }

  renderUserNavbar();
  await bindGlobalSettings();
  markActiveNav();
  setupMobileNav();
})();
