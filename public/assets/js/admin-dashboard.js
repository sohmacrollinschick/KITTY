(async () => {
  await requireAdmin();

  document.querySelector('#logout-btn')?.addEventListener('click', logout);

  const res = await adminAuthFetch('/api/admin/dashboard');
  if (!res) return;

  const data = await res.json();
  if (!res.ok) {
    alert(data.message || 'Failed to load dashboard');
    return;
  }

  document.querySelector('#stat-total').textContent = data.total;
  document.querySelector('#stat-available').textContent = data.available;
  document.querySelector('#stat-reserved').textContent = data.reserved;
  document.querySelector('#stat-sold').textContent = data.sold;

  const tbody = document.querySelector('#recent-inquiries');
  tbody.innerHTML = (data.recentInquiries || []).map((i) => `
    <tr>
      <td>${i.name}</td>
      <td>${i.email}</td>
      <td>${i.kittenInterestedIn || '-'}</td>
      <td>${i.status}</td>
      <td>${new Date(i.createdAt).toLocaleDateString()}</td>
    </tr>`).join('');
})();
