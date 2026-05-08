<template>
  <main style="position:relative;overflow:hidden;">
    <div class="hero-glow"></div>
    <div style="max-width:560px;margin:0 auto;padding:4rem 1.5rem;">

      <div style="text-align:center;margin-bottom:2.5rem;" class="fade-up">
        <div class="app-emblem" style="width:60px;height:60px;font-size:1.6rem;border-radius:16px;">✨</div>
        <h2 style="font-size:1.8rem;margin-bottom:0.4rem;">Створити акаунт</h2>
        <p style="color:var(--text-muted);font-size:0.95rem;">Заповніть форму та розпочніть навчання</p>
      </div>

      <div class="form-card fade-up fade-up-1">
        <div v-if="alert.message" class="alert" :class="alert.type === 'error' ? 'alert-error' : 'alert-success'">
          {{ alert.message }}
        </div>

        <form @submit.prevent="handleSubmit" novalidate>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.2rem;margin-bottom:1.2rem;">
            <div>
              <label class="form-label">Ім'я</label>
              <input v-model="form.name" type="text" class="form-control" placeholder="Іван">
            </div>
            <div>
              <label class="form-label">Email</label>
              <input v-model="form.email" type="email" class="form-control" placeholder="you@example.com">
            </div>
            <div>
              <label class="form-label">Стать</label>
              <select v-model="form.gender" class="form-select">
                <option value="">Оберіть...</option>
                <option>Чоловіча</option>
                <option>Жіноча</option>
                <option>Не вказувати</option>
              </select>
            </div>
            <div>
              <label class="form-label">Дата народження</label>
              <input v-model="form.birthdate" type="date" class="form-control">
            </div>
          </div>

          <div style="margin-bottom:1.8rem;">
            <label class="form-label">Пароль</label>
            <input v-model="form.password" type="password" class="form-control" placeholder="Мінімум 6 символів">
          </div>

          <button type="submit" class="btn-primary" style="width:100%;text-align:center;" :disabled="loading">
            {{ loading ? 'Зачекайте...' : 'Зареєструватися →' }}
          </button>
        </form>

        <p style="text-align:center;margin-top:1.5rem;font-size:0.88rem;color:var(--text-muted);">
          Вже є акаунт? <router-link to="/login" style="color:var(--primary);text-decoration:none;">Увійти</router-link>
        </p>
      </div>

    </div>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../api.js'

const router  = useRouter()
const loading = ref(false)
const alert   = reactive({ message: '', type: 'error' })

const form = reactive({
  name: '', email: '', gender: '', birthdate: '', password: '',
})

function showAlert(message, type = 'error') {
  alert.message = message
  alert.type    = type
}

function validate() {
  if (!form.name)                        return 'Введіть ім\'я.'
  if (!form.email || !form.email.includes('@')) return 'Введіть коректний email.'
  if (!form.gender)                      return 'Оберіть стать.'
  if (!form.birthdate)                   return 'Вкажіть дату народження.'
  if (form.password.length < 6)          return 'Пароль має бути не менше 6 символів.'
  return null
}

async function handleSubmit() {
  alert.message = ''
  const err = validate()
  if (err) { showAlert(err); return }

  loading.value = true
  try {
    await authAPI.register(form)
    showAlert('Реєстрацію успішно завершено! Перенаправлення...', 'success')
    setTimeout(() => router.push('/login'), 1500)
  } catch (e) {
    showAlert(e.response?.data?.error || 'Помилка сервера')
  } finally {
    loading.value = false
  }
}
</script>
