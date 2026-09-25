<script setup>
import { computed, onMounted } from 'vue'
import { userStore, formatDeadlineDisplay, getAlarmLevelInfo, parseDeadline, GOOGLE_DRIVE_EXERCISES_FOLDER_URL } from '../stores/userStore'
import { withBase } from 'vitepress'

const props = defineProps({
  exerciseId: {
    type: String,
    required: true
  },
  exerciseTitle: {
    type: String,
    required: true
  }
})

const currentUser = computed(() => userStore.currentUser)

// Liens de téléchargement officiels (Word, PDF, Drive, Google Docs)
const downloadLinks = computed(() => {
  return userStore.getExerciseDocLinks(props.exerciseId)
})

// Fichier déjà déposé pour cet exercice (si l'étudiant est connecté)
const attachedFile = computed(() => {
  const files = userStore.getUserFiles()
  return files.find(f => f.exerciseId === props.exerciseId)
})

// Commentaire & note de l'enseignant si déjà évalué
const teacherFeedback = computed(() => {
  return userStore.getExerciseFeedback(props.exerciseId)
})

// Échéance et alerte de retard graduée
const deadlineInfo = computed(() => {
  const d = userStore.getExerciseDeadline(props.exerciseId)
  if (!d || !d.isDefined || !d.deadline) {
    return {
      isDefined: false,
      deadline: '',
      display: 'Non fixée',
      label: ''
    }
  }
  return {
    isDefined: true,
    deadline: d.deadline,
    display: formatDeadlineDisplay(d.deadline),
    label: d.label || ''
  }
})

const lateAlert = computed(() => {
  if (attachedFile.value) return null
  const d = userStore.getExerciseDeadline(props.exerciseId)
  if (!d || !d.isDefined || !d.deadline) return null

  const deadlineDate = parseDeadline(d.deadline)
  if (!deadlineDate) return null
  const now = new Date()
  if (now <= deadlineDate) return null

  const daysLate = Math.max(1, Math.floor((now.getTime() - deadlineDate.getTime()) / (1000 * 60 * 60 * 24)))
  if (daysLate < 7) return null
  const alarmInfo = getAlarmLevelInfo(daysLate)
  return {
    daysLate,
    alarmInfo,
    deadlineFormatted: formatDeadlineDisplay(d.deadline)
  }
})

onMounted(() => {
  userStore.syncFromStorage()
})
</script>

<template>
  <div class="exercise-submit-box">
    <!-- EN-TÊTE DE LA FICHE D'ATELIER -->
    <div class="box-header">
      <div class="box-badge-row">
        <span class="box-badge">📌 Ressources & Consignes de l'Atelier</span>
        <span v-if="attachedFile" class="badge-done-header">✓ Travail remis</span>
      </div>
      <h4>{{ exerciseTitle }}</h4>
    </div>

    <!-- BANDEAU ACCÈS AU DOCUMENT OFFICIEL & TÉLÉCHARGEMENT -->
    <div v-if="downloadLinks" class="box-download-zone">
      <div class="bdz-header">
        <span class="bdz-icon">📥</span>
        <div class="bdz-info">
          <strong class="bdz-title">Document de travail & grille de consignes officielles :</strong>
          <span class="bdz-hint">
            Consultez le document en ligne en mode lecteur ou téléchargez-le sous le format de votre choix pour rédiger vos réponses :
          </span>
        </div>
      </div>

      <div class="bdz-buttons">
        <!-- 1. Google Docs en mode lecteur -->
        <a 
          :href="downloadLinks.viewUrl" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="btn-dl btn-dl-view" 
          title="Consulter le document officiel sur Google Docs en mode lecteur"
        >
          <span class="btn-dl-ico">👁️</span>
          <span>Google Docs <strong>(Mode Lecteur)</strong> ↗</span>
        </a>

        <!-- 2. Téléchargement Word (.docx) -->
        <a 
          :href="downloadLinks.docxLocalUrl || downloadLinks.docxGoogleUrl" 
          download 
          class="btn-dl btn-dl-docx" 
          title="Télécharger le document Microsoft Word sur votre ordinateur/tablette"
        >
          <span class="btn-dl-ico">💾</span>
          <span>Télécharger <strong>Word (.docx)</strong></span>
        </a>

        <!-- 3. Téléchargement PDF (.pdf) -->
        <a 
          :href="downloadLinks.pdfGoogleUrl" 
          download 
          class="btn-dl btn-dl-pdf" 
          title="Télécharger le document au format PDF"
        >
          <span class="btn-dl-ico">📄</span>
          <span>Télécharger <strong>PDF (.pdf)</strong></span>
        </a>

        <!-- 4. Dupliquer dans son Drive -->
        <a 
          :href="downloadLinks.driveCopyUrl" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="btn-dl btn-dl-copy" 
          title="Créer une copie modifiable directement dans votre espace Google Drive personnel"
        >
          <span class="btn-dl-ico">📋</span>
          <span>Créer une <strong>copie Drive</strong></span>
        </a>

        <!-- 5. Lien vers le dossier Google Drive global des exercices -->
        <a 
          :href="downloadLinks.folderDriveUrl || GOOGLE_DRIVE_EXERCISES_FOLDER_URL" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="btn-dl btn-dl-folder" 
          title="Accéder au dossier Google Drive regroupant l'ensemble des exercices du cours"
        >
          <span class="btn-dl-ico">📂</span>
          <span>Dossier <strong>Google Drive</strong> ↗</span>
        </a>
      </div>
    </div>

    <!-- BANDEAU ÉCHÉANCE & STATUT TEMPOREL -->
    <div class="box-deadline-strip" :class="{ 'is-overdue': !!lateAlert, 'no-deadline': !deadlineInfo.isDefined }">
      <div class="bds-left">
        <span class="bds-icon">📅</span>
        <span class="bds-label">Date limite de remise :</span>
        <strong v-if="deadlineInfo.isDefined" class="bds-date">{{ deadlineInfo.display }}</strong>
        <span v-else class="bds-date-empty">⚪ Non fixée par l'enseignant (dépôt libre)</span>
      </div>
      <div class="bds-right">
        <span v-if="attachedFile" class="bds-badge-ok">✓ Document remis</span>
        <span v-else-if="lateAlert" class="bds-badge-late" :style="{ backgroundColor: lateAlert.alarmInfo.color }">
          {{ lateAlert.alarmInfo.icon }} {{ lateAlert.alarmInfo.label }} (+{{ lateAlert.daysLate }}j)
        </span>
        <span v-else-if="deadlineInfo.isDefined" class="bds-badge-pending">⏳ À rendre</span>
      </div>
    </div>

    <!-- ALERTE RETARD EXPLICITE SI RETARD DÉTECTÉ -->
    <div v-if="lateAlert" class="box-late-callout" :style="{ backgroundColor: lateAlert.alarmInfo.bgColor, borderColor: lateAlert.alarmInfo.borderColor, color: lateAlert.alarmInfo.color }">
      <span class="blc-icon">{{ lateAlert.alarmInfo.icon }}</span>
      <div class="blc-content">
        <div class="blc-title">
          <strong>Alerte de retard — {{ lateAlert.alarmInfo.label }}</strong>
        </div>
        <div class="blc-desc">
          Ce travail devait être remis pour le <strong>{{ lateAlert.deadlineFormatted }}</strong>. Vous avez actuellement <strong>{{ lateAlert.daysLate }} jour(s) de retard</strong>. Veuillez déposer votre document dès que possible dans votre Espace Membre.
        </div>
      </div>
    </div>

    <!-- FEEDBACK & ÉVALUATION ENSEIGNANT (SI EXISTANT) -->
    <div v-if="teacherFeedback && teacherFeedback.status === 'graded'" class="box-teacher-feedback">
      <div class="btf-header">
        <div class="btf-title-group">
          <span class="btf-icon">👨‍🏫</span>
          <div>
            <div class="btf-title">Commentaire & Évaluation de votre enseignant</div>
            <div class="btf-date" v-if="teacherFeedback.gradedAt">Transmis le {{ teacherFeedback.gradedAt }}</div>
          </div>
        </div>
        <div v-if="teacherFeedback.score !== undefined && teacherFeedback.score !== null" class="btf-score-badge">
          Note officielle : <strong>{{ teacherFeedback.score }}</strong> / 10 pts
        </div>
      </div>
      <div class="btf-body">
        <div class="btf-quote">
          « {{ teacherFeedback.feedback }} »
        </div>
      </div>
    </div>

    <!-- SECTION REDIRECTION VERS L'ESPACE MEMBRE POUR LE DÉPÔT -->
    <div class="box-member-redirect-card">
      <div class="bmrc-header">
        <div class="bmrc-icon-block">
          <span class="bmrc-icon">📮</span>
        </div>
        <div class="bmrc-info">
          <h5>Dépôt des travaux & Évaluation IA</h5>
          <p>
            Les travaux pratiques se déposent désormais <strong>exclusivement dans votre Espace Membre personnel</strong> afin de garantir un archivage sécurisé, un suivi individualisé de vos échéances et la génération immédiate de votre diagnostic pédagogique par l'IA.
          </p>
        </div>
      </div>

      <!-- État du devoir si déjà déposé -->
      <div v-if="attachedFile" class="bmrc-file-status">
        <div class="bfs-left">
          <span class="bfs-icon">📄</span>
          <div>
            <div class="bfs-name"><strong>Travail actuellement enregistré :</strong> {{ attachedFile.formattedFileName }}</div>
            <div class="bfs-meta">Déposé le {{ attachedFile.submittedAt }} • Taille : {{ Math.round(attachedFile.fileSize / 1024) }} Ko</div>
          </div>
        </div>
        <div class="bfs-right">
          <span v-if="attachedFile.aiCorrection" class="bfs-ai-score">
            🤖 Diagnostic IA : <strong>{{ attachedFile.aiCorrection.suggestedScore }} / 10 pts</strong>
          </span>
        </div>
      </div>

      <div class="bmrc-action-row">
        <a :href="withBase('/espace-membre')" class="btn-goto-member">
          <span v-if="attachedFile">📂 Consulter ou remplacer mon document dans mon Espace Membre →</span>
          <span v-else>👉 Déposer mon travail dans mon Espace Membre →</span>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exercise-submit-box {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.box-header {
  margin-bottom: 1.25rem;
}

.box-badge-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.4rem;
}

.box-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #e0e7ff;
  color: #4338ca;
  padding: 3px 10px;
  border-radius: 20px;
}

.badge-done-header {
  font-size: 0.75rem;
  font-weight: 700;
  background: #ecfdf5;
  color: #047857;
  padding: 3px 10px;
  border-radius: 20px;
}

.box-header h4 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--vp-c-brand-1);
}

/* ZONE DE TÉLÉCHARGEMENT DES DOCUMENTS */
.box-download-zone {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 1.1rem;
  margin-bottom: 1.2rem;
}

.bdz-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.bdz-icon {
  font-size: 1.4rem;
  line-height: 1;
}

.bdz-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.bdz-title {
  font-size: 0.95rem;
  color: var(--vp-c-text-1);
}

.bdz-hint {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.4;
}

.bdz-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.btn-dl {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 7px 13px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.btn-dl-ico {
  font-size: 1rem;
}

.btn-dl-view {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}
.btn-dl-view:hover {
  background: #dbeafe;
  border-color: #93c5fd;
}

.btn-dl-docx {
  background: #f0fdf4;
  color: #15803d;
  border-color: #bbf7d0;
}
.btn-dl-docx:hover {
  background: #dcfce7;
  border-color: #86efac;
}

.btn-dl-pdf {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}
.btn-dl-pdf:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

.btn-dl-copy {
  background: #faf5ff;
  color: #6b21a8;
  border-color: #e9d5ff;
}
.btn-dl-copy:hover {
  background: #f3e8ff;
  border-color: #d8b4fe;
}

.btn-dl-folder {
  background: #fefce8;
  color: #854d0e;
  border-color: #fef08a;
}
.btn-dl-folder:hover {
  background: #fef9c3;
  border-color: #fde047;
}

/* BANDEAU ÉCHÉANCE & STATUT */
.box-deadline-strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
  margin-bottom: 1.2rem;
  border-radius: 8px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  font-size: 0.86rem;
  color: #166534;
}

.box-deadline-strip.is-overdue {
  background: #fff7ed;
  border-color: #fdba74;
  color: #9a3412;
}

.box-deadline-strip.no-deadline {
  background: var(--vp-c-bg);
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-2);
}

.bds-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bds-date {
  color: var(--vp-c-text-1);
}

.bds-date-empty {
  font-style: italic;
  opacity: 0.85;
}

.bds-badge-ok {
  background: #10b981;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 700;
}

.bds-badge-pending {
  background: #6b7280;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 700;
}

.bds-badge-late {
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 700;
}

/* ALERTE DE RETARD */
.box-late-callout {
  display: flex;
  gap: 0.75rem;
  padding: 0.9rem 1.1rem;
  border-radius: 8px;
  border: 1px solid;
  margin-bottom: 1.2rem;
  align-items: flex-start;
}

.blc-icon {
  font-size: 1.3rem;
  line-height: 1;
}

.blc-title {
  font-size: 0.92rem;
  margin-bottom: 0.2rem;
}

.blc-desc {
  font-size: 0.86rem;
  line-height: 1.4;
}

/* FEEDBACK ENSEIGNANT */
.box-teacher-feedback {
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 10px;
  padding: 1rem 1.2rem;
  margin-bottom: 1.2rem;
}

.btf-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 0.6rem;
}

.btf-title-group {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.btf-icon {
  font-size: 1.3rem;
}

.btf-title {
  font-weight: 700;
  font-size: 0.92rem;
  color: #166534;
}

.btf-date {
  font-size: 0.78rem;
  color: #15803d;
}

.btf-score-badge {
  background: #166534;
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.btf-quote {
  font-style: italic;
  font-size: 0.9rem;
  color: #14532d;
  line-height: 1.45;
  background: white;
  padding: 0.7rem 0.9rem;
  border-radius: 6px;
  border: 1px solid #bbf7d0;
}

/* CARTE DE REDIRECTION ESPACE MEMBRE */
.box-member-redirect-card {
  background: var(--vp-c-bg);
  border: 1.5px solid var(--vp-c-brand-1);
  border-radius: 10px;
  padding: 1.2rem 1.4rem;
}

.bmrc-header {
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.bmrc-icon-block {
  font-size: 1.6rem;
  line-height: 1;
}

.bmrc-info h5 {
  margin: 0 0 0.35rem 0;
  font-size: 1.05rem;
  color: var(--vp-c-brand-1);
}

.bmrc-info p {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.45;
  color: var(--vp-c-text-2);
}

.bmrc-file-status {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.bfs-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.bfs-icon {
  font-size: 1.2rem;
}

.bfs-name {
  font-size: 0.88rem;
  color: var(--vp-c-text-1);
}

.bfs-meta {
  font-size: 0.76rem;
  color: var(--vp-c-text-2);
}

.bfs-ai-score {
  font-size: 0.84rem;
  color: #3730a3;
  background: #e0e7ff;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.bmrc-action-row {
  display: flex;
}

.btn-goto-member {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  background: var(--vp-c-brand-1);
  color: white !important;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.92rem;
  text-decoration: none !important;
  transition: opacity 0.2s ease, transform 0.1s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.btn-goto-member:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}
</style>
