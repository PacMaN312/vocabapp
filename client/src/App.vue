<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <router-link to="/" class="navbar-brand">Vocab<span>App</span></router-link>
      <ul class="nav-links">
        <li><router-link to="/"        class="nav-link" active-class="active" exact>Про додаток</router-link></li>
        <li><router-link to="/register" class="nav-link" active-class="active">Реєстрація</router-link></li>
        <li><router-link to="/login"    class="nav-link" active-class="active">Вхід</router-link></li>
        <li><router-link to="/profile"  class="nav-link" active-class="active">Профіль</router-link></li>
        <li><router-link to="/study"    class="nav-link" active-class="active">Навчання</router-link></li>
      </ul>
    </div>
  </nav>

  <router-view />

  <footer>© 2026 <span>VocabApp</span> — усі права захищені</footer>
</template>

<script setup>
</script>
