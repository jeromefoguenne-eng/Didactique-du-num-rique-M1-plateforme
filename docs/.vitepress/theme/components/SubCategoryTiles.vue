<script setup>
import { withBase } from 'vitepress'

defineProps({
  items: {
    type: Array,
    required: true,
    default: () => []
  }
})
</script>

<template>
  <div class="subcat-container">
    <div class="subcat-grid">
      <a 
        v-for="(item, idx) in items" 
        :key="idx" 
        :href="withBase(item.link)" 
        class="subcat-card"
      >
        <div class="subcat-image-wrapper">
          <img 
            :src="withBase(item.image)" 
            :alt="item.title" 
            class="subcat-image" 
            loading="lazy" 
          />
        </div>
        <div class="subcat-body">
          <h4 class="subcat-title">{{ item.title }}</h4>
          <p class="subcat-desc">{{ item.desc }}</p>
          <div class="subcat-footer">
            <span class="subcat-link-text">Consulter le dossier →</span>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<style scoped>
.subcat-container {
  margin: 1.5rem 0 2.5rem 0;
}

.subcat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.subcat-card {
  display: flex;
  flex-direction: column;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none !important;
  color: inherit !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.subcat-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.09);
}

.subcat-image-wrapper {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: var(--vp-c-bg-alt);
}

.subcat-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.subcat-card:hover .subcat-image {
  transform: scale(1.05);
}

.subcat-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.75);
  color: #ffffff;
  backdrop-filter: blur(4px);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.3px;
}

.subcat-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.subcat-title {
  margin: 0 0 0.4rem 0;
  font-size: 1rem;
  font-weight: 750;
  line-height: 1.35;
  color: var(--vp-c-text-1);
}

.subcat-desc {
  margin: 0 0 0.9rem 0;
  font-size: 0.84rem;
  line-height: 1.45;
  color: var(--vp-c-text-2);
  flex-grow: 1;
}

.subcat-footer {
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid var(--vp-c-divider);
}

.subcat-link-text {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  transition: transform 0.2s ease;
  display: inline-block;
}

.subcat-card:hover .subcat-link-text {
  transform: translateX(4px);
}
</style>
