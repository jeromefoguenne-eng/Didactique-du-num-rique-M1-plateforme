<script setup>
import { ref, computed, onMounted } from 'vue'
import { userStore } from '../stores/userStore'

const props = defineProps({
  moduleId: {
    type: String,
    required: true
  },
  moduleTitle: {
    type: String,
    default: ''
  },
  customQuestions: {
    type: Array,
    default: null
  }
})

// Base de questions par défaut intégrées pour chaque module
const MODULE_QUESTIONS = {
  '01-1': [
    {
      id: 'q1',
      type: 'qcm',
      title: "1. Triptyque de la compétence (DigComp 2.2)",
      text: "Selon le cadre européen DigComp 2.2, qu'est-ce qui distingue une véritable compétence numérique d'une simple habileté technique ?",
      options: [
        "La maîtrise rapide de tous les raccourcis clavier d'un traitement de texte.",
        "La capacité à mobiliser de façon critique, réfléchie et responsable ses habiletés et connaissances pour répondre à une situation complexe.",
        "La possession d'un équipement matériel haut de gamme (tablette, ordinateur portable).",
        "La capacité à installer des logiciels sans l'aide d'un administrateur réseau."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "DigComp dépasse la simple habileté opératoire en exigeant le jugement critique, l'adaptation et la responsabilité éthique face aux technologies."
    },
    {
      id: 'q2',
      type: 'qcm',
      title: "2. La compétence « située »",
      text: "Pourquoi affirme-t-on en didactique que la compétence numérique est « située » ?",
      options: [
        "Parce qu'elle dépend obligatoirement de la localisation GPS de la salle de classe.",
        "Parce qu'elle n'existe pas dans le vide : son efficacité s'évalue toujours en fonction d'un contexte, d'un public et d'une intention précise.",
        "Parce qu'elle est réservée aux établissements scolaires connectés à la fibre optique.",
        "Parce qu'elle se mesure uniquement au nombre de clics nécessaires pour exécuter une tâche."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "Une personne n'est pas compétente dans l'absolu : savoir créer un diaporama n'a de valeur didactique que si les contenus et choix visuels répondent aux besoins du public cible."
    },
    {
      id: 'q3',
      type: 'open',
      title: "3. Analyse diagnostique d'un cas élève (Question réflexive)",
      text: "Dans votre classe, Sarah utilise quotidiennement ChatGPT pour rédiger ses travaux. Elle recopie les réponses sans vérifier les sources et déclare : « C'est l'IA qui l'a rédigé, donc c'est exact. » En vous appuyant sur la distinction entre outil, habileté et compétence, posez un diagnostic didactique et formulez une piste concrète de remédiation.",
      points: 4,
      modelAnswer: "Sarah possède une habileté instrumentale évidente (saisie de prompt, copie de texte), mais fait preuve d'une lacune majeure sur la dimension critique et la responsabilité épistémique (croyance en la véracité absolue de la machine). En tant qu'enseignant, la remédiation consiste à lui faire mener une activité de « fact-checking » : identifier des hallucinations de l'IA, remonter aux sources primaires sur Google Scholar ou dans des ouvrages physiques, et expliciter les limites probabilistes des modèles de langage.",
      rubricCriteria: [
        "Distinction explicite entre habileté technique (prompter) et compétence critique (vérifier).",
        "Identification de la carence épistémique / manque de responsabilité critique.",
        "Proposition d'un dispositif d'apprentissage ou de vérification croisée des sources."
      ]
    }
  ],
  '01-2': [
    {
      id: 'q1',
      type: 'qcm',
      title: "1. Post-vérité et communication politique (Cas des investitures 2009 vs 2017)",
      text: "Dans le concept de « post-vérité » illustré par la comparaison photographique des foules entre Obama (2009) et Trump (2017), quelle est la caractéristique centrale du discours médiatique ?",
      options: [
        "L'utilisation exclusive de caméras à très haute résolution pour compter les personnes.",
        "Le fait que les faits objectifs et vérifiables ont moins d'influence que les récits faisant appel à l'émotion et aux croyances personnelles (« faits alternatifs »).",
        "L'interdiction légale de diffuser des photographies aériennes lors des cérémonies d'État.",
        "L'absence totale de journalistes sur place le jour de l'investiture."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "La post-vérité se caractérise par la primauté accordée à l'émotion et à l'affirmation identitaire sur l'évidence factuelle et matérielle (création délibérée de vérités alternatives)."
    },
    {
      id: 'q2',
      type: 'qcm',
      title: "2. Fabrique du réel : Télé-réalité vs Cinéma direct (Cauchemar en cuisine vs Strip-Tease)",
      text: "En confrontant l'extrait de « Cauchemar en cuisine » et le documentaire « Strip-Tease (Scarface) », quel contraste didactique fondamental mettez-vous en évidence auprès des élèves ?",
      options: [
        "Cauchemar en cuisine est tourné en direct sans aucun montage, alors que Strip-Tease utilise des effets spéciaux numériques.",
        "Dans Cauchemar en cuisine, la dramatisation est sur-écrite (bruitages anxiogènes, musique de tension, coupes rapides), alors que Strip-Tease utilise le cinéma direct sans voix-off ni commentaire pour laisser le spectateur construire son regard critique.",
        "Les deux formats appliquent exactement la même déontologie journalistique neutre.",
        "Strip-Tease rémunère des comédiens professionnels pour jouer des scènes de fiction."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "La télé-réalité scénarise et manipule le rythme émotionnel par le montage et les ambiances sonores, tandis que Strip-Tease adopte le dispositif brut du cinéma direct sans narration prescriptive."
    },
    {
      id: 'q3',
      type: 'open',
      title: "3. Analyse critique du sensationnalisme télévisuel (Hanouna / Images à l'appui / Enquête Bolloré)",
      text: "À partir des extraits étudiés (l'émission d'Hanouna, le reportage « Images à l'appui : Fifi » et le grand reportage sur la télévision industrielle), comment expliqueriez-vous à des élèves la différence entre une information journalistique rigoureuse et un contenu sensationnaliste axé sur l'audience ?",
      points: 4,
      modelAnswer: "Un contenu journalistique rigoureux repose sur l'enquête contradictoire, la vérification méthodique des sources, la mise en contexte et la modération des propos. À l'inverse, le sensationnalisme (comme dans Hanouna ou Images à l'appui) dramatise la narration par des musiques anxiogènes, des plans resserrés et la mise en spectacle de l'indignation ou du conflit en direct. Cette mécanique vise avant tout à capter l'attention et à générer de l'audience (logique marchande et d'influence) plutôt qu'à éclairer le citoyen de façon rationnelle.",
      rubricCriteria: [
        "Repérage précis des procédés formels de dramatisation (musique, cadrage, polarisation, spectacle du clash).",
        "Distinction explicite entre la démarche journalistique d'enquête et la logique d'audience / marchande.",
        "Mise en lien avec l'autonomie critique et le jugement citoyen de l'élève."
      ]
    }
  ],
  '02-1': [
    {
      id: 'q1',
      type: 'qcm',
      title: "1. Les quatre champs du Référentiel FMTTN",
      text: "Quel champ du référentiel FMTTN prend spécifiquement en charge la décomposition de problèmes et la pensée algorithmique ?",
      options: [
        "Champ 1 : Usages et outils numériques de base",
        "Champ 2 : Médias et communication numérique",
        "Champ 3 : Programmation et pensée algorithmique",
        "Champ 4 : Citoyenneté numérique et sécurité"
      ],
      correctIndex: 2,
      points: 3,
      explanation: "Le champ 3 vise l'initiation aux concepts informatiques fondamentaux : séquences, boucles, conditions et raisonnement logique."
    },
    {
      id: 'q2',
      type: 'qcm',
      title: "2. Articulation interdisciplinaire",
      text: "Pourquoi le tronc commun insiste-t-il sur l'intégration du numérique dans l'ensemble des disciplines ?",
      options: [
        "Pour éliminer complètement les cours d'informatique spécialisés.",
        "Parce que le numérique est à la fois un objet d'apprentissage propre et un levier transversal pour travailler les mathématiques, les sciences et les langues.",
        "Uniquement pour respecter les directives budgétaires du matériel.",
        "Pour remplacer les enseignants par des plateformes d'apprentissage adaptatif."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "Le numérique possède une double nature didactique : outil au service des savoirs disciplinaires ET objet d'apprentissage en soi."
    },
    {
      id: 'q3',
      type: 'open',
      title: "3. Mobilisation transversale des champs",
      text: "Donnez un exemple d'activité de classe qui mobilise simultanément le Champ 2 (Médias & Communication) et le Champ 4 (Citoyenneté & Sécurité).",
      points: 4,
      modelAnswer: "Exemple : Création d'une campagne de sensibilisation vidéo ou d'une affiche Canva sur le cyberharcèlement et le droit à l'image. Les élèves travaillent la mise en page, le choix des médias et la rhétorique visuelle (Champ 2), tout en questionnant les aspects légaux, le consentement et les impacts psychosociaux (Champ 4).",
      rubricCriteria: [
        "Activité concrète mobilisant la production ou analyse médiatique (Champ 2).",
        "Prise en compte explicite de la dimension déontologique, légale ou éthique (Champ 4).",
        "Cohérence du rôle actif confié à l'élève."
      ]
    }
  ],
  '04-1': [
    {
      id: 'q1',
      type: 'qcm',
      title: "1. Alignement constructif",
      text: "Selon le principe d'alignement constructif de Biggs appliqué à une leçon intégrant le numérique, que doit-on concevoir en premier ?",
      options: [
        "L'application logicielle la plus innovante du moment.",
        "Les objectifs d'apprentissage visés et les critères d'évaluation de la maîtrise des élèves.",
        "Le planning de réservation du chariot de tablettes de l'école.",
        "La présentation visuelle PowerPoint de l'enseignant."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "La technologie doit toujours découler de l'objectif pédagogique, jamais l'inverse. Choisir l'outil avant l'objectif est un écueil didactique fréquent."
    },
    {
      id: 'q2',
      type: 'qcm',
      title: "2. Statut de l'obstacle dans la tâche",
      text: "Lors d'une évaluation sommative d'histoire ou de mathématiques, que risque-t-il d'arriver si l'outil numérique utilisé est totalement nouveau pour les élèves ?",
      options: [
        "Les élèves seront plus motivés et auront de meilleures notes.",
        "On génère une surcharge cognitive et on risque d'évaluer la compétence technique sur l'outil plutôt que la compétence disciplinaire ciblée.",
        "L'évaluation devient automatiquement conforme aux standards européens.",
        "Aucun impact, car les jeunes sont des « digital natives » infaillibles."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "L'outil numérique ne doit pas constituer un obstacle instrumental parasite lors de l'évaluation d'un savoir disciplinaire."
    },
    {
      id: 'q3',
      type: 'open',
      title: "3. Formulation d'un objectif opérationnel",
      text: "Rédigez un objectif d'apprentissage opérationnel complet (avec verbe d'action observable, conditions et critères de réussite) intégrant une compétence numérique pour une classe de secondaire.",
      points: 4,
      modelAnswer: "Exemple : « À partir d'un corpus de 3 articles en ligne fournis sur un sujet scientifique, l'élève sera capable d'identifier au moins 2 arguments fiables et 1 fausse information en justifiant son choix par la vérification de la source et de la date de publication, avec un seuil de réussite de 100% sur la grille critériée. »",
      rubricCriteria: [
        "Verbe d'action observable et univoque (identifier, comparer, concevoir...).",
        "Conditions de réalisation précisées (supports, outils, contexte).",
        "Critère d'évaluation mesurable ou seuil de réussite défini."
      ]
    }
  ]
}

// Fallback générique si le module n'a pas encore de pack spécifique
const FALLBACK_QUESTIONS = [
  {
    id: 'gen-q1',
    type: 'qcm',
    title: "1. Compréhension du concept clé",
    text: "Quelle est l'idée centrale développée dans ce chapitre de didactique du numérique ?",
    options: [
      "Le numérique se suffit à lui-même et remplace la posture pédagogique de l'enseignant.",
      "La technologie doit être subordonnée à une intention pédagogique claire et susciter une posture réflexive chez l'apprenant.",
      "L'important est d'utiliser le plus grand nombre d'outils numériques différents dans une leçon.",
      "Les manuels scolaires traditionnels doivent être systématiquement abandonnés."
    ],
    correctIndex: 1,
    points: 3,
    explanation: "La plus-value du numérique dépend de l'ingénierie pédagogique déployée et de l'activité cognitive réelle de l'élève."
  },
  {
    id: 'gen-q2',
    type: 'qcm',
    title: "2. Évaluation des apprentissages",
    text: "Dans une perspective d'évaluation diagnostique ou formative, comment doit-on traiter l'erreur d'un élève face à un outil numérique ?",
    options: [
      "Comme une faute éliminatoire sanctionnée par une note négative.",
      "Comme un indice précieux sur ses représentations mentales et une opportunité de remédiation didactique.",
      "Comme la preuve qu'il ne faut plus lui confier d'appareil numérique.",
      "En ignorant l'erreur pour ne pas décourager l'élève."
    ],
    correctIndex: 1,
    points: 3,
    explanation: "L'erreur fait partie intégrante du processus d'apprentissage et permet d'ajuster l'étayage pédagogique."
  },
  {
    id: 'gen-q3',
    type: 'open',
    title: "3. Transposition didactique personnelle",
    text: "En quelques lignes, expliquez comment vous comptez réinvestir concrètement les concepts théoriques de cette partie dans vos futures préparations de cours en stage.",
    points: 4,
    modelAnswer: "Expliciter le lien entre la théorie étudiée (cadres conceptuels, progression spiralaire, obstacles cognitifs) et sa déclinaison pratique dans une activité d'apprentissage ou une grille d'évaluation formative.",
    rubricCriteria: [
      "Mobilisation explicite d'au moins un concept abordé dans le module.",
      "Ancrage dans une situation d'enseignement réaliste (stage, leçon, consigne élève).",
      "Clarté de la formulation et esprit de synthèse."
    ]
  }
]

// Données réactives du Quiz
const questions = computed(() => {
  if (props.customQuestions && props.customQuestions.length > 0) {
    return props.customQuestions
  }
  return MODULE_QUESTIONS[props.moduleId] || FALLBACK_QUESTIONS
})

const userAnswers = ref({})
const openSelfScores = ref({})
const isSubmitted = ref(false)
const showCorrection = ref(false)
const saveSuccess = ref(false)

// Authentification rapide si non connecté
const inlineFirst = ref('')
const inlineLast = ref('')
const inlineEmail = ref('')

const currentUser = computed(() => userStore.currentUser)

// Dernier essai enregistré
const lastAttempt = computed(() => {
  const attempts = userStore.getUserQuizAttempts()
  return attempts.find(a => a.moduleId === props.moduleId)
})

// Calcul du score total
const maxPoints = computed(() => {
  return questions.value.reduce((acc, q) => acc + (q.points || 1), 0)
})

const earnedScore = computed(() => {
  let score = 0
  questions.value.forEach(q => {
    if (q.type === 'qcm') {
      if (userAnswers.value[q.id] === q.correctIndex) {
        score += (q.points || 1)
      }
    } else if (q.type === 'open') {
      const selfSc = openSelfScores.value[q.id]
      if (typeof selfSc === 'number') {
        score += selfSc
      } else {
        // Score par défaut si du texte a été saisi
        const text = userAnswers.value[q.id] || ''
        if (text.trim().length > 30) {
          score += (q.points || 4) * 0.75 // 75% par défaut si réponse fournie
        }
      }
    }
  })
  return Math.round(score * 10) / 10
})

const scorePercentage = computed(() => {
  if (maxPoints.value === 0) return 0
  return Math.round((earnedScore.value / maxPoints.value) * 100)
})

// Diagnostic formatif selon le pourcentage
const diagnosticLevel = computed(() => {
  const pct = scorePercentage.value
  if (pct >= 85) {
    return {
      title: '🏆 Maîtrise Experte & Approfondie',
      badgeClass: 'diag-expert',
      message: "Félicitations ! Vous maîtrisez parfaitement les concepts didactiques de cette partie. Vos capacités d'analyse critique sont solides."
    }
  } else if (pct >= 65) {
    return {
      title: '🎯 Bonne Compréhension Opérationnelle',
      badgeClass: 'diag-good',
      message: "Les fondamentaux sont acquis. Prenez le temps de relire les pistes réflexives et la dimension critique pour perfectionner vos futures préparations."
    }
  } else if (pct >= 50) {
    return {
      title: '⚠️ Compréhension Partielle',
      badgeClass: 'diag-medium',
      message: "Certaines notions clés restent à consolider. Relisez attentivement les passages surlignés dans les encadrés didactiques du syllabus avant l'atelier."
    }
  } else {
    return {
      title: '🔄 Révision Nécessaire',
      badgeClass: 'diag-low',
      message: "Ce diagnostic indique des difficultés sur les concepts fondamentaux de cette partie. N'hésitez pas à relire le texte complet et à poser vos questions au formateur."
    }
  }
})

function submitQuiz() {
  // Vérifier qu'au moins une réponse a été donnée
  const hasAnswer = Object.keys(userAnswers.value).some(k => {
    const val = userAnswers.value[k]
    return val !== undefined && val !== null && val !== ''
  })

  if (!hasAnswer) {
    alert("Veuillez répondre au moins à une question avant de valider le quiz.")
    return
  }

  isSubmitted.value = true
  showCorrection.value = true

  // Préparer les réponses formatées
  const formattedAnswers = questions.value.map(q => {
    if (q.type === 'qcm') {
      const ans = userAnswers.value[q.id]
      const isCorrect = ans === q.correctIndex
      return {
        questionId: q.id,
        questionText: q.text,
        type: 'qcm',
        userAnswer: ans !== undefined ? q.options[ans] : 'Non répondu',
        correctAnswer: q.options[q.correctIndex],
        isCorrect,
        points: isCorrect ? q.points : 0,
        maxPoints: q.points,
        explanation: q.explanation
      }
    } else {
      const text = userAnswers.value[q.id] || 'Non répondu'
      const pts = openSelfScores.value[q.id] !== undefined 
        ? openSelfScores.value[q.id] 
        : (text.length > 30 ? (q.points * 0.75) : 0)

      return {
        questionId: q.id,
        questionText: q.text,
        type: 'open',
        userAnswer: text,
        points: pts,
        maxPoints: q.points,
        explanation: q.modelAnswer,
        openFeedback: "Auto-évaluation sur base des critères du syllabus."
      }
    }
  })

  // Enregistrement automatique si déjà connecté
  if (currentUser.value) {
    userStore.saveQuizAttempt({
      moduleId: props.moduleId,
      moduleTitle: props.moduleTitle || `Module ${props.moduleId}`,
      score: earnedScore.value,
      totalPoints: maxPoints.value,
      percentage: scorePercentage.value,
      answers: formattedAnswers
    })
    saveSuccess.value = true
  }
}

function handleSaveWithAuth() {
  if (!inlineFirst.value || !inlineLast.value || !inlineEmail.value) {
    alert("Veuillez renseigner votre prénom, nom et email étudiant pour associer votre score à votre dossier.")
    return
  }

  userStore.register(inlineFirst.value, inlineLast.value, inlineEmail.value)

  // Enregistrer le quiz pour ce nouvel utilisateur
  submitQuiz()
}

function retakeQuiz() {
  userAnswers.value = {}
  openSelfScores.value = {}
  isSubmitted.value = false
  showCorrection.value = false
  saveSuccess.value = false
}
</script>

<template>
  <div class="quiz-container">
    <!-- En-tête du Quiz -->
    <div class="quiz-header">
      <div class="quiz-badge-wrap">
        <span class="quiz-chip">📝 ÉVALUATION DIAGNOSTIQUE</span>
        <span class="quiz-chip-module">{{ moduleId }}</span>
      </div>
      <h3 class="quiz-headline">Testez votre compréhension didactique</h3>
      <p class="quiz-intro">
        Vérifiez vos acquis sur cette partie grâce à ce questionnaire combinant questions à choix multiples et réflexion didactique ouverte. Vos résultats sont enregistrés pour suivre votre progression.
      </p>

      <!-- Si déjà complété antérieurement -->
      <div v-if="lastAttempt && !isSubmitted" class="previous-attempt-banner">
        <div class="prev-info">
          <span>Dernier résultat enregistré : <strong>{{ lastAttempt.score }} / {{ lastAttempt.totalPoints }}</strong> ({{ lastAttempt.percentage }}%)</span>
          <span class="prev-date">le {{ lastAttempt.submittedAt }}</span>
        </div>
        <button class="btn-retake-small" @click="retakeQuiz">Recommencer le test</button>
      </div>
    </div>

    <!-- Questions Form -->
    <div class="quiz-body">
      <div 
        v-for="(q, idx) in questions" 
        :key="q.id" 
        class="quiz-card"
        :class="{
          'answered': userAnswers[q.id] !== undefined,
          'correct-card': isSubmitted && q.type === 'qcm' && userAnswers[q.id] === q.correctIndex,
          'incorrect-card': isSubmitted && q.type === 'qcm' && userAnswers[q.id] !== q.correctIndex && userAnswers[q.id] !== undefined
        }"
      >
        <div class="question-header">
          <span class="q-num">Question {{ idx + 1 }}</span>
          <span class="q-points">{{ q.points }} pts</span>
        </div>

        <h4 class="q-title">{{ q.title || `Question ${idx + 1}` }}</h4>
        <p class="q-text">{{ q.text }}</p>

        <!-- TYPE QCM -->
        <div v-if="q.type === 'qcm'" class="q-options">
          <label 
            v-for="(opt, optIdx) in q.options" 
            :key="optIdx" 
            class="q-option-label"
            :class="{
              'selected': userAnswers[q.id] === optIdx,
              'correct-highlight': showCorrection && optIdx === q.correctIndex,
              'wrong-highlight': showCorrection && userAnswers[q.id] === optIdx && optIdx !== q.correctIndex,
              'disabled': isSubmitted
            }"
          >
            <input 
              type="radio" 
              :name="`q_${q.id}`" 
              :value="optIdx" 
              v-model="userAnswers[q.id]"
              :disabled="isSubmitted"
              class="q-radio"
            />
            <span class="opt-text">{{ opt }}</span>
            <span v-if="showCorrection && optIdx === q.correctIndex" class="feedback-icon correct">✓ Bonne réponse</span>
            <span v-else-if="showCorrection && userAnswers[q.id] === optIdx && optIdx !== q.correctIndex" class="feedback-icon wrong">✗ Erreur</span>
          </label>

          <!-- Explication de la correction -->
          <div v-if="showCorrection && q.explanation" class="correction-box">
            <strong>💡 Éclairage didactique :</strong>
            <p>{{ q.explanation }}</p>
          </div>
        </div>

        <!-- TYPE QUESTION OUVERTE -->
        <div v-else-if="q.type === 'open'" class="q-open-wrap">
          <textarea 
            v-model="userAnswers[q.id]" 
            :disabled="isSubmitted"
            placeholder="Rédigez ici votre réflexion pédagogique argumentée..."
            class="open-textarea"
            rows="4"
          ></textarea>

          <!-- Correction & Corrigé type -->
          <div v-if="showCorrection" class="open-correction-box">
            <div class="model-answer-header">
              <span>📋 Éléments attendus du syllabus & Critères d'analyse :</span>
            </div>
            <p class="model-answer-text">{{ q.modelAnswer }}</p>

            <div v-if="q.rubricCriteria" class="rubric-list">
              <span class="rubric-label">Critères de réussite observables :</span>
              <ul>
                <li v-for="(crit, cIdx) in q.rubricCriteria" :key="cIdx">{{ crit }}</li>
              </ul>
            </div>

            <!-- Auto-évaluation du score pour la question ouverte -->
            <div class="self-scoring-zone">
              <span class="self-score-label">Auto-évaluez votre réponse :</span>
              <div class="score-pills">
                <button 
                  v-for="pt in (q.points + 1)" 
                  :key="pt - 1"
                  type="button"
                  class="score-pill"
                  :class="{ 'active': openSelfScores[q.id] === (pt - 1) }"
                  @click="openSelfScores[q.id] = (pt - 1)"
                >
                  {{ pt - 1 }} / {{ q.points }} pt{{ (pt - 1) > 1 ? 's' : '' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action & Résultat final -->
    <div class="quiz-footer">
      <div v-if="!isSubmitted" class="submit-action-zone">
        <button class="btn-validate-quiz" @click="submitQuiz">
          Valider mes réponses & Obtenir le diagnostic
        </button>
      </div>

      <!-- Zone de résultat après validation -->
      <div v-else class="results-panel">
        <div class="score-summary-card">
          <div class="score-circle" :class="diagnosticLevel.badgeClass">
            <span class="score-num">{{ earnedScore }}</span>
            <span class="score-max">/ {{ maxPoints }}</span>
          </div>

          <div class="score-details">
            <div class="diag-header-line">
              <h4 class="diag-title">{{ diagnosticLevel.title }}</h4>
              <span class="score-pct-badge">{{ scorePercentage }}% de réussite</span>
            </div>
            <p class="diag-msg">{{ diagnosticLevel.message }}</p>
          </div>
        </div>

        <!-- Notification de synchronisation ou formulaire d'association -->
        <div v-if="currentUser" class="sync-status success">
          ✓ Vos résultats ont été enregistrés avec succès dans votre dossier étudiant (<strong>{{ currentUser.firstName }} {{ currentUser.lastName }}</strong>). Votre formateur peut les consulter.
        </div>
        <div v-else class="sync-auth-prompt">
          <p class="auth-prompt-msg">
            💡 Vous n'êtes pas connecté. Pour enregistrer cette note sur votre <strong>Espace Membre</strong> et dans le tableau de bord enseignant, renseignez votre identité :
          </p>
          <div class="mini-auth-row">
            <input v-model="inlineFirst" type="text" placeholder="Prénom" class="mini-input" />
            <input v-model="inlineLast" type="text" placeholder="Nom" class="mini-input" />
            <input v-model="inlineEmail" type="email" placeholder="prenom.nom@student.hech.be" class="mini-input" />
            <button class="btn-link-score" @click="handleSaveWithAuth">Enregistrer mon score</button>
          </div>
        </div>

        <!-- Bouton Recommencer -->
        <div class="footer-actions">
          <button class="btn-retake-primary" @click="retakeQuiz">
            🔄 Recommencer ce quiz
          </button>
          <a href="/espace-membre" class="btn-go-dashboard">
            Consulter mes résultats sur mon Espace Membre →
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-container {
  margin: 3rem 0;
  padding: 2rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 18px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}

.quiz-badge-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0.8rem;
}

.quiz-chip {
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.quiz-chip-module {
  background: rgba(99, 102, 241, 0.12);
  color: #4f46e5;
  font-weight: 700;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 6px;
}

.quiz-headline {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  margin: 0 0 0.5rem 0;
}

.quiz-intro {
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.previous-attempt-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(16, 185, 129, 0.08);
  border-left: 4px solid #10b981;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.prev-info {
  font-size: 0.9rem;
  color: #065f46;
}

.prev-date {
  font-size: 0.8rem;
  opacity: 0.8;
  margin-left: 8px;
}

.btn-retake-small {
  background: white;
  border: 1px solid #10b981;
  color: #059669;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-retake-small:hover {
  background: #10b981;
  color: white;
}

.quiz-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.quiz-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.4rem;
  transition: border-color 0.2s;
}

.quiz-card.answered {
  border-color: rgba(99, 102, 241, 0.4);
}

.quiz-card.correct-card {
  border-left: 5px solid #10b981;
}

.quiz-card.incorrect-card {
  border-left: 5px solid #ef4444;
}

.question-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.q-num {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.q-points {
  font-size: 0.8rem;
  font-weight: 600;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  padding: 2px 8px;
  border-radius: 4px;
}

.q-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 0.4rem 0;
}

.q-text {
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1.2rem;
}

.q-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.q-option-label {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.85rem 1.1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
  background: var(--vp-c-bg-soft);
  transition: all 0.2s ease;
  font-size: 0.92rem;
  color: var(--vp-c-text-1);
  position: relative;
}

.q-option-label:hover:not(.disabled) {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
}

.q-option-label.selected {
  border-color: var(--vp-c-brand-1);
  background: rgba(99, 102, 241, 0.08);
}

.q-option-label.correct-highlight {
  border-color: #10b981 !important;
  background: rgba(16, 185, 129, 0.1) !important;
}

.q-option-label.wrong-highlight {
  border-color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.1) !important;
}

.feedback-icon {
  margin-left: auto;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.feedback-icon.correct {
  background: #10b981;
  color: white;
}

.feedback-icon.wrong {
  background: #ef4444;
  color: white;
}

.correction-box {
  margin-top: 1rem;
  background: rgba(99, 102, 241, 0.06);
  border-left: 4px solid #6366f1;
  padding: 0.9rem 1.2rem;
  border-radius: 0 8px 8px 0;
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--vp-c-text-1);
}

.open-textarea {
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.85rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: inherit;
  font-size: 0.92rem;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.2s;
}

.open-textarea:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.open-correction-box {
  margin-top: 1.2rem;
  background: rgba(59, 130, 246, 0.05);
  border-left: 4px solid #3b82f6;
  padding: 1.1rem;
  border-radius: 0 10px 10px 0;
}

.model-answer-header {
  font-weight: 700;
  font-size: 0.92rem;
  color: #1e40af;
  margin-bottom: 0.5rem;
}

.model-answer-text {
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.rubric-list {
  background: white;
  border: 1px solid rgba(59, 130, 246, 0.2);
  padding: 0.8rem 1.2rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.rubric-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #3b82f6;
  text-transform: uppercase;
}

.rubric-list ul {
  margin: 0.4rem 0 0 1.2rem;
  padding: 0;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
}

.self-scoring-zone {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding-top: 0.8rem;
  border-top: 1px dashed rgba(59, 130, 246, 0.3);
}

.self-score-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.score-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.score-pill {
  background: white;
  border: 1px solid var(--vp-c-divider);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--vp-c-text-2);
}

.score-pill:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.score-pill.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.quiz-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--vp-c-divider);
}

.btn-validate-quiz {
  width: 100%;
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.05rem;
  font-weight: 700;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.25);
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-validate-quiz:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.35);
}

.results-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.score-summary-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  padding: 1.5rem;
  border-radius: 14px;
}

.score-circle {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.score-circle.diag-expert {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.score-circle.diag-good {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.score-circle.diag-medium {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.score-circle.diag-low {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.score-num {
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1;
}

.score-max {
  font-size: 0.85rem;
  opacity: 0.85;
}

.diag-header-line {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 0.4rem;
}

.diag-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  margin: 0;
}

.score-pct-badge {
  background: rgba(99, 102, 241, 0.12);
  color: #4f46e5;
  font-weight: 700;
  font-size: 0.82rem;
  padding: 3px 8px;
  border-radius: 6px;
}

.diag-msg {
  font-size: 0.92rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  margin: 0;
}

.sync-status.success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid #10b981;
  color: #065f46;
  padding: 0.9rem 1.2rem;
  border-radius: 8px;
  font-size: 0.92rem;
}

.sync-auth-prompt {
  background: rgba(99, 102, 241, 0.06);
  border: 1px dashed #6366f1;
  padding: 1.2rem;
  border-radius: 10px;
}

.auth-prompt-msg {
  font-size: 0.92rem;
  color: var(--vp-c-text-1);
  margin: 0 0 0.8rem 0;
}

.mini-auth-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.mini-input {
  flex: 1;
  min-width: 140px;
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 0.88rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.btn-link-score {
  background: #6366f1;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
}

.footer-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-retake-primary {
  background: var(--vp-c-default-soft);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-retake-primary:hover {
  background: var(--vp-c-bg);
  border-color: var(--vp-c-brand-1);
}

.btn-go-dashboard {
  display: inline-flex;
  align-items: center;
  background: var(--vp-c-brand-1);
  color: white !important;
  text-decoration: none !important;
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.92rem;
}
</style>
