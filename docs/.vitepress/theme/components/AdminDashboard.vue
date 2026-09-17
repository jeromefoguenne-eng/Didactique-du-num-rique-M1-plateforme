<script setup>
import { ref, computed } from 'vue'
import { userStore } from '../stores/userStore'

const enteredPin = ref('')
const isAuthenticated = ref(false)
const adminTab = ref('students') // 'students' | 'evaluation' | 'quizzes' | 'submissions' | 'files' | 'export'

// Gestion de la notation sur 200 points
const selectedStudentEval = ref(null)
const evalForm = ref({
  email: '',
  name: '',
  gamePedagogyScore: 20,
  gameBoardLaserScore: 15,
  gamePawns3dScore: 15,
  gameAiCardsScore: 15,
  gameVideoScore: 20,
  gamePhotosScore: 15,
  gameProjectScore: 100,
  oralDefenseScore: 30,
  teacherFeedback: ''
})

function getStudentEvalData(email) {
  return userStore.getStudentEvaluation(email)
}

function openEditEvalModal(u) {
  const ev = userStore.getStudentEvaluation(u.email)
  evalForm.value = {
    email: u.email,
    name: `${u.firstName} ${u.lastName}`,
    gamePedagogyScore: ev.pillar2.details?.pedagogy ?? 0,
    gameBoardLaserScore: ev.pillar2.details?.boardLaser ?? 0,
    gamePawns3dScore: ev.pillar2.details?.pawns3d ?? 0,
    gameAiCardsScore: ev.pillar2.details?.aiCards ?? 0,
    gameVideoScore: ev.pillar2.details?.video ?? 0,
    gamePhotosScore: ev.pillar2.details?.photos ?? 0,
    gameProjectScore: ev.pillar2.total,
    oralDefenseScore: ev.pillar3.total,
    teacherFeedback: ev.feedback || ''
  }
  selectedStudentEval.value = ev
}

function saveStudentEval() {
  if (!evalForm.value.email) return
  const ped = Number(evalForm.value.gamePedagogyScore || 0)
  const laser = Number(evalForm.value.gameBoardLaserScore || 0)
  const p3d = Number(evalForm.value.gamePawns3dScore || 0)
  const ai = Number(evalForm.value.gameAiCardsScore || 0)
  const vid = Number(evalForm.value.gameVideoScore || 0)
  const pho = Number(evalForm.value.gamePhotosScore || 0)
  const calcTotalGame = ped + laser + p3d + ai + vid + pho

  userStore.updateStudentEvaluation(evalForm.value.email, {
    gamePedagogyScore: ped,
    gameBoardLaserScore: laser,
    gamePawns3dScore: p3d,
    gameAiCardsScore: ai,
    gameVideoScore: vid,
    gamePhotosScore: pho,
    gameProjectScore: calcTotalGame > 0 ? calcTotalGame : Number(evalForm.value.gameProjectScore || 0),
    oralDefenseScore: Number(evalForm.value.oralDefenseScore || 0),
    teacherFeedback: evalForm.value.teacherFeedback
  })
  alert(`Notes enregistrées avec succès pour ${evalForm.value.name} !`)
  selectedStudentEval.value = null
}

function exportEvaluationsToCSV() {
  let csv = "Nom de l'étudiant;Email institutionnel;Quiz (/10);Devoirs (/60);Total Pilier 1 (/70);Jeu Prépa (/20);Plateau Laser (/15);Pions 3D (/15);Cartes IA (/15);Vidéo (/20);Photos (/15);Total Jeu (/100);Soutenance Oral (/30);Total Général (/200);Note finale (/20);Pourcentage;Statut;Feedback Enseignant\n"
  
  users.value.forEach(u => {
    const ev = userStore.getStudentEvaluation(u.email)
    const status = ev.isPassing ? 'Admis' : 'En cours'
    const cleanFb = (ev.feedback || '').replace(/"/g, '""')
    csv += `"${u.lastName} ${u.firstName}";"${u.email}";"${ev.pillar1.quizPoints}";"${ev.pillar1.exercisesTotal}";"${ev.pillar1.total}";"${ev.pillar2.details.pedagogy}";"${ev.pillar2.details.boardLaser}";"${ev.pillar2.details.pawns3d}";"${ev.pillar2.details.aiCards}";"${ev.pillar2.details.video}";"${ev.pillar2.details.photos}";"${ev.pillar2.total}";"${ev.pillar3.total}";"${ev.totalScore}";"${ev.totalOutOf20}";"${ev.percentage}%";"${status}";"${cleanFb}"\n`
  })

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', `Didactique_M1_Releve_Notes_200pts_${new Date().toISOString().substring(0,10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}


// Quiz et évaluations diagnostiques
const quizAttempts = computed(() => userStore.quizAttempts)
const totalQuizzesCount = computed(() => quizAttempts.value.length)
const averageQuizPct = computed(() => {
  if (quizAttempts.value.length === 0) return 0
  const total = quizAttempts.value.reduce((acc, q) => acc + q.percentage, 0)
  return Math.round(total / quizAttempts.value.length)
})

const quizModuleFilter = ref('all')
const quizStudentFilter = ref('all')
const selectedQuizDetail = ref(null)

const availableQuizModules = [
  { id: 'all', title: 'Tous les modules' },
  { id: '01-1', title: '1.1 Définition & DigComp' },
  { id: '01-2', title: '1.2 Éducation aux médias' },
  { id: '02-1', title: '2.1 Quatre champs FMTTN' },
  { id: '02-3', title: '2.3 Progression spiralaire' },
  { id: '03-1', title: '3.1 Situation-problème' },
  { id: '04-1', title: '4.1 Fiche de préparation' },
  { id: '04-2', title: '4.2 Taxonomie de Bloom' },
  { id: '04-4', title: '4.4 Assistant IA HECh' },
  { id: '05', title: '5.0 Projet jeu de société' }
]

const filteredQuizAttempts = computed(() => {
  return quizAttempts.value.filter(q => {
    const matchMod = quizModuleFilter.value === 'all' || q.moduleId === quizModuleFilter.value
    const matchStd = quizStudentFilter.value === 'all' || q.userEmail === quizStudentFilter.value
    return matchMod && matchStd
  })
})

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

// Gestion de la correction IA et de l'évaluation enseignant des devoirs déposés
const isBatchAnalyzing = ref(false)
const isAnalyzingFile = ref({})
const selectedFileForAiReport = ref(null)
const teacherGradeForm = ref({})
const gradeSaveFeedbacks = ref({})
const fileEvaluationFilter = ref('all') // 'all' | 'ai-analyzed' | 'ai-pending' | 'teacher-graded' | 'teacher-pending'

const totalAiAnalyzedFiles = computed(() => {
  return submittedFiles.value.filter(f => f.aiCorrection?.status === 'analyzed').length
})

const totalTeacherGradedFiles = computed(() => {
  return submittedFiles.value.filter(f => f.teacherGrade?.status === 'graded').length
})

function getTeacherScore(file) {
  if (teacherGradeForm.value[file.id]?.score !== undefined) {
    return teacherGradeForm.value[file.id].score
  }
  return file.teacherGrade?.score ?? (file.aiCorrection?.suggestedScore ?? 10)
}

function getTeacherFeedback(file) {
  if (teacherGradeForm.value[file.id]?.feedback !== undefined) {
    return teacherGradeForm.value[file.id].feedback
  }
  return file.teacherGrade?.feedback ?? ''
}

function setTeacherScore(file, val) {
  if (!teacherGradeForm.value[file.id]) {
    teacherGradeForm.value[file.id] = {
      score: file.teacherGrade?.score ?? (file.aiCorrection?.suggestedScore ?? 10),
      feedback: file.teacherGrade?.feedback ?? ''
    }
  }
  teacherGradeForm.value[file.id].score = Number(val)
}

function setTeacherFeedback(file, val) {
  if (!teacherGradeForm.value[file.id]) {
    teacherGradeForm.value[file.id] = {
      score: file.teacherGrade?.score ?? (file.aiCorrection?.suggestedScore ?? 10),
      feedback: file.teacherGrade?.feedback ?? ''
    }
  }
  teacherGradeForm.value[file.id].feedback = val
}

function adoptAiScore(file) {
  if (!file.aiCorrection) return
  if (!teacherGradeForm.value[file.id]) {
    teacherGradeForm.value[file.id] = { score: 10, feedback: '' }
  }
  teacherGradeForm.value[file.id].score = file.aiCorrection.suggestedScore
  if (!teacherGradeForm.value[file.id].feedback || !teacherGradeForm.value[file.id].feedback.trim()) {
    teacherGradeForm.value[file.id].feedback = file.aiCorrection.summary
  }
}

async function runAiAnalysis(fileId) {
  isAnalyzingFile.value[fileId] = true
  try {
    await userStore.analyzeFileWithAi(fileId)
  } finally {
    isAnalyzingFile.value[fileId] = false
  }
}

async function runBatchAiAnalysis() {
  isBatchAnalyzing.value = true
  try {
    const res = await userStore.batchAnalyzeAllFilesWithAi()
    alert(`Correction IA terminée : ${res.analyzed} document(s) analysé(s) par l'IA sur ${res.total} au total.`)
  } finally {
    isBatchAnalyzing.value = false
  }
}

function saveTeacherGradeForFile(file) {
  const score = getTeacherScore(file)
  const feedback = getTeacherFeedback(file)
  const res = userStore.saveTeacherGrade(file.id, score, feedback)
  gradeSaveFeedbacks.value[file.id] = res.message
  setTimeout(() => {
    delete gradeSaveFeedbacks.value[file.id]
  }, 3500)
}

const filteredFiles = computed(() => {
  return submittedFiles.value.filter(file => {
    const matchStudent = fileStudentFilter.value === 'all' || file.userEmail === fileStudentFilter.value
    const matchEx = fileExerciseFilter.value === 'all' || file.exerciseId === fileExerciseFilter.value
    
    let matchEval = true
    if (fileEvaluationFilter.value === 'ai-analyzed') {
      matchEval = file.aiCorrection?.status === 'analyzed'
    } else if (fileEvaluationFilter.value === 'ai-pending') {
      matchEval = !file.aiCorrection || file.aiCorrection.status !== 'analyzed'
    } else if (fileEvaluationFilter.value === 'teacher-graded') {
      matchEval = file.teacherGrade?.status === 'graded'
    } else if (fileEvaluationFilter.value === 'teacher-pending') {
      matchEval = !file.teacherGrade || file.teacherGrade.status !== 'graded'
    }

    return matchStudent && matchEx && matchEval
  })
})

function handleAdminResetStudentPassword(email) {
  if (confirm(`Voulez-vous réinitialiser le mot de passe de l'étudiant ${email} ?\nUn mot de passe temporaire sera défini et l'étudiant devra obligatoirement configurer son mot de passe lors de sa prochaine connexion.`)) {
    const res = userStore.adminResetStudentPassword(email, 'hech2026')
    alert(res.message)
  }
}

function handleDeleteQuizAttempt(id) {
  if (confirm("Voulez-vous supprimer cette tentative d'évaluation diagnostique ? L'étudiant pourra repasser le test.")) {
    userStore.deleteQuizAttempt(id)
    if (selectedQuizDetail.value?.id === id) {
      selectedQuizDetail.value = null
    }
  }
}

function exportQuizResultsToCSV() {
  let csv = "Nom de l'étudiant;Email institutionnel;Module ID;Titre du module;Note obtenue;Total points;Pourcentage;Date de passage;Type d'évaluation;Détail des réponses\n"
  filteredQuizAttempts.value.forEach(q => {
    const cleanAnswers = q.answers.map(a => `[${a.questionId}] ${a.questionText.substring(0,30)}... -> Rep: ${a.userAnswer} (Pts: ${a.points}/${a.maxPoints})`).join(" | ").replace(/"/g, '""')
    csv += `"${q.userName}";"${q.userEmail}";"${q.moduleId}";"${q.moduleTitle}";"${q.score}";"${q.totalPoints}";"${q.percentage}%";"${q.submittedAt}";"${q.evaluationType}";"${cleanAnswers}"\n`
  })

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', `Didactique_M1_Resultats_Quiz_${new Date().toISOString().substring(0,10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

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

// Suppression définitive d'un étudiant
function handleDeleteStudent(user) {
  const msg = `⚠️ SUPPRESSION DÉFINITIVE\n\nÊtes-vous absolument certain de vouloir supprimer l'étudiant "${user.firstName} ${user.lastName}" (${user.email}) ?\n\nCette action effacera irréversiblement son compte, ses notes d'évaluation, ses tentatives de quiz et l'ensemble de ses documents déposés.`
  if (window.confirm(msg)) {
    const res = userStore.deleteStudent(user.email)
    alert(res.message)
    if (selectedStudentEval.value?.user?.email?.toLowerCase() === user.email.toLowerCase()) {
      selectedStudentEval.value = null
    }
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
        <div class="kpi-card">
          <span class="kpi-icon">🎯</span>
          <div>
            <div class="kpi-value">{{ averageQuizPct }}%</div>
            <div class="kpi-label">Moyenne Quiz ({{ totalQuizzesCount }})</div>
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
          :class="['admin-tab-btn eval-tab-highlight', { active: adminTab === 'evaluation' }]"
          @click="adminTab = 'evaluation'"
        >
          🏆 Notes & Évaluation (/ 200 pts)
        </button>
        <button 
          :class="['admin-tab-btn', { active: adminTab === 'quizzes' }]"
          @click="adminTab = 'quizzes'"
        >
          🎓 Résultats des Quiz ({{ totalQuizzesCount }})
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
          📁 Devoirs Déposés & Correction IA ({{ totalFilesCount }})
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
                <th>Sécurité MDP</th>
                <th>Progression</th>
                <th>Exercices</th>
                <th>Note (/ 200 pts)</th>
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
                  <span v-if="u.passwordSet" class="badge-pwd active" title="Mot de passe personnel actif">
                    ✓ Défini
                  </span>
                  <span v-else class="badge-pwd pending" title="En attente de 1ère connexion">
                    ⏳ Non défini
                  </span>
                </td>
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
                    {{ submittedFiles.filter(f => f.userEmail.toLowerCase() === u.email.toLowerCase()).length }} / 6
                  </span>
                </td>
                <td>
                  <div class="table-grade-badge" @click="openEditEvalModal(u)" title="Cliquer pour modifier les notes">
                    <strong>{{ getStudentEvalData(u.email).totalScore }}</strong> / 200
                    <span class="grade-out-of-20">({{ getStudentEvalData(u.email).totalOutOf20 }}/20)</span>
                  </div>
                </td>
                <td style="text-align: right;">
                  <div class="action-buttons-group">
                    <button 
                      @click="handleAdminResetStudentPassword(u.email)" 
                      class="btn-row-action reset-pwd" 
                      title="Réinitialiser le mot de passe de cet étudiant (mot de passe temporaire hech2026)"
                    >
                      🔑 MDP
                    </button>
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
                      🗑️ Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>


      <!-- VUE : RÉSULTATS DES QUIZ & ÉVALUATIONS DIAGNOSTIQUES -->
            <!-- VUE ÉVALUATION ET NOTES (SUR 200 POINTS) -->
      <div v-if="adminTab === 'evaluation'" class="tab-panel">
        <div class="eval-admin-toolbar">
          <div>
            <h3>🏆 Suivi Global des Notes & Modalités d'Évaluation (200 Points)</h3>
            <p>Pondération officielle : <strong>70 pts</strong> Travaux Plateforme (10 pts Quiz + 60 pts Devoirs) • <strong>100 pts</strong> Création Jeu de Société (FabLab/IA/Vidéo/Photos) • <strong>30 pts</strong> Soutenance Orale.</p>
          </div>
          <button @click="exportEvaluationsToCSV" class="btn-action-tool brand" title="Télécharger le relevé complet des notes sous format Excel CSV">
            📊 Exporter les Notes (CSV)
          </button>
        </div>

        <div class="table-responsive">
          <table class="data-table eval-matrix-table">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Quiz (/10)</th>
                <th>Devoirs (/60)</th>
                <th>Pilier 1 (/70)</th>
                <th>Jeu (/100)</th>
                <th>Oral (/30)</th>
                <th>Total (/200)</th>
                <th>Note (/20)</th>
                <th>Statut</th>
                <th style="text-align: right;">Éditer</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in displayedUsers" :key="u.id" :class="{ 'row-archived': u.status === 'archived' }">
                <td>
                  <strong>{{ u.lastName }}</strong> {{ u.firstName }}
                  <div class="student-sub-mail">{{ u.email }}</div>
                </td>
                <td class="num-cell">{{ getStudentEvalData(u.email).pillar1.quizPoints }}</td>
                <td class="num-cell">
                  <span :class="['duty-badge', getStudentEvalData(u.email).pillar1.exercisesTotal >= 60 ? 'full' : 'partial']">
                    {{ getStudentEvalData(u.email).pillar1.exercisesTotal }} / 60
                  </span>
                </td>
                <td class="num-cell pillar1-cell">
                  <strong>{{ getStudentEvalData(u.email).pillar1.total }}</strong>
                </td>
                <td class="num-cell">{{ getStudentEvalData(u.email).pillar2.total }}</td>
                <td class="num-cell">{{ getStudentEvalData(u.email).pillar3.total }}</td>
                <td class="num-cell total-200-cell">
                  <strong>{{ getStudentEvalData(u.email).totalScore }}</strong>
                </td>
                <td class="num-cell grade-20-cell">
                  <strong>{{ getStudentEvalData(u.email).totalOutOf20 }}</strong>
                </td>
                <td>
                  <span :class="['status-badge', getStudentEvalData(u.email).isPassing ? 'active' : 'archived']">
                    {{ getStudentEvalData(u.email).isPassing ? 'Admis' : 'En cours' }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="action-buttons-group">
                    <button @click="openEditEvalModal(u)" class="btn-row-action edit-grade" title="Modifier les points et le feedback">
                      ✏️ Noter
                    </button>
                    <button @click="handleDeleteStudent(u)" class="btn-row-action delete-mini" title="Supprimer cet étudiant">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- MODAL D'ÉDITION DES POINTS ET DU FEEDBACK -->
        <div v-if="selectedStudentEval" class="modal-overlay" @click.self="selectedStudentEval = null">
          <div class="modal-card eval-modal">
            <div class="modal-header">
              <h4>🎯 Barème & Évaluation : {{ evalForm.name }}</h4>
              <button class="btn-close" @click="selectedStudentEval = null">✕</button>
            </div>

            <div class="eval-modal-body">
              <div class="eval-modal-summary">
                <div class="sum-box">
                  <span class="sum-label">Quiz Plateforme (Auto)</span>
                  <span class="sum-val">{{ selectedStudentEval.pillar1.quizPoints }} / 20</span>
                </div>
                <div class="sum-box">
                  <span class="sum-label">Devoirs Déposés (Auto)</span>
                  <span class="sum-val">{{ selectedStudentEval.pillar1.exercisesTotal }} / 60</span>
                </div>
                <div class="sum-box highlight">
                  <span class="sum-label">Note Actuelle</span>
                  <span class="sum-val">{{ selectedStudentEval.totalScore }} / 200</span>
                </div>
              </div>

              <div class="form-group-eval">
                <label>📋 1. Préparation & Intégration pédagogique (max 20 pts)</label>
                <p class="field-hint">Dossier didactique, intention pédagogique et concordance FMTTN.</p>
                <input v-model.number="evalForm.gamePedagogyScore" type="number" min="0" max="20" />
              </div>

              <div class="form-group-eval">
                <label>🪚 2. Plateau de jeu - Découpe laser FabLab (max 15 pts)</label>
                <p class="field-hint">Fichier vectoriel .svg, gravure bois/plexiglas et finitions.</p>
                <input v-model.number="evalForm.gameBoardLaserScore" type="number" min="0" max="15" />
              </div>

              <div class="form-group-eval">
                <label>🎲 3. Pions de jeu - Impression 3D (max 15 pts)</label>
                <p class="field-hint">Modélisation 3D originale et qualité d'impression.</p>
                <input v-model.number="evalForm.gamePawns3dScore" type="number" min="0" max="15" />
              </div>

              <div class="form-group-eval">
                <label>🤖 4. Cartes de jeu conçues avec l'IA (max 15 pts)</label>
                <p class="field-hint">Prompts, génération visuelle et formulation didactique des cartes.</p>
                <input v-model.number="evalForm.gameAiCardsScore" type="number" min="0" max="15" />
              </div>

              <div class="form-group-eval">
                <label>🎬 5. Présentation vidéo du jeu (max 20 pts)</label>
                <p class="field-hint">Capsule vidéo explicative (2-3 min), pitch et règles en images.</p>
                <input v-model.number="evalForm.gameVideoScore" type="number" min="0" max="20" />
              </div>

              <div class="form-group-eval">
                <label>📸 6. Intégration des photos (max 15 pts)</label>
                <p class="field-hint">Prises de vue du matériel et intégration graphique.</p>
                <input v-model.number="evalForm.gamePhotosScore" type="number" min="0" max="15" />
              </div>

              <div class="form-group-eval highlight-oral">
                <label>🎤 Pilier 3 : Soutenance Orale devant la classe (max 30 pts)</label>
                <p class="field-hint">Animation de la table de jeu, argumentation didactique et échange réflexif.</p>
                <input v-model.number="evalForm.oralDefenseScore" type="number" min="0" max="30" />
              </div>

              <div class="form-group-eval">
                <label>💬 Observation & Feedback pédagogique pour l'étudiant</label>
                <textarea v-model="evalForm.teacherFeedback" rows="3" placeholder="Commentaire visible par l'étudiant dans son espace personnel..."></textarea>
              </div>
            </div>

            <div class="modal-footer modal-footer-spaced">
              <button @click="handleDeleteStudent({ firstName: evalForm.name, lastName: '', email: evalForm.email })" class="btn-danger-del" title="Supprimer cet étudiant">
                🗑️ Supprimer cet étudiant
              </button>
              <div class="modal-footer-right">
                <button @click="saveStudentEval" class="btn-primary">Enregistrer les notes</button>
                <button @click="selectedStudentEval = null" class="btn-secondary">Annuler</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="adminTab === 'quizzes'" class="tab-panel">
        <div class="students-toolbar">
          <div class="toolbar-left">
            <div class="filter-group">
              <label>Module :</label>
              <select v-model="quizModuleFilter" class="select-filter">
                <option v-for="m in availableQuizModules" :key="m.id" :value="m.id">
                  {{ m.title }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label>Étudiant :</label>
              <select v-model="quizStudentFilter" class="select-filter">
                <option value="all">Tous les étudiants</option>
                <option v-for="u in users" :key="u.id" :value="u.email">
                  {{ u.lastName }} {{ u.firstName }} ({{ u.email }})
                </option>
              </select>
            </div>
          </div>

          <div class="toolbar-right">
            <button @click="exportQuizResultsToCSV" class="btn-action-tool secondary" title="Exporter les résultats des quiz en CSV compatible Excel">
              📥 Exporter les Quiz (CSV)
            </button>
          </div>
        </div>

        <!-- STATS BANNER DE LA SÉLECTION -->
        <div class="quiz-stats-strip">
          <div class="stat-pill">
            <span class="stat-lbl">Tentatives enregistrées :</span>
            <span class="stat-val">{{ filteredQuizAttempts.length }}</span>
          </div>
          <div class="stat-pill">
            <span class="stat-lbl">Moyenne de la sélection :</span>
            <span class="stat-val bold">{{ filteredQuizAttempts.length > 0 ? Math.round(filteredQuizAttempts.reduce((a,b)=>a+b.percentage, 0)/filteredQuizAttempts.length) : 0 }}%</span>
          </div>
        </div>

        <!-- TABLE DES RÉSULTATS -->
        <div v-if="filteredQuizAttempts.length === 0" class="empty-state">
          <p>Aucun résultat de quiz ne correspond aux filtres sélectionnés.</p>
        </div>

        <div v-else class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Module</th>
                <th>Score Obtenu</th>
                <th>Date</th>
                <th style="text-align: right;">Détails & Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="att in filteredQuizAttempts" :key="att.id">
                <td>
                  <div class="student-cell">
                    <span class="student-avatar">{{ att.userName ? att.userName.charAt(0) : '?' }}</span>
                    <div>
                      <div class="student-name">{{ att.userName }}</div>
                      <div class="student-email">{{ att.userEmail }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="quiz-mod-tag">{{ att.moduleId }}</span>
                  <span class="quiz-mod-name">{{ att.moduleTitle }}</span>
                </td>
                <td>
                  <div class="quiz-score-pill" :class="att.percentage >= 80 ? 'good' : (att.percentage >= 50 ? 'medium' : 'low')">
                    <strong>{{ att.score }} / {{ att.totalPoints }}</strong> ({{ att.percentage }}%)
                  </div>
                </td>
                <td>{{ att.submittedAt }}</td>
                <td style="text-align: right;">
                  <div class="action-buttons-group">
                    <button 
                      class="btn-row-action primary" 
                      @click="selectedQuizDetail = att"
                      title="Consulter les réponses de l'étudiant et la grille"
                    >
                      👁️ Voir réponses
                    </button>
                    <button 
                      class="btn-row-action delete" 
                      @click="handleDeleteQuizAttempt(att.id)"
                      title="Supprimer cette tentative"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- MODAL DÉTAIL D'UN QUIZ ÉTUDIANT -->
        <div v-if="selectedQuizDetail" class="admin-modal-overlay" @click.self="selectedQuizDetail = null">
          <div class="admin-modal-card">
            <div class="admin-modal-header">
              <div>
                <h3>📝 Détail de l'évaluation diagnostique</h3>
                <p>{{ selectedQuizDetail.userName }} ({{ selectedQuizDetail.userEmail }}) • {{ selectedQuizDetail.moduleTitle }}</p>
              </div>
              <button class="btn-close-modal" @click="selectedQuizDetail = null">✕</button>
            </div>

            <div class="modal-score-summary">
              <span class="score-badge-large" :class="selectedQuizDetail.percentage >= 80 ? 'good' : 'medium'">
                Score : {{ selectedQuizDetail.score }} / {{ selectedQuizDetail.totalPoints }} ({{ selectedQuizDetail.percentage }}%)
              </span>
              <span class="submitted-date">Passé le {{ selectedQuizDetail.submittedAt }}</span>
            </div>

            <div class="modal-questions-list">
              <div 
                v-for="(ans, idx) in selectedQuizDetail.answers" 
                :key="idx" 
                class="modal-question-item"
                :class="ans.type === 'qcm' ? (ans.isCorrect ? 'correct' : 'wrong') : 'open'"
              >
                <div class="modal-q-head">
                  <span class="q-badge">{{ ans.type === 'qcm' ? 'QCM' : 'Question ouverte' }}</span>
                  <span class="q-pts">{{ ans.points }} / {{ ans.maxPoints }} pt{{ ans.maxPoints > 1 ? 's' : '' }}</span>
                </div>
                <h5 class="modal-q-text">{{ ans.questionText }}</h5>

                <div class="modal-answer-box">
                  <strong>Réponse de l'étudiant :</strong>
                  <p>{{ ans.userAnswer }}</p>
                </div>

                <div v-if="ans.type === 'qcm' && !ans.isCorrect" class="modal-feedback-box error">
                  <strong>Bonne réponse attendue :</strong>
                  <p>{{ ans.correctAnswer }}</p>
                  <p v-if="ans.explanation" class="expl-text">💡 {{ ans.explanation }}</p>
                </div>

                <div v-else-if="ans.type === 'open'" class="modal-feedback-box info">
                  <strong>Éléments attendus du syllabus & Corrigé type :</strong>
                  <p>{{ ans.explanation }}</p>
                  <p v-if="ans.openFeedback" class="expl-text">💬 {{ ans.openFeedback }}</p>
                </div>
              </div>
            </div>

            <div class="admin-modal-footer">
              <button class="btn-action-tool primary" @click="selectedQuizDetail = null">Fermer</button>
            </div>
          </div>
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

      <!-- VUE 3 : FICHIERS DÉPOSÉS, CORRECTION IA & ÉVALUATION ENSEIGNANT -->
      <div v-if="adminTab === 'files'" class="tab-panel">
        
        <!-- BANNIÈRE PRINCIPALE : STATS & CORRECTION IA EN LOT -->
        <div class="ai-correction-hero-card">
          <div class="hero-left">
            <div class="hero-icon-badge">🤖</div>
            <div class="hero-text-content">
              <h3>Correction Didactique Automatique par IA & Évaluation Enseignant</h3>
              <p>
                L'IA analyse le contenu des devoirs déposés (Word / PDF) selon les critères officiels de didactique HECh (DigComp 2.2, FMTTN, rigueur critique, faisabilité en classe). Vous gardez la main complète pour ajuster la note et rédiger votre évaluation dans la colonne dédiée.
              </p>
            </div>
          </div>

          <div class="hero-right-actions">
            <button 
              @click="runBatchAiAnalysis" 
              :disabled="isBatchAnalyzing || submittedFiles.length === 0"
              class="btn-batch-ai"
              title="Lancer l'analyse automatique sur tous les devoirs non encore corrigés"
            >
              <span v-if="isBatchAnalyzing" class="spinner-inline">⏳</span>
              <span v-else>🤖</span>
              {{ isBatchAnalyzing ? 'Correction IA en cours...' : 'Corriger tous les devoirs avec l\'IA' }}
            </button>

            <button 
              @click="handleSyncToDrive" 
              :disabled="isSyncing || submittedFiles.length === 0"
              class="btn-sync-drive-subtle"
              title="Sauvegarder dans votre dossier local Google Drive"
            >
              {{ isSyncing ? 'Synchronisation...' : '💾 Sauvegarder sur Google Drive' }}
            </button>
          </div>
        </div>

        <!-- COMPTEURS D'ÉTAT D'ÉVALUATION -->
        <div class="eval-metrics-strip">
          <div class="metric-box">
            <span class="m-val">{{ totalFilesCount }}</span>
            <span class="m-lbl">Devoirs déposés</span>
          </div>
          <div class="metric-box green">
            <span class="m-val">{{ totalAiAnalyzedFiles }}</span>
            <span class="m-lbl">Analysés par l'IA</span>
          </div>
          <div class="metric-box blue">
            <span class="m-val">{{ totalTeacherGradedFiles }}</span>
            <span class="m-lbl">Évalués par l'enseignant</span>
          </div>
          <div class="metric-box orange">
            <span class="m-val">{{ totalFilesCount - totalTeacherGradedFiles }}</span>
            <span class="m-lbl">À évaluer par l'enseignant</span>
          </div>
        </div>

        <div v-if="syncFeedback" class="sync-feedback-msg">
          {{ syncFeedback }}
        </div>

        <!-- FILTRES DES FICHIERS -->
        <div class="filters-row">
          <div class="filter-group">
            <label>Filtrer par Atelier :</label>
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

          <div class="filter-group">
            <label>Statut d'évaluation :</label>
            <select v-model="fileEvaluationFilter">
              <option value="all">Tous les statuts</option>
              <option value="ai-analyzed">✓ Analysés par l'IA</option>
              <option value="ai-pending">⏳ En attente d'analyse IA</option>
              <option value="teacher-graded">✅ Notés par l'enseignant</option>
              <option value="teacher-pending">⏳ À noter par l'enseignant</option>
            </select>
          </div>
        </div>

        <!-- TABLEAU DES FICHIERS DÉPOSÉS AVEC CORRECTION IA ET ÉVALUATION ENSEIGNANT -->
        <div class="table-responsive">
          <table class="data-table files-eval-table">
            <thead>
              <tr>
                <th style="width: 20%;">Étudiant</th>
                <th style="width: 20%;">Atelier & Document</th>
                <th style="width: 28%;">🤖 Correction Automatique IA</th>
                <th style="width: 24%;">👨‍🏫 Votre Évaluation (Enseignant)</th>
                <th style="width: 8%; text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredFiles.length === 0">
                <td colspan="5" class="empty-table-msg">
                  Aucun fichier déposé ne correspond aux critères de filtre.
                </td>
              </tr>
              <tr v-for="f in filteredFiles" :key="f.id" class="file-eval-row">
                <!-- 1. ÉTUDIANT -->
                <td>
                  <div class="student-profile-cell">
                    <span class="student-avatar-round">{{ f.userName ? f.userName.charAt(0) : '?' }}</span>
                    <div>
                      <strong>{{ f.userName }}</strong>
                      <div class="email-subtext">{{ f.userEmail }}</div>
                    </div>
                  </div>
                </td>

                <!-- 2. ATELIER & FICHIER -->
                <td>
                  <div class="file-info-cell">
                    <span class="exercise-badge-sm">{{ f.exerciseTitle }}</span>
                    <div class="file-name-line">
                      <span class="file-icon-inline">{{ f.formattedFileName.endsWith('.pdf') ? '📕' : '📘' }}</span>
                      <code class="formatted-name-text">{{ f.formattedFileName }}</code>
                    </div>
                    <div class="file-sub-meta">
                      <span>{{ formatSize(f.fileSize) }}</span>
                      <span>•</span>
                      <span>{{ f.submittedAt }}</span>
                      <span v-if="f.driveSynced" class="synced-tag">✓ Drive</span>
                    </div>
                  </div>
                </td>

                <!-- 3. CORRECTION AUTOMATIQUE IA -->
                <td>
                  <!-- Cas A : Fichier déjà analysé par l'IA -->
                  <div v-if="f.aiCorrection && f.aiCorrection.status === 'analyzed'" class="ai-cell-card">
                    <div class="ai-score-line">
                      <span class="ai-score-pill">
                        🎯 Note suggérée : <strong>{{ f.aiCorrection.suggestedScore }} / {{ f.aiCorrection.maxScore }}</strong>
                      </span>
                      <span class="ai-model-tag">{{ f.aiCorrection.modelUsed.includes('Ollama') ? 'Ollama' : 'IA HECh' }}</span>
                    </div>

                    <div class="ai-summary-quote">
                      « {{ f.aiCorrection.summary }} »
                    </div>

                    <div class="ai-cell-actions">
                      <button @click="selectedFileForAiReport = f" class="btn-ai-details" title="Consulter la grille complète, points forts et pistes d'amélioration">
                        👁️ Rapport IA détaillé
                      </button>
                      <button @click="runAiAnalysis(f.id)" :disabled="isAnalyzingFile[f.id]" class="btn-ai-reanalyze" title="Relancer une analyse IA fraîche">
                        {{ isAnalyzingFile[f.id] ? 'Analyse...' : '🔄 Ré-analyser' }}
                      </button>
                    </div>
                  </div>

                  <!-- Cas B : Fichier en attente d'analyse IA -->
                  <div v-else class="ai-pending-box">
                    <span class="pending-text">Non corrigé par l'IA</span>
                    <button 
                      @click="runAiAnalysis(f.id)" 
                      :disabled="isAnalyzingFile[f.id]"
                      class="btn-run-single-ai"
                    >
                      <span v-if="isAnalyzingFile[f.id]" class="spinner-mini">⏳</span>
                      <span v-else>🤖</span>
                      {{ isAnalyzingFile[f.id] ? 'Analyse en cours...' : 'Corriger avec l\'IA' }}
                    </button>
                  </div>
                </td>

                <!-- 4. VOTRE ÉVALUATION (ENSEIGNANT) -->
                <td>
                  <div class="teacher-eval-card">
                    <div class="teacher-score-row">
                      <div class="score-input-group">
                        <label class="lbl-mini">Note :</label>
                        <input 
                          type="number" 
                          min="0" 
                          max="10" 
                          step="0.5" 
                          class="input-teacher-score"
                          :value="getTeacherScore(f)"
                          @input="(e) => setTeacherScore(f, e.target.value)"
                        />
                        <span class="denom-mini">/ 10 pts</span>
                      </div>

                      <button 
                        v-if="f.aiCorrection" 
                        @click="adoptAiScore(f)"
                        class="btn-adopt-ai-mini"
                        title="Pré-remplir avec la note et le résumé de l'IA"
                      >
                        ⚡ Reprendre IA
                      </button>
                    </div>

                    <div class="teacher-feedback-row">
                      <textarea 
                        class="input-teacher-feedback"
                        rows="2"
                        placeholder="Votre feedback formatif pour l'étudiant..."
                        :value="getTeacherFeedback(f)"
                        @input="(e) => setTeacherFeedback(f, e.target.value)"
                      ></textarea>
                    </div>

                    <div class="teacher-save-row">
                      <span :class="['teacher-status-pill', f.teacherGrade?.status === 'graded' ? 'graded' : 'pending']">
                        {{ f.teacherGrade?.status === 'graded' ? '✓ Validé' : '⏳ À valider' }}
                      </span>

                      <button @click="saveTeacherGradeForFile(f)" class="btn-save-teacher-eval">
                        💾 Enregistrer
                      </button>
                    </div>

                    <div v-if="gradeSaveFeedbacks[f.id]" class="grade-saved-msg">
                      ✅ {{ gradeSaveFeedbacks[f.id] }}
                    </div>
                  </div>
                </td>

                <!-- 5. ACTIONS -->
                <td style="text-align: right;">
                  <div class="action-buttons-group vertical">
                    <button @click="downloadFile(f)" class="btn-row-action dl" title="Télécharger le fichier original">
                      📥
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

        <!-- MODAL : RAPPORT D'ANALYSE IA DÉTAILLÉ -->
        <div v-if="selectedFileForAiReport" class="modal-overlay" @click.self="selectedFileForAiReport = null">
          <div class="modal-card ai-report-modal">
            <div class="modal-header">
              <div class="modal-title-group">
                <span class="modal-ai-badge">🤖 RAPPORT D'ÉVALUATION IA DIDACTIQUE</span>
                <h4>{{ selectedFileForAiReport.exerciseTitle }}</h4>
                <p class="modal-sub">
                  Étudiant : <strong>{{ selectedFileForAiReport.userName }}</strong> ({{ selectedFileForAiReport.userEmail }}) • Document : <code>{{ selectedFileForAiReport.formattedFileName }}</code>
                </p>
              </div>
              <button class="btn-close" @click="selectedFileForAiReport = null">✕</button>
            </div>

            <div v-if="selectedFileForAiReport.aiCorrection" class="ai-report-body">
              <!-- Score banner -->
              <div class="ai-score-hero">
                <div class="ash-left">
                  <span class="ash-label">NOTE GLOBALE SUGGÉRÉE</span>
                  <div class="ash-score-big">
                    {{ selectedFileForAiReport.aiCorrection.suggestedScore }} <span class="ash-denom">/ 10 pts</span>
                  </div>
                  <span class="ash-model">Modèle : {{ selectedFileForAiReport.aiCorrection.modelUsed }}</span>
                </div>
                <div class="ash-right">
                  <div class="ash-summary-box">
                    <strong>Synthèse de l'IA :</strong>
                    <p>{{ selectedFileForAiReport.aiCorrection.summary }}</p>
                  </div>
                </div>
              </div>

              <!-- Barème 4 dimensions -->
              <div class="rubric-grid">
                <div class="rubric-card">
                  <span class="rc-title">1. Concordance programme & DigComp</span>
                  <div class="rc-score">{{ selectedFileForAiReport.aiCorrection.rubricScores.concordance }} / 3 pts</div>
                  <p class="rc-desc">Respect des attendus du référentiel et précision des concepts.</p>
                </div>
                <div class="rubric-card">
                  <span class="rc-title">2. Intégration didactique</span>
                  <div class="rc-score">{{ selectedFileForAiReport.aiCorrection.rubricScores.didacticQuality }} / 3 pts</div>
                  <p class="rc-desc">Faisabilité pédagogique et clarté des consignes pour les élèves.</p>
                </div>
                <div class="rubric-card">
                  <span class="rc-title">3. Rigueur de l'analyse critique</span>
                  <div class="rc-score">{{ selectedFileForAiReport.aiCorrection.rubricScores.criticalAnalysis }} / 2.5 pts</div>
                  <p class="rc-desc">Capacité de recul réflexif et déconstruction des procédés.</p>
                </div>
                <div class="rubric-card">
                  <span class="rc-title">4. Forme, structure & clarté</span>
                  <div class="rc-score">{{ selectedFileForAiReport.aiCorrection.rubricScores.formAndStructure }} / 1.5 pts</div>
                  <p class="rc-desc">Qualité de la mise en page, soin typographique et rigueur rédactionnelle.</p>
                </div>
              </div>

              <!-- Points forts et axes d'amélioration -->
              <div class="strengths-improvements-grid">
                <div class="panel-box strengths">
                  <h5>✅ Points forts constatés :</h5>
                  <ul>
                    <li v-for="(str, sIdx) in selectedFileForAiReport.aiCorrection.strengths" :key="sIdx">
                      {{ str }}
                    </li>
                  </ul>
                </div>

                <div class="panel-box improvements">
                  <h5>⚠️ Axes d'amélioration & vigilance didactique :</h5>
                  <ul>
                    <li v-for="(imp, iIdx) in selectedFileForAiReport.aiCorrection.improvements" :key="iIdx">
                      {{ imp }}
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Commentaire formatif global -->
              <div class="detailed-feedback-card">
                <h5>💬 Commentaire formatif détaillé pour l'étudiant :</h5>
                <p>{{ selectedFileForAiReport.aiCorrection.detailedFeedback }}</p>
              </div>
            </div>

            <div class="modal-footer">
              <button 
                @click="adoptAiScore(selectedFileForAiReport); saveTeacherGradeForFile(selectedFileForAiReport); selectedFileForAiReport = null" 
                class="btn-primary"
              >
                ⚡ Valider et enregistrer cette note IA pour l'étudiant
              </button>
              <button @click="selectedFileForAiReport = null" class="btn-secondary">
                Fermer
              </button>
            </div>
          </div>
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

/* STYLES DES QUIZ DANS L'ADMIN */
.badge-pwd {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.badge-pwd.active {
  background: rgba(16, 185, 129, 0.12);
  color: #065f46;
}

.badge-pwd.pending {
  background: rgba(245, 158, 11, 0.12);
  color: #92400e;
}

.btn-row-action.reset-pwd {
  background: rgba(99, 102, 241, 0.1);
  color: #4f46e5;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.btn-row-action.reset-pwd:hover {
  background: #4f46e5;
  color: white;
}

.quiz-stats-strip {
  display: flex;
  gap: 20px;
  margin: 1.2rem 0;
  padding: 0.8rem 1.2rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
}

.stat-lbl {
  color: var(--vp-c-text-2);
}

.stat-val {
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.stat-val.bold {
  color: var(--vp-c-brand-1);
  font-size: 1.05rem;
}

.quiz-mod-tag {
  background: rgba(99, 102, 241, 0.12);
  color: #4f46e5;
  font-weight: 800;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 8px;
}

.quiz-mod-name {
  font-weight: 600;
  font-size: 0.88rem;
}

.quiz-score-pill {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
}

.quiz-score-pill.good {
  background: rgba(16, 185, 129, 0.12);
  color: #065f46;
}

.quiz-score-pill.medium {
  background: rgba(245, 158, 11, 0.12);
  color: #92400e;
}

.quiz-score-pill.low {
  background: rgba(239, 68, 68, 0.12);
  color: #991b1b;
}

.admin-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 1.5rem;
}

.admin-modal-card {
  background: var(--vp-c-bg);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.admin-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 1rem;
}

.admin-modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.admin-modal-header p {
  margin: 4px 0 0 0;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
}

.btn-close-modal {
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: var(--vp-c-text-2);
}

.modal-score-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1.2rem 0;
  padding: 0.8rem 1.2rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
}

.score-badge-large {
  font-weight: 800;
  font-size: 1.1rem;
  padding: 4px 12px;
  border-radius: 6px;
}

.score-badge-large.good {
  background: #10b981;
  color: white;
}

.score-badge-large.medium {
  background: #f59e0b;
  color: white;
}

.modal-questions-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin: 1.5rem 0;
}

.modal-question-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 1.2rem;
  background: var(--vp-c-bg-soft);
}

.modal-question-item.correct {
  border-left: 5px solid #10b981;
}

.modal-question-item.wrong {
  border-left: 5px solid #ef4444;
}

.modal-question-item.open {
  border-left: 5px solid #3b82f6;
}

.modal-q-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}

.modal-q-text {
  margin: 0 0 0.8rem 0;
  font-size: 0.95rem;
  font-weight: 700;
}

.modal-answer-box {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  padding: 0.8rem;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 0.6rem;
}

.modal-answer-box p {
  margin: 4px 0 0 0;
}

.modal-feedback-box {
  padding: 0.8rem;
  border-radius: 6px;
  font-size: 0.88rem;
}

.modal-feedback-box.error {
  background: rgba(239, 68, 68, 0.08);
  border-left: 3px solid #ef4444;
}

.modal-feedback-box.info {
  background: rgba(59, 130, 246, 0.08);
  border-left: 3px solid #3b82f6;
}

.admin-modal-footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 1rem;
}

</style>


/* STYLES DE L'ÉVALUATION ADMIN (200 PTS) */
.admin-tab-btn.eval-tab-highlight {
  border-bottom-color: #ea580c;
  color: #ea580c;
  font-weight: 700;
}
.admin-tab-btn.eval-tab-highlight.active {
  background: rgba(234, 88, 12, 0.1);
}

.eval-admin-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}
.eval-admin-toolbar h3 {
  margin: 0 0 0.3rem 0;
  font-size: 1.25rem;
}
.eval-admin-toolbar p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.eval-matrix-table th {
  white-space: nowrap;
  font-size: 0.82rem;
}
.eval-matrix-table .num-cell {
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-size: 0.9rem;
}
.student-sub-mail {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.duty-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}
.duty-badge.full {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
}
.duty-badge.partial {
  background: rgba(234, 88, 12, 0.12);
  color: #ea580c;
}
.pillar1-cell strong {
  color: #0284c7;
}
.total-200-cell strong {
  font-size: 1.05rem;
  color: #ea580c;
}
.grade-20-cell strong {
  font-size: 1.05rem;
  color: #16a34a;
}
.table-grade-badge {
  cursor: pointer;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  background: rgba(2, 132, 199, 0.08);
  border: 1px solid rgba(2, 132, 199, 0.2);
  display: inline-block;
  font-size: 0.85rem;
}
.table-grade-badge:hover {
  background: rgba(2, 132, 199, 0.15);
}
.grade-out-of-20 {
  color: #16a34a;
  font-weight: 700;
  margin-left: 4px;
}
.btn-row-action.edit-grade {
  background: rgba(234, 88, 12, 0.1);
  color: #ea580c;
  border: 1px solid rgba(234, 88, 12, 0.3);
  font-weight: 600;
  border-radius: 6px;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
}
.btn-row-action.edit-grade:hover {
  background: #ea580c;
  color: #ffffff;
}

.eval-modal {
  max-width: 600px;
}
.eval-modal-summary {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.sum-box {
  flex: 1;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.8rem;
  text-align: center;
}
.sum-box.highlight {
  background: rgba(234, 88, 12, 0.08);
  border-color: rgba(234, 88, 12, 0.3);
}
.sum-label {
  display: block;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.2rem;
}
.sum-val {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.sum-box.highlight .sum-val {
  color: #ea580c;
}
.form-group-eval {
  margin-bottom: 1.25rem;
}
.form-group-eval label {
  display: block;
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 0.2rem;
  color: var(--vp-c-text-1);
}
.form-group-eval .field-hint {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  margin: 0 0 0.4rem 0;
}
.form-group-eval input, .form-group-eval textarea {
  width: 100%;
  padding: 0.65rem 0.8rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  box-sizing: border-box;
}
.form-group-eval input:focus, .form-group-eval textarea:focus {
  border-color: #ea580c;
  outline: none;
}


.btn-row-action.delete {
  background: #fee2e2;
  color: #b91c1c;
  border-color: #fca5a5;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.btn-row-action.delete:hover {
  background: #ef4444;
  color: #ffffff;
  border-color: #dc2626;
}
.btn-row-action.delete-mini {
  background: #fee2e2;
  color: #b91c1c;
  border-color: #fca5a5;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
}
.btn-row-action.delete-mini:hover {
  background: #ef4444;
  color: #ffffff;
}
.modal-footer-spaced {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.modal-footer-right {
  display: flex;
  gap: 0.5rem;
}
.btn-danger-del {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}
.btn-danger-del:hover {
  background: #ef4444;
  color: #ffffff;
}

/* NOUVEAUX STYLES : CORRECTION AUTOMATIQUE IA & ÉVALUATION ENSEIGNANT */
.ai-correction-hero-card {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%);
  border: 1px solid rgba(37, 99, 235, 0.25);
  border-radius: 14px;
  padding: 1.5rem 1.8rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.hero-left {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex: 1;
  min-width: 320px;
}

.hero-icon-badge {
  font-size: 2.2rem;
  background: var(--vp-c-bg);
  border: 1px solid rgba(37, 99, 235, 0.2);
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
}

.hero-text-content h3 {
  margin: 0 0 0.4rem 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}

.hero-text-content p {
  margin: 0;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.hero-right-actions {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: flex-end;
}

.btn-batch-ai {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25);
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-batch-ai:hover:not(:disabled) {
  opacity: 0.95;
  transform: translateY(-1px);
}

.btn-batch-ai:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sync-drive-subtle {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-sync-drive-subtle:hover {
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
}

.eval-metrics-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric-box {
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  padding: 1rem 1.2rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.metric-box .m-val {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}

.metric-box .m-lbl {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  font-weight: 600;
}

.metric-box.green .m-val { color: #10b981; }
.metric-box.blue .m-val { color: #2563eb; }
.metric-box.orange .m-val { color: #f59e0b; }

.files-eval-table th {
  background: var(--vp-c-bg-alt);
  font-weight: 700;
  font-size: 0.85rem;
  padding: 12px 10px;
}

.file-eval-row td {
  vertical-align: top;
  padding: 14px 10px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.student-profile-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-avatar-round {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.file-info-cell {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.file-name-line {
  display: flex;
  align-items: center;
  gap: 6px;
}

.file-sub-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
}

.synced-tag {
  background: #d1fae5;
  color: #065f46;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
}

/* BLOC IA CELL */
.ai-cell-card {
  background: rgba(37, 99, 235, 0.04);
  border: 1px solid rgba(37, 99, 235, 0.2);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ai-score-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-score-pill {
  font-size: 0.82rem;
  color: #1e40af;
  background: #dbeafe;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.ai-score-pill strong {
  font-size: 0.92rem;
  font-weight: 800;
}

.ai-model-tag {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  padding: 1px 5px;
  border-radius: 4px;
}

.ai-summary-quote {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.4;
  font-style: italic;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ai-cell-actions {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.2rem;
}

.btn-ai-details {
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-ai-reanalyze {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  padding: 4px 7px;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
}

.ai-pending-box {
  padding: 12px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.pending-text {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
}

.btn-run-single-ai {
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* BLOC ENSEIGNANT */
.teacher-eval-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.teacher-score-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.score-input-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.lbl-mini {
  font-size: 0.8rem;
  font-weight: 700;
}

.input-teacher-score {
  width: 54px;
  padding: 4px 6px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 700;
  text-align: center;
  background: var(--vp-c-bg-alt);
}

.denom-mini {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}

.btn-adopt-ai-mini {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
}

.input-teacher-feedback {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 0.8rem;
  font-family: inherit;
  background: var(--vp-c-bg-alt);
  box-sizing: border-box;
  resize: vertical;
}

.teacher-save-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.teacher-status-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
}

.teacher-status-pill.graded {
  background: #d1fae5;
  color: #065f46;
}

.teacher-status-pill.pending {
  background: #fef3c7;
  color: #92400e;
}

.btn-save-teacher-eval {
  background: #10b981;
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.grade-saved-msg {
  font-size: 0.75rem;
  color: #065f46;
  font-weight: 600;
}

.action-buttons-group.vertical {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

/* MODAL RAPPORT IA */
.ai-report-modal {
  max-width: 850px;
}

.modal-title-group h4 {
  margin: 4px 0 2px 0;
  font-size: 1.25rem;
  font-weight: 800;
}

.modal-ai-badge {
  font-size: 0.75rem;
  font-weight: 800;
  color: #2563eb;
  background: #dbeafe;
  padding: 2px 8px;
  border-radius: 6px;
}

.modal-sub {
  margin: 0;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.ai-report-body {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  margin-top: 1.2rem;
}

.ai-score-hero {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(59, 130, 246, 0.02));
  border: 1px solid rgba(37, 99, 235, 0.2);
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.ash-left {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 170px;
}

.ash-label {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  letter-spacing: 0.5px;
}

.ash-score-big {
  font-size: 2.4rem;
  font-weight: 900;
  color: var(--vp-c-brand-1);
  line-height: 1;
}

.ash-denom {
  font-size: 1.1rem;
  color: var(--vp-c-text-3);
}

.ash-model {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}

.ash-right {
  flex: 1;
  min-width: 260px;
}

.ash-summary-box p {
  margin: 4px 0 0 0;
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--vp-c-text-1);
}

.rubric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.8rem;
}

.rubric-card {
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.8rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.rc-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}

.rc-score {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
}

.rc-desc {
  margin: 0;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  line-height: 1.3;
}

.strengths-improvements-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 768px) {
  .strengths-improvements-grid {
    grid-template-columns: 1fr;
  }
}

.panel-box {
  padding: 1rem 1.2rem;
  border-radius: 10px;
}

.panel-box h5 {
  margin: 0 0 0.6rem 0;
  font-size: 0.9rem;
  font-weight: 800;
}

.panel-box ul {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.85rem;
  line-height: 1.5;
}

.panel-box.strengths {
  background: rgba(16, 185, 129, 0.06);
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: var(--vp-c-text-1);
}

.panel-box.strengths h5 { color: #065f46; }

.panel-box.improvements {
  background: rgba(245, 158, 11, 0.06);
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: var(--vp-c-text-1);
}

.panel-box.improvements h5 { color: #92400e; }

.detailed-feedback-card {
  background: var(--vp-c-bg-alt);
  border-left: 4px solid var(--vp-c-brand-1);
  padding: 1rem 1.2rem;
  border-radius: 0 10px 10px 0;
}

.detailed-feedback-card h5 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 800;
}

.detailed-feedback-card p {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--vp-c-text-1);
}
