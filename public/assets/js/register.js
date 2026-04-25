const form = document.querySelector('#register-form');
const errorEl = document.querySelector('#register-error');
const successEl = document.querySelector('#register-success');

function togglePassword(buttonId, inputId) {
  document.querySelector(buttonId)?.addEventListener('click', () => {
    const input = document.querySelector(inputId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  });
}

togglePassword('#toggle-password', '#password');
togglePassword('#toggle-confirm-password', '#confirmPassword');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';
  successEl.textContent = '';

  try {
    const payload = Object.fromEntries(new FormData(form).entries());

    if (payload.password !== payload.confirmPassword) {
      errorEl.textContent = 'Confirm password does not match.';
      return;
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      const firstValidationError = data?.errors?.[0]?.msg;
      errorEl.textContent = firstValidationError || data.message || 'Registration failed';
      return;
    }

    successEl.textContent = 'OTP sent to your email. Redirecting...';
    sessionStorage.setItem('otp_email', data.email || payload.email);
    sessionStorage.setItem('otp_flow', 'register');
    setTimeout(() => {
      window.location.href = `/otp?email=${encodeURIComponent(data.email || payload.email)}&flow=register`;
    }, 700);
  } catch (_error) {
    errorEl.textContent = 'Unable to reach server. Check internet/database and try again.';
  }
});
