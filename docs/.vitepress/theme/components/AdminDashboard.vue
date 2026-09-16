<script setup>
import { ref, computed } from 'vue'
import { userStore } from '../stores/userStore'

const enteredPin = ref('')
const isAuthenticated = ref(false)
const adminTab = ref('students') // 'students' | 'submissions' | 'export'

const selectedExerciseFilter = ref('all')
const selectedStudentFilter = ref('all')
const newPinInput = ref('')

const users = computed(() => userStore.users)
const submissions = computed(() => userStore.submissions)

const totalStudents = computed(() => users.value.length)
const totalSubmissions = computed(() => submissions.value.length)

const averageProgress = computed(() => {
  if (users.value.length === 0) return 0
  const total = users.value.reduce((acc, u) => acc + userStore.calculateUserProgressPercent(u.email), 0)
  return Math.round(total / users.value.length)
})

const exerciseOptions = [
  { id: 'all', title: 'Tous les exercices' },
  { id: 'exercice-01', title: 'Atelier 1 : Diagnostic de compétences' },
  { id: 'exercice-02', title: 'Atelier 2 : Peut-on faire confiance ?' },
  { id: 'exercice-03', title: 'Atelier 3 : Guide numérique élèves' },
  { id: 'exercice-04', title: 'Atelier 4 : Escape Game FMTTN' },
  { id: 'exercice-05', title: 'Atelier 5 : Défi 20 min Canva' },
  { id: 'exercice-06', title: 'Atelier 6 : Défi Hardware PC' },
  { id: 'exercice-video', title: 'Atelier 7 : Capsule Vidéo' }
]

const filteredSubmissions = computed(() => {
  return submissions.value.filter(sub => {
    const matchEx = selectedExerciseFilter.value === 'all' || sub.exerciseId === selectedExerciseFilter.value
    const matchStudent = selectedStudentFilter.value === 'all' || sub.userEmail === selectedStudentFilter.value
    return matchEx && matchStudent
  })
})

function checkPin() {
  if (userStore.verifyAdminPin(enteredPin.value)) {
    isAuthenticated.value = true
  } else {
    alert('Code enseignant incorrect. (Code par défaut : hech2026)')
  }
}

function handleUpdatePin() {
  if (!newPinInput.value || newPinInput.value.length < 4) {
    alert('Le code doit comporter au moins 4 caractères.')
    return
  }
  userStore.updateAdminPin(newPinInput.value)
  newPinInput.value = ''
  alert('Code enseignant mis à jour avec succès !')
}

function exportCSV() {
  let csv = 'Nom;Prenom;Email;Date_Inscription;Progression_Pourcent;Exercice;Reponse;Date_Soumission\n'
  
  users.value.forEach(u => {
    const prog = userStore.calculateUserProgressPercent(u.email)
    const userSubs = submissions.value.filter(s => s.userEmail === u.email)
    
    if (userSubs.length === 0) {
      csv += `"${u.lastName}";"${u.firstName}";"${u.email}";"${u.registeredAt}";"${prog}%";"Aucun";"Aucune réponse";""\n`
    } else {
      userSubs.forEach(s => {
        const cleanAnswer = s.answer.replace(/"/g, '""').replace(/\n/g, ' ')
        csv += `"${u.lastName}";"${u.firstName}";"${u.email}";"${u.registeredAt}";"${prog}%";"${s.exerciseTitle}";"${cleanAnswer}";"${s.submittedAt}"\n`
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
</script>

<template>
  <div class="admin-container">
    <!-- ÉCRAN DE VERROUILLAGE ADMIN -->
    <div v-if="!isAuthenticated" class="lock-screen">
      <span class="lock-icon">🔒</span>
      <h2>Espace Enseignant (Administration)</h2>
      <p>Veuillez saisir votre code d'accès enseignant pour consulter le suivi de la classe et les réponses des étudiants.</p>
      
      <div class="pin-box">
        <input 
          v-model="enteredPin" 
          type="password" 
          placeholder="Code d'accès enseignant" 
          @keyup.enter="checkPin"
        />
        <button @click="checkPin" class="btn-unlock">Déverrouiller l'Espace Admin →</button>
        <span class="pin-hint">Code par défaut : <code>hech2026</code></span>
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
            <div class="kpi-label">Étudiants inscrits</div>
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
            <div class="kpi-label">Réponses soumises</div>
          </div>
        </div>
      </div>

      <!-- ONGLETS ADMIN -->
      <div class="admin-tab-bar">
        <button 
          :class="['admin-tab-btn', { active: adminTab === 'students' }]"
          @click="adminTab = 'students'"
        >
          👥 Tableau des Étudiants ({{ users.length }})
        </button>
        <button 
          :class="['admin-tab-btn', { active: adminTab === 'submissions' }]"
          @click="adminTab = 'submissions'"
        >
          📋 Réponses aux Exercices ({{ submissions.length }})
        </button>
        <button 
          :class="['admin-tab-btn', { active: adminTab === 'export' }]"
          @click="adminTab = 'export'"
        >
          📥 Export & Paramètres
        </button>
      </div>

      <!-- VUE 1 : TABLEAU DES ÉTUDIANTS -->
      <div v-if="adminTab === 'students'" class="tab-panel">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Adresse Email</th>
                <th>Inscrit le</th>
                <th>Progression</th>
                <th>Exercices</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id">
                <td>
                  <strong>{{ u.lastName }}</strong> {{ u.firstName }}
                </td>
                <td>{{ u.email }}</td>
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
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- VUE 2 : RÉPONSES AUX EXERCICES -->
      <div v-if="adminTab === 'submissions'" class="tab-panel">
        <!-- FILTRES -->
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

        <!-- LISTE DES RÉPONSES -->
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

      <!-- VUE 3 : EXPORT & PARAMÈTRES -->
      <div v-if="adminTab === 'export'" class="tab-panel">
        <div class="export-box">
          <h3>📥 Exporter les données de la classe</h3>
          <p>Téléchargez un fichier CSV complet contenant tous les étudiants inscrits, leur taux de progression et l'ensemble des réponses textuelles rédigées pour vos évaluations.</p>
          <button @click="exportCSV" class="btn-export-csv">
            Télécharger le relevé complet (.CSV / Excel)
          </button>
        </div>

        <div class="security-box">
          <h3>🔐 Modifier le code PIN enseignant</h3>
          <p>Modifiez le code d'accès enseignant protégeant cet espace :</p>
          <div class="pin-change-row">
            <input v-model="newPinInput" type="password" placeholder="Nouveau code PIN" />
            <button @click="handleUpdatePin" class="btn-update-pin">Enregistrer le nouveau code</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.admin-container {
  max-width: 1040px;
  margin: 1.5rem auto 4rem auto;
  padding: 0 1rem;
}

.lock-screen {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  max-width: 520px;
  margin: 3rem auto;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
}

.lock-icon {
  font-size: 3rem;
  display: inline-block;
  margin-bottom: 0.8rem;
}

.lock-screen h2 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 0.6rem 0;
}

.lock-screen p {
  font-size: 0.92rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1.8rem;
}

.pin-box {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.pin-box input {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  font-size: 1rem;
  text-align: center;
  color: var(--vp-c-text-1);
}

.btn-unlock {
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
}

.pin-hint {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
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
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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

.table-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-progress-bar {
  width: 80px;
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

/* EXPORT */
.export-box, .security-box {
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.export-box h3, .security-box h3 {
  margin: 0 0 0.4rem 0;
  font-size: 1.15rem;
  font-weight: 700;
}

.export-box p, .security-box p {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1.2rem;
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

.btn-export-csv:hover {
  opacity: 0.9;
}

.pin-change-row {
  display: flex;
  gap: 0.8rem;
  max-width: 400px;
}

.pin-change-row input {
  flex-grow: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.btn-update-pin {
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}
</style>
