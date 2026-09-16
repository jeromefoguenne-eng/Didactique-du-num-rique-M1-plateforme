<script setup>
import { ref, computed } from 'vue'
import { userStore } from '../stores/userStore'
import { withBase } from 'vitepress'

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const loginEmail = ref('')
const activeTab = ref('progress') // 'progress' | 'exercises'

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
  { id: 'exercice-video', title: 'Atelier 7 : Capsule Vidéo du jeu' }
]

const currentUser = computed(() => userStore.currentUser)
const progressPercent = computed(() => userStore.calculateUserProgressPercent())

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
</script>

<template>
  <div class="member-container">
    <!-- UTILISATEUR NON CONNECTÉ : FORMULAIRE D'INSCRIPTION / CONNEXION -->
    <div v-if="!currentUser" class="auth-card">
      <div class="auth-header">
        <span class="auth-icon">🎓</span>
        <h2>Espace Membre Étudiant</h2>
        <p>Inscrivez-vous pour enregistrer vos réponses aux exercices et suivre votre progression tout au long du quadrimestre.</p>
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
          📋 Suivi des Chapitres du Cours
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'exercises' }]"
          @click="activeTab = 'exercises'"
        >
          ✏️ Mes Réponses aux Exercices
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
                <p>Aucune réponse enregistrée pour cet exercice.</p>
                <button @click="startEdit(ex.id)" class="btn-add-answer">+ Répondre à cet exercice</button>
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

.form-box h3 {
  margin: 0 0 0.3rem 0;
  font-size: 1.15rem;
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
  font-size: 0.82rem;
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
}

.btn-primary, .btn-secondary {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--vp-c-brand-1);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

/* DASHBOARD STYLES */
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.8rem;
  padding-bottom: 1.4rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-badge {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.user-name {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
}

.user-email {
  margin: 0;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.btn-logout {
  background: var(--vp-c-default-soft);
  border: 1px solid var(--vp-c-divider);
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.82rem;
  cursor: pointer;
  color: var(--vp-c-text-2);
}

.progress-banner {
  background: var(--vp-c-bg-alt);
  padding: 1.2rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid var(--vp-c-divider);
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  margin-bottom: 0.6rem;
  font-size: 0.95rem;
}

.progress-percent {
  color: var(--vp-c-brand-1);
}

.progress-track {
  width: 100%;
  height: 10px;
  background: var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--vp-c-brand-1);
  transition: width 0.4s ease;
}

.tab-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 0.5rem;
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

.modules-checklist {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.module-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.2rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
}

.module-item.done {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.04);
}

.mod-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.mod-link {
  font-weight: 600;
  text-decoration: none;
  color: var(--vp-c-text-1);
}

.mod-link:hover {
  color: var(--vp-c-brand-1);
}

.btn-toggle {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}

.btn-toggle.done {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

/* EXERCISES LIST */
.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.exercise-box-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.4rem;
}

.ex-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.ex-card-header h4 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.badge-submitted {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.badge-pending {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
}

.answer-content p {
  font-size: 0.92rem;
  line-height: 1.5;
  background: var(--vp-c-bg-alt);
  padding: 0.8rem 1rem;
  border-radius: 8px;
  margin: 0 0 0.6rem 0;
  border-left: 3px solid #3b82f6;
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
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
  margin: 0 0 0.6rem 0;
  font-style: italic;
}

.btn-add-answer {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.edit-area textarea {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
  font-family: inherit;
}

.edit-actions {
  display: flex;
  gap: 0.6rem;
}

.btn-save {
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-divider);
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
}
</style>
