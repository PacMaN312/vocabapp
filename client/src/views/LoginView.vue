<template>
  <main style="position:relative;overflow:hidden;">
    <div class="hero-glow"></div>
    <div style="max-width:480px;margin:0 auto;padding:4rem 1.5rem;">

      <div style="text-align:center;margin-bottom:2.5rem;" class="fade-up">
        <div class="app-emblem" style="width:60px;height:60px;font-size:1.6rem;border-radius:16px;">🔑</div>
        <h2 style="font-size:1.8rem;margin-bottom:0.4rem;">З поверненням</h2>
        <p style="color:var(--text-muted);font-size:0.95rem;">Введіть дані для входу до акаунту</p>
      </div>

      <div class="form-card fade-up fade-up-1">
        <div v-if="alert.message" class="alert" :class="alert.type === 'error' ? 'alert-error' : 'alert-success'">
          {{ alert.message }}
        </div>

        <form @submit.prevent="handleSubmit" novalidate>
          <div style="margin-bottom:1.2rem;">
            <label class="form-label">Email адреса</label>
            <input v-model="form.email" type="email" class="form-control" placeholder="you@example.com">
          </div>
          <div style="margin-bottom:0.5rem;">
            <label class="form-label">Пароль</label>
            <input v-model="form.password" type="password" class="form-control" placeholder="••••••••">
          </div>
          <div style="text-align:right;margin-bottom:1.8rem;">
            <a href="#" style="font-size:0.82rem;color:var(--primary);text-decoration:none;">Забули пароль?</a>
          </div>

          <button type="submit" class="btn-primary" style="width:100%;text-align:center;" :disabled="loading">
            {{ loading ? 'Зачекайте...' : 'Увійти →' }}
          </button>
        </form>

        <p style="text-align:center;margin-top:1.5rem;font-size:0.88rem;color:var(--text-muted);">
          Немає акаунту? <router-link to="/register" style="color:var(--primary);text-decoration:none;">Зареєструватись</router-link>
        </p>
      </div>

    </div>
  </main>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../api.js'
import { authStore } from '../store/auth.js'

const router  = useRouter()
const loading = ref(false)
const alert   = reactive({ message: '', type: 'error' })
const form    = reactive({ email: '', password: '' })

onMounted(() => {
  if (authStore.isLoggedIn) router.push('/profile')
})

function showAlert(message, type = 'error') {
  alert.message = message
  alert.type    = type
}

async function handleSubmit() {
  alert.message = ''
  if (!form.email || !form.password) {
    showAlert('Заповніть усі поля.')
    return
  }

  loading.value = true
  try {
    const res = await authAPI.login(form)
    authStore.setSession(res.data.user, res.data.token)
    showAlert(`Ласкаво просимо, ${res.data.user.name}! Перенаправлення...`, 'success')
    setTimeout(() => router.push('/profile'), 1200)
  } catch (e) {
    showAlert(e.response?.data?.error || 'Помилка сервера')
  } finally {
    loading.value = false
  }
}
</script>
