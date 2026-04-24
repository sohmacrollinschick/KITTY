async function getKittens() {
  const res = await adminAuthFetch('/api/admin/kittens');
  if (!res || !res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function loadReservations() {
  const res = await adminAuthFetch('/api/admin/reservations');
  if (!res) return;
  const data = await res.json();
  if (!res.ok || !Array.isArray(data)) return;

  document.querySelector('#reservations-table').innerHTML = data.map((r) => `
    <tr>
      <td>${r.customerName}</td>
      <td>${r.email}</td>
      <td>${r.phone || '-'}</td>
      <td>${r.kitten?.name || 'Unknown'}</td>
      <td>
        <select id="deposit-${r._id}">
          <option ${r.depositStatus === 'Paid' ? 'selected' : ''}>Paid</option>
          <option ${r.depositStatus === 'Pending' ? 'selected' : ''}>Pending</option>
          <option ${r.depositStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td>
        <select id="status-${r._id}">
          <option ${r.reservationStatus === 'Open' ? 'selected' : ''}>Open</option>
          <option ${r.reservationStatus === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
          <option ${r.reservationStatus === 'Completed' ? 'selected' : ''}>Completed</option>
          <option ${r.reservationStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td>${new Date(r.createdAt).toLocaleDateString()}</td>
      <td>
        <button class="ghost" onclick="updateReservation('${r._id}', '${r.kitten?._id || ''}', '${r.customerName.replace(/'/g, "\\'")}', '${r.email}', '${r.phone || ''}')">Update</button>
        <button class="ghost" onclick="deleteReservation('${r._id}')">Delete</button>
      </td>
    </tr>`).join('');
}

window.updateReservation = async (id, kittenId, customerName, email, phone) => {
  const depositStatus = document.querySelector(`#deposit-${id}`).value;
  const reservationStatus = document.querySelector(`#status-${id}`).value;

  const res = await adminAuthFetch(`/api/admin/reservations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName,
      email,
      phone,
      kitten: kittenId,
      depositStatus,
      reservationStatus
    })
  });

  if (!res) return;
  if (!res.ok) {
    const data = await res.json();
    alert(data.message || 'Failed to update reservation');
    return;
  }

  loadReservations();
};

window.deleteReservation = async (id) => {
  if (!confirm('Delete reservation?')) return;
  const res = await adminAuthFetch(`/api/admin/reservations/${id}`, { method: 'DELETE' });
  if (!res) return;
  loadReservations();
};

(async () => {
  await requireAdmin();
  document.querySelector('#logout-btn')?.addEventListener('click', logout);

  const kittens = await getKittens();
  const select = document.querySelector('#kitten');
  select.innerHTML = kittens.length
    ? kittens.map((k) => `<option value="${k._id}">${k.name} (${k.status})</option>`).join('')
    : '<option value="">No kittens available</option>';

  document.querySelector('#reservation-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.target).entries());

    const res = await adminAuthFetch('/api/admin/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res) return;
    if (!res.ok) {
      const data = await res.json();
      alert(data.message || 'Failed to create reservation');
      return;
    }

    e.target.reset();
    loadReservations();
  });

  loadReservations();
})();
