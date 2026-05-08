<template>
  <main style="position:relative;overflow:hidden;">
    <div class="hero-glow"></div>
    <div style="max-width:600px;margin:0 auto;padding:3.5rem 1.5rem;">

      <!-- Header -->
      <div style="text-align:center;margin-bottom:2rem;" class="fade-up">
        <div class="tag">Сесія навчання</div>
        <h2 style="font-size:1.8rem;margin-bottom:0.3rem;">Режим вивчення слів</h2>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="spinner"></div>

      <template v-else>
        <!-- Mode tabs -->
        <div style="display:flex;gap:8px;margin-bottom:2rem;justify-content:center;" class="fade-up fade-up-1">
          <button class="mode-tab" :class="{ active: mode === 'study' }" @click="switchMode('study')">📘 Вивчення</button>
          <button class="mode-tab" :class="{ active: mode === 'quiz' || mode === 'result' }" @click="switchMode('quiz')">📝 Тест</button>
        </div>

        <!-- ═══════════════════ STUDY PANEL ═══════════════════ -->
        <div v-if="mode === 'study'">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;">
            <span style="font-size:0.82rem;color:var(--text-muted);">Слово {{ studyIndex + 1 }} з {{ words.length }}</span>
            <span style="font-size:0.82rem;color:var(--text-muted);">✅ Знаю: <strong style="color:var(--accent2);">{{ knownIds.length }}</strong></span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: studyProgressPct + '%' }"></div>
          </div>

          <div class="word-card" style="margin-bottom:1.5rem;">
            <div class="word-main">{{ currentWord.word }}</div>
            <div class="word-translation">{{ currentWord.translation }}</div>
            <div class="word-example">"{{ currentWord.example }}"</div>
            <div style="display:flex;gap:8px;justify-content:center;margin-top:1.8rem;flex-wrap:wrap;">
              <button class="btn-ghost" @click="prevWord">← Попереднє</button>
              <button class="btn-primary" @click="nextWord">Наступне →</button>
            </div>
          </div>

          <div style="text-align:center;">
            <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:0.6rem;">Чи знаєш ти це слово?</p>
            <div style="display:flex;gap:8px;justify-content:center;">
              <button class="btn-ghost" :style="{ opacity: !isCurrentKnown ? 0.4 : 1 }" @click="markUnknown"
                style="font-size:0.85rem;color:#ff6b6b;border-color:rgba(255,107,107,0.3);">😕 Не знаю</button>
              <button class="btn-ghost" :style="{ opacity: isCurrentKnown ? 0.4 : 1 }" @click="markKnown"
                style="font-size:0.85rem;color:var(--accent2);border-color:rgba(66,232,196,0.3);">✅ Знаю</button>
            </div>
          </div>
        </div>

        <!-- ═══════════════════ QUIZ PANEL ═══════════════════ -->
        <div v-if="mode === 'quiz'">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;">
            <span style="font-size:0.82rem;color:var(--text-muted);">Питання {{ quiz.index + 1 }} з {{ quiz.questions.length }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: quizProgressPct + '%' }"></div>
          </div>

          <div class="card">
            <div class="card-body">
              <p style="font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:0.5rem;font-weight:600;">
                Оберіть правильний переклад
              </p>
              <h3 style="font-size:1.8rem;margin-bottom:1.5rem;color:var(--accent);font-family:'Syne',sans-serif;">
                {{ currentQuestion.word }}
              </h3>

              <div>
                <div
                  v-for="opt in currentQuestion.options" :key="opt"
                  class="quiz-option"
                  :class="optionClass(opt)"
                  @click="selectOption(opt)"
                >
                  <div class="quiz-dot"></div>
                  <span>{{ opt }}</span>
                </div>
              </div>

              <div style="display:flex;gap:10px;margin-top:1.2rem;">
                <button class="btn-primary" style="flex:1;text-align:center;"
                  :disabled="!quiz.selected || quiz.answered"
                  @click="checkAnswer">Перевірити</button>
                <button v-if="quiz.answered" class="btn-ghost" style="flex:1;text-align:center;"
                  @click="nextQuestion">Далі →</button>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══════════════════ RESULT PANEL ═══════════════════ -->
        <div v-if="mode === 'result'">
          <div class="word-card" style="text-align:center;padding:3rem 2rem;">
            <div style="font-size:3rem;margin-bottom:1rem;">🎯</div>
            <h2 style="font-size:2rem;margin-bottom:0.5rem;">Результат тесту</h2>
            <p style="font-size:3rem;font-family:'Syne',sans-serif;font-weight:800;color:var(--accent);margin:0.5rem 0;">
              {{ quiz.correct }}/{{ quiz.questions.length }}
            </p>
            <p style="color:var(--text-muted);margin:1rem 0 2rem;font-size:1rem;">{{ resultMessage }}</p>
            <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
              <button class="btn-primary" @click="startQuiz">🔄 Пройти знову</button>
              <button class="btn-ghost" @click="switchMode('study')">📘 До вивчення</button>
            </div>
          </div>
        </div>

      </template>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { wordsAPI, progressAPI } from '../api.js'
import { authStore } from '../store/auth.js'

// ── State ─────────────────────────────────────────────────────────────────────
const loading  = ref(true)
const words    = ref([])
const knownIds = ref([])
const studyIndex = ref(0)
const mode = ref('study')

const quiz = ref({
  questions: [],
  index: 0,
  selected: null,
  answered: false,
  correct: 0,
})

// ── Computed ──────────────────────────────────────────────────────────────────
const currentWord = computed(() => words.value[studyIndex.value] || {})
const isCurrentKnown = computed(() => knownIds.value.includes(currentWord.value.id))
const studyProgressPct = computed(() =>
  words.value.length ? Math.round(((studyIndex.value + 1) / words.value.length) * 100) : 0
)

const currentQuestion = computed(() => quiz.value.questions[quiz.value.index] || {})
const quizProgressPct = computed(() =>
  quiz.value.questions.length
    ? Math.round(((quiz.value.index + 1) / quiz.value.questions.length) * 100)
    : 0
)

const resultMessage = computed(() => {
  const pct = Math.round((quiz.value.correct / quiz.value.questions.length) * 100)
  if (pct >= 90) return '🏆 Чудово! Ти справжній знавець слів!'
  if (pct >= 60) return '👍 Непогано! Ще трохи практики — і буде відмінно.'
  return '📚 Продовжуй вчити слова — все вийде!'
})

// ── Load data ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const [wordsRes] = await Promise.all([wordsAPI.getAll()])
    words.value = wordsRes.data

    if (authStore.isLoggedIn) {
      const progRes = await progressAPI.get()
      knownIds.value = progRes.data.knownIds || []
    } else {
      knownIds.value = JSON.parse(localStorage.getItem('vocabapp_progress_guest') || '[]')
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

// ── Study methods ─────────────────────────────────────────────────────────────
function nextWord() {
  studyIndex.value = (studyIndex.value + 1) % words.value.length
}
function prevWord() {
  studyIndex.value = (studyIndex.value - 1 + words.value.length) % words.value.length
}

async function saveProgress(ids) {
  if (authStore.isLoggedIn) {
    try { await progressAPI.update(ids) } catch {}
  } else {
    localStorage.setItem('vocabapp_progress_guest', JSON.stringify(ids))
  }
}

function markKnown() {
  const id = currentWord.value.id
  if (!knownIds.value.includes(id)) {
    knownIds.value = [...knownIds.value, id]
    saveProgress(knownIds.value)
  }
}
function markUnknown() {
  const id = currentWord.value.id
  knownIds.value = knownIds.value.filter(x => x !== id)
  saveProgress(knownIds.value)
}

// ── Quiz methods ──────────────────────────────────────────────────────────────
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function buildQuestion(word) {
  const wrongPool = shuffle(words.value.filter(w => w.id !== word.id))
    .slice(0, 3).map(w => w.translation)
  return {
    word: word.word,
    correctAnswer: word.translation,
    options: shuffle([word.translation, ...wrongPool]),
  }
}

function startQuiz() {
  quiz.value = {
    questions: shuffle(words.value).map(buildQuestion),
    index: 0,
    selected: null,
    answered: false,
    correct: 0,
  }
  mode.value = 'quiz'
}

function switchMode(m) {
  if (m === 'quiz') { startQuiz(); return }
  mode.value = m
}

function selectOption(opt) {
  if (!quiz.value.answered) quiz.value.selected = opt
}

function optionClass(opt) {
  const q = quiz.value
  if (!q.answered) return { selected: opt === q.selected }
  if (opt === currentQuestion.value.correctAnswer) return { correct: true }
  if (opt === q.selected && opt !== currentQuestion.value.correctAnswer) return { wrong: true }
  return {}
}

function checkAnswer() {
  const q = quiz.value
  if (!q.selected || q.answered) return
  q.answered = true
  if (q.selected === currentQuestion.value.correctAnswer) q.correct++
}

async function nextQuestion() {
  const q = quiz.value
  q.index++
  q.selected  = null
  q.answered  = false

  if (q.index >= q.questions.length) {
    mode.value = 'result'
    if (authStore.isLoggedIn) {
      try { await progressAPI.saveResult(q.correct, q.questions.length) } catch {}
    }
  }
}
</script>
