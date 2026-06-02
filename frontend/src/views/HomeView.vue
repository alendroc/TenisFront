<template>
  <div>
    <!-- HERO -->
    <section class="hero animate animate-delay-1">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <span class="hero-eyebrow">Nueva colección 2026</span>
        <h1 class="hero-title">EL PASO<br>QUE TE<br><span>DEFINE</span></h1>
        <p class="hero-subtitle">
          Calzado de calidad para cada estilo de vida.
          Encontrá tu par perfecto entre más de {{ stats.totalZapatos }}+ modelos.
        </p>
        <div class="hero-btns">
          <RouterLink to="/categorias" class="hero-cta">Ver colección →</RouterLink>
          <RouterLink to="/buscar" class="hero-cta-secondary">Explorar todo</RouterLink>
        </div>
      </div>
      <div class="hero-stats">
        <div>
          <div class="hero-stat-number">{{ stats.totalZapatos }}+</div>
          <div class="hero-stat-label">Modelos</div>
        </div>
        <div class="hero-divider"></div>
        <div>
          <div class="hero-stat-number">{{ stats.totalMarcas }}</div>
          <div class="hero-stat-label">Marcas</div>
        </div>
        <div class="hero-divider"></div>
        <div>
          <div class="hero-stat-number">{{ stats.totalCategorias }}</div>
          <div class="hero-stat-label">Categorías</div>
        </div>
      </div>
    </section>

    <!-- CATEGORÍAS -->
    <section class="section-categorias">
      <div class="section-header">
        <h2 class="section-title">CATEGO<span>RÍAS</span></h2>
        <RouterLink to="/categorias" class="section-link">Ver todas →</RouterLink>
      </div>
      <div class="cat-grid">
        <RouterLink v-for="(cat, i) in categorias" :key="cat.id" :to="`/categorias/${cat.id}`"
          :class="`cat-card animate animate-delay-${(i % 4) + 1} ${catClase(cat.nombre)}`">
          <span class="cat-icon">{{ catIcono(cat.nombre) }}</span>
          <div class="cat-name">{{ cat.nombre }}</div>
          <div class="cat-count">{{ cat.zapatos_count ?? 0 }} productos</div>
        </RouterLink>
      </div>
    </section>

    <!-- BANNER -->
    <div class="banner-mid animate animate-delay-2">
      <div class="banner-mid-text">
        <h2>ENVÍO <span>GRATIS</span></h2>
        <p>En compras mayores a ₡25,000 · Entrega en 24–48 horas</p>
      </div>
      <div class="banner-mid-cta">
        <RouterLink to="/buscar" class="hero-cta">Comprar ahora →</RouterLink>
      </div>
    </div>

    <!-- DESTACADOS -->
    <section class="section-productos">
      <div class="section-header">
        <h2 class="section-title">DESTA<span>CADOS</span></h2>
        <RouterLink to="/buscar" class="section-link">Ver todos →</RouterLink>
      </div>
      <div v-if="cargando" class="empty-state">
        <span class="emoji">⏳</span>
        <h3>Cargando...</h3>
      </div>
      <div v-else-if="destacados.length" class="cards-grid">
        <ZapatoCard v-for="(zapato, i) in destacados" :key="zapato.id" :zapato="zapato" :delay="(i % 4) + 1" />
      </div>
      <div v-else class="empty-state" style="grid-column: 1/-1;">
        <span class="emoji">👟</span>
        <h3>Pronto habrá productos</h3>
        <p>Estamos cargando el catálogo.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCategorias } from '@/services/api'
import ZapatoCard from '@/components/ZapatoCard.vue'

const categorias = ref([])
const destacados = ref([])
const cargando = ref(true)
const stats = ref({ totalZapatos: 30, totalMarcas: 6, totalCategorias: 5 })

const catConfig = {
  running: { icono: '🏃', clase: 'cat-running' },
  casual: { icono: '👟', clase: 'cat-casual' },
  formal: { icono: '👞', clase: 'cat-formal' },
  'deportivo mujer': { icono: '👠', clase: 'cat-deportivo-mujer' },
  infantil: { icono: '🧒', clase: 'cat-infantil' },
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

<style scoped>
.hero {
  position: relative;
  background: var(--black);
  border-radius: var(--radius);
  overflow: hidden;
  padding: 5rem 3.5rem;
  margin-bottom: 4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  min-height: 380px;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 80% 50%, rgba(200, 80, 42, .18) 0%, transparent 60%),
    radial-gradient(ellipse at 10% 80%, rgba(42, 76, 143, .15) 0%, transparent 50%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 520px;
}

.hero-eyebrow {
  font-size: .75rem;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 1rem;
  display: block;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(3.5rem, 7vw, 6rem);
  color: var(--white);
  line-height: .95;
  letter-spacing: 3px;
  margin-bottom: 1.2rem;
}

.hero-title span {
  color: var(--accent);
}

.hero-subtitle {
  color: rgba(245, 242, 238, .6);
  font-size: 1rem;
  line-height: 1.7;
  margin-bottom: 2rem;
  max-width: 400px;
}

.hero-btns {
  display: flex;
  gap: .75rem;
  flex-wrap: wrap;
}

.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: .6rem;
  background: var(--accent);
  color: var(--white);
  text-decoration: none;
  font-size: .85rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: .85rem 2rem;
  border-radius: var(--radius);
  transition: background .2s, transform .2s;
}

.hero-cta:hover {
  background: #a83f1f;
  transform: translateY(-2px);
}

.hero-cta-secondary {
  display: inline-flex;
  align-items: center;
  gap: .6rem;
  background: transparent;
  color: var(--white);
  text-decoration: none;
  font-size: .85rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: .85rem 2rem;
  border-radius: var(--radius);
  border: 1.5px solid rgba(245, 242, 238, .25);
  transition: border-color .2s, transform .2s;
}

.hero-cta-secondary:hover {
  border-color: var(--white);
  transform: translateY(-2px);
}

.hero-stats {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: right;
}

.hero-stat-number {
  font-family: var(--font-display);
  font-size: 3.5rem;
  color: var(--white);
  line-height: 1;
  letter-spacing: 2px;
}

.hero-stat-label {
  font-size: .72rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(245, 242, 238, .4);
  margin-top: .1rem;
}

.hero-divider {
  width: 1px;
  height: 60px;
  background: rgba(245, 242, 238, .15);
  margin-left: auto;
}

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 1.75rem;
  padding-bottom: 1rem;
  border-bottom: 1.5px solid var(--border);
}

.section-title {
  font-family: var(--font-display);
  font-size: 2.5rem;
  letter-spacing: 2px;
  line-height: 1;
}

.section-title span {
  color: var(--accent);
}

.section-link {
  font-size: .78rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--gray);
  text-decoration: none;
  transition: color .2s;
  white-space: nowrap;
}

.section-link:hover {
  color: var(--accent);
}

.section-categorias {
  margin-bottom: 4.5rem;
}

.section-productos {
  margin-bottom: 4rem;
}

.banner-mid {
  background: var(--black);
  border-radius: var(--radius);
  padding: 3rem 3.5rem;
  margin: 4rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  position: relative;
  overflow: hidden;
}

.banner-mid::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 100% 50%, rgba(42, 76, 143, .25) 0%, transparent 60%);
}

.banner-mid-text {
  position: relative;
  z-index: 1;
}

.banner-mid-text h2 {
  font-family: var(--font-display);
  font-size: 2.8rem;
  color: var(--white);
  letter-spacing: 3px;
  line-height: 1;
  margin-bottom: .5rem;
}

.banner-mid-text h2 span {
  color: var(--accent);
}

.banner-mid-text p {
  color: rgba(245, 242, 238, .5);
  font-size: .9rem;
}

.banner-mid-cta {
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    padding: 3rem 1.5rem;
    text-align: center;
  }

  .hero-stats {
    flex-direction: row;
    text-align: center;
  }

  .hero-divider {
    width: 60px;
    height: 1px;
    margin: 0 auto;
  }

  .hero-btns {
    justify-content: center;
  }

  .banner-mid {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1.5rem;
  }
}
</style>