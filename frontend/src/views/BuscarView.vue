<template>
  <div>
    <!-- BREADCRUMB -->
    <div class="flex gap-2 align-items-center text-xs uppercase mb-4 text-color-secondary" style="letter-spacing: .5px;">
      <RouterLink to="/" class="text-color-secondary no-underline">Inicio</RouterLink>
      <span>/</span>
      <strong style="color: var(--black);">{{ q ? 'Búsqueda' : 'Todos los productos' }}</strong>
    </div>

    <!-- HEADER -->
    <div class="mb-5 pb-3" style="border-bottom: 2px solid var(--black);">
      <h1 style="font-family: var(--font-display); font-size: 3.5rem; letter-spacing: 2px; line-height: 1;">
        {{ q ? 'RESULTADOS' : 'TODOS LOS PRODUCTOS' }}
      </h1>
      <p v-if="zapatos" class="text-color-secondary mt-2 mb-0">
        <template v-if="q">
          {{ zapatos.total }} resultado{{ zapatos.total !== 1 ? 's' : '' }} para
          <strong>"{{ q }}"</strong>
        </template>
        <template v-else>
          {{ zapatos.total }} producto{{ zapatos.total !== 1 ? 's' : '' }} disponibles
        </template>
      </p>
    </div>

    <!-- BUSCADOR -->
    <form @submit.prevent="buscar" class="p-inputgroup mb-5" style="max-width: 560px;">
      <InputText v-model="inputQ" placeholder="Buscar zapatos, marcas, materiales..." autofocus />
      <Button type="submit" label="Buscar" style="background: var(--black); border-color: var(--black); color: var(--white);" />
    </form>

    <!-- CARGANDO -->
    <div v-if="cargando" class="text-center py-8 text-color-secondary">
      <ProgressSpinner />
      <h3 style="font-family: var(--font-display); font-size: 2rem;">Cargando...</h3>
    </div>

    <!-- RESULTADOS -->
    <template v-else-if="zapatos?.data?.length">
      <div class="grid">
        <div v-for="zapato in zapatos.data" :key="zapato.id" class="col-12 sm:col-6 md:col-4 lg:col-3">
          <ZapatoCard :zapato="zapato" />
        </div>
      </div>

      <!-- PAGINACIÓN -->
      <div class="flex justify-content-center mt-5">
        <Paginator
          :rows="1"
          :totalRecords="zapatos.last_page"
          :first="paginaActual - 1"
          @page="e => cambiarPagina(e.page + 1)"
        />
      </div>
    </template>

    <!-- SIN RESULTADOS -->
    <div v-else-if="q" class="text-center py-8 text-color-secondary">
      <span class="text-6xl mb-3 block">👟</span>
      <h3 style="font-family: var(--font-display); font-size: 2rem; color: var(--black);">Sin resultados</h3>
      <p>No encontramos productos para <strong>"{{ q }}"</strong>.</p>
      <p class="mt-2" style="font-size: .88rem;">
        Intenta con otro término o explorá nuestras categorías.
      </p>
      <RouterLink to="/categorias">
        <Button label="Ver Categorías" class="mt-4" style="background: var(--black); border-color: var(--black); color: var(--white);" />
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { buscarZapatos } from '@/services/api'
import ZapatoCard from '@/components/ZapatoCard.vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import Paginator from 'primevue/paginator'

const route = useRoute()
const router = useRouter()

const q = ref('')
const inputQ = ref('')
const zapatos = ref(null)
const cargando = ref(false)
const paginaActual = ref(1)

async function cargar(pagina = 1) {
  cargando.value = true
  try {
    const res = await buscarZapatos({ q: q.value || undefined, page: pagina })
    zapatos.value = res.data.zapatos
    paginaActual.value = pagina
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
}

function buscar() {
  q.value = inputQ.value.trim()
  router.replace({ name: 'buscar', query: q.value ? { q: q.value } : {} })
  cargar(1)
}

function cambiarPagina(p) {
  if (p < 1 || p > zapatos.value?.last_page) return
  cargar(p)
}

watch(() => route.query.q, (val) => {
  q.value = val ?? ''
  inputQ.value = val ?? ''
  cargar(1)
})

onMounted(() => {
  q.value = route.query.q ?? ''
  inputQ.value = route.query.q ?? ''
  cargar(1)
})
</script>