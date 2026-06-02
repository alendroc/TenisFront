<template>
  <Navbar />
  <main class="main-content">
    <RouterView />
  </main>
  <footer>
    &copy; {{ new Date().getFullYear() }} <span>STRYDE</span> — Todos los derechos reservados | Hecho  por <a href="https://github.com/ValeeFernandez" target="_blank" style="text-decoration: none; color: var(--gray);">Lelany Fernandez</a> y <a href="https://github.com/alendroc" target="_blank" style="text-decoration: none; color: var(--gray);">Jose Chaves</a>
  </footer>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
</script>