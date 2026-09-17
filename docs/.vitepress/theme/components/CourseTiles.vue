<script setup>
import { withBase } from 'vitepress'

const tiles = [
  {
    id: 1,
    title: "1. Compétences Numériques",
    tag: "Syllabus & Études de cas",
    desc: "De la maîtrise technique à l'autonomie critique : DigComp, éducation aux médias, algorithmes et fake news.",
    link: "/modules/01-competences-numeriques",
    image: "/images/tile-1-competences.jpg"
  },
  {
    id: 2,
    title: "2. Référentiel FMTTN (FWB)",
    tag: "Cadre Officiel",
    desc: "Le volet numérique du nouveau Tronc commun : les 4 champs d'apprentissage et la progression spiralaire.",
    link: "/modules/02-referentiel-fmttn",
    image: "/images/tile-2-fmttn.jpg"
  },
  {
    id: 3,
    title: "3. Méthodologies pédagogiques",
    tag: "Didactique Active",
    desc: "Enseigner le numérique par l'action : investigation, démarche de projet, défis express et itération.",
    link: "/modules/03-pedagogies-actives",
    image: "/images/tile-3-methodologies.jpg"
  },
  {
    id: 4,
    title: "4. Préparer une Leçon FMTTN",
    tag: "Ingénierie Pédagogique",
    desc: "Triple concordance didactique, taxonomie de Bloom appliquée au FMTTN et Assistant Cours HECh.",
    link: "/modules/04-preparation-lecon-fmttn",
    image: "/images/tile-4-preparation.jpg"
  },
  {
    id: 5,
    title: "5. Projet Jeu de société",
    tag: "Projet Fil Rouge",
    desc: "Créer un jeu ludo-éducatif : règles, cartes IA, découpeuse laser, pions 3D et capsule vidéo.",
    link: "/modules/05-projet-jeu-societe",
    image: "/images/tile-5-projet-jeu.jpg"
  },
  {
    id: 6,
    title: "6. Guide & Évaluation",
    tag: "Modalités sur 200 pts",
    desc: "Rôle de la plateforme, organisation du travail, calendrier et modalités de l'évaluation sur 200 points.",
    link: "/guide/",
    image: "/images/tile-7-evaluation.jpg"
  },
  {
    id: 7,
    title: "7. Ressources & Outils",
    tag: "Syllabus, Docs & Slides",
    desc: "Syllabus Google Docs, référentiels officiels (FMTTN, CSEM), présentations PowerPoint et bibliographie APA.",
    link: "/ressources/",
    image: "/images/tile-8-ressources.jpg"
  }
]
</script>

<template>
  <div class="tiles-container">
    <div class="compact-grid">
      <a 
        v-for="tile in tiles" 
        :key="tile.id" 
        :href="withBase(tile.link)" 
        class="compact-tile"
      >
        <div class="tile-image-wrapper">
          <img :src="withBase(tile.image)" :alt="tile.title" class="tile-image" loading="lazy" />
          <span class="tile-tag-badge">{{ tile.tag }}</span>
        </div>
        <div class="tile-body">
          <h3 class="compact-title">{{ tile.title }}</h3>
          <p class="compact-desc">{{ tile.desc }}</p>
          <div class="compact-footer">
            <span class="open-link">Ouvrir la section →</span>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<style scoped>
.tiles-container {
  max-width: 1160px;
  margin: 1.5rem auto 3rem auto;
  padding: 0 1rem;
}

.compact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.25rem;
}

.compact-tile {
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

.compact-tile:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.tile-image-wrapper {
  position: relative;
  width: 100%;
  height: 145px;
  overflow: hidden;
  background: var(--vp-c-bg-alt);
}

.tile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.compact-tile:hover .tile-image {
  transform: scale(1.05);
}

.tile-tag-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.82);
  color: #ffffff;
  backdrop-filter: blur(4px);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.tile-body {
  padding: 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.compact-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0 0 0.4rem 0;
  color: var(--vp-c-text-1);
  line-height: 1.35;
}

.compact-tile:hover .compact-title {
  color: var(--vp-c-brand-1);
}

.compact-desc {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.45;
  margin: 0 0 0.8rem 0;
  flex-grow: 1;
}

.compact-footer {
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px dashed var(--vp-c-divider);
}

.open-link {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  display: inline-flex;
  align-items: center;
}
</style>
