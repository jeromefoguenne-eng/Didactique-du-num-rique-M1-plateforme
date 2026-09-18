<script setup>
import { ref, computed, onMounted } from 'vue'
import { userStore } from '../stores/userStore'

// State de l'étudiant
const inlineFirst = ref('')
const inlineLast = ref('')
const inlineEmail = ref('')
const currentUser = computed(() => userStore.currentUser)

// Volet 1 : Évaluation du cours (Échelle 1 à 5)
const courseRatings = ref({
  theory: 4,        // Contenus théoriques (DigComp, FMTTN, ludopédagogie)
  fablab: 5,        // Ateliers FabLab (découpe laser, 3D)
  ai: 4,            // Utilisation de l'IA (prompts, visuels)
  media: 4,         // Éducation aux médias (photo, vidéo)
  platform: 5,      // Plateforme en ligne & ressources
  pacing: 4,        // Clarté des consignes & rythme
  support: 5        // Disponibilité & accompagnement enseignant
})

const courseFeedback = ref({
  strengths: '',    // Points forts & apports majeurs
  difficulties: '', // Difficultés & points à améliorer
  suggestions: ''   // Suggestions pour l'avenir
})

// Volet 2 : Auto-évaluation de l'étudiant (Échelle 1 à 4)
const selfRatings = ref({
  fmttn: 3,         // Maîtrise du référentiel FMTTN
  pedagogy: 3,      // Conception didactique active
  tools: 4,         // Outils techniques & FabLab
  critical: 4,      // Esprit critique & éthique IA
  teamwork: 4,      // Investissement & travail d'équipe
  iteration: 4      // Posture réflexive & droit à l'erreur
})

const selfReflexivity = ref({
  progress: '',     // Progrès majeurs accomplis
  toImprove: '',    // Compétences à consolider
  selfGrade: 16,    // Note réflexive /20
  selfGradeReason: '' // Justification de la note
})

const saveStatus = ref('')
const isSaved = ref(false)

const STORAGE_KEY = 'hech_course_evaluation_'

onMounted(() => {
  if (currentUser.value) {
    loadEvaluation(currentUser.value.email)
  }
})

function loadEvaluation(email) {
  if (typeof window === 'undefined' || !email) return
  try {
    const saved = localStorage.getItem(STORAGE_KEY + email.toLowerCase())
    if (saved) {
      const data = JSON.parse(saved)
      if (data.courseRatings) courseRatings.value = { ...courseRatings.value, ...data.courseRatings }
      if (data.courseFeedback) courseFeedback.value = { ...courseFeedback.value, ...data.courseFeedback }
      if (data.selfRatings) selfRatings.value = { ...selfRatings.value, ...data.selfRatings }
      if (data.selfReflexivity) selfReflexivity.value = { ...selfReflexivity.value, ...data.selfReflexivity }
      isSaved.value = true
    }
  } catch (e) {
    console.warn('Erreur lors du chargement de l\'évaluation', e)
  }
}

function handleSave() {
  let userEmail = currentUser.value?.email
  let userName = currentUser.value ? `${currentUser.value.firstName} ${currentUser.value.lastName}` : ''

  if (!userEmail) {
    if (!inlineFirst.value || !inlineLast.value || !inlineEmail.value) {
      alert('Veuillez renseigner votre prénom, nom et adresse email pour signer votre évaluation.')
      return
    }
    userStore.register(inlineFirst.value, inlineLast.value, inlineEmail.value)
    userEmail = inlineEmail.value
    userName = `${inlineFirst.value} ${inlineLast.value}`
  }

  const payload = {
    userEmail,
    userName,
    savedAt: new Date().toISOString(),
    courseRatings: courseRatings.value,
    courseFeedback: courseFeedback.value,
    selfRatings: selfRatings.value,
    selfReflexivity: selfReflexivity.value
  }

  // Sauvegarde locale
  try {
    localStorage.setItem(STORAGE_KEY + userEmail.toLowerCase(), JSON.stringify(payload))
  } catch (e) {
    console.warn('Erreur localStorage', e)
  }

  // Formatage du compte-rendu pour le store étudiant & enseignant
  const summaryText = `--- ÉVALUATION DU COURS ---
1. Contenus théoriques : ${courseRatings.value.theory}/5
2. Ateliers FabLab : ${courseRatings.value.fablab}/5
3. Intégration IA : ${courseRatings.value.ai}/5
4. Éducation aux médias : ${courseRatings.value.media}/5
5. Plateforme en ligne : ${courseRatings.value.platform}/5
6. Clarté & rythme : ${courseRatings.value.pacing}/5
7. Accompagnement : ${courseRatings.value.support}/5

• Points forts : ${courseFeedback.value.strengths || 'Non renseigné'}
• Difficultés : ${courseFeedback.value.difficulties || 'Non renseigné'}
• Suggestions : ${courseFeedback.value.suggestions || 'Non renseigné'}

--- AUTO-ÉVALUATION DE L'ÉTUDIANT ---
1. Maîtrise FMTTN : ${selfRatings.value.fmttn}/4
2. Conception didactique : ${selfRatings.value.pedagogy}/4
3. Outils & FabLab : ${selfRatings.value.tools}/4
4. Esprit critique IA : ${selfRatings.value.critical}/4
5. Travail d'équipe : ${selfRatings.value.teamwork}/4
6. Posture réflexive : ${selfRatings.value.iteration}/4

• Progrès majeurs : ${selfReflexivity.value.progress || 'Non renseigné'}
• Compétences à consolider : ${selfReflexivity.value.toImprove || 'Non renseigné'}
• Note réflexive estimée : ${selfReflexivity.value.selfGrade}/20
• Justification de la note : ${selfReflexivity.value.selfGradeReason || 'Non renseigné'}`

  userStore.saveSubmission('evaluation-cours-07', 'Point 7 : Évaluation du cours & Auto-évaluation', summaryText)

  isSaved.value = true
  saveStatus.value = '✓ Vos évaluations ont été enregistrées avec succès et transmises à l\'enseignant !'
  setTimeout(() => {
    saveStatus.value = ''
  }, 5000)
}
</script>

<template>
  <div class="eval-container">
    <!-- Identification de l'étudiant -->
    <div class="user-identity-card">
      <div v-if="currentUser" class="auth-logged">
        <div class="logged-avatar">👤</div>
        <div>
          <div class="logged-name">{{ currentUser.firstName }} {{ currentUser.lastName }}</div>
          <div class="logged-email">{{ currentUser.email }}</div>
        </div>
        <span class="logged-badge">✓ Profil étudiant actif</span>
      </div>

      <div v-else class="auth-guest">
        <p class="guest-title">📋 Identifiez-vous pour valider votre évaluation :</p>
        <div class="guest-inputs">
          <input v-model="inlineFirst" type="text" placeholder="Prénom" class="input-field" />
          <input v-model="inlineLast" type="text" placeholder="Nom" class="input-field" />
          <input v-model="inlineEmail" type="email" placeholder="adresse@student.hech.be" class="input-field" />
        </div>
      </div>
    </div>

    <!-- PARTIE 1 : ÉVALUATION DU COURS -->
    <div class="eval-section course-eval">
      <div class="section-header">
        <span class="section-badge badge-blue">Volet 1</span>
        <h2 class="section-title">🎓 Évaluation du Cours de Didactique du Numérique</h2>
      </div>
      <p class="section-desc">
        Votre avis constructif est essentiel pour faire évoluer ce cours. Évaluez les différents dispositifs pédagogiques vécus cette année (1 = Très insatisfaisant / Peu pertinent → 5 = Excellent / Très enrichissant) :
      </p>

      <div class="rating-grid">
        <div class="rating-item">
          <div class="rating-label">
            <strong>1. Contenus théoriques</strong>
            <span>DigComp, FMTTN, théories du jeu (Huizinga, Caillois)</span>
          </div>
          <div class="stars-selector">
            <button 
              v-for="val in [1, 2, 3, 4, 5]" 
              :key="val" 
              type="button"
              :class="['star-btn', { active: courseRatings.theory === val }]"
              @click="courseRatings.theory = val"
            >
              {{ val }} ★
            </button>
          </div>
        </div>

        <div class="rating-item">
          <div class="rating-label">
            <strong>2. Ateliers pratiques au FabLab</strong>
            <span>Prototypage physique, découpeuse laser, impression 3D</span>
          </div>
          <div class="stars-selector">
            <button 
              v-for="val in [1, 2, 3, 4, 5]" 
              :key="val" 
              type="button"
              :class="['star-btn', { active: courseRatings.fablab === val }]"
              @click="courseRatings.fablab = val"
            >
              {{ val }} ★
            </button>
          </div>
        </div>

        <div class="rating-item">
          <div class="rating-label">
            <strong>3. Intégration de l'Intelligence Artificielle</strong>
            <span>Prompt design, génération de cartes, posture critique</span>
          </div>
          <div class="stars-selector">
            <button 
              v-for="val in [1, 2, 3, 4, 5]" 
              :key="val" 
              type="button"
              :class="['star-btn', { active: courseRatings.ai === val }]"
              @click="courseRatings.ai = val"
            >
              {{ val }} ★
            </button>
          </div>
        </div>

        <div class="rating-item">
          <div class="rating-label">
            <strong>4. Éducation aux médias & audiovisuel</strong>
            <span>Techniques photo (surcadrage, tiers) et capsule vidéo</span>
          </div>
          <div class="stars-selector">
            <button 
              v-for="val in [1, 2, 3, 4, 5]" 
              :key="val" 
              type="button"
              :class="['star-btn', { active: courseRatings.media === val }]"
              @click="courseRatings.media = val"
            >
              {{ val }} ★
            </button>
          </div>
        </div>

        <div class="rating-item">
          <div class="rating-label">
            <strong>5. Plateforme en ligne & ressources</strong>
            <span>Notes de cours, quiz diagnostiques, vidéos intégrées</span>
          </div>
          <div class="stars-selector">
            <button 
              v-for="val in [1, 2, 3, 4, 5]" 
              :key="val" 
              type="button"
              :class="['star-btn', { active: courseRatings.platform === val }]"
              @click="courseRatings.platform = val"
            >
              {{ val }} ★
            </button>
          </div>
        </div>

        <div class="rating-item">
          <div class="rating-label">
            <strong>6. Clarté des consignes & rythme</strong>
            <span>Progressivité des étapes, équilibre de la charge de travail</span>
          </div>
          <div class="stars-selector">
            <button 
              v-for="val in [1, 2, 3, 4, 5]" 
              :key="val" 
              type="button"
              :class="['star-btn', { active: courseRatings.pacing === val }]"
              @click="courseRatings.pacing = val"
            >
              {{ val }} ★
            </button>
          </div>
        </div>

        <div class="rating-item">
          <div class="rating-label">
            <strong>7. Accompagnement de l'enseignant</strong>
            <span>Disponibilité, écoute, feedbacks formateurs en atelier</span>
          </div>
          <div class="stars-selector">
            <button 
              v-for="val in [1, 2, 3, 4, 5]" 
              :key="val" 
              type="button"
              :class="['star-btn', { active: courseRatings.support === val }]"
              @click="courseRatings.support = val"
            >
              {{ val }} ★
            </button>
          </div>
        </div>
      </div>

      <!-- Retours qualitatifs cours -->
      <div class="questions-block">
        <div class="form-group">
          <label class="form-label">
            💡 <strong>Points forts :</strong> Quels aspects du cours vous ont semblé les plus formateurs ou enthousiasmants ?
          </label>
          <textarea 
            v-model="courseFeedback.strengths" 
            class="textarea-field" 
            rows="3" 
            placeholder="Ex : Le fait de concevoir un objet physique concret au FabLab, la découverte d'outils IA exploitables en classe..."
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">
            ⚠️ <strong>Difficultés & Freins :</strong> Quelles ont été vos principales difficultés durant le cours ?
          </label>
          <textarea 
            v-model="courseFeedback.difficulties" 
            class="textarea-field" 
            rows="3" 
            placeholder="Ex : La gestion du temps pour les tournages vidéo, la prise en main des logiciels vectoriels..."
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">
            🌱 <strong>Suggestions :</strong> Que conseilleriez-vous d'ajouter, modifier ou alléger pour les prochains étudiants ?
          </label>
          <textarea 
            v-model="courseFeedback.suggestions" 
            class="textarea-field" 
            rows="3" 
            placeholder="Vos suggestions libres pour perfectionner le dispositif pédagogique..."
          ></textarea>
        </div>
      </div>
    </div>

    <!-- PARTIE 2 : AUTO-ÉVALUATION DE L'ÉTUDIANT -->
    <div class="eval-section self-eval">
      <div class="section-header">
        <span class="section-badge badge-green">Volet 2</span>
        <h2 class="section-title">🌟 Auto-évaluation Individuelle & Démarche Réflexive</h2>
      </div>
      <p class="section-desc">
        Positionnez-vous sur l'acquisition de vos compétences professionnelles et didactiques (1 = Débutant / À consolider, 2 = En cours d'acquisition, 3 = Acquis, 4 = Maîtrisé / Capable de transmettre) :
      </p>

      <div class="rubric-grid">
        <div class="rubric-card">
          <div class="rubric-header">
            <strong>1. Référentiel FMTTN & Curricula</strong>
            <span class="score-badge">{{ selfRatings.fmttn }}/4</span>
          </div>
          <p class="rubric-desc">Capacité à mobiliser les 4 champs d'apprentissage et la progression spiralaire dans une leçon.</p>
          <div class="level-selector">
            <button 
              v-for="(label, idx) in ['Débutant', 'En cours', 'Acquis', 'Maîtrisé']" 
              :key="idx" 
              type="button"
              :class="['level-btn', { selected: selfRatings.fmttn === idx + 1 }]"
              @click="selfRatings.fmttn = idx + 1"
            >
              {{ label }}
            </button>
          </div>
        </div>

        <div class="rubric-card">
          <div class="rubric-header">
            <strong>2. Ingénierie didactique active</strong>
            <span class="score-badge">{{ selfRatings.pedagogy }}/4</span>
          </div>
          <p class="rubric-desc">Conception d'un dispositif ludo-éducatif cohérent, règles équilibrées et alignement Bloom.</p>
          <div class="level-selector">
            <button 
              v-for="(label, idx) in ['Débutant', 'En cours', 'Acquis', 'Maîtrisé']" 
              :key="idx" 
              type="button"
              :class="['level-btn', { selected: selfRatings.pedagogy === idx + 1 }]"
              @click="selfRatings.pedagogy = idx + 1"
            >
              {{ label }}
            </button>
          </div>
        </div>

        <div class="rubric-card">
          <div class="rubric-header">
            <strong>3. Chaîne de fabrication & outils</strong>
            <span class="score-badge">{{ selfRatings.tools }}/4</span>
          </div>
          <p class="rubric-desc">Autonomie sur les outils numériques : PAO Canva, CAO vectorielle/3D, tournage et montage.</p>
          <div class="level-selector">
            <button 
              v-for="(label, idx) in ['Débutant', 'En cours', 'Acquis', 'Maîtrisé']" 
              :key="idx" 
              type="button"
              :class="['level-btn', { selected: selfRatings.tools === idx + 1 }]"
              @click="selfRatings.tools = idx + 1"
            >
              {{ label }}
            </button>
          </div>
        </div>

        <div class="rubric-card">
          <div class="rubric-header">
            <strong>4. Esprit critique & Éthique du numérique</strong>
            <span class="score-badge">{{ selfRatings.critical }}/4</span>
          </div>
          <p class="rubric-desc">Vérification de l'information, recul face aux biais des IA génératives et droit à l'image.</p>
          <div class="level-selector">
            <button 
              v-for="(label, idx) in ['Débutant', 'En cours', 'Acquis', 'Maîtrisé']" 
              :key="idx" 
              type="button"
              :class="['level-btn', { selected: selfRatings.critical === idx + 1 }]"
              @click="selfRatings.critical = idx + 1"
            >
              {{ label }}
            </button>
          </div>
        </div>

        <div class="rubric-card">
          <div class="rubric-header">
            <strong>5. Coopération & Travail en équipe</strong>
            <span class="score-badge">{{ selfRatings.teamwork }}/4</span>
          </div>
          <p class="rubric-desc">Régularité, fiabilité, respect des engagements et communication constructive avec les pairs.</p>
          <div class="level-selector">
            <button 
              v-for="(label, idx) in ['Débutant', 'En cours', 'Acquis', 'Maîtrisé']" 
              :key="idx" 
              type="button"
              :class="['level-btn', { selected: selfRatings.teamwork === idx + 1 }]"
              @click="selfRatings.teamwork = idx + 1"
            >
              {{ label }}
            </button>
          </div>
        </div>

        <div class="rubric-card">
          <div class="rubric-header">
            <strong>6. Démarche itérative & Droit à l'erreur</strong>
            <span class="score-badge">{{ selfRatings.iteration }}/4</span>
          </div>
          <p class="rubric-desc">Capacité à exploiter les retours de playtests pour tester, corriger et bonifier son travail.</p>
          <div class="level-selector">
            <button 
              v-for="(label, idx) in ['Débutant', 'En cours', 'Acquis', 'Maîtrisé']" 
              :key="idx" 
              type="button"
              :class="['level-btn', { selected: selfRatings.iteration === idx + 1 }]"
              @click="selfRatings.iteration = idx + 1"
            >
              {{ label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Questions réflexives auto-évaluation -->
      <div class="questions-block" style="margin-top: 1.8rem;">
        <div class="form-group">
          <label class="form-label">
            🚀 <strong>Bilan personnel des apprentissages :</strong> Quels progrès les plus marquants avez-vous accomplis ?
          </label>
          <textarea 
            v-model="selfReflexivity.progress" 
            class="textarea-field" 
            rows="3" 
            placeholder="Ex : J'ai appris à dépasser une utilisation superficielle de l'IA et j'ai pris confiance dans la manipulation de machines au FabLab..."
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">
            🎯 <strong>Perspectives d'avenir :</strong> Quel défi technique ou didactique souhaitez-vous relever lors de vos futurs stages ou cours ?
          </label>
          <textarea 
            v-model="selfReflexivity.toImprove" 
            class="textarea-field" 
            rows="3" 
            placeholder="Ex : Concevoir des grilles critériées plus précises pour mes élèves, oser faire réaliser des capsules vidéo en classe..."
          ></textarea>
        </div>

        <div class="self-grade-box">
          <div class="self-grade-header">
            <label class="form-label" style="margin-bottom: 0;">
              ⚖️ <strong>Auto-estimation réflexive de votre investissement global :</strong>
            </label>
            <div class="grade-input-wrapper">
              <input 
                v-model.number="selfReflexivity.selfGrade" 
                type="number" 
                min="0" 
                max="20" 
                step="0.5" 
                class="grade-input" 
              />
              <span class="grade-denom">/ 20</span>
            </div>
          </div>
          <textarea 
            v-model="selfReflexivity.selfGradeReason" 
            class="textarea-field" 
            rows="2" 
            placeholder="Justifiez brièvement la note que vous vous attribuez (investissement, régularité, surpassement des blocages, rigueur didactique)..."
          ></textarea>
        </div>
      </div>
    </div>

    <!-- BOUTON DE SAUVEGARDE ET CONFIRMATION -->
    <div class="action-footer">
      <button 
        type="button" 
        class="save-btn" 
        @click="handleSave"
      >
        <span>💾 Enregistrer mon Évaluation & mon Auto-Évaluation</span>
      </button>

      <div v-if="saveStatus" class="status-alert">
        {{ saveStatus }}
      </div>
      <div v-else-if="isSaved" class="status-persisted">
        ✓ Vos réponses sont enregistrées sur cet appareil et synchronisées avec votre profil.
      </div>
    </div>
  </div>
</template>

<style scoped>
.eval-container {
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 2.2rem;
}

/* Carte identité */
.user-identity-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
}
.auth-logged {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.logged-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}
.logged-name {
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--vp-c-text-1);
}
.logged-email {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}
.logged-badge {
  margin-left: auto;
  font-size: 0.82rem;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
  padding: 4px 12px;
  border-radius: 20px;
}
.guest-title {
  margin: 0 0 0.8rem 0;
  font-weight: 600;
  font-size: 0.95rem;
}
.guest-inputs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.input-field {
  flex: 1;
  min-width: 180px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
}

/* Sections */
.eval-section {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 1.6rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}
.course-eval {
  border-top: 4px solid var(--vp-c-brand-1);
}
.self-eval {
  border-top: 4px solid #10b981;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}
.section-badge {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  border-radius: 6px;
}
.badge-blue {
  background: rgba(59, 130, 246, 0.15);
  color: var(--vp-c-brand-1);
}
.badge-green {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}
.section-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  border: none;
}
.section-desc {
  font-size: 0.92rem;
  color: var(--vp-c-text-2);
  line-height: 1.55;
  margin: 0 0 1.5rem 0;
}

/* Grille de notation cours */
.rating-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.rating-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--vp-c-bg-soft);
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  gap: 1rem;
  flex-wrap: wrap;
}
.rating-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 480px;
}
.rating-label strong {
  font-size: 0.95rem;
  color: var(--vp-c-text-1);
}
.rating-label span {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}
.stars-selector {
  display: flex;
  gap: 6px;
}
.star-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s;
}
.star-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.star-btn.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

/* Grille auto-évaluation */
.rubric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.2rem;
}
.rubric-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.rubric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.rubric-header strong {
  font-size: 0.92rem;
  color: var(--vp-c-text-1);
}
.score-badge {
  font-size: 0.85rem;
  font-weight: 800;
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
  padding: 2px 8px;
  border-radius: 4px;
}
.rubric-desc {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  margin: 0 0 6px 0;
  line-height: 1.4;
  flex-grow: 1;
}
.level-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}
.level-btn {
  padding: 5px 2px;
  font-size: 0.74rem;
  font-weight: 600;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}
.level-btn:hover {
  border-color: #10b981;
  color: #10b981;
}
.level-btn.selected {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

/* Questions ouvertes & notes */
.questions-block {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-top: 1.5rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-label {
  font-size: 0.92rem;
  color: var(--vp-c-text-1);
}
.textarea-field {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  line-height: 1.5;
  resize: vertical;
  font-family: inherit;
}
.textarea-field:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}
.self-grade-box {
  background: rgba(16, 185, 129, 0.06);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.self-grade-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}
.grade-input-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
}
.grade-input {
  width: 65px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  border: 2px solid #10b981;
  background: var(--vp-c-bg);
  color: #059669;
}
.grade-denom {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}

/* Footer d'action */
.action-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
}
.save-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.save-btn:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}
.status-alert {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 0.92rem;
  text-align: center;
}
.status-persisted {
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
}
</style>
