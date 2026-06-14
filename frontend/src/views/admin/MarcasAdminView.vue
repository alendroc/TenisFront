<template>
  <div>
    <!-- BREADCRUMB -->
    <div class="flex gap-2 align-items-center text-xs uppercase mb-4 text-color-secondary" style="letter-spacing: .5px;">
      <RouterLink to="/" class="text-color-secondary no-underline">Inicio</RouterLink>
      <span>/</span>
      <strong style="color: var(--black);">Admin · Marcas</strong>
    </div>

    <!-- HEADER -->
    <div class="flex align-items-center justify-content-between mb-5 pb-3" style="border-bottom: 2px solid var(--black);">
      <h1 style="font-family: var(--font-display); font-size: 2.8rem; letter-spacing: 2px;">MARCAS</h1>
      <Button label="+ Nueva marca" @click="abrirModal()" style="background: var(--accent); border-color: var(--accent); color: var(--white);" />
    </div>

    <!-- ALERT -->
    <Message v-if="mensaje" severity="success" class="mb-4">{{ mensaje }}</Message>

    <!-- TABLA -->
    <DataTable :value="marcas" :loading="cargando" class="mb-4">
      <Column field="id" header="#">
        <template #body="{ data }">
          <span class="text-color-secondary text-sm">#{{ String(data.id).padStart(4, '0') }}</span>
        </template>
      </Column>
      <Column field="nombre" header="Nombre">
        <template #body="{ data }"><span class="font-semibold">{{ data.nombre }}</span></template>
      </Column>
      <Column field="pais_origen" header="País de origen">
        <template #body="{ data }"><span class="text-color-secondary">{{ data.pais_origen ?? '—' }}</span></template>
      </Column>
      <Column header="Logo">
        <template #body="{ data }">
          <img v-if="data.logo" :src="data.logo" :alt="data.nombre" style="height: 36px; width: auto; object-fit: contain; border-radius: 4px;"
            @error="e => e.target.style.display = 'none'" />
          <span v-else class="text-color-secondary">—</span>
        </template>
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
        <div class="text-center py-5 text-color-secondary">No hay marcas.</div>
      </template>
    </DataTable>

    <!-- MODAL -->
    <Dialog v-model:visible="modal" modal :header="editando ? 'EDITAR MARCA' : 'NUEVA MARCA'" style="width: 440px;">
      <div class="flex flex-column gap-3">
        <div class="flex flex-column gap-2">
          <label class="text-xs font-bold uppercase text-color-secondary" style="letter-spacing: 1.5px;">Nombre *</label>
          <InputText v-model="form.nombre" placeholder="Ej: Nike" />
          <span v-if="errores.nombre" class="text-sm font-semibold" style="color: var(--accent);">{{ errores.nombre }}</span>
        </div>
        <div class="flex flex-column gap-2">
          <label class="text-xs font-bold uppercase text-color-secondary" style="letter-spacing: 1.5px;">País de origen</label>
          <InputText v-model="form.pais_origen" placeholder="Ej: Estados Unidos" />
        </div>
        <div class="flex flex-column gap-2">
          <label class="text-xs font-bold uppercase text-color-secondary" style="letter-spacing: 1.5px;">Logo (URL)</label>
          <InputText v-model="form.logo" placeholder="https://..." />
          <img v-if="form.logo" :src="form.logo" style="max-height: 60px; border-radius: 4px;"
            @error="e => e.target.style.display = 'none'" />
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" outlined @click="cerrarModal" style="color: var(--black); border-color: var(--border);" />
        <Button :label="guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear marca'" :disabled="guardando" @click="guardar" style="background: var(--accent); border-color: var(--accent); color: var(--white);" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getMarcas, crearMarca, actualizarMarca, eliminarMarca } from '@/services/api'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'

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