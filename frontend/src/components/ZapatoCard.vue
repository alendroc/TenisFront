<template>
  <div :class="`card animate animate-delay-${delay}`">
    <span v-if="!zapato.disponible" class="card-badge agotado">Agotado</span>
    <span v-else class="card-badge">Disponible</span>

    <img
      class="card-img"
      :src="zapato.imagen_principal || 'https://via.placeholder.com/600x450?text=Sin+imagen'"
      :alt="zapato.nombre"
      loading="lazy"
      @error="e => e.target.src = 'https://via.placeholder.com/600x450?text=Sin+imagen'"
    />

    <div class="card-body">
      <div class="card-marca">{{ zapato.marca?.nombre ?? '—' }}</div>
      <div class="card-nombre">{{ zapato.nombre }}</div>
      <div class="card-meta">
        <span v-if="zapato.estilo"          class="tag">{{ zapato.estilo }}</span>
        <span v-if="zapato.material"        class="tag">{{ zapato.material }}</span>
        <span v-if="zapato.color_principal" class="tag">{{ zapato.color_principal }}</span>
      </div>
      <div class="card-footer">
        <span class="card-precio">${{ Number(zapato.precio).toFixed(2) }}</span>
        <RouterLink :to="`/productos/${zapato.id}`" class="btn-ver">Ver más</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  zapato: { type: Object, required: true },
  delay:  { type: Number, default: 1 },
})
</script>