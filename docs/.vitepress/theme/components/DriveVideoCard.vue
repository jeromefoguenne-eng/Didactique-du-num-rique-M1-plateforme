<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    default: ''
  },
  img: {
    type: String,
    required: true
  },
  href: {
    type: String,
    required: true
  },
  banner: {
    type: Boolean,
    default: false
  },
  badge: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div v-if="banner" class="drive-video-banner-wrapper">
    <a 
      :href="href" 
      target="_blank" 
      rel="noopener noreferrer"
      class="drive-video-banner"
      :title="title"
    >
      <img :src="img" :alt="title" class="drive-video-banner-img" />
      <div class="drive-video-banner-overlay">
        <span class="drive-play-icon">▶</span>
        <span class="drive-play-text">Visionner « {{ title }} » sur Google Drive ↗</span>
      </div>
    </a>
  </div>

  <a 
    v-else
    :href="href" 
    target="_blank" 
    rel="noopener noreferrer"
    class="drive-video-card"
    :title="title"
  >
    <div class="drive-video-thumb">
      <img :src="img" :alt="title" />
      <span v-if="badge" class="drive-video-badge">{{ badge }}</span>
      <div class="drive-video-play-btn">▶</div>
    </div>
    <div class="drive-video-content">
      <strong class="drive-video-title">{{ title }}</strong>
      <p v-if="desc" class="drive-video-desc">{{ desc }}</p>
    </div>
  </a>
</template>

<style scoped>
.drive-video-banner-wrapper {
  text-align: center;
  margin: 1.2rem 0;
}
.drive-video-banner {
  display: inline-block;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border: 2px solid var(--vp-c-divider);
  max-width: 540px;
  width: 100%;
  text-decoration: none !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.drive-video-banner:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
  border-color: var(--vp-c-brand-1);
}
.drive-video-banner-img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}
.drive-video-banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(15, 23, 42, 0.92));
  color: white;
  padding: 12px 16px;
  font-size: 0.92rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.drive-play-icon {
  font-size: 1rem;
}

.drive-video-card {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  text-decoration: none !important;
  color: inherit !important;
  background: var(--vp-c-bg);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.drive-video-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  border-color: var(--vp-c-brand-1);
}
.drive-video-thumb {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: #0f172a;
}
.drive-video-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}
.drive-video-card:hover .drive-video-thumb img {
  transform: scale(1.04);
}
.drive-video-play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(15, 23, 42, 0.75);
  color: white;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: background 0.2s, transform 0.2s;
}
.drive-video-card:hover .drive-video-play-btn {
  background: var(--vp-c-brand-1);
  transform: translate(-50%, -50%) scale(1.1);
}
.drive-video-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--vp-c-brand-1);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}
.drive-video-content {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.drive-video-title {
  font-size: 0.92rem;
  color: var(--vp-c-brand-1);
  font-weight: 700;
}
.drive-video-desc {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  margin: 0;
  line-height: 1.45;
}
</style>
