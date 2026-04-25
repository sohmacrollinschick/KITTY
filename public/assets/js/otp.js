const params = new URLSearchParams(window.location.search);
const form = document.querySelector('#otp-form');
const statusEl = document.querySelector('#otp-status');
const helperEl = document.querySelector('#otp-helper');
const emailInput = document.querySelector('#email');
const flowInput = document.querySelector('#flow');

const email = params.get('email') || sessionStorage.getItem('otp_email') || '';
const flow = params.get('flow') || sessionStorage.getItem('otp_flow') || 'login';

emailInput.value = email;
flowInput.value = flow;
helperEl.textContent = `We sent a 6-digit code to ${email || 'your email'} (${flow} verification).`;

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  return { res, data };
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = 'Verifying...';

  const otp = document.querySelector('#otp').value.trim();
  if (otp.length !== 6) {
    statusEl.textContent = 'OTP must be 6 digits.';
    return;
  }

  try {
    if (flow === 'register') {
      const { res, data } = await postJson('/api/auth/verify-otp', { email, otp });
      if (!res.ok) {
        statusEl.textContent = data.message || 'Invalid OTP';
        return;
      }

      statusEl.textContent = 'Registration verified. Redirecting to login...';
      sessionStorage.removeItem('otp_email');
      sessionStorage.removeItem('otp_flow');
      setTimeout(() => { window.location.href = '/login'; }, 800);
      return;
    }

    const { res, data } = await postJson('/api/auth/login-verify-otp', { email, otp });
    if (!res.ok) {
      statusEl.textContent = data.message || 'Invalid OTP';
      return;
    }

    localStorage.setItem('token', data.token || 'session-auth');
    sessionStorage.removeItem('otp_email');
    sessionStorage.removeItem('otp_flow');
    window.location.href = data.redirectTo || '/home';
  } catch {
    statusEl.textContent = 'Server error. Please try again.';
  }
});

document.querySelector('#resend-otp')?.addEventListener('click', async () => {
  statusEl.textContent = 'Sending new OTP...';
  try {
    const { res, data } = await postJson('/api/auth/resend-otp', { email, flow });
    if (!res.ok) {
      statusEl.textContent = data.message || 'Failed to resend OTP';
      return;
    }
    statusEl.textContent = 'OTP resent successfully.';
  } catch {
    statusEl.textContent = 'Server error. Please try again.';
  }
});
