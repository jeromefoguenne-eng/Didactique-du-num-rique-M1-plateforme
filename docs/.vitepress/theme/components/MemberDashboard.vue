<script setup>
import { ref, computed } from 'vue'
import { userStore } from '../stores/userStore'
import { withBase } from 'vitepress'

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const registerPassword = ref('')
const loginEmail = ref('')
const loginPassword = ref('')
const activeTab = ref('progress') // 'progress' | 'exercises' | 'files' | 'quizzes'

// Gestion de l'authentification et mots de passe
const authViewMode = ref('login') // 'login' | 'first-login' | 'forgot-password' | 'reset-code'
const authPendingUser = ref(null)
const initialPassword = ref('')
const confirmInitialPassword = ref('')
const initialPassFeedback = ref('')

const forgotEmail = ref('')
const recoveryCode = ref('')
const newRecoveredPassword = ref('')
const confirmRecoveredPassword = ref('')
const recoverySimulatedCode = ref('')
const recoveryFeedback = ref('')

// Modal de changement de mot de passe en cours de session
const showChangePassModal = ref(false)
const oldPasswordCurrent = ref('')
const newPasswordCurrent = ref('')
const confirmPasswordCurrent = ref('')
const changePassFeedback = ref({ type: '', message: '' })

// Dépôt de fichiers
const selectedExerciseForUpload = ref('exercice-01')
const selectedFile = ref(null)
const uploadFeedback = ref({ type: '', message: '' })
const isUploading = ref(false)

// Dépôt de fichiers individualisé par exercice
const exerciseUploadFiles = ref({})
const exerciseUploadFeedbacks = ref({})
const exerciseUploading = ref({})

function getFileForExercise(exId) {
  return userFiles.value.find(f => f.exerciseId === exId)
}

function getTeacherFeedbackForExercise(exId) {
  return userStore.getExerciseFeedback(exId)
}

function onExerciseFileChange(event, exId) {
  if (!exerciseUploadFeedbacks.value) exerciseUploadFeedbacks.value = {}
  exerciseUploadFeedbacks.value[exId] = { type: '', message: '' }
  const file = event.target.files?.[0]
  if (file) {
    if (!exerciseUploadFiles.value) exerciseUploadFiles.value = {}
    exerciseUploadFiles.value[exId] = file
  }
}

function getExerciseFilePreview(exTitle, exId) {
  const file = exerciseUploadFiles.value?.[exId]
  if (!file) return ''
  return userStore.getFormattedNamePreview(exTitle, file.name)
}

async function handleExerciseFileUpload(exId, exTitle) {
  const file = exerciseUploadFiles.value?.[exId]
  if (!file) {
    if (!exerciseUploadFeedbacks.value) exerciseUploadFeedbacks.value = {}
    exerciseUploadFeedbacks.value[exId] = { type: 'error', message: 'Veuillez sélectionner un document Word (.docx) ou PDF (.pdf).' }
    return
  }

  if (!exerciseUploading.value) exerciseUploading.value = {}
  exerciseUploading.value[exId] = true
  exerciseUploadFeedbacks.value[exId] = { type: '', message: '' }

  try {
    const res = await userStore.uploadStudentFile(exId, exTitle, file)
    if (res.success) {
      exerciseUploadFeedbacks.value[exId] = { type: 'success', message: res.message }
      exerciseUploadFiles.value[exId] = null
      const inputEl = document.getElementById('file-input-' + exId)
      if (inputEl) inputEl.value = ''
    } else {
      exerciseUploadFeedbacks.value[exId] = { type: 'error', message: res.message }
    }
  } catch (err) {
    exerciseUploadFeedbacks.value[exId] = { type: 'error', message: 'Erreur lors du dépôt du document. Veuillez réessayer.' }
  } finally {
    exerciseUploading.value[exId] = false
  }
}

const courseModules = [
  { id: 'mod-1', title: '1. Compétences Numériques', link: '/modules/01-competences-numeriques' },
  { id: 'mod-2', title: '2. Référentiel FMTTN (FWB)', link: '/modules/02-referentiel-fmttn' },
  { id: 'mod-3', title: '3. Méthodologies pédagogiques', link: '/modules/03-pedagogies-actives' },
  { id: 'mod-4', title: '4. Préparer une Leçon FMTTN', link: '/modules/04-preparation-lecon-fmttn' },
  { id: 'mod-5', title: '5. Projet Jeu de société', link: '/modules/05-projet-jeu-societe' },
  { id: 'mod-6', title: '6. Guide & Évaluation', link: '/guide/distanciel' },
  { id: 'mod-7', title: '7. Ressources & Outils', link: '/ressources/documents' }
]

const availableExercises = [
  // 1. Travaux sur la Plateforme (Pilier 1 - 60 pts)
  { 
    id: 'exercice-01', 
    title: 'Exercice 1 : Diagnostic de compétences numériques (DigComp 2.2)',
    category: 'Plateforme',
    points: 10,
    docUrl: 'https://docs.google.com/document/d/1b1QhnOoDNyCSdAIEAZx_xq96hQxZsUJH/preview'
  },
  { 
    id: 'exercice-02', 
    title: 'Exercice 2 : Peut-on faire confiance à cette information ?',
    category: 'Plateforme',
    points: 10,
    docUrl: 'https://docs.google.com/document/d/1o9vsf5fptzG1EH56oycz7SkD_UwmUKXm/preview'
  },
  { 
    id: 'exercice-03', 
    title: 'Exercice 3 : Concevoir un guide numérique pour les élèves',
    category: 'Plateforme',
    points: 10,
    docUrl: 'https://docs.google.com/document/d/12XENuZM1WVyeCnRfu62Oh1_tG8Gkc1Z1/preview'
  },
  { 
    id: 'exercice-04', 
    title: 'Exercice 4 : Escape Game FMTTN (Cyber-Enquête)',
    category: 'Plateforme',
    points: 10,
    docUrl: 'https://docs.google.com/document/d/1kUSfjlioxrG-i-ZrVbzQOpxH072f_2db/preview'
  },
  { 
    id: 'exercice-05', 
    title: 'Exercice 5 : Défi 20 minutes (Affiche Canva mot de passe)',
    category: 'Plateforme',
    points: 10,
    docUrl: 'https://docs.google.com/document/d/1GuqhxxFNJllg4vR_wLeD5A4CtYNyJ4mj/preview'
  },
  { 
    id: 'exercice-06', 
    title: 'Exercice 6 : Défi Hardware (Démonter et remonter un PC)',
    category: 'Plateforme',
    points: 10,
    docUrl: 'https://docs.google.com/document/d/1Vjy9xrqLG-xuktmMmmOQ6Kh8I-hXiIzV/preview'
  },
  // 2. Projet Jeu de Société Didactique (Pilier 2 & 3 - 130 pts)
  { 
    id: 'exercice-09', 
    title: 'Exercice 9 : Règles du jeu & dossier pédagogique (FMTTN / CSEM)',
    category: 'Projet Jeu',
    points: 20,
    docUrl: 'https://docs.google.com/document/d/1af3aH5FiR31N4FB99VrFq6628kiFFbly/preview'
  },
  { 
    id: 'exercice-10', 
    title: 'Exercice 10 : Photographier le numérique (visuels & matériel)',
    category: 'Projet Jeu',
    points: 15,
    docUrl: 'https://docs.google.com/document/d/1kSoMRpjySi0DvjA0S1W4b8BoaDQrXNZh/preview'
  },
  { 
    id: 'exercice-11', 
    title: 'Exercice 11 : Supports du jeu & cartes créées avec l\'IA',
    category: 'Projet Jeu',
    points: 15,
    docUrl: 'https://docs.google.com/document/d/1CzyMJRbjyvYVh7XP83Lx4tjxnq23oHXX/preview'
  },
  { 
    id: 'exercice-12', 
    title: 'Exercice 12 : Plateau de jeu à la découpeuse laser (FabLab)',
    category: 'Projet Jeu',
    points: 15,
    docUrl: 'https://docs.google.com/document/d/1Ov_huVW9al2DKuoBmW89QO3ZqE5E-nzU/preview'
  },
  { 
    id: 'exercice-13', 
    title: 'Exercice 13 : Réalisation des pions à l\'imprimante 3D (FabLab)',
    category: 'Projet Jeu',
    points: 15,
    docUrl: 'https://docs.google.com/document/d/1H_88UJvPPezdUXw1Vt8_U9wtsaFouepU/preview'
  },
  { 
    id: 'exercice-14', 
    title: 'Exercice 14 : Présentation vidéo du jeu (Capsule 2-3 min)',
    category: 'Projet Jeu',
    points: 20,
    docUrl: 'https://docs.google.com/document/d/1JO_9ayYt3IqZfStfUPkzT3GDOF65VBxQ/preview'
  },
  { 
    id: 'exercice-15', 
    title: 'Exercice 15 : Playtest & Grille d\'évaluation formative du jeu',
    category: 'Projet Jeu',
    points: 15,
    docUrl: 'https://docs.google.com/document/d/1uIheBr_KU2Dh2TjYkegz7lHixsUNxs4t/preview'
  },
  { 
    id: 'exercice-16', 
    title: 'Exercice 16 : Présentation finale et leçon FMTTN devant la classe',
    category: 'Projet Jeu',
    points: 15,
    docUrl: 'https://docs.google.com/document/d/1Tm15GqKSwutH1MDbaGYJaWByliC17iRT/preview'
  }
]

const currentUser = computed(() => userStore.currentUser)
const progressPercent = computed(() => userStore.calculateUserProgressPercent())
const userFiles = computed(() => userStore.getUserFiles())
const studentQuizzes = computed(() => userStore.getUserQuizAttempts())
const myEvaluation = computed(() => userStore.getStudentEvaluation())

// Aperçu en temps réel du nom de fichier généré
function getExerciseDocUrl(exId) {
  const ex = availableExercises.find(e => e.id === exId)
  return ex?.docUrl || 'https://docs.google.com/document/d/1PPtRyTN24HPU6ANKzkntr8e2sF0Dl2bm/preview'
}

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
  const reg = userStore.register(firstName.value, lastName.value, email.value)
  if (reg.success && registerPassword.value.trim()) {
    userStore.setInitialPassword(email.value, registerPassword.value, registerPassword.value)
  }
}

function handleLogin() {
  if (!loginEmail.value) {
    alert('Veuillez entrer votre adresse email.')
    return
  }

  // Vérifier d'abord le statut du compte
  const status = userStore.checkStudentStatus(loginEmail.value)
  if (!status.exists) {
    alert("Aucun compte étudiant trouvé avec cette adresse email. Vérifiez votre saisie ou inscrivez-vous.")
    return
  }

  // Si c'est sa toute première connexion et qu'aucun mot de passe n'est défini
  if (!status.passwordSet) {
    authPendingUser.value = status.user
    authViewMode.value = 'first-login'
    return
  }

  // Si le mot de passe est déjà requis
  if (!loginPassword.value) {
    alert('Veuillez saisir votre mot de passe personnel.')
    return
  }

  const res = userStore.loginStudentWithPassword(loginEmail.value, loginPassword.value)
  if (!res.success) {
    if (res.requireInitialPassword) {
      authPendingUser.value = res.user
      authViewMode.value = 'first-login'
    } else {
      alert(res.message)
    }
  }
}

function handleSetInitialPassword() {
  if (!authPendingUser.value) return
  initialPassFeedback.value = ''

  const res = userStore.setInitialPassword(
    authPendingUser.value.email,
    initialPassword.value,
    confirmInitialPassword.value
  )

  if (res.success) {
    alert("Votre mot de passe a été configuré avec succès ! Bienvenue sur votre espace.")
    authViewMode.value = 'login'
    authPendingUser.value = null
    initialPassword.value = ''
    confirmInitialPassword.value = ''
  } else {
    initialPassFeedback.value = res.message
  }
}

function handleStartForgotPassword() {
  forgotEmail.value = loginEmail.value || ''
  recoveryFeedback.value = ''
  recoverySimulatedCode.value = ''
  authViewMode.value = 'forgot-password'
}

function handleRequestRecoveryCode() {
  if (!forgotEmail.value) {
    recoveryFeedback.value = "Veuillez renseigner votre adresse email."
    return
  }

  const res = userStore.requestPasswordRecovery(forgotEmail.value)
  if (res.success) {
    recoverySimulatedCode.value = res.code
    recoveryFeedback.value = res.message
    authViewMode.value = 'reset-code'
  } else {
    recoveryFeedback.value = res.message
  }
}

function handleResetPasswordWithCode() {
  if (!forgotEmail.value || !recoveryCode.value || !newRecoveredPassword.value) {
    alert("Veuillez renseigner le code et le nouveau mot de passe.")
    return
  }

  const res = userStore.resetPasswordWithCode(
    forgotEmail.value,
    recoveryCode.value,
    newRecoveredPassword.value,
    confirmRecoveredPassword.value
  )

  if (res.success) {
    alert("Votre mot de passe a été réinitialisé avec succès ! Vous êtes désormais connecté.")
    authViewMode.value = 'login'
    recoveryCode.value = ''
    newRecoveredPassword.value = ''
    confirmRecoveredPassword.value = ''
    recoverySimulatedCode.value = ''
  } else {
    alert(res.message)
  }
}

function handleChangePasswordInSession() {
  changePassFeedback.value = { type: '', message: '' }
  if (!currentUser.value) return

  const res = userStore.changeStudentPassword(
    currentUser.value.email,
    oldPasswordCurrent.value,
    newPasswordCurrent.value,
    confirmPasswordCurrent.value
  )

  if (res.success) {
    changePassFeedback.value = { type: 'success', message: res.message }
    setTimeout(() => {
      showChangePassModal.value = false
      oldPasswordCurrent.value = ''
      newPasswordCurrent.value = ''
      confirmPasswordCurrent.value = ''
      changePassFeedback.value = { type: '', message: '' }
    }, 2000)
  } else {
    changePassFeedback.value = { type: 'error', message: res.message }
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

      <!-- SOUS-VUE 1 : FORMULAIRE STANDARD (INSCRIPTION + CONNEXION AVEC MOT DE PASSE) -->
      <div v-if="authViewMode === 'login'" class="auth-forms-grid">
        <!-- INSCRIPTION -->
        <div class="form-box">
          <h3>Nouvelle Inscription</h3>
          <p class="form-desc">Créez votre profil étudiant et sécurisez votre espace :</p>
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
          <div class="input-group">
            <label>Définir un Mot de passe personnel</label>
            <input v-model="registerPassword" type="password" placeholder="Minimum 4 caractères" />
          </div>
          <button @click="handleRegister" class="btn-primary">
            S'inscrire & Démarrer mon suivi →
          </button>
        </div>

        <!-- RE-CONNEXION AVEC MOT DE PASSE -->
        <div class="form-box secondary">
          <h3>Connexion Étudiant</h3>
          <p class="form-desc">Accédez à votre espace personnel sécurisé :</p>
          <div class="input-group">
            <label>Votre Adresse Email HECh</label>
            <input v-model="loginEmail" type="email" placeholder="sarah.dubois@student.hech.be" @keyup.enter="handleLogin" />
          </div>
          <div class="input-group">
            <div class="label-with-link">
              <label>Mot de passe</label>
              <button type="button" class="link-forgot-pass" @click="handleStartForgotPassword">
                Mot de passe oublié ?
              </button>
            </div>
            <input v-model="loginPassword" type="password" placeholder="Votre mot de passe personnel" @keyup.enter="handleLogin" />
          </div>
          <button @click="handleLogin" class="btn-secondary">
            Accéder à mon espace →
          </button>

          <div class="demo-hints">
            <span class="hint-title">💡 Comptes démo :</span>
            <span class="hint-text">sarah.dubois@student.hech.be (1ère connexion sans MDP) • maxime.lambert@student.hech.be (mdp: etudiant2026)</span>
          </div>
        </div>
      </div>

      <!-- SOUS-VUE 2 : PREMIÈRE CONNEXION (DÉFINITION DU MOT DE PASSE) -->
      <div v-else-if="authViewMode === 'first-login'" class="first-login-panel">
        <div class="first-login-box">
          <div class="badge-first-time">🎉 PREMIÈRE CONNEXION</div>
          <h3>Bienvenue {{ authPendingUser?.firstName }} {{ authPendingUser?.lastName }} !</h3>
          <p class="first-time-text">
            Votre compte a été créé par votre enseignant. Afin de garantir la confidentialité de vos devoirs et de vos résultats aux quiz, veuillez choisir votre <strong>mot de passe personnel</strong> pour finaliser l'activation de votre espace.
          </p>

          <div v-if="initialPassFeedback" class="alert-error">
            {{ initialPassFeedback }}
          </div>

          <div class="input-group">
            <label>Choisissez votre mot de passe (min. 4 caractères)</label>
            <input v-model="initialPassword" type="password" placeholder="Ex: monMotDePasse2026!" />
          </div>

          <div class="input-group">
            <label>Confirmez votre mot de passe</label>
            <input v-model="confirmInitialPassword" type="password" placeholder="Répétez le même mot de passe" />
          </div>

          <div class="first-login-actions">
            <button @click="handleSetInitialPassword" class="btn-primary full">
              Enregistrer mon mot de passe et entrer →
            </button>
            <button @click="authViewMode = 'login'" class="btn-cancel-link">
              ← Retour à la connexion
            </button>
          </div>
        </div>
      </div>

      <!-- SOUS-VUE 3 : DEMANDE DE RÉCUPÉRATION DU MOT DE PASSE OUBLIÉ -->
      <div v-else-if="authViewMode === 'forgot-password'" class="forgot-pass-panel">
        <div class="first-login-box">
          <div class="badge-recover">🔑 RÉCUPÉRATION DE MOT DE PASSE</div>
          <h3>Mot de passe oublié ?</h3>
          <p class="first-time-text">
            Saisissez votre adresse email institutionnelle. Un code de réinitialisation à 6 chiffres va être généré et envoyé pour sécuriser votre compte.
          </p>

          <div v-if="recoveryFeedback" class="alert-error">
            {{ recoveryFeedback }}
          </div>

          <div class="input-group">
            <label>Votre adresse email HECh</label>
            <input v-model="forgotEmail" type="email" placeholder="sarah.dubois@student.hech.be" />
          </div>

          <div class="first-login-actions">
            <button @click="handleRequestRecoveryCode" class="btn-primary full">
              Envoyer le code de vérification →
            </button>
            <button @click="authViewMode = 'login'" class="btn-cancel-link">
              ← Annuler et revenir
            </button>
          </div>
        </div>
      </div>

      <!-- SOUS-VUE 4 : SAISIE DU CODE ET NOUVEAU MOT DE PASSE -->
      <div v-else-if="authViewMode === 'reset-code'" class="forgot-pass-panel">
        <div class="first-login-box">
          <div class="badge-recover">📧 CODE ENVOYÉ</div>
          <h3>Réinitialisez votre mot de passe</h3>
          <p class="first-time-text">
            Un email contenant un code de confirmation a été simulé à l'adresse <strong>{{ forgotEmail }}</strong>.
          </p>

          <!-- Notification simulation mail visible pour démonstration -->
          <div v-if="recoverySimulatedCode" class="simulated-mail-card">
            <span class="mail-icon">📩</span>
            <div class="mail-body">
              <strong>Simulation email HECh reçu :</strong>
              <p>Votre code de vérification à 6 chiffres est : <span class="simulated-code">{{ recoverySimulatedCode }}</span></p>
            </div>
          </div>

          <div class="input-group">
            <label>Code de vérification (6 chiffres)</label>
            <input v-model="recoveryCode" type="text" placeholder="Ex: 123456" maxlength="6" />
          </div>

          <div class="input-group">
            <label>Nouveau mot de passe personnel</label>
            <input v-model="newRecoveredPassword" type="password" placeholder="Minimum 4 caractères" />
          </div>

          <div class="input-group">
            <label>Confirmez le nouveau mot de passe</label>
            <input v-model="confirmRecoveredPassword" type="password" placeholder="Répétez le mot de passe" />
          </div>

          <div class="first-login-actions">
            <button @click="handleResetPasswordWithCode" class="btn-primary full">
              Valider le nouveau mot de passe →
            </button>
            <button @click="authViewMode = 'login'" class="btn-cancel-link">
              ← Annuler
            </button>
          </div>
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
        <div class="profile-header-actions">
          <button @click="showChangePassModal = !showChangePassModal" class="btn-change-pass">
            🔐 Modifier mon mot de passe
          </button>
          <button @click="handleLogout" class="btn-logout">
            Déconnexion
          </button>
        </div>
      </div>

      <!-- PROGRESSION GLOBALE -->
      
      <!-- MODAL / BLOC CHANGEMENT DE MOT DE PASSE CONNECTÉ -->
      <div v-if="showChangePassModal" class="in-session-pass-card">
        <div class="in-session-header">
          <h4>🔐 Modifier mon mot de passe</h4>
          <button class="btn-close-mini" @click="showChangePassModal = false">✕</button>
        </div>

        <div v-if="changePassFeedback.message" :class="['alert-inline', changePassFeedback.type]">
          {{ changePassFeedback.message }}
        </div>

        <div class="mini-form-row">
          <div class="input-group">
            <label>Ancien mot de passe</label>
            <input v-model="oldPasswordCurrent" type="password" placeholder="Mot de passe actuel" />
          </div>
          <div class="input-group">
            <label>Nouveau mot de passe</label>
            <input v-model="newPasswordCurrent" type="password" placeholder="Nouveau mot de passe" />
          </div>
          <div class="input-group">
            <label>Confirmation</label>
            <input v-model="confirmPasswordCurrent" type="password" placeholder="Répéter nouveau mot de passe" />
          </div>
        </div>
        <div class="mini-form-actions">
          <button class="btn-primary small" @click="handleChangePasswordInSession">
            Enregistrer le nouveau mot de passe
          </button>
          <button class="btn-secondary small" @click="showChangePassModal = false">
            Annuler
          </button>
        </div>
      </div>

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
          :class="['tab-btn eval-highlight', { active: activeTab === 'evaluation' }]"
          @click="activeTab = 'evaluation'"
        >
          🏆 Mon Bilan & Notes
        </button>
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
          ✏️ Devoirs & Dépôts par Exercice ({{ userFiles.length }})
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'files' }]"
          @click="activeTab = 'files'"
        >
          📁 Tous mes Documents ({{ userFiles.length }})
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'quizzes' }]"
          @click="activeTab = 'quizzes'"
        >
          📝 Mes Évaluations Diagnostiques ({{ studentQuizzes.length }})
        </button>
      </div>

      <!-- VUE 0 : MON BILAN D'ÉVALUATION (SUR 200 POINTS) -->
      <div v-if="activeTab === 'evaluation'" class="tab-content">
        <div class="eval-overview-card">
          <div class="eval-hero-banner">
            <div class="eval-score-circle">
              <div class="score-big">{{ myEvaluation.totalScore }}</div>
              <div class="score-denom">/ {{ myEvaluation.totalMax }} pts</div>
              <div class="score-sub">{{ myEvaluation.totalOutOf20 }} / 20</div>
            </div>

            <div class="eval-hero-info">
              <div class="eval-badge-line">
                <span :class="['grade-status-pill', myEvaluation.isPassing ? 'pass' : 'ongoing']">
                  {{ myEvaluation.isPassing ? '✓ Seuil de réussite atteint' : '⏳ En cours de validation' }}
                </span>
                <span class="pct-pill">{{ myEvaluation.percentage }}%</span>
              </div>
              <h3 class="eval-title">Bilan d'Évaluation Didactique M1</h3>
              <p class="eval-desc">
                Pondération officielle : <strong>70 points</strong> pour les travaux sur la plateforme en ligne (10 pts Quiz + 60 pts Devoirs), <strong>100 points</strong> pour la création du jeu de société didactique, et <strong>30 points</strong> pour la soutenance orale devant la classe.
              </p>
              <div class="eval-link-wrapper">
                <a :href="withBase('/guide/evaluation')" class="link-eval-guide">
                  Consulter les modalités et critères détaillés de l'évaluation →
                </a>
              </div>
            </div>
          </div>

          <!-- Feedback enseignant -->
          <div v-if="myEvaluation.feedback" class="teacher-feedback-callout">
            <div class="fb-icon">👨‍🏫</div>
            <div class="fb-body">
              <strong>Observation & Feedback de l'enseignant :</strong>
              <p>{{ myEvaluation.feedback }}</p>
            </div>
          </div>

          <!-- DÉTAIL DES 3 PILIERS -->
          <div class="pillars-grid">
            <!-- PILIER 1 -->
            <div class="pillar-card p1">
              <div class="pillar-header">
                <div class="pillar-badge">Pilier 1 • 70 Pts</div>
                <div class="pillar-score-badge">{{ myEvaluation.pillar1.total }} / 70 pts</div>
              </div>
              <h4 class="pillar-title">Travaux sur la Plateforme</h4>
              <p class="pillar-summary">Auto-évaluations diagnostiques continues et devoirs pratiques déposés.</p>

              <div class="sub-pillars-list">
                <!-- 1.1 Quiz -->
                <div class="sub-pillar-row">
                  <div class="sp-info">
                    <span class="sp-icon">📝</span>
                    <div>
                      <span class="sp-name">Évaluations diagnostiques (Quiz de cours)</span>
                      <span class="sp-sub">{{ studentQuizzes.length }} quiz passé(s)</span>
                    </div>
                  </div>
                  <div class="sp-score">
                    <strong>{{ myEvaluation.pillar1.quizPoints }}</strong> / 10 pts
                  </div>
                </div>

                <!-- 1.2 Exercices pratiques -->
                <div class="sub-pillar-row highlight">
                  <div class="sp-info">
                    <span class="sp-icon">📂</span>
                    <div>
                      <span class="sp-name">6 Ateliers pratiques obligatoires (6 × 10 pts)</span>
                      <span class="sp-sub">Documents Word / PDF déposés sur votre espace</span>
                    </div>
                  </div>
                  <div class="sp-score">
                    <strong>{{ myEvaluation.pillar1.exercisesTotal }}</strong> / 60 pts
                  </div>
                </div>
              </div>

              <!-- Liste détaillée des 6 exercices -->
              <div class="eval-exercises-box">
                <div class="ee-title">État d'avancement des 6 devoirs obligatoires :</div>
                <div class="ee-list">
                  <div 
                    v-for="ex in myEvaluation.pillar1.exerciseDetails" 
                    :key="ex.id"
                    :class="['ee-item', { done: ex.completed }]"
                  >
                    <div class="ee-left">
                      <span class="ee-check">{{ ex.completed ? '✅' : '⚪' }}</span>
                      <span class="ee-name">{{ ex.title }}</span>
                    </div>
                    <div class="ee-right">
                      <a 
                        :href="getExerciseDocUrl(ex.id)" 
                        target="_blank" 
                        rel="noopener"
                        class="link-doc-drive"
                        title="Consulter et télécharger le document officiel Google Docs"
                      >
                        📥 Google Doc ↗
                      </a>
                      <span :class="['ee-status', ex.completed ? 'ok' : 'pending', { graded: !!ex.teacherFeedback }]">
                        <template v-if="ex.teacherFeedback">
                          👨‍🏫 Noté : {{ ex.points }}/10
                        </template>
                        <template v-else-if="ex.completed">
                          Déposé ({{ ex.points }}/10)
                        </template>
                        <template v-else>
                          Non déposé (0/10)
                        </template>
                      </span>
                      <button 
                        v-if="!ex.completed" 
                        @click="activeTab = 'exercises'"
                        class="btn-quick-upload"
                      >
                        Déposer →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- PILIER 2 -->
            <div class="pillar-card p2">
              <div class="pillar-header">
                <div class="pillar-badge">Pilier 2 • 100 Pts</div>
                <div class="pillar-score-badge">{{ myEvaluation.pillar2.total }} / 100 pts</div>
              </div>
              <h4 class="pillar-title">Création du Jeu de Société Didactique</h4>
              <p class="pillar-summary">Projet central ludo-éducatif, fabrication FabLab, cartes IA et vidéo.</p>

              <div class="pillar-details-box">
                <div class="criteria-check-item">
                  <span class="crit-icon">📋</span>
                  <div class="crit-text">
                    <strong>Prépa & intégration pédagogique (20 pts)</strong>
                    <span>Dossier didactique, intention pédagogique, règles et concordance FMTTN.</span>
                  </div>
                  <span class="crit-sub-score">{{ myEvaluation.pillar2.details.pedagogy }} / 20</span>
                </div>
                <div class="criteria-check-item">
                  <span class="crit-icon">🪚</span>
                  <div class="crit-text">
                    <strong>Plateau de jeu - Découpe laser (15 pts)</strong>
                    <span>Fichiers vectoriels .svg, gravure bois/plexiglas et ergonomie FabLab.</span>
                  </div>
                  <span class="crit-sub-score">{{ myEvaluation.pillar2.details.boardLaser }} / 15</span>
                </div>
                <div class="criteria-check-item">
                  <span class="crit-icon">🎲</span>
                  <div class="crit-text">
                    <strong>Pions de jeu - Impression 3D (15 pts)</strong>
                    <span>Modélisation 3D originale et qualité d'impression matérielle.</span>
                  </div>
                  <span class="crit-sub-score">{{ myEvaluation.pillar2.details.pawns3d }} / 15</span>
                </div>
                <div class="criteria-check-item">
                  <span class="crit-icon">🤖</span>
                  <div class="crit-text">
                    <strong>Cartes de jeu conçues avec l'IA (15 pts)</strong>
                    <span>Génération éthique des visuels IA, cartes questions/défis didactiques.</span>
                  </div>
                  <span class="crit-sub-score">{{ myEvaluation.pillar2.details.aiCards }} / 15</span>
                </div>
                <div class="criteria-check-item">
                  <span class="crit-icon">🎬</span>
                  <div class="crit-text">
                    <strong>Présentation vidéo du jeu (20 pts)</strong>
                    <span>Capsule vidéo explicative (2-3 min), pitch dynamique et démonstration.</span>
                  </div>
                  <span class="crit-sub-score">{{ myEvaluation.pillar2.details.video }} / 20</span>
                </div>
                <div class="criteria-check-item">
                  <span class="crit-icon">📸</span>
                  <div class="crit-text">
                    <strong>Intégration des photos & prototypes (15 pts)</strong>
                    <span>Documentation visuelle du processus de fabrication et du jeu final.</span>
                  </div>
                  <span class="crit-sub-score">{{ myEvaluation.pillar2.details.photos }} / 15</span>
                </div>
              </div>

              <div class="pillar-note-box">
                <span class="pnb-label">Total projet Jeu de société :</span>
                <span class="pnb-val">{{ myEvaluation.pillar2.total }} / 100 pts</span>
              </div>
            </div>

            <!-- PILIER 3 -->
            <div class="pillar-card p3">
              <div class="pillar-header">
                <div class="pillar-badge">Pilier 3 • 30 Pts</div>
                <div class="pillar-score-badge">{{ myEvaluation.pillar3.total }} / 30 pts</div>
              </div>
              <h4 class="pillar-title">Soutenance Orale devant la Classe</h4>
              <p class="pillar-summary">Présentation devant les pairs, animation de la table de jeu et échange didactique.</p>

              <div class="pillar-details-box single-defense">
                <div class="criteria-check-item highlight-defense">
                  <span class="crit-icon">🎤</span>
                  <div class="crit-text">
                    <strong>Soutenance orale globale (30 points)</strong>
                    <span>Animation de la table de jeu, argumentation réflexive et réponses aux questions de l'enseignant.</span>
                  </div>
                </div>
                <p class="defense-clarification">
                  <em>Les critères détaillés de soutenance vous seront communiqués lors de la préparation des passages oraux.</em>
                </p>
              </div>

              <div class="pillar-note-box">
                <span class="pnb-label">Note attribuée à la soutenance :</span>
                <span class="pnb-val">{{ myEvaluation.pillar3.total }} / 30 pts</span>
              </div>
            </div>
          </div>

          <!-- PHRASE DE RÉSERVE OFFICIELLE -->
          <div class="eval-adjustment-notice">
            <span class="notice-icon">⚠️</span>
            <span class="notice-text">
              <strong>Note importante :</strong> La pondération pourra être revue en fonction du déroulement du cours.
            </span>
          </div>
        </div>
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

      <!-- VUE 2 : MES DEVOIRS ET DÉPÔT DÉDIÉ PAR EXERCICE -->
      <div v-if="activeTab === 'exercises'" class="tab-content">
        <div class="exercises-tab-intro">
          <h3>📂 Espace de Dépôt des Devoirs & Ateliers</h3>
          <p>
            Chaque exercice dispose de son <strong>espace de dépôt dédié</strong>. Vous pouvez y déposer directement votre document finalisé au format <strong>Word (.docx / .doc)</strong> ou <strong>PDF (.pdf)</strong>. Il sera automatiquement identifié, normalisé et transmis à l'enseignant.
          </p>
        </div>

        <div class="exercises-list">
          <div 
            v-for="ex in availableExercises" 
            :key="ex.id"
            class="exercise-box-card"
          >
            <!-- En-tête de la fiche exercice -->
            <div class="ex-card-header">
              <div class="ex-card-title-block">
                <h4>{{ ex.title }}</h4>
                <a :href="ex.docUrl" target="_blank" rel="noopener" class="link-doc-drive-inline">
                  📥 Télécharger / Consulter le document officiel de consignes (Google Docs) ↗
                </a>
              </div>
              <div class="ex-status-badges">
                <span v-if="getFileForExercise(ex.id)" class="badge-submitted">
                  ✓ Document déposé
                </span>
                <span v-else class="badge-pending">
                  ⏳ En attente de document
                </span>
              </div>
            </div>

            <!-- ZONE DÉDIÉE AU FICHIER DE CET EXERCICE -->
            <div class="ex-dedicated-upload-zone">
              <div class="zone-label">
                <span class="zone-label-icon">📎</span>
                <strong>Document Word ou PDF pour cet exercice :</strong>
              </div>

              <!-- Cas 1 : Un fichier est déjà déposé pour cet exercice -->
              <div v-if="getFileForExercise(ex.id)" class="ex-file-active-card">
                <div class="ef-left">
                  <span class="ef-icon">{{ getFileForExercise(ex.id).formattedFileName.endsWith('.pdf') ? '📕' : '📘' }}</span>
                  <div class="ef-meta">
                    <div class="ef-filename">{{ getFileForExercise(ex.id).formattedFileName }}</div>
                    <div class="ef-subtext">
                      <span>Taille : {{ formatSize(getFileForExercise(ex.id).fileSize) }}</span>
                      <span>•</span>
                      <span>Déposé le {{ getFileForExercise(ex.id).submittedAt }}</span>
                      <span v-if="getFileForExercise(ex.id).driveSynced" class="ef-sync-tag">✓ Synchronisé Drive</span>
                    </div>
                  </div>
                </div>
                <div class="ef-actions">
                  <button @click="downloadFile(getFileForExercise(ex.id))" class="btn-ef-dl" title="Télécharger mon document">
                    📥 Télécharger
                  </button>
                  <button @click="deleteFile(getFileForExercise(ex.id).id)" class="btn-ef-del" title="Supprimer ou remplacer ce fichier">
                    🗑️ Remplacer
                  </button>
                </div>
              </div>

              <!-- Cas 2 : Aucun fichier n'est déposé, formulaire individuel immédiat -->
              <div v-else class="ex-file-picker-slot">
                <div v-if="exerciseUploadFeedbacks[ex.id]?.message" :class="['feedback-inline', exerciseUploadFeedbacks[ex.id].type]">
                  {{ exerciseUploadFeedbacks[ex.id].type === 'success' ? '✅ ' : '⚠️ ' }}
                  {{ exerciseUploadFeedbacks[ex.id].message }}
                </div>

                <div class="ex-upload-row">
                  <div class="file-input-wrapper">
                    <input 
                      :id="'file-input-' + ex.id"
                      type="file" 
                      accept=".pdf,.docx,.doc,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      @change="(e) => onExerciseFileChange(e, ex.id)"
                    />
                  </div>
                  <button 
                    @click="handleExerciseFileUpload(ex.id, ex.title)"
                    :disabled="!exerciseUploadFiles[ex.id] || exerciseUploading[ex.id]"
                    class="btn-ex-upload-action"
                  >
                    {{ exerciseUploading[ex.id] ? 'Envoi en cours...' : 'Déposer ce fichier →' }}
                  </button>
                </div>

                <!-- Aperçu dynamique du nom officiel pour cet exercice -->
                <div v-if="getExerciseFilePreview(ex.title, ex.id)" class="ex-file-preview-tag">
                  <span class="tag-title">Nom officiel normalisé :</span>
                  <code>{{ getExerciseFilePreview(ex.title, ex.id) }}</code>
                </div>
              </div>
            </div>

            <!-- ACCORDÉON NOTES & RÉPONSES ÉCRITES EN LIGNE (OPTIONNEL) -->
            <details class="notes-accordion">
              <summary class="notes-summary">
                <span>✍️ Notes personnelles ou réponse rédigée en ligne (facultatif)</span>
                <span v-if="getAnswer(ex.id)" class="notes-done-tag">Note enregistrée ✓</span>
              </summary>
              <div class="notes-panel-content">
                <div v-if="editAnswerId === ex.id" class="edit-area">
                  <textarea 
                    v-model="editAnswerText" 
                    rows="3" 
                    placeholder="Rédigez ou collez une note textuelle pour cet exercice..."
                  ></textarea>
                  <div class="edit-actions">
                    <button @click="saveEdit(ex.id, ex.title)" class="btn-save">Enregistrer</button>
                    <button @click="editAnswerId = null" class="btn-cancel">Annuler</button>
                  </div>
                </div>

                <div v-else class="saved-answer-view">
                  <div v-if="getAnswer(ex.id)" class="answer-content">
                    <p>{{ getAnswer(ex.id) }}</p>
                    <button @click="startEdit(ex.id)" class="btn-edit-link">Modifier ma réponse écrite ✎</button>
                  </div>
                  <div v-else class="empty-answer">
                    <p>Aucune note textuelle en ligne pour cet exercice.</p>
                    <button @click="startEdit(ex.id)" class="btn-add-answer">+ Ajouter une note écrite</button>
                  </div>
                </div>
              </div>
            </details>

                        <!-- RETOUR & CORRECTION PÉDAGOGIQUE CONTINUE PAR L'IA -->
            <div v-if="getFileForExercise(ex.id)?.aiCorrection" class="ex-ai-feedback-card">
              <div class="ai-card-header">
                <div class="ai-author-block">
                  <span class="ai-avatar">🤖</span>
                  <div>
                    <div class="ai-author-title">Évaluation formative continue générée par l'IA</div>
                    <div class="ai-author-date">
                      Analysé le {{ getFileForExercise(ex.id).aiCorrection.correctedAt }} • {{ getFileForExercise(ex.id).aiCorrection.modelUsed }}
                    </div>
                  </div>
                </div>
                <div class="ai-score-badge">
                  Note indicative : <strong>{{ getFileForExercise(ex.id).aiCorrection.suggestedScore }}</strong> / {{ getFileForExercise(ex.id).aiCorrection.maxScore }} pts
                </div>
              </div>

              <div class="ai-card-body">
                <div class="ai-summary-callout">
                  <strong>Synthèse de l'évaluation :</strong> {{ getFileForExercise(ex.id).aiCorrection.summary }}
                </div>

                <!-- Grille critériée conforme au prompt section 10 -->
                <div v-if="getFileForExercise(ex.id).aiCorrection.criteriaTable?.length" class="ai-criteria-box">
                  <div class="ai-table-title">📊 Évaluation critériée détaillée :</div>
                  <table class="ai-rubric-table">
                    <thead>
                      <tr>
                        <th>Critère pédagogique</th>
                        <th>Note</th>
                        <th>Justification</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(crit, cIdx) in getFileForExercise(ex.id).aiCorrection.criteriaTable" :key="cIdx">
                        <td class="col-name"><strong>{{ crit.name }}</strong></td>
                        <td class="col-score"><strong>{{ crit.score }}</strong> / {{ crit.maxScore }}</td>
                        <td class="col-justif">{{ crit.justification }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Points forts et points à améliorer -->
                <div class="ai-feedback-columns">
                  <div v-if="getFileForExercise(ex.id).aiCorrection.strengths?.length" class="ai-col strengths">
                    <div class="ai-col-heading">✅ Points forts</div>
                    <ul>
                      <li v-for="(s, sIdx) in getFileForExercise(ex.id).aiCorrection.strengths" :key="sIdx">{{ s }}</li>
                    </ul>
                  </div>
                  <div v-if="getFileForExercise(ex.id).aiCorrection.improvements?.length" class="ai-col improvements">
                    <div class="ai-col-heading">🎯 Points à améliorer</div>
                    <ul>
                      <li v-for="(imp, iIdx) in getFileForExercise(ex.id).aiCorrection.improvements" :key="iIdx">{{ imp }}</li>
                    </ul>
                  </div>
                </div>

                <!-- Piste de progression -->
                <div v-if="getFileForExercise(ex.id).aiCorrection.nextSteps" class="ai-next-steps">
                  <span class="ns-icon">💡</span>
                  <div>
                    <strong>Piste de progression recommandée :</strong>
                    <p>{{ getFileForExercise(ex.id).aiCorrection.nextSteps }}</p>
                  </div>
                </div>

                <div class="ai-disclaimer">
                  ⚖️ <em>Correction formative continue basée sur les <a href="/guide/criteres-correction-ia" target="_blank">critères officiels de correction IA</a>. La note finale est réévaluée et arrêtée par l'enseignant à la fin du cours.</em>
                </div>
              </div>
            </div>

            <!-- RETOUR & ÉVALUATION DE L'ENSEIGNANT -->
            <div v-if="getTeacherFeedbackForExercise(ex.id)" class="ex-teacher-feedback-card">
              <div class="tf-card-header">
                <div class="tf-author-block">
                  <span class="tf-avatar">👨‍🏫</span>
                  <div>
                    <div class="tf-author-title">Évaluation & Commentaire de votre enseignant</div>
                    <div class="tf-author-date">Transmis le {{ getTeacherFeedbackForExercise(ex.id).gradedAt }}</div>
                  </div>
                </div>
                <div v-if="getTeacherFeedbackForExercise(ex.id).score !== undefined && getTeacherFeedbackForExercise(ex.id).score !== null" class="tf-score-badge">
                  Note : <strong>{{ getTeacherFeedbackForExercise(ex.id).score }}</strong> / 10 pts
                </div>
              </div>
              <div class="tf-card-body">
                <div class="tf-quote-bubble">
                  <p class="tf-comment-text">« {{ getTeacherFeedbackForExercise(ex.id).feedback }} »</p>
                </div>
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

              <!-- ÉVALUATION & COMMENTAIRE ENSEIGNANT POUR CE FICHIER -->
              <div v-if="file.teacherGrade && (file.teacherGrade.feedback || file.teacherGrade.status === 'graded')" class="file-teacher-eval-box">
                <div class="fte-header">
                  <span class="fte-badge">👨‍🏫 Évaluation Enseignant</span>
                  <span v-if="file.teacherGrade.score !== undefined" class="fte-score">
                    Note : <strong>{{ file.teacherGrade.score }}</strong> / 10 pts
                  </span>
                </div>
                <div v-if="file.teacherGrade.feedback" class="fte-quote">
                  « {{ file.teacherGrade.feedback }} »
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


      <!-- VUE 4 : MES ÉVALUATIONS DIAGNOSTIQUES & QUIZ -->
      <div v-if="activeTab === 'quizzes'" class="tab-content">
        <div class="tab-intro">
          <div>
            <h3>📝 Vos Évaluations Diagnostiques & Quiz</h3>
            <p>Retrouvez l'historique détaillé de tous les questionnaires de vérification de compréhension réalisés à la fin des modules de cours.</p>
          </div>
          <a href="/modules/01-1-definition-digcomp" class="btn-action-primary">
            Accéder aux modules de cours →
          </a>
        </div>

        <div v-if="studentQuizzes.length === 0" class="empty-state-card">
          <span class="empty-icon">📝</span>
          <h4>Aucun quiz complété pour le moment</h4>
          <p>Rendez-vous à la fin de chaque partie du syllabus pour valider vos acquis par un quiz diagnostic (QCM et questions ouvertes de réflexion didactique).</p>
          <a href="/modules/01-1-definition-digcomp" class="btn-primary small">
            Faire le quiz du Module 1.1 →
          </a>
        </div>

        <div v-else class="quiz-history-list">
          <div 
            v-for="att in studentQuizzes" 
            :key="att.id" 
            class="quiz-history-card"
          >
            <div class="q-hist-header">
              <div class="q-hist-module-info">
                <span class="q-mod-badge">{{ att.moduleId }}</span>
                <h4 class="q-mod-title">{{ att.moduleTitle }}</h4>
              </div>
              <div class="q-hist-score-badge" :class="att.percentage >= 80 ? 'good' : (att.percentage >= 50 ? 'medium' : 'low')">
                <span class="q-score-val">{{ att.score }} / {{ att.totalPoints }}</span>
                <span class="q-pct-val">{{ att.percentage }}%</span>
              </div>
            </div>

            <div class="q-hist-meta">
              <span class="q-date">🗓️ Complété le {{ att.submittedAt }}</span>
              <span class="q-type-badge">Évaluation diagnostique formative</span>
            </div>

            <!-- Détail des réponses -->
            <details class="q-answers-details">
              <summary class="q-details-summary">
                Consulter mes réponses et les critères didactiques ({{ att.answers.length }} questions)
              </summary>
              <div class="q-answers-breakdown">
                <div 
                  v-for="(ans, aIdx) in att.answers" 
                  :key="ans.questionId || aIdx"
                  class="q-answer-item"
                  :class="ans.type === 'qcm' ? (ans.isCorrect ? 'ans-correct' : 'ans-wrong') : 'ans-open'"
                >
                  <div class="ans-header">
                    <span class="ans-num">Question {{ aIdx + 1 }} ({{ ans.type === 'qcm' ? 'QCM' : 'Question ouverte' }})</span>
                    <span class="ans-pts">{{ ans.points }} / {{ ans.maxPoints }} pt{{ ans.maxPoints > 1 ? 's' : '' }}</span>
                  </div>
                  <p class="ans-text"><strong>Intitulé :</strong> {{ ans.questionText }}</p>
                  
                  <div class="ans-student-box">
                    <strong>Votre réponse :</strong>
                    <p>{{ ans.userAnswer }}</p>
                  </div>

                  <div v-if="ans.type === 'qcm' && !ans.isCorrect" class="ans-expected-box">
                    <strong>Bonne réponse attendue :</strong>
                    <p>{{ ans.correctAnswer }}</p>
                    <p v-if="ans.explanation" class="ans-exp">💡 {{ ans.explanation }}</p>
                  </div>

                  <div v-else-if="ans.type === 'open'" class="ans-expected-box">
                    <strong>Critères du syllabus & Corrigé type :</strong>
                    <p>{{ ans.explanation }}</p>
                    <p v-if="ans.openFeedback" class="ans-exp">💬 {{ ans.openFeedback }}</p>
                  </div>
                </div>
              </div>
            </details>
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

.exercises-tab-intro {
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
  margin-bottom: 1.5rem;
}

.exercises-tab-intro h3 {
  margin: 0 0 0.4rem 0;
  font-size: 1.15rem;
  font-weight: 800;
}

.exercises-tab-intro p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
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
  gap: 1rem;
  flex-wrap: wrap;
}

.ex-card-title-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ex-card-header h4 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.link-doc-drive-inline {
  font-size: 0.82rem;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 600;
}

.link-doc-drive-inline:hover {
  text-decoration: underline;
}

.ex-status-badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge-submitted {
  background: #d1fae5;
  color: #065f46;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
}

.badge-pending {
  background: #fef3c7;
  color: #92400e;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
}

/* ZONE DÉDIÉE AU DÉPÔT D'UN DEVOIR */
.ex-dedicated-upload-zone {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.zone-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.88rem;
  margin-bottom: 0.8rem;
  color: var(--vp-c-text-1);
}

.zone-label-icon {
  font-size: 1.1rem;
}

/* FICHIER DÉJÀ DÉPOSÉ */
.ex-file-active-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(16, 185, 129, 0.06);
  border: 1px solid #10b981;
  border-radius: 8px;
  padding: 0.8rem 1rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.ef-left {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.ef-icon {
  font-size: 1.8rem;
}

.ef-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.ef-filename {
  font-family: monospace;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  word-break: break-all;
}

.ef-subtext {
  display: flex;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  align-items: center;
  flex-wrap: wrap;
}

.ef-sync-tag {
  background: #d1fae5;
  color: #065f46;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
}

.ef-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-ef-dl {
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-ef-del {
  background: none;
  border: 1px solid #fca5a5;
  color: #ef4444;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-ef-del:hover {
  background: #fee2e2;
}

/* CAS FORMULAIRE DÉPÔT INDIVIDUEL */
.ex-file-picker-slot {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.ex-upload-row {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  flex-wrap: wrap;
}

.file-input-wrapper {
  flex: 1;
  min-width: 240px;
}

.file-input-wrapper input {
  width: 100%;
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px dashed var(--vp-c-brand-1);
  background: var(--vp-c-bg-alt);
  font-size: 0.85rem;
  color: var(--vp-c-text-1);
}

.btn-ex-upload-action {
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s;
}

.btn-ex-upload-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ex-file-preview-tag {
  background: rgba(37, 99, 235, 0.05);
  border: 1px dashed var(--vp-c-brand-1);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.ex-file-preview-tag .tag-title {
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.ex-file-preview-tag code {
  font-family: monospace;
  font-size: 0.82rem;
  color: var(--vp-c-text-1);
}

.feedback-inline {
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
}

.feedback-inline.success {
  background: #d1fae5;
  color: #065f46;
}

.feedback-inline.error {
  background: #fee2e2;
  color: #991b1b;
}

/* ACCORDÉON NOTES */
.notes-accordion {
  margin-top: 0.8rem;
  border-top: 1px dashed var(--vp-c-divider);
  padding-top: 0.6rem;
}

.notes-summary {
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notes-summary:hover {
  color: var(--vp-c-brand-1);
}

.notes-done-tag {
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 700;
}

.notes-panel-content {
  margin-top: 0.8rem;
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

/* ENCART RETOUR & COMMENTAIRE ENSEIGNANT PAR EXERCICE */
.ex-teacher-feedback-card {
  margin-top: 1rem;
  background: #f0fdf4;
  border: 1.5px solid #86efac;
  border-radius: 10px;
  padding: 1rem 1.2rem;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.08);
}

.tf-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-bottom: 0.6rem;
}

.tf-author-block {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.tf-avatar {
  font-size: 1.4rem;
}

.tf-author-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #166534;
}

.tf-author-date {
  font-size: 0.76rem;
  color: #15803d;
}

.tf-score-badge {
  background: #166534;
  color: white;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
}

.tf-score-badge strong {
  font-size: 0.95rem;
}

.tf-quote-bubble {
  background: rgba(255, 255, 255, 0.75);
  border-left: 3px solid #22c55e;
  border-radius: 4px;
  padding: 0.6rem 0.9rem;
}

.tf-comment-text {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #14532d;
  font-style: italic;
}

/* CARTOUCHE ÉVALUATION ENSEIGNANT DANS LA FICHE FICHIER */
.file-teacher-eval-box {
  margin: 0.8rem 0;
  padding: 0.75rem 1rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
}

.fte-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}

.fte-badge {
  font-size: 0.78rem;
  font-weight: 700;
  color: #166534;
}

.fte-score {
  font-size: 0.8rem;
  font-weight: 700;
  color: #15803d;
}

.fte-quote {
  font-size: 0.85rem;
  font-style: italic;
  color: #14532d;
  line-height: 1.4;
}

.ee-status.graded {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #86efac;
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

/* NOUVEAUX STYLES POUR L'AUTHENTIFICATION & MOTS DE PASSE ÉTUDIANTS */
.label-with-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.link-forgot-pass {
  background: none;
  border: none;
  color: var(--vp-c-brand-1);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.link-forgot-pass:hover {
  color: #4338ca;
}

.demo-hints {
  margin-top: 1.2rem;
  padding: 0.8rem;
  background: rgba(99, 102, 241, 0.06);
  border-radius: 8px;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.4;
}

.hint-title {
  font-weight: 700;
  color: #4f46e5;
  display: block;
  margin-bottom: 2px;
}

.first-login-panel,
.forgot-pass-panel {
  max-width: 540px;
  margin: 1.5rem auto;
}

.first-login-box {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}

.badge-first-time {
  display: inline-block;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 20px;
  letter-spacing: 0.5px;
  margin-bottom: 0.8rem;
}

.badge-recover {
  display: inline-block;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 20px;
  letter-spacing: 0.5px;
  margin-bottom: 0.8rem;
}

.first-time-text {
  font-size: 0.92rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  margin-bottom: 1.4rem;
}

.first-login-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 1.5rem;
}

.btn-primary.full {
  width: 100%;
}

.btn-cancel-link {
  background: none;
  border: none;
  color: var(--vp-c-text-2);
  font-size: 0.88rem;
  cursor: pointer;
  text-align: center;
}

.btn-cancel-link:hover {
  color: var(--vp-c-text-1);
}

.simulated-mail-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px dashed #10b981;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.2rem;
}

.simulated-code {
  font-family: monospace;
  font-weight: 800;
  font-size: 1.2rem;
  color: #065f46;
  letter-spacing: 2px;
  background: white;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid #10b981;
}

.profile-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-change-pass {
  background: var(--vp-c-default-soft);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  font-size: 0.82rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-change-pass:hover {
  background: var(--vp-c-bg);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.in-session-pass-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
  margin: 1.2rem 0;
  animation: fadeIn 0.2s ease;
}

.in-session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.in-session-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.btn-close-mini {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: var(--vp-c-text-2);
}

.mini-form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.mini-form-actions {
  display: flex;
  gap: 10px;
}

.btn-primary.small {
  padding: 6px 14px;
  font-size: 0.85rem;
}

.btn-secondary.small {
  padding: 6px 14px;
  font-size: 0.85rem;
}

/* HISTORIQUE DES QUIZ ÉTUDIANT */
.quiz-history-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-top: 1.2rem;
}

.quiz-history-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.4rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.q-hist-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.q-hist-module-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.q-mod-badge {
  background: rgba(99, 102, 241, 0.12);
  color: #4f46e5;
  font-weight: 800;
  font-size: 0.8rem;
  padding: 3px 8px;
  border-radius: 6px;
}

.q-mod-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.q-hist-score-badge {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
}

.q-hist-score-badge.good {
  background: rgba(16, 185, 129, 0.12);
  color: #065f46;
}

.q-hist-score-badge.medium {
  background: rgba(245, 158, 11, 0.12);
  color: #92400e;
}

.q-hist-score-badge.low {
  background: rgba(239, 68, 68, 0.12);
  color: #991b1b;
}

.q-score-val {
  font-weight: 800;
  font-size: 1.1rem;
}

.q-pct-val {
  font-size: 0.85rem;
  font-weight: 600;
}

.q-hist-meta {
  display: flex;
  gap: 15px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  margin: 0.6rem 0 1rem 0;
}

.q-type-badge {
  background: var(--vp-c-default-soft);
  padding: 2px 6px;
  border-radius: 4px;
}

.q-answers-details {
  border-top: 1px dashed var(--vp-c-divider);
  padding-top: 0.8rem;
}

.q-details-summary {
  cursor: pointer;
  font-weight: 600;
  font-size: 0.88rem;
  color: var(--vp-c-brand-1);
}

.q-answers-breakdown {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.q-answer-item {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1rem;
}

.q-answer-item.ans-correct {
  border-left: 4px solid #10b981;
}

.q-answer-item.ans-wrong {
  border-left: 4px solid #ef4444;
}

.q-answer-item.ans-open {
  border-left: 4px solid #3b82f6;
}

.ans-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}

.ans-num {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
}

.ans-pts {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.ans-text {
  font-size: 0.9rem;
  margin: 0 0 0.6rem 0;
  color: var(--vp-c-text-1);
}

.ans-student-box {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
  font-size: 0.88rem;
  margin-bottom: 0.5rem;
}

.ans-student-box p {
  margin: 4px 0 0 0;
  color: var(--vp-c-text-1);
}

.ans-expected-box {
  background: rgba(99, 102, 241, 0.05);
  border-left: 3px solid #6366f1;
  padding: 0.6rem 0.8rem;
  border-radius: 0 6px 6px 0;
  font-size: 0.86rem;
}

.ans-expected-box p {
  margin: 4px 0 0 0;
  color: var(--vp-c-text-1);
}

.ans-exp {
  font-style: italic;
  color: var(--vp-c-text-2) !important;
  margin-top: 4px !important;
}


/* STYLES RETOUR & CORRECTION IA */
.ex-ai-feedback-card {
  margin-top: 1rem;
  background: var(--vp-c-bg);
  border: 1.5px solid #6366f1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.08);
}
.ai-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.06));
  padding: 10px 14px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.2);
  gap: 10px;
  flex-wrap: wrap;
}
.ai-author-block {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ai-avatar {
  font-size: 1.5rem;
  background: white;
  padding: 4px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}
.ai-author-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #4f46e5;
}
.ai-author-date {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
}
.ai-score-badge {
  background: #4f46e5;
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
}
.ai-card-body {
  padding: 14px;
}
.ai-summary-callout {
  background: var(--vp-c-bg-soft);
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 0.88rem;
  line-height: 1.5;
  margin-bottom: 12px;
  border-left: 3px solid #6366f1;
}
.ai-criteria-box {
  margin-bottom: 14px;
  overflow-x: auto;
}
.ai-table-title {
  font-weight: 700;
  font-size: 0.85rem;
  margin-bottom: 6px;
  color: var(--vp-c-text-1);
}
.ai-rubric-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  overflow: hidden;
}
.ai-rubric-table th {
  background: rgba(99, 102, 241, 0.1);
  padding: 8px 10px;
  text-align: left;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.ai-rubric-table td {
  padding: 8px 10px;
  border-top: 1px solid var(--vp-c-divider);
  vertical-align: top;
}
.ai-rubric-table .col-name {
  width: 32%;
}
.ai-rubric-table .col-score {
  width: 15%;
  white-space: nowrap;
  color: #4f46e5;
}
.ai-rubric-table .col-justif {
  color: var(--vp-c-text-2);
  line-height: 1.4;
}
.ai-feedback-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}
.ai-col {
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 0.84rem;
}
.ai-col.strengths {
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.25);
}
.ai-col.improvements {
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
}
.ai-col-heading {
  font-weight: 700;
  font-size: 0.85rem;
  margin-bottom: 6px;
}
.ai-col.strengths .ai-col-heading {
  color: #16a34a;
}
.ai-col.improvements .ai-col-heading {
  color: #d97706;
}
.ai-col ul {
  margin: 0;
  padding-left: 16px;
}
.ai-col li {
  margin-bottom: 4px;
  line-height: 1.4;
}
.ai-next-steps {
  display: flex;
  gap: 10px;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.84rem;
  margin-bottom: 12px;
  align-items: flex-start;
}
.ns-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}
.ai-next-steps p {
  margin: 2px 0 0 0;
  line-height: 1.4;
  color: var(--vp-c-text-1);
}
.ai-disclaimer {
  font-size: 0.76rem;
  color: var(--vp-c-text-3);
  text-align: right;
  border-top: 1px dashed var(--vp-c-divider);
  padding-top: 8px;
  margin-top: 4px;
}

</style>


/* ========================================================
   STYLES DU BILAN D'ÉVALUATION (SUR 200 POINTS)
   ======================================================== */
.tab-btn.eval-highlight {
  background: linear-gradient(135deg, rgba(234, 88, 12, 0.1), rgba(217, 119, 6, 0.15));
  border-color: rgba(234, 88, 12, 0.3);
  font-weight: 700;
  color: #ea580c;
}
.tab-btn.eval-highlight.active {
  background: linear-gradient(135deg, #ea580c, #d97706);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 4px 14px rgba(234, 88, 12, 0.3);
}

.eval-overview-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.eval-hero-banner {
  background: linear-gradient(135deg, #0f172a, #1e293b);
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 2rem;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 2rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .eval-hero-banner {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }
}

.eval-score-circle {
  min-width: 150px;
  height: 150px;
  border-radius: 50%;
  background: radial-gradient(circle, #1e293b, #0f172a);
  border: 4px solid #38bdf8;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
}

.score-big {
  font-size: 2.5rem;
  font-weight: 900;
  color: #38bdf8;
  line-height: 1;
}

.score-denom {
  font-size: 0.85rem;
  color: #94a3b8;
  font-weight: 600;
  margin-top: 2px;
}

.score-sub {
  font-size: 0.85rem;
  color: #34d399;
  font-weight: 700;
  margin-top: 4px;
}

.eval-hero-info {
  flex: 1;
}

.eval-badge-line {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.grade-status-pill {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.3rem 0.8rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.grade-status-pill.pass {
  background: rgba(52, 211, 153, 0.2);
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.4);
}

.grade-status-pill.ongoing {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.4);
}

.pct-pill {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.3rem 0.6rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
}

.eval-title {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0.3rem 0 0.5rem 0;
  color: #ffffff;
}

.eval-desc {
  font-size: 0.95rem;
  color: #cbd5e1;
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

.link-eval-guide {
  font-size: 0.85rem;
  font-weight: 600;
  color: #38bdf8;
  text-decoration: none;
}
.link-eval-guide:hover {
  text-decoration: underline;
}

.teacher-feedback-callout {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
  color: #166534;
}
:root.dark .teacher-feedback-callout {
  background: rgba(22, 101, 52, 0.2);
  border-color: rgba(34, 197, 94, 0.4);
  color: #86efac;
}

.fb-icon {
  font-size: 1.6rem;
}
.fb-body p {
  margin: 0.3rem 0 0 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.pillars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.pillar-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
}

.pillar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.pillar-badge {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  background: rgba(2, 132, 199, 0.1);
  color: #0284c7;
}

.pillar-score-badge {
  font-size: 1rem;
  font-weight: 800;
  color: var(--vp-c-brand);
}

.pillar-title {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 0.4rem 0;
  color: var(--vp-c-text-1);
}

.pillar-summary {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1.25rem;
  line-height: 1.4;
}

.sub-pillars-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.sub-pillar-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}

.sub-pillar-row.highlight {
  border-color: rgba(2, 132, 199, 0.3);
  background: rgba(2, 132, 199, 0.04);
}

.sp-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sp-icon {
  font-size: 1.2rem;
}

.sp-name {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.sp-sub {
  display: block;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}

.sp-score {
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}
.sp-score strong {
  font-size: 1.1rem;
  color: var(--vp-c-text-1);
}

.eval-exercises-box {
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 1rem;
  margin-top: auto;
}

.ee-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
  margin-bottom: 0.6rem;
}

.ee-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  font-size: 0.82rem;
}

.ee-item.done {
  background: rgba(34, 197, 94, 0.06);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.ee-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ee-check {
  font-size: 0.9rem;
}

.ee-name {
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.ee-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ee-status.ok {
  color: #16a34a;
  font-weight: 600;
  font-size: 0.75rem;
}

.ee-status.pending {
  color: #ea580c;
  font-weight: 500;
  font-size: 0.75rem;
}

.btn-quick-upload {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background: #0284c7;
  color: #ffffff;
  border: none;
  cursor: pointer;
}
.btn-quick-upload:hover {
  background: #0369a1;
}

.pillar-details-box {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
}

.criteria-check-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.crit-icon {
  font-size: 1.1rem;
}

.crit-text strong {
  display: block;
  font-size: 0.82rem;
  color: var(--vp-c-text-1);
}

.crit-text span {
  display: block;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  line-height: 1.3;
}

.pillar-note-box {
  margin-top: auto;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  background: rgba(2, 132, 199, 0.06);
  border: 1px solid rgba(2, 132, 199, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pnb-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.pnb-val {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--vp-c-brand);
}


.crit-sub-score {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-brand);
  background: var(--vp-c-bg);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  white-space: nowrap;
}

.defense-clarification {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  margin: 0.5rem 0 0 0;
  line-height: 1.4;
}

.highlight-defense {
  border-left: 3px solid #0284c7;
}

.eval-adjustment-notice {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  border-radius: 8px;
  background: rgba(234, 88, 12, 0.08);
  border: 1px solid rgba(234, 88, 12, 0.25);
  font-size: 0.88rem;
  color: #c2410c;
  margin-top: 0.5rem;
}
:root.dark .eval-adjustment-notice {
  background: rgba(234, 88, 12, 0.15);
  border-color: rgba(234, 88, 12, 0.4);
  color: #fdba74;
}
.notice-icon {
  font-size: 1.2rem;
}


.link-doc-drive {
  font-size: 0.75rem;
  font-weight: 600;
  color: #0284c7;
  text-decoration: none;
  background: rgba(2, 132, 199, 0.08);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  border: 1px solid rgba(2, 132, 199, 0.2);
  white-space: nowrap;
}
.link-doc-drive:hover {
  background: rgba(2, 132, 199, 0.18);
  text-decoration: underline;
}
.link-doc-drive-inline {
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #0284c7;
  margin-top: 0.2rem;
  text-decoration: none;
}
.link-doc-drive-inline:hover {
  text-decoration: underline;
}
