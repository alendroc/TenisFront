<template>
  <div>
    <!-- BREADCRUMB -->
    <div class="flex gap-2 align-items-center text-xs uppercase mb-4 text-color-secondary" style="letter-spacing: .5px;">
      <RouterLink to="/" class="text-color-secondary no-underline">Inicio</RouterLink>
      <span>/</span>
      <strong style="color: var(--black);">Admin · Zapatos</strong>
    </div>

    <!-- HEADER -->
    <div class="flex align-items-center justify-content-between mb-5 pb-3" style="border-bottom: 2px solid var(--black);">
      <h1 style="font-family: var(--font-display); font-size: 2.8rem; letter-spacing: 2px;">ZAPATOS</h1>
      <RouterLink to="/admin/zapatos/crear">
        <Button label="+ Nuevo zapato" style="background: var(--accent); border-color: var(--accent); color: var(--white);" />
      </RouterLink>
    </div>

    <!-- ALERT -->
    <Message v-if="mensaje" severity="success" class="mb-4">{{ mensaje }}</Message>

    <!-- FILTROS -->
    <div class="flex gap-3 align-items-center flex-wrap mb-4 p-3 border-round" style="background: var(--cream); border: 1.5px solid var(--border);">
      <InputText v-model="filtros.q" placeholder="Buscar por nombre..." @keyup.enter="aplicarFiltros"  style="background: var(--cream); border: 1.5px solid var(--border); color: var(--black);" />
      <Select v-model="filtros.categoria" :options="categorias" optionLabel="nombre" optionValue="id" placeholder="Todas las categorías" showClear  style="background: var(--cream); border: 1.5px solid var(--border); color: var(--black);"/>
      <Button label="Filtrar" @click="aplicarFiltros" style="background: var(--black); border-color: var(--black); color: var(--white);" />
      <Button v-if="filtros.q || filtros.categoria" label="Limpiar filtros X" text @click="limpiarFiltros" style="color: var(--gray);" />
    </div>

    <!-- TABLA -->
    <DataTable :value="zapatos?.data" :loading="cargando" class="mb-2" >
      <Column field="id" header="#">
        <template #body="{ data }">
          <span class="text-color-secondary text-sm">#{{ String(data.id).padStart(4, '0') }}</span>
        </template>
      </Column>
      <Column header="Imagen">
        <template #body="{ data }">
          <img class="border-round" style="width: 52px; height: 52px; object-fit: cover; background: var(--cream); border: 1px solid var(--border);"
            :src="data.imagen_principal || 'https://via.placeholder.com/52?text=?'"
            :alt="data.nombre" @error="e => e.target.src = 'https://via.placeholder.com/52?text=?'" />
        </template>
      </Column>
      <Column field="nombre" header="Nombre">
        <template #body="{ data }"><span class="font-semibold">{{ data.nombre }}</span></template>
      </Column>
      <Column header="Categoría">
        <template #body="{ data }"><span class="text-color-secondary">{{ data.categoria?.nombre ?? '—' }}</span></template>
      </Column>
      <Column header="Marca">
        <template #body="{ data }"><span class="text-color-secondary">{{ data.marca?.nombre ?? '—' }}</span></template>
      </Column>
      <Column header="Precio">
        <template #body="{ data }">
          <span style="font-family: var(--font-display); font-size: 1.1rem;">${{ Number(data.precio).toFixed(2) }}</span>
        </template>
      </Column>
      <Column header="Estado">
        <template #body="{ data }">
          <Tag :value="data.disponible ? 'Disponible' : 'Agotado'"
            :style="data.disponible ? 'background: #e8f5e9; color: #2e7d32;' : 'background: #fce4ec; color: #c62828;'" />
        </template>
      </Column>
      <Column header="Acciones">
        <template #body="{ data }">
          <div class="flex gap-2 align-items-center">
            <RouterLink :to="`/productos/${data.id}`">
              <Button icon="pi pi-eye" size="small" style="background: var(--black); border-color: var(--black); color: var(--white);" />
            </RouterLink>
            <RouterLink :to="`/admin/zapatos/${data.id}/editar`">
              <Button icon="pi pi-pencil" size="small" style="background: var(--black); border-color: var(--black); color: var(--white);" />
            </RouterLink>
            <Button icon="pi pi-times" size="small" severity="danger" outlined @click="eliminar(data)" />
          </div>
        </template>
      </Column>
      <template #empty>
        <div class="text-center py-5 text-color-secondary">No se encontraron zapatos.</div>
      </template>
    </DataTable>

    <!-- PAGINACIÓN -->
    <template v-if="zapatos?.last_page > 1">
      <div class="flex justify-content-center mt-4">
        <Paginator
          :rows="1"
          :totalRecords="zapatos.last_page"
          :first="paginaActual - 1"
          @page="e => cambiarPagina(e.page + 1)"
        />
      </div>
      <p class="text-sm text-color-secondary text-right mt-2">
        Mostrando {{ zapatos.from }}–{{ zapatos.to }} de {{ zapatos.total }} zapatos
      </p>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getZapatosAdmin, eliminarZapato, getCategorias } from '@/services/api'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import Paginator from 'primevue/paginator'

const route = useRoute()

const zapatos = ref(null)
const categorias = ref([])
const cargando = ref(true)
const paginaActual = ref(1)
const mensaje = ref(route.query.mensaje ?? '')

const filtros = reactive({ q: '', categoria: '' })

async function cargar(pagina = 1) {
  cargando.value = true
  try {
    const res = await getZapatosAdmin({
      q: filtros.q || undefined,
      categoria: filtros.categoria || undefined,
      page: pagina,
    })
    zapatos.value = res.data.zapatos
    categorias.value = res.data.categorias
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
  filtros.categoria = ''
  cargar(1)
}

function cambiarPagina(p) {
  if (p < 1 || p > zapatos.value?.last_page) return
  cargar(p)
}

async function eliminar(zapato) {
  if (!confirm(`¿Eliminar ${zapato.nombre}? Esta acción no se puede deshacer.`)) return
  try {
    await eliminarZapato(zapato.id)
    mensaje.value = `${zapato.nombre} eliminado correctamente.`
    setTimeout(() => mensaje.value = '', 3000)
    cargar(paginaActual.value)
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => cargar())
</script>

