async function loadInquiries() {
  const res = await adminAuthFetch('/api/admin/inquiries');
  if (!res) return;
  const data = await res.json();
  if (!res.ok || !Array.isArray(data)) return;

  document.querySelector('#inquiries-table').innerHTML = data.map((i) => `
    <tr>
      <td>${i.name}</td>
      <td>${i.email}</td>
      <td>${i.phone || '-'}</td>
      <td>${i.kittenInterestedIn || '-'}</td>
      <td>${i.status}</td>
      <td>
        <select onchange="updateInquiryStatus('${i._id}', this.value)">
          <option ${i.status === 'New' ? 'selected' : ''}>New</option>
          <option ${i.status === 'Replied' ? 'selected' : ''}>Replied</option>
          <option ${i.status === 'Closed' ? 'selected' : ''}>Closed</option>
        </select>
        <button class="ghost" onclick="deleteInquiry('${i._id}')">Delete</button>
      </td>
    </tr>`).join('');
}

window.updateInquiryStatus = async (id, status) => {
  const res = await adminAuthFetch(`/api/admin/inquiries/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res) return;
  loadInquiries();
};

window.deleteInquiry = async (id) => {
  if (!confirm('Delete this inquiry?')) return;
  const res = await adminAuthFetch(`/api/admin/inquiries/${id}`, { method: 'DELETE' });
  if (!res) return;
  loadInquiries();
};

(async () => {
  await requireAdmin();
  document.querySelector('#logout-btn')?.addEventListener('click', logout);
  loadInquiries();
})();
