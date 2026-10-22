<script setup>
defineProps({
  items: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <div class="pptx-grid">
    <a
      v-for="(item, idx) in items"
      :key="idx"
      :href="item.driveUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="pptx-tile"
      :style="{ '--accent-color': item.color || 'var(--vp-c-brand-1)' }"
    >
      <div class="pptx-tile-header">
        <div class="pptx-badge">
          <span class="pptx-icon">{{ item.icon || '📊' }}</span>
          <span class="pptx-tag">{{ item.tag }}</span>
        </div>
        <span class="pptx-drive-pill">Drive ↗</span>
      </div>

      <div class="pptx-tile-body">
        <h4 class="pptx-tile-title">{{ item.title }}</h4>
        <p class="pptx-tile-desc">{{ item.desc }}</p>
      </div>

      <div class="pptx-tile-footer">
        <span class="pptx-open-text">
          <span>Consulter la présentation</span>
          <span class="arrow">→</span>
        </span>
        <a
          v-if="item.downloadUrl"
          :href="item.downloadUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="pptx-dl-btn"
          title="Télécharger le fichier .pptx directement"
          @click.stop
        >
          📥 .pptx
        </a>
      </div>
    </a>
  </div>
</template>

<style scoped>
.pptx-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
  margin: 1.5rem 0 2.5rem 0;
}

.pptx-tile {
  display: flex;
  flex-direction: column;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.15rem 1.25rem;
  text-decoration: none !important;
  color: inherit !important;
  position: relative;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.pptx-tile::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--accent-color);
  opacity: 0.85;
  transition: opacity 0.2s ease, height 0.2s ease;
}

.pptx-tile:hover {
  transform: translateY(-4px);
  border-color: var(--accent-color);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.pptx-tile:hover::before {
  opacity: 1;
  height: 5px;
}

.pptx-tile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
}

.pptx-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 3px 8px;
}

.pptx-icon {
  font-size: 1.1rem;
}

.pptx-tag {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--accent-color);
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.pptx-drive-pill {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  padding: 2px 7px;
  border-radius: 4px;
}

.pptx-tile-body {
  flex-grow: 1;
  margin-bottom: 1rem;
}

.pptx-tile-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.35;
  color: var(--vp-c-text-1);
  transition: color 0.2s ease;
}

.pptx-tile:hover .pptx-tile-title {
  color: var(--accent-color);
}

.pptx-tile-desc {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.45;
  color: var(--vp-c-text-2);
}

.pptx-tile-footer {
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--vp-c-divider);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pptx-open-text {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--accent-color);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.arrow {
  transition: transform 0.2s ease;
}

.pptx-tile:hover .arrow {
  transform: translateX(4px);
}

.pptx-dl-btn {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--vp-c-text-2) !important;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  padding: 3px 8px;
  border-radius: 5px;
  text-decoration: none !important;
  transition: all 0.2s ease;
}

.pptx-dl-btn:hover {
  background: var(--vp-c-bg-alt);
  color: var(--accent-color) !important;
  border-color: var(--accent-color);
}
</style>
