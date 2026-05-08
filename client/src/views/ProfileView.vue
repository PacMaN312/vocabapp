<template>
  <main style="position:relative;overflow:hidden;">
    <div class="hero-glow"></div>
    <div style="max-width:640px;margin:0 auto;padding:4rem 1.5rem;">

      <!-- Guest -->
      <div v-if="!authStore.isLoggedIn" style="text-align:center;padding:4rem 0;">
        <div style="font-size:3rem;margin-bottom:1rem;">🔒</div>
        <h2 style="margin-bottom:0.5rem;">Ви не авторизовані</h2>
        <p style="color:var(--text-muted);margin-bottom:2rem;">Увійдіть або зареєструйтесь, щоб переглянути профіль.</p>
        <div style="display:flex;gap:12px;justify-content:center;">
          <router-link to="/login"    class="btn-primary">Увійти →</router-link>
          <router-link to="/register" class="btn-ghost">Реєстрація</router-link>
        </div>
      </div>

      <!-- Logged in -->
      <div v-else>
        <div style="text-align:center;margin-bottom:2.5rem;" class="fade-up">
          <div class="avatar-ring" style="margin-bottom:1rem;">👤</div>
          <h2 style="font-size:1.6rem;margin-bottom:0.25rem;">{{ user.name }}</h2>
          <p style="color:var(--text-muted);font-size:0.9rem;">{{ user.email }}</p>
        </div>

        <div class="card fade-up fade-up-1">
          <div style="padding:1.5rem 1.5rem 1rem;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);">
            <h3 style="font-size:1rem;font-weight:700;margin:0;">Особисті дані</h3>
          </div>
          <div class="profile-row">
            <span class="profile-key">Ім'я</span>
            <span class="profile-val">{{ user.name }}</span>
          </div>
          <div class="profile-row">
            <span class="profile-key">Email</span>
            <span class="profile-val">{{ user.email }}</span>
          </div>
          <div class="profile-row">
            <span class="profile-key">Стать</span>
            <span class="profile-val">{{ user.gender || '—' }}</span>
          </div>
          <div class="profile-row">
            <span class="profile-key">Дата народження</span>
            <span class="profile-val">{{ formattedBirthdate }}</span>
          </div>
          <div class="profile-row">
            <span class="profile-key">Дата реєстрації</span>
            <span class="profile-val" style="color:var(--text-muted);">{{ user.createdAt || '—' }}</span>
          </div>
        </div>

        <div style="margin-top:1.5rem;text-align:center;" class="fade-up fade-up-2">
          <button @click="handleLogout" class="btn-ghost" style="font-size:0.85rem;color:#ff6b6b;border-color:rgba(255,107,107,0.3);">
            Вийти з акаунту
          </button>
        </div>
      </div>

    </div>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '../store/auth.js'

const router = useRouter()
const user   = computed(() => authStore.user || {})

const formattedBirthdate = computed(() => {
  if (!user.value.birthdate) return '—'
  return new Date(user.value.birthdate).toLocaleDateString('uk-UA', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
