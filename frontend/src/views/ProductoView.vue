<template>
  <div>
    <!-- BREADCRUMB -->
    <div class="breadcrumb animate">
      <RouterLink to="/">Inicio</RouterLink>
      <span>/</span>
      <RouterLink to="/categorias">Categorías</RouterLink>
      <span>/</span>
      <RouterLink v-if="zapato" :to="`/categorias/${zapato.categoria_id}`">
        {{ zapato.categoria?.nombre ?? 'Categoría' }}
      </RouterLink>
      <span>/</span>
      <strong style="color:var(--black)">{{ zapato?.nombre ?? '...' }}</strong>
    </div>

    <!-- BARRA ADMIN -->
    <div class="admin-actions-bar animate">
      <span>⚙ Administrar producto</span>
      <div class="admin-actions-btns">
        <RouterLink to="/admin/zapatos" class="btn-admin-edit">☰ Todos los zapatos</RouterLink>
        <RouterLink v-if="zapato" :to="`/admin/zapatos/${zapato.id}/editar`" class="btn-admin-edit">Editar</RouterLink>
        <button class="btn-admin-delete" @click="eliminar">✕ Eliminar</button>
      </div>
    </div>

    <!-- CARGANDO -->
    <div v-if="cargando" class="empty-state">
      <span class="emoji">⏳</span>
      <h3>Cargando...</h3>
    </div>

    <!-- DETALLE -->
    <div v-else-if="zapato" class="detail-grid animate">

      <!-- IMAGEN -->
      <div class="detail-img-wrap">
        <div class="detail-img-box">
          <img :src="zapato.imagen_principal || 'https://via.placeholder.com/600?text=Sin+imagen'" :alt="zapato.nombre"
            @error="e => e.target.src = 'https://via.placeholder.com/600?text=Sin+imagen'" />
        </div>
        <div class="detail-badges">
          <span v-if="zapato.disponible" class="badge-stock ok">✓ En stock</span>
          <span v-else class="badge-stock no">✗ Agotado</span>
          <span class="badge-id">ID: #{{ String(zapato.id).padStart(4, '0') }}</span>
        </div>
      </div>

      <!-- INFO -->
      <div class="detail-info">
        <p class="detail-marca">{{ zapato.marca?.nombre ?? 'Marca' }}</p>
        <h1 class="detail-nombre">{{ zapato.nombre?.toUpperCase() }}</h1>
        <p class="detail-desc">{{ zapato.descripcion }}</p>

        <div class="detail-precio">
          ${{ Number(zapato.precio).toFixed(2) }}
        </div>

        <!-- ESPECIFICACIONES -->
        <div class="specs-box">
          <div class="specs-header">ESPECIFICACIONES</div>
          <div v-for="(valor, label) in specs" :key="label" class="spec-row">
            <span class="spec-label">{{ label }}</span>
            <span class="spec-valor">{{ valor ?? '—' }}</span>
          </div>
        </div>

        <!-- TALLAS -->
        <div v-if="zapato.tallas?.length" class="tallas-wrap">
          <p class="tallas-label">Tallas disponibles</p>
          <div class="tallas-grid">
            <span v-for="talla in zapato.tallas" :key="talla.id"
              :class="['talla-chip', { agotada: talla.stock === 0 }]">
              US {{ talla.talla_us }}
              <span class="talla-eu">/ EU {{ talla.talla_eu }}</span>
            </span>
          </div>
        </div>

        <!-- ACCIONES -->
        <div class="detail-acciones">
          <button v-if="zapato.disponible" class="btn-ver" style="flex:1; padding:.75rem; text-align:center;">
            Agregar al carrito
          </button>
          <button v-else disabled class="btn-disabled">No disponible</button>

          <RouterLink :to="`/categorias/${zapato.categoria_id}`" class="btn-ver btn-outline">
            ← Ver más
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- RELACIONADOS -->
    <template v-if="relacionados.length">
      <div class="page-header" style="margin-top:4rem;">
        <h1>MÁS EN ESTA CATEGORÍA</h1>
      </div>
      <div class="cards-grid">
        <ZapatoCard v-for="(rel, i) in relacionados" :key="rel.id" :zapato="rel" :delay="(i % 4) + 1" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getZapato, eliminarZapato } from '@/services/api'
import ZapatoCard from '@/components/ZapatoCard.vue'

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

<style scoped>
.admin-actions-bar {
  background: #fff8f0;
  border: 1.5px solid #f0d9c8;
  border-radius: var(--radius);
  padding: .75rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.admin-actions-bar span {
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--accent);
}

.admin-actions-btns {
  display: flex;
  gap: .6rem;
  flex-wrap: wrap;
}

.btn-admin-edit {
  background: var(--black);
  color: var(--white);
  text-decoration: none;
  font-size: .75rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: .45rem 1rem;
  border-radius: var(--radius);
  border: none;
  cursor: pointer;
  transition: background .2s;
  display: inline-block;
}

.btn-admin-edit:hover {
  background: #333;
}

.btn-admin-delete {
  background: transparent;
  color: #c62828;
  font-size: .75rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: .45rem 1rem;
  border-radius: var(--radius);
  border: 1.5px solid #c62828;
  cursor: pointer;
  transition: all .2s;
}

.btn-admin-delete:hover {
  background: #c62828;
  color: var(--white);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

.detail-img-wrap {
  position: sticky;
  top: 80px;
}

.detail-img-box {
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--cream);
}

.detail-img-box img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}

.detail-badges {
  margin-top: 1rem;
  display: flex;
  gap: .75rem;
  align-items: center;
}

.badge-stock {
  font-size: .78rem;
  font-weight: 600;
  padding: .3rem .8rem;
  border-radius: 2px;
  letter-spacing: .5px;
}

.badge-stock.ok {
  background: #e8f5e9;
  color: #2e7d32;
}

.badge-stock.no {
  background: #fce4ec;
  color: #c62828;
}

.badge-id {
  color: var(--gray);
  font-size: .8rem;
}

.detail-marca {
  font-size: .75rem;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: .5rem;
}

.detail-nombre {
  font-family: var(--font-display);
  font-size: 3rem;
  letter-spacing: 2px;
  line-height: 1.1;
  margin-bottom: 1rem;
}

.detail-desc {
  color: var(--gray);
  line-height: 1.8;
  margin-bottom: 1.75rem;
  font-size: .95rem;
}

.detail-precio {
  font-family: var(--font-display);
  font-size: 3.5rem;
  letter-spacing: 2px;
  margin-bottom: 1.75rem;
}

.specs-box {
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 2rem;
}

.specs-header {
  background: var(--black);
  padding: .6rem 1rem;
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--white);
  letter-spacing: 2px;
}

.spec-row {
  display: flex;
  justify-content: space-between;
  padding: .75rem 1rem;
  border-bottom: 1px solid var(--border);
  font-size: .88rem;
}

.spec-row:last-child {
  border-bottom: none;
}

.spec-label {
  color: var(--gray);
  font-weight: 500;
}

.spec-valor {
  font-weight: 600;
}

.tallas-label {
  font-size: .75rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--gray);
  margin-bottom: .75rem;
}

.tallas-grid {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  margin-bottom: 2rem;
}

.talla-chip {
  border: 1.5px solid var(--black);
  color: var(--black);
  font-size: .82rem;
  font-weight: 600;
  padding: .35rem .75rem;
  border-radius: var(--radius);
}

.talla-chip.agotada {
  border-color: var(--border);
  color: var(--gray);
  text-decoration: line-through;
}

.talla-eu {
  font-size: .7rem;
  color: var(--gray);
}

.detail-acciones {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-disabled {
  flex: 1;
  padding: .75rem;
  font-size: .88rem;
  background: var(--border);
  color: var(--gray);
  border: none;
  border-radius: var(--radius);
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  color: var(--black);
  border: 1.5px solid var(--black);
}

.btn-outline:hover {
  background: var(--black);
  color: var(--white);
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-img-wrap {
    position: static;
  }

  .detail-nombre {
    font-size: 2.2rem;
  }
}
</style>