const loginForm = document.querySelector('#admin-login-form');
const loginStatus = document.querySelector('#login-status');

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = Object.fromEntries(new FormData(loginForm).entries());

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    loginStatus.textContent = data.message || 'Login failed';
    return;
  }

  localStorage.setItem('token', data.token || 'session-auth');
  window.location.href = data.redirectTo || '/';
});
