/**
 * AuthModel — Model layer for user registration/login
 * Stores users in localStorage, tracks current session
 */
class AuthModel {
  constructor() {
    this.USERS_KEY = 'vocabapp_users';
    this.SESSION_KEY = 'vocabapp_session';
  }

  // ── helpers ─────────────────────────────────────────
  _getUsers() {
    return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
  }

  _saveUsers(users) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  // ── public API ───────────────────────────────────────
  register({ name, email, gender, birthdate, password }) {
    const users = this._getUsers();

    if (users.find((u) => u.email === email)) {
      return { ok: false, error: 'Користувач з таким email вже існує.' };
    }

    const user = {
      id: Date.now(),
      name,
      email,
      gender,
      birthdate,
      password,
      createdAt: new Date().toLocaleDateString('uk-UA'),
    };

    users.push(user);
    this._saveUsers(users);
    return { ok: true };
  }

  login(email, password) {
    const users = this._getUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      return { ok: false, error: 'Невірний email або пароль.' };
    }

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    return { ok: true, user };
  }

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem(this.SESSION_KEY) || 'null');
  }

  isLoggedIn() {
    return this.getCurrentUser() !== null;
  }
}
