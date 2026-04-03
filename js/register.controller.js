/**
 * Register page — MVC
 * View  : renders form errors / success message
 * Controller : handles submit, delegates to AuthModel
 */

// ── View ────────────────────────────────────────────────────────────────────
const RegisterView = {
  form: document.getElementById('register-form'),
  alertBox: document.getElementById('register-alert'),

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
      name: document.getElementById('reg-name').value.trim(),
      email: document.getElementById('reg-email').value.trim(),
      gender: document.getElementById('reg-gender').value,
      birthdate: document.getElementById('reg-birthdate').value,
      password: document.getElementById('reg-password').value,
    };
  },

  setLoading(state) {
    const btn = document.getElementById('reg-submit');
    btn.disabled = state;
    btn.textContent = state ? 'Зачекайте...' : 'Зареєструватися →';
  },
};

// ── Controller ───────────────────────────────────────────────────────────────
const RegisterController = {
  model: new AuthModel(),

  init() {
    RegisterView.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  },

  validate(data) {
    if (!data.name) return 'Введіть ім\'я.';
    if (!data.email || !data.email.includes('@')) return 'Введіть коректний email.';
    if (!data.gender) return 'Оберіть стать.';
    if (!data.birthdate) return 'Вкажіть дату народження.';
    if (data.password.length < 6) return 'Пароль має бути не менше 6 символів.';
    return null;
  },

  handleSubmit() {
    RegisterView.hideAlert();
    const data = RegisterView.getData();

    const validationError = this.validate(data);
    if (validationError) {
      RegisterView.showAlert(validationError, 'error');
      return;
    }

    RegisterView.setLoading(true);
    const result = this.model.register(data);
    RegisterView.setLoading(false);

    if (!result.ok) {
      RegisterView.showAlert(result.error, 'error');
      return;
    }

    RegisterView.showAlert('Реєстрацію успішно завершено! Перенаправлення...', 'success');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  },
};

RegisterController.init();
