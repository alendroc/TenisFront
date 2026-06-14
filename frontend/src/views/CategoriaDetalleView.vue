<template>
  <div>
    <!-- BREADCRUMB -->
    <div class="flex gap-2 align-items-center text-xs uppercase mb-4 text-color-secondary" style="letter-spacing: .5px;">
      <RouterLink to="/" class="text-color-secondary no-underline">Inicio</RouterLink>
      <span>/</span>
      <RouterLink to="/categorias" class="text-color-secondary no-underline">Categorías</RouterLink>
      <span>/</span>
      <strong style="color: var(--black);">{{ categoria?.nombre ?? '...' }}</strong>
    </div>

    <!-- HEADER -->
    <div class="mb-5 pb-3" style="border-bottom: 2px solid var(--black);">
      <h1 style="font-family: var(--font-display); font-size: 3.5rem; letter-spacing: 2px; line-height: 1;">
        {{ categoria?.nombre?.toUpperCase() ?? 'CATEGORÍA' }}
      </h1>
      <p v-if="zapatos" class="text-color-secondary mt-2 mb-0">
        {{ zapatos.total }} producto{{ zapatos.total !== 1 ? 's' : '' }} encontrado{{ zapatos.total !== 1 ? 's' : '' }}
        <template v-if="filtros.q"> — búsqueda: <strong>"{{ filtros.q }}"</strong></template>
      </p>
    </div>

    <!-- FILTROS -->
    <div class="flex gap-3 align-items-center flex-wrap mb-4">
      <div class="p-inputgroup" style="width: 260px;">
        <InputText v-model="filtros.q" :placeholder="`Buscar en ${categoria?.nombre ?? 'esta categoría'}...`"
          @keyup.enter="aplicarFiltros" />
        <Button icon="pi pi-search" @click="aplicarFiltros" style="background: var(--black); border-color: var(--black); color: var(--white);" />
      </div>
      <Select v-model="filtros.orden" @change="aplicarFiltros"
        :options="[
          { label: 'Ordenar por...', value: '' },
          { label: 'Precio: menor a mayor', value: 'precio_asc' },
          { label: 'Precio: mayor a menor', value: 'precio_desc' },
          { label: 'Nombre A–Z', value: 'nombre_asc' },
        ]"
        optionLabel="label" optionValue="value" style="width: 220px; color: white" />
    </div>

    <!-- CARGANDO -->
    <div v-if="cargando" class="text-center py-8 text-color-secondary">
      <ProgressSpinner />
      <h3 style="font-family: var(--font-display); font-size: 2rem;">Cargando...</h3>
    </div>

    <!-- GRID -->
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

    <!-- VACÍO -->
    <div v-else class="text-center py-8 text-color-secondary">
      <span class="text-6xl mb-3 block">🔍</span>
      <h3 style="font-family: var(--font-display); font-size: 2rem; color: var(--black);">Sin resultados</h3>
      <p>No encontramos productos con ese criterio en <strong>{{ categoria?.nombre }}</strong>.</p>
      <Button label="Ver todos los productos" class="mt-4" @click="limpiarFiltros" style="background: var(--black); border-color: var(--black); color: var(--white);" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getCategoria } from '@/services/api'
import ZapatoCard from '@/components/ZapatoCard.vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Select from 'primevue/select'
import ProgressSpinner from 'primevue/progressspinner'
import Paginator from 'primevue/paginator'

const route = useRoute()

const categoria = ref(null)
const zapatos = ref(null)
const cargando = ref(true)
const paginaActual = ref(1)

const filtros = reactive({ q: '', orden: '' })

async function cargar(pagina = 1) {
  cargando.value = true
  try {
    const res = await getCategoria(route.params.id, {
      q: filtros.q || undefined,
      orden: filtros.orden || undefined,
      page: pagina,
    })
    categoria.value = res.data.categoria
    zapatos.value = res.data.zapatos
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

watch(() => route.params.id, () => cargar(1))

onMounted(() => cargar())
</script>