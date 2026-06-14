<template>
  <div>
    <!-- BREADCRUMB -->
    <div class="flex gap-2 align-items-center text-xs uppercase mb-4 text-color-secondary flex-wrap" style="letter-spacing: .5px;">
      <RouterLink to="/" class="text-color-secondary no-underline">Inicio</RouterLink>
      <span>/</span>
      <RouterLink to="/categorias" class="text-color-secondary no-underline">Categorías</RouterLink>
      <span>/</span>
      <RouterLink v-if="zapato" :to="`/categorias/${zapato.categoria_id}`" class="text-color-secondary no-underline">
        {{ zapato.categoria?.nombre ?? 'Categoría' }}
      </RouterLink>
      <span>/</span>
      <strong style="color: var(--black);">{{ zapato?.nombre ?? '...' }}</strong>
    </div>

    <!-- BARRA ADMIN -->
    <div class="flex align-items-center justify-content-between gap-3 flex-wrap mb-4 p-3 border-round" style="background: #fff8f0; border: 1.5px solid #f0d9c8;">
      <span class="text-xs font-bold uppercase" style="letter-spacing: 1.5px; color: var(--accent);">⚙ Administrar producto</span>
      <div class="flex gap-2 flex-wrap">
        <RouterLink to="/admin/zapatos">
          <Button label="☰ Todos los zapatos" size="small" style="background: var(--black); border-color: var(--black); color: var(--white);" />
        </RouterLink>
        <RouterLink v-if="zapato" :to="`/admin/zapatos/${zapato.id}/editar`">
          <Button label="Editar" size="small" style="background: var(--black); border-color: var(--black); color: var(--white);" />
        </RouterLink>
        <Button label="✕ Eliminar" size="small" severity="danger" outlined @click="eliminar" />
      </div>
    </div>

    <!-- CARGANDO -->
    <div v-if="cargando" class="text-center py-8 text-color-secondary">
      <ProgressSpinner />
      <h3 style="font-family: var(--font-display); font-size: 2rem;">Cargando...</h3>
    </div>

    <!-- DETALLE -->
    <div v-else-if="zapato" class="grid">

      <!-- IMAGEN -->
      <div class="col-12 md:col-6">
        <div class="border-round overflow-hidden" style="border: 1.5px solid var(--border); background: var(--cream);">
          <img class="w-full block" style="aspect-ratio: 1; object-fit: cover;"
            :src="zapato.imagen_principal || 'https://via.placeholder.com/600?text=Sin+imagen'" :alt="zapato.nombre"
            @error="e => e.target.src = 'https://via.placeholder.com/600?text=Sin+imagen'" />
        </div>
        <div class="flex gap-3 align-items-center mt-3">
          <Tag v-if="zapato.disponible" value="✓ En stock" style="background: #e8f5e9; color: #2e7d32;" />
          <Tag v-else value="✗ Agotado" style="background: #fce4ec; color: #c62828;" />
          <span class="text-sm text-color-secondary">ID: #{{ String(zapato.id).padStart(4, '0') }}</span>
        </div>
      </div>

      <!-- INFO -->
      <div class="col-12 md:col-6">
        <p class="text-xs font-bold uppercase mb-2" style="letter-spacing: 3px; color: var(--accent);">{{ zapato.marca?.nombre ?? 'Marca' }}</p>
        <h1 class="mb-3" style="font-family: var(--font-display); font-size: 3rem; letter-spacing: 2px; line-height: 1.1;">{{ zapato.nombre?.toUpperCase() }}</h1>
        <p class="mb-4 line-height-3 text-color-secondary">{{ zapato.descripcion }}</p>

        <div class="mb-4" style="font-family: var(--font-display); font-size: 3.5rem; letter-spacing: 2px;">
          ${{ Number(zapato.precio).toFixed(2) }}
        </div>

        <!-- ESPECIFICACIONES -->
        <div class="border-round overflow-hidden mb-5" style="border: 1.5px solid var(--border);">
          <div class="p-2 px-3" style="background: var(--black); font-family: var(--font-display); font-size: 1.1rem; color: var(--white); letter-spacing: 2px;">
            ESPECIFICACIONES
          </div>
          <div v-for="(valor, label) in specs" :key="label" class="flex justify-content-between p-3 text-sm" style="border-bottom: 1px solid var(--border);">
            <span class="text-color-secondary font-medium">{{ label }}</span>
            <span class="font-semibold">{{ valor ?? '—' }}</span>
          </div>
        </div>

        <!-- TALLAS -->
        <div v-if="zapato.tallas?.length" class="mb-5">
          <p class="text-xs font-bold uppercase mb-3 text-color-secondary" style="letter-spacing: 1.5px;">Tallas disponibles</p>
          <div class="flex flex-wrap gap-2">
            <Tag v-for="talla in zapato.tallas" :key="talla.id"
              :value="`US ${talla.talla_us} / EU ${talla.talla_eu}`"
              :style="talla.stock === 0
                ? 'background: transparent; border: 1.5px solid var(--border); color: var(--gray); text-decoration: line-through;'
                : 'background: transparent; border: 1.5px solid var(--black); color: var(--black);'" />
          </div>
        </div>

        <!-- ACCIONES -->
        <div class="flex gap-3 flex-wrap">
          <Button v-if="zapato.disponible" label="Agregar al carrito" class="flex-1" style="background: var(--black); border-color: var(--black); color: var(--white);" />
          <Button v-else label="No disponible" disabled class="flex-1" />

          <RouterLink :to="`/categorias/${zapato.categoria_id}`">
            <Button label="← Ver más" outlined style="color: var(--black); border-color: var(--black);" />
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- RELACIONADOS -->
    <template v-if="relacionados.length">
      <div class="mb-5 pb-3 mt-7" style="border-bottom: 2px solid var(--black);">
        <h1 style="font-family: var(--font-display); font-size: 3.5rem; letter-spacing: 2px; line-height: 1;">MÁS EN ESTA CATEGORÍA</h1>
      </div>
      <div class="grid">
        <div v-for="rel in relacionados" :key="rel.id" class="col-12 sm:col-6 md:col-4 lg:col-3">
          <ZapatoCard :zapato="rel" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getZapato, eliminarZapato } from '@/services/api'
import ZapatoCard from '@/components/ZapatoCard.vue'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'

const route = useRoute()
const router = useRouter()

const zapato = ref(null)
const relacionados = ref([])
const cargando = ref(true)

const specs = computed(() => zapato.value ? {
  'Estilo': zapato.value.estilo,
  'Material': zapato.value.material,
  'Color': zapato.value.color_principal,
  'Categoría': zapato.value.categoria?.nombre,
  'Marca': zapato.value.marca?.nombre,
} : {})

async function cargar() {
  cargando.value = true
  try {
    const res = await getZapato(route.params.id)
    zapato.value = res.data.zapato
    relacionados.value = res.data.relacionados ?? []
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
}

async function eliminar() {
  if (!confirm(`¿Eliminar ${zapato.value?.nombre}? Esta acción no se puede deshacer.`)) return
  try {
    await eliminarZapato(zapato.value.id)
    router.push('/admin/zapatos')
  } catch (e) {
    console.error(e)
  }
}

watch(() => route.params.id, () => cargar())
onMounted(() => cargar())
</script>