<script setup>
import { ref, computed, onMounted } from 'vue'
import { userStore, formatDeadlineDisplay, getAlarmLevelInfo, parseDeadline } from '../stores/userStore'

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

const answerText = ref('')
const inlineFirst = ref('')
const inlineLast = ref('')
const inlineEmail = ref('')
const saveStatus = ref('')

// Gestion du fichier joint
const showFileUpload = ref(false)
const showAiDetails = ref(false)
const selectedExerciseFile = ref(null)
const fileUploadStatus = ref('')
const isUploadingFile = ref(false)

const currentUser = computed(() => userStore.currentUser)

// Fichier déjà déposé pour cet exercice
const attachedFile = computed(() => {
  const files = userStore.getUserFiles()
  return files.find(f => f.exerciseId === props.exerciseId)
})

// Commentaire & note de l'enseignant
const teacherFeedback = computed(() => {
  return userStore.getExerciseFeedback(props.exerciseId)
})

// Échéance et alerte de retard graduée (Orange > 1 sem, Bordeaux > 2 sem, Rouge > 1 mois)
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
  if (daysLate < 7) return null // Alerte uniquement à partir d'1 semaine de retard (Orange, Bordeaux, Rouge)
  const alarmInfo = getAlarmLevelInfo(daysLate)
  return {
    daysLate,
    alarmInfo,
    deadlineFormatted: formatDeadlineDisplay(d.deadline)
  }
})

// Aperçu du nom de fichier normalisé
const previewFileName = computed(() => {
  if (!selectedExerciseFile.value) return ''
  return userStore.getFormattedNamePreview(props.exerciseTitle, selectedExerciseFile.value.name)
})

onMounted(() => {
  userStore.syncFromStorage()
  if (currentUser.value) {
    answerText.value = userStore.getUserSubmission(props.exerciseId)
  }
})

function handleSave() {
  if (!currentUser.value) {
    if (!inlineFirst.value || !inlineLast.value || !inlineEmail.value) {
      alert('Veuillez renseigner votre prénom, nom et adresse email pour enregistrer votre travail.')
      return
    }
    userStore.register(inlineFirst.value, inlineLast.value, inlineEmail.value)
  }

  const res = userStore.saveSubmission(props.exerciseId, props.exerciseTitle, answerText.value)
  if (res.success) {
    saveStatus.value = '✓ Réponse enregistrée ! Votre enseignant peut désormais la consulter dans son espace.'
    setTimeout(() => {
      saveStatus.value = ''
    }, 4000)
  } else {
    alert(res.message)
  }
}

function onFileSelected(e) {
  fileUploadStatus.value = ''
  const file = e.target.files?.[0]
  if (file) {
    selectedExerciseFile.value = file
  }
}

async function handleUploadAttachedFile() {
  if (!currentUser.value) {
    if (!inlineFirst.value || !inlineLast.value || !inlineEmail.value) {
      alert('Veuillez d\'abord renseigner votre prénom, nom et adresse email.')
      return
    }
    userStore.register(inlineFirst.value, inlineLast.value, inlineEmail.value)
  }

  if (!selectedExerciseFile.value) {
    alert('Veuillez sélectionner un fichier Word ou PDF.')
    return
  }

  isUploadingFile.value = true
  fileUploadStatus.value = ''

  try {
    const res = await userStore.uploadStudentFile(
      props.exerciseId,
      props.exerciseTitle,
      selectedExerciseFile.value
    )

    if (res.success) {
      fileUploadStatus.value = `✓ Document déposé : ${res.file?.formattedFileName}`
      selectedExerciseFile.value = null
      showFileUpload.value = false
    } else {
      fileUploadStatus.value = `⚠️ ${res.message}`
    }
  } catch (e) {
    fileUploadStatus.value = '⚠️ Erreur lors du dépôt du document.'
  } finally {
    isUploadingFile.value = false
  }
}

function downloadAttachedFile() {
  if (attachedFile.value) {
    userStore.downloadSubmittedFile(attachedFile.value)
  }
}

function deleteAttachedFile() {
  if (attachedFile.value && confirm('Voulez-vous supprimer ce document joint ?')) {
    userStore.deleteStudentFile(attachedFile.value.id)
  }
}

function formatSize(bytes) {
  if (!bytes) return '0 Ko'
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' Ko'
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo'
}
</script>

<template>
  <div class="exercise-submit-box">
    <div class="box-header">
      <span class="box-badge">Zone de Travail Étudiant</span>
      <h4>Rédiger ou déposer votre travail pour cet atelier</h4>
    </div>

    <!-- BANDEAU ÉCHÉANCE & STATUT TOUJOURS VISIBLE -->
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
          Ce travail devait être remis pour le <strong>{{ lateAlert.deadlineFormatted }}</strong>. Vous avez actuellement <strong>{{ lateAlert.daysLate }} jour(s) de retard</strong>. Veuillez déposer votre document dès que possible.
        </div>
      </div>
    </div>

    <!-- IDENTIFICATION RAPIDE SI NON CONNECTÉ -->
    <div v-if="!currentUser" class="inline-auth-row">
      <p class="inline-auth-notice">
        💡 Entrez votre nom et email pour que votre réponse soit transmise à l'enseignant :
      </p>
      <div class="inline-inputs">
        <input v-model="inlineFirst" type="text" placeholder="Votre prénom" />
        <input v-model="inlineLast" type="text" placeholder="Votre nom" />
        <input v-model="inlineEmail" type="email" placeholder="votre.email@student.hech.be" />
      </div>
    </div>

    <div v-else class="logged-as-row">
      Connecté en tant que <strong>{{ currentUser.firstName }} {{ currentUser.lastName }}</strong> ({{ currentUser.email }})
    </div>

    <!-- COMMENTAIRE & ÉVALUATION TRANSMIS PAR L'ENSEIGNANT -->
    <div v-if="teacherFeedback" class="box-teacher-feedback">
      <div class="btf-header">
        <div class="btf-title-group">
          <span class="btf-icon">👨‍🏫</span>
          <div>
            <div class="btf-title">Commentaire & Évaluation de votre enseignant</div>
            <div class="btf-date">Transmis le {{ teacherFeedback.gradedAt }}</div>
          </div>
        </div>
        <div v-if="teacherFeedback.score !== undefined && teacherFeedback.score !== null" class="btf-score-badge">
          Note : <strong>{{ teacherFeedback.score }}</strong> / 10 pts
        </div>
      </div>
      <div class="btf-body">
        <div class="btf-quote">
          « {{ teacherFeedback.feedback }} »
        </div>
      </div>
    </div>

    <!-- ZONE DE TEXTE -->
    <div class="text-area-wrapper">
      <textarea 
        v-model="answerText" 
        rows="5" 
        placeholder="Rédigez votre réflexion ou votre réponse argumentée ici..."
      ></textarea>
    </div>

    <!-- ACTIONS : SAUVEGARDER TEXTE + TIROIR FICHIER WORD/PDF -->
    <div class="box-actions">
      <button @click="handleSave" class="btn-submit-answer">
        💾 Enregistrer ma réponse
      </button>

      <button 
        @click="showFileUpload = !showFileUpload" 
        class="btn-toggle-upload"
      >
        {{ showFileUpload ? '✕ Masquer l\'envoi de fichier' : '📎 Joindre un fichier Word ou PDF' }}
      </button>

      <span v-if="saveStatus" class="save-msg">{{ saveStatus }}</span>
    </div>

    <!-- FICHIER DÉJÀ JOINT -->
    <div v-if="attachedFile" class="attached-file-banner">
      <span class="file-icon">📄</span>
      <div class="attached-meta">
        <span class="attached-label">Document officiel déposé :</span>
        <code class="attached-name">{{ attachedFile.formattedFileName }}</code>
        <span class="attached-size">({{ formatSize(attachedFile.fileSize) }} • Déposé le {{ attachedFile.submittedAt }})</span>
      </div>
      <div class="attached-actions">
        <button @click="downloadAttachedFile" class="btn-attached-dl" title="Télécharger mon document">📥</button>
        <button @click="deleteAttachedFile" class="btn-attached-del" title="Supprimer">🗑️</button>
      </div>
    </div>

    <!-- ÉVALUATION CONTINUE & FEEDBACK GÉNÉRÉ PAR L'IA -->
    <div v-if="attachedFile && attachedFile.aiCorrection" class="box-ai-feedback">
      <div class="aifb-header">
        <div class="aifb-title-group">
          <span class="aifb-badge">🤖 Évaluation continue IA</span>
          <div>
            <div class="aifb-title">Diagnostic & Feedback pédagogique immédiat</div>
            <div class="aifb-sub">Généré le {{ attachedFile.aiCorrection.gradedAt }} • Modèle : {{ attachedFile.aiCorrection.modelUsed }}</div>
          </div>
        </div>
        <div class="aifb-score-badge">
          Note indicative : <strong>{{ attachedFile.aiCorrection.suggestedScore }}</strong> / {{ attachedFile.aiCorrection.maxScore }} pts
        </div>
      </div>

      <div class="aifb-body">
        <p class="aifb-summary">{{ attachedFile.aiCorrection.summary }}</p>

        <div class="aifb-columns">
          <div v-if="attachedFile.aiCorrection.strengths?.length" class="aifb-col aifb-strengths">
            <h6>✅ Points forts identifiés :</h6>
            <ul>
              <li v-for="(str, idx) in attachedFile.aiCorrection.strengths" :key="'str-' + idx">{{ str }}</li>
            </ul>
          </div>
          <div v-if="attachedFile.aiCorrection.improvements?.length" class="aifb-col aifb-improvements">
            <h6>💡 Pistes d'amélioration :</h6>
            <ul>
              <li v-for="(imp, idx) in attachedFile.aiCorrection.improvements" :key="'imp-' + idx">{{ imp }}</li>
            </ul>
          </div>
        </div>

        <!-- Tableau des critères détaillés déroulable -->
        <div v-if="attachedFile.aiCorrection.criteriaTable && attachedFile.aiCorrection.criteriaTable.length" class="aifb-criteria-section">
          <button @click="showAiDetails = !showAiDetails" class="btn-toggle-criteria" type="button">
            <span>{{ showAiDetails ? '▼ Masquer la grille critériée détaillée' : '▶ Voir la grille critériée détaillée (' + attachedFile.aiCorrection.criteriaTable.length + ' critères)' }}</span>
          </button>

          <div v-if="showAiDetails" class="aifb-table-wrap">
            <table class="aifb-table">
              <thead>
                <tr>
                  <th>Critère</th>
                  <th style="width: 70px; text-align: center;">Points</th>
                  <th style="width: 105px; text-align: center;">Niveau</th>
                  <th>Appréciation didactique</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in attachedFile.aiCorrection.criteriaTable" :key="c.id">
                  <td><strong>{{ c.name }}</strong></td>
                  <td style="text-align: center;"><strong>{{ c.awardedPoints }}</strong>/{{ c.maxPoints }}</td>
                  <td style="text-align: center;">
                    <span class="level-pill" :class="'level-' + c.level.toLowerCase()">{{ c.level }}</span>
                  </td>
                  <td>{{ c.comment }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="aifb-disclaimer">
          ⚖️ <em>Ce diagnostic continu vous guide en temps réel. La note officielle sera validée et réévaluée par l'enseignant en fin de quadrimestre (100 pts plateforme / 100 pts projet).</em>
          <a href="/guide/criteres-correction-ia" target="_blank" class="aifb-link-rules">Consulter la grille des critères IA ↗</a>
        </div>
      </div>
    </div>

    <!-- TIROIR D'UPLOAD DE DOCUMENT -->
    <div v-if="showFileUpload" class="file-upload-drawer">
      <div class="drawer-header">
        <h5>📎 Déposer un document Word (.docx, .doc) ou PDF (.pdf)</h5>
        <p>Le document sera automatiquement nommé avec votre nom pour l'enseignant.</p>
      </div>

      <div class="drawer-input-row">
        <input 
          type="file" 
          accept=".pdf,.docx,.doc,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          @change="onFileSelected"
        />
        <button 
          @click="handleUploadAttachedFile" 
          :disabled="!selectedExerciseFile || isUploadingFile"
          class="btn-confirm-file-upload"
        >
          {{ isUploadingFile ? 'Envoi...' : 'Déposer le fichier' }}
        </button>
      </div>

      <!-- Aperçu du nom normalisé -->
      <div v-if="previewFileName" class="drawer-preview-name">
        <span>Libellé automatique : </span>
        <code>{{ previewFileName }}</code>
      </div>

      <div v-if="fileUploadStatus" class="drawer-feedback">
        {{ fileUploadStatus }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.exercise-submit-box {
  margin: 2rem 0;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 12px;
  padding: 1.4rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.box-header {
  margin-bottom: 1rem;
}

.box-badge {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.box-header h4 {
  margin: 0.4rem 0 0 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.inline-auth-row {
  background: var(--vp-c-bg-alt);
  padding: 0.8rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.inline-auth-notice {
  margin: 0 0 0.5rem 0;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.inline-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr;
  gap: 0.6rem;
}

@media (max-width: 600px) {
  .inline-inputs {
    grid-template-columns: 1fr;
  }
}

.inline-inputs input {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  font-size: 0.85rem;
  color: var(--vp-c-text-1);
}

.logged-as-row {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.8rem;
}

.text-area-wrapper textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.92rem;
  font-family: inherit;
  line-height: 1.5;
  margin-bottom: 0.8rem;
  box-sizing: border-box;
}

.box-actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.btn-submit-answer {
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-submit-answer:hover {
  opacity: 0.9;
}

.btn-toggle-upload {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-toggle-upload:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.save-msg {
  font-size: 0.85rem;
  font-weight: 600;
  color: #10b981;
}

/* BANNIÈRE FICHIER ATTACHÉ */
.attached-file-banner {
  margin-top: 1rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.file-icon {
  font-size: 1.5rem;
}

.attached-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-grow: 1;
}

.attached-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #15803d;
  text-transform: uppercase;
}

.attached-name {
  font-family: monospace;
  font-size: 0.88rem;
  font-weight: 700;
  color: #166534;
  word-break: break-all;
}

.attached-size {
  font-size: 0.78rem;
  color: #65a30d;
}

.attached-actions {
  display: flex;
  gap: 6px;
}

.btn-attached-dl, .btn-attached-del {
  background: white;
  border: 1px solid #bbf7d0;
  padding: 5px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-attached-del:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

/* TIROIR D'UPLOAD */
.file-upload-drawer {
  margin-top: 1rem;
  background: var(--vp-c-bg-alt);
  border: 1px dashed var(--vp-c-brand-1);
  border-radius: 8px;
  padding: 1rem;
}

.drawer-header h5 {
  margin: 0 0 0.2rem 0;
  font-size: 0.95rem;
  font-weight: 700;
}

.drawer-header p {
  margin: 0 0 0.8rem 0;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.drawer-input-row {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  flex-wrap: wrap;
}

.drawer-input-row input {
  font-size: 0.85rem;
}

.btn-confirm-file-upload {
  background: #10b981;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-confirm-file-upload:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.drawer-preview-name {
  margin-top: 0.6rem;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.drawer-preview-name code {
  font-family: monospace;
  font-size: 0.85rem;
  font-weight: 700;
  color: #10b981;
}

.drawer-feedback {
  margin-top: 0.6rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #15803d;
}

/* ENCART FEEDBACK ENSEIGNANT */
.box-teacher-feedback {
  background: #f0fdf4;
  border: 1.5px solid #86efac;
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
  font-size: 1.4rem;
}

.btf-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #166534;
}

.btf-date {
  font-size: 0.78rem;
  color: #15803d;
}

.btf-score-badge {
  background: #166534;
  color: white;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.btf-score-badge strong {
  font-size: 1rem;
}

.btf-body {
  margin-top: 0.2rem;
}

.btf-quote {
  font-style: italic;
  font-size: 0.92rem;
  color: #14532d;
  line-height: 1.5;
  background: rgba(255, 255, 255, 0.7);
  padding: 0.6rem 0.9rem;
  border-left: 3px solid #22c55e;
  border-radius: 4px;
}

/* AI Feedback Box */
.box-ai-feedback {
  margin: 1.25rem 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%);
  border: 1.5px solid #3b82f6;
  padding: 1.2rem;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.1);
}

.aifb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  margin-bottom: 0.85rem;
}

.aifb-title-group {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.aifb-badge {
  background: #2563eb;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.aifb-title {
  font-weight: 700;
  font-size: 0.98rem;
  color: #1e3a8a;
}

.aifb-sub {
  font-size: 0.75rem;
  color: #4b5563;
}

.aifb-score-badge {
  background: #1d4ed8;
  color: #ffffff;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(29, 78, 216, 0.25);
}

.aifb-score-badge strong {
  font-size: 1.05rem;
}

.aifb-summary {
  font-size: 0.92rem;
  line-height: 1.55;
  color: #1f2937;
  background: rgba(255, 255, 255, 0.85);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border-left: 3.5px solid #2563eb;
  margin-bottom: 1rem;
}

.aifb-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.aifb-col {
  background: rgba(255, 255, 255, 0.75);
  border-radius: 8px;
  padding: 0.85rem 1rem;
}

.aifb-col h6 {
  margin: 0 0 0.5rem 0;
  font-size: 0.88rem;
  font-weight: 700;
}

.aifb-strengths h6 {
  color: #166534;
}

.aifb-improvements h6 {
  color: #b45309;
}

.aifb-col ul {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.85rem;
  color: #374151;
  line-height: 1.45;
}

.aifb-col li {
  margin-bottom: 0.35rem;
}

.aifb-criteria-section {
  margin-top: 0.75rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 0.75rem;
  border: 1px solid rgba(59, 130, 246, 0.15);
}

.btn-toggle-criteria {
  background: transparent;
  border: none;
  color: #2563eb;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  text-decoration: underline;
}

.btn-toggle-criteria:hover {
  color: #1d4ed8;
}

.aifb-table-wrap {
  margin-top: 0.75rem;
  overflow-x: auto;
}

.aifb-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

.aifb-table th {
  background: #f1f5f9;
  color: #334155;
  padding: 6px 10px;
  font-weight: 600;
  border-bottom: 1.5px solid #cbd5e1;
}

.aifb-table td {
  padding: 7px 10px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: top;
  line-height: 1.4;
  color: #334155;
}

.level-pill {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
}

.level-excellent {
  background: #dcfce7;
  color: #166534;
}

.level-bon {
  background: #e0e7ff;
  color: #3730a3;
}

.level-moyen {
  background: #fef3c7;
  color: #92400e;
}

.level-insuffisant {
  background: #fee2e2;
  color: #991b1b;
}

.aifb-disclaimer {
  margin-top: 0.85rem;
  padding-top: 0.75rem;
  border-top: 1px dashed rgba(59, 130, 246, 0.25);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: #4b5563;
}

.aifb-link-rules {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.aifb-link-rules:hover {
  text-decoration: underline;
}

/* BANDEAU ÉCHÉANCE & ALERTE RETARD */
.box-deadline-strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.65rem 0.95rem;
  margin-bottom: 0.85rem;
  font-size: 0.85rem;
}

.box-deadline-strip.is-overdue {
  border-color: #fdba74;
  background: #fffbf7;
}

.bds-left {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: #334155;
}

.bds-calendar-icon {
  font-size: 1rem;
}

.bds-label {
  color: #64748b;
}

.bds-date {
  color: #0f172a;
  font-weight: 700;
}

.bds-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bds-badge-ok {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
  padding: 3px 9px;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.bds-badge-pending {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 3px 9px;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 600;
}

.bds-badge-late {
  color: #ffffff;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 800;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.box-late-callout {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  border: 1px solid;
  border-left-width: 4px;
  margin-bottom: 1rem;
  font-size: 0.86rem;
}

.blc-icon {
  font-size: 1.3rem;
  line-height: 1;
}

.blc-content {
  flex: 1;
}

.blc-title {
  font-weight: 700;
  margin-bottom: 0.2rem;
}

.blc-desc {
  font-size: 0.82rem;
  line-height: 1.4;
  opacity: 0.95;
}
</style>
