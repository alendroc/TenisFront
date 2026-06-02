<template>
  <div>
    <!-- BREADCRUMB -->
    <div class="breadcrumb animate">
      <RouterLink to="/">Inicio</RouterLink>
      <span>/</span>
      <strong style="color:var(--black)">Admin · Categorías</strong>
    </div>

    <!-- HEADER -->
    <div class="admin-header animate">
      <h1>CATEGORÍAS</h1>
      <button class="btn-primary" @click="abrirModal()">+ Nueva categoría</button>
    </div>

    <!-- ALERT -->
    <div v-if="mensaje" class="alert-success animate">✓ {{ mensaje }}</div>

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
            <th>Nombre</th>
            <th>Género</th>
            <th>Descripción</th>
            <th>Productos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in categorias" :key="cat.id">
            <td class="td-id">#{{ String(cat.id).padStart(4, '0') }}</td>
            <td class="td-nombre">{{ cat.nombre }}</td>
            <td class="td-gray">{{ cat.genero ?? '—' }}</td>
            <td class="td-gray td-desc">{{ cat.descripcion ?? '—' }}</td>
            <td>{{ cat.zapatos_count ?? 0 }}</td>
            <td>
              <div class="acciones">
                <button class="btn-edit" @click="abrirModal(cat)">✏️ Editar</button>
                <button class="btn-delete" @click="eliminar(cat)">✕</button>
              </div>
            </td>
          </tr>
          <tr v-if="!categorias.length">
            <td colspan="6" class="td-empty">No hay categorías.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL -->
    <div v-if="modal" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal">
        <div class="modal-header">
          <span>{{ editando ? 'EDITAR CATEGORÍA' : 'NUEVA CATEGORÍA' }}</span>
          <button class="modal-close" @click="cerrarModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nombre *</label>
            <input v-model="form.nombre" type="text" placeholder="Ej: Running" />
            <span v-if="errores.nombre" class="error-msg">{{ errores.nombre }}</span>
          </div>
          <div class="form-group">
            <label>Género *</label>
            <select v-model="form.genero">
              <option value="">Seleccioná...</option>
              <option>Hombre</option>
              <option>Mujer</option>
              <option>Niño</option>
              <option>Unisex</option>
            </select>
            <span v-if="errores.genero" class="error-msg">{{ errores.genero }}</span>
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="form.descripcion" placeholder="Descripción de la categoría..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="cerrarModal">Cancelar</button>
          <button class="btn-primary" @click="guardar" :disabled="guardando">
            {{ guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear categoría' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from '@/services/api'

const categorias = ref([])
const cargando = ref(true)
const guardando = ref(false)
const mensaje = ref('')
const modal = ref(false)
const editando = ref(null)
const errores = ref({})

const form = reactive({ nombre: '', genero: '', descripcion: '' })

async function cargar() {
  cargando.value = true
  try {
    const res = await getCategorias()
    categorias.value = res.data.categorias
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
}

function abrirModal(cat = null) {
  errores.value = {}
  editando.value = cat
  form.nombre = cat?.nombre ?? ''
  form.genero = cat?.genero ?? ''
  form.descripcion = cat?.descripcion ?? ''
  modal.value = true
}

function cerrarModal() {
  modal.value = false
  editando.value = null
}

async function guardar() {
  errores.value = {}
  guardando.value = true
  try {
    if (editando.value) {
      await actualizarCategoria(editando.value.id, form)
      mensaje.value = 'Categoría actualizada.'
    } else {
      await crearCategoria(form)
      mensaje.value = 'Categoría creada correctamente.'
    }
    cerrarModal()
    setTimeout(() => mensaje.value = '', 3000)
    cargar()
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

async function eliminar(cat) {
  if (!confirm(`¿Eliminar "${cat.nombre}"? Esta acción no se puede deshacer.`)) return
  try {
    await eliminarCategoria(cat.id)
    mensaje.value = `"${cat.nombre}" eliminada.`
    setTimeout(() => mensaje.value = '', 3000)
    cargar()
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
  font-size: .8rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: .6rem 1.4rem;
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

.td-desc {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.td-empty {
  text-align: center;
  padding: 3rem;
  color: var(--gray);
}

.acciones {
  display: flex;
  gap: .5rem;
}

.btn-edit {
  background: var(--black);
  color: var(--white);
  font-size: .75rem;
  font-weight: 600;
  padding: .35rem .8rem;
  border-radius: var(--radius);
  border: none;
  cursor: pointer;
  transition: background .2s;
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

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal {
  background: var(--white);
  border-radius: var(--radius);
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, .2);
}

.modal-header {
  background: var(--black);
  padding: .8rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header span {
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--white);
  letter-spacing: 2px;
}

.modal-close {
  background: transparent;
  border: none;
  color: var(--white);
  font-size: 1rem;
  cursor: pointer;
  opacity: .6;
  transition: opacity .2s;
}

.modal-close:hover {
  opacity: 1;
}

.modal-body {
  padding: 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-footer {
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid var(--border);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: .4rem;
}

label {
  font-size: .75rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--gray);
}

input,
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
  min-height: 80px;
}

.error-msg {
  color: var(--accent);
  font-size: .78rem;
  font-weight: 600;
}

.btn-cancel {
  background: transparent;
  color: var(--black);
  font-size: .85rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: .65rem 1.5rem;
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  cursor: pointer;
  transition: border-color .2s;
}

.btn-cancel:hover {
  border-color: var(--black);
}

@media (max-width: 600px) {
  .modal {
    margin: 1rem;
  }
}
</style>