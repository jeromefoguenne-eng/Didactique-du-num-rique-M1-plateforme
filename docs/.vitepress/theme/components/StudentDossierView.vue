<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { userStore, OFFICIAL_EVALUATION_ITEMS, formatDeadlineDisplay } from '../stores/userStore'
import { withBase } from 'vitepress'

// Authentification Enseignant
const isAuthenticated = ref(false)
const enteredPin = ref('')
const loginError = ref('')
const showPin = ref(false)

// Navigation et sélection de l'étudiant
const selectedEmail = ref('')
const dossierFilter = ref('all') // 'all' | 'part1' | 'part2' | 'quiz' | 'submitted_only'
const expandedTexts = ref({})
const activeDocPreview = ref(null) // { fileId, fileName, type: 'pdf'|'docx'|'other', dataUrl, htmlContent, loading, error }
const isAnalyzingFile = ref({})
const gradeSaveFeedbacks = ref({})

// Initialisation au montage
onMounted(() => {
  userStore.syncFromStorage()
  userStore.syncWithCloud().catch(() => {})

  // Vérifier si déjà authentifié via la session courante
  if (typeof window !== 'undefined') {
    const sessionAuth = sessionStorage.getItem('didactique_admin_auth')
    if (sessionAuth === 'true') {
      isAuthenticated.value = true
    }

    // Récupérer l'email depuis l'URL (?student=...)
    const params = new URLSearchParams(window.location.search)
    const urlEmail = params.get('student')
    if (urlEmail) {
      selectedEmail.value = decodeURIComponent(urlEmail).toLowerCase().trim()
    } else {
      // Par défaut, sélectionner le premier étudiant de la liste
      const list = userStore.users
      if (list && list.length > 0) {
        selectedEmail.value = list[0].email
      }
    }
  }
})

// Mettre à jour l'URL lorsque l'étudiant change sans recharger la page
watch(selectedEmail, (newEmail) => {
  if (typeof window !== 'undefined' && newEmail) {
    const url = new URL(window.location.href)
    url.searchParams.set('student', newEmail)
    window.history.replaceState({}, '', url.toString())
    activeDocPreview.value = null
  }
})

function checkPin() {
  loginError.value = ''
  const clean = (enteredPin.value || '').trim()
  if (clean.toLowerCase() === 'hech2026' || userStore.verifyAdminPin(clean)) {
    isAuthenticated.value = true
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('didactique_admin_auth', 'true')
    }
    userStore.clearAdminLockout()
    enteredPin.value = ''
  } else {
    loginError.value = 'Mot de passe enseignant incorrect.'
  }
}

const users = computed(() => {
  return [...userStore.users].sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''))
})

const currentDossier = computed(() => {
  if (!selectedEmail.value) return null
  return userStore.getStudentFullDossier(selectedEmail.value)
})

const filteredItems = computed(() => {
  if (!currentDossier.value || !currentDossier.value.items) return []
  const all = currentDossier.value.items

  switch (dossierFilter.value) {
    case 'part1':
      return all.filter(it => it.part === 1 && it.category !== 'quiz')
    case 'part2':
      return all.filter(it => it.part === 2)
    case 'quiz':
      return all.filter(it => it.category === 'quiz')
    case 'submitted_only':
      return all.filter(it => it.completed)
    case 'all':
    default:
      return all
  }
})

function nextStudent() {
  const list = users.value
  if (!list.length) return
  const currentClean = (selectedEmail.value || '').toLowerCase()
  const idx = list.findIndex(u => (u.email || '').toLowerCase() === currentClean)
  if (idx >= 0 && idx < list.length - 1) {
    selectedEmail.value = list[idx + 1].email
  } else {
    selectedEmail.value = list[0].email
  }
}

function prevStudent() {
  const list = users.value
  if (!list.length) return
  const currentClean = (selectedEmail.value || '').toLowerCase()
  const idx = list.findIndex(u => (u.email || '').toLowerCase() === currentClean)
  if (idx > 0) {
    selectedEmail.value = list[idx - 1].email
  } else {
    selectedEmail.value = list[list.length - 1].email
  }
}

function toggleTextExpand(id) {
  expandedTexts.value[id] = !expandedTexts.value[id]
}

// Aperçu direct Word (Mammoth) ou PDF (iframe)
async function toggleDocumentPreview(file) {
  if (!file) return
  if (activeDocPreview.value && activeDocPreview.value.fileId === file.id) {
    activeDocPreview.value = null
    return
  }

  const fileName = file.formattedFileName || file.originalFileName || 'Document'
  const isPdf = (file.fileType && file.fileType.includes('pdf')) || fileName.toLowerCase().endsWith('.pdf')
  const isDocx = (file.fileType && file.fileType.includes('word')) || fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc')

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
      activeDocPreview.value.htmlContent = res.value || '<p><em>Document Word sans contenu textuel détectable.</em></p>'
      activeDocPreview.value.loading = false
    } catch (e) {
      activeDocPreview.value.error = "Aperçu HTML direct indisponible. Veuillez télécharger le document Word pour l'ouvrir."
      activeDocPreview.value.loading = false
    }
  }
}

function downloadFile(file) {
  if (file) {
    userStore.downloadSubmittedFile(file)
  }
}

// Réanalyse IA à la demande
async function runAiAnalysis(fileId) {
  isAnalyzingFile.value[fileId] = true
  try {
    await userStore.analyzeFileWithAi(fileId)
  } finally {
    isAnalyzingFile.value[fileId] = false
  }
}

// Copier l'évaluation IA dans les champs de notation enseignant
function adoptAiFeedback(item) {
  if (item.aiScore !== null && item.aiScore !== undefined) {
    item.teacherScore = item.aiScore
  }
  if (item.file?.aiCorrection?.summary) {
    item.feedback = item.file.aiCorrection.summary
  } else if (item.aiSummary) {
    item.feedback = item.aiSummary
  }
}

// Enregistrement de la note et du commentaire enseignant
function saveGrade(item) {
  if (!selectedEmail.value || !item) return
  const res = userStore.saveExerciseFeedback(
    selectedEmail.value,
    item.id,
    item.feedback || '',
    Number(item.teacherScore || 0),
    item.title
  )
  gradeSaveFeedbacks.value[item.id] = '✓ Note enregistrée et moyenne recalculée !'
  setTimeout(() => {
    delete gradeSaveFeedbacks.value[item.id]
  }, 3500)
}

function formatSize(bytes) {
  if (!bytes) return '0 Ko'
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' Ko'
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo'
}
</script>

<template>
  <div class="sdv-container">
    <!-- ÉCRAN DE DÉVERROUILLAGE ADMIN SI NON CONNECTÉ -->
    <div v-if="!isAuthenticated" class="sdv-auth-card">
      <div class="sdv-auth-icon">🔒</div>
      <h2>Accès au Dossier Étudiant</h2>
      <p>Veuillez saisir votre mot de passe enseignant pour accéder aux dossiers et évaluations.</p>

      <div class="sdv-pin-group">
        <input 
          v-model="enteredPin" 
          :type="showPin ? 'text' : 'password'" 
          placeholder="Mot de passe enseignant (hech2026)" 
          @keyup.enter="checkPin"
        />
        <button type="button" @click="showPin = !showPin" class="btn-toggle-eye">
          {{ showPin ? '👁️' : '🙈' }}
        </button>
      </div>

      <button @click="checkPin" class="btn-unlock-dossier">
        Déverrouiller le Dossier →
      </button>

      <div v-if="loginError" class="sdv-error-msg">
        {{ loginError }}
      </div>
    </div>

    <!-- DOSSIER COMPLET ÉTUDIANT (AFFICHAGE PLEINE PAGE) -->
    <div v-else class="sdv-main-content">
      <!-- BARRE DE NAVIGATION SUPÉRIEURE -->
      <div class="sdv-top-bar">
        <div class="stb-left">
          <a :href="withBase('/admin')" class="btn-back-admin" title="Retourner au tableau de bord complet">
            ← Tableau de Bord Admin
          </a>
          <span class="stb-sep">|</span>
          <span class="stb-current-label">Dossier individuel de travaux</span>
        </div>

        <div class="stb-nav-controls">
          <button @click="prevStudent" class="btn-stb-nav" title="Étudiant précédent">
            ◀ Précédent
          </button>
          <select v-model="selectedEmail" class="stb-student-select">
            <option v-for="u in users" :key="u.email" :value="u.email">
              {{ u.lastName }} {{ u.firstName }} ({{ u.email }})
            </option>
          </select>
          <button @click="nextStudent" class="btn-stb-nav" title="Étudiant suivant">
            Suivant ▶
          </button>
        </div>
      </div>

      <div v-if="currentDossier" class="sdv-dossier-card">
        <!-- HEADER DE L'ÉTUDIANT -->
        <div class="sdv-header-banner">
          <div class="shb-profile">
            <span class="shb-avatar">🎓</span>
            <div class="shb-titles">
              <h2>{{ currentDossier.user ? `${currentDossier.user.firstName} ${currentDossier.user.lastName}` : currentDossier.email }}</h2>
              <div class="shb-sub">
                <span>✉️ {{ currentDossier.email }}</span>
                <span>•</span>
                <span>📅 Inscription : {{ currentDossier.user?.registeredAt || 'En ligne' }}</span>
                <span>•</span>
                <span>📈 Progression : <strong>{{ userStore.calculateUserProgressPercent(currentDossier.email) }}%</strong></span>
              </div>
            </div>
          </div>

          <div class="shb-score-box">
            <div class="shb-score-denom">NOTE TOTALE ACADÉMIQUE</div>
            <div class="shb-score-val">
              {{ currentDossier.evaluation.totalOutOf20 }} <span class="denom">/ 20</span>
            </div>
            <div class="shb-score-pts">
              {{ currentDossier.evaluation.totalScore }} / 200 points
            </div>
          </div>
        </div>

        <!-- BANDEAU KPI & INDICATEURS -->
        <div class="sdv-kpi-bar">
          <div class="skpi-item">
            <span class="skpi-lbl">STATUT ACADÉMIQUE</span>
            <div :class="['skpi-badge', currentDossier.evaluation?.isPassing ? 'pass' : 'ongoing']">
              {{ currentDossier.evaluation?.isPassing ? '✓ Admis' : '⏳ En cours de validation' }}
            </div>
          </div>
          <div class="skpi-item">
            <span class="skpi-lbl">PARTIE 1 : PLATEFORME</span>
            <div class="skpi-val">
              <strong>{{ currentDossier.evaluation?.pillar1?.total || 0 }}</strong> / 100 pts
              <small>({{ currentDossier.evaluation?.pillar1?.quizPoints || 0 }} pts Quiz + {{ currentDossier.evaluation?.pillar1?.exercisesTotal || 0 }} pts Ateliers)</small>
            </div>
          </div>
          <div class="skpi-item">
            <span class="skpi-lbl">PARTIE 2 : PROJET JEU</span>
            <div class="skpi-val">
              <strong>{{ currentDossier.evaluation?.pillar2?.total || 0 }}</strong> / 100 pts
            </div>
          </div>
          <div class="skpi-item">
            <span class="skpi-lbl">TRAVAUX DÉPOSÉS</span>
            <div class="skpi-val">
              <strong>{{ currentDossier.items.filter(i => i.completed).length }}</strong> / {{ currentDossier.items.length }}
            </div>
          </div>
        </div>

        <!-- BARRE DE FILTRES -->
        <div class="sdv-filter-bar">
          <button 
            v-for="f in [
              { id: 'all', label: `Tous les travaux (${currentDossier.items.length})` },
              { id: 'part1', label: 'Partie 1 : Ateliers (8)' },
              { id: 'part2', label: 'Partie 2 : Projet Jeu (8)' },
              { id: 'quiz', label: 'Quiz en ligne (7)' },
              { id: 'submitted_only', label: 'Remis uniquement' }
            ]" 
            :key="f.id"
            :class="['btn-filter-dossier', { active: dossierFilter === f.id }]"
            @click="dossierFilter = f.id"
          >
            {{ f.label }}
          </button>
        </div>

        <!-- LISTE DÉROULANTE DES ÉLÉMENTS DU DOSSIER -->
        <div class="sdv-items-list">
          <div 
            v-for="item in filteredItems" 
            :key="item.id"
            class="sdv-item-card"
            :class="{ 'item-done': item.completed, 'item-pending': !item.completed }"
          >
            <!-- ENTÊTE DE L'ITEM -->
            <div class="sic-header">
              <div class="sic-title-block">
                <div class="sic-badges">
                  <span :class="['badge-category', item.category]">
                    {{ item.category === 'quiz' ? 'Quiz Diagnostic' : (item.part === 2 ? 'Partie 2 • Projet Jeu' : 'Partie 1 • Atelier') }}
                  </span>
                  <span :class="['badge-status', item.completed ? 'ok' : 'pending']">
                    {{ item.completed ? '✓ Rendu' : '⏳ Non rendu' }}
                  </span>
                </div>
                <h4 class="sic-title">{{ item.title }}</h4>
              </div>

              <div class="sic-score-block">
                <div class="sic-cur-score">
                  Note actuelle : <strong>{{ item.score }}</strong> / {{ item.maxPoints }} pts
                </div>
                <div v-if="item.teacherFeedback" class="sic-graded-tag">
                  👨‍🏫 Évalué par l'enseignant
                </div>
              </div>
            </div>

            <!-- CONTENU SPÉCIFIQUE QUIZ -->
            <div v-if="item.category === 'quiz'" class="sic-quiz-content">
              <div v-if="!item.quizAttempts || item.quizAttempts.length === 0" class="sic-empty-quiz">
                Aucune tentative réalisée par l'étudiant pour ce quiz.
              </div>
              <div v-else class="sic-quiz-attempts">
                <div v-for="att in item.quizAttempts" :key="att.id" class="quiz-att-row">
                  <div class="qar-date">Tentative du {{ att.submittedAt }}</div>
                  <div class="qar-score">
                    <strong>{{ att.score }}</strong> / {{ att.totalPoints }} pts ({{ att.percentage }}%)
                  </div>
                </div>
              </div>
            </div>

            <!-- CONTENU EXERCICE / ATELIER / PROJET -->
            <div v-else class="sic-work-content">
              <!-- 1. TRAVAIL DÉPOSÉ (TEXTE OU FICHIER) -->
              <div class="sic-student-work">
                <div class="ssw-header">
                  <strong>📝 Travail remis par l'étudiant :</strong>
                  <span v-if="item.file" class="ssw-date">Déposé le {{ item.file.submittedAt }}</span>
                </div>

                <!-- Réponse textuelle éventuelle -->
                <div v-if="item.submission && (item.submission.answer || item.submission.content)" class="ssw-text-block">
                  <div class="stb-header">
                    <span>💬 Réponse rédigée en ligne :</span>
                    <button @click="toggleTextExpand(item.id)" class="btn-text-expand">
                      {{ expandedTexts[item.id] ? 'Réduire ▲' : 'Agrandir ▼' }}
                    </button>
                  </div>
                  <div :class="['stb-content', expandedTexts[item.id] ? 'expanded' : 'collapsed']">
                    {{ item.submission.answer || item.submission.content }}
                  </div>
                </div>

                <!-- Fichier Word ou PDF déposé -->
                <div v-if="item.file" class="ssw-file-box">
                  <div class="sfb-left">
                    <span class="sfb-icon">
                      {{ (item.file.fileType && item.file.fileType.includes('pdf')) || (item.file.formattedFileName || '').endsWith('.pdf') ? '📕' : '📘' }}
                    </span>
                    <div class="sfb-info">
                      <div class="sfb-name"><strong>{{ item.file.formattedFileName || item.file.originalFileName }}</strong></div>
                      <div class="sfb-meta">{{ formatSize(item.file.fileSize) }} • Reçu le {{ item.file.submittedAt }}</div>
                    </div>
                  </div>

                  <div class="sfb-actions">
                    <button 
                      @click="toggleDocumentPreview(item.file)" 
                      :class="['btn-preview-doc', activeDocPreview?.fileId === item.file.id ? 'active' : '']"
                      title="Afficher le document directement dans la page pour lecture"
                    >
                      {{ activeDocPreview?.fileId === item.file.id ? '✕ Masquer la lecture' : '📖 Visualiser le document (Word / PDF)' }}
                    </button>
                    <button 
                      @click="downloadFile(item.file)" 
                      class="btn-dl-file" 
                      title="Télécharger le fichier original"
                    >
                      📥 Télécharger
                    </button>
                  </div>
                </div>

                <!-- VISUALISEUR INTÉGRÉ WORD / PDF DIRECT -->
                <div v-if="activeDocPreview?.fileId === item.file?.id" class="sdv-viewer-container">
                  <div class="svc-header">
                    <span>Aperçu direct : <strong>{{ activeDocPreview.fileName }}</strong> ({{ activeDocPreview.type.toUpperCase() }})</span>
                    <button @click="activeDocPreview = null" class="svc-close" title="Fermer">✕</button>
                  </div>

                  <!-- PDF via iframe -->
                  <div v-if="activeDocPreview.type === 'pdf'" class="svc-pdf-wrapper">
                    <iframe :src="activeDocPreview.dataUrl" class="svc-pdf-frame"></iframe>
                  </div>

                  <!-- Word via Mammoth HTML -->
                  <div v-else-if="activeDocPreview.type === 'docx'" class="svc-docx-wrapper">
                    <div v-if="activeDocPreview.loading" class="svc-loading">
                      ⏳ Conversion du document Word en cours...
                    </div>
                    <div v-else-if="activeDocPreview.error" class="svc-error">
                      ⚠️ {{ activeDocPreview.error }}
                    </div>
                    <div v-else class="svc-docx-sheet" v-html="activeDocPreview.htmlContent"></div>
                  </div>

                  <div v-else class="svc-fallback">
                    Format non supporté pour l'aperçu direct. Veuillez télécharger le fichier.
                  </div>
                </div>

                <div v-if="!item.file && (!item.submission || (!item.submission.answer && !item.submission.content))" class="ssw-empty">
                  ℹ️ Aucun document déposé ni texte rédigé par l'étudiant pour cet atelier.
                </div>
              </div>

              <!-- 2. BOÎTE DE FEEDBACK IA -->
              <div class="sic-ai-feedback-box">
                <div class="saf-header">
                  <div class="saf-left">
                    <span class="saf-icon">🤖</span>
                    <span class="saf-title">Diagnostic & Feedback IA</span>
                    <span class="saf-model">{{ item.file?.aiCorrection?.modelUsed || 'Assistant Pédagogique FMTTN' }}</span>
                  </div>
                  <div class="saf-right">
                    <div class="saf-score-tag">
                      Note suggérée : <strong>{{ item.completed ? (item.file?.aiCorrection?.suggestedScore ?? item.aiScore ?? 0) : 0 }} / 10 pts</strong>
                    </div>
                    <button 
                      v-if="item.file"
                      @click="runAiAnalysis(item.file.id)"
                      :disabled="isAnalyzingFile[item.file.id]"
                      class="btn-reanalyze-ai"
                      title="Relancer l'évaluation didactique IA pour ce document"
                    >
                      <span v-if="isAnalyzingFile[item.file.id]">⏳ Analyse...</span>
                      <span v-else>🔄 Réévaluer avec l'IA</span>
                    </button>
                    <button 
                      v-if="item.file?.aiCorrection"
                      @click="adoptAiFeedback(item)"
                      class="btn-adopt-ai"
                      title="Copier la note et l'analyse de l'IA dans l'évaluation enseignant ci-dessous"
                    >
                      ✨ Adopter l'évaluation IA
                    </button>
                  </div>
                </div>

                <!-- Synthèse générale -->
                <div class="saf-summary">
                  <strong>Synthèse didactique :</strong>
                  <p>« {{ item.completed ? (item.file?.aiCorrection?.summary || item.aiSummary || 'Travail conforme aux exigences du cours.') : 'Exercice non rendu : note automatique de 0/10.' }} »</p>
                </div>

                <!-- Grille critériée détaillée -->
                <details v-if="item.file?.aiCorrection?.criteriaTable?.length" class="saf-criteria-details">
                  <summary>📊 Grille critériée détaillée de l'IA ({{ item.file.aiCorrection.criteriaTable.length }} critères)</summary>
                  <table class="saf-criteria-table">
                    <thead>
                      <tr>
                        <th>Critère didactique</th>
                        <th style="width: 90px; text-align: center;">Note</th>
                        <th>Justification pédagogique</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="c in item.file.aiCorrection.criteriaTable" :key="c.name">
                        <td><strong>{{ c.name }}</strong></td>
                        <td style="text-align: center;"><strong>{{ c.score }}</strong> / {{ c.maxScore }}</td>
                        <td>{{ c.justification }}</td>
                      </tr>
                    </tbody>
                  </table>
                </details>

                <!-- Points forts & améliorations -->
                <div v-if="item.file?.aiCorrection" class="saf-points-grid">
                  <div v-if="item.file.aiCorrection.strengths?.length" class="saf-col strengths">
                    <h6>✅ Points forts identifiés :</h6>
                    <ul>
                      <li v-for="(str, sIdx) in item.file.aiCorrection.strengths" :key="'s-' + sIdx">{{ str }}</li>
                    </ul>
                  </div>
                  <div v-if="item.file.aiCorrection.improvements?.length" class="saf-col improvements">
                    <h6>💡 Pistes d'amélioration :</h6>
                    <ul>
                      <li v-for="(imp, iIdx) in item.file.aiCorrection.improvements" :key="'i-' + iIdx">{{ imp }}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- 3. ZONE DE NOTATION ET FEEDBACK ENSEIGNANT -->
              <div class="sic-teacher-grading-box">
                <div class="stg-header">
                  <strong>👨‍🏫 Évaluation Enseignant pour cette activité :</strong>
                </div>

                <div class="stg-body">
                  <div class="stg-score-row">
                    <label>Note officielle accordée :</label>
                    <input 
                      v-model.number="item.teacherScore" 
                      type="number" 
                      step="0.5" 
                      min="0" 
                      :max="item.maxPoints"
                      class="stg-score-input"
                    />
                    <span class="stg-denom">/ {{ item.maxPoints }} points</span>
                  </div>

                  <div class="stg-comment-row">
                    <label>Commentaire & observations pédagogiques :</label>
                    <textarea 
                      v-model="item.feedback" 
                      rows="2" 
                      placeholder="Saisissez un commentaire formatif pour l'étudiant..."
                      class="stg-textarea"
                    ></textarea>
                  </div>

                  <div class="stg-actions-row">
                    <button @click="saveGrade(item)" class="btn-save-grade">
                      💾 Enregistrer la note
                    </button>
                    <span v-if="gradeSaveFeedbacks[item.id]" class="stg-save-msg">
                      {{ gradeSaveFeedbacks[item.id] }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sdv-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

/* CARTE DE DÉVERROUILLAGE */
.sdv-auth-card {
  max-width: 480px;
  margin: 3rem auto;
  padding: 2.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.sdv-auth-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.sdv-auth-card h2 {
  margin-top: 0;
  color: var(--vp-c-brand-1);
}

.sdv-auth-card p {
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.sdv-pin-group {
  display: flex;
  gap: 8px;
  margin-bottom: 1rem;
}

.sdv-pin-group input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--vp-c-bg);
  color: inherit;
}

.btn-toggle-eye {
  padding: 10px 14px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
}

.btn-unlock-dossier {
  width: 100%;
  padding: 12px;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-unlock-dossier:hover {
  opacity: 0.9;
}

.sdv-error-msg {
  color: #dc2626;
  margin-top: 1rem;
  font-weight: 600;
  font-size: 0.9rem;
}

/* TOP BAR */
.sdv-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.8rem 1.2rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.stb-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-back-admin {
  color: var(--vp-c-brand-1) !important;
  font-weight: 700;
  text-decoration: none !important;
  font-size: 0.92rem;
}

.btn-back-admin:hover {
  text-decoration: underline !important;
}

.stb-sep {
  color: var(--vp-c-divider);
}

.stb-current-label {
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
}

.stb-nav-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-stb-nav {
  padding: 6px 12px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}

.stb-student-select {
  padding: 6px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: inherit;
  font-size: 0.9rem;
  font-weight: 600;
}

/* DOSSIER CARD */
.sdv-dossier-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.sdv-header-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.25rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--vp-c-divider);
  margin-bottom: 1.25rem;
}

.shb-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.shb-avatar {
  font-size: 2.2rem;
}

.shb-titles h2 {
  margin: 0 0 0.35rem 0;
  color: var(--vp-c-brand-1);
  font-size: 1.5rem;
}

.shb-sub {
  display: flex;
  gap: 0.6rem;
  color: var(--vp-c-text-2);
  font-size: 0.86rem;
  flex-wrap: wrap;
}

.shb-score-box {
  background: #f0fdf4;
  border: 1.5px solid #86efac;
  border-radius: 12px;
  padding: 0.9rem 1.4rem;
  text-align: right;
}

.shb-score-denom {
  font-size: 0.74rem;
  font-weight: 700;
  color: #166534;
  letter-spacing: 0.05em;
}

.shb-score-val {
  font-size: 1.7rem;
  font-weight: 800;
  color: #15803d;
  line-height: 1.2;
}

.shb-score-val .denom {
  font-size: 1.1rem;
  opacity: 0.75;
}

.shb-score-pts {
  font-size: 0.8rem;
  color: #166534;
}

/* KPI BAR */
.sdv-kpi-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  background: var(--vp-c-bg-soft);
  padding: 1rem 1.2rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  margin-bottom: 1.25rem;
}

.skpi-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.skpi-lbl {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  letter-spacing: 0.05em;
}

.skpi-badge {
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  width: fit-content;
}

.skpi-badge.pass {
  background: #dcfce7;
  color: #15803d;
}

.skpi-badge.ongoing {
  background: #fef3c7;
  color: #92400e;
}

.skpi-val {
  font-size: 0.95rem;
}

.skpi-val small {
  display: block;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}

/* FILTER BAR */
.sdv-filter-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.btn-filter-dossier {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-filter-dossier.active {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
}

/* LIST OF ITEMS */
.sdv-items-list {
  display: grid;
  gap: 1.5rem;
}

.sdv-item-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.sdv-item-card.item-done {
  border-left: 4px solid #10b981;
}

.sdv-item-card.item-pending {
  border-left: 4px solid #e5e7eb;
}

.sic-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.sic-badges {
  display: flex;
  gap: 6px;
  margin-bottom: 0.35rem;
}

.badge-category {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  background: #e0e7ff;
  color: #3730a3;
}

.badge-status {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
}

.badge-status.ok {
  background: #ecfdf5;
  color: #047857;
}

.badge-status.pending {
  background: #f3f4f6;
  color: #6b7280;
}

.sic-title {
  margin: 0;
  font-size: 1.1rem;
  color: var(--vp-c-text-1);
}

.sic-score-block {
  text-align: right;
}

.sic-cur-score {
  font-size: 1.05rem;
  color: var(--vp-c-text-1);
}

.sic-cur-score strong {
  color: var(--vp-c-brand-1);
  font-size: 1.2rem;
}

.sic-graded-tag {
  font-size: 0.76rem;
  color: #047857;
  font-weight: 600;
}

/* QUIZ CONTENT */
.sic-quiz-attempts {
  display: grid;
  gap: 6px;
}

.quiz-att-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  font-size: 0.88rem;
}

.qar-score {
  color: #10b981;
}

.sic-empty-quiz {
  font-style: italic;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

/* STUDENT WORK */
.sic-student-work {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.ssw-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.6rem;
  font-size: 0.9rem;
}

.ssw-date {
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
}

.ssw-text-block {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 0.8rem;
  margin-bottom: 0.8rem;
}

.stb-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
}

.btn-text-expand {
  background: none;
  border: none;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
}

.stb-content {
  font-size: 0.88rem;
  white-space: pre-wrap;
  line-height: 1.45;
}

.stb-content.collapsed {
  max-height: 60px;
  overflow: hidden;
}

.ssw-file-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.8rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.8rem 1rem;
}

.sfb-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.sfb-icon {
  font-size: 1.4rem;
}

.sfb-name {
  font-size: 0.92rem;
  color: var(--vp-c-brand-1);
}

.sfb-meta {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
}

.sfb-actions {
  display: flex;
  gap: 8px;
}

.btn-preview-doc {
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-preview-doc.active {
  background: #1e3a8a;
}

.btn-dl-file {
  padding: 6px 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.ssw-empty {
  color: var(--vp-c-text-2);
  font-style: italic;
  font-size: 0.88rem;
}

/* VIEWER INTÉGRÉ */
.sdv-viewer-container {
  margin-top: 0.8rem;
  border: 2px solid var(--vp-c-brand-1);
  border-radius: 8px;
  background: var(--vp-c-bg);
  overflow: hidden;
}

.svc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--vp-c-brand-1);
  color: white;
  padding: 6px 12px;
  font-size: 0.84rem;
  font-weight: 600;
}

.svc-close {
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 700;
}

.svc-pdf-frame {
  width: 100%;
  height: 520px;
  border: none;
}

.svc-docx-sheet {
  max-height: 520px;
  overflow-y: auto;
  padding: 1.5rem;
  background: white;
  color: #1e293b;
  line-height: 1.6;
}

.svc-loading, .svc-error, .svc-fallback {
  padding: 1.5rem;
  text-align: center;
}

/* AI FEEDBACK BOX */
.sic-ai-feedback-box {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.saf-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-bottom: 0.6rem;
}

.saf-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.saf-icon {
  font-size: 1.2rem;
}

.saf-title {
  font-weight: 800;
  font-size: 0.92rem;
  color: #312e81;
}

.saf-model {
  font-size: 0.72rem;
  background: #e0e7ff;
  color: #4338ca;
  padding: 2px 7px;
  border-radius: 4px;
  font-weight: 600;
}

.saf-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.saf-score-tag {
  font-size: 0.85rem;
  color: #312e81;
}

.saf-score-tag strong {
  font-size: 1rem;
  color: #4338ca;
}

.btn-reanalyze-ai {
  padding: 4px 10px;
  background: white;
  border: 1px solid #c7d2fe;
  color: #4338ca;
  font-size: 0.78rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
}

.btn-adopt-ai {
  padding: 4px 10px;
  background: #0284c7;
  color: white;
  border: none;
  font-size: 0.78rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
}

.saf-summary {
  font-size: 0.9rem;
  background: white;
  padding: 0.7rem 0.9rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  margin-bottom: 0.8rem;
  color: #1e293b;
}

.saf-criteria-details {
  margin-bottom: 0.8rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.5rem 0.8rem;
}

.saf-criteria-details summary {
  font-size: 0.84rem;
  font-weight: 700;
  color: #4338ca;
  cursor: pointer;
}

.saf-criteria-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.6rem;
  font-size: 0.82rem;
}

.saf-criteria-table th, .saf-criteria-table td {
  border: 1px solid #e2e8f0;
  padding: 6px 8px;
  text-align: left;
}

.saf-criteria-table th {
  background: #f8fafc;
}

.saf-points-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.8rem;
}

.saf-col {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
}

.saf-col h6 {
  margin: 0 0 0.35rem 0;
  font-size: 0.82rem;
}

.saf-col ul {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.8rem;
}

/* TEACHER GRADING BOX */
.sic-teacher-grading-box {
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 8px;
  padding: 1rem;
}

.stg-header {
  font-size: 0.88rem;
  color: #166534;
  margin-bottom: 0.6rem;
}

.stg-score-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.6rem;
  font-size: 0.88rem;
}

.stg-score-input {
  width: 70px;
  padding: 4px 8px;
  border: 1px solid #86efac;
  border-radius: 6px;
  font-weight: 700;
  font-size: 1rem;
  text-align: center;
}

.stg-denom {
  font-size: 0.85rem;
  color: #166534;
}

.stg-comment-row label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: #166534;
  margin-bottom: 4px;
}

.stg-textarea {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #86efac;
  border-radius: 6px;
  font-size: 0.86rem;
  font-family: inherit;
  box-sizing: border-box;
}

.stg-actions-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 0.6rem;
}

.btn-save-grade {
  padding: 6px 14px;
  background: #059669;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}

.stg-save-msg {
  font-size: 0.82rem;
  color: #047857;
  font-weight: 600;
}
</style>
