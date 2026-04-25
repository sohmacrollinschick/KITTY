const form = document.querySelector('#login-form');
const errorEl = document.querySelector('#login-error');

function togglePassword(buttonId, inputId) {
  document.querySelector(buttonId)?.addEventListener('click', () => {
    const input = document.querySelector(inputId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  });
}

togglePassword('#toggle-password', '#password');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';

  try {
    const payload = Object.fromEntries(new FormData(form).entries());

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.message || 'Login failed';
      return;
    }

    sessionStorage.setItem('otp_email', data.email || payload.email);
    sessionStorage.setItem('otp_flow', 'login');
    window.location.href = `/otp?email=${encodeURIComponent(data.email || payload.email)}&flow=login`;
  } catch (_error) {
    errorEl.textContent = 'Unable to reach server. Check internet/database and try again.';
  }
});
