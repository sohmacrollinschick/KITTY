(async () => {
  await requireAdmin();
  document.querySelector('#logout-btn')?.addEventListener('click', logout);

  const form = document.querySelector('#settings-form');

  const res = await adminAuthFetch('/api/admin/settings');
  if (!res) return;
  const data = await res.json();
  if (!res.ok) return;

  form.businessName.value = data.businessName || '';
  form.contactEmail.value = data.contactEmail || '';
  form.phone.value = data.phone || '';
  form.address.value = data.address || '';
  form.instagram.value = data.socialLinks?.instagram || '';
  form.facebook.value = data.socialLinks?.facebook || '';
  form.tiktok.value = data.socialLinks?.tiktok || '';
  form.primary.value = data.brandColors?.primary || '#bfa072';
  form.accent.value = data.brandColors?.accent || '#f4d7d0';
  form.background.value = data.brandColors?.background || '#fffdf8';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    const updateRes = await adminAuthFetch('/api/admin/settings', {
      method: 'PUT',
      body: fd
    });

    if (!updateRes) return;
    if (!updateRes.ok) {
      alert('Failed to update settings');
      return;
    }

    alert('Settings updated');
  });
})();
