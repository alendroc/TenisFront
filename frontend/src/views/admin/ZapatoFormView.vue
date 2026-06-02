<template>
  <div>
    <!-- BREADCRUMB -->
    <div class="breadcrumb animate">
      <RouterLink to="/">Inicio</RouterLink>
      <span>/</span>
      <RouterLink to="/admin/zapatos">Admin · Zapatos</RouterLink>
      <span>/</span>
      <strong style="color:var(--black)">{{ esEdicion ? 'Editar' : 'Nuevo' }}</strong>
    </div>

    <!-- HEADER -->
    <div class="page-header animate">
      <h1>{{ esEdicion ? 'EDITAR ZAPATO' : 'NUEVO ZAPATO' }}</h1>
      <p v-if="esEdicion && zapato">ID #{{ String(zapato.id).padStart(4, '0') }} · {{ zapato.nombre }}</p>
      <p v-else>Completá los campos para agregar un producto al catálogo.</p>
    </div>

    <!-- INFORMACIÓN BÁSICA -->
    <div class="form-card animate animate-delay-1">
      <div class="form-card-header"><span>INFORMACIÓN BÁSICA</span></div>
      <div class="form-card-body">
        <div class="form-grid">
          <div class="form-group full">
            <label>Nombre *</label>
            <input v-model="form.nombre" type="text" placeholder="Ej: Nike Air Max 270" />
            <span v-if="errores.nombre" class="error-msg">{{ errores.nombre }}</span>
          </div>
          <div class="form-group">
            <label>Categoría *</label>
            <select v-model="form.categoria_id">
              <option value="">Seleccioná una categoría</option>
              <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
            </select>
            <span v-if="errores.categoria_id" class="error-msg">{{ errores.categoria_id }}</span>
          </div>
          <div class="form-group">
            <label>Marca *</label>
            <select v-model="form.marca_id">
              <option value="">Seleccioná una marca</option>
              <option v-for="marca in marcas" :key="marca.id" :value="marca.id">{{ marca.nombre }}</option>
            </select>
            <span v-if="errores.marca_id" class="error-msg">{{ errores.marca_id }}</span>
          </div>
          <div class="form-group full">
            <label>Descripción</label>
            <textarea v-model="form.descripcion" placeholder="Describí el producto..."></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- DETALLES -->
    <div class="form-card animate animate-delay-2">
      <div class="form-card-header"><span>DETALLES DEL PRODUCTO</span></div>
      <div class="form-card-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Precio (USD) *</label>
            <input v-model="form.precio" type="number" step="0.01" min="0" placeholder="0.00" />
            <span v-if="errores.precio" class="error-msg">{{ errores.precio }}</span>
          </div>
          <div class="form-group">
            <label>Estilo</label>
            <input v-model="form.estilo" type="text" placeholder="Ej: Running, Oxford" />
          </div>
          <div class="form-group">
            <label>Material</label>
            <input v-model="form.material" type="text" placeholder="Ej: Cuero, Malla" />
          </div>
          <div class="form-group">
            <label>Color principal</label>
            <input v-model="form.color_principal" type="text" placeholder="Ej: Negro, Blanco/Rojo" />
          </div>
          <div class="form-group">
            <label>Imagen principal (URL)</label>
            <input v-model="form.imagen_principal" type="text" placeholder="https://..." />
            <div v-if="form.imagen_principal" style="margin-top:.75rem;">
              <img :src="form.imagen_principal" style="max-width:220px; border-radius:8px; border:1px solid #ddd;"
                @error="e => e.target.style.display = 'none'" />
            </div>
          </div>
          <div class="form-group" style="justify-content:flex-end; padding-bottom:.2rem;">
            <label>Disponibilidad</label>
            <div class="toggle-wrap">
              <input v-model="form.disponible" type="checkbox" id="disponible" />
              <label for="disponible" class="toggle-label">Disponible para la venta</label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TALLAS -->
    <div class="form-card animate animate-delay-3">
      <div class="form-card-header"><span>TALLAS Y STOCK</span></div>
      <div class="form-card-body">
        <div class="tallas-header">
          <label>Talla US</label>
          <label>Talla EU</label>
          <label>Stock</label>
          <span></span>
        </div>
        <div v-for="(talla, i) in tallas" :key="i" class="talla-row">
          <input v-model="talla.talla_us" type="number" step="0.5" min="1" placeholder="Ej: 9.5" />
          <input v-model="talla.talla_eu" type="number" step="0.5" min="30" placeholder="Ej: 43" />
          <input v-model="talla.stock" type="number" min="0" placeholder="Ej: 10" />
          <button type="button" class="btn-remove-talla" @click="removeTalla(i)"
            :disabled="tallas.length === 1">✕</button>
        </div>
        <button type="button" class="btn-add" @click="addTalla">+ Agregar talla</button>
      </div>
    </div>

    <!-- DANGER ZONE (solo edición) -->
    <div v-if="esEdicion" class="danger-zone animate">
      <div>
        <strong>Eliminar este zapato</strong>
        <p>Esta acción es permanente y eliminará también todas sus tallas e imágenes.</p>
      </div>
      <button class="btn-danger" @click="eliminar">Eliminar zapato</button>
    </div>

    <!-- BOTONES -->
    <div class="form-btns animate animate-delay-4">
      <RouterLink to="/admin/zapatos" class="btn-cancel">Cancelar</RouterLink>
      <button class="btn-primary" @click="guardar" :disabled="guardando">
        {{ guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Guardar zapato' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getZapato, crearZapato, actualizarZapato, eliminarZapato,
  getCategorias, getMarcas, crearTalla, actualizarTalla, eliminarTalla,
} from '@/services/api'

const route = useRoute()
const router = useRouter()

const esEdicion = computed(() => !!route.params.id)
const zapato = ref(null)
const categorias = ref([])
const marcas = ref([])
const guardando = ref(false)
const errores = ref({})

const form = reactive({
  nombre: '', categoria_id: '', marca_id: '',
  descripcion: '', precio: '', estilo: '',
  material: '', color_principal: '',
  imagen_principal: '', disponible: true,
})
const tallasEliminadas = ref([])
const tallas = ref([{ talla_us: '', talla_eu: '', stock: '' }])

function addTalla() {
  tallas.value.push({ talla_us: '', talla_eu: '', stock: '' })
}

function removeTalla(i) {
  if (tallas.value.length > 1) {
    const talla = tallas.value[i]
    if (talla.id) {
      tallasEliminadas.value.push(talla.id)
    }
    tallas.value.splice(i, 1)
  }
}

async function cargarDatos() {
  try {
    const [catsRes, marcasRes] = await Promise.all([getCategorias(), getMarcas()])
    categorias.value = catsRes.data.categorias
    marcas.value = marcasRes.data.data  // ← marcas viene paginada

    if (esEdicion.value) {
      const res = await getZapato(route.params.id)
      zapato.value = res.data.zapato
      Object.assign(form, {
        nombre: zapato.value.nombre,
        categoria_id: zapato.value.categoria_id,
        marca_id: zapato.value.marca_id,
        descripcion: zapato.value.descripcion ?? '',
        precio: zapato.value.precio,
        estilo: zapato.value.estilo ?? '',
        material: zapato.value.material ?? '',
        color_principal: zapato.value.color_principal ?? '',
        imagen_principal: zapato.value.imagen_principal ?? '',
        disponible: !!zapato.value.disponible,
      })
      if (zapato.value.tallas?.length) {
        tallas.value = zapato.value.tallas.map(t => ({
          id: t.id, talla_us: t.talla_us, talla_eu: t.talla_eu, stock: t.stock,
        }))
      }
    }
  } catch (e) {
    console.error(e)
  }
}

async function guardar() {
  errores.value = {}
  guardando.value = true
  try {
    const payload = { ...form }

    if (esEdicion.value) {
      // Eliminar tallas borradas
      for (const id of tallasEliminadas.value) {
        await eliminarTalla(id)
      }
      tallasEliminadas.value = []

      await actualizarZapato(route.params.id, payload)
      // Actualizar tallas existentes por separado
      for (const talla of tallas.value) {
        if (talla.id) {
          await actualizarTalla(talla.id, {
            talla_us: talla.talla_us,
            talla_eu: talla.talla_eu,
            stock: talla.stock,
          })
        } else {
          // Talla nueva agregada durante la edición
          await crearTalla(route.params.id, {
            talla_us: talla.talla_us,
            talla_eu: talla.talla_eu,
            stock: talla.stock,
          })
        }
      }
    } else {
      await crearZapato({ ...payload, tallas: tallas.value })
    }

    router.push('/admin/zapatos')
  } catch (e) {
    if (e.response?.status === 422) {
      const msgs = e.response.data.errors
      Object.keys(msgs).forEach(k => errores.value[k] = msgs[k][0])
    }
    console.error(e)
  } finally {
    guardando.value = false
  }
}

async function eliminar() {
  if (!confirm(`¿Eliminar ${zapato.value?.nombre}? Esta acción no se puede deshacer.`)) return
  try {
    await eliminarZapato(route.params.id)
    router.push('/admin/zapatos')
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => cargarDatos())
</script>

<style scoped>
.form-card {
  background: var(--card-bg);
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.form-card-header {
  background: var(--black);
  padding: .7rem 1.25rem;
}

.form-card-header span {
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--white);
  letter-spacing: 2px;
}

.form-card-body {
  padding: 1.5rem 1.25rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: .4rem;
}

.form-group.full {
  grid-column: 1 / -1;
}

label {
  font-size: .75rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--gray);
}

input[type="text"],
input[type="number"],
select,
textarea {
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  padding: .55rem .9rem;
  font-family: var(--font-body);
  font-size: .9rem;
  background: var(--white);
  outline: none;
  transition: border-color .2s;
  width: 100%;
}

input:focus,
select:focus,
textarea:focus {
  border-color: var(--black);
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.error-msg {
  color: var(--accent);
  font-size: .78rem;
  font-weight: 600;
}

.toggle-wrap {
  display: flex;
  align-items: center;
  gap: .75rem;
}

.toggle-wrap input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--black);
}

.toggle-label {
  text-transform: none;
  letter-spacing: 0;
  font-size: .9rem;
  color: var(--black);
  cursor: pointer;
}

.tallas-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: .75rem;
  margin-bottom: .5rem;
}

.talla-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: .75rem;
  align-items: end;
  margin-bottom: .75rem;
}

.btn-remove-talla {
  background: transparent;
  border: 1.5px solid var(--accent);
  color: var(--accent);
  border-radius: var(--radius);
  padding: .5rem .75rem;
  cursor: pointer;
  font-size: .85rem;
  transition: all .2s;
}

.btn-remove-talla:hover:not(:disabled) {
  background: var(--accent);
  color: var(--white);
}

.btn-remove-talla:disabled {
  opacity: .4;
  cursor: not-allowed;
}

.btn-add {
  background: var(--cream);
  border: 1.5px dashed var(--border);
  color: var(--gray);
  border-radius: var(--radius);
  padding: .55rem 1.25rem;
  cursor: pointer;
  font-size: .82rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: border-color .2s, color .2s;
  width: 100%;
  margin-top: .5rem;
}

.btn-add:hover {
  border-color: var(--black);
  color: var(--black);
}

.danger-zone {
  border: 1.5px solid #fce4ec;
  border-radius: var(--radius);
  padding: 1.25rem 1.5rem;
  background: #fff8f8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  gap: 1rem;
}

.danger-zone p {
  font-size: .85rem;
  color: var(--gray);
  margin: 0;
}

.danger-zone strong {
  color: #c62828;
}

.btn-danger {
  background: transparent;
  color: #c62828;
  border: 1.5px solid #c62828;
  font-size: .8rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: .55rem 1.25rem;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all .2s;
  white-space: nowrap;
}

.btn-danger:hover {
  background: #c62828;
  color: var(--white);
}

.form-btns {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: .5rem;
}

.btn-primary {
  background: var(--accent);
  color: var(--white);
  font-size: .85rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: .75rem 2rem;
  border-radius: var(--radius);
  border: none;
  cursor: pointer;
  transition: background .2s;
}

.btn-primary:hover:not(:disabled) {
  background: #a83f1f;
}

.btn-primary:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.btn-cancel {
  background: transparent;
  color: var(--black);
  font-size: .85rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: .75rem 1.5rem;
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  text-decoration: none;
  transition: border-color .2s;
  display: inline-block;
}

.btn-cancel:hover {
  border-color: var(--black);
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group.full {
    grid-column: 1;
  }

  .tallas-header,
  .talla-row {
    grid-template-columns: 1fr 1fr 1fr auto;
  }
}
</style>