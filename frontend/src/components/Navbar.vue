<template>
  <nav>
    <RouterLink to="/" class="nav-logo">STR<span>Y</span>DE</RouterLink>

    <div class="nav-links">
      <RouterLink to="/">Inicio</RouterLink>
      <RouterLink to="/categorias">Categorías</RouterLink>

      <form class="search-form" @submit.prevent="buscar">
        <input v-model="query" type="text" placeholder="Buscar zapatos..." />
        <button type="submit">🔍</button>
      </form>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const query = ref('')
const router = useRouter()

function buscar() {
  if (query.value.trim()) {
    router.push({ name: 'buscar', query: { q: query.value.trim() } })
  }
}
</script>