<template>
  <Navbar />
  <main class="mx-auto p-3 md:p-4" style="max-width: 1280px;">
    <RouterView />
  </main>
  <footer class="flex justify-content-center align-items-center p-3 text-sm" style="background: var(--black); color: rgba(245,242,238,.5); letter-spacing: 1px;">
    <span>
      &copy; {{ new Date().getFullYear() }} <strong style="color: var(--accent);">STRYDE</strong> — Todos los derechos reservados | Hecho por
      <a href="https://github.com/ValeeFernandez" target="_blank" class="no-underline" style="color: inherit;">Lelany Fernandez</a>
      y
      <a href="https://github.com/alendroc" target="_blank" class="no-underline" style="color: inherit;">Jose Chaves</a>
    </span>
  </footer>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
</script>