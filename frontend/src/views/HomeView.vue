<template>
  <div class="mx-auto p-3 md:p-4" style="max-width: 1280px;">
    <!-- HERO -->
    <section class="border-round p-5 md:p-6 mb-6 flex flex-column md:flex-row align-items-center justify-content-between gap-4 overflow-hidden" style="background: var(--black);">
      <div class="max-w-30rem">
        <span class="text-xs font-semibold uppercase tracking-wide" style="color: var(--accent); letter-spacing: 3px;">
          Nueva colección 2026
        </span>
        <h1 class="my-3" style="font-family: var(--font-display); font-size: clamp(3.5rem, 7vw, 6rem); color: var(--white); line-height: .95; letter-spacing: 3px;">
          EL PASO<br>QUE TE<br>
          <span style="color: var(--accent);">DEFINE</span>
        </h1>
        <p class="mb-4 line-height-3" style="color: rgba(245,242,238,.6);">
          Calzado de calidad para cada estilo de vida.
          Encontrá tu par perfecto entre más de {{ stats.totalZapatos }}+ modelos.
        </p>
        <div class="flex gap-2 flex-wrap">
          <RouterLink to="/categorias">
            <Button label="Ver colección →" style="background: var(--accent); border-color: var(--accent); color: var(--white);" />
          </RouterLink>
          <RouterLink to="/buscar">
            <Button label="Explorar todo" outlined style="color: var(--white); border-color: rgba(245,242,238,.25);" />
          </RouterLink>
        </div>
      </div>

      <div class="flex flex-row md:flex-column gap-4 md:gap-5 text-center md:text-right">
        <div>
          <div style="font-family: var(--font-display); font-size: 3.5rem; color: var(--white); letter-spacing: 2px;">{{ stats.totalZapatos }}+</div>
          <div class="text-xs uppercase" style="letter-spacing: 2px; color: rgba(245,242,238,.4);">Modelos</div>
        </div>
        <div>
          <div style="font-family: var(--font-display); font-size: 3.5rem; color: var(--white); letter-spacing: 2px;">{{ stats.totalMarcas }}</div>
          <div class="text-xs uppercase" style="letter-spacing: 2px; color: rgba(245,242,238,.4);">Marcas</div>
        </div>
        <div>
          <div style="font-family: var(--font-display); font-size: 3.5rem; color: var(--white); letter-spacing: 2px;">{{ stats.totalCategorias }}</div>
          <div class="text-xs uppercase" style="letter-spacing: 2px; color: rgba(245,242,238,.4);">Categorías</div>
        </div>
      </div>
    </section>

    <!-- CATEGORÍAS -->
    <section class="mb-6">
      <div class="flex align-items-end justify-content-between mb-4 pb-2" style="border-bottom: 1.5px solid var(--border);">
        <h2 style="font-family: var(--font-display); font-size: 2.5rem; letter-spacing: 2px;">
          CATEGO<span style="color: var(--accent);">RÍAS</span>
        </h2>
        <RouterLink to="/categorias" class="text-xs font-semibold uppercase text-color-secondary no-underline" style="letter-spacing: 1.5px;">
          Ver todas →
        </RouterLink>
      </div>
      <div class="grid">
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
    </section>

    <!-- BANNER -->
    <section class="border-round p-4 md:p-5 mb-6 flex flex-column md:flex-row align-items-center justify-content-between gap-4 text-center md:text-left" style="background: var(--black);">
      <div>
        <h2 style="font-family: var(--font-display); font-size: 2.8rem; color: var(--white); letter-spacing: 3px;">
          ENVÍO <span style="color: var(--accent);">GRATIS</span>
        </h2>
        <p class="m-0" style="color: rgba(245,242,238,.5);">En compras mayores a ₡25,000 · Entrega en 24–48 horas</p>
      </div>
      <RouterLink to="/buscar">
        <Button label="Comprar ahora →" style="background: var(--accent); border-color: var(--accent); color: var(--white);" />
      </RouterLink>
    </section>

    <!-- DESTACADOS -->
    <section class="mb-6">
      <div class="flex align-items-end justify-content-between mb-4 pb-2" style="border-bottom: 1.5px solid var(--border);">
        <h2 style="font-family: var(--font-display); font-size: 2.5rem; letter-spacing: 2px;">
          DESTA<span style="color: var(--accent);">CADOS</span>
        </h2>
        <RouterLink to="/buscar" class="text-xs font-semibold uppercase text-color-secondary no-underline" style="letter-spacing: 1.5px;">
          Ver todos →
        </RouterLink>
      </div>

      <div v-if="cargando" class="text-center py-8 text-color-secondary">
        <ProgressSpinner />
        <h3 style="font-family: var(--font-display); font-size: 2rem;">Cargando...</h3>
      </div>

      <div v-else-if="destacados.length" class="grid">
        <div v-for="zapato in destacados" :key="zapato.id" class="col-12 sm:col-6 md:col-4 lg:col-3">
          <ZapatoCard :zapato="zapato" />
        </div>
      </div>

      <div v-else class="text-center py-8 text-color-secondary">
        <span class="text-6xl mb-3 block">👟</span>
        <h3 style="font-family: var(--font-display); font-size: 2rem;">Pronto habrá productos</h3>
        <p>Estamos cargando el catálogo.</p>
      </div>
    </section>
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
const stats = ref({ totalZapatos: 30, totalMarcas: 6, totalCategorias: 5 })

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
    stats.value = {
      totalZapatos: res.data.destacados?.length ?? 30,
      totalMarcas: 6,
      totalCategorias: res.data.categorias?.length ?? 5,
    }
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
})
</script>