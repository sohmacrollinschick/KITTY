let testimonialEdit = null;

async function renderTestimonials() {
  const response = await adminAuthFetch('/api/admin/testimonials');
  if (!response) return;

  const data = await response.json();

  if (!response.ok) {
    console.error('Failed to load testimonials:', data);
    alert(data.message || 'Access denied. Please login as admin.');
    window.location.href = '/login';
    return;
  }

  if (!Array.isArray(data)) {
    console.error('Expected array but received:', data);
    return;
  }

  window.testimonialCache = data;

  document.querySelector('#testimonials-admin-table').innerHTML = data.map((t) => `
    <tr>
      <td>${t.customerName}</td>
      <td>${'?'.repeat(t.rating || 5)}</td>
      <td>${t.approved ? 'Approved' : 'Pending'}</td>
      <td>
        <button class="ghost" onclick="editTestimonial('${t._id}')">Edit</button>
        <button class="ghost" onclick="deleteTestimonial('${t._id}')">Delete</button>
      </td>
    </tr>`).join('');
}

window.editTestimonial = (id) => {
  const t = (window.testimonialCache || []).find((x) => x._id === id);
  if (!t) return;
  testimonialEdit = id;
  const form = document.querySelector('#testimonial-form');
  form.customerName.value = t.customerName;
  form.message.value = t.message;
  form.rating.value = t.rating || 5;
  form.approved.checked = !!t.approved;
};

window.deleteTestimonial = async (id) => {
  if (!confirm('Delete testimonial?')) return;
  const res = await adminAuthFetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
  if (!res) return;
  renderTestimonials();
};

(async () => {
  await requireAdmin();
  document.querySelector('#logout-btn')?.addEventListener('click', logout);

  const form = document.querySelector('#testimonial-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    fd.set('approved', form.approved.checked);

    const url = testimonialEdit ? `/api/admin/testimonials/${testimonialEdit}` : '/api/admin/testimonials';
    const method = testimonialEdit ? 'PUT' : 'POST';

    const res = await adminAuthFetch(url, { method, body: fd });
    if (!res) return;

    if (!res.ok) {
      const data = await res.json();
      alert(data.message || 'Failed');
      return;
    }

    testimonialEdit = null;
    form.reset();
    renderTestimonials();
  });

  renderTestimonials();
})();
