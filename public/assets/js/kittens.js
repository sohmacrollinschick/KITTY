const form = document.querySelector('#filter-form');
const grid = document.querySelector('#kittens-grid');

async function loadKittens() {
  const params = new URLSearchParams(new FormData(form));
  const clean = new URLSearchParams();
  params.forEach((v, k) => {
    if (v) clean.append(k, v);
  });

  const res = await fetch(`/api/kittens?${clean.toString()}`);
  const kittens = await res.json();

  grid.innerHTML = kittens.length
    ? kittens
        .map(
          (k) => `
      <article class="card animate-in">
        <img src="${k.images?.[0] || 'https://placehold.co/600x420?text=Kitten'}" alt="${k.name}">
        <div class="card-body">
          <span class="badge status-${k.status}">${k.status}</span>
          <h3>${k.name}</h3>
          <p class="muted">${k.age} | ${k.gender}</p>
          <p><strong>$${Number(k.price).toLocaleString()}</strong></p>
          <a class="btn btn-primary" href="/kittens/${k._id}">Open Profile</a>
        </div>
      </article>`
        )
        .join('')
    : '<p>No kittens match these filters yet.</p>';
}

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    loadKittens();
  });
}

loadKittens();
