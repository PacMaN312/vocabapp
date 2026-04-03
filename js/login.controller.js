/**
 * Login page — MVC
 */

// ── View ─────────────────────────────────────────────────────────────────────
const LoginView = {
  form: document.getElementById('login-form'),
  alertBox: document.getElementById('login-alert'),

  showAlert(message, type = 'error') {
    this.alertBox.textContent = message;
    this.alertBox.className = `form-alert form-alert--${type}`;
    this.alertBox.style.display = 'block';
  },

  hideAlert() {
    this.alertBox.style.display = 'none';
  },

  getData() {
    return {
      email: document.getElementById('login-email').value.trim(),
      password: document.getElementById('login-password').value,
    };
  },

  setLoading(state) {
    const btn = document.getElementById('login-submit');
    btn.disabled = state;
    btn.textContent = state ? 'Зачекайте...' : 'Увійти →';
  },
};

// ── Controller ───────────────────────────────────────────────────────────────
const LoginController = {
  model: new AuthModel(),

  init() {
    // If already logged in — go to profile
    if (this.model.isLoggedIn()) {
      window.location.href = 'profile.html';
      return;
    }

    LoginView.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  },

  handleSubmit() {
    LoginView.hideAlert();
    const { email, password } = LoginView.getData();

    if (!email || !password) {
      LoginView.showAlert('Заповніть усі поля.', 'error');
      return;
    }

    LoginView.setLoading(true);
    const result = this.model.login(email, password);
    LoginView.setLoading(false);

    if (!result.ok) {
      LoginView.showAlert(result.error, 'error');
      return;
    }

    LoginView.showAlert(`Ласкаво просимо, ${result.user.name}! Перенаправлення...`, 'success');
    setTimeout(() => {
      window.location.href = 'profile.html';
    }, 1200);
  },
};

LoginController.init();
