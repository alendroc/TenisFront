<template>
  <Toolbar class="px-4 border-none" style="border-radius: 0; background: var(--black);">
    <template #start>
      <RouterLink to="/" class="text-3xl font-bold no-underline" style="font-family: var(--font-display); letter-spacing: 2px; color: var(--white);">
        STR<span style="color: var(--accent);">Y</span>DE
      </RouterLink>
    </template>

    <template #end>
      <div class="flex align-items-center gap-4">
        <RouterLink to="/" class="nav-link" active-class="nav-link-active">Inicio</RouterLink>
        <RouterLink to="/categorias" class="nav-link" active-class="nav-link-active">Categorías</RouterLink>

<form @submit.prevent="buscar" class="p-inputgroup w-15rem">
  <InputText v-model="query" placeholder="Buscar zapatos..." />
  <Button type="submit" icon="pi pi-search" style="background: var(--accent); border-color: var(--accent);" />
</form>>
      </div>
    </template>
  </Toolbar>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Toolbar from 'primevue/toolbar'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const query = ref('')
const router = useRouter()

function buscar() {
  if (query.value.trim()) {
    router.push({ name: 'buscar', query: { q: query.value.trim() } })
  }
}
</script>

<style scoped>
.nav-link {
  color: var(--border);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: color .2s;
}

.nav-link:hover,
.nav-link-active {
  color: var(--white);
}
</style>