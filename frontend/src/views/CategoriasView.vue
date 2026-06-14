<template>
  <div>
    <!-- HERO BANNER -->
    <div class="border-round p-5 md:p-6 mb-6 flex justify-content-between align-items-center relative overflow-hidden" style="background: var(--black);">
      <div class="relative z-1">
        <p class="text-xs font-semibold uppercase mb-2" style="color: var(--accent); letter-spacing: 3px;">Nueva Colección 2025</p>
        <h1 class="mb-3" style="font-family: var(--font-display); font-size: 5rem; color: var(--white); letter-spacing: 3px; line-height: 1;">EL PASO<br>PERFECTO</h1>
        <p class="mb-4 line-height-3" style="color: var(--gray); max-width: 380px;">
          Descubre nuestra selección de calzado de las mejores marcas.
          Desde sneakers hasta botas, para cada momento.
        </p>
        <RouterLink to="/categorias">
          <Button label="Ver Categorías →" style="background: var(--black); border-color: var(--white); color: var(--white);" />
        </RouterLink>
      </div>
      <div class="absolute hidden md:block" style="font-size: 10rem; opacity: .07; right: 2rem; top: 50%; transform: translateY(-50%);">👟</div>
    </div>

    <!-- CATEGORÍAS -->
    <div class="mb-5 pb-3" style="border-bottom: 2px solid var(--black);">
      <h1 style="font-family: var(--font-display); font-size: 3.5rem; letter-spacing: 2px; line-height: 1;">CATEGORÍAS</h1>
      <p class="text-color-secondary mt-2 mb-0">Encuentra tu estilo perfecto</p>
    </div>

    <div v-if="cargando" class="text-center py-8 text-color-secondary">
      <ProgressSpinner />
      <h3 style="font-family: var(--font-display); font-size: 2rem;">Cargando...</h3>
    </div>

    <div v-else class="grid">
      <div v-for="cat in categorias" :key="cat.id" class="col-6 md:col-4 lg:col-3">
        <RouterLink :to="`/categorias/${cat.id}`" class="no-underline">
          <Card class="border-round overflow-hidden text-white" :style="`background: ${catGradiente(cat.nombre)};`">
            <template #content>
              <span class="text-4xl mb-2 block">{{ catIcono(cat.nombre) }}</span>
              <div style="font-family: var(--font-display); font-size: 1.6rem; letter-spacing: 2px;">{{ cat.nombre }}</div>
              <div class="text-xs mt-1" style="letter-spacing: 1px; color: rgba(255,255,255,.6);">{{ cat.zapatos_count ?? 0 }} productos</div>
            </template>
          </Card>
        </RouterLink>
      </div>
    </div>

    <!-- DESTACADOS -->
    <template v-if="destacados.length">
      <div class="mb-5 pb-3 mt-7" style="border-bottom: 2px solid var(--black);">
        <h1 style="font-family: var(--font-display); font-size: 3.5rem; letter-spacing: 2px; line-height: 1;">DESTACADOS</h1>
        <p class="text-color-secondary mt-2 mb-0">Los más populares de la temporada</p>
      </div>
      <div class="grid">
        <div v-for="zapato in destacados" :key="zapato.id" class="col-12 sm:col-6 md:col-4 lg:col-3">
          <ZapatoCard :zapato="zapato" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCategorias } from '@/services/api'
import ZapatoCard from '@/components/ZapatoCard.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'

const categorias = ref([])
const destacados = ref([])
const cargando = ref(true)

const catConfig = {
  running: { icono: '🏃', gradiente: 'linear-gradient(135deg, #b89070, #9a7358)' },
  casual: { icono: '👟', gradiente: 'linear-gradient(135deg, #7898b0, #5a7a96)' },
  formal: { icono: '👞', gradiente: 'linear-gradient(135deg, #6a7a7e, #4e5e62)' },
  'deportivo mujer': { icono: '👠', gradiente: 'linear-gradient(135deg, #b07888, #966070)' },
  infantil: { icono: '🧒', gradiente: 'linear-gradient(135deg, #7aaa8e, #5e9070)' },
}
const defaultGradiente = 'linear-gradient(135deg, #909898, #707880)'

function catGradiente(nombre) {
  return catConfig[nombre.toLowerCase()]?.gradiente ?? defaultGradiente
}
function catIcono(nombre) {
  return catConfig[nombre.toLowerCase()]?.icono ?? '👟'
}

onMounted(async () => {
  try {
    const res = await getCategorias()
    categorias.value = res.data.categorias
    destacados.value = res.data.destacados
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
})
</script>