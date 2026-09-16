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

const currentUser = computed(() => userStore.currentUser)

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
</script>

<template>
  <div class="exercise-submit-box">
    <div class="box-header">
      <span class="box-badge">Zone de Travail Étudiant</span>
      <h4>Rédiger votre réponse pour cet exercice</h4>
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

    <div class="box-actions">
      <button @click="handleSave" class="btn-submit-answer">
        💾 Enregistrer ma réponse
      </button>
      <span v-if="saveStatus" class="save-msg">{{ saveStatus }}</span>
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
}

.box-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
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

.save-msg {
  font-size: 0.85rem;
  font-weight: 600;
  color: #10b981;
}
</style>
