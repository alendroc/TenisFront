<template>
  <div>
    <!-- BREADCRUMB -->
    <div class="breadcrumb animate">
      <RouterLink to="/">Inicio</RouterLink>
      <span>/</span>
      <strong style="color:var(--black)">Admin · Marcas</strong>
    </div>

    <!-- HEADER -->
    <div class="admin-header animate">
      <h1>MARCAS</h1>
      <button class="btn-primary" @click="abrirModal()">+ Nueva marca</button>
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
            <th>País de origen</th>
            <th>Logo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="marca in marcas" :key="marca.id">
            <td class="td-id">#{{ String(marca.id).padStart(4, '0') }}</td>
            <td class="td-nombre">{{ marca.nombre }}</td>
            <td class="td-gray">{{ marca.pais_origen ?? '—' }}</td>
            <td>
              <img v-if="marca.logo" :src="marca.logo" :alt="marca.nombre" class="marca-logo"
                @error="e => e.target.style.display = 'none'" />
              <span v-else class="td-gray">—</span>
            </td>
            <td>
              <div class="acciones">
                <button class="btn-edit" @click="abrirModal(marca)">✏️ Editar</button>
                <button class="btn-delete" @click="eliminar(marca)">✕</button>
              </div>
            </td>
          </tr>
          <tr v-if="!marcas.length">
            <td colspan="5" class="td-empty">No hay marcas.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL -->
    <div v-if="modal" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal">
        <div class="modal-header">
          <span>{{ editando ? 'EDITAR MARCA' : 'NUEVA MARCA' }}</span>
          <button class="modal-close" @click="cerrarModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nombre *</label>
            <input v-model="form.nombre" type="text" placeholder="Ej: Nike" />
            <span v-if="errores.nombre" class="error-msg">{{ errores.nombre }}</span>
          </div>
          <div class="form-group">
            <label>País de origen</label>
            <input v-model="form.pais_origen" type="text" placeholder="Ej: Estados Unidos" />
          </div>
          <div class="form-group">
            <label>Logo (URL)</label>
            <input v-model="form.logo" type="text" placeholder="https://..." />
            <div v-if="form.logo" style="margin-top:.5rem;">
              <img :src="form.logo" style="max-height:60px; border-radius:4px;"
                @error="e => e.target.style.display = 'none'" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="cerrarModal">Cancelar</button>
          <button class="btn-primary" @click="guardar" :disabled="guardando">
            {{ guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear marca' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getMarcas, crearMarca, actualizarMarca, eliminarMarca } from '@/services/api'

const marcas = ref([])
const cargando = ref(true)
const guardando = ref(false)
const mensaje = ref('')
const modal = ref(false)
const editando = ref(null)
const errores = ref({})

const form = reactive({ nombre: '', pais_origen: '', logo: '' })

async function cargar() {
  cargando.value = true
  try {
    const res = await getMarcas()
    marcas.value = res.data.data  // ← viene paginada
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
}

function abrirModal(marca = null) {
  errores.value = {}
  editando.value = marca
  form.nombre = marca?.nombre ?? ''
  form.pais_origen = marca?.pais_origen ?? ''
  form.logo = marca?.logo ?? ''
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
      await actualizarMarca(editando.value.id, form)
      mensaje.value = 'Marca actualizada.'
    } else {
      await crearMarca(form)
      mensaje.value = 'Marca creada correctamente.'
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

async function eliminar(marca) {
  if (!confirm(`¿Eliminar "${marca.nombre}"? Esta acción no se puede deshacer.`)) return
  try {
    await eliminarMarca(marca.id)
    mensaje.value = `"${marca.nombre}" eliminada.`
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

.td-empty {
  text-align: center;
  padding: 3rem;
  color: var(--gray);
}

.marca-logo {
  height: 36px;
  width: auto;
  object-fit: contain;
  border-radius: 4px;
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
  max-width: 440px;
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

input:focus {
  border-color: var(--black);
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