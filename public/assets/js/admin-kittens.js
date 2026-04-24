let editId = null;

async function fetchKittens() {
  const res = await adminAuthFetch('/api/admin/kittens');
  if (!res) return [];
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function renderKittens() {
  const data = await fetchKittens();
  const body = document.querySelector('#kittens-table');

  body.innerHTML = data.map((k) => `
    <tr>
      <td>${k.name}</td>
      <td>${k.gender}</td>
      <td>${k.age}</td>
      <td>$${Number(k.price).toLocaleString()}</td>
      <td>${k.status}</td>
      <td>
        <button class="ghost" onclick="startEdit('${k._id}')">Edit</button>
        <button class="ghost" onclick="deleteKitten('${k._id}')">Delete</button>
      </td>
    </tr>`).join('');

  window.kittensCache = data;
}

window.startEdit = (id) => {
  const kitten = (window.kittensCache || []).find((k) => k._id === id);
  if (!kitten) return;

  editId = id;
  const form = document.querySelector('#kitten-form');
  Object.entries({
    name: kitten.name,
    dob: kitten.dob ? kitten.dob.slice(0, 10) : '',
    age: kitten.age,
    breed: kitten.breed,
    gender: kitten.gender,
    price: kitten.price,
    status: kitten.status,
    temperament: kitten.temperament || '',
    description: kitten.description || '',
    videoUrl: kitten.videoUrl || ''
  }).forEach(([key, val]) => {
    if (form[key]) form[key].value = val;
  });

  form.visible.checked = !!kitten.visible;
  form.featured.checked = !!kitten.featured;
  document.querySelector('#form-title').textContent = 'Edit Kitten';
};

window.deleteKitten = async (id) => {
  if (!confirm('Delete this kitten?')) return;
  const res = await adminAuthFetch(`/api/admin/kittens/${id}`, { method: 'DELETE' });
  if (!res) return;
  if (!res.ok) {
    const data = await res.json();
    alert(data.message || 'Delete failed');
    return;
  }
  renderKittens();
};

(async () => {
  try {
    await requireAdmin();
  } catch {
    return;
  }
  document.querySelector('#logout-btn')?.addEventListener('click', logout);

  const form = document.querySelector('#kitten-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    fd.set('visible', form.visible.checked);
    fd.set('featured', form.featured.checked);

    const url = editId ? `/api/admin/kittens/${editId}` : '/api/admin/kittens';
    const method = editId ? 'PUT' : 'POST';

    const res = await adminAuthFetch(url, { method, body: fd });
    if (!res) return;
    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Save failed');
      return;
    }

    editId = null;
    form.reset();
    document.querySelector('#form-title').textContent = 'Add New Kitten';
    renderKittens();
  });

  renderKittens();
})();
