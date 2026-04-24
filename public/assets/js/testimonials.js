async function loadTestimonials() {
  const wrap = document.querySelector('#testimonials-list');
  if (!wrap) return;

  const res = await fetch('/api/testimonials');
  const data = await res.json();

  wrap.innerHTML = data.length
    ? data.map((t) => `
      <article class="card animate-in">
        <div class="card-body">
          <h3>${t.customerName}</h3>
          <p>${'?'.repeat(t.rating || 5)}</p>
          <p class="muted">${t.message}</p>
        </div>
      </article>`).join('')
    : '<p>No testimonials published yet.</p>';
}

loadTestimonials();
