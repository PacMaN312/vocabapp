<template>
  <main style="position:relative;overflow:hidden;">
    <div class="hero-glow"></div>
    <div class="hero-glow-2"></div>

    <div style="max-width:1100px;margin:0 auto;padding:5rem 1.5rem 4rem;position:relative;z-index:1;">

      <div style="text-align:center;margin-bottom:4rem;">
        <div class="app-emblem fade-up">📖</div>
        <div class="tag fade-up fade-up-1">Навчальний веб-додаток</div>
        <h1 class="page-title fade-up fade-up-2" style="margin-bottom:1rem;">
          Вивчай слова.<br>Запам'ятовуй швидше.
        </h1>
        <p class="page-subtitle fade-up fade-up-3" style="margin-bottom:2rem;">
          VocabApp — інтерактивний застосунок для вивчення іноземних слів із режимом вивчення та контролем знань.
        </p>
        <div class="fade-up fade-up-4" style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <router-link to="/study"    class="btn-primary">Почати навчання →</router-link>
          <router-link to="/register" class="btn-ghost">Зареєструватись</router-link>
        </div>
      </div>

      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:4rem;" class="fade-up fade-up-4">
        <div class="stat-chip">📚 <strong>{{ wordCount }}</strong> слів у базі</div>
        <div class="stat-chip">🌍 <strong>Англійська</strong> мова</div>
        <div class="stat-chip">⚡ <strong>Режим тесту</strong> вбудований</div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem;">
        <div class="card feature-card fade-up fade-up-1">
          <div class="card-body">
            <span class="feature-icon">📘</span>
            <h4>Режим вивчення</h4>
            <p>Перегляд нових слів, їх переклад та приклади використання у реальних реченнях. Позначай слова як відомі.</p>
          </div>
        </div>
        <div class="card feature-card fade-up fade-up-2">
          <div class="card-body">
            <span class="feature-icon">📝</span>
            <h4>Контроль знань</h4>
            <p>Тестування з вибором правильної відповіді з миттєвим зворотнім зв'язком та підрахунком результату.</p>
          </div>
        </div>
        <div class="card feature-card fade-up fade-up-3">
          <div class="card-body">
            <span class="feature-icon">🔖</span>
            <h4>Особистий профіль</h4>
            <p>Реєструйся, входь та переглядай свої дані. Прогрес зберігається на сервері у базі даних.</p>
          </div>
        </div>
      </div>

    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { wordsAPI } from '../api.js'

const wordCount = ref(10)

onMounted(async () => {
  try {
    const res = await wordsAPI.getAll()
    wordCount.value = res.data.length
  } catch {
    wordCount.value = 10
  }
})
</script>
