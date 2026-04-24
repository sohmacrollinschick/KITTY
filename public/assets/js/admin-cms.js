async function loadContent() {
  const res = await adminAuthFetch('/api/admin/content');
  if (!res) return;
  const pages = await res.json();
  if (!res.ok || !Array.isArray(pages)) return;

  const select = document.querySelector('#slug');
  select.innerHTML = pages.map((p) => `<option value="${p.slug}">${p.slug}</option>`).join('');
  window.cmsPages = pages;
  fillForm(select.value);

  select.addEventListener('change', () => fillForm(select.value));
}

function fillForm(slug) {
  const page = (window.cmsPages || []).find((p) => p.slug === slug);
  if (!page) return;

  document.querySelector('#title').value = page.title || '';
  document.querySelector('#body').value = page.body || '';
  document.querySelector('#blocks').value = JSON.stringify(page.blocks || {}, null, 2);
}

(async () => {
  await requireAdmin();
  document.querySelector('#logout-btn')?.addEventListener('click', logout);

  await loadContent();

  document.querySelector('#cms-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const slug = document.querySelector('#slug').value;

    let blocks = {};
    try {
      blocks = JSON.parse(document.querySelector('#blocks').value || '{}');
    } catch {
      alert('Blocks must be valid JSON');
      return;
    }

    const payload = {
      title: document.querySelector('#title').value,
      body: document.querySelector('#body').value,
      blocks
    };

    const res = await adminAuthFetch(`/api/admin/content/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res) return;
    if (!res.ok) {
      alert('Failed to update content');
      return;
    }

    alert('Content updated');
    loadContent();
  });
})();
