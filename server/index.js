/**
 * VocabApp — Express Server
 * Handles auth (register/login) and vocabulary/progress API
 * Storage: NeDB (file-based, no native deps)
 */

const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const path    = require('path');
const Datastore = require('nedb-promises');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'vocabapp-secret-2026';

// ── Database ──────────────────────────────────────────────────────────────────
const db = {
  users:    Datastore.create({ filename: path.join(__dirname, 'data/users.db'),    autoload: true }),
  progress: Datastore.create({ filename: path.join(__dirname, 'data/progress.db'), autoload: true }),
  words:    Datastore.create({ filename: path.join(__dirname, 'data/words.db'),    autoload: true }),
};

// ── Seed vocabulary ────────────────────────────────────────────────────────────
const VOCAB = [
  { id: 1,  word: 'Apple',   translation: 'Яблуко',     example: 'I eat an apple every morning.' },
  { id: 2,  word: 'Book',    translation: 'Книга',      example: 'She reads a book before bed.' },
  { id: 3,  word: 'Car',     translation: 'Автомобіль', example: 'He drives a red car to work.' },
  { id: 4,  word: 'Dog',     translation: 'Собака',     example: 'The dog barked at the stranger.' },
  { id: 5,  word: 'Earth',   translation: 'Земля',      example: 'The Earth orbits the Sun.' },
  { id: 6,  word: 'Flower',  translation: 'Квітка',     example: 'She gave me a beautiful flower.' },
  { id: 7,  word: 'Garden',  translation: 'Сад',        example: 'We planted tomatoes in the garden.' },
  { id: 8,  word: 'House',   translation: 'Будинок',    example: 'They built a new house last year.' },
  { id: 9,  word: 'Island',  translation: 'Острів',     example: 'We spent a week on a tropical island.' },
  { id: 10, word: 'Journey', translation: 'Подорож',    example: 'The journey took three days.' },
];

async function seedWords() {
  const count = await db.words.count({});
  if (count === 0) {
    await db.words.insert(VOCAB);
    console.log('✅ Vocabulary seeded');
  }
}
seedWords();

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// JWT auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Потрібна авторизація' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Недійсний токен' });
  }
}

// ── Routes: Auth ──────────────────────────────────────────────────────────────

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, gender, birthdate, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Заповніть усі обов\'язкові поля.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль має бути не менше 6 символів.' });
    }

    const existing = await db.users.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Користувач з таким email вже існує.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.users.insert({
      name,
      email,
      gender:    gender || '',
      birthdate: birthdate || '',
      password:  hashedPassword,
      createdAt: new Date().toLocaleDateString('uk-UA'),
    });

    res.status(201).json({ ok: true, message: 'Реєстрацію успішно завершено!' });
  } catch (err) {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Заповніть усі поля.' });
    }

    const user = await db.users.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Невірний email або пароль.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Невірний email або пароль.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = user;
    res.json({ ok: true, token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// GET /api/auth/me — get current user info
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await db.users.findOne({ _id: req.user.id });
    if (!user) return res.status(404).json({ error: 'Користувача не знайдено' });
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// ── Routes: Words ─────────────────────────────────────────────────────────────

// GET /api/words — get all vocabulary
app.get('/api/words', async (req, res) => {
  try {
    const words = await db.words.find({}).sort({ id: 1 });
    res.json(words);
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// ── Routes: Progress ──────────────────────────────────────────────────────────

// GET /api/progress — get user's known words
app.get('/api/progress', auth, async (req, res) => {
  try {
    let record = await db.progress.findOne({ userId: req.user.id });
    if (!record) record = { userId: req.user.id, knownIds: [] };
    res.json({ knownIds: record.knownIds });
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// PUT /api/progress — update user's known words
app.put('/api/progress', auth, async (req, res) => {
  try {
    const { knownIds } = req.body;
    if (!Array.isArray(knownIds)) {
      return res.status(400).json({ error: 'knownIds must be an array' });
    }

    const existing = await db.progress.findOne({ userId: req.user.id });
    if (existing) {
      await db.progress.update({ userId: req.user.id }, { $set: { knownIds } });
    } else {
      await db.progress.insert({ userId: req.user.id, knownIds });
    }

    res.json({ ok: true, knownIds });
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// POST /api/progress/quiz-result — save quiz result
app.post('/api/progress/quiz-result', auth, async (req, res) => {
  try {
    const { correct, total } = req.body;
    await db.progress.update(
      { userId: req.user.id },
      { $push: { quizHistory: { correct, total, date: new Date().toISOString() } } },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 VocabApp server running on http://localhost:${PORT}`);
});

module.exports = app;
