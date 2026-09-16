<script setup>
import { ref, computed } from 'vue'
import { userStore } from '../stores/userStore'
import { withBase } from 'vitepress'

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const loginEmail = ref('')
const activeTab = ref('progress') // 'progress' | 'exercises' | 'files'

// Dépôt de fichiers
const selectedExerciseForUpload = ref('exercice-01')
const selectedFile = ref(null)
const uploadFeedback = ref({ type: '', message: '' })
const isUploading = ref(false)

const courseModules = [
  { id: 'mod-1', title: '1. Compétences Numériques', link: '/modules/01-competences-numeriques' },
  { id: 'mod-2', title: '2. Référentiel FMTTN (FWB)', link: '/modules/02-referentiel-fmttn' },
  { id: 'mod-3', title: '3. Méthodologies pédagogiques', link: '/modules/03-pedagogies-actives' },
  { id: 'mod-4', title: '4. Préparer une Leçon FMTTN', link: '/modules/04-preparation-lecon-fmttn' },
  { id: 'mod-5', title: '5. Projet Jeu de société', link: '/modules/05-projet-jeu-societe' },
  { id: 'mod-6', title: '6. Exercices pratiques', link: '/ateliers/' },
  { id: 'mod-7', title: '7. Guide & Évaluation', link: '/guide/distanciel' },
  { id: 'mod-8', title: '8. Ressources & Outils', link: '/ressources/documents' }
]

const availableExercises = [
  { id: 'exercice-01', title: 'Atelier 1 : Diagnostic de compétences numériques' },
  { id: 'exercice-02', title: 'Atelier 2 : Peut-on faire confiance à cette information ?' },
  { id: 'exercice-03', title: 'Atelier 3 : Concevoir un guide numérique pour les élèves' },
  { id: 'exercice-04', title: 'Atelier 4 : Escape Game FMTTN (Cyber-Enquête)' },
  { id: 'exercice-05', title: 'Atelier 5 : Défi 20 minutes (Affiche Canva mot de passe)' },
  { id: 'exercice-06', title: 'Atelier 6 : Défi Hardware (Démonter et remonter un PC)' },
  { id: 'exercice-video', title: 'Atelier 7 : Capsule Vidéo du jeu' },
  { id: 'projet-jeu', title: 'Projet : Dossier pédagogique du Jeu de société' },
  { id: 'autre-travail', title: 'Autre travail ou document didactique libre' }
]

const currentUser = computed(() => userStore.currentUser)
const progressPercent = computed(() => userStore.calculateUserProgressPercent())
const userFiles = computed(() => userStore.getUserFiles())

// Aperçu en temps réel du nom de fichier généré
const previewFormattedName = computed(() => {
  if (!selectedFile.value) return ''
  const ex = availableExercises.find(e => e.id === selectedExerciseForUpload.value)
  const exTitle = ex ? ex.title : 'Devoir'
  return userStore.getFormattedNamePreview(exTitle, selectedFile.value.name)
})

function handleRegister() {
  if (!firstName.value || !lastName.value || !email.value) {
    alert('Veuillez remplir tous les champs.')
    return
  }
  userStore.register(firstName.value, lastName.value, email.value)
}

function handleLogin() {
  if (!loginEmail.value) {
    alert('Veuillez entrer votre adresse email.')
    return
  }
  const res = userStore.login(loginEmail.value)
  if (!res.success) {
    alert(res.message)
  }
}

function handleLogout() {
  userStore.logout()
}

function toggleModule(id) {
  userStore.toggleModuleProgress(id)
}

function isCompleted(id) {
  return userStore.isModuleCompleted(id)
}

function getAnswer(exId) {
  return userStore.getUserSubmission(exId)
}

const editAnswerId = ref(null)
const editAnswerText = ref('')

function startEdit(exId) {
  editAnswerId.value = exId
  editAnswerText.value = getAnswer(exId)
}

function saveEdit(exId, exTitle) {
  userStore.saveSubmission(exId, exTitle, editAnswerText.value)
  editAnswerId.value = null
}

function onFileChange(event) {
  uploadFeedback.value = { type: '', message: '' }
  const file = event.target.files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

async function handleFileUpload() {
  if (!selectedFile.value) {
    uploadFeedback.value = { type: 'error', message: 'Veuillez sélectionner un fichier.' }
    return
  }

  isUploading.value = true
  uploadFeedback.value = { type: '', message: '' }

  const ex = availableExercises.find(e => e.id === selectedExerciseForUpload.value)
  const exTitle = ex ? ex.title : 'Devoir'

  try {
    const res = await userStore.uploadStudentFile(
      selectedExerciseForUpload.value,
      exTitle,
      selectedFile.value
    )

    if (res.success) {
      uploadFeedback.value = { type: 'success', message: res.message }
      selectedFile.value = null
      // Réinitialiser le champ de fichier
      const fileInput = document.getElementById('student-file-input')
      if (fileInput) fileInput.value = ''
    } else {
      uploadFeedback.value = { type: 'error', message: res.message }
    }
  } catch (err) {
    uploadFeedback.value = { 
      type: 'error', 
      message: 'Erreur lors de la lecture du document. Veuillez réessayer.' 
    }
  } finally {
    isUploading.value = false
  }
}

function downloadFile(f) {
  userStore.downloadSubmittedFile(f)
}

function deleteFile(fileId) {
  if (confirm('Voulez-vous supprimer ce document déposé ?')) {
    userStore.deleteStudentFile(fileId)
  }
}

function formatSize(bytes) {
  if (!bytes) return '0 Ko'
  if (bytes < 1024 * 1024) {
    return Math.round(bytes / 1024) + ' Ko'
  }
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo'
}
</script>

<template>
  <div class="member-container">
    <!-- UTILISATEUR NON CONNECTÉ : FORMULAIRE D'INSCRIPTION / CONNEXION -->
    <div v-if="!currentUser" class="auth-card">
      <div class="auth-header">
        <span class="auth-icon">🎓</span>
        <h2>Espace Membre Étudiant</h2>
        <p>Inscrivez-vous pour enregistrer vos réponses aux exercices, déposer vos documents Word ou PDF et suivre votre progression tout au long du quadrimestre.</p>
      </div>

      <div class="auth-forms-grid">
        <!-- INSCRIPTION -->
        <div class="form-box">
          <h3>Nouvelle Inscription</h3>
          <p class="form-desc">Créez votre profil étudiant en quelques secondes :</p>
          <div class="input-group">
            <label>Prénom</label>
            <input v-model="firstName" type="text" placeholder="Ex: Sarah" />
          </div>
          <div class="input-group">
            <label>Nom</label>
            <input v-model="lastName" type="text" placeholder="Ex: Dubois" />
          </div>
          <div class="input-group">
            <label>Adresse Email HECh</label>
            <input v-model="email" type="email" placeholder="Ex: sarah.dubois@student.hech.be" />
          </div>
          <button @click="handleRegister" class="btn-primary">
            S'inscrire & Démarrer mon suivi →
          </button>
        </div>

        <!-- RE-CONNEXION -->
        <div class="form-box secondary">
          <h3>Déjà inscrit ?</h3>
          <p class="form-desc">Connectez-vous avec votre adresse email :</p>
          <div class="input-group">
            <label>Votre Adresse Email</label>
            <input v-model="loginEmail" type="email" placeholder="sarah.dubois@student.hech.be" />
          </div>
          <button @click="handleLogin" class="btn-secondary">
            Accéder à mon espace →
          </button>
        </div>
      </div>
    </div>

    <!-- UTILISATEUR CONNECTÉ : TABLEAU DE BORD PERSONNEL -->
    <div v-else class="dashboard-card">
      <!-- HEADER PROFIL -->
      <div class="profile-header">
        <div class="user-meta">
          <div class="avatar-badge">
            {{ currentUser.firstName[0] }}{{ currentUser.lastName[0] }}
          </div>
          <div>
            <h2 class="user-name">{{ currentUser.firstName }} {{ currentUser.lastName }}</h2>
            <p class="user-email">{{ currentUser.email }} • Étudiant M1 Math-Numérique</p>
          </div>
        </div>
        <button @click="handleLogout" class="btn-logout">
          Déconnexion
        </button>
      </div>

      <!-- PROGRESSION GLOBALE -->
      <div class="progress-banner">
        <div class="progress-labels">
          <span class="progress-title">Progression générale du cours</span>
          <span class="progress-percent">{{ progressPercent }}% complété</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>

      <!-- ONGLETS DE NAVIGATION -->
      <div class="tab-bar">
        <button 
          :class="['tab-btn', { active: activeTab === 'progress' }]"
          @click="activeTab = 'progress'"
        >
          📋 Suivi des Chapitres
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'exercises' }]"
          @click="activeTab = 'exercises'"
        >
          ✏️ Réponses Rédigées
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'files' }]"
          @click="activeTab = 'files'"
        >
          📁 Dépôt de Travaux (Word / PDF) ({{ userFiles.length }})
        </button>
      </div>

      <!-- VUE 1 : CHECKLIST DES CHAPITRES -->
      <div v-if="activeTab === 'progress'" class="tab-content">
        <div class="modules-checklist">
          <div 
            v-for="mod in courseModules" 
            :key="mod.id"
            :class="['module-item', { done: isCompleted(mod.id) }]"
          >
            <div class="mod-info">
              <span class="status-icon">{{ isCompleted(mod.id) ? '✅' : '⚪' }}</span>
              <a :href="withBase(mod.link)" class="mod-link">{{ mod.title }}</a>
            </div>
            <button 
              @click="toggleModule(mod.id)" 
              :class="['btn-toggle', { done: isCompleted(mod.id) }]"
            >
              {{ isCompleted(mod.id) ? 'Terminé (annuler)' : 'Marquer comme lu' }}
            </button>
          </div>
        </div>
      </div>

      <!-- VUE 2 : MES RÉPONSES AUX EXERCICES -->
      <div v-if="activeTab === 'exercises'" class="tab-content">
        <div class="exercises-list">
          <div 
            v-for="ex in availableExercises" 
            :key="ex.id"
            class="exercise-box-card"
          >
            <div class="ex-card-header">
              <h4>{{ ex.title }}</h4>
              <span v-if="getAnswer(ex.id)" class="badge-submitted">Répondu ✓</span>
              <span v-else class="badge-pending">À rédiger</span>
            </div>

            <div v-if="editAnswerId === ex.id" class="edit-area">
              <textarea 
                v-model="editAnswerText" 
                rows="4" 
                placeholder="Rédigez ou modifiez votre réponse..."
              ></textarea>
              <div class="edit-actions">
                <button @click="saveEdit(ex.id, ex.title)" class="btn-save">Enregistrer</button>
                <button @click="editAnswerId = null" class="btn-cancel">Annuler</button>
              </div>
            </div>

            <div v-else class="saved-answer-view">
              <div v-if="getAnswer(ex.id)" class="answer-content">
                <p>{{ getAnswer(ex.id) }}</p>
                <button @click="startEdit(ex.id)" class="btn-edit-link">Modifier ma réponse ✎</button>
              </div>
              <div v-else class="empty-answer">
                <p>Aucune réponse textuelle enregistrée pour cet exercice.</p>
                <button @click="startEdit(ex.id)" class="btn-add-answer">+ Rédiger une réponse</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- VUE 3 : DÉPÔT DE TRAVAUX (WORD / PDF) -->
      <div v-if="activeTab === 'files'" class="tab-content">
        <!-- FORMULAIRE DE DÉPÔT -->
        <div class="upload-box-card">
          <div class="upload-header">
            <h3>📤 Déposer un fichier Word ou PDF pour l'enseignant</h3>
            <p>
              Sélectionnez l'atelier concerné et choisissez votre document. Le système le renommera et le libellera automatiquement selon les normes institutionnelles de l'enseignant.
            </p>
          </div>

          <div v-if="uploadFeedback.message" :class="['feedback-msg', uploadFeedback.type]">
            {{ uploadFeedback.type === 'success' ? '✅ ' : '⚠️ ' }} {{ uploadFeedback.message }}
          </div>

          <div class="upload-form-grid">
            <div class="upload-field">
              <label>1. Choisir l'Atelier / Travail :</label>
              <select v-model="selectedExerciseForUpload">
                <option v-for="ex in availableExercises" :key="ex.id" :value="ex.id">
                  {{ ex.title }}
                </option>
              </select>
            </div>

            <div class="upload-field">
              <label>2. Sélectionner votre document (.pdf, .docx, .doc) :</label>
              <input 
                id="student-file-input"
                type="file" 
                accept=".pdf,.docx,.doc,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                @change="onFileChange"
              />
            </div>
          </div>

          <!-- APERÇU DYNAMIQUE DU NOM DE FICHIER GÉNÉRÉ -->
          <div v-if="previewFormattedName" class="file-name-preview-box">
            <span class="preview-tag">🏷️ Libellé officiel automatique :</span>
            <code class="preview-filename">{{ previewFormattedName }}</code>
          </div>

          <div class="upload-actions">
            <button 
              @click="handleFileUpload" 
              :disabled="!selectedFile || isUploading"
              class="btn-submit-upload"
            >
              {{ isUploading ? 'Transmission en cours...' : 'Envoyer mon travail à l\'enseignant →' }}
            </button>
          </div>
        </div>

        <!-- LISTE DES DOCUMENTS DÉPOSÉS PAR CET ÉTUDIANT -->
        <div class="submitted-files-section">
          <h4>📑 Mes documents déposés ({{ userFiles.length }})</h4>
          
          <div v-if="userFiles.length === 0" class="empty-files-msg">
            <p>Vous n'avez pas encore déposé de document Word ou PDF.</p>
          </div>

          <div v-else class="files-cards-grid">
            <div v-for="file in userFiles" :key="file.id" class="file-card">
              <div class="file-card-top">
                <span class="file-icon">{{ file.formattedFileName.endsWith('.pdf') ? '📕' : '📘' }}</span>
                <div class="file-details">
                  <div class="file-title-badge">{{ file.exerciseTitle }}</div>
                  <div class="file-name-code">{{ file.formattedFileName }}</div>
                  <div class="file-meta-row">
                    <span>Taille : {{ formatSize(file.fileSize) }}</span>
                    <span>•</span>
                    <span>Déposé le {{ file.submittedAt }}</span>
                  </div>
                </div>
              </div>

              <div class="file-card-actions">
                <button @click="downloadFile(file)" class="btn-file-dl">
                  📥 Télécharger
                </button>
                <button @click="deleteFile(file.id)" class="btn-file-del" title="Supprimer ce fichier">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.member-container {
  max-width: 960px;
  margin: 1.5rem auto 4rem auto;
  padding: 0 1rem;
}

.auth-card, .dashboard-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}

.auth-header {
  text-align: center;
  margin-bottom: 2.2rem;
}

.auth-icon {
  font-size: 2.5rem;
  display: inline-block;
  margin-bottom: 0.5rem;
}

.auth-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  font-weight: 800;
}

.auth-header p {
  color: var(--vp-c-text-2);
  max-width: 550px;
  margin: 0 auto;
  font-size: 0.95rem;
}

.auth-forms-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .auth-forms-grid {
    grid-template-columns: 1fr;
  }
}

.form-box {
  background: var(--vp-c-bg-alt);
  padding: 1.6rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
}

.form-box.secondary {
  border-left: 3px solid var(--vp-c-brand-1);
}

.form-box h3 {
  margin: 0 0 0.4rem 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.form-desc {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1.2rem;
}

.input-group {
  margin-bottom: 1rem;
}

.input-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: var(--vp-c-text-1);
}

.input-group input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  box-sizing: border-box;
}

.input-group input:focus {
  border-color: var(--vp-c-brand-1);
  outline: none;
}

.btn-primary {
  width: 100%;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: opacity 0.2s;
}

.btn-secondary {
  width: 100%;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  padding: 10px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.2s;
}

.btn-primary:hover, .btn-secondary:hover {
  opacity: 0.9;
}

/* PROFIL HEADER */
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-badge {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  color: white;
  font-weight: 800;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 800;
}

.user-email {
  margin: 0;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.btn-logout {
  background: none;
  border: 1px solid var(--vp-c-divider);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.btn-logout:hover {
  color: #ef4444;
  border-color: #fca5a5;
}

/* BANNIÈRE PROGRESSION */
.progress-banner {
  background: var(--vp-c-bg-alt);
  padding: 1.2rem 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  margin-bottom: 1.8rem;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 0.6rem;
}

.progress-percent {
  color: #10b981;
}

.progress-track {
  width: 100%;
  height: 10px;
  background: var(--vp-c-divider);
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.3s ease;
}

/* ONGLETS */
.tab-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 0.5rem;
  flex-wrap: wrap;
}

.tab-btn {
  background: none;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  color: var(--vp-c-text-2);
  transition: all 0.2s;
}

.tab-btn.active {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

/* LISTE DES MODULES */
.modules-checklist {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.module-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: var(--vp-c-bg-alt);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  transition: border-color 0.2s;
}

.module-item.done {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.mod-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mod-link {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.mod-link:hover {
  color: var(--vp-c-brand-1);
}

.btn-toggle {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
}

.btn-toggle.done {
  background: #d1fae5;
  color: #065f46;
  border-color: #10b981;
}

/* EXERCICES LIST */
.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.exercise-box-card {
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 1.2rem;
}

.ex-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.ex-card-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.badge-submitted {
  background: #d1fae5;
  color: #065f46;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.badge-pending {
  background: #fef3c7;
  color: #92400e;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.edit-area textarea {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: inherit;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.6rem;
}

.btn-save {
  background: #10b981;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-cancel {
  background: none;
  border: 1px solid var(--vp-c-divider);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
}

.saved-answer-view .answer-content p {
  margin: 0 0 0.6rem 0;
  font-size: 0.9rem;
  line-height: 1.5;
  background: var(--vp-c-bg);
  padding: 10px;
  border-radius: 6px;
  border-left: 3px solid var(--vp-c-brand-1);
}

.btn-edit-link {
  background: none;
  border: none;
  color: var(--vp-c-brand-1);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.empty-answer p {
  margin: 0 0 0.5rem 0;
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  font-style: italic;
}

.btn-add-answer {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
}

/* SECTION DÉPÔT DE FICHIERS */
.upload-box-card {
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 12px;
  padding: 1.6rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.06);
}

.upload-header h3 {
  margin: 0 0 0.4rem 0;
  font-size: 1.15rem;
  font-weight: 800;
}

.upload-header p {
  margin: 0 0 1.2rem 0;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.upload-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
  margin-bottom: 1.2rem;
}

@media (max-width: 768px) {
  .upload-form-grid {
    grid-template-columns: 1fr;
  }
}

.upload-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.upload-field label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.upload-field select, .upload-field input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.88rem;
}

.file-name-preview-box {
  background: var(--vp-c-bg);
  border: 1px dashed var(--vp-c-brand-1);
  border-radius: 8px;
  padding: 0.8rem 1rem;
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.preview-tag {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-filename {
  font-family: monospace;
  font-size: 0.95rem;
  font-weight: 700;
  color: #10b981;
  word-break: break-all;
}

.upload-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-submit-upload {
  background: #10b981;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-submit-upload:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.feedback-msg {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
}

.feedback-msg.success {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
}

.feedback-msg.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

/* LISTE DES FICHIERS DÉPOSÉS */
.submitted-files-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 800;
}

.empty-files-msg {
  text-align: center;
  padding: 2rem;
  background: var(--vp-c-bg-alt);
  border-radius: 10px;
  color: var(--vp-c-text-3);
  font-style: italic;
}

.files-cards-grid {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.file-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 1rem 1.2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.file-card-top {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.file-icon {
  font-size: 2rem;
}

.file-title-badge {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  margin-bottom: 2px;
}

.file-name-code {
  font-family: monospace;
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--vp-c-text-1);
  word-break: break-all;
}

.file-meta-row {
  display: flex;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  margin-top: 4px;
}

.file-card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-file-dl {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-file-dl:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.btn-file-del {
  background: none;
  border: 1px solid var(--vp-c-divider);
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  color: #ef4444;
}

.btn-file-del:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}
</style>
