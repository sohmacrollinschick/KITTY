const pathParts = window.location.pathname.split('/').filter(Boolean);
const kittenId = pathParts[0] === 'kittens' && pathParts[1] ? pathParts[1] : null;

async function loadKitten() {
  const profile = document.querySelector('#kitten-profile');
  if (!kittenId || !profile) return;

  const res = await fetch(`/api/kittens/${kittenId}`);
  if (!res.ok) {
    profile.innerHTML = '<p>Kitten profile not found.</p>';
    return;
  }

  const k = await res.json();

  const images = (k.images || [])
    .map((src) => `<img class="card" src="${src}" alt="${k.name}">`)
    .join('');
  const video = k.videoUrl
    ? `<p><a class="btn btn-secondary" target="_blank" href="${k.videoUrl}">Watch Video</a></p>`
    : '';

  profile.innerHTML = `
    <div class="grid" style="grid-template-columns: 1.1fr 1fr; gap:1.2rem;">
      <div class="grid">${images || '<img class="card" src="https://placehold.co/800x600?text=Kitten" alt="placeholder">'} ${video}</div>
      <div class="card"><div class="card-body">
        <span class="badge status-${k.status}">${k.status}</span>
        <h1>${k.name}</h1>
        <p class="muted">${k.breed} | ${k.gender}</p>
        <p><strong>Age:</strong> ${k.age}</p>
        <p><strong>DOB:</strong> ${k.dob ? new Date(k.dob).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Temperament:</strong> ${k.temperament || 'Not specified'}</p>
        <p><strong>Price:</strong> $${Number(k.price).toLocaleString()}</p>
        <p>${k.description || ''}</p>
        <button id="reserve-btn" class="btn btn-primary">Reserve / Inquire</button>
      </div></div>
    </div>`;

  document.querySelector('#reserve-btn')?.addEventListener('click', async () => {
    const customerName = prompt('Your full name');
    const email = prompt('Your email address');
    const phone = prompt('Your phone number (optional)') || '';

    if (!customerName || !email) {
      alert('Name and email are required.');
      return;
    }

    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName, email, phone, kitten: k._id })
    });

    const data = await response.json();
    if (!response.ok) {
      alert(data.message || 'Reservation failed');
      return;
    }

    alert('Reservation request submitted successfully.');
  });
}

loadKitten();
