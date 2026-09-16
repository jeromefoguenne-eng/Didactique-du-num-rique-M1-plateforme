<script setup>
import { ref, computed, onMounted } from 'vue'
import { userStore } from '../stores/userStore'

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
const selectedExerciseFile = ref(null)
const fileUploadStatus = ref('')
const isUploadingFile = ref(false)

const currentUser = computed(() => userStore.currentUser)

// Fichier déjà déposé pour cet exercice
const attachedFile = computed(() => {
  const files = userStore.getUserFiles()
  return files.find(f => f.exerciseId === props.exerciseId)
})

// Aperçu du nom de fichier normalisé
const previewFileName = computed(() => {
  if (!selectedExerciseFile.value) return ''
  return userStore.getFormattedNamePreview(props.exerciseTitle, selectedExerciseFile.value.name)
})

onMounted(() => {
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
</style>
