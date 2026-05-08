# VocabApp — Лабораторна робота №3

**ПІБ студента:** ___  
**Група:** ___  
**Лабораторна робота №3:** Розробка Web-додатка засобами Javascript/VueJS  
**URL звіту:** _(посилання на Google Drive)_

---

## Опис додатка

VocabApp — інтерактивний веб-застосунок для вивчення іноземних слів (англійська мова).

### Функціональність

- **Реєстрація / Авторизація** — збереження даних користувача на сервері (Node.js + NeDB), паролі хешуються через bcrypt, сесія через JWT-токен.
- **Режим вивчення** — перегляд карток слів із перекладом та прикладами, позначення «Знаю / Не знаю».
- **Режим тесту** — питання з вибором правильного перекладу з 4 варіантів, підрахунок результату, збереження на сервері.
- **Профіль** — відображення даних авторизованого користувача.
- **Прогрес** — зберігається на сервері для авторизованих користувачів (API `/api/progress`), або у `localStorage` для гостей.

---

## Структура проєкту

```
vocabapp/
├── server/                  # Node.js + Express бекенд
│   ├── index.js             # Головний файл сервера
│   ├── data/                # NeDB файли бази даних
│   └── package.json
└── client/                  # Vue 3 фронтенд (Vite)
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.js          # Точка входу Vue
        ├── App.vue          # Кореневий компонент (navbar)
        ├── style.css        # Глобальні стилі
        ├── api.js           # Axios сервіс для HTTP-запитів
        ├── router/
        │   └── index.js     # Vue Router (5 маршрутів)
        ├── store/
        │   └── auth.js      # Реактивний стор авторизації
        └── views/
            ├── HomeView.vue     # Головна сторінка
            ├── RegisterView.vue # Реєстрація
            ├── LoginView.vue    # Вхід
            ├── ProfileView.vue  # Профіль користувача
            └── StudyView.vue    # Навчання та тест
```

## Vue-компоненти та взаємодія

```
App.vue (navbar + router-view)
├── HomeView.vue    → GET /api/words
├── RegisterView.vue → POST /api/auth/register
├── LoginView.vue   → POST /api/auth/login → authStore
├── ProfileView.vue → authStore (JWT)
└── StudyView.vue   → GET /api/words
                    → GET /api/progress
                    → PUT /api/progress
                    → POST /api/progress/quiz-result
```

## API ендпоінти

| Метод | Шлях | Опис |
|-------|------|------|
| POST | `/api/auth/register` | Реєстрація |
| POST | `/api/auth/login` | Вхід, повертає JWT |
| GET  | `/api/auth/me` | Дані поточного користувача |
| GET  | `/api/words` | Список слів |
| GET  | `/api/progress` | Прогрес користувача |
| PUT  | `/api/progress` | Оновлення прогресу |
| POST | `/api/progress/quiz-result` | Збереження результату тесту |

## Запуск

```bash
# Сервер
cd server
npm install
npm start        # http://localhost:3000

# Клієнт
cd client
npm install
npm run dev      # http://localhost:5173
```
