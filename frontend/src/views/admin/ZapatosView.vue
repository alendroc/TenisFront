<template>
  <div>
    <!-- BREADCRUMB -->
    <div class="breadcrumb animate">
      <RouterLink to="/">Inicio</RouterLink>
      <span>/</span>
      <strong style="color:var(--black)">Admin · Zapatos</strong>
    </div>

    <!-- HEADER -->
    <div class="admin-header animate">
      <h1>ZAPATOS</h1>
      <RouterLink to="/admin/zapatos/crear" class="btn-primary">+ Nuevo zapato</RouterLink>
    </div>

    <!-- ALERT -->
    <div v-if="mensaje" class="alert-success animate">✓ {{ mensaje }}</div>

    <!-- FILTROS -->
    <div class="filters-bar animate">
      <input v-model="filtros.q" type="text" placeholder="Buscar por nombre..." @keyup.enter="aplicarFiltros" />
      <select v-model="filtros.categoria" @change="aplicarFiltros">
        <option value="">Todas las categorías</option>
        <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
          {{ cat.nombre }}
        </option>
      </select>
      <button class="btn-primary" @click="aplicarFiltros">Filtrar</button>

      <a v-if="filtros.q || filtros.categoria" href="#" class="btn-limpiar" @click.prevent="limpiarFiltros">
        Limpiar filtros X
      </a>
    </div>

    <!-- CARGANDO -->
    <div v-if="cargando" class="empty-state">
      <span class="emoji">⏳</span>
      <h3>Cargando...</h3>
    </div>

    <!-- TABLA -->
    <div v-else class="table-wrap animate">
      <table class="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Marca</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="zapato in zapatos?.data" :key="zapato.id">
            <td class="td-id">#{{ String(zapato.id).padStart(4, '0') }}</td>
            <td>
              <img class="thumb" :src="zapato.imagen_principal || 'https://via.placeholder.com/52?text=?'"
                :alt="zapato.nombre" @error="e => e.target.src = 'https://via.placeholder.com/52?text=?'" />
            </td>
            <td class="td-nombre">{{ zapato.nombre }}</td>
            <td class="td-gray">{{ zapato.categoria?.nombre ?? '—' }}</td>
            <td class="td-gray">{{ zapato.marca?.nombre ?? '—' }}</td>
            <td class="td-precio">${{ Number(zapato.precio).toFixed(2) }}</td>
            <td>
              <span :class="zapato.disponible ? 'badge-disponible' : 'badge-agotado'">
                {{ zapato.disponible ? 'Disponible' : 'Agotado' }}
              </span>
            </td>
            <td>
              <div class="acciones">
                <RouterLink :to="`/productos/${zapato.id}`" class="btn-edit" title="Ver">👁</RouterLink>
                <RouterLink :to="`/admin/zapatos/${zapato.id}/editar`" class="btn-edit" title="Editar">✏️</RouterLink>
                <button class="btn-delete" title="Eliminar" @click="eliminar(zapato)">✕</button>
              </div>
            </td>
          </tr>
          <tr v-if="!zapatos?.data?.length">
            <td colspan="8" class="td-empty">No se encontraron zapatos.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- PAGINACIÓN -->
    <template v-if="zapatos?.last_page > 1">
      <div class="pagination-wrap">
        <ul class="pagination">
          <li :class="{ disabled: !zapatos.prev_page_url }">
            <a @click.prevent="cambiarPagina(paginaActual - 1)" href="#">←</a>
          </li>
          <li v-for="p in zapatos.last_page" :key="p" :class="{ active: p === paginaActual }">
            <a @click.prevent="cambiarPagina(p)" href="#">{{ p }}</a>
          </li>
          <li :class="{ disabled: !zapatos.next_page_url }">
            <a @click.prevent="cambiarPagina(paginaActual + 1)" href="#">→</a>
          </li>
        </ul>
      </div>
      <p class="pag-info">
        Mostrando {{ zapatos.from }}–{{ zapatos.to }} de {{ zapatos.total }} zapatos
      </p>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getZapatosAdmin, eliminarZapato, getCategorias } from '@/services/api'

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

<style scoped>
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--black);
}

.admin-header h1 {
  font-family: var(--font-display);
  font-size: 2.8rem;
  letter-spacing: 2px;
}

.btn-primary {
  background: var(--accent);
  color: var(--white);
  text-decoration: none;
  font-size: .8rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: .6rem 1.4rem;
  border-radius: var(--radius);
  border: none;
  cursor: pointer;
  transition: background .2s;
  display: inline-block;
}

.btn-primary:hover {
  background: #a83f1f;
}

.alert-success {
  background: #e8f5e9;
  color: #2e7d32;
  padding: .85rem 1.25rem;
  border-radius: var(--radius);
  font-size: .88rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  border-left: 4px solid #2e7d32;
}

.filters-bar {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  background: var(--cream);
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
}

.filters-bar input,
.filters-bar select {
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  padding: .4rem .85rem;
  font-family: var(--font-body);
  font-size: .85rem;
  background: var(--white);
  outline: none;
  transition: border-color .2s;
}

.filters-bar input:focus,
.filters-bar select:focus {
  border-color: var(--black);
}

.btn-limpiar {
  font-size: .82rem;
  color: var(--gray);
  text-decoration: none;
}

.btn-limpiar:hover {
  color: var(--accent);
}

.table-wrap {
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: .88rem;
}

.admin-table thead tr {
  background: var(--black);
  color: var(--white);
}

.admin-table th {
  padding: .75rem 1rem;
  text-align: left;
  font-size: .72rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-weight: 600;
}

.admin-table td {
  padding: .75rem 1rem;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.admin-table tbody tr:hover {
  background: var(--cream);
}

.admin-table tbody tr:last-child td {
  border-bottom: none;
}

.thumb {
  width: 52px;
  height: 52px;
  object-fit: cover;
  border-radius: 4px;
  background: var(--cream);
  border: 1px solid var(--border);
}

.td-id {
  color: var(--gray);
  font-size: .78rem;
}

.td-nombre {
  font-weight: 600;
}

.td-gray {
  color: var(--gray);
}

.td-precio {
  font-family: var(--font-display);
  font-size: 1.1rem;
}

.td-empty {
  text-align: center;
  padding: 3rem;
  color: var(--gray);
}

.badge-disponible {
  background: #e8f5e9;
  color: #2e7d32;
  font-size: .7rem;
  font-weight: 700;
  padding: .2rem .6rem;
  border-radius: 2px;
  letter-spacing: .5px;
}

.badge-agotado {
  background: #fce4ec;
  color: #c62828;
  font-size: .7rem;
  font-weight: 700;
  padding: .2rem .6rem;
  border-radius: 2px;
  letter-spacing: .5px;
}

.acciones {
  display: flex;
  gap: .5rem;
  align-items: center;
}

.btn-edit {
  background: var(--black);
  color: var(--white);
  text-decoration: none;
  font-size: .75rem;
  font-weight: 600;
  padding: .35rem .8rem;
  border-radius: var(--radius);
  border: none;
  cursor: pointer;
  transition: background .2s;
  display: inline-block;
}

.btn-edit:hover {
  background: #333;
}

.btn-delete {
  background: transparent;
  color: var(--accent);
  font-size: .75rem;
  font-weight: 600;
  padding: .35rem .8rem;
  border-radius: var(--radius);
  border: 1.5px solid var(--accent);
  cursor: pointer;
  transition: all .2s;
}

.btn-delete:hover {
  background: var(--accent);
  color: var(--white);
}

.pag-info {
  color: var(--gray);
  font-size: .8rem;
  margin-top: 1rem;
  text-align: right;
}

@media (max-width: 768px) {
  .filters-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .admin-table {
    font-size: .78rem;
  }

  .admin-table th,
  .admin-table td {
    padding: .5rem .6rem;
  }
}
</style>