<template>
  <div>
    <!-- BREADCRUMB -->
    <div class="breadcrumb animate">
      <RouterLink to="/">Inicio</RouterLink>
      <span>/</span>
      <RouterLink to="/categorias">Categorías</RouterLink>
      <span>/</span>
      <strong style="color:var(--black)">{{ categoria?.nombre ?? '...' }}</strong>
    </div>

    <!-- HEADER -->
    <div class="page-header animate">
      <h1>{{ categoria?.nombre?.toUpperCase() ?? 'CATEGORÍA' }}</h1>
      <p v-if="zapatos">
        {{ zapatos.total }} producto{{ zapatos.total !== 1 ? 's' : '' }} encontrado{{ zapatos.total !== 1 ? 's' : '' }}
        <template v-if="filtros.q"> — búsqueda: <strong>"{{ filtros.q }}"</strong></template>
      </p>
    </div>

    <!-- FILTROS -->
    <div class="filtros-bar animate">
      <div class="search-inline">
        <input
          v-model="filtros.q"
          type="text"
          :placeholder="`Buscar en ${categoria?.nombre ?? 'esta categoría'}...`"
          @keyup.enter="aplicarFiltros"
        />
        <button @click="aplicarFiltros">🔍</button>
      </div>
      <select v-model="filtros.orden" @change="aplicarFiltros">
        <option value="">Ordenar por...</option>
        <option value="precio_asc">Precio: menor a mayor</option>
        <option value="precio_desc">Precio: mayor a menor</option>
        <option value="nombre_asc">Nombre A–Z</option>
      </select>
    </div>

    <!-- CARGANDO -->
    <div v-if="cargando" class="empty-state">
      <span class="emoji">⏳</span>
      <h3>Cargando...</h3>
    </div>

    <!-- GRID -->
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

    <!-- VACÍO -->
    <div v-else class="empty-state animate">
      <span class="emoji">🔍</span>
      <h3>Sin resultados</h3>
      <p>No encontramos productos con ese criterio en <strong>{{ categoria?.nombre }}</strong>.</p>
      <button class="btn-ver" style="margin-top:1.25rem;" @click="limpiarFiltros">
        Ver todos los productos
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getCategoria } from '@/services/api'
import ZapatoCard from '@/components/ZapatoCard.vue'

const route = useRoute()

const categoria   = ref(null)
const zapatos     = ref(null)
const cargando    = ref(true)
const paginaActual = ref(1)

const filtros = reactive({ q: '', orden: '' })

async function cargar(pagina = 1) {
  cargando.value = true
  try {
    const res = await getCategoria(route.params.id, {
      q:      filtros.q     || undefined,
      orden:  filtros.orden || undefined,
      page:   pagina,
    })
    categoria.value   = res.data.categoria
    zapatos.value     = res.data.zapatos
    paginaActual.value = pagina
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
}

function aplicarFiltros() { cargar(1) }

function limpiarFiltros() {
  filtros.q = ''
  filtros.orden = ''
  cargar(1)
}

function cambiarPagina(p) {
  if (p < 1 || p > zapatos.value?.last_page) return
  cargar(p)
}

// Si el usuario navega a otra categoría sin salir de la vista
watch(() => route.params.id, () => cargar(1))

onMounted(() => cargar())
</script>

<style scoped>
.filtros-bar {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.search-inline {
  display: flex;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.search-inline input {
  border: none;
  outline: none;
  padding: .45rem 1rem;
  font-family: var(--font-body);
  font-size: .85rem;
  width: 220px;
  background: var(--white);
}

.search-inline button {
  background: var(--black);
  border: none;
  color: var(--white);
  padding: .45rem .9rem;
  cursor: pointer;
}

select {
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  padding: .45rem .9rem;
  font-family: var(--font-body);
  font-size: .85rem;
  background: var(--white);
  cursor: pointer;
  outline: none;
}

@media (max-width: 600px) {
  .filtros-bar { flex-direction: column; align-items: stretch; }
  .search-inline input { width: 100%; }
}
</style>