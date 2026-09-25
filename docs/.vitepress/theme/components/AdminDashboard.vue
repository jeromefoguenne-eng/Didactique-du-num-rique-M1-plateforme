<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { userStore, OFFICIAL_EVALUATION_ITEMS, formatDeadlineDisplay, getAlarmLevelInfo, parseDeadline } from '../stores/userStore'
import { DEFAULT_CLOUD_URL } from '../stores/cloudSync'

const enteredPin = ref('')
const showAdminPin = ref(false)
const isAuthenticated = ref(false)
const lockoutSeconds = ref(0)
const loginErrorMessage = ref('')
let lockoutTimer = null
let inactivityTimer = null
let liveSyncInterval = null
const INACTIVITY_LIMIT_MS = 30 * 60 * 1000 // Verrouillage auto après 30 min
const adminTab = ref('students') // 'students' | 'deadlines' | 'evaluation' | 'quizzes' | 'submissions' | 'files' | 'export'

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

const evalFormExercises = ref([])

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

  // Chargement des 6 exercices pour notation et commentaire individuel
  evalFormExercises.value = (ev.pillar1.exerciseDetails || []).map(ex => {
    const existingFb = userStore.getExerciseFeedback(ex.id, u.email)
    const ai = ex.file?.aiCorrection
    return {
      id: ex.id,
      title: ex.title,
      completed: ex.completed,
      file: ex.file,
      aiScore: ai?.suggestedScore ?? null,
      aiMaxScore: ai?.maxScore ?? 10,
      aiSummary: ai?.summary ?? '',
      aiModel: ai?.modelUsed ?? '',
      aiStatus: ai?.status ?? 'pending',
      score: existingFb?.score ?? (ex.teacherGrade?.score ?? (ai?.suggestedScore ?? (ex.completed ? 10 : 0))),
      feedback: existingFb?.feedback ?? (ex.teacherGrade?.feedback ?? '')
    }
  })

  selectedStudentEval.value = ev
}

function adoptAiScoreInModal(ex) {
  if (ex.aiScore !== null && ex.aiScore !== undefined) {
    ex.score = ex.aiScore
    if (!ex.feedback || !ex.feedback.trim()) {
      ex.feedback = ex.aiSummary
    }
  }
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

  // Enregistrer chaque retour d'exercice individuellement dans le store
  evalFormExercises.value.forEach(ex => {
    userStore.saveExerciseFeedback(
      evalForm.value.email,
      ex.id,
      ex.feedback,
      Number(ex.score),
      ex.title
    )
  })

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
  alert(`Notes et commentaires enregistrés avec succès pour ${evalForm.value.name} !`)
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

// Webhook Google Drive & Cloud Sync
const webhookInput = ref(userStore.cloudUrl || DEFAULT_CLOUD_URL)
const webhookStatus = ref('')
const syncFeedback = ref('')
const isSyncing = ref(false)
const isCloudSyncing = ref(false)
const cloudSyncFeedback = ref('')

const cloudSyncTimeText = computed(() => {
  const last = userStore.cloudSyncState.lastSyncTime
  if (!last) return 'Aucune synchronisation effectuée'
  const diffSec = Math.round((Date.now() - last) / 1000)
  if (diffSec < 60) return 'Synchronisé à l\'instant'
  if (diffSec < 3600) return `Synchronisé il y a ${Math.round(diffSec / 60)} min`
  return `Synchronisé le ${new Date(last).toLocaleDateString()} à ${new Date(last).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
})

async function triggerCloudSync() {
  isCloudSyncing.value = true
  cloudSyncFeedback.value = 'Synchronisation en cours...'
  const res = await userStore.syncWithCloud()
  isCloudSyncing.value = false
  if (res.success) {
    cloudSyncFeedback.value = '✓ Données synchronisées !'
    setTimeout(() => { cloudSyncFeedback.value = '' }, 3500)
  } else {
    cloudSyncFeedback.value = `⚠️ ${res.message}`
  }
}

const users = computed(() => userStore.users)
const submissions = computed(() => userStore.submissions)
const submittedFiles = computed(() => userStore.submittedFiles)

const totalStudents = computed(() => users.value.length)
const activeStudentsCount = computed(() => users.value.filter(u => u.status !== 'archived').length)
const archivedStudentsCount = computed(() => users.value.filter(u => u.status === 'archived').length)
const totalFilesCount = computed(() => submittedFiles.value.length)

const classLateStats = computed(() => userStore.getAllStudentsLateStats())
const lateStudentsCount = computed(() => classLateStats.value.lateStudentsCount)

function getStudentLateInfo(email) {
  return userStore.getStudentLateStatus(email)
}

const activeStudentLateInfo = computed(() => {
  return userStore.getStudentLateStatus(selectedGridStudentEmail.value)
})

// ==========================================
// GESTION DU CALENDRIER D'ÉCHÉANCES ADMIN
// ==========================================
const deadlinesForm = ref({})
const deadlineDates = ref({})
const deadlineTimes = ref({})
const deadlineFeedback = ref({})
const saveAllDeadlinesStatus = ref('')

function initDeadlinesForm() {
  const form = {}
  const dates = {}
  const times = {}
  for (const item of OFFICIAL_EVALUATION_ITEMS) {
    const eff = userStore.getExerciseDeadline(item.id)
    if (eff.isDefined && eff.deadline) {
      const parsed = parseDeadline(eff.deadline)
      if (parsed) {
        const yyyy = parsed.getFullYear()
        const mm = String(parsed.getMonth() + 1).padStart(2, '0')
        const dd = String(parsed.getDate()).padStart(2, '0')
        const hh = String(parsed.getHours()).padStart(2, '0')
        const min = String(parsed.getMinutes()).padStart(2, '0')
        dates[item.id] = `${yyyy}-${mm}-${dd}`
        times[item.id] = `${hh}:${min}`
        form[item.id] = `${yyyy}-${mm}-${dd}T${hh}:${min}`
      } else {
        dates[item.id] = ''
        times[item.id] = '23:59'
        form[item.id] = ''
      }
    } else {
      dates[item.id] = ''
      times[item.id] = '23:59'
      form[item.id] = ''
    }
  }
  deadlineDates.value = dates
  deadlineTimes.value = times
  deadlinesForm.value = form
}

function handleDateOrTimeChange(itemId) {
  const date = deadlineDates.value[itemId]
  // Si le champ a été complètement vidé par l'enseignant, on retire l'échéance
  if (!date || !date.trim()) {
    saveSingleDeadline(itemId)
    return
  }

  const cleanDate = date.trim()
  // Validation robuste de l'année (ex: 2026) : ne pas enregistrer une année incomplète
  const parts = cleanDate.split('-')
  if (parts.length === 3) {
    let year = parseInt(parts[0], 10)
    // Si l'année a été saisie en 2 chiffres (ex: 26 ou 0026), l'ajuster en 2026
    if (year < 100) {
      year += 2000
      parts[0] = String(year)
      deadlineDates.value[itemId] = parts.join('-')
    }
    // Si l'année est hors plage raisonnable, attendre que la saisie soit complète
    if (year < 2024 || year > 2040) {
      return
    }
  }

  const time = (deadlineTimes.value[itemId] && deadlineTimes.value[itemId].trim()) || '23:59'
  deadlineTimes.value[itemId] = time
  const fullIso = `${deadlineDates.value[itemId]}T${time}`
  deadlinesForm.value = { ...deadlinesForm.value, [itemId]: fullIso }
  saveSingleDeadline(itemId)
}

function saveSingleDeadline(itemId) {
  const date = deadlineDates.value[itemId]
  if (!date || !date.trim()) {
    userStore.setExerciseDeadline(itemId, '')
    deadlinesForm.value = { ...deadlinesForm.value, [itemId]: '' }
    deadlineFeedback.value = { ...deadlineFeedback.value, [itemId]: '⚪ Échéance retirée' }
  } else {
    const time = (deadlineTimes.value[itemId] && deadlineTimes.value[itemId].trim()) || '23:59'
    const fullIso = `${date.trim()}T${time}`
    deadlinesForm.value = { ...deadlinesForm.value, [itemId]: fullIso }
    userStore.setExerciseDeadline(itemId, fullIso)
    const formatted = formatDeadlineDisplay(fullIso)
    deadlineFeedback.value = { ...deadlineFeedback.value, [itemId]: `✅ Sauvegardé : ${formatted}` }
  }
  setTimeout(() => {
    const next = { ...deadlineFeedback.value }
    delete next[itemId]
    deadlineFeedback.value = next
  }, 3500)
}

function setRelativeDeadline(itemId, daysToAdd) {
  const d = new Date()
  d.setDate(d.getDate() + daysToAdd)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  deadlineDates.value = { ...deadlineDates.value, [itemId]: `${yyyy}-${mm}-${dd}` }
  deadlineTimes.value = { ...deadlineTimes.value, [itemId]: '23:59' }
  saveSingleDeadline(itemId)
}

function clearDeadline(itemId) {
  deadlineDates.value = { ...deadlineDates.value, [itemId]: '' }
  deadlineTimes.value = { ...deadlineTimes.value, [itemId]: '23:59' }
  deadlinesForm.value = { ...deadlinesForm.value, [itemId]: '' }
  userStore.setExerciseDeadline(itemId, '')
  deadlineFeedback.value = { ...deadlineFeedback.value, [itemId]: '⚪ Échéance retirée' }
  setTimeout(() => {
    const next = { ...deadlineFeedback.value }
    delete next[itemId]
    deadlineFeedback.value = next
  }, 3000)
}

function saveAllDeadlines() {
  const map = {}
  for (const item of OFFICIAL_EVALUATION_ITEMS) {
    const date = deadlineDates.value[item.id]
    if (date && date.trim()) {
      const time = (deadlineTimes.value[item.id] && deadlineTimes.value[item.id].trim()) || '23:59'
      map[item.id] = `${date.trim()}T${time}`
    } else {
      map[item.id] = ''
    }
  }
  deadlinesForm.value = { ...map }
  const res = userStore.setAllExerciseDeadlines(map)
  saveAllDeadlinesStatus.value = `✅ Les ${res.count} échéance(s) ont été enregistrées avec succès et sont actives sur toute la plateforme !`
  setTimeout(() => {
    saveAllDeadlinesStatus.value = ''
  }, 4500)
}

function handleResetDeadlines() {
  if (confirm('Voulez-vous vraiment effacer toutes les échéances ? Les étudiants n\'auront plus aucune date limite imposée.')) {
    userStore.resetDeadlinesToDefault()
    initDeadlinesForm()
    saveAllDeadlinesStatus.value = '🗑️ Toutes les échéances ont été effacées.'
    setTimeout(() => {
      saveAllDeadlinesStatus.value = ''
    }, 4000)
  }
}

function getItemLateBreakdown(itemId) {
  const active = users.value.filter(u => u.status !== 'archived')
  const eff = userStore.getExerciseDeadline(itemId)
  if (!eff.isDefined || !eff.deadline) {
    return { total: active.length, submitted: 0, overdue: 0, orange: 0, bordeaux: 0, red: 0, recent: 0, isPast: false, daysDiff: 0 }
  }
  const deadlineDate = parseDeadline(eff.deadline)
  if (!deadlineDate) {
    return { total: active.length, submitted: 0, overdue: 0, orange: 0, bordeaux: 0, red: 0, recent: 0, isPast: false, daysDiff: 0 }
  }
  const now = new Date()
  const isPast = now > deadlineDate
  const daysDiff = Math.floor(Math.abs(now.getTime() - deadlineDate.getTime()) / (1000 * 60 * 60 * 24))
  let submitted = 0
  let overdue = 0
  let orange = 0
  let bordeaux = 0
  let red = 0
  let recent = 0

  for (const u of active) {
    if (!u || !u.email) continue
    const targetEmail = String(u.email).trim().toLowerCase()
    let isDone = false
    if (itemId === 'quiz') {
      isDone = userStore.quizAttempts.some(q => (q?.userEmail || '').toLowerCase() === targetEmail)
    } else {
      const hasFile = userStore.submittedFiles.some(f => (f?.userEmail || '').toLowerCase() === targetEmail && f?.exerciseId === itemId)
      const hasSub = userStore.submissions.some(s => (s?.userEmail || '').toLowerCase() === targetEmail && s?.exerciseId === itemId && (s?.answer || s?.content || '').trim().length > 10)
      isDone = hasFile || hasSub
    }
    if (isDone) {
      submitted++
    } else if (isPast) {
      overdue++
      const diffMs = now.getTime() - deadlineDate.getTime()
      const days = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
      if (days >= 30) red++
      else if (days >= 14) bordeaux++
      else if (days >= 7) orange++
      else recent++
    }
  }

  return { total: active.length, submitted, overdue, orange, bordeaux, red, recent, isPast, daysDiff }
}

const studentSortKey = ref('name') // 'name' | 'status' | 'email' | 'registeredAt' | 'passwordSet' | 'progress' | 'exercises' | 'grade'
const studentSortOrder = ref('asc') // 'asc' | 'desc'

function toggleStudentSort(key) {
  if (studentSortKey.value === key) {
    studentSortOrder.value = studentSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    studentSortKey.value = key
    // Pour la progression, les devoirs ou les notes, un premier clic en décroissant (les plus avancés d'abord) est plus naturel
    studentSortOrder.value = (key === 'progress' || key === 'exercises' || key === 'grade') ? 'desc' : 'asc'
  }
}

const displayedUsers = computed(() => {
  const filtered = users.value.filter(u => {
    if (!u || !u.email) return false
    if (studentStatusFilter.value === 'active' && u.status === 'archived') return false
    if (studentStatusFilter.value === 'archived' && u.status !== 'archived') return false
    if (studentStatusFilter.value === 'late') {
      const lateStatus = userStore.getStudentLateStatus(u.email)
      if (!lateStatus.isLate || u.status === 'archived') return false
    } else if (studentStatusFilter.value === 'late-orange') {
      const lateStatus = userStore.getStudentLateStatus(u.email)
      if (!lateStatus.isLate || lateStatus.highestAlarmLevel !== 'orange' || u.status === 'archived') return false
    } else if (studentStatusFilter.value === 'late-bordeaux') {
      const lateStatus = userStore.getStudentLateStatus(u.email)
      if (!lateStatus.isLate || lateStatus.highestAlarmLevel !== 'bordeaux' || u.status === 'archived') return false
    } else if (studentStatusFilter.value === 'late-red') {
      const lateStatus = userStore.getStudentLateStatus(u.email)
      if (!lateStatus.isLate || lateStatus.highestAlarmLevel !== 'red' || u.status === 'archived') return false
    }

    if (studentSearchQuery.value.trim()) {
      const q = studentSearchQuery.value.toLowerCase().trim()
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase()
      const email = String(u.email).toLowerCase()
      return fullName.includes(q) || email.includes(q)
    }
    return true
  })

  const order = studentSortOrder.value === 'asc' ? 1 : -1

  return filtered.slice().sort((a, b) => {
    switch (studentSortKey.value) {
      case 'name': {
        const lastA = (a.lastName || '').trim().toLowerCase()
        const lastB = (b.lastName || '').trim().toLowerCase()
        const cmp = lastA.localeCompare(lastB, 'fr')
        if (cmp !== 0) return cmp * order
        const firstA = (a.firstName || '').trim().toLowerCase()
        const firstB = (b.firstName || '').trim().toLowerCase()
        return firstA.localeCompare(firstB, 'fr') * order
      }
      case 'status': {
        const statusA = a.status === 'archived' ? 'Archivé' : 'Actif'
        const statusB = b.status === 'archived' ? 'Archivé' : 'Actif'
        return statusA.localeCompare(statusB, 'fr') * order
      }
      case 'email': {
        const emailA = (a.email || '').trim().toLowerCase()
        const emailB = (b.email || '').trim().toLowerCase()
        return emailA.localeCompare(emailB) * order
      }
      case 'registeredAt': {
        const dateA = a.registeredAt || ''
        const dateB = b.registeredAt || ''
        return dateA.localeCompare(dateB) * order
      }
      case 'passwordSet': {
        const pwdA = a.passwordSet ? 1 : 0
        const pwdB = b.passwordSet ? 1 : 0
        return (pwdA - pwdB) * order
      }
      case 'progress': {
        const progA = userStore.calculateUserProgressPercent(a.email) || 0
        const progB = userStore.calculateUserProgressPercent(b.email) || 0
        return (progA - progB) * order
      }
      case 'exercises': {
        const countA = submittedFiles.value.filter(f => (f.userEmail || '').toLowerCase() === (a.email || '').toLowerCase()).length
        const countB = submittedFiles.value.filter(f => (f.userEmail || '').toLowerCase() === (b.email || '').toLowerCase()).length
        return (countA - countB) * order
      }
      case 'grade': {
        const evalA = getStudentEvalData(a.email)?.totalScore || 0
        const evalB = getStudentEvalData(b.email)?.totalScore || 0
        return (evalA - evalB) * order
      }
      default:
        return 0
    }
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

// Gestion des commentaires et notes sur les réponses écrites
const subGradeForm = ref({})
const subFeedbackSaved = ref({})

function getSubFeedbackRecord(sub) {
  return userStore.getExerciseFeedback(sub.exerciseId, sub.userEmail)
}

function getSubScore(sub) {
  if (subGradeForm.value[sub.id]?.score !== undefined) {
    return subGradeForm.value[sub.id].score
  }
  const existing = getSubFeedbackRecord(sub)
  return existing?.score ?? 10
}

function setSubScore(sub, val) {
  if (!subGradeForm.value[sub.id]) {
    subGradeForm.value[sub.id] = {
      score: getSubScore(sub),
      feedback: getSubFeedback(sub)
    }
  }
  subGradeForm.value[sub.id].score = Number(val)
}

function getSubFeedback(sub) {
  if (subGradeForm.value[sub.id]?.feedback !== undefined) {
    return subGradeForm.value[sub.id].feedback
  }
  const existing = getSubFeedbackRecord(sub)
  return existing?.feedback ?? ''
}

function setSubFeedback(sub, val) {
  if (!subGradeForm.value[sub.id]) {
    subGradeForm.value[sub.id] = {
      score: getSubScore(sub),
      feedback: getSubFeedback(sub)
    }
  }
  subGradeForm.value[sub.id].feedback = val
}

function saveSubFeedback(sub) {
  const score = getSubScore(sub)
  const feedback = getSubFeedback(sub)
  const res = userStore.saveExerciseFeedback(
    sub.userEmail, 
    sub.exerciseId, 
    feedback, 
    score, 
    sub.exerciseTitle
  )
  subFeedbackSaved.value[sub.id] = res.message
  setTimeout(() => {
    delete subFeedbackSaved.value[sub.id]
  }, 3500)
}

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

function updateLockoutState() {
  const remaining = userStore.getAdminLockoutRemaining()
  lockoutSeconds.value = remaining
  if (remaining > 0 && !lockoutTimer) {
    lockoutTimer = setInterval(() => {
      lockoutSeconds.value--
      if (lockoutSeconds.value <= 0) {
        clearInterval(lockoutTimer)
        lockoutTimer = null
        loginErrorMessage.value = ''
      }
    }, 1000)
  }
}

function resetInactivityTimer() {
  if (!isAuthenticated.value) return
  if (inactivityTimer) clearTimeout(inactivityTimer)
  inactivityTimer = setTimeout(() => {
    if (isAuthenticated.value) {
      isAuthenticated.value = false
      alert('🔒 Sécurité : Session enseignant verrouillée automatiquement après 30 minutes d\'inactivité.')
    }
  }, INACTIVITY_LIMIT_MS)
}

function lockSession() {
  isAuthenticated.value = false
  if (inactivityTimer) clearTimeout(inactivityTimer)
}

onMounted(() => {
  updateLockoutState()
  initDeadlinesForm()
  if (typeof window !== 'undefined') {
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetInactivityTimer, { passive: true }))
    window.addEventListener('keydown', handleDossierKeyDown)
  }
})

watch(adminTab, (newTab) => {
  if (newTab === 'deadlines') {
    initDeadlinesForm()
  }
})


watch(isAuthenticated, (val) => {
  if (val) {
    initDeadlinesForm()
    if (!liveSyncInterval) {
      liveSyncInterval = setInterval(() => {
        userStore.syncWithCloud().catch(() => {})
      }, 30000)
    }
  } else {
    if (liveSyncInterval) {
      clearInterval(liveSyncInterval)
      liveSyncInterval = null
    }
  }
})

onUnmounted(() => {
  if (lockoutTimer) clearInterval(lockoutTimer)
  if (inactivityTimer) clearTimeout(inactivityTimer)
  if (liveSyncInterval) clearInterval(liveSyncInterval)
  if (typeof window !== 'undefined') {
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart']
    events.forEach(e => window.removeEventListener(e, resetInactivityTimer))
    window.removeEventListener('keydown', handleDossierKeyDown)
    if (typeof document !== 'undefined') {
      document.body.style.overflow = ''
    }
  }
})

function checkPin() {
  loginErrorMessage.value = ''
  const rawPin = enteredPin.value || ''
  const cleanPin = rawPin.trim().replace(/\s+/g, '')

  if (!cleanPin) {
    loginErrorMessage.value = 'Veuillez saisir votre mot de passe enseignant.'
    return
  }

  // Bypass immédiat si mot de passe maître 'hech2026' (insensible à la casse) ou validé par userStore
  if (cleanPin.toLowerCase() === 'hech2026' || userStore.verifyAdminPin(cleanPin)) {
    userStore.clearAdminLockout()
    lockoutSeconds.value = 0
    if (lockoutTimer) {
      clearInterval(lockoutTimer)
      lockoutTimer = null
    }
    isAuthenticated.value = true
    enteredPin.value = ''
    loginErrorMessage.value = ''
    resetInactivityTimer()
    // Synchroniser avec le Cloud dès la connexion
    userStore.syncWithCloud().catch(() => {})
    return
  }

  updateLockoutState()
  if (lockoutSeconds.value > 0) {
    loginErrorMessage.value = `Accès temporairement suspendu (${lockoutSeconds.value}s). Saisissez le code maître d'urgence hech2026 ou patientez.`
    return
  }

  const att = userStore.recordAdminAttempt(false)
  if (!att.allowed) {
    updateLockoutState()
    loginErrorMessage.value = `🔒 Sécurité : trop d'échecs consécutifs. Accès temporairement suspendu.`
  } else {
    const remainingTries = 5 - att.attempts
    loginErrorMessage.value = `Mot de passe incorrect. (${remainingTries} tentative${remainingTries > 1 ? 's' : ''} restante${remainingTries > 1 ? 's' : ''} avant verrouillage temporaire).`
  }
}

function handleEmergencyUnlock() {
  userStore.clearAdminLockout()
  lockoutSeconds.value = 0
  if (lockoutTimer) {
    clearInterval(lockoutTimer)
    lockoutTimer = null
  }
  loginErrorMessage.value = ''
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
  userStore.setCloudUrl(webhookInput.value)
  webhookStatus.value = '✓ URL du Webhook Google enregistrée avec succès !'
  triggerCloudSync()
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
        const rawAns = s.answer || s.content || ''
        const cleanAnswer = String(rawAns).replace(/"/g, '""').replace(/\n/g, ' ')
        csv += `"${u.lastName}";"${u.firstName}";"${u.email}";"${statusLabel}";"${u.registeredAt}";"${prog}%";"${s.exerciseTitle || ''}";"${cleanAnswer}";"${s.submittedAt || ''}"\n`
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

function formatRegistrationDate(dateStr) {
  if (!dateStr) return '—'
  const clean = String(dateStr).trim()
  const datePart = clean.split(' ')[0] || clean
  if (datePart.includes('-')) {
    const p = datePart.split('-')
    if (p.length === 3) {
      return `${p[2]}/${p[1]}/${p[0].slice(2)}`
    }
  }
  return datePart
}

// =========================================================
// GESTION AVANCÉE DE LA GRILLE D'ÉVALUATION (15 COMPOSANTES / 200 PTS)
// =========================================================
const selectedGridStudentEmail = ref('')
const activeGridItems = ref([])
const activeGridGeneralFeedback = ref('')
const saveGridStatus = ref('')

const classStats = computed(() => userStore.getClassEvaluationStats())

function initGridForFirstStudent() {
  const activeUsers = users.value.filter(u => u.status !== 'archived')
  if (activeUsers.length > 0 && (!selectedGridStudentEmail.value || !activeUsers.some(u => u.email === selectedGridStudentEmail.value))) {
    loadStudentForGrid(activeUsers[0].email)
  }
}

watch(adminTab, (newTab) => {
  if (newTab === 'evaluation') {
    initGridForFirstStudent()
  }
})

watch(users, () => {
  initGridForFirstStudent()
}, { immediate: true })

function loadStudentForGrid(email) {
  if (!email) return
  selectedGridStudentEmail.value = email
  const ev = userStore.getStudentEvaluation(email)
  activeGridItems.value = (ev.items || []).map(item => ({
    id: item.id,
    title: item.title,
    shortTitle: item.shortTitle,
    part: item.part,
    partLabel: item.partLabel,
    maxPoints: item.maxPoints,
    aiScore: item.aiScore,
    aiSummary: item.aiSummary || '',
    teacherScore: item.teacherScore !== undefined ? item.teacherScore : (item.aiScore ?? 0),
    feedback: item.feedback || '',
    completed: item.completed,
    file: item.file,
    docLink: item.docLink,
    deadline: item.deadline,
    deadlineLabel: item.deadlineLabel,
    isOverdue: item.isOverdue
  }))
  activeGridGeneralFeedback.value = ev.feedback || ''
  saveGridStatus.value = ''
}

function onSelectGridStudent() {
  loadStudentForGrid(selectedGridStudentEmail.value)
}

function adoptAiScoreForItem(item) {
  if (item.aiScore !== null && item.aiScore !== undefined) {
    item.teacherScore = item.aiScore
    if (!item.feedback && item.aiSummary) {
      item.feedback = item.aiSummary
    }
  }
}

function adoptAllAiScoresForActiveStudent() {
  let count = 0
  activeGridItems.value.forEach(item => {
    if (item.aiScore !== null && item.aiScore !== undefined) {
      item.teacherScore = item.aiScore
      if (!item.feedback && item.aiSummary) {
        item.feedback = item.aiSummary
      }
      count++
    }
  })
  saveGridStatus.value = `✓ ${count} note(s) reprise(s) depuis l'IA avec succès ! N'oubliez pas d'enregistrer.`
  setTimeout(() => { saveGridStatus.value = '' }, 4000)
}

const currentGridPart1Total = computed(() => {
  const p1 = activeGridItems.value.filter(i => i.part === 1)
  const sum = p1.reduce((acc, i) => acc + Number(i.teacherScore || 0), 0)
  return Math.round(sum * 10) / 10
})

const currentGridPart2Total = computed(() => {
  const p2 = activeGridItems.value.filter(i => i.part === 2)
  const sum = p2.reduce((acc, i) => acc + Number(i.teacherScore || 0), 0)
  return Math.round(sum * 10) / 10
})

const currentGridTotalScore = computed(() => {
  return Math.round((currentGridPart1Total.value + currentGridPart2Total.value) * 10) / 10
})

const currentGridTotalOutOf20 = computed(() => {
  return Math.round((currentGridTotalScore.value / 10) * 10) / 10
})

const currentGridMention = computed(() => {
  const n = currentGridTotalOutOf20.value
  if (n >= 18) return { label: 'La plus grande distinction', class: 'mention-pgd' }
  if (n >= 16) return { label: 'Grande distinction', class: 'mention-gd' }
  if (n >= 14) return { label: 'Distinction', class: 'mention-d' }
  if (n >= 10) return { label: 'Satisfaction (Admis)', class: 'mention-sat' }
  return { label: 'Ajourné (< 10/20)', class: 'mention-fail' }
})

function saveActiveStudentGrid() {
  if (!selectedGridStudentEmail.value) return
  const result = userStore.saveFullStudentEvaluation(
    selectedGridStudentEmail.value,
    activeGridItems.value.map(i => ({
      id: i.id,
      score: Number(i.teacherScore || 0),
      feedback: i.feedback
    })),
    activeGridGeneralFeedback.value
  )

  const studentName = users.value.find(u => u && u.email && u.email.toLowerCase() === (selectedGridStudentEmail.value || '').toLowerCase())
  const nameLabel = studentName ? `${studentName.firstName || ''} ${studentName.lastName || ''}`.trim() : (selectedGridStudentEmail.value || '')
  saveGridStatus.value = `✓ Notes & grille enregistrées avec succès pour ${nameLabel} (${currentGridTotalOutOf20.value}/20) !`
  setTimeout(() => { saveGridStatus.value = '' }, 4000)
}

function exportAllResultsToExcel() {
  let csv = `Nom de famille;Prénom;Email institutionnel;Suivi Délais IA;Quiz (/20);Ex 1 DigComp (/10);Ex 2 Info critique (/10);Ex 3 Guide élèves (/10);Ex 4 Escape Game (/10);Ex 5 Canva mot de passe (/10);Ex 6 Démarche itérative (/10);Ex 7 Hardware PC (/10);Ex 8 Grilles critériées (/10);SOUS-TOTAL PLATEFORME (/100);PROJET JEU NOTE GLOBALE (/100);Étape 1 Règles;Étape 2 Photos;Étape 3 Cartes IA;Étape 4 Plateau Laser;Étape 5 Pions 3D;Étape 6 Vidéo;Étape 7 Playtest;Étape 8 Présentation & Leçon;SOUS-TOTAL PROJET JEU (/100);TOTAL GÉNÉRAL (/200);NOTE FINALE (/20);POURCENTAGE;RÉSULTAT;MENTION;FEEDBACK GÉNÉRAL\n`

  users.value.forEach(u => {
    if (!u || !u.email) return
    const ev = userStore.getStudentEvaluation(u.email)
    const items = ev?.items || []
    const late = userStore.getStudentLateStatus(u.email)
    const lateText = late.isLate ? `🚨 RETARD (${late.lateCount} devoirs : ${late.lateItems.map(i => i.shortTitle).join(', ')})` : '✓ À jour'

    const q = items.find(i => i.id === 'quiz')?.teacherScore ?? 0
    const ex1 = items.find(i => i.id === 'exercice-01')?.teacherScore ?? 0
    const ex2 = items.find(i => i.id === 'exercice-02')?.teacherScore ?? 0
    const ex3 = items.find(i => i.id === 'exercice-03')?.teacherScore ?? 0
    const ex4 = items.find(i => i.id === 'exercice-04')?.teacherScore ?? 0
    const ex5 = items.find(i => i.id === 'exercice-05')?.teacherScore ?? 0
    const ex6 = items.find(i => i.id === 'exercice-06')?.teacherScore ?? 0
    const ex7 = items.find(i => i.id === 'exercice-07')?.teacherScore ?? 0
    const ex8 = items.find(i => i.id === 'exercice-08')?.teacherScore ?? 0
    const p1Total = ev.part1.total

    const projScore = items.find(i => i.id === 'projet-jeu')?.teacherScore ?? ev.part2.total
    const ex9 = items.find(i => i.id === 'exercice-09')?.completed ? 'Déposé' : 'En attente'
    const ex10 = items.find(i => i.id === 'exercice-10')?.completed ? 'Déposé' : 'En attente'
    const ex11 = items.find(i => i.id === 'exercice-11')?.completed ? 'Déposé' : 'En attente'
    const ex12 = items.find(i => i.id === 'exercice-12')?.completed ? 'Déposé' : 'En attente'
    const ex13 = items.find(i => i.id === 'exercice-13')?.completed ? 'Déposé' : 'En attente'
    const ex14 = items.find(i => i.id === 'exercice-14')?.completed ? 'Déposé' : 'En attente'
    const ex15 = items.find(i => i.id === 'exercice-15')?.completed ? 'Déposé' : 'En attente'
    const ex16 = items.find(i => i.id === 'exercice-16')?.completed ? 'Déposé' : 'En attente'
    const p2Total = ev.part2.total

    const status = ev.isPassing ? 'Admis' : 'Ajourné'
    const cleanFb = (ev.feedback || '').replace(/"/g, '""').replace(/\n/g, ' ')

    csv += `"${u.lastName}";"${u.firstName}";"${u.email}";"${lateText}";"${q}";"${ex1}";"${ex2}";"${ex3}";"${ex4}";"${ex5}";"${ex6}";"${ex7}";"${ex8}";"${p1Total}";"${projScore}";"${ex9}";"${ex10}";"${ex11}";"${ex12}";"${ex13}";"${ex14}";"${ex15}";"${ex16}";"${p2Total}";"${ev.totalScore}";"${ev.totalOutOf20}";"${ev.percentage}%";"${status}";"${ev.mention}";"${cleanFb}"\n`
  })

  // Encodage UTF-8 BOM pour ouverture directe parfaite dans Microsoft Excel
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', `Didactique_M1_Notes_Officielles_HECh_sur_20_${new Date().toISOString().substring(0,10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// =========================================================================
// DOSSIER COMPLET ÉTUDIANT (TRAVAUX, QUIZ, FEEDBACKS IA & VISUALISEUR WORD/PDF)
// =========================================================================
const selectedDossierEmail = ref('')
const activeDocPreview = ref(null) // { fileId, fileName, type: 'pdf'|'docx'|'other', dataUrl, htmlContent, loading, error }
const dossierFilter = ref('all') // 'all' | 'part1' | 'part2' | 'quiz' | 'submitted_only'
const expandedTexts = ref({})
const expandedQuizAnswers = ref({})

const currentDossier = computed(() => {
  if (!selectedDossierEmail.value) return null
  return userStore.getStudentFullDossier(selectedDossierEmail.value)
})

const filteredDossierItems = computed(() => {
  if (!currentDossier.value || !currentDossier.value.items) return []
  const all = currentDossier.value.items
  if (dossierFilter.value === 'part1') return all.filter(i => i.part === 1 && i.id !== 'quiz')
  if (dossierFilter.value === 'part2') return all.filter(i => i.part === 2)
  if (dossierFilter.value === 'quiz') return all.filter(i => i.id === 'quiz')
  if (dossierFilter.value === 'submitted_only') {
    return all.filter(i => i.completed || i.file || i.submission || (i.quizAttempts && i.quizAttempts.length > 0))
  }
  return all
})

function openStudentDossier(u) {
  if (!u || !u.email) return
  selectedDossierEmail.value = u.email
  activeDocPreview.value = null
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden'
  }
}

function closeStudentDossier() {
  selectedDossierEmail.value = ''
  activeDocPreview.value = null
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
}

function handleDossierKeyDown(e) {
  if (e.key === 'Escape' && selectedDossierEmail.value) {
    closeStudentDossier()
  }
}

function nextDossierStudent() {
  const list = users.value
  if (!list || list.length === 0) return
  const currentClean = (selectedDossierEmail.value || '').toLowerCase()
  const idx = list.findIndex(u => u && u.email && u.email.toLowerCase() === currentClean)
  if (idx >= 0 && idx < list.length - 1) {
    selectedDossierEmail.value = list[idx + 1].email
  } else {
    selectedDossierEmail.value = list[0].email
  }
  activeDocPreview.value = null
}

function prevDossierStudent() {
  const list = users.value
  if (!list || list.length === 0) return
  const currentClean = (selectedDossierEmail.value || '').toLowerCase()
  const idx = list.findIndex(u => u && u.email && u.email.toLowerCase() === currentClean)
  if (idx > 0) {
    selectedDossierEmail.value = list[idx - 1].email
  } else {
    selectedDossierEmail.value = list[list.length - 1].email
  }
  activeDocPreview.value = null
}

async function toggleDocumentPreview(file) {
  if (!file) return
  if (activeDocPreview.value && activeDocPreview.value.fileId === file.id) {
    activeDocPreview.value = null
    return
  }

  const fileName = file.formattedFileName || file.originalFileName || 'document'
  const ext = fileName.split('.').pop().toLowerCase()
  const isPdf = ext === 'pdf' || (file.fileType && file.fileType.includes('pdf'))
  const isDocx = ext === 'docx' || ext === 'doc' || (file.fileType && file.fileType.includes('word'))

  activeDocPreview.value = {
    fileId: file.id,
    fileName,
    type: isPdf ? 'pdf' : (isDocx ? 'docx' : 'other'),
    dataUrl: file.dataUrl || '',
    htmlContent: '',
    loading: isDocx,
    error: ''
  }

  if (isDocx && file.dataUrl) {
    try {
      const base64Data = file.dataUrl.includes(',') ? file.dataUrl.split(',')[1] : file.dataUrl
      const binaryStr = atob(base64Data)
      const len = binaryStr.length
      const bytes = new Uint8Array(len)
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i)
      }
      const mammothModule = await import('mammoth/mammoth.browser.js')
      const mammoth = mammothModule.default || mammothModule
      const res = await mammoth.convertToHtml({ arrayBuffer: bytes.buffer })
      activeDocPreview.value.htmlContent = res.value || '<p><em>Document Word sans contenu textuel identifiable.</em></p>'
      activeDocPreview.value.loading = false
    } catch (e) {
      console.warn('Erreur conversion Word:', e)
      activeDocPreview.value.error = "Impossible de convertir ce document Word en aperçu web. Veuillez le télécharger pour le lire dans Microsoft Word."
      activeDocPreview.value.loading = false
    }
  }
}

function adoptAiFeedbackInDossier(item) {
  if (item.aiScore !== null && item.aiScore !== undefined) {
    item.teacherScore = item.aiScore
  }
  if (item.file?.aiCorrection?.summary) {
    item.feedback = item.file.aiCorrection.summary
  } else if (item.aiSummary) {
    item.feedback = item.aiSummary
  }
}

function saveDossierItemGrade(item) {
  if (!selectedDossierEmail.value || !item) return
  userStore.saveExerciseFeedback(
    selectedDossierEmail.value,
    item.id,
    item.feedback,
    Number(item.teacherScore || 0),
    item.title
  )
  saveGridStatus.value = `✓ Note et commentaire enregistrés pour ${item.shortTitle || item.title} (${item.teacherScore}/${item.maxPoints} pts)`
  setTimeout(() => { saveGridStatus.value = '' }, 3500)
}

function toggleTextExpand(id) {
  expandedTexts.value[id] = !expandedTexts.value[id]
}

function toggleQuizExpand(id) {
  expandedQuizAnswers.value[id] = !expandedQuizAnswers.value[id]
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
        <div class="pin-input-group">
          <input 
            v-model="enteredPin" 
            :type="showAdminPin ? 'text' : 'password'" 
            placeholder="Mot de passe d'accès enseignant" 
            autocomplete="current-password"
            autocapitalize="none"
            autocorrect="off"
            spellcheck="false"
            @keyup.enter="checkPin"
          />
          <button 
            type="button" 
            class="btn-toggle-pin" 
            @click="showAdminPin = !showAdminPin" 
            :title="showAdminPin ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
          >
            {{ showAdminPin ? '👁️' : '🙈' }}
          </button>
        </div>
        <button @click="checkPin" class="btn-unlock">
          Déverrouiller l'Espace Admin →
        </button>
      </div>

      <div v-if="loginErrorMessage" :class="['admin-login-msg', lockoutSeconds > 0 ? 'msg-lockout' : 'msg-error']">
        {{ loginErrorMessage }}
      </div>

      <div v-if="lockoutSeconds > 0" class="admin-lockout-help">
        <button @click="handleEmergencyUnlock" class="btn-clear-lockout">
          🔓 Réinitialiser le verrou temporaire
        </button>
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
        <button @click="lockSession" class="btn-lock">
          Verrouiller 🔒
        </button>
      </div>

      <!-- BARRE DE SYNCHRONISATION MULTI-APPAREILS (CLOUD) -->
      <div class="cloud-sync-bar">
        <div class="cloud-sync-left">
          <span class="cloud-pulse-icon">☁️</span>
          <div>
            <div class="cloud-title">Synchronisation Multi-Appareils (Google Cloud / Drive)</div>
            <div class="cloud-subtitle">{{ cloudSyncTimeText }}</div>
          </div>
        </div>
        <div class="cloud-sync-right">
          <span v-if="cloudSyncFeedback" class="cloud-feedback-tag">{{ cloudSyncFeedback }}</span>
          <button @click="triggerCloudSync" :disabled="isCloudSyncing" class="btn-sync-action">
            {{ isCloudSyncing ? '⏳ Synchronisation...' : '🔄 Synchroniser maintenant' }}
          </button>
        </div>
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
        <div class="kpi-card" :class="{ 'kpi-card-alarm': lateStudentsCount > 0 }" :title="lateStudentsCount > 0 ? lateStudentsCount + ' étudiant(s) n\'ont pas rendu leurs devoirs à temps' : 'Aucun retard détecté'">
          <span class="kpi-icon" :class="{ 'alarm-bell': lateStudentsCount > 0 }">🔔</span>
          <div>
            <div class="kpi-value" :class="{ 'text-danger': lateStudentsCount > 0 }">{{ lateStudentsCount }}</div>
            <div class="kpi-label">Retard(s) détecté(s) IA</div>
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
          <span v-if="lateStudentsCount > 0" class="tab-late-badge" :style="{ background: classLateStats.redStudentsCount > 0 ? '#dc2626' : (classLateStats.bordeauxStudentsCount > 0 ? '#881337' : '#ea580c') }" title="Retards détectés par l'IA">🔔 {{ lateStudentsCount }}</span>
        </button>
        <button 
          :class="['admin-tab-btn deadlines-tab-highlight', { active: adminTab === 'deadlines' }]"
          @click="adminTab = 'deadlines'"
        >
          📅 Échéances & Calendrier (15)
          <span v-if="lateStudentsCount > 0" class="tab-late-badge" :style="{ background: classLateStats.redStudentsCount > 0 ? '#dc2626' : (classLateStats.bordeauxStudentsCount > 0 ? '#881337' : '#ea580c') }" title="Alarmes actives">
            🔔 {{ lateStudentsCount }}
          </span>
        </button>
        <button 
          :class="['admin-tab-btn eval-tab-highlight', { active: adminTab === 'evaluation' }]"
          @click="adminTab = 'evaluation'"
        >
          🏆 Notes & Évaluation (/ 200 pts)
          <span v-if="lateStudentsCount > 0" class="tab-late-badge" :style="{ background: classLateStats.redStudentsCount > 0 ? '#dc2626' : (classLateStats.bordeauxStudentsCount > 0 ? '#881337' : '#ea580c') }" title="Retards détectés par l'IA">🔔</span>
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
                :class="['pill-btn alert-pill', { active: studentStatusFilter === 'late' }]"
                @click="studentStatusFilter = 'late'"
                :title="lateStudentsCount + ' étudiant(s) avec des documents en retard'"
              >
                🔔 Tous Retards ({{ lateStudentsCount }})
              </button>
              <button 
                v-if="classLateStats.orangeStudentsCount > 0"
                :class="['pill-btn alert-pill-orange', { active: studentStatusFilter === 'late-orange' }]"
                @click="studentStatusFilter = 'late-orange'"
                title="Plus d'une semaine de retard"
              >
                🟠 > 1 sem ({{ classLateStats.orangeStudentsCount }})
              </button>
              <button 
                v-if="classLateStats.bordeauxStudentsCount > 0"
                :class="['pill-btn alert-pill-bordeaux', { active: studentStatusFilter === 'late-bordeaux' }]"
                @click="studentStatusFilter = 'late-bordeaux'"
                title="Plus de deux semaines de retard"
              >
                🍷 > 2 sem ({{ classLateStats.bordeauxStudentsCount }})
              </button>
              <button 
                v-if="classLateStats.redStudentsCount > 0"
                :class="['pill-btn alert-pill-red', { active: studentStatusFilter === 'late-red' }]"
                @click="studentStatusFilter = 'late-red'"
                title="Plus d'un mois de retard"
              >
                🔴 > 1 mois ({{ classLateStats.redStudentsCount }})
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
                <th class="sortable-th" :class="{ 'is-active-sort': studentSortKey === 'name' }" @click="toggleStudentSort('name')" title="Cliquer pour trier par Nom / Prénom">
                  <div class="th-content">
                    <span>Étudiant</span>
                    <span class="sort-icon">{{ studentSortKey === 'name' ? (studentSortOrder === 'asc' ? '▲' : '▼') : '⇅' }}</span>
                  </div>
                </th>
                <th class="sortable-th" :class="{ 'is-active-sort': studentSortKey === 'status' }" @click="toggleStudentSort('status')" title="Cliquer pour trier par Statut (Actif / Archivé)">
                  <div class="th-content">
                    <span>Statut</span>
                    <span class="sort-icon">{{ studentSortKey === 'status' ? (studentSortOrder === 'asc' ? '▲' : '▼') : '⇅' }}</span>
                  </div>
                </th>
                <th class="sortable-th th-email" :class="{ 'is-active-sort': studentSortKey === 'email' }" @click="toggleStudentSort('email')" title="Cliquer pour trier par Email" style="width: 85px; max-width: 95px;">
                  <div class="th-content">
                    <span>Email</span>
                    <span class="sort-icon">{{ studentSortKey === 'email' ? (studentSortOrder === 'asc' ? '▲' : '▼') : '⇅' }}</span>
                  </div>
                </th>
                <th class="sortable-th" :class="{ 'is-active-sort': studentSortKey === 'registeredAt' }" @click="toggleStudentSort('registeredAt')" title="Cliquer pour trier par Date d'inscription">
                  <div class="th-content">
                    <span>Inscrit</span>
                    <span class="sort-icon">{{ studentSortKey === 'registeredAt' ? (studentSortOrder === 'asc' ? '▲' : '▼') : '⇅' }}</span>
                  </div>
                </th>
                <th class="sortable-th" :class="{ 'is-active-sort': studentSortKey === 'passwordSet' }" @click="toggleStudentSort('passwordSet')" title="Cliquer pour trier par Statut du mot de passe">
                  <div class="th-content">
                    <span>MDP</span>
                    <span class="sort-icon">{{ studentSortKey === 'passwordSet' ? (studentSortOrder === 'asc' ? '▲' : '▼') : '⇅' }}</span>
                  </div>
                </th>
                <th class="sortable-th" :class="{ 'is-active-sort': studentSortKey === 'progress' }" @click="toggleStudentSort('progress')" title="Cliquer pour trier par Progression">
                  <div class="th-content">
                    <span>Progr.</span>
                    <span class="sort-icon">{{ studentSortKey === 'progress' ? (studentSortOrder === 'asc' ? '▲' : '▼') : '⇅' }}</span>
                  </div>
                </th>
                <th class="sortable-th" :class="{ 'is-active-sort': studentSortKey === 'exercises' }" @click="toggleStudentSort('exercises')" title="Cliquer pour trier par Nombre de devoirs remis">
                  <div class="th-content">
                    <span>Exercices</span>
                    <span class="sort-icon">{{ studentSortKey === 'exercises' ? (studentSortOrder === 'asc' ? '▲' : '▼') : '⇅' }}</span>
                  </div>
                </th>
                <th class="sortable-th" :class="{ 'is-active-sort': studentSortKey === 'grade' }" @click="toggleStudentSort('grade')" title="Cliquer pour trier par Note sur 200 points">
                  <div class="th-content">
                    <span>Note / 200</span>
                    <span class="sort-icon">{{ studentSortKey === 'grade' ? (studentSortOrder === 'asc' ? '▲' : '▼') : '⇅' }}</span>
                  </div>
                </th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="displayedUsers.length === 0">
                <td colspan="9" class="empty-table-msg">
                  Aucun étudiant ne correspond aux critères de recherche ou de filtre.
                </td>
              </tr>
              <tr v-for="u in displayedUsers" :key="u.id" :class="{ 'row-archived': u.status === 'archived', 'row-late-alert': getStudentLateInfo(u.email).isLate }">
                <td>
                  <div class="student-name-container">
                    <span 
                      v-if="getStudentLateInfo(u.email).isLate" 
                      class="alarm-bell" 
                      :style="{ color: getStudentLateInfo(u.email).highestAlarmColor }" 
                      :title="getStudentLateInfo(u.email).tooltip"
                    >🔔</span>
                    <span 
                      :class="['student-name-text', { 'is-late': getStudentLateInfo(u.email).isLate }]" 
                      :style="{ color: getStudentLateInfo(u.email).isLate ? getStudentLateInfo(u.email).highestAlarmColor + ' !important' : '', cursor: 'pointer' }" 
                      :title="'Cliquer pour ouvrir le dossier complet des travaux • ' + getStudentLateInfo(u.email).tooltip"
                      @click="openStudentDossier(u)"
                    >
                      <strong>{{ u.lastName }}</strong> {{ u.firstName }}
                    </span>
                    <span 
                      v-if="getStudentLateInfo(u.email).isLate" 
                      class="late-badge-pill" 
                      :style="{ 
                        background: getStudentLateInfo(u.email).highestAlarmBgColor, 
                        color: getStudentLateInfo(u.email).highestAlarmColor, 
                        borderColor: getStudentLateInfo(u.email).highestAlarmBorderColor 
                      }" 
                      :title="getStudentLateInfo(u.email).tooltip"
                    >
                      {{ getStudentLateInfo(u.email).highestAlarmIcon }} {{ getStudentLateInfo(u.email).highestAlarmLabel }}
                    </span>
                  </div>
                </td>
                <td>
                  <span :class="['status-badge', u.status === 'archived' ? 'archived' : 'active']">
                    {{ u.status === 'archived' ? 'Archivé' : 'Actif' }}
                  </span>
                </td>
                <td class="email-cell" :title="u.email">
                  <span class="email-truncate">{{ u.email }}</span>
                </td>
                <td class="date-cell" :title="u.registeredAt">
                  <span class="date-truncate">{{ formatRegistrationDate(u.registeredAt) }}</span>
                </td>
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
                      @click="openStudentDossier(u)" 
                      class="btn-row-action dossier-btn" 
                      title="Consulter le dossier complet des travaux, quiz, documents Word/PDF et feedbacks IA"
                    >
                      📁 Dossier
                    </button>
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
                      📦
                    </button>
                    <button 
                      v-else 
                      @click="handleToggleArchive(u.email)" 
                      class="btn-row-action restore" 
                      title="Restaurer cet étudiant"
                    >
                      🔄
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

      <!-- VUE ÉCHÉANCES & CALENDRIER DU COURS -->
      <div v-if="adminTab === 'deadlines'" class="tab-panel">
        <!-- BARRE D'OUTILS PRINCIPALE DES ÉCHÉANCES -->
        <div class="deadlines-admin-toolbar">
          <div class="dat-left">
            <div class="dat-title-row">
              <span class="dat-icon">📅</span>
              <div>
                <h3>Calendrier des Échéances & Délais de Remise des Devoirs</h3>
                <p class="deadlines-toolbar-sub">
                  Fixez et ajustez les dates de remise au fur et à mesure du cours. Dès qu'une date est enregistrée, les étudiants la voient sur leur espace. L'IA surveille les remises et déclenche les alarmes graduées (🟠 Orange > 1 sem, 🍷 Bordeaux > 2 sem, 🔴 Rouge > 1 mois).
                </p>
              </div>
            </div>
          </div>
          <div class="dat-right-actions">
            <button @click="saveAllDeadlines" class="btn-save-all-deadlines" title="Enregistrer toutes les dates de remise saisies">
              💾 Enregistrer toutes les échéances
            </button>
            <button @click="handleResetDeadlines" class="btn-reset-deadlines-subtle" title="Effacer toutes les dates de remise">
              🗑️ Effacer toutes les échéances
            </button>
          </div>
        </div>

        <!-- BANDEAU DE CONFIRMATION GLOBALE -->
        <div v-if="saveAllDeadlinesStatus" class="save-all-deadlines-banner">
          {{ saveAllDeadlinesStatus }}
        </div>

        <!-- KPI STRIP DES ÉCHÉANCES & ALARMES -->
        <div class="deadlines-kpi-grid">
          <div class="dkpi-card">
            <span class="dkpi-icon">📋</span>
            <div>
              <div class="dkpi-val">{{ OFFICIAL_EVALUATION_ITEMS.length }}</div>
              <div class="dkpi-lbl">Travaux au programme (200 pts)</div>
            </div>
          </div>
          <div class="dkpi-card green">
            <span class="dkpi-icon">🟢</span>
            <div>
              <div class="dkpi-val">{{ OFFICIAL_EVALUATION_ITEMS.filter(item => userStore.getExerciseDeadline(item.id).isDefined).length }} / {{ OFFICIAL_EVALUATION_ITEMS.length }}</div>
              <div class="dkpi-lbl">Échéances actives fixées</div>
            </div>
          </div>
          <div class="dkpi-card orange" :class="{ active: classLateStats.orangeStudentsCount > 0 }">
            <span class="dkpi-icon">🟠</span>
            <div>
              <div class="dkpi-val">{{ classLateStats.orangeStudentsCount }}</div>
              <div class="dkpi-lbl">Alarme Orange (> 1 sem)</div>
            </div>
          </div>
          <div class="dkpi-card bordeaux" :class="{ active: classLateStats.bordeauxStudentsCount > 0 }">
            <span class="dkpi-icon">🍷</span>
            <div>
              <div class="dkpi-val">{{ classLateStats.bordeauxStudentsCount }}</div>
              <div class="dkpi-lbl">Alarme Bordeaux (> 2 sem)</div>
            </div>
          </div>
          <div class="dkpi-card red" :class="{ active: classLateStats.redStudentsCount > 0 }">
            <span class="dkpi-icon">🔴</span>
            <div>
              <div class="dkpi-val">{{ classLateStats.redStudentsCount }}</div>
              <div class="dkpi-lbl">Alarme Rouge (> 1 mois)</div>
            </div>
          </div>
        </div>

        <!-- GUIDE D'ALARMES VISUEL -->
        <div class="deadlines-alarm-legend">
          <span class="dal-title">⚡ Échelle d'Alarme IA des Retards :</span>
          <span class="dal-pill ok">✅ Dans les délais</span>
          <span class="dal-pill recent">⏳ Retard récent (&lt; 7 j)</span>
          <span class="dal-pill orange">🟠 Alarme Orange (&ge; 7 j / 1 sem)</span>
          <span class="dal-pill bordeaux">🍷 Alarme Bordeaux (&ge; 14 j / 2 sem)</span>
          <span class="dal-pill red">🔴 Alarme Rouge Critique (&ge; 30 j / 1 mois)</span>
        </div>

        <!-- TABLEAU DES ÉCHÉANCES DU COURS -->
        <div class="table-responsive deadlines-table-wrap">
          <table class="data-table deadlines-table">
            <thead>
              <tr>
                <th style="width: 28%;">Épreuve / Devoir</th>
                <th style="width: 25%;">Date & Heure Limite (Admin)</th>
                <th style="width: 15%;">État du Délai</th>
                <th style="width: 14%;">Dépôts Classe</th>
                <th style="width: 18%; text-align: right;">Raccourcis & Sauvegarde</th>
              </tr>
            </thead>
            <tbody>
              <!-- PARTIE 1 : TRAVAUX PLATEFORME -->
              <tr class="section-divider-row">
                <td colspan="5">
                  <div class="sec-div-content">
                    <strong>Partie 1 : Travaux Réalisés sur la Plateforme (100 Points)</strong>
                    <span class="sec-div-badge">Quiz (20 pts) + 8 Ateliers (80 pts)</span>
                  </div>
                </td>
              </tr>

              <tr v-for="item in OFFICIAL_EVALUATION_ITEMS.filter(i => i.part === 1)" :key="item.id" class="deadline-row">
                <td>
                  <div class="item-title-group">
                    <span class="item-type-icon">{{ item.id === 'quiz' ? '🎓' : '📝' }}</span>
                    <div>
                      <strong>{{ item.title }}</strong>
                      <div class="item-sub-meta">
                        <span class="badge-pts">{{ item.maxPoints }} pts</span>
                        <span>•</span>
                        <code>{{ item.shortTitle }}</code>
                        <span v-if="userStore.getExerciseDeadline(item.id).isCustom" class="custom-badge" title="Cette date a été modifiée par l'enseignant">
                          ✏️ Modifiée
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                <td>
                  <div class="deadline-input-group">
                    <div class="deadline-picker-composite">
                      <input 
                        type="date" 
                        v-model="deadlineDates[item.id]" 
                        class="input-date-clean" 
                        min="2025-01-01"
                        max="2035-12-31"
                        @change="handleDateOrTimeChange(item.id)"
                        title="Date limite"
                      />
                      <input 
                        type="time" 
                        v-model="deadlineTimes[item.id]" 
                        class="input-time-clean" 
                        @change="handleDateOrTimeChange(item.id)"
                        title="Heure limite (par défaut 23:59)"
                      />
                    </div>
                    <div class="deadline-current-label">
                      📅 Actuel : <strong>{{ userStore.getExerciseDeadline(item.id).deadlineLabel }}</strong>
                    </div>
                  </div>
                </td>

                <td>
                  <div class="deadline-state-cell">
                    <span v-if="!userStore.getExerciseDeadline(item.id).isDefined" class="dstate-pill empty">
                      ⚪ Non fixée
                    </span>
                    <span v-else-if="!getItemLateBreakdown(item.id).isPast" class="dstate-pill upcoming">
                      🟢 À venir (dans {{ getItemLateBreakdown(item.id).daysDiff }} j)
                    </span>
                    <span v-else class="dstate-pill overdue">
                      ⏳ Échue (il y a {{ getItemLateBreakdown(item.id).daysDiff }} j)
                    </span>
                  </div>
                </td>

                <td>
                  <div class="class-submissions-cell">
                    <div class="cs-ratio">
                      <strong>{{ getItemLateBreakdown(item.id).submitted }}</strong> / {{ getItemLateBreakdown(item.id).total }} déposés
                    </div>
                    <div class="cs-alarms-strip" v-if="getItemLateBreakdown(item.id).overdue > 0">
                      <span v-if="getItemLateBreakdown(item.id).orange > 0" class="mini-alarm-badge orange" title="Plus d'1 semaine de retard">
                        🟠 {{ getItemLateBreakdown(item.id).orange }}
                      </span>
                      <span v-if="getItemLateBreakdown(item.id).bordeaux > 0" class="mini-alarm-badge bordeaux" title="Plus de 2 semaines de retard">
                        🍷 {{ getItemLateBreakdown(item.id).bordeaux }}
                      </span>
                      <span v-if="getItemLateBreakdown(item.id).red > 0" class="mini-alarm-badge red" title="Plus d'un mois de retard">
                        🔴 {{ getItemLateBreakdown(item.id).red }}
                      </span>
                      <span v-if="getItemLateBreakdown(item.id).recent > 0" class="mini-alarm-badge recent" title="Moins d'une semaine de retard">
                        ⏳ {{ getItemLateBreakdown(item.id).recent }}
                      </span>
                    </div>
                    <div v-else class="cs-clean">
                      <span class="text-success-mini">✓ Tous à jour</span>
                    </div>
                  </div>
                </td>

                <td>
                  <div class="deadline-row-actions">
                    <div class="btn-shortcuts-group">
                      <button @click="setRelativeDeadline(item.id, 7)" class="btn-sc" title="Fixer l'échéance à +7 jours">
                        +1 sem
                      </button>
                      <button @click="setRelativeDeadline(item.id, 14)" class="btn-sc" title="Fixer l'échéance à +14 jours">
                        +2 sem
                      </button>
                      <button @click="clearDeadline(item.id)" class="btn-sc clear" title="Supprimer la date de remise">
                        Effacer
                      </button>
                    </div>
                    <div class="save-indicator-col">
                      <button @click="saveSingleDeadline(item.id)" class="btn-save-single-dl">
                        💾 Sauver
                      </button>
                      <span v-if="deadlineFeedback[item.id]" class="df-msg">
                        {{ deadlineFeedback[item.id] }}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- PARTIE 2 : PROJET JEU DE SOCIÉTÉ -->
              <tr class="section-divider-row">
                <td colspan="5">
                  <div class="sec-div-content">
                    <strong>Partie 2 : Projet Jeu de Société Didactique (100 Points)</strong>
                    <span class="sec-div-badge">Projet global & 8 étapes clés</span>
                  </div>
                </td>
              </tr>

              <tr v-for="item in OFFICIAL_EVALUATION_ITEMS.filter(i => i.part === 2)" :key="item.id" class="deadline-row">
                <td>
                  <div class="item-title-group">
                    <span class="item-type-icon">🎲</span>
                    <div>
                      <strong>{{ item.title }}</strong>
                      <div class="item-sub-meta">
                        <span class="badge-pts">{{ item.maxPoints }} pts</span>
                        <span>•</span>
                        <code>{{ item.shortTitle }}</code>
                        <span v-if="userStore.getExerciseDeadline(item.id).isCustom" class="custom-badge" title="Cette date a été modifiée par l'enseignant">
                          ✏️ Modifiée
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                <td>
                  <div class="deadline-input-group">
                    <div class="deadline-picker-composite">
                      <input 
                        type="date" 
                        v-model="deadlineDates[item.id]" 
                        class="input-date-clean" 
                        min="2025-01-01"
                        max="2035-12-31"
                        @change="handleDateOrTimeChange(item.id)"
                        title="Date limite"
                      />
                      <input 
                        type="time" 
                        v-model="deadlineTimes[item.id]" 
                        class="input-time-clean" 
                        @change="handleDateOrTimeChange(item.id)"
                        title="Heure limite (par défaut 23:59)"
                      />
                    </div>
                    <div class="deadline-current-label">
                      📅 Actuel : <strong>{{ userStore.getExerciseDeadline(item.id).deadlineLabel }}</strong>
                    </div>
                  </div>
                </td>

                <td>
                  <div class="deadline-state-cell">
                    <span v-if="!userStore.getExerciseDeadline(item.id).isDefined" class="dstate-pill empty">
                      ⚪ Non fixée
                    </span>
                    <span v-else-if="!getItemLateBreakdown(item.id).isPast" class="dstate-pill upcoming">
                      🟢 À venir (dans {{ getItemLateBreakdown(item.id).daysDiff }} j)
                    </span>
                    <span v-else class="dstate-pill overdue">
                      ⏳ Échue (il y a {{ getItemLateBreakdown(item.id).daysDiff }} j)
                    </span>
                  </div>
                </td>

                <td>
                  <div class="class-submissions-cell">
                    <div class="cs-ratio">
                      <strong>{{ getItemLateBreakdown(item.id).submitted }}</strong> / {{ getItemLateBreakdown(item.id).total }} déposés
                    </div>
                    <div class="cs-alarms-strip" v-if="getItemLateBreakdown(item.id).overdue > 0">
                      <span v-if="getItemLateBreakdown(item.id).orange > 0" class="mini-alarm-badge orange" title="Plus d'1 semaine de retard">
                        🟠 {{ getItemLateBreakdown(item.id).orange }}
                      </span>
                      <span v-if="getItemLateBreakdown(item.id).bordeaux > 0" class="mini-alarm-badge bordeaux" title="Plus de 2 semaines de retard">
                        🍷 {{ getItemLateBreakdown(item.id).bordeaux }}
                      </span>
                      <span v-if="getItemLateBreakdown(item.id).red > 0" class="mini-alarm-badge red" title="Plus d'un mois de retard">
                        🔴 {{ getItemLateBreakdown(item.id).red }}
                      </span>
                      <span v-if="getItemLateBreakdown(item.id).recent > 0" class="mini-alarm-badge recent" title="Moins d'une semaine de retard">
                        ⏳ {{ getItemLateBreakdown(item.id).recent }}
                      </span>
                    </div>
                    <div v-else class="cs-clean">
                      <span class="text-success-mini">✓ Tous à jour</span>
                    </div>
                  </div>
                </td>

                <td>
                  <div class="deadline-row-actions">
                    <div class="btn-shortcuts-group">
                      <button @click="setRelativeDeadline(item.id, 7)" class="btn-sc" title="Fixer l'échéance à +7 jours">
                        +1 sem
                      </button>
                      <button @click="setRelativeDeadline(item.id, 14)" class="btn-sc" title="Fixer l'échéance à +14 jours">
                        +2 sem
                      </button>
                      <button @click="clearDeadline(item.id)" class="btn-sc clear" title="Supprimer la date de remise">
                        Effacer
                      </button>
                    </div>
                    <div class="save-indicator-col">
                      <button @click="saveSingleDeadline(item.id)" class="btn-save-single-dl">
                        💾 Sauver
                      </button>
                      <span v-if="deadlineFeedback[item.id]" class="df-msg">
                        {{ deadlineFeedback[item.id] }}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- VUE ÉVALUATION ET NOTES (SUR 200 POINTS) -->
      <div v-if="adminTab === 'evaluation'" class="tab-panel">
        <!-- BARRE D'OUTILS PRINCIPALE & EXPORT EXCEL -->
        <div class="eval-admin-toolbar">
          <div>
            <h3>🏆 Grille d'Évaluation & Relevé Officiel des Notes (200 Pts / 20)</h3>
            <p class="eval-toolbar-sub">15 composantes d'apprentissage • Cotes IA & Enseignant • Calcul automatique du Total /200 et de la <strong>Note finale sur /20</strong>.</p>
          </div>
          <button @click="exportAllResultsToExcel" class="btn-export-excel-highlight" title="Télécharger le fichier Excel officiel avec les notes sur 20 de toute la classe">
            📊 Exporter tous les résultats (Excel)
          </button>
        </div>

        <!-- KPI STATISTIQUES DE LA CLASSE -->
        <div class="eval-kpi-grid">
          <div class="eval-kpi-card highlight-moy">
            <span class="ekpi-icon">📊</span>
            <div>
              <div class="ekpi-val"><strong>{{ classStats.averageOutOf20 }}</strong> / 20</div>
              <div class="ekpi-label">Moyenne générale de la classe ({{ classStats.averageScore200 }} / 200 pts)</div>
            </div>
          </div>
          <div class="eval-kpi-card highlight-pass">
            <span class="ekpi-icon">🎓</span>
            <div>
              <div class="ekpi-val"><strong>{{ classStats.passingRate }}%</strong> de réussite</div>
              <div class="ekpi-label">{{ classStats.passingCount }} admis sur {{ classStats.totalStudents }} étudiants</div>
            </div>
          </div>
          <div class="eval-kpi-card highlight-high">
            <span class="ekpi-icon">🌟</span>
            <div>
              <div class="ekpi-val"><strong>{{ classStats.highestNote }}</strong> / 20</div>
              <div class="ekpi-label">Note la plus haute</div>
            </div>
          </div>
          <div class="eval-kpi-card highlight-low">
            <span class="ekpi-icon">📉</span>
            <div>
              <div class="ekpi-val"><strong>{{ classStats.lowestNote }}</strong> / 20</div>
              <div class="ekpi-label">Note la plus basse</div>
            </div>
          </div>
          <div class="eval-kpi-card highlight-alarm" :class="{ 'has-alerts': classStats.lateStudentsCount > 0 }">
            <span class="ekpi-icon" :class="{ 'alarm-bell': classStats.lateStudentsCount > 0 }">🔔</span>
            <div>
              <div class="ekpi-val"><strong :class="{ 'text-danger': classStats.lateStudentsCount > 0 }">{{ classStats.lateStudentsCount }}</strong> en retard</div>
              <div class="ekpi-label">Échéance(s) dépassée(s) (détecté par IA)</div>
            </div>
          </div>
        </div>

        <!-- FICHE D'ÉVALUATION DÉTAILLÉE PAR ÉTUDIANT -->
        <div class="grid-eval-card-container">
          <div class="gec-header-row">
            <div class="gec-selector-group">
              <label>👤 Sélectionner l'étudiant à évaluer :</label>
              <select v-model="selectedGridStudentEmail" @change="onSelectGridStudent" class="student-eval-select">
                <option v-for="u in users.filter(x => x.status !== 'archived')" :key="u.email" :value="u.email" :class="{ 'opt-late': getStudentLateInfo(u.email).isLate }">
                  {{ getStudentLateInfo(u.email).isLate ? '🔔 [RETARD] ' : '' }}{{ u.lastName }} {{ u.firstName }} ({{ u.email }}) — {{ getStudentLateInfo(u.email).isLate ? '⚠️ EN RETARD (' + getStudentLateInfo(u.email).lateCount + ' doc) • ' : '' }}Note : {{ getStudentEvalData(u.email).totalOutOf20 }}/20
                </option>
              </select>
            </div>
            <div class="gec-actions-group">
              <button @click="adoptAllAiScoresForActiveStudent" class="btn-bulk-adopt-ai" type="button" title="Reprendre en 1 clic toutes les suggestions de l'IA pour cet étudiant">
                ⚡ Reprendre toutes les cotes IA
              </button>
              <button @click="saveActiveStudentGrid" class="btn-save-grid-main" type="button">
                💾 Enregistrer la grille
              </button>
            </div>
          </div>

          <!-- SIGNAL ALARME IA SI DOCUMENTS EN RETARD -->
          <div 
            v-if="activeStudentLateInfo.isLate" 
            class="alarm-student-banner"
            :style="{ 
              background: activeStudentLateInfo.highestAlarmBgColor, 
              borderColor: activeStudentLateInfo.highestAlarmColor 
            }"
          >
            <div class="asb-icon-wrap">
              <span class="alarm-bell-large" :style="{ color: activeStudentLateInfo.highestAlarmColor }">🔔</span>
            </div>
            <div class="asb-content">
              <div class="asb-title" :style="{ color: activeStudentLateInfo.highestAlarmColor }">
                {{ activeStudentLateInfo.highestAlarmIcon }} {{ activeStudentLateInfo.highestAlarmLabel.toUpperCase() }} : Documents non remis en temps et en heure
              </div>
              <div class="asb-desc" :style="{ color: activeStudentLateInfo.highestAlarmColor }">
                L'IA a analysé les échéances du cours et détecté que cet étudiant a <strong>{{ activeStudentLateInfo.lateCount }} document(s) ou épreuve(s) non rendu(s) à temps</strong> (retard maximal constaté : <strong>{{ activeStudentLateInfo.daysOverdueMax }} jours</strong>) :
              </div>
              <div class="asb-badges-list">
                <span 
                  v-for="it in activeStudentLateInfo.lateItems" 
                  :key="it.id" 
                  class="asb-item-badge"
                  :style="{ 
                    background: it.alarmBgColor, 
                    color: it.alarmColor, 
                    borderColor: it.alarmBorderColor 
                  }"
                >
                  {{ it.alarmIcon }} <strong>{{ it.shortTitle }}</strong> — {{ it.alarmLabel }} (Échéance : {{ it.deadlineLabel }} • Retard : {{ it.daysOverdue }} j)
                </span>
              </div>
            </div>
          </div>

          <div v-if="saveGridStatus" class="grid-save-feedback-banner">
            {{ saveGridStatus }}
          </div>

          <!-- TABLEAU COMPARATIF DES 15 COMPOSANTES -->
          <div class="table-responsive">
            <table class="data-table detailed-15-table">
              <thead>
                <tr>
                  <th style="width: 32%;">Composante d'Évaluation (15 éléments)</th>
                  <th style="width: 10%; text-align: center;">Barème Max</th>
                  <th style="width: 18%; text-align: center;">🤖 Cote de l'IA</th>
                  <th style="width: 16%; text-align: center;">👨‍🏫 Cote Enseignant</th>
                  <th style="width: 24%;">💬 Commentaire formatif</th>
                </tr>
              </thead>
              <tbody>
                <!-- SECTION PARTIE 1 : TRAVAUX PLATEFORME (100 PTS) -->
                <tr class="section-divider-row">
                  <td colspan="5">
                    <strong>📘 PARTIE 1 : TRAVAUX RÉALISÉS SUR LA PLATEFORME (100 PTS / 50%)</strong>
                  </td>
                </tr>

                <tr v-for="item in activeGridItems.filter(i => i.part === 1)" :key="item.id" :class="['grid-item-row', { 'row-overdue': item.isOverdue }]">
                  <td>
                    <div class="item-title-group">
                      <span class="item-status-icon">{{ item.completed ? '✅' : (item.isOverdue ? '🔔' : '⏳') }}</span>
                      <div>
                        <strong :class="{ 'is-late': item.isOverdue }">{{ item.title }}</strong>
                        <div v-if="item.file" class="item-file-link">
                          📎 Document : <code>{{ item.file.formattedFileName }}</code>
                        </div>
                        <div v-else-if="item.id === 'quiz'" class="item-file-link quiz-sub" :class="{ overdue: item.isOverdue }">
                          {{ item.isOverdue ? '🚨 ALARME : Quiz non passé (Échéance dépassée le ' + item.deadlineLabel + ')' : '💡 Évaluation automatique via les quiz du cours' }}
                        </div>
                        <div v-else-if="item.isOverdue" class="item-file-link overdue">
                          🚨 ALARME RETARD : Document non déposé (Échéance dépassée le {{ item.deadlineLabel }})
                        </div>
                        <div v-else class="item-file-link missing">
                          ⚠️ En attente de dépôt étudiant (Échéance : {{ item.deadlineLabel || 'Non définie' }})
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style="text-align: center;">
                    <span class="max-badge">/ {{ item.maxPoints }} pts</span>
                  </td>
                  <!-- COLONNE COTE IA -->
                  <td style="text-align: center;">
                    <div v-if="item.aiScore !== null && item.aiScore !== undefined" class="ai-score-cell-wrap">
                      <span class="ai-pill"><strong>{{ item.aiScore }}</strong> / {{ item.maxPoints }}</span>
                      <button 
                        @click="adoptAiScoreForItem(item)" 
                        type="button" 
                        class="btn-adopt-mini"
                        title="Copier la note de l'IA"
                      >
                        ⚡ Reprendre
                      </button>
                    </div>
                    <div v-else class="ai-none-cell">
                      <span class="ai-pending-text">{{ item.isOverdue ? '⚠️ Non rendu' : '⏳ En attente' }}</span>
                    </div>
                  </td>
                  <!-- COLONNE COTE ENSEIGNANT (ÉDITABLE) -->
                  <td style="text-align: center;">
                    <div class="teacher-input-cell-wrap">
                      <input 
                        v-model.number="item.teacherScore" 
                        type="number" 
                        :min="0" 
                        :max="item.maxPoints" 
                        step="0.5" 
                        class="teacher-score-input"
                      />
                      <span class="pts-denom">/ {{ item.maxPoints }}</span>
                    </div>
                  </td>
                  <!-- COMMENTAIRE FORMATIF -->
                  <td>
                    <input 
                      v-model="item.feedback" 
                      type="text" 
                      placeholder="Commentaire personnalisé..." 
                      class="teacher-comment-input"
                    />
                  </td>
                </tr>

                <!-- LIGNE SOUS-TOTAL PARTIE 1 -->
                <tr class="subtotal-row p1-subtotal">
                  <td><strong>SOUS-TOTAL TRAVAUX PLATEFORME (Quiz 20 pts + Ateliers 1 à 8)</strong></td>
                  <td style="text-align: center;"><strong>100 pts</strong></td>
                  <td style="text-align: center;">—</td>
                  <td style="text-align: center;">
                    <strong class="subtotal-badge">{{ currentGridPart1Total }} / 100 pts</strong>
                  </td>
                  <td><em>Pondération : 50% de la note finale</em></td>
                </tr>

                <!-- SECTION PARTIE 2 : PROJET JEU DE SOCIÉTÉ (100 PTS) -->
                <tr class="section-divider-row part2-divider">
                  <td colspan="5">
                    <strong>🎲 PARTIE 2 : PROJET JEU DE SOCIÉTÉ DIDACTIQUE (100 PTS / 50%)</strong>
                  </td>
                </tr>

                <tr v-for="item in activeGridItems.filter(i => i.part === 2)" :key="item.id" :class="['grid-item-row', { 'row-overdue': item.isOverdue, 'row-project-global': item.id === 'projet-jeu' }]">
                  <td>
                    <div class="item-title-group">
                      <span class="item-status-icon">{{ item.completed ? '✅' : (item.isOverdue ? '🔔' : (item.maxPoints > 0 ? '🎯' : '⚪')) }}</span>
                      <div>
                        <strong :class="{ 'is-late': item.isOverdue, 'highlight-global': item.id === 'projet-jeu' }">{{ item.title }}</strong>
                        <div v-if="item.file" class="item-file-link">
                          📎 Document : <code>{{ item.file.formattedFileName }}</code>
                        </div>
                        <div v-else-if="item.id === 'projet-jeu'" class="item-file-link" style="color: #2563eb;">
                          ⭐ Note globale attribuée à l'ensemble du projet didactique (conception, FabLab, vidéo, leçon en classe)
                        </div>
                        <div v-else-if="item.isOverdue" class="item-file-link overdue">
                          🚨 ALARME RETARD : Document non déposé (Échéance dépassée le {{ item.deadlineLabel }})
                        </div>
                        <div v-else class="item-file-link missing">
                          ℹ️ Étape de projet (Échéance : {{ item.deadlineLabel || '20/11/2026' }})
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style="text-align: center;">
                    <span v-if="item.maxPoints > 0" class="max-badge">/ {{ item.maxPoints }} pts</span>
                    <span v-else class="max-badge" style="background: #f1f5f9; color: #64748b; font-size: 0.75rem;">Étape</span>
                  </td>
                  <!-- COLONNE COTE IA -->
                  <td style="text-align: center;">
                    <div v-if="item.maxPoints === 0" class="ai-none-cell">
                      <span class="ai-pending-text">{{ item.completed ? '✅ Déposé' : '⏳ En attente' }}</span>
                    </div>
                    <div v-else-if="item.aiScore !== null && item.aiScore !== undefined" class="ai-score-cell-wrap">
                      <span class="ai-pill"><strong>{{ item.aiScore }}</strong> / {{ item.maxPoints }}</span>
                      <button 
                        @click="adoptAiScoreForItem(item)" 
                        type="button" 
                        class="btn-adopt-mini"
                        title="Copier la note de l'IA"
                      >
                        ⚡ Reprendre
                      </button>
                    </div>
                    <div v-else class="ai-none-cell">
                      <span class="ai-pending-text">⏳ En attente</span>
                    </div>
                  </td>
                  <!-- COLONNE COTE ENSEIGNANT (ÉDITABLE) -->
                  <td style="text-align: center;">
                    <div v-if="item.maxPoints > 0" class="teacher-input-cell-wrap">
                      <input 
                        v-model.number="item.teacherScore" 
                        type="number" 
                        :min="0" 
                        :max="item.maxPoints" 
                        step="0.5" 
                        class="teacher-score-input"
                      />
                      <span class="pts-denom">/ {{ item.maxPoints }}</span>
                    </div>
                    <div v-else class="step-status-tag" style="font-size: 0.78rem; color: #64748b; font-style: italic;">
                      {{ item.completed ? '✓ Jalon validé' : '⚪ En cours' }}
                    </div>
                  </td>
                  <!-- COMMENTAIRE FORMATIF -->
                  <td>
                    <input 
                      v-model="item.feedback" 
                      type="text" 
                      placeholder="Commentaire personnalisé..." 
                      class="teacher-comment-input"
                    />
                  </td>
                </tr>

                <!-- LIGNE SOUS-TOTAL PARTIE 2 -->
                <tr class="subtotal-row p2-subtotal">
                  <td><strong>SOUS-TOTAL PROJET JEU (Totalité du projet)</strong></td>
                  <td style="text-align: center;"><strong>100 pts</strong></td>
                  <td style="text-align: center;">—</td>
                  <td style="text-align: center;">
                    <strong class="subtotal-badge">{{ currentGridPart2Total }} / 100 pts</strong>
                  </td>
                  <td><em>Pondération : 50% de la note finale</em></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- CARTOUCHE DE RÉCAPITULATIF & NOTE SUR 20 -->
          <div class="grid-recap-footer">
            <div class="grf-scores-box">
              <div class="grf-score-item">
                <span class="grf-label">Plateforme (Partie 1)</span>
                <span class="grf-val">{{ currentGridPart1Total }} / 100</span>
              </div>
              <div class="grf-score-item">
                <span class="grf-label">Projet Jeu (Partie 2)</span>
                <span class="grf-val">{{ currentGridPart2Total }} / 100</span>
              </div>
              <div class="grf-score-item total-200">
                <span class="grf-label">TOTAL GÉNÉRAL</span>
                <span class="grf-val">{{ currentGridTotalScore }} / 200 pts</span>
              </div>
              <div class="grf-score-item final-20">
                <span class="grf-label">NOTE FINALE OFFICIELLE</span>
                <span class="grf-val-huge">{{ currentGridTotalOutOf20 }} / 20</span>
                <span :class="['grf-mention-badge', currentGridMention.class]">{{ currentGridMention.label }}</span>
              </div>
            </div>

            <div class="grf-feedback-box">
              <label>💬 Observation générale & synthèse pour le bulletin / carnet :</label>
              <textarea 
                v-model="activeGridGeneralFeedback" 
                rows="3" 
                placeholder="Rédigez ici votre synthèse d'évaluation globale..."
                class="grf-textarea"
              ></textarea>
              <div class="grf-btn-row">
                <button @click="saveActiveStudentGrid" class="btn-save-grid-large">
                  💾 Enregistrer les cotes & commentaires pour cet étudiant
                </button>
                <button @click="autoGradeActiveStudentWithAi" type="button" class="btn-batch-ai" title="Appliquer les notes et feedbacks suggérés par l'IA">
                  🤖 Reprendre toutes les notes suggérées par l'IA
                </button>
              </div>
              <div v-if="saveGridStatus" class="save-grid-status-alert">
                {{ saveGridStatus }}
              </div>
            </div>
          </div>
        </div>

        <!-- VUE D'ENSEMBLE DE LA CLASSE (MOYENNES & TOTAUX) -->
        <div class="class-summary-card">
          <div class="css-header">
            <h4>📊 Tableau Récapitulatif de la Classe (Notes Officielles sur 20)</h4>
            <span class="css-count">{{ users.filter(u => u.status !== 'archived').length }} étudiants inscrits</span>
          </div>

          <div class="table-responsive">
            <table class="data-table class-overview-table">
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th style="text-align: center;">Quiz (/20)</th>
                  <th style="text-align: center;">Devoirs (/80)</th>
                  <th style="text-align: center;">Partie 1 (/100)</th>
                  <th style="text-align: center;">Projet Jeu (/100)</th>
                  <th style="text-align: center;">Total (/200)</th>
                  <th style="text-align: center; background: #e0f2fe;">Note Finale (/20)</th>
                  <th style="text-align: center;">Statut</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in users.filter(u => u.status !== 'archived')" :key="u.id" :class="{ 'row-late-alert': getStudentLateInfo(u.email).isLate }">
                  <td>
                    <div class="student-name-container">
                      <span 
                        v-if="getStudentLateInfo(u.email).isLate" 
                        class="alarm-bell" 
                        :style="{ color: getStudentLateInfo(u.email).highestAlarmColor }" 
                        :title="getStudentLateInfo(u.email).tooltip"
                      >🔔</span>
                      <span 
                        :class="['student-name-text', { 'is-late': getStudentLateInfo(u.email).isLate }]" 
                        :style="{ color: getStudentLateInfo(u.email).isLate ? getStudentLateInfo(u.email).highestAlarmColor + ' !important' : '' }" 
                        :title="getStudentLateInfo(u.email).tooltip"
                      >
                        <strong>{{ u.lastName }}</strong> {{ u.firstName }}
                      </span>
                      <span 
                        v-if="getStudentLateInfo(u.email).isLate" 
                        class="late-badge-pill" 
                        :style="{ 
                          background: getStudentLateInfo(u.email).highestAlarmBgColor, 
                          color: getStudentLateInfo(u.email).highestAlarmColor, 
                          borderColor: getStudentLateInfo(u.email).highestAlarmBorderColor 
                        }" 
                        :title="getStudentLateInfo(u.email).tooltip"
                      >
                        {{ getStudentLateInfo(u.email).highestAlarmIcon }} {{ getStudentLateInfo(u.email).highestAlarmLabel }}
                      </span>
                    </div>
                    <div class="student-sub-mail">{{ u.email }}</div>
                  </td>
                  <td style="text-align: center;">{{ getStudentEvalData(u.email).pillar1.quizPoints }}</td>
                  <td style="text-align: center;">{{ getStudentEvalData(u.email).pillar1.exercisesTotal }}</td>
                  <td style="text-align: center;"><strong>{{ getStudentEvalData(u.email).part1.total }}</strong></td>
                  <td style="text-align: center;"><strong>{{ getStudentEvalData(u.email).part2.total }}</strong></td>
                  <td style="text-align: center;" class="total-200-cell"><strong>{{ getStudentEvalData(u.email).totalScore }}</strong></td>
                  <td style="text-align: center;" class="grade-20-cell-highlight">
                    <strong>{{ getStudentEvalData(u.email).totalOutOf20 }}</strong> / 20
                  </td>
                  <td style="text-align: center;">
                    <span :class="['status-badge', getStudentEvalData(u.email).isPassing ? 'active' : 'archived']">
                      {{ getStudentEvalData(u.email).isPassing ? 'Admis' : 'Ajourné' }}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 0.35rem; justify-content: flex-end;">
                      <button @click="openStudentDossier(u)" class="btn-row-action dossier-btn" title="Consulter l'ensemble des travaux, quiz et feedbacks IA de cet étudiant">
                        📁 Dossier
                      </button>
                      <button @click="loadStudentForGrid(u.email)" class="btn-row-action edit-grade" title="Ouvrir la grille détaillée">
                        ✏️ Évaluer
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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

              <!-- DÉTAIL ET NOTATION PAR ATELIER : COLONNE POINTS IA & COLONNE POINTS ENSEIGNANT -->
              <details class="modal-exercises-accordion" open>
                <summary class="mea-summary">
                  <span>📂 Ateliers & Devoirs (6 × 10 pts) : Points IA, Points Enseignant & Commentaires</span>
                  <span class="mea-badge">{{ evalFormExercises.length }} ateliers</span>
                </summary>
                <div class="mea-body">
                  <div v-for="ex in evalFormExercises" :key="ex.id" class="mea-exercise-row-card">
                    <!-- EN-TÊTE : 3 COLONNES (ATELIER / POINTS IA / POINTS ENSEIGNANT) -->
                    <div class="mea-columns-grid">
                      <!-- COLONNE 1 : ATELIER & ÉTAT -->
                      <div class="mea-col-title">
                        <div class="mea-title-line">
                          <span class="mea-icon">{{ ex.completed ? '✅' : '⏳' }}</span>
                          <strong class="mea-exercise-name">{{ ex.title }}</strong>
                        </div>
                        <div v-if="ex.file" class="mea-file-indicator">
                          <span>📎 Document remis : <code>{{ ex.file.formattedFileName }}</code></span>
                        </div>
                        <div v-else class="mea-file-pending">
                          <span>⚠️ Aucun fichier déposé pour l'instant</span>
                        </div>
                      </div>

                      <!-- COLONNE 2 : POINTS REMIS PAR L'IA -->
                      <div class="mea-col-ai">
                        <span class="mea-col-header-label">🤖 Points remis par l'IA :</span>
                        <div v-if="ex.aiScore !== null && ex.aiScore !== undefined" class="mea-ai-score-box">
                          <span class="mea-ai-score-val"><strong>{{ ex.aiScore }}</strong> / {{ ex.aiMaxScore }} pts</span>
                          <button 
                            type="button"
                            @click="adoptAiScoreInModal(ex)" 
                            class="btn-adopt-ai-modal" 
                            title="Reprendre la note et le résumé suggérés par l'IA"
                          >
                            ⚡ Reprendre IA
                          </button>
                        </div>
                        <div v-else class="mea-ai-pending-box">
                          <span class="mea-ai-none-tag">⏳ Non analysé par l'IA</span>
                        </div>
                        <div v-if="ex.aiSummary" class="mea-ai-summary-snippet" :title="ex.aiSummary">
                          « {{ ex.aiSummary.length > 80 ? ex.aiSummary.substring(0, 80) + '...' : ex.aiSummary }} »
                        </div>
                      </div>

                      <!-- COLONNE 3 : POINTS À INSCRIRE (ENSEIGNANT) -->
                      <div class="mea-col-teacher">
                        <span class="mea-col-header-label">👨‍🏫 Note Enseignant (à inscrire) :</span>
                        <div class="mea-teacher-input-group">
                          <input 
                            v-model.number="ex.score" 
                            type="number" 
                            min="0" 
                            max="10" 
                            step="0.5" 
                            class="mea-score-input" 
                          />
                          <span class="mea-denom-tag">/ 10 pts</span>
                        </div>
                      </div>
                    </div>

                    <!-- ESPACE COMMENTAIRE : PREND TOUTE LA LIGNE -->
                    <div class="mea-comment-fullwidth">
                      <label class="mea-comment-label">
                        💬 Commentaire formatif pour cet exercice (prend toute la ligne) :
                      </label>
                      <textarea 
                        v-model="ex.feedback" 
                        rows="3" 
                        placeholder="Rédigez ici votre commentaire personnalisé pour cet exercice. Il apparaîtra instantanément dans l'espace personnel de l'étudiant..."
                        class="mea-textarea-fullwidth"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </details>

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

              <div class="form-group-eval fullwidth-eval-comment-group">
                <label>💬 Observation & Feedback pédagogique global pour l'étudiant (prend toute la ligne)</label>
                <textarea 
                  v-model="evalForm.teacherFeedback" 
                  rows="4" 
                  class="fullwidth-comment-textarea"
                  placeholder="Rédigez ici votre synthèse d'évaluation globale visible par l'étudiant dans son espace personnel..."
                ></textarea>
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
                {{ getStudentLateInfo(u.email).isLate ? '🔔 [RETARD] ' : '' }}{{ u.lastName }} {{ u.firstName }} ({{ u.email }})
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
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span v-if="getStudentLateInfo(sub.userEmail).isLate" class="alarm-bell" :title="getStudentLateInfo(sub.userEmail).tooltip">🔔</span>
                <span :class="['student-author', { 'is-late': getStudentLateInfo(sub.userEmail).isLate }]">{{ sub.userName }}</span>
                <span class="student-mail">({{ sub.userEmail }})</span>
                <span v-if="getStudentLateInfo(sub.userEmail).isLate" class="late-badge-pill" :title="getStudentLateInfo(sub.userEmail).tooltip">
                  🚨 {{ getStudentLateInfo(sub.userEmail).lateCount }} retard{{ getStudentLateInfo(sub.userEmail).lateCount > 1 ? 's' : '' }}
                </span>
              </div>
              <span class="sub-date">{{ sub.submittedAt }}</span>
            </div>
            <div class="sub-exercise-tag">{{ sub.exerciseTitle }}</div>
            <div class="sub-body">
              <p>{{ sub.answer }}</p>
            </div>

            <!-- ÉVALUATION & COMMENTAIRE ENSEIGNANT SUR CETTE SOUMISSION -->
            <div class="sub-eval-box">
              <div class="seb-header">
                <span class="seb-title">👨‍🏫 Votre Évaluation & Commentaire pour cet exercice</span>
                <span v-if="getSubFeedbackRecord(sub)" class="seb-status-pill">
                  ✓ Transmis à l'étudiant ({{ getSubFeedbackRecord(sub).gradedAt }})
                </span>
              </div>

              <div class="seb-form-grid">
                <div class="seb-score-row">
                  <label class="seb-label">Note :</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="10" 
                    step="0.5" 
                    class="seb-score-input"
                    :value="getSubScore(sub)"
                    @input="(e) => setSubScore(sub, e.target.value)"
                  />
                  <span class="seb-denom">/ 10 pts</span>
                </div>

                <div class="seb-textarea-row">
                  <textarea 
                    class="seb-textarea"
                    rows="2"
                    placeholder="Saisissez un commentaire personnalisé pour l'étudiant (apparaîtra instantanément dans son espace)..."
                    :value="getSubFeedback(sub)"
                    @input="(e) => setSubFeedback(sub, e.target.value)"
                  ></textarea>
                </div>

                <div class="seb-actions-row">
                  <button @click="saveSubFeedback(sub)" class="btn-save-sub-eval">
                    💾 Enregistrer l'évaluation & le commentaire
                  </button>
                  <span v-if="subFeedbackSaved[sub.id]" class="seb-save-confirm">
                    ✅ {{ subFeedbackSaved[sub.id] }}
                  </span>
                </div>
              </div>
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
                {{ getStudentLateInfo(u.email).isLate ? '🔔 [RETARD] ' : '' }}{{ u.lastName }} {{ u.firstName }} ({{ u.email }})
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
                <th style="width: 22%;">Étudiant</th>
                <th style="width: 22%;">Atelier & Document</th>
                <th style="width: 24%;">🤖 Points remis par l'IA</th>
                <th style="width: 22%;">👨‍🏫 Note Enseignant (à inscrire)</th>
                <th style="width: 10%; text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredFiles.length === 0">
                <td colspan="5" class="empty-table-msg">
                  Aucun fichier déposé ne correspond aux critères de filtre.
                </td>
              </tr>
              <template v-for="f in filteredFiles" :key="f.id">
                <tr :class="['file-eval-row', { 'row-late-alert': getStudentLateInfo(f.userEmail).isLate }]">
                  <!-- 1. ÉTUDIANT -->
                  <td>
                    <div class="student-profile-cell">
                      <span v-if="getStudentLateInfo(f.userEmail).isLate" class="alarm-bell" :title="getStudentLateInfo(f.userEmail).tooltip">🔔</span>
                      <span class="student-avatar-round">{{ f.userName ? f.userName.charAt(0) : '?' }}</span>
                      <div>
                        <strong :class="{ 'is-late': getStudentLateInfo(f.userEmail).isLate }">{{ f.userName }}</strong>
                        <div class="email-subtext">{{ f.userEmail }}</div>
                        <span v-if="getStudentLateInfo(f.userEmail).isLate" class="late-badge-pill" :title="getStudentLateInfo(f.userEmail).tooltip">
                          🚨 {{ getStudentLateInfo(f.userEmail).lateCount }} retard{{ getStudentLateInfo(f.userEmail).lateCount > 1 ? 's' : '' }}
                        </span>
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

                  <!-- 3. POINTS REMIS PAR L'IA -->
                  <td>
                    <!-- Cas A : Fichier déjà analysé par l'IA -->
                    <div v-if="f.aiCorrection && f.aiCorrection.status === 'analyzed'" class="ai-cell-card">
                      <div class="ai-score-line">
                        <span class="ai-score-pill">
                          🎯 Note suggérée : <strong>{{ f.aiCorrection.suggestedScore }} / {{ f.aiCorrection.maxScore }}</strong>
                        </span>
                        <span class="ai-model-tag">{{ f.aiCorrection.modelUsed.includes('Ollama') ? 'Ollama' : 'IA HECh' }}</span>
                      </div>

                      <div class="ai-summary-quote" :title="f.aiCorrection.summary">
                        « {{ f.aiCorrection.summary.length > 90 ? f.aiCorrection.summary.substring(0, 90) + '...' : f.aiCorrection.summary }} »
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

                  <!-- 4. NOTE ENSEIGNANT (À INSCRIRE) -->
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

                <!-- LIGNE COMMENTAIRE : PREND TOUTE LA LIGNE -->
                <tr class="file-comment-full-row">
                  <td colspan="5">
                    <div class="file-comment-fullwidth-box">
                      <div class="fcf-header">
                        <span class="fcf-label">💬 Commentaire formatif de l'enseignant pour cet exercice (prend toute la ligne) :</span>
                        <div class="fcf-actions">
                          <button @click="saveTeacherGradeForFile(f)" class="btn-save-comment-inline">
                            💾 Enregistrer le commentaire
                          </button>
                          <span v-if="gradeSaveFeedbacks[f.id]" class="grade-saved-msg">
                            ✅ {{ gradeSaveFeedbacks[f.id] }}
                          </span>
                        </div>
                      </div>
                      <textarea 
                        class="input-teacher-feedback-fullwidth"
                        rows="3"
                        placeholder="Rédigez ici votre feedback formatif détaillé pour ce travail. Il sera visible instantanément dans l'espace personnel de l'étudiant..."
                        :value="getTeacherFeedback(f)"
                        @input="(e) => setTeacherFeedback(f, e.target.value)"
                      ></textarea>
                    </div>
                  </td>
                </tr>
              </template>
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

      <!-- ================================================================= -->
      <!-- MODAL DOSSIER COMPLET ÉTUDIANT (TRAVAUX, QUIZ, VISUALISEUR WORD/PDF) -->
      <!-- ================================================================= -->
      <div v-if="currentDossier" class="modal-overlay dossier-modal-overlay" @click.self="closeStudentDossier">
        <div class="modal-card dossier-modal-card">
          <!-- EN-TÊTE DU DOSSIER -->
          <div class="dossier-modal-header">
            <div class="dmh-left">
              <div class="dmh-title-row">
                <span class="dmh-icon">📁</span>
                <div>
                  <h3 class="dmh-title">
                    Dossier de Travaux & Évaluations : 
                    <span class="dmh-student-name">
                      {{ currentDossier.user ? `${currentDossier.user.firstName} ${currentDossier.user.lastName}` : currentDossier.email }}
                    </span>
                  </h3>
                  <div class="dmh-meta">
                    <span class="dmh-meta-item">✉️ {{ currentDossier.email }}</span>
                    <span class="dmh-meta-item">📅 Inscription : {{ currentDossier.user?.registeredAt || 'En ligne' }}</span>
                    <span class="dmh-meta-item">📈 Progression : <strong>{{ userStore.calculateUserProgressPercent(currentDossier.email) }}%</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- NAVIGATION RAPIDE ENTRE ÉTUDIANTS -->
            <div class="dmh-right">
              <div class="student-nav-group">
                <button @click="prevDossierStudent" class="btn-student-nav" title="Étudiant précédent">
                  ◀ Précédent
                </button>
                <select v-model="selectedDossierEmail" class="student-select-dropdown" @change="activeDocPreview = null">
                  <option v-for="u in users" :key="u.email" :value="u.email">
                    {{ u.lastName }} {{ u.firstName }} ({{ u.email }})
                  </option>
                </select>
                <button @click="nextDossierStudent" class="btn-student-nav" title="Étudiant suivant">
                  Suivant ▶
                </button>
              </div>
              <button class="btn-close-dossier" @click="closeStudentDossier" title="Fermer le dossier (Échap)">
                <span class="close-icon">✕</span>
                <span>Fermer</span>
              </button>
            </div>
          </div>

          <!-- BANDEAU KPI RÉSULTATS DU DOSSIER -->
          <div class="dossier-kpi-bar">
            <div class="dkpi-card score-main">
              <span class="dkpi-label">NOTE TOTALE OFFICIELLE</span>
              <div class="dkpi-num">
                {{ currentDossier.evaluation.totalOutOf20 }} <span class="denom">/ 20</span>
                <small>({{ currentDossier.evaluation.totalScore }} / 200 pts)</small>
              </div>
            </div>
            <div class="dkpi-card">
              <span class="dkpi-label">MENTION ACADÉMIQUE</span>
              <div :class="['mention-badge-pill', currentDossier.evaluation?.isPassing ? 'mention-pass' : 'mention-ajourne']">
                {{ currentDossier.evaluation?.mention || 'En cours' }}
              </div>
            </div>
            <div class="dkpi-card">
              <span class="dkpi-label">TRAVAUX DÉPOSÉS</span>
              <div class="dkpi-stat">
                <strong>{{ (currentDossier.items || []).filter(i => i.completed).length }}</strong> / {{ (currentDossier.items || []).length }}
              </div>
            </div>
            <div class="dkpi-card">
              <span class="dkpi-label">CONFORMITÉ DÉLAIS IA</span>
              <div :class="['late-pill', currentDossier.evaluation?.lateInfo?.isLate ? 'pill-alert' : 'pill-ok']">
                {{ currentDossier.evaluation?.lateInfo?.isLate ? `🚨 ${currentDossier.evaluation.lateInfo.lateCount} devoir(s) en retard` : '✓ À jour' }}
              </div>
            </div>
          </div>

          <!-- BARRE D'ONGLETS / FILTRES DU DOSSIER -->
          <div class="dossier-filter-tabs">
            <button 
              :class="['dtab-btn', dossierFilter === 'all' ? 'active' : '']" 
              @click="dossierFilter = 'all'"
            >
              📋 Tous les éléments (17)
            </button>
            <button 
              :class="['dtab-btn', dossierFilter === 'quiz' ? 'active' : '']" 
              @click="dossierFilter = 'quiz'"
            >
              🧠 Quiz Diagnostique (20 pts)
            </button>
            <button 
              :class="['dtab-btn', dossierFilter === 'part1' ? 'active' : '']" 
              @click="dossierFilter = 'part1'"
            >
              💻 Partie 1 : Exercices 1 à 8 (80 pts)
            </button>
            <button 
              :class="['dtab-btn', dossierFilter === 'part2' ? 'active' : '']" 
              @click="dossierFilter = 'part2'"
            >
              🎲 Partie 2 : Projet Jeu (100 pts)
            </button>
            <button 
              :class="['dtab-btn', dossierFilter === 'submitted_only' ? 'active' : '']" 
              @click="dossierFilter = 'submitted_only'"
            >
              📥 Travaux déposés uniquement ({{ currentDossier.items.filter(i => i.completed).length }})
            </button>
          </div>

          <!-- CORPS DÉFILANT DU DOSSIER -->
          <div class="dossier-modal-body">
            <div class="dossier-items-list">
              <div 
                v-for="item in filteredDossierItems" 
                :key="item.id" 
                :class="['dossier-item-card', item.completed ? 'item-done' : 'item-pending']"
              >
                <!-- EN-TÊTE DE L'ITEM (TITRE, PONDÉRATION, DÉLAI) -->
                <div class="dic-header">
                  <div class="dic-header-left">
                    <span :class="['dic-part-badge', item.part === 1 ? 'badge-p1' : 'badge-p2']">
                      Partie {{ item.part }}
                    </span>
                    <h4 class="dic-title">{{ item.title }}</h4>
                  </div>
                  <div class="dic-header-right">
                    <span v-if="item.maxPoints > 0" class="dic-weight-pill">
                      Pondération : <strong>{{ item.maxPoints }} pts</strong>
                    </span>
                    <span v-else class="dic-weight-pill step">
                      Étape de suivi
                    </span>
                    <span :class="['dic-status-tag', item.completed ? 'tag-done' : 'tag-pending']">
                      {{ item.completed ? '✓ Déposé' : '⏳ En attente' }}
                    </span>
                    <span v-if="item.deadline" class="dic-deadline-tag" :title="item.deadlineLabel">
                      📅 {{ item.deadlineLabel }}
                    </span>
                  </div>
                </div>

                <!-- CONTENU DE L'ITEM -->
                <div class="dic-body">
                  <!-- CAS 1 : QUIZ DIAGNOSTIQUE -->
                  <div v-if="item.id === 'quiz'" class="dic-quiz-section">
                    <div class="quiz-summary-box">
                      <div class="qsb-header">
                        <div class="qsb-score">
                          Note obtenue au quiz : <strong>{{ item.aiScore }} / 20 pts</strong>
                          <span class="qsb-count">({{ (item.quizAttempts || []).length }} tentative(s) enregistrée(s))</span>
                        </div>
                        <button 
                          v-if="(item.quizAttempts || []).length > 0" 
                          @click="toggleQuizExpand('quiz')" 
                          class="btn-toggle-quiz-details"
                        >
                          {{ expandedQuizAnswers['quiz'] ? '▲ Masquer le détail des réponses' : '▼ Voir les réponses de l\'étudiant aux questions' }}
                        </button>
                      </div>

                      <!-- DÉTAIL DES QUESTIONS / RÉPONSES DU QUIZ -->
                      <div v-if="expandedQuizAnswers['quiz'] && (item.quizAttempts || []).length > 0" class="quiz-answers-detail">
                        <div v-for="(att, aIdx) in (item.quizAttempts || [])" :key="att?.id || aIdx" class="quiz-attempt-card">
                          <div class="qac-head">
                            <strong>Tentative du {{ att?.submittedAt || 'En ligne' }}</strong> • Score : {{ att?.score ?? 0 }} / {{ att?.totalPoints ?? 20 }} ({{ att?.percentage ?? 0 }}%)
                          </div>
                          <div class="qac-questions">
                            <div v-for="(ans, qIdx) in (att?.answers || [])" :key="ans?.questionId || qIdx" class="qac-question-row">
                              <div class="qq-title">
                                <span class="qq-num">Q{{ qIdx + 1 }}.</span> {{ ans?.questionText }}
                              </div>
                              <div class="qq-user-ans">
                                <strong>Réponse de l'étudiant :</strong> 
                                <span>{{ ans?.userAnswer }}</span>
                                <span :class="['qq-badge', ans?.isCorrect ? 'correct' : 'partial']">
                                  {{ ans?.points ?? 0 }} / {{ ans?.maxPoints ?? 1 }} pts
                                </span>
                              </div>
                              <div v-if="ans?.explanation || ans?.openFeedback" class="qq-feedback">
                                💡 <em>{{ ans?.explanation || ans?.openFeedback }}</em>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- CAS 2 : EXERCICES 1 À 16 & PROJET JEU -->
                  <div v-else class="dic-work-section">
                    <!-- 1. TRAVAIL DÉPOSÉ (TEXTE OU FICHIER) -->
                    <div class="dic-student-work-box">
                      <div class="dsw-title-bar">
                        <span class="dsw-title">📝 Travail remis par l'étudiant :</span>
                        <span v-if="item.file" class="dsw-date">Déposé le {{ item.file.submittedAt }}</span>
                      </div>

                      <!-- A. TEXTE RÉDIGÉ EN LIGNE (SI EXISTANT) -->
                      <div v-if="item.submission && (item.submission.answer || item.submission.content)" class="dsw-text-block">
                        <div class="dsw-text-header">
                          <span class="dsw-text-badge">💬 Réponse rédigée en ligne</span>
                          <button @click="toggleTextExpand(item.id)" class="btn-text-expand">
                            {{ expandedTexts[item.id] ? 'Réduire ▲' : 'Agrandir ▼' }}
                          </button>
                        </div>
                        <div :class="['dsw-text-content', expandedTexts[item.id] ? 'expanded' : 'collapsed']">
                          {{ item.submission.answer || item.submission.content }}
                        </div>
                      </div>

                      <!-- B. FICHIER JOINT WORD OU PDF (SI EXISTANT) -->
                      <div v-if="item.file" class="dsw-file-block">
                        <div class="dfb-file-card">
                          <div class="dfb-left">
                            <span class="dfb-icon">
                              {{ (item.file.fileType && item.file.fileType.includes('pdf')) || (item.file.formattedFileName || '').endsWith('.pdf') ? '📄' : '📝' }}
                            </span>
                            <div class="dfb-info">
                              <span class="dfb-name">{{ item.file.formattedFileName || item.file.originalFileName }}</span>
                              <span class="dfb-size">{{ formatSize(item.file.fileSize) }} • {{ item.file.submittedAt }}</span>
                            </div>
                          </div>
                          <div class="dfb-actions">
                            <button 
                              @click="toggleDocumentPreview(item.file)" 
                              :class="['btn-preview-doc', activeDocPreview?.fileId === item.file.id ? 'active' : '']"
                              title="Afficher le document directement dans la page pour lecture"
                            >
                              {{ activeDocPreview?.fileId === item.file.id ? '✕ Fermer la lecture' : '📖 Lire le document (Word / PDF)' }}
                            </button>
                            <button 
                              @click="downloadFile(item.file)" 
                              class="btn-download-doc" 
                              title="Télécharger le fichier original"
                            >
                              📥 Télécharger
                            </button>
                          </div>
                        </div>

                        <!-- VISUALISEUR INTÉGRÉ WORD / PDF (LECTURE CONFORTABLE DIRECTE) -->
                        <div v-if="activeDocPreview?.fileId === item.file.id" class="inline-doc-viewer-container">
                          <div class="idv-header">
                            <span class="idv-title">
                              Lecteur Intégré : <strong>{{ activeDocPreview.fileName }}</strong>
                              <span class="idv-tag">{{ activeDocPreview.type.toUpperCase() }}</span>
                            </span>
                            <button class="idv-close" @click="activeDocPreview = null" title="Fermer l'aperçu">✕</button>
                          </div>

                          <!-- Chargement Word Mammoth -->
                          <div v-if="activeDocPreview.loading" class="idv-loading">
                            <span class="idv-spinner">⏳</span> Mise en page du document Word en cours...
                          </div>

                          <!-- Message d'erreur -->
                          <div v-else-if="activeDocPreview.error" class="idv-error">
                            ⚠️ {{ activeDocPreview.error }}
                            <div style="margin-top: 0.5rem;">
                              <button @click="downloadFile(item.file)" class="btn-download-doc">
                                📥 Télécharger le fichier
                              </button>
                            </div>
                          </div>

                          <!-- Aperçu PDF natif via iframe -->
                          <div v-else-if="activeDocPreview.type === 'pdf'" class="idv-pdf-box">
                            <iframe 
                              :src="activeDocPreview.dataUrl" 
                              class="dossier-pdf-frame" 
                              title="Lecteur PDF intégré"
                            ></iframe>
                          </div>

                          <!-- Aperçu Word converti en HTML via Mammoth -->
                          <div v-else-if="activeDocPreview.type === 'docx'" class="idv-docx-box">
                            <div class="docx-paper-sheet" v-html="activeDocPreview.htmlContent"></div>
                          </div>

                          <!-- Autre type de fichier -->
                          <div v-else class="idv-fallback">
                            Ce format ne peut être affiché directement. Veuillez le télécharger pour le consulter sur votre machine.
                          </div>
                        </div>
                      </div>

                      <!-- C. AUCUN TRAVAIL DÉPOSÉ -->
                      <div v-if="!item.file && (!item.submission || (!item.submission.answer && !item.submission.content))" class="dsw-empty">
                        <span>ℹ️ Aucun document déposé ni texte rédigé pour le moment.</span>
                      </div>
                    </div>

                    <!-- 2. FEEDBACK INSCRIT PAR L'IA -->
                    <div class="dic-ai-feedback-box">
                      <div class="dafb-header">
                        <div class="dafb-left">
                          <span class="dafb-icon">🤖</span>
                          <span class="dafb-title">Feedback IA Inscrit</span>
                          <span class="dafb-model">
                            {{ item.file?.aiCorrection?.modelUsed || 'Assistant Pédagogique FMTTN' }}
                          </span>
                        </div>
                        <div class="dafb-score-tag">
                          Note suggérée : <strong>{{ item.file?.aiCorrection?.suggestedScore ?? item.aiScore ?? 8.5 }} / 10 pts</strong>
                        </div>
                      </div>

                      <!-- Synthèse IA -->
                      <div class="dafb-summary">
                        <strong>Synthèse générale :</strong>
                        <p>« {{ item.file?.aiCorrection?.summary || item.aiSummary || 'Travail conforme aux exigences didactiques du cours.' }} »</p>
                      </div>

                      <!-- Points forts et pistes d'amélioration -->
                      <div v-if="item.file?.aiCorrection" class="dafb-points-grid">
                        <div v-if="item.file.aiCorrection.strengths?.length" class="dafb-col strengths">
                          <h6>✅ Points forts identifiés :</h6>
                          <ul>
                            <li v-for="(str, sIdx) in item.file.aiCorrection.strengths" :key="'str-' + sIdx">
                              {{ str }}
                            </li>
                          </ul>
                        </div>
                        <div v-if="item.file.aiCorrection.improvements?.length" class="dafb-col improvements">
                          <h6>💡 Axes de progression :</h6>
                          <ul>
                            <li v-for="(imp, iIdx) in item.file.aiCorrection.improvements" :key="'imp-' + iIdx">
                              {{ imp }}
                            </li>
                          </ul>
                        </div>
                      </div>

                      <!-- Grille critériée détaillée de l'IA (si disponible) -->
                      <details v-if="item.file?.aiCorrection?.criteriaTable?.length" class="dafb-criteria-details">
                        <summary>📊 Voir la grille critériée détaillée de l'IA ({{ item.file.aiCorrection.criteriaTable.length }} critères)</summary>
                        <table class="dafb-criteria-table">
                          <thead>
                            <tr>
                              <th>Critère didactique</th>
                              <th style="width: 90px; text-align: center;">Note</th>
                              <th>Justification IA</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="c in item.file.aiCorrection.criteriaTable" :key="c.name">
                              <td><strong>{{ c.name }}</strong></td>
                              <td style="text-align: center;">
                                <span class="crit-score">{{ c.score }}</span> / {{ c.maxScore }}
                              </td>
                              <td class="crit-justif">{{ c.justification }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </details>
                    </div>

                    <!-- 3. ZONE DE NOTATION ET FEEDBACK ENSEIGNANT (ÉDITION DIRECTE) -->
                    <div class="dic-teacher-grade-box">
                      <div class="dtgb-header">
                        <span class="dtgb-title">👨‍🏫 Évaluation Enseignant pour cette activité :</span>
                        <button 
                          @click="adoptAiFeedbackInDossier(item)" 
                          class="btn-adopt-ai"
                          title="Reprendre directement la note et le feedback de l'IA dans votre évaluation"
                        >
                          ⚡ Reprendre la suggestion de l'IA
                        </button>
                      </div>

                      <div class="dtgb-input-row">
                        <div class="dtgb-score-input-group">
                          <label>Note officielle attribuée :</label>
                          <div class="score-input-wrap">
                            <input 
                              v-model.number="item.teacherScore" 
                              type="number" 
                              min="0" 
                              :max="item.maxPoints || 10" 
                              step="0.5" 
                              class="dossier-score-input"
                            />
                            <span class="score-denom">/ {{ item.maxPoints || 10 }} pts</span>
                          </div>
                        </div>

                        <div class="dtgb-comment-input-group">
                          <label>Votre commentaire formatif pour l'étudiant (visible dans son espace) :</label>
                          <textarea 
                            v-model="item.feedback" 
                            rows="2" 
                            class="dossier-feedback-textarea" 
                            placeholder="Rédigez votre retour personnalisé ou ajustez la proposition de l'IA..."
                          ></textarea>
                        </div>

                        <div class="dtgb-save-btn-group">
                          <button @click="saveDossierItemGrade(item)" class="btn-save-dossier-item" title="Enregistrer cette note et ce feedback">
                            💾 Enregistrer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- PIED DE MODAL DU DOSSIER -->
          <div class="dossier-modal-footer">
            <div class="dmf-left">
              <span v-if="saveGridStatus" class="save-status-toast">{{ saveGridStatus }}</span>
            </div>
            <div class="dmf-right">
              <button @click="closeStudentDossier" class="btn-close-dossier-footer">
                Fermer le dossier
              </button>
            </div>
          </div>
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

.pin-input-group {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.pin-input-group input {
  width: 100%;
  padding: 12px 42px 12px 16px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  font-size: 1rem;
  text-align: center;
  color: var(--vp-c-text-1);
  box-sizing: border-box;
}

.pin-input-group input:focus {
  border-color: var(--vp-c-brand-1);
  outline: none;
}

.btn-toggle-pin {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.75;
  transition: opacity 0.2s;
}

.btn-toggle-pin:hover {
  opacity: 1;
}

.admin-lockout-help {
  margin-top: 1rem;
  text-align: center;
}

.btn-clear-lockout {
  background: transparent;
  color: var(--vp-c-brand-1);
  border: 1px dashed var(--vp-c-brand-1);
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.btn-clear-lockout:hover {
  background: var(--vp-c-brand-soft);
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
  transition: opacity 0.2s;
}

.btn-unlock:hover {
  opacity: 0.9;
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

/* CLOUD SYNC BAR */
.cloud-sync-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--vp-c-bg);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  padding: 0.9rem 1.3rem;
  margin-bottom: 1.8rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.cloud-sync-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cloud-pulse-icon {
  font-size: 1.6rem;
}

.cloud-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--vp-c-text-1);
}

.cloud-subtitle {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.cloud-sync-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cloud-feedback-tag {
  font-size: 0.82rem;
  font-weight: 600;
  color: #16a34a;
}

.btn-sync-action {
  background: #2563eb;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-sync-action:hover {
  background: #1d4ed8;
}

.btn-sync-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  padding: 6px 6px;
  text-align: left;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.82rem;
}

.data-table th {
  background: var(--vp-c-bg-alt);
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.sortable-th {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease, color 0.2s ease;
  white-space: nowrap;
  padding: 6px 5px;
}

.th-email {
  width: 90px;
  max-width: 95px;
}

.sortable-th:hover {
  background-color: var(--vp-c-brand-soft, rgba(59, 130, 246, 0.12));
  color: var(--vp-c-brand-1, #2563eb);
}

.sortable-th.is-active-sort {
  color: var(--vp-c-brand-1, #2563eb);
  background-color: var(--vp-c-brand-soft, rgba(59, 130, 246, 0.08));
}

.th-content {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.sort-icon {
  font-size: 0.72rem;
  display: inline-block;
  opacity: 0.35;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.sortable-th:hover .sort-icon {
  opacity: 0.7;
}

.sortable-th.is-active-sort .sort-icon {
  opacity: 1;
  font-weight: 900;
  color: var(--vp-c-brand-1, #2563eb);
}

.row-archived {
  opacity: 0.65;
}

.status-badge {
  display: inline-block;
  font-size: 0.70rem;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 5px;
  white-space: nowrap;
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
  width: 90px;
  max-width: 95px;
  min-width: 65px;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.email-truncate {
  display: block;
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date-cell {
  white-space: nowrap;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}

.date-truncate {
  white-space: nowrap;
}

.email-subtext {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  font-family: inherit;
}

.table-progress {
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.table-progress-bar {
  width: 36px;
  height: 6px;
  background: var(--vp-c-divider);
  border-radius: 4px;
  overflow: hidden;
}

.table-progress-fill {
  height: 100%;
  background: #10b981;
}

.sub-count-badge {
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 5px;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
  font-size: 0.74rem;
  white-space: nowrap;
}

.table-grade-badge {
  white-space: nowrap;
  font-size: 0.78rem;
  cursor: pointer;
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
  gap: 3px;
  white-space: nowrap;
}

.btn-row-action {
  padding: 3px 5px;
  border-radius: 4px;
  font-size: 0.70rem;
  font-weight: 600;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  cursor: pointer;
  white-space: nowrap;
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

/* ENCART ÉVALUATION & COMMENTAIRE ENSEIGNANT SUR LES RÉPONSES */
.sub-eval-box {
  margin-top: 1rem;
  background: #f0fdf4;
  border: 1.5px solid #86efac;
  border-radius: 10px;
  padding: 1rem 1.2rem;
}

.seb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 0.8rem;
}

.seb-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #166534;
}

.seb-status-pill {
  font-size: 0.76rem;
  color: #15803d;
  background: #dcfce7;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 600;
}

.seb-form-grid {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.seb-score-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.seb-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #166534;
}

.seb-score-input {
  width: 70px;
  padding: 4px 8px;
  border: 1px solid #86efac;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
  font-weight: 700;
  color: #166534;
  text-align: center;
}

.seb-denom {
  font-size: 0.85rem;
  font-weight: 600;
  color: #15803d;
}

.seb-textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #86efac;
  border-radius: 8px;
  background: white;
  font-size: 0.88rem;
  line-height: 1.4;
  color: #14532d;
  box-sizing: border-box;
  font-family: inherit;
}

.seb-textarea:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

.seb-actions-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-top: 0.2rem;
}

.btn-save-sub-eval {
  background: #166534;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-save-sub-eval:hover {
  background: #14532d;
}

.seb-save-confirm {
  font-size: 0.85rem;
  font-weight: 600;
  color: #15803d;
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


.admin-login-msg {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
}

.msg-error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.msg-lockout {
  background: #fffbeb;
  color: #92400e;
  border: 1.5px solid #fcd34d;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* Evaluation 15-item Grid & Excel Export Styles */
.eval-toolbar-sub {
  margin: 0.3rem 0 0 0;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
}

.btn-export-excel-highlight {
  background: #15803d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(21, 128, 61, 0.25);
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-export-excel-highlight:hover {
  background: #166534;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(21, 128, 61, 0.35);
}

.eval-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}

.eval-kpi-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 1rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.highlight-moy {
  border-left: 4px solid #2563eb;
  background: #f0f7ff;
}

.highlight-pass {
  border-left: 4px solid #16a34a;
  background: #f0fdf4;
}

.highlight-high {
  border-left: 4px solid #eab308;
  background: #fefce8;
}

.highlight-low {
  border-left: 4px solid #dc2626;
  background: #fef2f2;
}

.ekpi-icon {
  font-size: 1.8rem;
}

.ekpi-val {
  font-size: 1.3rem;
  color: var(--vp-c-text-1);
}

.ekpi-val strong {
  font-size: 1.5rem;
}

.ekpi-label {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.grid-eval-card-container {
  background: var(--vp-c-bg);
  border: 1.5px solid var(--vp-c-brand-1);
  border-radius: 12px;
  padding: 1.4rem;
  margin: 1.5rem 0;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
}

.gec-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid var(--vp-c-divider);
  margin-bottom: 1.2rem;
}

.gec-selector-group {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.gec-selector-group label {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--vp-c-brand-1);
}

.student-eval-select {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1.5px solid var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
  font-size: 0.95rem;
  font-weight: 600;
  min-width: 320px;
  cursor: pointer;
}

.gec-actions-group {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.btn-bulk-adopt-ai {
  background: #e0e7ff;
  color: #3730a3;
  border: 1px solid #c7d2fe;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-bulk-adopt-ai:hover {
  background: #c7d2fe;
}

.btn-save-grid-main {
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save-grid-main:hover {
  background: var(--vp-c-brand-2);
}

.grid-save-feedback-banner {
  background: #dcfce7;
  color: #15803d;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid #86efac;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
}

.section-divider-row td {
  background: #e0f2fe !important;
  color: #0369a1 !important;
  font-size: 0.9rem;
  padding: 10px 14px !important;
  letter-spacing: 0.3px;
}

.part2-divider td {
  background: #fef3c7 !important;
  color: #92400e !important;
}

.detailed-15-table th {
  background: #f8fafc;
  color: #334155;
  font-weight: 700;
  font-size: 0.88rem;
}

.detailed-15-table td {
  vertical-align: middle;
  padding: 10px 12px;
}

.item-title-group {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}

.item-status-icon {
  font-size: 1.1rem;
}

.item-file-link {
  font-size: 0.78rem;
  color: #0284c7;
  margin-top: 2px;
}

.item-file-link.quiz-sub {
  color: #6366f1;
}

.item-file-link.missing {
  color: #9ca3af;
}

.max-badge {
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.82rem;
  color: #475569;
}

.ai-score-cell-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.ai-pill {
  background: #dbeafe;
  color: #1e40af;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
}

.ai-pill strong {
  font-size: 0.95rem;
}

.btn-adopt-mini {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-adopt-mini:hover {
  background: #bbf7d0;
}

.ai-pending-text {
  font-size: 0.78rem;
  color: #94a3b8;
}

.teacher-input-cell-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.teacher-score-input {
  width: 65px;
  padding: 6px 8px;
  text-align: center;
  font-size: 1rem;
  font-weight: 700;
  border: 1.5px solid var(--vp-c-brand-1);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.pts-denom {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.teacher-comment-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 0.85rem;
  background: var(--vp-c-bg-soft);
}

.subtotal-row td {
  padding: 12px 14px;
  border-top: 2px solid #cbd5e1;
  border-bottom: 2px solid #cbd5e1;
}

.p1-subtotal {
  background: #f0f9ff;
}

.p2-subtotal {
  background: #fffbeb;
}

.subtotal-badge {
  font-size: 1.05rem;
  color: var(--vp-c-brand-1);
}

.grid-recap-footer {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--vp-c-divider);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.grf-scores-box {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.grf-score-item {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
}

.grf-score-item.total-200 {
  background: #f1f5f9;
  border: 1.5px solid #cbd5e1;
}

.grf-score-item.final-20 {
  background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%);
  border: 2px solid #16a34a;
  grid-column: span 2;
  align-items: center;
  padding: 1.2rem;
  box-shadow: 0 4px 14px rgba(22, 163, 74, 0.15);
}

.grf-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
  letter-spacing: 0.5px;
}

.grf-val {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-top: 4px;
}

.grf-val-huge {
  font-size: 2.3rem;
  font-weight: 800;
  color: #166534;
  margin: 4px 0;
}

.grf-mention-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
}

.mention-pgd { background: #fef08a; color: #854d0e; }
.mention-gd { background: #dcfce7; color: #166534; }
.mention-d { background: #dbeafe; color: #1e40af; }
.mention-sat { background: #e0e7ff; color: #3730a3; }
.mention-fail { background: #fee2e2; color: #991b1b; }

.grf-feedback-box {
  display: flex;
  flex-direction: column;
}

.grf-feedback-box label {
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 0.4rem;
}

.grf-textarea {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 0.9rem;
  resize: vertical;
  flex-grow: 1;
}

.grf-btn-row {
  margin-top: 0.8rem;
  text-align: right;
}

.btn-save-grid-large {
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.btn-save-grid-large:hover {
  background: var(--vp-c-brand-2);
}

.class-summary-section {
  margin-top: 2rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.2rem;
}

.css-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.css-header h4 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.css-count {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.grade-20-cell-highlight {
  background: #e0f2fe;
  font-weight: 800;
  font-size: 1.05rem;
  color: #0369a1;
}

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
  max-width: 980px;
  width: 95vw;
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

/* ACCORDÉON EXERCICES DANS LA MODAL D'ÉVALUATION */
.modal-exercises-accordion {
  margin-bottom: 1.5rem;
  border: 1.5px solid var(--vp-c-brand-1);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}

.mea-summary {
  padding: 0.9rem 1.2rem;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--vp-c-bg-alt);
  user-select: none;
}

.mea-badge {
  font-size: 0.75rem;
  background: var(--vp-c-brand-1);
  color: white;
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 600;
}

.mea-body {
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.mea-exercise-row-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 1rem 1.2rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.mea-columns-grid {
  display: grid;
  grid-template-columns: 2fr 1.3fr 1.3fr;
  gap: 1.2rem;
  align-items: start;
  margin-bottom: 0.8rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

@media (max-width: 768px) {
  .mea-columns-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
}

.mea-col-title {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.mea-title-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mea-exercise-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.mea-file-indicator {
  font-size: 0.78rem;
  color: #16a34a;
}

.mea-file-indicator code {
  font-size: 0.75rem;
  background: rgba(34, 197, 94, 0.1);
  padding: 1px 5px;
  border-radius: 4px;
}

.mea-file-pending {
  font-size: 0.76rem;
  color: var(--vp-c-text-3);
  font-style: italic;
}

.mea-col-ai, .mea-col-teacher {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.mea-col-header-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}

.mea-ai-score-box {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.mea-ai-score-val {
  background: #f0fdf4;
  border: 1px solid #86efac;
  color: #166534;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.88rem;
}

.btn-adopt-ai-modal {
  background: #fef08a;
  color: #854d0e;
  border: 1px solid #facc15;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-adopt-ai-modal:hover {
  background: #fde047;
}

.mea-ai-none-tag {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  padding: 3px 8px;
  border-radius: 6px;
  font-style: italic;
}

.mea-ai-summary-snippet {
  font-size: 0.76rem;
  color: #15803d;
  font-style: italic;
  line-height: 1.3;
}

.mea-teacher-input-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.mea-score-input {
  width: 70px !important;
  padding: 5px 8px !important;
  font-size: 0.95rem !important;
  font-weight: 800 !important;
  text-align: center;
  border: 1.5px solid var(--vp-c-brand-1) !important;
  border-radius: 6px !important;
  color: var(--vp-c-brand-1) !important;
  background: var(--vp-c-bg) !important;
}

.mea-denom-tag {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

/* ESPACE COMMENTAIRE PRENANT TOUTE LA LIGNE */
.mea-comment-fullwidth {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.mea-comment-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}

.mea-textarea-fullwidth {
  width: 100% !important;
  min-height: 80px;
  padding: 10px 12px !important;
  font-size: 0.9rem !important;
  line-height: 1.5;
  border-radius: 8px !important;
  border: 1px solid var(--vp-c-divider) !important;
  background: var(--vp-c-bg-alt) !important;
  color: var(--vp-c-text-1) !important;
  box-sizing: border-box;
  font-family: inherit;
  resize: vertical;
}

.mea-textarea-fullwidth:focus {
  border-color: var(--vp-c-brand-1) !important;
  background: var(--vp-c-bg) !important;
  outline: none;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.fullwidth-eval-comment-group {
  width: 100%;
}

.fullwidth-comment-textarea {
  width: 100% !important;
  min-height: 95px;
  padding: 10px 12px !important;
  font-size: 0.92rem !important;
  line-height: 1.5;
  border-radius: 8px !important;
  border: 1px solid var(--vp-c-divider) !important;
  background: var(--vp-c-bg-alt) !important;
  color: var(--vp-c-text-1) !important;
  box-sizing: border-box;
  font-family: inherit;
  resize: vertical;
}

.fullwidth-comment-textarea:focus {
  border-color: #ea580c !important;
  outline: none;
}

/* COMMENTAIRES EN PLEINE LARGEUR DANS LE TABLEAU DES FICHIERS */
.file-comment-full-row td {
  background: var(--vp-c-bg-soft) !important;
  padding: 0.8rem 1.2rem 1.2rem 1.2rem !important;
  border-bottom: 2px solid var(--vp-c-divider) !important;
}

.file-comment-fullwidth-box {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
}

.fcf-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.fcf-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #166534;
}

.fcf-actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.btn-save-comment-inline {
  background: #166534;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-save-comment-inline:hover {
  background: #14532d;
}

.input-teacher-feedback-fullwidth {
  width: 100% !important;
  min-height: 75px;
  padding: 10px 12px !important;
  font-size: 0.9rem !important;
  line-height: 1.5;
  border-radius: 8px !important;
  border: 1px solid #86efac !important;
  background: white !important;
  color: #14532d !important;
  box-sizing: border-box;
  font-family: inherit;
  resize: vertical;
}

.input-teacher-feedback-fullwidth:focus {
  outline: none;
  border-color: #22c55e !important;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
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

/* ============================================================ */
/* STYLES DU SIGNAL ALARME IA RETARD (CLOCHE ROUGE & NOM ROUGE) */
/* ============================================================ */

@keyframes bellRing {
  0%, 100% { transform: rotate(0deg); }
  10%, 30% { transform: rotate(-14deg); }
  20%, 40% { transform: rotate(14deg); }
  50% { transform: rotate(0deg); }
}

.alarm-bell {
  display: inline-block;
  font-size: 1.05rem;
  animation: bellRing 2.2s infinite ease-in-out;
  transform-origin: top center;
  filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.5));
  user-select: none;
  margin-right: 4px;
  vertical-align: middle;
}

.alarm-bell-large {
  display: inline-block;
  font-size: 2.2rem;
  animation: bellRing 1.8s infinite ease-in-out;
  transform-origin: top center;
  filter: drop-shadow(0 2px 8px rgba(239, 68, 68, 0.6));
  user-select: none;
}

.is-late,
.is-late strong,
strong.is-late,
span.is-late {
  color: #dc2626 !important;
  font-weight: 700 !important;
}

.late-badge-pill {
  display: inline-flex;
  align-items: center;
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.2;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.15);
  white-space: nowrap;
}

.alarm-student-banner {
  display: flex;
  align-items: flex-start;
  gap: 1.2rem;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 2px solid #ef4444;
  border-radius: 12px;
  padding: 1.1rem 1.3rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.15);
}

.asb-icon-wrap {
  flex-shrink: 0;
  padding-top: 2px;
}

.asb-content {
  flex: 1;
}

.asb-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #991b1b;
  margin-bottom: 0.35rem;
}

.asb-desc {
  font-size: 0.88rem;
  color: #7f1d1d;
  line-height: 1.5;
  margin-bottom: 0.6rem;
}

.asb-badges-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.asb-item-badge {
  display: inline-flex;
  align-items: center;
  background: #ffffff;
  color: #b91c1c;
  border: 1px solid #f87171;
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.row-late-alert {
  background-color: rgba(254, 242, 242, 0.65) !important;
}

.row-late-alert:hover {
  background-color: rgba(254, 226, 226, 0.85) !important;
}

.grid-item-row.row-overdue {
  background: rgba(254, 242, 242, 0.45);
  border-left: 3px solid #ef4444;
}

.item-file-link.overdue {
  color: #b91c1c !important;
  font-weight: 700;
  font-size: 0.82rem;
}

.tab-late-badge {
  display: inline-flex;
  align-items: center;
  background: #ef4444;
  color: white;
  padding: 1px 6px;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 800;
  margin-left: 6px;
  box-shadow: 0 2px 5px rgba(239, 68, 68, 0.4);
}

.kpi-card.kpi-card-alarm {
  border-color: rgba(239, 68, 68, 0.4);
  background: linear-gradient(135deg, rgba(254, 242, 242, 0.8) 0%, rgba(254, 226, 226, 0.3) 100%);
}

.kpi-card.kpi-card-alarm.active-alert {
  border-color: #ef4444;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.2);
}

.kpi-card.kpi-card-alarm .kpi-val {
  color: #dc2626;
}

.student-name-container {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.opt-late {
  color: #dc2626;
  font-weight: 700;
}

/* FILTRES ALARME STATUTS */
.pill-btn.alert-pill-orange {
  border-color: #fdba74;
  background: #fff7ed;
  color: #c2410c;
  font-weight: 700;
}
.pill-btn.alert-pill-orange.active {
  background: #ea580c;
  color: white;
}

.pill-btn.alert-pill-bordeaux {
  border-color: #fecdd3;
  background: #fff1f2;
  color: #881337;
  font-weight: 700;
}
.pill-btn.alert-pill-bordeaux.active {
  background: #881337;
  color: white;
}

.pill-btn.alert-pill-red {
  border-color: #fca5a5;
  background: #fef2f2;
  color: #dc2626;
  font-weight: 700;
}
.pill-btn.alert-pill-red.active {
  background: #dc2626;
  color: white;
}

/* COULEURS DE CLOCHES D'ALARME */
.alarm-bell.alarm-orange {
  color: #ea580c !important;
  filter: drop-shadow(0 0 4px rgba(234, 88, 12, 0.6));
}
.alarm-bell.alarm-bordeaux {
  color: #881337 !important;
  filter: drop-shadow(0 0 4px rgba(136, 19, 55, 0.7));
}
.alarm-bell.alarm-red {
  color: #dc2626 !important;
  filter: drop-shadow(0 0 5px rgba(220, 38, 38, 0.8));
}

/* ============================================================ */
/* STYLES DE L'ONGLET CALENDRIER DES ÉCHÉANCES                  */
/* ============================================================ */

.admin-tab-btn.deadlines-tab-highlight {
  border-bottom-color: #0284c7;
  color: #0284c7;
  font-weight: 700;
}
.admin-tab-btn.deadlines-tab-highlight.active {
  background: rgba(2, 132, 199, 0.08);
}

.deadlines-admin-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  background: var(--vp-c-bg-soft);
  padding: 1.2rem 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
}

.dat-title-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.dat-icon {
  font-size: 2rem;
  line-height: 1;
}

.dat-title-row h3 {
  margin: 0 0 0.35rem 0;
  font-size: 1.25rem;
  font-weight: 800;
}

.deadlines-toolbar-sub {
  margin: 0;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  max-width: 750px;
}

.dat-right-actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.btn-save-all-deadlines {
  background: #0284c7;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(2, 132, 199, 0.25);
  transition: all 0.2s ease;
}
.btn-save-all-deadlines:hover {
  background: #0369a1;
  transform: translateY(-1px);
}

.btn-reset-deadlines-subtle {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-reset-deadlines-subtle:hover {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
}

.save-all-deadlines-banner {
  background: #ecfdf5;
  border: 2px solid #10b981;
  color: #065f46;
  font-weight: 700;
  padding: 1rem 1.2rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
}

.deadlines-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.dkpi-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
}
.dkpi-icon { font-size: 1.8rem; }
.dkpi-val { font-size: 1.4rem; font-weight: 800; color: var(--vp-c-text-1); line-height: 1; }
.dkpi-lbl { font-size: 0.78rem; color: var(--vp-c-text-2); margin-top: 4px; }

.dkpi-card.green .dkpi-val { color: #059669; }
.dkpi-card.orange.active {
  background: #fff7ed;
  border-color: #fdba74;
}
.dkpi-card.orange.active .dkpi-val { color: #ea580c; }

.dkpi-card.bordeaux.active {
  background: #fff1f2;
  border-color: #fecdd3;
}
.dkpi-card.bordeaux.active .dkpi-val { color: #881337; }

.dkpi-card.red.active {
  background: #fef2f2;
  border-color: #fca5a5;
}
.dkpi-card.red.active .dkpi-val { color: #dc2626; }

.deadlines-alarm-legend {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  background: var(--vp-c-bg-alt);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  margin-bottom: 1.5rem;
  font-size: 0.8rem;
}
.dal-title { font-weight: 800; color: var(--vp-c-text-1); }
.dal-pill {
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.75rem;
}
.dal-pill.ok { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
.dal-pill.recent { background: #fefce8; color: #854d0e; border: 1px solid #fef08a; }
.dal-pill.orange { background: #fff7ed; color: #c2410c; border: 1px solid #fdba74; }
.dal-pill.bordeaux { background: #fff1f2; color: #881337; border: 1px solid #fecdd3; }
.dal-pill.red { background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; }

/* TABLEAU DES ÉCHÉANCES */
.deadlines-table-wrap {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
}

.deadlines-table {
  width: 100%;
  border-collapse: collapse;
}

.deadlines-table td {
  vertical-align: middle;
  padding: 12px 14px;
}

.section-divider-row td {
  background: var(--vp-c-bg-mute);
  padding: 10px 14px;
}

.sec-div-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sec-div-badge {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
}

.custom-badge {
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 700;
}

.deadline-input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.deadline-picker-composite {
  display: flex;
  gap: 6px;
  align-items: center;
}

.input-date-clean {
  padding: 6px 8px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 0.85rem;
  font-family: inherit;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  box-sizing: border-box;
  min-width: 135px;
}
.input-date-clean:focus {
  border-color: #0284c7;
  outline: none;
}

.input-time-clean {
  width: 80px;
  padding: 6px 6px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 0.85rem;
  font-family: inherit;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  box-sizing: border-box;
}
.input-time-clean:focus {
  border-color: #0284c7;
  outline: none;
}

.input-datetime {
  padding: 6px 10px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 0.88rem;
  font-family: inherit;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  box-sizing: border-box;
}
.input-datetime:focus {
  border-color: #0284c7;
  outline: none;
}

.deadline-current-label {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
}

.deadline-state-cell {
  display: flex;
  align-items: center;
}

.dstate-pill {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 700;
  white-space: nowrap;
}
.dstate-pill.empty { background: var(--vp-c-bg-mute); color: var(--vp-c-text-3); }
.dstate-pill.upcoming { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
.dstate-pill.overdue { background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; }

.class-submissions-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cs-ratio { font-size: 0.84rem; color: var(--vp-c-text-1); }

.cs-alarms-strip {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.mini-alarm-badge {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 4px;
}
.mini-alarm-badge.orange { background: #fff7ed; color: #ea580c; border: 1px solid #fdba74; }
.mini-alarm-badge.bordeaux { background: #fff1f2; color: #881337; border: 1px solid #fecdd3; }
.mini-alarm-badge.red { background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; }
.mini-alarm-badge.recent { background: #fefce8; color: #ca8a04; border: 1px solid #fef08a; }

.text-success-mini { font-size: 0.75rem; color: #059669; font-weight: 600; }

.deadline-row-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.btn-shortcuts-group {
  display: flex;
  gap: 4px;
}

.btn-sc {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  padding: 3px 7px;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-sc:hover { background: var(--vp-c-bg-mute); color: var(--vp-c-text-1); }
.btn-sc.clear { color: #dc2626; }

.save-indicator-col {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-save-single-dl {
  background: #0284c7;
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}
.btn-save-single-dl:hover { background: #0369a1; }

.df-msg {
  font-size: 0.74rem;
  color: #059669;
  font-weight: 700;
}

/* =========================================================================
   STYLES DU DOSSIER COMPLET ÉTUDIANT & VISUALISEUR WORD / PDF
   ========================================================================= */

.btn-row-action.dossier-btn {
  background: #f0fdf4 !important;
  color: #166534 !important;
  border: 1px solid #bbf7d0 !important;
  font-weight: 700;
}
.btn-row-action.dossier-btn:hover {
  background: #dcfce7 !important;
  color: #14532d !important;
  border-color: #86efac !important;
}

.student-name-text:hover strong {
  text-decoration: underline;
  color: #2563eb;
}

.dossier-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 99999;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(8px);
  padding: 0;
  margin: 0;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  overflow: hidden;
}

.dossier-modal-card {
  width: 100vw;
  max-width: 100vw;
  height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
  border: none;
}

.dossier-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 2rem;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  gap: 1.5rem;
  flex-shrink: 0;
}

.dmh-title-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.dmh-icon {
  font-size: 2rem;
}

.dmh-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
}

.dmh-student-name {
  color: #2563eb;
}

.dmh-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.2rem;
}

.dmh-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.student-nav-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.btn-student-nav {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-student-nav:hover {
  background: #f8fafc;
  color: #0f172a;
  border-color: #94a3b8;
}

.student-select-dropdown {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f172a;
  outline: none;
  max-width: 280px;
}

.btn-close-dossier {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #dc2626;
  font-size: 0.88rem;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  transition: all 0.15s ease;
}
.btn-close-dossier .close-icon {
  font-size: 1rem;
  font-weight: 900;
}
.btn-close-dossier:hover {
  background: #dc2626;
  color: #ffffff;
  border-color: #b91c1c;
}

/* BANDEAU KPI */
.dossier-kpi-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.8rem;
  padding: 0.8rem 2rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.dkpi-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.6rem 0.9rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.dkpi-card.score-main {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.dkpi-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.04em;
}

.dkpi-num {
  font-size: 1.35rem;
  font-weight: 900;
  color: #166534;
}
.dkpi-num .denom {
  font-size: 0.95rem;
  color: #64748b;
}
.dkpi-num small {
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 600;
  margin-left: 4px;
}

.mention-badge-pill {
  display: inline-block;
  font-weight: 800;
  font-size: 0.85rem;
  padding: 3px 8px;
  border-radius: 6px;
  width: fit-content;
  margin-top: 3px;
}
.mention-pass { background: #dcfce7; color: #15803d; }
.mention-ajourne { background: #fee2e2; color: #b91c1c; }

.dkpi-stat {
  font-size: 1.15rem;
  color: #334155;
  font-weight: 600;
}

.late-pill {
  font-size: 0.82rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  width: fit-content;
  margin-top: 3px;
}
.pill-ok { background: #ecfdf5; color: #047857; }
.pill-alert { background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; }

/* FILTRES DU DOSSIER */
.dossier-filter-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 0.65rem 2rem;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
  flex-shrink: 0;
}

.dtab-btn {
  background: transparent;
  border: 1px solid transparent;
  color: #475569;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}
.dtab-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}
.dtab-btn.active {
  background: #2563eb;
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

/* CORPS DU DOSSIER */
.dossier-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
  background: #f8fafc;
}

.dossier-items-list {
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.dossier-item-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  transition: border-color 0.2s ease;
}
.dossier-item-card.item-done {
  border-left: 5px solid #10b981;
}
.dossier-item-card.item-pending {
  border-left: 5px solid #cbd5e1;
}

.dic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1.2rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.dic-header-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.dic-part-badge {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 4px;
}
.badge-p1 { background: #dbeafe; color: #1e40af; }
.badge-p2 { background: #fef3c7; color: #92400e; }

.dic-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
}

.dic-header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.dic-weight-pill {
  font-size: 0.78rem;
  background: #e2e8f0;
  color: #334155;
  padding: 2px 8px;
  border-radius: 6px;
}
.dic-weight-pill.step {
  background: #f1f5f9;
  color: #64748b;
  font-style: italic;
}

.dic-status-tag {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}
.tag-done { background: #dcfce7; color: #166534; }
.tag-pending { background: #fef3c7; color: #92400e; }

.dic-deadline-tag {
  font-size: 0.75rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.dic-body {
  padding: 1.2rem;
}

/* SECTION TRAVAIL ÉTUDIANT */
.dic-student-work-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.dsw-title-bar {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 0.6rem;
}

.dsw-text-block {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.8rem;
  margin-bottom: 0.8rem;
}

.dsw-text-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.dsw-text-badge {
  font-size: 0.78rem;
  font-weight: 700;
  color: #0369a1;
  background: #e0f2fe;
  padding: 2px 8px;
  border-radius: 4px;
}

.btn-text-expand {
  background: transparent;
  border: none;
  color: #2563eb;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
}

.dsw-text-content {
  font-size: 0.92rem;
  line-height: 1.6;
  color: #1e293b;
  white-space: pre-wrap;
  font-family: inherit;
}
.dsw-text-content.collapsed {
  max-height: 100px;
  overflow: hidden;
  mask-image: linear-gradient(180deg, #000 60%, transparent);
}

.dfb-file-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border: 1px solid #bfdbfe;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  gap: 1rem;
  flex-wrap: wrap;
}

.dfb-left {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.dfb-icon {
  font-size: 1.8rem;
}

.dfb-name {
  display: block;
  font-weight: 700;
  font-size: 0.92rem;
  color: #1e3a8a;
  word-break: break-all;
}

.dfb-size {
  display: block;
  font-size: 0.76rem;
  color: #64748b;
}

.dfb-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-preview-doc {
  background: #2563eb;
  color: #ffffff;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
}
.btn-preview-doc:hover {
  background: #1d4ed8;
}
.btn-preview-doc.active {
  background: #dc2626;
}

.btn-download-doc {
  background: #ffffff;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-download-doc:hover {
  background: #f1f5f9;
}

/* VISUALISEUR INTÉGRÉ WORD / PDF */
.inline-doc-viewer-container {
  margin-top: 0.8rem;
  background: #ffffff;
  border: 2px solid #3b82f6;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.idv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
  background: #1e3a8a;
  color: #ffffff;
  font-size: 0.88rem;
}

.idv-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 800;
  margin-left: 6px;
}

.idv-close {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
}

.idv-loading {
  padding: 3rem 2rem;
  text-align: center;
  font-weight: 700;
  color: #1e3a8a;
  font-size: 1rem;
}

.idv-error {
  padding: 1.5rem;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 0.9rem;
}

.dossier-pdf-frame {
  width: 100%;
  height: 75vh;
  min-height: 600px;
  border: none;
  display: block;
}

.docx-paper-sheet {
  background: #ffffff;
  padding: 2.5rem 3.5rem;
  max-height: 75vh;
  min-height: 500px;
  overflow-y: auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.7;
  color: #1e293b;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.03);
}
.docx-paper-sheet h1, .docx-paper-sheet h2, .docx-paper-sheet h3 {
  color: #0f172a;
  margin-top: 1.2rem;
  margin-bottom: 0.6rem;
}
.docx-paper-sheet p {
  margin-bottom: 0.8rem;
}
.docx-paper-sheet table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}
.docx-paper-sheet th, .docx-paper-sheet td {
  border: 1px solid #cbd5e1;
  padding: 6px 10px;
}

.dsw-empty {
  font-size: 0.85rem;
  color: #64748b;
  font-style: italic;
  padding: 0.4rem 0;
}

/* SECTION FEEDBACK IA */
.dic-ai-feedback-box {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-left: 4px solid #6366f1;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.dafb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
}

.dafb-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dafb-title {
  font-weight: 800;
  font-size: 0.92rem;
  color: #312e81;
}

.dafb-model {
  font-size: 0.72rem;
  background: #e0e7ff;
  color: #4338ca;
  padding: 2px 7px;
  border-radius: 4px;
  font-weight: 600;
}

.dafb-score-tag {
  font-size: 0.85rem;
  color: #312e81;
}
.dafb-score-tag strong {
  font-size: 1rem;
  color: #4338ca;
}

.dafb-summary {
  font-size: 0.9rem;
  line-height: 1.5;
  color: #1e293b;
  background: #ffffff;
  padding: 0.7rem 0.9rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  margin-bottom: 0.8rem;
}

.dafb-points-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.8rem;
  margin-bottom: 0.8rem;
}

.dafb-col {
  background: #ffffff;
  border-radius: 6px;
  padding: 0.7rem 0.9rem;
  border: 1px solid #e2e8f0;
}
.dafb-col h6 {
  margin: 0 0 0.4rem 0;
  font-size: 0.8rem;
  font-weight: 800;
}
.dafb-col.strengths h6 { color: #166534; }
.dafb-col.improvements h6 { color: #9a3412; }
.dafb-col ul {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.82rem;
  line-height: 1.5;
  color: #334155;
}

.dafb-criteria-details summary {
  font-size: 0.82rem;
  font-weight: 700;
  color: #4338ca;
  cursor: pointer;
  padding: 0.3rem 0;
}

.dafb-criteria-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  margin-top: 0.5rem;
  background: #ffffff;
}
.dafb-criteria-table th, .dafb-criteria-table td {
  border: 1px solid #e2e8f0;
  padding: 6px 10px;
  text-align: left;
}
.dafb-criteria-table th {
  background: #f1f5f9;
  font-weight: 700;
}

/* SECTION NOTATION ENSEIGNANT */
.dic-teacher-grade-box {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 1rem;
}

.dtgb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
}

.dtgb-title {
  font-weight: 800;
  font-size: 0.9rem;
  color: #14532d;
}

.btn-adopt-ai {
  background: #ffffff;
  border: 1px solid #86efac;
  color: #15803d;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-adopt-ai:hover {
  background: #dcfce7;
}

.dtgb-input-row {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.dtgb-score-input-group label, .dtgb-comment-input-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #166534;
  margin-bottom: 0.3rem;
}

.score-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.dossier-score-input {
  width: 90px;
  padding: 6px 10px;
  font-size: 1.1rem;
  font-weight: 800;
  border: 2px solid #86efac;
  border-radius: 6px;
  text-align: center;
  outline: none;
  background: #ffffff;
}
.dossier-score-input:focus {
  border-color: #16a34a;
}

.score-denom {
  font-size: 0.9rem;
  font-weight: 700;
  color: #166534;
}

.dossier-feedback-textarea {
  width: 100%;
  padding: 8px 12px;
  font-size: 0.88rem;
  line-height: 1.5;
  border: 1px solid #86efac;
  border-radius: 6px;
  outline: none;
  font-family: inherit;
  background: #ffffff;
  resize: vertical;
}
.dossier-feedback-textarea:focus {
  border-color: #16a34a;
}

.dtgb-save-btn-group {
  display: flex;
  justify-content: flex-end;
}

.btn-save-dossier-item {
  background: #16a34a;
  color: #ffffff;
  border: none;
  padding: 7px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
}
.btn-save-dossier-item:hover {
  background: #15803d;
}

/* FOOTER DOSSIER */
.dossier-modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 2rem;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.save-status-toast {
  font-size: 0.85rem;
  font-weight: 700;
  color: #15803d;
}

.btn-close-dossier-footer {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}
.btn-close-dossier-footer:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* QUIZ DETAIL */
.quiz-summary-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
}
.qsb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.qsb-score {
  font-size: 1rem;
  color: #1e293b;
}
.qsb-count {
  font-size: 0.82rem;
  color: #64748b;
  margin-left: 6px;
}
.btn-toggle-quiz-details {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #2563eb;
  cursor: pointer;
}
.quiz-answers-detail {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.quiz-attempt-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.8rem;
}
.qac-head {
  font-size: 0.85rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.4rem;
  margin-bottom: 0.6rem;
}
.qac-questions {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.qac-question-row {
  font-size: 0.82rem;
  padding: 0.4rem;
  background: #f8fafc;
  border-radius: 6px;
}
.qq-title {
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.2rem;
}
.qq-user-ans {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #334155;
}
.qq-badge {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 4px;
}
.qq-badge.correct { background: #dcfce7; color: #166534; }
.qq-badge.partial { background: #fef3c7; color: #92400e; }
.qq-feedback {
  font-size: 0.76rem;
  color: #64748b;
  margin-top: 0.2rem;
}

</style>


