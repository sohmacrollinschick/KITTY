(async () => {
  await requireAdmin();

  document.querySelector('#logout-btn')?.addEventListener('click', logout);

  async function loadUsers() {
    const res = await adminAuthFetch('/api/admin/users');
    if (!res) return;
    const users = await res.json();
    if (!res.ok || !Array.isArray(users)) return;

    const tbody = document.querySelector('#users-table');
    tbody.innerHTML = users.map((u) => {
      const canDelete = u.role === 'user' && u.email.toLowerCase() !== 'sohmacrollins99@gmail.com';
      return `
        <tr>
          <td>${u.fullName}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td>${new Date(u.createdAt).toLocaleDateString()}</td>
          <td>${canDelete ? `<button class="ghost" onclick="deleteUser('${u._id}', '${u.fullName.replace(/'/g, "\\'")}')">Delete</button>` : 'Protected'}</td>
        </tr>`;
    }).join('');
  }

  window.deleteUser = async (id, fullName) => {
    if (!confirm(`Delete user ${fullName}? This cannot be undone.`)) return;

    const res = await adminAuthFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (!res) return;
    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Failed to delete user');
      return;
    }

    loadUsers();
  };

  loadUsers();
})();
