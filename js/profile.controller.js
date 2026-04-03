/**
 * Profile page — MVC
 */

// ── View ─────────────────────────────────────────────────────────────────────
const ProfileView = {
  render(user) {
    document.getElementById('profile-name-heading').textContent = user.name;
    document.getElementById('profile-email-heading').textContent = user.email;

    document.getElementById('pf-name').textContent = user.name;
    document.getElementById('pf-email').textContent = user.email;
    document.getElementById('pf-gender').textContent = user.gender || '—';
    document.getElementById('pf-birthdate').textContent =
      user.birthdate
        ? new Date(user.birthdate).toLocaleDateString('uk-UA', {
            day: 'numeric', month: 'long', year: 'numeric',
          })
        : '—';
    document.getElementById('pf-created').textContent = user.createdAt || '—';
  },

  showGuestMessage() {
    document.getElementById('profile-content').style.display = 'none';
    document.getElementById('profile-guest').style.display = 'block';
  },
};

// ── Controller ───────────────────────────────────────────────────────────────
const ProfileController = {
  model: new AuthModel(),

  init() {
    const user = this.model.getCurrentUser();

    if (!user) {
      ProfileView.showGuestMessage();
      return;
    }

    ProfileView.render(user);

    document.getElementById('logout-btn').addEventListener('click', () => {
      this.model.logout();
      window.location.href = 'login.html';
    });
  },
};

ProfileController.init();
