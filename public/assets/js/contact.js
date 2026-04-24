const contactForm = document.querySelector('#contact-form');
const statusBox = document.querySelector('#contact-status');

contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusBox.textContent = 'Sending...';

  const payload = Object.fromEntries(new FormData(contactForm).entries());

  const res = await fetch('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
    statusBox.textContent = data.message || 'Submission failed. Please try again.';
    return;
  }

  statusBox.textContent = 'Thank you! Your inquiry was submitted successfully.';
  contactForm.reset();
});
