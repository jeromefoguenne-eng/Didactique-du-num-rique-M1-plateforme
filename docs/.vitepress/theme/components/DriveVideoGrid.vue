<template>
  <div class="drive-video-grid">
    <slot />
  </div>
</template>

<style scoped>
.drive-video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.2rem;
  margin: 1.2rem 0;
}
</style>
