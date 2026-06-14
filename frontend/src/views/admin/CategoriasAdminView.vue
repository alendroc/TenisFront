<template>
  <div>
    <!-- BREADCRUMB -->
    <div class="flex gap-2 align-items-center text-xs uppercase mb-4 text-color-secondary" style="letter-spacing: .5px;">
      <RouterLink to="/" class="text-color-secondary no-underline">Inicio</RouterLink>
      <span>/</span>
      <strong style="color: var(--black);">Admin · Categorías</strong>
    </div>

    <!-- HEADER -->
    <div class="flex align-items-center justify-content-between mb-5 pb-3" style="border-bottom: 2px solid var(--black);">
      <h1 style="font-family: var(--font-display); font-size: 2.8rem; letter-spacing: 2px;">CATEGORÍAS</h1>
      <Button label="+ Nueva categoría" @click="abrirModal()" style="background: var(--accent); border-color: var(--accent); color: var(--white);" />
    </div>

    <!-- ALERT -->
    <Message v-if="mensaje" severity="success" class="mb-4">{{ mensaje }}</Message>

    <!-- TABLA -->
    <DataTable :value="categorias" :loading="cargando" class="mb-4">
      <Column field="id" header="#">
        <template #body="{ data }">
          <span class="text-color-secondary text-sm">#{{ String(data.id).padStart(4, '0') }}</span>
        </template>
      </Column>
      <Column field="nombre" header="Nombre">
        <template #body="{ data }"><span class="font-semibold">{{ data.nombre }}</span></template>
      </Column>
      <Column field="genero" header="Género">
        <template #body="{ data }"><span class="text-color-secondary">{{ data.genero ?? '—' }}</span></template>
      </Column>
      <Column field="descripcion" header="Descripción">
        <template #body="{ data }">
          <span class="text-color-secondary" style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">
            {{ data.descripcion ?? '—' }}
          </span>
        </template>
      </Column>
      <Column field="zapatos_count" header="Productos">
        <template #body="{ data }">{{ data.zapatos_count ?? 0 }}</template>
      </Column>
      <Column header="Acciones">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button label="✏️ Editar" size="small" @click="abrirModal(data)" style="background: var(--black); border-color: var(--black); color: var(--white);" />
            <Button label="✕" size="small" severity="danger" outlined @click="eliminar(data)" />
          </div>
        </template>
      </Column>
      <template #empty>
        <div class="text-center py-5 text-color-secondary">No hay categorías.</div>
      </template>
    </DataTable>

    <!-- MODAL -->
    <Dialog v-model:visible="modal" modal :header="editando ? 'EDITAR CATEGORÍA' : 'NUEVA CATEGORÍA'" style="width: 480px;">
      <div class="flex flex-column gap-3">
        <div class="flex flex-column gap-2">
          <label class="text-xs font-bold uppercase text-color-secondary" style="letter-spacing: 1.5px;">Nombre *</label>
          <InputText v-model="form.nombre" placeholder="Ej: Running" />
          <span v-if="errores.nombre" class="text-sm font-semibold" style="color: var(--accent);">{{ errores.nombre }}</span>
        </div>
        <div class="flex flex-column gap-2">
          <label class="text-xs font-bold uppercase text-color-secondary" style="letter-spacing: 1.5px;">Género *</label>
          <Select v-model="form.genero" :options="['Hombre', 'Mujer', 'Niño', 'Unisex']" placeholder="Seleccioná..." />
          <span v-if="errores.genero" class="text-sm font-semibold" style="color: var(--accent);">{{ errores.genero }}</span>
        </div>
        <div class="flex flex-column gap-2">
          <label class="text-xs font-bold uppercase text-color-secondary" style="letter-spacing: 1.5px;">Descripción</label>
          <Textarea v-model="form.descripcion" placeholder="Descripción de la categoría..." rows="3" autoResize />
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" outlined @click="cerrarModal" style="color: var(--black); border-color: var(--border);" />
        <Button :label="guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear categoría'" :disabled="guardando" @click="guardar" style="background: var(--accent); border-color: var(--accent); color: var(--white);" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from '@/services/api'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'

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