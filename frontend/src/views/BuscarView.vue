<template>
  <div>
    <!-- BREADCRUMB -->
    <div class="breadcrumb animate">
      <RouterLink to="/">Inicio</RouterLink>
      <span>/</span>
      <strong style="color:var(--black)">{{ q ? 'Búsqueda' : 'Todos los productos' }}</strong>
    </div>

    <!-- HEADER -->
    <div class="page-header animate">
      <h1>{{ q ? 'RESULTADOS' : 'TODOS LOS PRODUCTOS' }}</h1>
      <p v-if="zapatos">
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
    <form class="buscar-form animate" @submit.prevent="buscar">
      <input
        v-model="inputQ"
        type="text"
        placeholder="Buscar zapatos, marcas, materiales..."
        autofocus
      />
      <button type="submit">Buscar</button>
    </form>

    <!-- CARGANDO -->
    <div v-if="cargando" class="empty-state">
      <span class="emoji">⏳</span>
      <h3>Cargando...</h3>
    </div>

    <!-- RESULTADOS -->
    <template v-else-if="zapatos?.data?.length">
      <div class="cards-grid">
        <ZapatoCard
          v-for="(zapato, i) in zapatos.data"
          :key="zapato.id"
          :zapato="zapato"
          :delay="(i % 4) + 1"
        />
      </div>

      <!-- PAGINACIÓN -->
      <div class="pagination-wrap">
        <ul class="pagination">
          <li :class="{ disabled: !zapatos.prev_page_url }">
            <a @click.prevent="cambiarPagina(paginaActual - 1)" href="#">←</a>
          </li>
          <li
            v-for="p in zapatos.last_page"
            :key="p"
            :class="{ active: p === paginaActual }"
          >
            <a @click.prevent="cambiarPagina(p)" href="#">{{ p }}</a>
          </li>
          <li :class="{ disabled: !zapatos.next_page_url }">
            <a @click.prevent="cambiarPagina(paginaActual + 1)" href="#">→</a>
          </li>
        </ul>
      </div>
    </template>

    <!-- SIN RESULTADOS -->
    <div v-else-if="q" class="empty-state animate">
      <span class="emoji">👟</span>
      <h3>Sin resultados</h3>
      <p>No encontramos productos para <strong>"{{ q }}"</strong>.</p>
      <p style="margin-top:.5rem; font-size:.88rem;">
        Intenta con otro término o explorá nuestras categorías.
      </p>
      <RouterLink to="/categorias" class="btn-ver" style="display:inline-block; margin-top:1.5rem;">
        Ver Categorías
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { buscarZapatos } from '@/services/api'
import ZapatoCard from '@/components/ZapatoCard.vue'

const route  = useRoute()
const router = useRouter()

const q            = ref('')
const inputQ       = ref('')
const zapatos      = ref(null)
const cargando     = ref(false)
const paginaActual = ref(1)

async function cargar(pagina = 1) {
  cargando.value = true
  try {
    const res = await buscarZapatos({ q: q.value || undefined, page: pagina })
    zapatos.value     = res.data.zapatos
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

// Sincronizar con query params de la URL
watch(() => route.query.q, (val) => {
  q.value      = val ?? ''
  inputQ.value = val ?? ''
  cargar(1)
})

onMounted(() => {
  q.value      = route.query.q ?? ''
  inputQ.value = route.query.q ?? ''
  cargar(1)
})
</script>

<style scoped>
.buscar-form {
  display: flex;
  max-width: 560px;
  margin-bottom: 2.5rem;
  border: 2px solid var(--black);
  border-radius: var(--radius);
  overflow: hidden;
}

.buscar-form input {
  flex: 1;
  border: none;
  outline: none;
  padding: .65rem 1.25rem;
  font-family: var(--font-body);
  font-size: 1rem;
  background: var(--white);
}

.buscar-form button {
  background: var(--black);
  border: none;
  color: var(--white);
  padding: .65rem 1.25rem;
  cursor: pointer;
  font-size: .9rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-family: var(--font-body);
  transition: background .2s;
}

.buscar-form button:hover { background: var(--accent); }

@media (max-width: 600px) {
  .buscar-form { max-width: 100%; }
}
</style>