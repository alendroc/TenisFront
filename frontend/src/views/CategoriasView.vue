<template>
  <div>
    <!-- HERO BANNER -->
    <div class="cat-hero animate">
      <div class="cat-hero-content">
        <p class="cat-hero-eyebrow">Nueva Colección 2025</p>
        <h1 class="cat-hero-title">EL PASO<br>PERFECTO</h1>
        <p class="cat-hero-sub">
          Descubre nuestra selección de calzado de las mejores marcas.
          Desde sneakers hasta botas, para cada momento.
        </p>
        <RouterLink to="/categorias" class="btn-ver" style="font-size:.9rem; padding:.65rem 1.5rem;">
          Ver Categorías →
        </RouterLink>
      </div>
      <div class="cat-hero-emoji">👟</div>
    </div>

    <!-- CATEGORÍAS -->
    <div class="page-header animate">
      <h1>CATEGORÍAS</h1>
      <p>Encuentra tu estilo perfecto</p>
    </div>

    <div v-if="cargando" class="empty-state">
      <span class="emoji">⏳</span>
      <h3>Cargando...</h3>
    </div>

    <div v-else class="cat-grid">
      <RouterLink
        v-for="(cat, i) in categorias"
        :key="cat.id"
        :to="`/categorias/${cat.id}`"
        :class="`cat-card animate animate-delay-${(i % 4) + 1} ${catClase(cat.nombre)}`"
      >
        <span class="cat-icon">{{ catIcono(cat.nombre) }}</span>
        <div class="cat-name">{{ cat.nombre }}</div>
        <div class="cat-count">{{ cat.zapatos_count ?? 0 }} productos</div>
      </RouterLink>
    </div>

    <!-- DESTACADOS -->
    <template v-if="destacados.length">
      <div class="page-header animate" style="margin-top:3.5rem;">
        <h1>DESTACADOS</h1>
        <p>Los más populares de la temporada</p>
      </div>
      <div class="cards-grid">
        <ZapatoCard
          v-for="(zapato, i) in destacados"
          :key="zapato.id"
          :zapato="zapato"
          :delay="(i % 4) + 1"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCategorias } from '@/services/api'
import ZapatoCard from '@/components/ZapatoCard.vue'

const categorias = ref([])
const destacados = ref([])
const cargando = ref(true)

const catConfig = {
  running:           { icono: '🏃', clase: 'cat-running' },
  casual:            { icono: '👟', clase: 'cat-casual' },
  formal:            { icono: '👞', clase: 'cat-formal' },
  'deportivo mujer': { icono: '👠', clase: 'cat-deportivo-mujer' },
  infantil:          { icono: '🧒', clase: 'cat-infantil' },
}

function catClase(nombre) {
  return catConfig[nombre.toLowerCase()]?.clase ?? 'cat-default'
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

<style scoped>
.cat-hero {
  background: var(--black);
  border-radius: var(--radius);
  padding: 4rem 3rem;
  margin-bottom: 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  position: relative;
}

.cat-hero-content { position: relative; z-index: 1; }

.cat-hero-eyebrow {
  color: var(--accent);
  font-size: .8rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: .75rem;
}

.cat-hero-title {
  font-family: var(--font-display);
  font-size: 5rem;
  color: var(--white);
  letter-spacing: 3px;
  line-height: 1;
  margin-bottom: 1.25rem;
}

.cat-hero-sub {
  color: var(--gray);
  max-width: 380px;
  margin-bottom: 1.75rem;
  line-height: 1.7;
}

.cat-hero-emoji {
  font-size: 10rem;
  opacity: .07;
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
}

@media (max-width: 768px) {
  .cat-hero { padding: 2.5rem 1.5rem; }
  .cat-hero-title { font-size: 3.5rem; }
  .cat-hero-emoji { display: none; }
}
</style>