async function loadPageContent(slug) {
  const res = await fetch(`/api/content/${slug}`);
  if (!res.ok) return null;
  return res.json();
}

async function fillContent(slug) {
  const data = await loadPageContent(slug);
  if (!data) return;

  const title = document.querySelector('[data-page-title]');
  const body = document.querySelector('[data-page-body]');

  if (title) title.textContent = data.title || '';
  if (body) body.textContent = data.body || '';

  if (data.blocks) {
    Object.entries(data.blocks).forEach(([key, value]) => {
      const node = document.querySelector(`[data-block="${key}"]`);
      if (!node) return;
      if (typeof value === 'string') node.textContent = value;
      else node.textContent = JSON.stringify(value, null, 2);
    });
  }
}

window.fillContent = fillContent;
