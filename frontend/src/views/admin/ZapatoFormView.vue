<template>
  <div>
    <!-- BREADCRUMB -->
    <div class="flex gap-2 align-items-center text-xs uppercase mb-4 text-color-secondary" style="letter-spacing: .5px;">
      <RouterLink to="/" class="text-color-secondary no-underline">Inicio</RouterLink>
      <span>/</span>
      <RouterLink to="/admin/zapatos" class="text-color-secondary no-underline">Admin · Zapatos</RouterLink>
      <span>/</span>
      <strong style="color: var(--black);">{{ esEdicion ? 'Editar' : 'Nuevo' }}</strong>
    </div>

    <!-- HEADER -->
    <div class="mb-5 pb-3" style="border-bottom: 2px solid var(--black);">
      <h1 style="font-family: var(--font-display); font-size: 3.5rem; letter-spacing: 2px; line-height: 1;">
        {{ esEdicion ? 'EDITAR ZAPATO' : 'NUEVO ZAPATO' }}
      </h1>
      <p v-if="esEdicion && zapato" class="text-color-secondary mt-2 mb-0">ID #{{ String(zapato.id).padStart(4, '0') }} · {{ zapato.nombre }}</p>
      <p v-else class="text-color-secondary mt-2 mb-0">Completá los campos para agregar un producto al catálogo.</p>
    </div>

    <!-- INFORMACIÓN BÁSICA -->
    <Card class="border-round overflow-hidden mb-4"  style="background: var(--card-bg); color: var(--black);">
      <template #header>
        <div class="p-2 px-3" style="background: var(--black);">
          <span style="font-family: var(--font-display); font-size: 1.2rem; color: var(--white); letter-spacing: 2px;">INFORMACIÓN BÁSICA</span>
        </div>
      </template>
      <template #content>
        <div class="grid">
          <div class="col-12 flex flex-column gap-2">
            <label class="text-xs font-bold uppercase text-color-secondary" style="letter-spacing: 1.5px;">Nombre *</label>
            <InputText v-model="form.nombre" placeholder="Ej: Nike Air Max 270" />
            <span v-if="errores.nombre" class="text-sm font-semibold" style="color: var(--accent);">{{ errores.nombre }}</span>
          </div>
          <div class="col-12 md:col-6 flex flex-column gap-2">
            <label class="text-xs font-bold uppercase text-color-secondary" style="letter-spacing: 1.5px;">Categoría *</label>
            <Select v-model="form.categoria_id" :options="categorias" optionLabel="nombre" optionValue="id" placeholder="Seleccioná una categoría" />
            <span v-if="errores.categoria_id" class="text-sm font-semibold" style="color: var(--accent);">{{ errores.categoria_id }}</span>
          </div>
          <div class="col-12 md:col-6 flex flex-column gap-2">
            <label class="text-xs font-bold uppercase text-color-secondary" style="letter-spacing: 1.5px;">Marca *</label>
            <Select v-model="form.marca_id" :options="marcas" optionLabel="nombre" optionValue="id" placeholder="Seleccioná una marca" />
            <span v-if="errores.marca_id" class="text-sm font-semibold" style="color: var(--accent);">{{ errores.marca_id }}</span>
          </div>
          <div class="col-12 flex flex-column gap-2">
            <label class="text-xs font-bold uppercase text-color-secondary" style="letter-spacing: 1.5px;">Descripción</label>
            <Textarea v-model="form.descripcion" placeholder="Describí el producto..." rows="3" autoResize />
          </div>
        </div>
      </template>
    </Card>

    <!-- DETALLES -->
    <Card class="border-round overflow-hidden mb-4" style="background: var(--card-bg); color: var(--black);">
      <template #header>
        <div class="p-2 px-3" style="background: var(--black);">
          <span style="font-family: var(--font-display); font-size: 1.2rem; color: var(--white); letter-spacing: 2px;">DETALLES DEL PRODUCTO</span>
        </div>
      </template>
      <template #content>
        <div class="grid">
          <div class="col-12 md:col-6 flex flex-column gap-2">
            <label class="text-xs font-bold uppercase text-color-secondary" style="letter-spacing: 1.5px;">Precio (USD) *</label>
            <InputNumber v-model="form.precio" mode="decimal" :minFractionDigits="2" :min="0" placeholder="0.00" />
            <span v-if="errores.precio" class="text-sm font-semibold" style="color: var(--accent);">{{ errores.precio }}</span>
          </div>
          <div class="col-12 md:col-6 flex flex-column gap-2">
            <label class="text-xs font-bold uppercase text-color-secondary" style="letter-spacing: 1.5px;">Estilo</label>
            <InputText v-model="form.estilo" placeholder="Ej: Running, Oxford" />
          </div>
          <div class="col-12 md:col-6 flex flex-column gap-2">
            <label class="text-xs font-bold uppercase text-color-secondary" style="letter-spacing: 1.5px;">Material</label>
            <InputText v-model="form.material" placeholder="Ej: Cuero, Malla" />
          </div>
          <div class="col-12 md:col-6 flex flex-column gap-2">
            <label class="text-xs font-bold uppercase text-color-secondary" style="letter-spacing: 1.5px;">Color principal</label>
            <InputText v-model="form.color_principal" placeholder="Ej: Negro, Blanco/Rojo" />
          </div>
          <div class="col-12 md:col-6 flex flex-column gap-2">
            <label class="text-xs font-bold uppercase text-color-secondary" style="letter-spacing: 1.5px;">Imagen principal (URL)</label>
            <InputText v-model="form.imagen_principal" placeholder="https://..." />
            <img v-if="form.imagen_principal" :src="form.imagen_principal" style="max-width: 220px; border-radius: 8px; border: 1px solid #ddd;"
              @error="e => e.target.style.display = 'none'" />
          </div>
          <div class="col-12 md:col-6 flex align-items-end">
            <div class="flex align-items-center gap-2">
              <Checkbox v-model="form.disponible" binary inputId="disponible" />
              <label for="disponible" class="text-sm" style="color: var(--black);">Disponible para la venta</label>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- TALLAS -->
    <Card class="border-round overflow-hidden mb-4" style="background: var(--card-bg); color: var(--black);">
      <template #header>
        <div class="p-2 px-3" style="background: var(--black);">
          <span style="font-family: var(--font-display); font-size: 1.2rem; color: var(--white); letter-spacing: 2px;">TALLAS Y STOCK</span>
        </div>
      </template>
      <template #content>
        <div class="grid mb-2">
          <div class="col-4"><label class="text-xs font-bold uppercase text-color-secondary" style="letter-spacing: 1.5px;">Talla US</label></div>
          <div class="col-4"><label class="text-xs font-bold uppercase text-color-secondary" style="letter-spacing: 1.5px;">Talla EU</label></div>
          <div class="col-3"><label class="text-xs font-bold uppercase text-color-secondary" style="letter-spacing: 1.5px;">Stock</label></div>
          <div class="col-1"></div>
        </div>
        <div v-for="(talla, i) in tallas" :key="i" class="grid mb-2 align-items-center">
          <div class="col-4"><InputNumber v-model="talla.talla_us" :step="0.5" :min="1" placeholder="Ej: 9.5" class="w-full" /></div>
          <div class="col-4"><InputNumber v-model="talla.talla_eu" :step="0.5" :min="30" placeholder="Ej: 43" class="w-full" /></div>
          <div class="col-3"><InputNumber v-model="talla.stock" :min="0" placeholder="Ej: 10" class="w-full" /></div>
          <div class="col-1">
            <Button icon="pi pi-times" severity="danger" outlined size="small" @click="removeTalla(i)" :disabled="tallas.length === 1" />
          </div>
        </div>
        <Button label="+ Agregar talla" outlined class="w-full mt-2" @click="addTalla" style="border-style: dashed; color: var(--gray); border-color: var(--border);" />
      </template>
    </Card>

    <!-- DANGER ZONE (solo edición) -->
    <div v-if="esEdicion" class="flex justify-content-between align-items-center gap-3 mt-3 p-3 border-round flex-wrap" style="border: 1.5px solid #fce4ec; background: #fff8f8;">
      <div>
        <strong style="color: #c62828;">Eliminar este zapato</strong>
        <p class="text-sm text-color-secondary m-0">Esta acción es permanente y eliminará también todas sus tallas e imágenes.</p>
      </div>
      <Button label="Eliminar zapato" severity="danger" outlined @click="eliminar" />
    </div>

    <!-- BOTONES -->
    <div class="flex gap-3 justify-content-end mt-4">
      <RouterLink to="/admin/zapatos">
        <Button label="Cancelar" outlined style="color: var(--black); border-color: var(--border);" />
      </RouterLink>
      <Button :label="guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Guardar zapato'" :disabled="guardando" @click="guardar" style="background: var(--accent); border-color: var(--accent); color: var(--white);" />
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
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'

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
      for (const id of tallasEliminadas.value) {
        await eliminarTalla(id)
      }
      tallasEliminadas.value = []

      await actualizarZapato(route.params.id, payload)
      for (const talla of tallas.value) {
        if (talla.id) {
          await actualizarTalla(talla.id, {
            talla_us: talla.talla_us,
            talla_eu: talla.talla_eu,
            stock: talla.stock,
          })
        } else {
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