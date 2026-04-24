async function requireAdmin() {
  const res = await fetch('/api/auth/me', {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    }
  });

  if (!res.ok) {
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const data = await res.json();
  if (data.user?.role !== 'admin') {
    window.location.href = '/home';
    throw new Error('Access denied');
  }

  return data;
}

async function adminAuthFetch(url, options = {}) {
  const token = localStorage.getItem('token');

  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token || ''}`
    }
  });

  if (response.status === 401 || response.status === 403) {
    alert('Access denied. Please login with your admin account.');
    window.location.href = '/login';
    return null;
  }

  return response;
}

async function logout() {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    }
  });
  localStorage.removeItem('token');
  window.location.href = '/login';
}

window.requireAdmin = requireAdmin;
window.logout = logout;
window.adminAuthFetch = adminAuthFetch;
window.adminFetch = adminAuthFetch;
