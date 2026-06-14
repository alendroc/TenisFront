<template>
  <Card class="zapato-card relative h-full border-round overflow-hidden bg-white" style="color: var(--black);">
    <template #header>
      <div class="relative">
        <Tag
          :value="zapato.disponible ? 'Disponible' : 'Agotado'"
          class="absolute top-2 left-2 z-1 text-xs font-semibold border-round-sm"
          style="letter-spacing: 1px; text-transform: uppercase; background: var(--black); color: var(--white);"
        />
        <img
          class="w-full block"
          style="aspect-ratio: 4/3; object-fit: cover; background: var(--cream);"
          :src="zapato.imagen_principal || 'https://via.placeholder.com/600x450?text=Sin+imagen'"
          :alt="zapato.nombre"
          loading="lazy"
          @error="e => e.target.src = 'https://via.placeholder.com/600x450?text=Sin+imagen'"
        />
      </div>
    </template>

    <template #content>
      <div class="text-xs font-semibold uppercase text-color-secondary mb-1" style="letter-spacing: 2px;">
        {{ zapato.marca?.nombre ?? '—' }}
      </div>
      <div class="text-base font-semibold mb-2" style="line-height: 1.3;">
        {{ zapato.nombre }}
      </div>
<div class="flex flex-wrap gap-2 mb-3">
  <Tag v-if="zapato.estilo" :value="zapato.estilo" class="text-xs" style="background: var(--cream); color: var(--gray);" />
  <Tag v-if="zapato.material" :value="zapato.material" class="text-xs" style="background: var(--cream); color: var(--gray);" />
  <Tag v-if="zapato.color_principal" :value="zapato.color_principal" class="text-xs" style="background: var(--cream); color: var(--gray);" />
</div>
      <div class="flex justify-content-between align-items-center">
        <span class="text-2xl font-bold" style="font-family: var(--font-display); letter-spacing: 1px;">
          ${{ Number(zapato.precio).toFixed(2) }}
        </span>
        <RouterLink :to="`/productos/${zapato.id}`">
          <Button label="Ver más" size="small" style="background: var(--black); border-color: var(--black); color: var(--white);" />
        </RouterLink>
      </div>
    </template>
  </Card>
</template>

<script setup>
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Button from 'primevue/button'

defineProps({
  zapato: { type: Object, required: true },
  delay: { type: Number, default: 1 },
})
</script>

<style scoped>
.zapato-card {
  transition: transform .25s ease, box-shadow .25s ease;
}

.zapato-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, .1);
}
</style>