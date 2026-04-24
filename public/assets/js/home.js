async function loadHomeFeatured() {
  const wrap = document.querySelector('#featured-kittens');
  if (!wrap) return;

  const res = await fetch('/api/kittens?featured=true');
  if (!res.ok) return;

  const kittens = await res.json();
  wrap.innerHTML = kittens.length
    ? kittens
        .slice(0, 6)
        .map(
          (k) => `
      <article class="card animate-in">
        <img src="${k.images?.[0] || 'https://placehold.co/600x420?text=Kitten'}" alt="${k.name}">
        <div class="card-body">
          <span class="badge status-${k.status}">${k.status}</span>
          <h3>${k.name}</h3>
          <p class="muted">${k.age} | ${k.gender} | $${Number(k.price).toLocaleString()}</p>
          <a class="btn btn-secondary" href="/kittens/${k._id}">View Profile</a>
        </div>
      </article>`
        )
        .join('')
    : '<p>No featured kittens available right now.</p>';
}

loadHomeFeatured();
