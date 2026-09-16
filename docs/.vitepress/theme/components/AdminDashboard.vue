<script setup>
import { ref, computed } from 'vue'
import { userStore } from '../stores/userStore'

const enteredPin = ref('')
const isAuthenticated = ref(false)
const adminTab = ref('students') // 'students' | 'submissions' | 'files' | 'export'

// Filtres et recherche pour l'onglet étudiants
const studentStatusFilter = ref('active') // 'all' | 'active' | 'archived'
const studentSearchQuery = ref('')

// Formulaire d'ajout d'étudiant
const showAddStudentModal = ref(false)
const newFirstName = ref('')
const newLastName = ref('')
const newEmail = ref('')
const addStudentError = ref('')

// Référence pour le téléversement de fichier CSV
const fileInputRef = ref(null)

// Sélecteurs et filtres pour les exercices
const selectedExerciseFilter = ref('all')
const selectedStudentFilter = ref('all')

// Filtres pour l'onglet fichiers
const fileStudentFilter = ref('all')
const fileExerciseFilter = ref('all')

// Gestion du changement de mot de passe enseignant
const oldPasswordInput = ref('')
const newPasswordInput = ref('')
const confirmPasswordInput = ref('')
const passwordChangeFeedback = ref({ type: '', message: '' })

// Webhook Google Drive
const webhookInput = ref(userStore.driveWebhook || '')
const webhookStatus = ref('')
const syncFeedback = ref('')
const isSyncing = ref(false)

const users = computed(() => userStore.users)
const submissions = computed(() => userStore.submissions)
const submittedFiles = computed(() => userStore.submittedFiles)

const totalStudents = computed(() => users.value.length)
const activeStudentsCount = computed(() => users.value.filter(u => u.status !== 'archived').length)
const archivedStudentsCount = computed(() => users.value.filter(u => u.status === 'archived').length)
const totalFilesCount = computed(() => submittedFiles.value.length)

const displayedUsers = computed(() => {
  return users.value.filter(u => {
    if (studentStatusFilter.value === 'active' && u.status === 'archived') return false
    if (studentStatusFilter.value === 'archived' && u.status !== 'archived') return false

    if (studentSearchQuery.value.trim()) {
      const q = studentSearchQuery.value.toLowerCase().trim()
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase()
      const email = u.email.toLowerCase()
      return fullName.includes(q) || email.includes(q)
    }
    return true
  })
})

const totalSubmissions = computed(() => submissions.value.length)

const averageProgress = computed(() => {
  const activeList = users.value.filter(u => u.status !== 'archived')
  if (activeList.length === 0) return 0
  const total = activeList.reduce((acc, u) => acc + userStore.calculateUserProgressPercent(u.email), 0)
  return Math.round(total / activeList.length)
})

const exerciseOptions = [
  { id: 'all', title: 'Tous les exercices' },
  { id: 'exercice-01', title: 'Atelier 1 : Diagnostic de compétences' },
  { id: 'exercice-02', title: 'Atelier 2 : Peut-on faire confiance ?' },
  { id: 'exercice-03', title: 'Atelier 3 : Guide numérique élèves' },
  { id: 'exercice-04', title: 'Atelier 4 : Escape Game FMTTN' },
  { id: 'exercice-05', title: 'Atelier 5 : Défi 20 min Canva' },
  { id: 'exercice-06', title: 'Atelier 6 : Défi Hardware PC' },
  { id: 'exercice-video', title: 'Atelier 7 : Capsule Vidéo' },
  { id: 'projet-jeu', title: 'Projet : Dossier Jeu de société' }
]

const filteredSubmissions = computed(() => {
  return submissions.value.filter(sub => {
    const matchEx = selectedExerciseFilter.value === 'all' || sub.exerciseId === selectedExerciseFilter.value
    const matchStudent = selectedStudentFilter.value === 'all' || sub.userEmail === selectedStudentFilter.value
    return matchEx && matchStudent
  })
})

const filteredFiles = computed(() => {
  return submittedFiles.value.filter(file => {
    const matchStudent = fileStudentFilter.value === 'all' || file.userEmail === fileStudentFilter.value
    const matchEx = fileExerciseFilter.value === 'all' || file.exerciseId === fileExerciseFilter.value
    return matchStudent && matchEx
  })
})

function checkPin() {
  if (userStore.verifyAdminPin(enteredPin.value)) {
    isAuthenticated.value = true
    enteredPin.value = ''
  } else {
    alert('Mot de passe enseignant incorrect. Veuillez vérifier votre saisie.')
  }
}

// Changement sécurisé du mot de passe admin
function handleChangePassword() {
  passwordChangeFeedback.value = { type: '', message: '' }

  if (!oldPasswordInput.value || !newPasswordInput.value || !confirmPasswordInput.value) {
    passwordChangeFeedback.value = {
      type: 'error',
      message: 'Veuillez renseigner tous les champs de mot de passe.'
    }
    return
  }

  const result = userStore.changeAdminPassword(
    oldPasswordInput.value,
    newPasswordInput.value,
    confirmPasswordInput.value
  )

  if (result.success) {
    passwordChangeFeedback.value = {
      type: 'success',
      message: 'Le mot de passe enseignant a été modifié avec succès !'
    }
    oldPasswordInput.value = ''
    newPasswordInput.value = ''
    confirmPasswordInput.value = ''
  } else {
    passwordChangeFeedback.value = {
      type: 'error',
      message: result.message
    }
  }
}

// Enregistrement du Webhook Google Drive
function handleSaveWebhook() {
  userStore.setDriveWebhook(webhookInput.value)
  webhookStatus.value = '✓ URL du Webhook Google Drive enregistrée avec succès !'
  setTimeout(() => { webhookStatus.value = '' }, 3500)
}

// Téléchargement du modèle CSV
function handleDownloadTemplate() {
  userStore.downloadCSVTemplate()
}

// Déclencheur du sélecteur de fichier CSV
function triggerFileInput() {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

// Importation du fichier CSV
function handleFileUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result
    if (typeof text === 'string') {
      const res = userStore.importStudentsFromCSV(text)
      alert(res.message)
    }
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
  reader.readAsText(file, 'UTF-8')
}

// Ajout manuel d'un étudiant
function handleAddStudent() {
  addStudentError.value = ''
  if (!newFirstName.value.trim() || !newLastName.value.trim() || !newEmail.value.trim()) {
    addStudentError.value = 'Veuillez renseigner tous les champs obligatoires.'
    return
  }
  if (!newEmail.value.includes('@')) {
    addStudentError.value = 'Veuillez saisir une adresse email valide.'
    return
  }

  const res = userStore.addStudent(newFirstName.value, newLastName.value, newEmail.value)
  if (res.success) {
    alert(res.message)
    newFirstName.value = ''
    newLastName.value = ''
    newEmail.value = ''
    showAddStudentModal.value = false
  } else {
    addStudentError.value = res.message
  }
}

// Archivage / Désarchivage
function handleToggleArchive(email) {
  userStore.toggleArchiveStudent(email)
}

// Suppression définitive
function handleDeleteStudent(user) {
  const msg = `Êtes-vous certain de vouloir supprimer définitivement l'étudiant "${user.firstName} ${user.lastName}" (${user.email}) ?\nCette action supprimera également toutes ses réponses et ses fichiers déposés.`
  if (window.confirm(msg)) {
    const res = userStore.deleteStudent(user.email)
    alert(res.message)
  }
}

// Téléchargement d'un fichier déposé individuel
function downloadFile(file) {
  userStore.downloadSubmittedFile(file)
}

// Suppression d'un fichier déposé
function deleteFile(fileId) {
  if (confirm('Voulez-vous supprimer définitivement ce document de la liste ?')) {
    userStore.deleteStudentFile(fileId)
  }
}

// Synchronisation directe vers le dossier Google Drive via l'API File System Access
async function handleSyncToDrive() {
  if (!window.showDirectoryPicker) {
    alert("Votre navigateur ne supporte pas l'accès direct aux dossiers locaux (File System Access API). Vous pouvez télécharger les documents directement via les boutons individuels.")
    return
  }

  try {
    isSyncing.value = true
    syncFeedback.value = 'Veuillez sélectionner votre dossier local Google Drive dans la boîte de dialogue...'
    
    // Ouvre la boîte de dialogue système pour choisir le dossier
    const dirHandle = await window.showDirectoryPicker({
      id: 'google-drive-exercises',
      mode: 'readwrite',
      startIn: 'documents'
    })

    syncFeedback.value = 'Écriture et libellé des fichiers en cours dans le dossier Google Drive...'
    const result = await userStore.syncFilesToDirectory(dirHandle)

    syncFeedback.value = `✅ ${result.count} document(s) enregistré(s) avec succès dans votre dossier Google Drive avec leur libellé officiel !`
  } catch (err) {
    if (err.name !== 'AbortError') {
      syncFeedback.value = `⚠️ Erreur de synchronisation : ${err.message}`
    } else {
      syncFeedback.value = ''
    }
  } finally {
    isSyncing.value = false
  }
}

function exportCSV() {
  let csv = 'Nom;Prenom;Email;Statut;Date_Inscription;Progression_Pourcent;Exercice;Reponse;Date_Soumission\n'
  
  users.value.forEach(u => {
    const prog = userStore.calculateUserProgressPercent(u.email)
    const userSubs = submissions.value.filter(s => s.userEmail === u.email)
    const statusLabel = u.status === 'archived' ? 'Archivé' : 'Actif'
    
    if (userSubs.length === 0) {
      csv += `"${u.lastName}";"${u.firstName}";"${u.email}";"${statusLabel}";"${u.registeredAt}";"${prog}%";"Aucun";"Aucune réponse";""\n`
    } else {
      userSubs.forEach(s => {
        const cleanAnswer = s.answer.replace(/"/g, '""').replace(/\n/g, ' ')
        csv += `"${u.lastName}";"${u.firstName}";"${u.email}";"${statusLabel}";"${u.registeredAt}";"${prog}%";"${s.exerciseTitle}";"${cleanAnswer}";"${s.submittedAt}"\n`
      })
    }
  })

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', `Didactique_M1_Suivi_Classe_${new Date().toISOString().substring(0,10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function formatSize(bytes) {
  if (!bytes) return '0 Ko'
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' Ko'
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo'
}
</script>

<template>
  <div class="admin-container">
    <!-- ÉCRAN DE VERROUILLAGE ADMIN (AUCUN CODE PAR DÉFAUT AFFICHÉ) -->
    <div v-if="!isAuthenticated" class="lock-screen">
      <span class="lock-icon">🔒</span>
      <h2>Espace Enseignant (Administration)</h2>
      <p>Veuillez saisir votre mot de passe d'accès enseignant pour consulter le suivi de la classe et les travaux des étudiants.</p>
      
      <div class="pin-box">
        <input 
          v-model="enteredPin" 
          type="password" 
          placeholder="Mot de passe d'accès enseignant" 
          @keyup.enter="checkPin"
        />
        <button @click="checkPin" class="btn-unlock">Déverrouiller l'Espace Admin →</button>
      </div>
    </div>

    <!-- TABLEAU DE BORD ENSEIGNANT -->
    <div v-else class="admin-dashboard">
      <!-- HEADER ENSEIGNANT -->
      <div class="admin-header">
        <div>
          <h2>👨‍🏫 Espace Enseignant — Suivi de la Classe M1</h2>
          <p>Didactique du Numérique • Master 1 Enseignant Math-Numérique (HECh)</p>
        </div>
        <button @click="isAuthenticated = false" class="btn-lock">
          Verrouiller 🔒
        </button>
      </div>

      <!-- KPI METRICS -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-icon">👥</span>
          <div>
            <div class="kpi-value">{{ totalStudents }}</div>
            <div class="kpi-label">Étudiants ({{ activeStudentsCount }} actifs)</div>
          </div>
        </div>
        <div class="kpi-card">
          <span class="kpi-icon">📈</span>
          <div>
            <div class="kpi-value">{{ averageProgress }}%</div>
            <div class="kpi-label">Progression moyenne</div>
          </div>
        </div>
        <div class="kpi-card">
          <span class="kpi-icon">📝</span>
          <div>
            <div class="kpi-value">{{ totalSubmissions }}</div>
            <div class="kpi-label">Réponses rédigées</div>
          </div>
        </div>
        <div class="kpi-card">
          <span class="kpi-icon">📁</span>
          <div>
            <div class="kpi-value">{{ totalFilesCount }}</div>
            <div class="kpi-label">Fichiers Word / PDF</div>
          </div>
        </div>
      </div>

      <!-- ONGLETS ADMIN -->
      <div class="admin-tab-bar">
        <button 
          :class="['admin-tab-btn', { active: adminTab === 'students' }]"
          @click="adminTab = 'students'"
        >
          👥 Gestion de la Classe ({{ users.length }})
        </button>
        <button 
          :class="['admin-tab-btn', { active: adminTab === 'submissions' }]"
          @click="adminTab = 'submissions'"
        >
          📋 Réponses Rédigées ({{ submissions.length }})
        </button>
        <button 
          :class="['admin-tab-btn', { active: adminTab === 'files' }]"
          @click="adminTab = 'files'"
        >
          📁 Travaux Déposés ({{ totalFilesCount }})
        </button>
        <button 
          :class="['admin-tab-btn', { active: adminTab === 'export' }]"
          @click="adminTab = 'export'"
        >
          ⚙️ Sécurité & Google Drive
        </button>
      </div>

      <!-- VUE 1 : GESTION DES ÉTUDIANTS -->
      <div v-if="adminTab === 'students'" class="tab-panel">
        <!-- BARRE D'ACTIONS ET GESTION ÉTUDIANTS -->
        <div class="students-toolbar">
          <div class="toolbar-left">
            <!-- Filtres Statut -->
            <div class="status-pills">
              <button 
                :class="['pill-btn', { active: studentStatusFilter === 'active' }]"
                @click="studentStatusFilter = 'active'"
              >
                Actifs ({{ activeStudentsCount }})
              </button>
              <button 
                :class="['pill-btn', { active: studentStatusFilter === 'all' }]"
                @click="studentStatusFilter = 'all'"
              >
                Tous ({{ totalStudents }})
              </button>
              <button 
                :class="['pill-btn', { active: studentStatusFilter === 'archived' }]"
                @click="studentStatusFilter = 'archived'"
              >
                Archivés ({{ archivedStudentsCount }})
              </button>
            </div>

            <!-- Recherche -->
            <div class="search-box">
              <input 
                v-model="studentSearchQuery" 
                type="text" 
                placeholder="🔍 Rechercher nom ou email..."
              />
            </div>
          </div>

          <div class="toolbar-right">
            <!-- Télécharger Modèle CSV -->
            <button @click="handleDownloadTemplate" class="btn-action-tool secondary" title="Télécharger le gabarit CSV prêt pour Excel">
              📥 Modèle CSV
            </button>

            <!-- Importer CSV -->
            <button @click="triggerFileInput" class="btn-action-tool brand" title="Importer une liste d'étudiants depuis un fichier CSV">
              📂 Importer CSV
            </button>
            <input 
              ref="fileInputRef" 
              type="file" 
              accept=".csv,text/csv" 
              style="display: none" 
              @change="handleFileUpload"
            />

            <!-- Ajouter un Étudiant -->
            <button 
              @click="showAddStudentModal = !showAddStudentModal" 
              class="btn-action-tool primary"
            >
              {{ showAddStudentModal ? '✕ Fermer' : '➕ Ajouter un étudiant' }}
            </button>
          </div>
        </div>

        <!-- FORMULAIRE D'AJOUT MANUEL -->
        <div v-if="showAddStudentModal" class="add-student-card">
          <div class="add-student-header">
            <h4>➕ Inscrire un nouvel étudiant dans la classe</h4>
            <p>L'étudiant sera automatiquement ajouté et pourra se connecter dès son premier accès.</p>
          </div>

          <div v-if="addStudentError" class="add-student-error">
            ⚠️ {{ addStudentError }}
          </div>

          <div class="add-student-form">
            <div class="form-field">
              <label>Prénom *</label>
              <input v-model="newFirstName" type="text" placeholder="Ex : Sarah" />
            </div>
            <div class="form-field">
              <label>Nom *</label>
              <input v-model="newLastName" type="text" placeholder="Ex : Dubois" />
            </div>
            <div class="form-field">
              <label>Email institutionnel (@student.hech.be) *</label>
              <input v-model="newEmail" type="email" placeholder="sarah.dubois@student.hech.be" />
            </div>
            <div class="form-actions">
              <button @click="handleAddStudent" class="btn-save-student">Enregistrer l'étudiant</button>
              <button @click="showAddStudentModal = false" class="btn-cancel">Annuler</button>
            </div>
          </div>
        </div>

        <!-- TABLEAU DES ÉTUDIANTS -->
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Statut</th>
                <th>Adresse Email</th>
                <th>Inscrit le</th>
                <th>Progression</th>
                <th>Exercices</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="displayedUsers.length === 0">
                <td colspan="7" class="empty-table-msg">
                  Aucun étudiant ne correspond aux critères de recherche ou de filtre.
                </td>
              </tr>
              <tr v-for="u in displayedUsers" :key="u.id" :class="{ 'row-archived': u.status === 'archived' }">
                <td>
                  <strong>{{ u.lastName }}</strong> {{ u.firstName }}
                </td>
                <td>
                  <span :class="['status-badge', u.status === 'archived' ? 'archived' : 'active']">
                    {{ u.status === 'archived' ? 'Archivé' : 'Actif' }}
                  </span>
                </td>
                <td class="email-cell">{{ u.email }}</td>
                <td>{{ u.registeredAt }}</td>
                <td>
                  <div class="table-progress">
                    <div class="table-progress-bar">
                      <div 
                        class="table-progress-fill" 
                        :style="{ width: userStore.calculateUserProgressPercent(u.email) + '%' }"
                      ></div>
                    </div>
                    <span>{{ userStore.calculateUserProgressPercent(u.email) }}%</span>
                  </div>
                </td>
                <td>
                  <span class="sub-count-badge">
                    {{ submissions.filter(s => s.userEmail === u.email).length }} / 7
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="action-buttons-group">
                    <button 
                      v-if="u.status !== 'archived'" 
                      @click="handleToggleArchive(u.email)" 
                      class="btn-row-action archive" 
                      title="Archiver cet étudiant"
                    >
                      📦 Archiver
                    </button>
                    <button 
                      v-else 
                      @click="handleToggleArchive(u.email)" 
                      class="btn-row-action restore" 
                      title="Restaurer cet étudiant"
                    >
                      🔄 Restaurer
                    </button>

                    <button 
                      @click="handleDeleteStudent(u)" 
                      class="btn-row-action delete" 
                      title="Supprimer définitivement cet étudiant"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- VUE 2 : RÉPONSES AUX EXERCICES -->
      <div v-if="adminTab === 'submissions'" class="tab-panel">
        <div class="filters-row">
          <div class="filter-group">
            <label>Filtrer par Exercice :</label>
            <select v-model="selectedExerciseFilter">
              <option v-for="opt in exerciseOptions" :key="opt.id" :value="opt.id">
                {{ opt.title }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>Filtrer par Étudiant :</label>
            <select v-model="selectedStudentFilter">
              <option value="all">Tous les étudiants</option>
              <option v-for="u in users" :key="u.id" :value="u.email">
                {{ u.lastName }} {{ u.firstName }} ({{ u.email }})
              </option>
            </select>
          </div>
        </div>

        <div v-if="filteredSubmissions.length === 0" class="empty-state">
          <p>Aucune réponse ne correspond aux filtres sélectionnés.</p>
        </div>

        <div v-else class="submissions-cards">
          <div v-for="sub in filteredSubmissions" :key="sub.id" class="sub-card">
            <div class="sub-header">
              <div>
                <span class="student-author">{{ sub.userName }}</span>
                <span class="student-mail">({{ sub.userEmail }})</span>
              </div>
              <span class="sub-date">{{ sub.submittedAt }}</span>
            </div>
            <div class="sub-exercise-tag">{{ sub.exerciseTitle }}</div>
            <div class="sub-body">
              <p>{{ sub.answer }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- VUE 3 : FICHIERS DÉPOSÉS & SYNCHRONISATION GOOGLE DRIVE -->
      <div v-if="adminTab === 'files'" class="tab-panel">
        <!-- BANNIÈRE D'ACTIONS GOOGLE DRIVE -->
        <div class="drive-action-banner">
          <div class="banner-text">
            <h4>📁 Synchronisation vers le dossier local Google Drive</h4>
            <p>
              Dossier cible : <code>C:\Google Drive\Prépas light\HECh\Péda\Math-Num\M1\Didactique et numérique\Exercices étudiants Plateforme</code>
            </p>
          </div>
          <div class="banner-buttons">
            <button 
              @click="handleSyncToDrive" 
              :disabled="isSyncing || submittedFiles.length === 0"
              class="btn-sync-drive"
            >
              {{ isSyncing ? 'Synchronisation en cours...' : '💾 Enregistrer dans mon dossier Google Drive' }}
            </button>
          </div>
        </div>

        <div v-if="syncFeedback" class="sync-feedback-msg">
          {{ syncFeedback }}
        </div>

        <!-- FILTRES DES FICHIERS -->
        <div class="filters-row">
          <div class="filter-group">
            <label>Filtrer par Atelier / Exercice :</label>
            <select v-model="fileExerciseFilter">
              <option v-for="opt in exerciseOptions" :key="opt.id" :value="opt.id">
                {{ opt.title }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>Filtrer par Étudiant :</label>
            <select v-model="fileStudentFilter">
              <option value="all">Tous les étudiants</option>
              <option v-for="u in users" :key="u.id" :value="u.email">
                {{ u.lastName }} {{ u.firstName }} ({{ u.email }})
              </option>
            </select>
          </div>
        </div>

        <!-- TABLEAU DES FICHIERS DÉPOSÉS -->
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Atelier</th>
                <th>Libellé Officiel du Document</th>
                <th>Taille</th>
                <th>Date Dépôt</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredFiles.length === 0">
                <td colspan="6" class="empty-table-msg">
                  Aucun fichier Word ou PDF déposé ne correspond aux filtres.
                </td>
              </tr>
              <tr v-for="f in filteredFiles" :key="f.id">
                <td>
                  <strong>{{ f.userName }}</strong>
                  <div class="email-subtext">{{ f.userEmail }}</div>
                </td>
                <td>
                  <span class="exercise-badge-sm">{{ f.exerciseTitle }}</span>
                </td>
                <td>
                  <span class="file-icon-inline">{{ f.formattedFileName.endsWith('.pdf') ? '📕' : '📘' }}</span>
                  <code class="formatted-name-text">{{ f.formattedFileName }}</code>
                </td>
                <td>{{ formatSize(f.fileSize) }}</td>
                <td>{{ f.submittedAt }}</td>
                <td style="text-align: right;">
                  <div class="action-buttons-group">
                    <button @click="downloadFile(f)" class="btn-row-action dl" title="Télécharger le fichier">
                      📥 Télécharger
                    </button>
                    <button @click="deleteFile(f.id)" class="btn-row-action delete" title="Supprimer ce document">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- VUE 4 : SÉCURITÉ & GOOGLE DRIVE -->
      <div v-if="adminTab === 'export'" class="tab-panel">
        <!-- PASSERELLE GOOGLE DRIVE CLOUD (WEBHOOK APPS SCRIPT) -->
        <div class="security-box">
          <div class="box-title-bar">
            <h3>☁️ Passerelle Cloud Google Drive (Temps Réel)</h3>
            <span class="box-subtitle">Acheminez automatiquement les dépôts des étudiants à distance directement dans votre Drive</span>
          </div>

          <p class="box-desc">
            Pour que les étudiants déposant un document depuis leur propre ordinateur chez eux envoient instantanément le fichier dans votre dossier Google Drive <code>C:\Google Drive\...\Exercices étudiants Plateforme</code> sans que vous ayez à cliquer manuellement sur "Synchroniser", configurez votre URL de Webhook Google Apps Script ci-dessous :
          </p>

          <div class="webhook-config-row">
            <input 
              v-model="webhookInput" 
              type="url" 
              placeholder="https://script.google.com/macros/s/.../exec" 
            />
            <button @click="handleSaveWebhook" class="btn-save-webhook">Enregistrer l'URL</button>
          </div>

          <div v-if="webhookStatus" class="webhook-status-msg">
            {{ webhookStatus }}
          </div>

          <div class="apps-script-guide">
            <h5>💡 Comment déployer ce connecteur en 2 minutes :</h5>
            <ol>
              <li>Rendez-vous sur <a href="https://script.google.com" target="_blank">script.google.com</a> et créez un <strong>Nouveau projet</strong>.</li>
              <li>Collez le code Google Apps Script fourni ci-dessous :</li>
            </ol>
            <pre class="script-code"><code>function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  // Trouver ou créer le dossier
  var folders = DriveApp.getFoldersByName("Exercices étudiants Plateforme");
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder("Exercices étudiants Plateforme");
  
  // Décoder et créer le fichier
  var decoded = Utilities.base64Decode(data.base64Data);
  var blob = Utilities.newBlob(decoded, data.mimeType, data.fileName);
  var file = folder.createFile(blob);
  
  return ContentService.createTextOutput(JSON.stringify({ status: "success", fileId: file.getId() }))
    .setMimeType(ContentService.MimeType.JSON);
}</code></pre>
            <ol start="3">
              <li>Cliquez sur <strong>Déployer → Nouveau déploiement → Application Web</strong>.</li>
              <li>Accès : choisissez <strong>"Tout le monde" (Anyone)</strong>, puis copiez l'URL d'application Web générée et collez-la dans le champ ci-dessus.</li>
            </ol>
          </div>
        </div>

        <!-- SÉCURITÉ / CHANGEMENT DE MOT DE PASSE -->
        <div class="security-box">
          <div class="box-title-bar">
            <h3>🔐 Modifier le mot de passe enseignant</h3>
            <span class="box-subtitle">Sécurisez l'accès à votre espace d'administration</span>
          </div>

          <p class="box-desc">
            Pour modifier votre mot de passe d'administration, saisissez l'ancien mot de passe puis choisissez-en un nouveau (4 caractères minimum).
          </p>

          <div v-if="passwordChangeFeedback.message" :class="['feedback-box', passwordChangeFeedback.type]">
            {{ passwordChangeFeedback.type === 'success' ? '✅ ' : '⚠️ ' }} {{ passwordChangeFeedback.message }}
          </div>

          <div class="password-form-grid">
            <div class="pwd-field">
              <label>Ancien mot de passe :</label>
              <input 
                v-model="oldPasswordInput" 
                type="password" 
                placeholder="Ancien mot de passe"
              />
            </div>
            <div class="pwd-field">
              <label>Nouveau mot de passe :</label>
              <input 
                v-model="newPasswordInput" 
                type="password" 
                placeholder="Nouveau mot de passe"
              />
            </div>
            <div class="pwd-field">
              <label>Confirmer le nouveau mot de passe :</label>
              <input 
                v-model="confirmPasswordInput" 
                type="password" 
                placeholder="Confirmation"
                @keyup.enter="handleChangePassword"
              />
            </div>
          </div>

          <div style="margin-top: 1.2rem;">
            <button @click="handleChangePassword" class="btn-update-pin">
              Enregistrer le nouveau mot de passe 🔒
            </button>
          </div>
        </div>

        <!-- EXPORT CSV -->
        <div class="export-box">
          <div class="box-title-bar">
            <h3>📥 Exporter les données complètes de la classe</h3>
            <span class="box-subtitle">Génération d'un fichier tableur exploitable</span>
          </div>
          <p class="box-desc">
            Téléchargez un relevé CSV complet contenant l'ensemble des étudiants (nom, prénom, email, statut actif/archivé, date d'inscription, taux de progression) ainsi que toutes leurs réponses textuelles rédigées pour vos évaluations.
          </p>
          <button @click="exportCSV" class="btn-export-csv">
            Télécharger le relevé complet (.CSV / Excel)
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.admin-container {
  max-width: 1100px;
  margin: 1.5rem auto 4rem auto;
  padding: 0 1rem;
}

.lock-screen {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 3.5rem 2rem;
  text-align: center;
  max-width: 520px;
  margin: 3rem auto;
  box-shadow: 0 6px 24px rgba(0,0,0,0.08);
}

.lock-icon {
  font-size: 3.2rem;
  display: inline-block;
  margin-bottom: 1rem;
}

.lock-screen h2 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 0.6rem 0;
}

.lock-screen p {
  font-size: 0.92rem;
  color: var(--vp-c-text-2);
  margin-bottom: 2rem;
  line-height: 1.5;
}

.pin-box {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.pin-box input {
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  font-size: 1rem;
  text-align: center;
  color: var(--vp-c-text-1);
}

.pin-box input:focus {
  border-color: var(--vp-c-brand-1);
  outline: none;
}

.btn-unlock {
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
}

/* DASHBOARD */
.admin-dashboard {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.admin-header h2 {
  margin: 0 0 0.3rem 0;
  font-size: 1.4rem;
  font-weight: 800;
}

.admin-header p {
  margin: 0;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
}

.btn-lock {
  background: var(--vp-c-default-soft);
  border: 1px solid var(--vp-c-divider);
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  color: var(--vp-c-text-2);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.2rem;
  margin-bottom: 2rem;
}

.kpi-card {
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.kpi-icon {
  font-size: 2.2rem;
}

.kpi-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
}

.kpi-label {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.admin-tab-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 0.5rem;
  flex-wrap: wrap;
}

.admin-tab-btn {
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

.admin-tab-btn.active {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

/* TOOLBAR ÉTUDIANTS */
.students-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.2rem;
  padding: 0.8rem 1rem;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.status-pills {
  display: flex;
  background: var(--vp-c-bg);
  padding: 3px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  gap: 2px;
}

.pill-btn {
  background: none;
  border: none;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.pill-btn.active {
  background: var(--vp-c-brand-1);
  color: white;
}

.search-box input {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  font-size: 0.85rem;
  color: var(--vp-c-text-1);
  min-width: 200px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.btn-action-tool {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-action-tool.secondary {
  background: var(--vp-c-bg);
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

.btn-action-tool.brand {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.btn-action-tool.primary {
  background: var(--vp-c-brand-1);
  color: white;
}

/* FORMULAIRE AJOUT ÉTUDIANT */
.add-student-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 12px;
  padding: 1.3rem;
  margin-bottom: 1.5rem;
}

.add-student-header h4 {
  margin: 0 0 0.3rem 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.add-student-header p {
  margin: 0 0 1rem 0;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.add-student-error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.add-student-form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-field label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.form-field input {
  padding: 7px 12px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  font-size: 0.88rem;
}

.form-actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 0.5rem;
}

.btn-save-student {
  background: #10b981;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
}

.btn-cancel {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-divider);
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.88rem;
  cursor: pointer;
}

/* TABLEAU DES DONNÉES */
.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.data-table th, .data-table td {
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid var(--vp-c-divider);
}

.data-table th {
  background: var(--vp-c-bg-alt);
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.row-archived {
  opacity: 0.65;
}

.status-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.archived {
  background: #f1f5f9;
  color: #64748b;
}

.email-cell {
  font-family: monospace;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.email-subtext {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  font-family: monospace;
}

.table-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-progress-bar {
  width: 70px;
  height: 8px;
  background: var(--vp-c-divider);
  border-radius: 6px;
  overflow: hidden;
}

.table-progress-fill {
  height: 100%;
  background: #10b981;
}

.sub-count-badge {
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
  font-size: 0.8rem;
}

.empty-table-msg {
  text-align: center;
  padding: 2rem !important;
  color: var(--vp-c-text-3);
  font-style: italic;
}

/* ACTIONS PAR LIGNE */
.action-buttons-group {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.btn-row-action {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  cursor: pointer;
}

.btn-row-action.dl {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.btn-row-action.delete {
  color: #ef4444;
}

.btn-row-action.delete:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

/* GOOGLE DRIVE SYNC BANNER */
.drive-action-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 12px;
  padding: 1.2rem 1.4rem;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.banner-text h4 {
  margin: 0 0 0.3rem 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #166534;
}

.banner-text p {
  margin: 0;
  font-size: 0.85rem;
  color: #15803d;
}

.banner-text code {
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.82rem;
  color: #14532d;
}

.btn-sync-drive {
  background: #16a34a;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 800;
  font-size: 0.92rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-sync-drive:hover {
  background: #15803d;
}

.btn-sync-drive:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sync-feedback-msg {
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #15803d;
}

.exercise-badge-sm {
  font-size: 0.78rem;
  font-weight: 700;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  padding: 2px 7px;
  border-radius: 5px;
}

.formatted-name-text {
  font-family: monospace;
  font-weight: 700;
  font-size: 0.88rem;
  color: #10b981;
}

.file-icon-inline {
  margin-right: 6px;
}

/* SUBMISSIONS VIEW */
.filters-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  background: var(--vp-c-bg-alt);
  padding: 1rem 1.2rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 0.85rem;
  font-weight: 600;
}

.filter-group select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.88rem;
}

.submissions-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sub-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.3rem;
}

.sub-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.student-author {
  font-weight: 700;
  font-size: 1rem;
  color: var(--vp-c-text-1);
}

.student-mail {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin-left: 6px;
}

.sub-date {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}

.sub-exercise-tag {
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  margin-bottom: 0.8rem;
}

.sub-body p {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.55;
  background: var(--vp-c-bg-alt);
  padding: 0.8rem 1rem;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
}

/* SÉCURITÉ & EXPORT */
.security-box, .export-box {
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.6rem;
  margin-bottom: 1.6rem;
}

.box-title-bar h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
}

.box-subtitle {
  display: block;
  font-size: 0.82rem;
  color: var(--vp-c-brand-1);
  font-weight: 600;
  margin-top: 2px;
}

.box-desc {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin: 0.6rem 0 1.2rem 0;
  line-height: 1.5;
}

.webhook-config-row {
  display: flex;
  gap: 0.8rem;
  max-width: 600px;
  margin-bottom: 0.8rem;
}

.webhook-config-row input {
  flex-grow: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.88rem;
}

.btn-save-webhook {
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
}

.webhook-status-msg {
  color: #10b981;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.apps-script-guide {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1.2rem;
  margin-top: 1.2rem;
}

.apps-script-guide h5 {
  margin: 0 0 0.6rem 0;
  font-size: 0.95rem;
  font-weight: 700;
}

.apps-script-guide ol {
  margin: 0 0 1rem 1.2rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.script-code {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.82rem;
  margin: 0.8rem 0;
}

.feedback-box {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
}

.feedback-box.success {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
}

.feedback-box.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.password-form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.pwd-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.pwd-field label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.pwd-field input {
  padding: 8px 12px;
  border-radius: 7px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
}

.btn-update-pin {
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  padding: 9px 18px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-export-csv {
  background: #10b981;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
}
</style>
