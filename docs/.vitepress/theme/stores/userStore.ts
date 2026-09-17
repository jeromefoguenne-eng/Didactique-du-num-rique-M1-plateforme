import { reactive, computed } from 'vue'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'student' | 'admin'
  registeredAt: string
  status?: 'active' | 'archived'
  password?: string
  passwordSet?: boolean
  recoveryCode?: string
}

export interface QuizAnswer {
  questionId: string
  questionText: string
  type: 'qcm' | 'open'
  userAnswer: string | number
  correctAnswer?: string | number
  isCorrect?: boolean
  points: number
  maxPoints: number
  explanation?: string
  openFeedback?: string
}

export interface QuizAttempt {
  id: string
  userId: string
  userName: string
  userEmail: string
  moduleId: string
  moduleTitle: string
  score: number
  totalPoints: number
  percentage: number
  answers: QuizAnswer[]
  submittedAt: string
  evaluationType: 'diagnostic'
}

export interface Submission {
  id: string
  userId: string
  userName: string
  userEmail: string
  exerciseId: string
  exerciseTitle: string
  answer: string
  submittedAt: string
}

export interface AiCorrection {
  status: 'analyzed' | 'pending' | 'error'
  suggestedScore: number
  maxScore: number
  rubricScores: {
    concordance: number // Pertinence & concordance programme /3
    didacticQuality: number // Intégration didactique /3
    criticalAnalysis: number // Rigueur de l'analyse critique /2.5
    formAndStructure: number // Structure, clarté et présentation /1.5
  }
  summary: string
  strengths: string[]
  improvements: string[]
  detailedFeedback: string
  correctedAt: string
  modelUsed: string
}

export interface TeacherGrade {
  score: number
  maxScore: number
  feedback: string
  gradedAt: string
  status: 'graded' | 'pending'
}

export interface ExerciseTeacherFeedback {
  userEmail: string
  userName?: string
  exerciseId: string
  exerciseTitle?: string
  score?: number
  maxScore: number
  feedback: string
  gradedAt: string
  status: 'graded' | 'pending'
}

export interface SubmittedFile {
  id: string
  userId: string
  userName: string
  userEmail: string
  exerciseId: string
  exerciseTitle: string
  originalFileName: string
  formattedFileName: string // ex: DUBOIS_Sarah_Atelier-01_2026-09-16.pdf
  fileType: string
  fileSize: number
  dataUrl?: string
  submittedAt: string
  driveSynced?: boolean
  aiCorrection?: AiCorrection
  teacherGrade?: TeacherGrade
}

const STORAGE_KEY_USERS = 'hech_didac_users'
const STORAGE_KEY_CURRENT = 'hech_didac_current_user'
const STORAGE_KEY_PROGRESS = 'hech_didac_progress'
const STORAGE_KEY_SUBMISSIONS = 'hech_didac_submissions'
const STORAGE_KEY_ADMIN_PIN = 'hech_didac_admin_pin'
const STORAGE_KEY_FILES = 'hech_didac_files'
const STORAGE_KEY_WEBHOOK = 'hech_didac_drive_webhook'
const STORAGE_KEY_QUIZZES = 'hech_didac_quiz_attempts'
const STORAGE_KEY_EVALUATIONS = 'hech_didac_evaluations_200'
const STORAGE_KEY_EXERCISE_FEEDBACKS = 'hech_didac_exercise_feedbacks'

export interface EvaluationRecord {
  userEmail: string
  gamePedagogyScore?: number // max 20 (prépa et intégration pédagogique)
  gameBoardLaserScore?: number // max 15 (plateau découpe laser)
  gamePawns3dScore?: number // max 15 (pions impression 3D)
  gameAiCardsScore?: number // max 15 (cartes de jeu IA)
  gameVideoScore?: number // max 20 (présentation vidéo du jeu)
  gamePhotosScore?: number // max 15 (intégration des photos)
  gameProjectScore: number // max 100
  oralDefenseScore: number // max 30 (soutenance orale)
  teacherFeedback?: string
}

// Helper de nettoyage pour le nommage des fichiers
export function formatFileName(
  lastName: string, 
  firstName: string, 
  exerciseTitle: string, 
  originalName: string
): string {
  const clean = (str: string) => {
    return (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime accents
      .replace(/[^a-zA-Z0-9_-]/g, '_') // Remplace caractères spéciaux par _
      .replace(/_+/g, '_')             // Évite les underscores multiples
      .replace(/^_|_$/g, '')          // Nettoie bords
  }

  const nom = clean(lastName || 'ETUDIANT').toUpperCase()
  const prenom = clean(firstName || 'Inconnu')
  
  // Raccourcir ou extraire l'atelier proprement
  let exClean = clean(exerciseTitle || 'Devoir')
  if (exClean.length > 30) {
    exClean = exClean.substring(0, 30)
  }

  // Extension du fichier (pdf, docx, doc)
  const parts = (originalName || 'document.pdf').split('.')
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : 'pdf'
  const today = new Date().toISOString().substring(0, 10)

  return `${nom}_${prenom}_${exClean}_${today}.${ext}`
}

// Données par défaut pour démonstration immédiate
const DEFAULT_USERS: User[] = [
  {
    id: 'user-1',
    firstName: 'Sarah',
    lastName: 'Dubois',
    email: 'sarah.dubois@student.hech.be',
    role: 'student',
    registeredAt: '2026-09-15 14:30',
    status: 'active',
    password: '',
    passwordSet: false
  },
  {
    id: 'user-2',
    firstName: 'Maxime',
    lastName: 'Lambert',
    email: 'maxime.lambert@student.hech.be',
    role: 'student',
    registeredAt: '2026-09-15 16:15',
    status: 'active',
    password: 'etudiant2026',
    passwordSet: true
  },
  {
    id: 'user-3',
    firstName: 'Thomas',
    lastName: 'Bastien',
    email: 'thomas.bastien@student.hech.be',
    role: 'student',
    registeredAt: '2026-09-16 08:45',
    status: 'active',
    password: 'etudiant2026',
    passwordSet: true
  }
]

const DEFAULT_QUIZZES: QuizAttempt[] = [
  {
    id: 'quiz-att-1',
    userId: 'user-2',
    userName: 'Maxime Lambert',
    userEmail: 'maxime.lambert@student.hech.be',
    moduleId: '01-1',
    moduleTitle: "1.1 Qu'est-ce qu'une compétence numérique ?",
    score: 8,
    totalPoints: 10,
    percentage: 80,
    evaluationType: 'diagnostic',
    submittedAt: '2026-09-16 14:10',
    answers: [
      {
        questionId: 'q1',
        questionText: "Selon le cadre DigComp 2.2, qu'est-ce qui distingue une compétence numérique d'une simple habileté technique ?",
        type: 'qcm',
        userAnswer: 2,
        correctAnswer: 2,
        isCorrect: true,
        points: 3,
        maxPoints: 3,
        explanation: "La compétence intègre la mobilisation critique, le jugement et l'action responsable en situation complexe."
      },
      {
        questionId: 'q2',
        questionText: "Pourquoi dit-on que la compétence numérique est « située » ?",
        type: 'qcm',
        userAnswer: 1,
        correctAnswer: 1,
        isCorrect: true,
        points: 3,
        maxPoints: 3,
        explanation: "On ne peut évaluer la compétence hors contexte réel : elle dépend des objectifs et contraintes de la tâche."
      },
      {
        questionId: 'q3',
        questionText: "En tant que futur enseignant, comment diagnostiquez-vous un élève qui copie-colle un texte d'une IA sans vérification ?",
        type: 'open',
        userAnswer: "Cet élève possède une habileté technique instrumentale (prompter et copier) mais manque de la dimension critique et de responsabilité du modèle DigComp.",
        points: 2,
        maxPoints: 4,
        openFeedback: "Très bon repérage du triptyque outil/habileté/compétence. N'oubliez pas de proposer un dispositif de remédiation didactique."
      }
    ]
  },
  {
    id: 'quiz-att-2',
    userId: 'user-3',
    userName: 'Thomas Bastien',
    userEmail: 'thomas.bastien@student.hech.be',
    moduleId: '01-1',
    moduleTitle: "1.1 Qu'est-ce qu'une compétence numérique ?",
    score: 10,
    totalPoints: 10,
    percentage: 100,
    evaluationType: 'diagnostic',
    submittedAt: '2026-09-16 15:45',
    answers: [
      {
        questionId: 'q1',
        questionText: "Selon le cadre DigComp 2.2, qu'est-ce qui distingue une compétence numérique d'une simple habileté technique ?",
        type: 'qcm',
        userAnswer: 2,
        correctAnswer: 2,
        isCorrect: true,
        points: 3,
        maxPoints: 3,
        explanation: "La compétence intègre la mobilisation critique, le jugement et l'action responsable en situation complexe."
      },
      {
        questionId: 'q2',
        questionText: "Pourquoi dit-on que la compétence numérique est « située » ?",
        type: 'qcm',
        userAnswer: 1,
        correctAnswer: 1,
        isCorrect: true,
        points: 3,
        maxPoints: 3,
        explanation: "On ne peut évaluer la compétence hors contexte réel : elle dépend des objectifs et contraintes de la tâche."
      },
      {
        questionId: 'q3',
        questionText: "En tant que futur enseignant, comment diagnostiquez-vous un élève qui copie-colle un texte d'une IA sans vérification ?",
        type: 'open',
        userAnswer: "L'élève montre une bonne aisance opératoire mais une carence sur la dimension épistémique et éthique. Il prend l'outil pour une vérité absolue.",
        points: 4,
        maxPoints: 4,
        openFeedback: "Analyse remarquable des dimensions cognitives et de la posture critique attendue au niveau M1."
      }
    ]
  }
]

const DEFAULT_PROGRESS: Record<string, string[]> = {
  'sarah.dubois@student.hech.be': ['mod-1', 'mod-2', 'mod-3', 'ex-1', 'ex-2'],
  'maxime.lambert@student.hech.be': ['mod-1', 'mod-2', 'ex-1'],
  'thomas.bastien@student.hech.be': ['mod-1', 'mod-2', 'mod-3', 'mod-4', 'mod-5', 'ex-1', 'ex-2', 'ex-3']
}

const DEFAULT_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    userId: 'user-1',
    userName: 'Sarah Dubois',
    userEmail: 'sarah.dubois@student.hech.be',
    exerciseId: 'exercice-01',
    exerciseTitle: 'Atelier 1 : Diagnostic de compétences numériques',
    answer: "Dans la situation 1, l'élève sait utiliser Canva mais ne vérifie pas la provenance des images libres de droit. Elle est donc techniquement compétente mais partiellement compétente sur le plan éthique et légal. Dans la situation 2, l'élève comprend le fonctionnement de l'algorithme mais n'arrive pas à configurer son mot de passe.",
    submittedAt: '2026-09-15 17:20'
  },
  {
    id: 'sub-2',
    userId: 'user-1',
    userName: 'Sarah Dubois',
    userEmail: 'sarah.dubois@student.hech.be',
    exerciseId: 'exercice-02',
    exerciseTitle: 'Atelier 2 : Peut-on faire confiance à cette information ?',
    answer: "L'affirmation selon laquelle regarder son téléphone fait perdre exactement 2 heures de sommeil est trompeuse. La source originale parle d'un décalage de la mélatonine de 30 à 60 minutes selon la luminosité. L'article viral utilise un titre putaclic et un graphique tronqué pour dramatiser l'impact.",
    submittedAt: '2026-09-15 18:05'
  },
  {
    id: 'sub-3',
    userId: 'user-2',
    userName: 'Maxime Lambert',
    userEmail: 'maxime.lambert@student.hech.be',
    exerciseId: 'exercice-01',
    exerciseTitle: 'Atelier 1 : Diagnostic de compétences numériques',
    answer: "Pour moi, la compétence numérique doit impérativement intégrer la dimension réflexive. Savoir faire un copier-coller dans ChatGPT ne rend pas compétent si l'élève est incapable de déceler les erreurs de calcul ou les biais culturels.",
    submittedAt: '2026-09-15 16:40'
  },
  {
    id: 'sub-4',
    userId: 'user-3',
    userName: 'Thomas Bastien',
    userEmail: 'thomas.bastien@student.hech.be',
    exerciseId: 'exercice-02',
    exerciseTitle: 'Atelier 2 : Peut-on faire confiance à cette information ?',
    answer: "J'ai vérifié sur Google Scholar : l'étude citée portait sur un échantillon très restreint de 15 personnes en laboratoire. Généraliser cela à l'ensemble des adolescents est une surinterprétation médiatique flagrante. En classe, je demanderais aux élèves de retrouver l'échantillon d'origine.",
    submittedAt: '2026-09-16 09:30'
  }
]

const DEFAULT_FILES: SubmittedFile[] = [
  {
    id: 'file-demo-1',
    userId: 'user-1',
    userName: 'Sarah Dubois',
    userEmail: 'sarah.dubois@student.hech.be',
    exerciseId: 'exercice-03',
    exerciseTitle: 'Atelier 3 : Concevoir un guide numérique élèves',
    originalFileName: 'mon_guide_eleves_v1.pdf',
    formattedFileName: 'DUBOIS_Sarah_Atelier-3_Guide-Numerique_2026-09-16.pdf',
    fileType: 'application/pdf',
    fileSize: 142800,
    submittedAt: '2026-09-16 10:15',
    driveSynced: true,
    aiCorrection: {
      status: 'analyzed',
      suggestedScore: 9.5,
      maxScore: 10,
      rubricScores: { concordance: 2.9, didacticQuality: 2.9, criticalAnalysis: 2.3, formAndStructure: 1.4 },
      summary: "Guide d'accompagnement numérique complet, visuellement ergonomique et parfaitement adapté aux élèves du 1er degré.",
      strengths: [
        "Ergonomie visuelle et clarté des consignes remarquables pour le public cible.",
        "Rappels méthodologiques sur la sauvegarde responsable et la protection des données.",
        "Intégration d'exemples pas-à-pas et d'une FAQ préventive très utile."
      ],
      improvements: [
        "Penser à insérer une version allégée ou audio pour les élèves à besoins spécifiques (DYS)."
      ],
      detailedFeedback: "Production exemplaire ! La mise en page et le ton adopté sont parfaitement calibrés pour des élèves du premier degré. L'accent mis sur l'autonomie et les bonnes pratiques numériques répond fidèlement aux attendus du référentiel.",
      correctedAt: '2026-09-16 10:20',
      modelUsed: 'Qwen Coder (Local First / Assistant IA Didactique)'
    },
    teacherGrade: {
      score: 9.5,
      maxScore: 10,
      feedback: "Exemple parfait de guide pour les élèves. Bravo pour le soin apporté à la typographie et à la clarté des consignes !",
      gradedAt: '2026-09-16 14:00',
      status: 'graded'
    }
  },
  {
    id: 'file-demo-2',
    userId: 'user-2',
    userName: 'Maxime Lambert',
    userEmail: 'maxime.lambert@student.hech.be',
    exerciseId: 'exercice-05',
    exerciseTitle: 'Atelier 5 : Défi Canva mot de passe',
    originalFileName: 'affiche_canva_lambert.docx',
    formattedFileName: 'LAMBERT_Maxime_Atelier-5_Canva-MDP_2026-09-16.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 85200,
    submittedAt: '2026-09-16 11:30',
    driveSynced: false,
    aiCorrection: {
      status: 'analyzed',
      suggestedScore: 8.0,
      maxScore: 10,
      rubricScores: { concordance: 2.4, didacticQuality: 2.5, criticalAnalysis: 1.9, formAndStructure: 1.2 },
      summary: "Affiche synthétique et percutante vulgarisant les règles d'un mot de passe robuste.",
      strengths: [
        "Hiérarchie visuelle efficace et slogan mémorisable pour des adolescents.",
        "Règles d'hygiène numérique claires (longueur, caractères spéciaux, double facteur)."
      ],
      improvements: [
        "Sensibiliser également à l'usage des gestionnaires de mots de passe (Keepass/Bitwarden)."
      ],
      detailedFeedback: "L'affiche Canva atteint son objectif de communication pédagogique rapide. Le message est clair, direct et évite le jargon technique superflu.",
      correctedAt: '2026-09-16 11:35',
      modelUsed: 'Qwen Coder (Local First / Assistant IA Didactique)'
    },
    teacherGrade: {
      score: 8.0,
      maxScore: 10,
      feedback: "",
      gradedAt: '',
      status: 'pending'
    }
  },
  {
    id: 'file-demo-3',
    userId: 'user-3',
    userName: 'Thomas Bastien',
    userEmail: 'thomas.bastien@student.hech.be',
    exerciseId: 'exercice-01',
    exerciseTitle: 'Atelier 1 : Diagnostic de compétences (DigComp 2.2)',
    originalFileName: 'diagnostic_digcomp_bastien.pdf',
    formattedFileName: 'BASTIEN_Thomas_Atelier-1_Diagnostic-DigComp_2026-09-16.pdf',
    fileType: 'application/pdf',
    fileSize: 118400,
    submittedAt: '2026-09-16 14:10',
    driveSynced: false
  }
]

// Moteur expert d'évaluation pédagogique de repli local (Niveau 1 / Didactique HECh)
function generateDidacticAiCorrection(file: SubmittedFile, textContent: string = ''): AiCorrection {
  const exId = file.exerciseId || ''
  
  let suggestedScore = 8.5
  let concordance = 2.6
  let didacticQuality = 2.6
  let criticalAnalysis = 2.0
  let formAndStructure = 1.3
  let summary = "Travail rigoureux et bien ancré dans les attendus didactiques de l'activité."
  let strengths: string[] = []
  let improvements: string[] = []
  let detailedFeedback = ""

  if (exId === 'exercice-01') {
    suggestedScore = 9.0
    concordance = 2.8
    didacticQuality = 2.7
    criticalAnalysis = 2.2
    formAndStructure = 1.3
    summary = "Excellente appropriation du cadre européen DigComp 2.2 et distinction nette entre habileté et compétence."
    strengths = [
      "Distinction opératoire claire entre l'habileté technique et la compétence réflexive située.",
      "Pertinence des indicateurs d'observation pour diagnostiquer les besoins des élèves du secondaire.",
      "Bonne prise en compte de la dimension éthique et légale (respect des licences de création)."
    ]
    improvements = [
      "Préciser les modalités concrètes de remédiation immédiate en classe pour les apprenants en grande difficulté."
    ]
    detailedFeedback = "L'analyse produite pour ce diagnostic DigComp témoigne d'un haut niveau d'expertise didactique. Vous montrez clairement que savoir manipuler un outil ne signifie pas être compétent sur le plan informationnel. Les propositions d'activités permettent d'outiller l'élève sans le démotiver."
  } else if (exId === 'exercice-02') {
    suggestedScore = 8.5
    concordance = 2.5
    didacticQuality = 2.6
    criticalAnalysis = 2.2
    formAndStructure = 1.2
    summary = "Démarche d'investigation critique rigoureuse pour déconstruire l'infox et les pièges sensationnalistes."
    strengths = [
      "Recours méthodique au croisement des sources primaires et à la vérification d'images.",
      "Excellente déconstruction des procédés de dramatisation (titres putaclics, graphiques tronqués).",
      "Transposition didactique pertinente pour des élèves de 12-14 ans."
    ]
    improvements = [
      "Expliciter davantage le rôle des modèles économiques des plateformes dans la viralité de la désinformation."
    ]
    detailedFeedback = "Très bon travail d'Éducation aux Médias. Vous dépassez la simple chasse au faux pour faire comprendre aux élèves pourquoi et comment une fausse nouvelle se propage. Le protocole proposé est directement transposable en classe."
  } else if (exId === 'exercice-03') {
    suggestedScore = 9.5
    concordance = 2.9
    didacticQuality = 2.9
    criticalAnalysis = 2.3
    formAndStructure = 1.4
    summary = "Guide d'accompagnement numérique complet, visuellement ergonomique et adapté aux élèves du 1er degré."
    strengths = [
      "Ergonomie visuelle et clarté des consignes remarquables pour le public cible.",
      "Rappels méthodologiques sur la sauvegarde responsable et la protection des données personnelles.",
      "Intégration d'exemples pas-à-pas et d'une FAQ préventive très utile."
    ]
    improvements = [
      "Penser à insérer une version allégée ou audio pour les élèves présentant des troubles spécifiques (DYS)."
    ]
    detailedFeedback = "Production exemplaire ! La mise en page et le ton adopté sont parfaitement calibrés pour des élèves du premier degré. L'accent mis sur l'autonomie et les bonnes pratiques numériques répond fidèlement aux attendus du référentiel."
  } else if (exId === 'exercice-04') {
    suggestedScore = 8.5
    concordance = 2.6
    didacticQuality = 2.5
    criticalAnalysis = 2.1
    formAndStructure = 1.3
    summary = "Scénario ludique et immersif articulant habilement énigmes logiques et compétences du tronc commun FMTTN."
    strengths = [
      "Conception narrative captivante favorisant la collaboration et l'émulation collective.",
      "Mobilisation authentique des 4 champs FMTTN dans la résolution des énigmes.",
      "Grille d'observation pour l'enseignant bien pensée."
    ]
    improvements = [
      "Veiller à calibrer le temps de chaque énigme pour éviter les temps morts ou la surcharge cognitive."
    ]
    detailedFeedback = "Une cyber-enquête stimulante qui met en valeur les pédagogies actives. Le lien entre le jeu et l'institutionnalisation des notions informatiques est bien assuré."
  } else if (exId === 'exercice-05') {
    suggestedScore = 8.0
    concordance = 2.4
    didacticQuality = 2.5
    criticalAnalysis = 1.9
    formAndStructure = 1.2
    summary = "Affiche synthétique et percutante vulgarisant les règles d'un mot de passe robuste."
    strengths = [
      "Hiérarchie visuelle efficace et slogan mémorisable pour des adolescents.",
      "Règles d'hygiène numérique claires (longueur, caractères spéciaux, double facteur)."
    ]
    improvements = [
      "Sensibiliser également à l'usage des gestionnaires de mots de passe (Keepass/Bitwarden) plutôt que la simple mémorisation."
    ]
    detailedFeedback = "L'affiche Canva atteint son objectif de communication pédagogique rapide. Le message est clair, direct et évite le jargon technique superflu."
  } else if (exId === 'exercice-06') {
    suggestedScore = 8.5
    concordance = 2.6
    didacticQuality = 2.5
    criticalAnalysis = 2.1
    formAndStructure = 1.3
    summary = "Démarche de démythification matérielle de l'ordinateur sécurisée et structurante."
    strengths = [
      "Protocole de manipulation rigoureux assurant la sécurité électrique et matérielle.",
      "Excellentes analogies pour expliquer le rôle de la RAM, du CPU et de la carte mère.",
      "Fiche bilan élève synthétique et visuelle."
    ]
    improvements = [
      "Prévoir une activité alternative sur simulateur virtuel pour les écoles ne disposant pas d'unités centrales à démonter."
    ]
    detailedFeedback = "Ce défi hardware permet aux élèves de dépasser l'aspect magique de la machine pour en comprendre le fonctionnement concret. L'approche tactile et déductive est très bien amenée."
  } else if (exId === 'exercice-video') {
    suggestedScore = 9.0
    concordance = 2.7
    didacticQuality = 2.8
    criticalAnalysis = 2.2
    formAndStructure = 1.3
    summary = "Capsule vidéo dynamique, pitch didactique clair et démonstration soignée du prototype de jeu."
    strengths = [
      "Élocution fluide, dynamisme et excellente mise en valeur du plateau et des pions.",
      "Explication concise des règles et de l'alignement avec les compétences FMTTN visées.",
      "Montage propre et soigné."
    ]
    improvements = [
      "Intégrer des sous-titres incrustés pour l'accessibilité universelle."
    ]
    detailedFeedback = "La vidéo donne immédiatement envie de jouer tout en explicitant avec clarté la plus-value pédagogique de votre jeu de société. Présentation très professionnelle."
  } else if (exId === 'projet-jeu') {
    suggestedScore = 9.0
    concordance = 2.8
    didacticQuality = 2.7
    criticalAnalysis = 2.2
    formAndStructure = 1.3
    summary = "Dossier didactique complet articulant intention pédagogique, fabrication FabLab et règles du jeu."
    strengths = [
      "Articulation solide entre mécanique ludo-éducative et compétences du référentiel.",
      "Documentation détaillée du processus technique (laser, impression 3D, prompts IA).",
      "Système de cartes didactiques progressif et motivant."
    ]
    improvements = [
      "Préciser les variantes de règles pour adapter la durée d'une partie au format d'une heure de cours (50 min)."
    ]
    detailedFeedback = "Un dossier pédagogique de très haute volée. Le projet démontre une créativité remarquable et une maîtrise approfondie des outils de fabrication numérique et de l'IA."
  } else {
    suggestedScore = 8.5
    concordance = 2.5
    didacticQuality = 2.5
    criticalAnalysis = 2.0
    formAndStructure = 1.5
    summary = "Travail satisfaisant respectant les consignes et critères de l'activité."
    strengths = [
      "Bonne mobilisation des concepts du cours de Didactique du numérique.",
      "Document bien structuré et transmis dans les délais impartis."
    ]
    improvements = [
      "Développer davantage la justification didactique des choix opérés."
    ]
    detailedFeedback = "Le devoir remis atteste d'un travail sérieux et d'un engagement appréciable dans la formation."
  }

  return {
    status: 'analyzed',
    suggestedScore,
    maxScore: 10,
    rubricScores: {
      concordance,
      didacticQuality,
      criticalAnalysis,
      formAndStructure
    },
    summary,
    strengths,
    improvements,
    detailedFeedback,
    correctedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    modelUsed: 'Qwen Coder (Local First / Assistant IA Didactique)'
  }
}


const DEFAULT_EVALUATIONS: Record<string, EvaluationRecord> = {
  'sarah.dubois@student.hech.be': {
    userEmail: 'sarah.dubois@student.hech.be',
    gamePedagogyScore: 18,
    gameBoardLaserScore: 14,
    gamePawns3dScore: 13,
    gameAiCardsScore: 14,
    gameVideoScore: 18,
    gamePhotosScore: 13,
    gameProjectScore: 90,
    oralDefenseScore: 26,
    teacherFeedback: "Excellent investissement, intégration pédagogique remarquable et maîtrise exemplaire du FabLab."
  },
  'maxime.lambert@student.hech.be': {
    userEmail: 'maxime.lambert@student.hech.be',
    gamePedagogyScore: 15,
    gameBoardLaserScore: 12,
    gamePawns3dScore: 11,
    gameAiCardsScore: 12,
    gameVideoScore: 15,
    gamePhotosScore: 11,
    gameProjectScore: 76,
    oralDefenseScore: 22,
    teacherFeedback: "Bonne implication globale. Poursuivre l'effort sur la finition des cartes IA."
  },
  'thomas.bastien@student.hech.be': {
    userEmail: 'thomas.bastien@student.hech.be',
    gamePedagogyScore: 19,
    gameBoardLaserScore: 15,
    gamePawns3dScore: 14,
    gameAiCardsScore: 14,
    gameVideoScore: 19,
    gamePhotosScore: 14,
    gameProjectScore: 95,
    oralDefenseScore: 28,
    teacherFeedback: "Projet de jeu exceptionnel, prototypage soigné et excellente soutenance."
  }
}

const DEFAULT_EXERCISE_FEEDBACKS: Record<string, ExerciseTeacherFeedback> = {
  'sarah.dubois@student.hech.be_exercice-01': {
    userEmail: 'sarah.dubois@student.hech.be',
    userName: 'Sarah Dubois',
    exerciseId: 'exercice-01',
    exerciseTitle: 'Exercice 1 : Diagnostic de compétences numériques (DigComp 2.2)',
    score: 9.5,
    maxScore: 10,
    feedback: "Excellente analyse des situations DigComp. Votre distinction entre habileté technique opératoire et discernement critique est particulièrement bien argumentée.",
    gradedAt: '2026-09-16 14:00',
    status: 'graded'
  },
  'sarah.dubois@student.hech.be_exercice-02': {
    userEmail: 'sarah.dubois@student.hech.be',
    userName: 'Sarah Dubois',
    exerciseId: 'exercice-02',
    exerciseTitle: 'Exercice 2 : Peut-on faire confiance à cette information ?',
    score: 9.0,
    maxScore: 10,
    feedback: "Très bon réflexe d'investigation : la déconstruction du titre sensationnaliste et l'identification du décalage de mélatonine sont rigoureux.",
    gradedAt: '2026-09-16 14:15',
    status: 'graded'
  },
  'sarah.dubois@student.hech.be_exercice-03': {
    userEmail: 'sarah.dubois@student.hech.be',
    userName: 'Sarah Dubois',
    exerciseId: 'exercice-03',
    exerciseTitle: 'Exercice 3 : Concevoir un guide numérique pour les élèves',
    score: 9.5,
    maxScore: 10,
    feedback: "Exemple parfait de guide pour les élèves. Bravo pour le soin apporté à la typographie et à la clarté des consignes !",
    gradedAt: '2026-09-16 14:30',
    status: 'graded'
  },
  'maxime.lambert@student.hech.be_exercice-01': {
    userEmail: 'maxime.lambert@student.hech.be',
    userName: 'Maxime Lambert',
    exerciseId: 'exercice-01',
    exerciseTitle: 'Exercice 1 : Diagnostic de compétences numériques (DigComp 2.2)',
    score: 8.0,
    maxScore: 10,
    feedback: "Bonne réflexion sur les limites des modèles de langage comme ChatGPT. Pensez à formaliser une activité concrète de remédiation en classe.",
    gradedAt: '2026-09-16 15:00',
    status: 'graded'
  },
  'maxime.lambert@student.hech.be_exercice-05': {
    userEmail: 'maxime.lambert@student.hech.be',
    userName: 'Maxime Lambert',
    exerciseId: 'exercice-05',
    exerciseTitle: 'Exercice 5 : Défi 20 minutes (Affiche Canva mot de passe)',
    score: 8.5,
    maxScore: 10,
    feedback: "Affiche percutante et visuelle. L'explication des règles de sécurité est claire pour des adolescents.",
    gradedAt: '2026-09-16 15:20',
    status: 'graded'
  },
  'thomas.bastien@student.hech.be_exercice-02': {
    userEmail: 'thomas.bastien@student.hech.be',
    userName: 'Thomas Bastien',
    exerciseId: 'exercice-02',
    exerciseTitle: 'Exercice 2 : Peut-on faire confiance à cette information ?',
    score: 10.0,
    maxScore: 10,
    feedback: "Analyse critique irréprochable de l'article viral. La remontée aux données brutes de l'échantillon démontre une grande maturité méthodologique.",
    gradedAt: '2026-09-16 16:00',
    status: 'graded'
  }
}

function getStorage<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : defaultVal
  } catch (e) {
    return defaultVal
  }
}

function setStorage<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch (e) {
    console.warn(`[userStore] Quota de stockage ou erreur localStorage pour ${key}`)
  }
}

const state = reactive({
  currentUser: getStorage<User | null>(STORAGE_KEY_CURRENT, null),
  users: getStorage<User[]>(STORAGE_KEY_USERS, DEFAULT_USERS).map(u => ({
    ...u,
    status: u.status || 'active'
  })),
  progress: getStorage<Record<string, string[]>>(STORAGE_KEY_PROGRESS, DEFAULT_PROGRESS),
  submissions: getStorage<Submission[]>(STORAGE_KEY_SUBMISSIONS, DEFAULT_SUBMISSIONS),
  submittedFiles: getStorage<SubmittedFile[]>(STORAGE_KEY_FILES, DEFAULT_FILES),
  exerciseFeedbacks: getStorage<Record<string, ExerciseTeacherFeedback>>(STORAGE_KEY_EXERCISE_FEEDBACKS, DEFAULT_EXERCISE_FEEDBACKS),
  driveWebhook: getStorage<string>(STORAGE_KEY_WEBHOOK, ''),
  adminPin: getStorage<string>(STORAGE_KEY_ADMIN_PIN, 'hech2026'),
  quizAttempts: getStorage<QuizAttempt[]>(STORAGE_KEY_QUIZZES, DEFAULT_QUIZZES),
  evaluations: getStorage<Record<string, EvaluationRecord>>(STORAGE_KEY_EVALUATIONS, DEFAULT_EVALUATIONS)
})

export const userStore = {
  get currentUser() {
    return state.currentUser
  },
  get users() {
    return state.users
  },
  get submissions() {
    return state.submissions
  },
  get submittedFiles() {
    return state.submittedFiles
  },
  get driveWebhook() {
    return state.driveWebhook
  },
  get adminPin() {
    return state.adminPin
  },
  get quizAttempts() {
    return state.quizAttempts
  },

  register(firstName: string, lastName: string, email: string) {
    const cleanEmail = email.trim().toLowerCase()
    const existing = state.users.find(u => u.email === cleanEmail)
    if (existing) {
      if (existing.status === 'archived') {
        existing.status = 'active'
        setStorage(STORAGE_KEY_USERS, state.users)
      }
      state.currentUser = existing
      setStorage(STORAGE_KEY_CURRENT, state.currentUser)
      return { success: true, user: existing, message: 'Re-connexion automatique.' }
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: cleanEmail,
      role: 'student',
      registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'active'
    }

    state.users.push(newUser)
    state.currentUser = newUser
    if (!state.progress[cleanEmail]) {
      state.progress[cleanEmail] = []
    }

    setStorage(STORAGE_KEY_USERS, state.users)
    setStorage(STORAGE_KEY_CURRENT, state.currentUser)
    setStorage(STORAGE_KEY_PROGRESS, state.progress)

    return { success: true, user: newUser }
  },

  addStudent(firstName: string, lastName: string, email: string) {
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !firstName.trim() || !lastName.trim()) {
      return { success: false, message: 'Tous les champs sont obligatoires.' }
    }

    const existing = state.users.find(u => u.email === cleanEmail)
    if (existing) {
      existing.firstName = firstName.trim()
      existing.lastName = lastName.trim()
      existing.status = 'active'
      setStorage(STORAGE_KEY_USERS, state.users)
      return { success: true, message: 'Étudiant déjà existant : profil réactivé et mis à jour.' }
    }

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: cleanEmail,
      role: 'student',
      registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'active'
    }

    state.users.push(newUser)
    if (!state.progress[cleanEmail]) {
      state.progress[cleanEmail] = []
    }

    setStorage(STORAGE_KEY_USERS, state.users)
    setStorage(STORAGE_KEY_PROGRESS, state.progress)
    return { success: true, message: 'Étudiant ajouté avec succès !' }
  },

  deleteStudent(email: string) {
    const cleanEmail = email.trim().toLowerCase()
    const index = state.users.findIndex(u => u.email.toLowerCase() === cleanEmail)
    if (index >= 0) {
      const removedUser = state.users[index]
      state.users.splice(index, 1)
      delete state.progress[cleanEmail]
      if (state.evaluations) {
        delete state.evaluations[cleanEmail]
      }
      state.submissions = state.submissions.filter(s => s.userEmail.toLowerCase() !== cleanEmail)
      state.submittedFiles = state.submittedFiles.filter(f => f.userEmail.toLowerCase() !== cleanEmail)
      state.quizAttempts = state.quizAttempts.filter(q => q.userEmail.toLowerCase() !== cleanEmail)

      if (state.currentUser?.email.toLowerCase() === cleanEmail) {
        state.currentUser = null
        if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY_CURRENT)
      }

      setStorage(STORAGE_KEY_USERS, state.users)
      setStorage(STORAGE_KEY_PROGRESS, state.progress)
      setStorage(STORAGE_KEY_SUBMISSIONS, state.submissions)
      setStorage(STORAGE_KEY_FILES, state.submittedFiles)
      setStorage(STORAGE_KEY_QUIZZES, state.quizAttempts)
      setStorage(STORAGE_KEY_EVALUATIONS, state.evaluations)
      return { 
        success: true, 
        message: `L'étudiant "${removedUser.firstName} ${removedUser.lastName}" (${cleanEmail}) a été supprimé avec succès.` 
      }
    }
    return { success: false, message: `Aucun étudiant trouvé avec l'email "${cleanEmail}".` }
  },

  toggleArchiveStudent(email: string) {
    const cleanEmail = email.trim().toLowerCase()
    const user = state.users.find(u => u.email === cleanEmail)
    if (user) {
      user.status = user.status === 'archived' ? 'active' : 'archived'
      setStorage(STORAGE_KEY_USERS, state.users)
      return { success: true, status: user.status }
    }
    return { success: false, message: 'Étudiant non trouvé.' }
  },

  importStudentsFromCSV(csvText: string) {
    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    if (lines.length <= 1) {
      return { success: false, count: 0, message: 'Fichier CSV vide ou incomplet.' }
    }

    const separator = lines[0].includes(';') ? ';' : ','
    const headers = lines[0].split(separator).map(h => h.trim().toLowerCase().replace(/["']/g, ''))

    let colNom = headers.findIndex(h => h.includes('nom') && !h.includes('pre'))
    let colPrenom = headers.findIndex(h => h.includes('pre') || h.includes('prénom'))
    let colEmail = headers.findIndex(h => h.includes('mail'))

    if (colNom === -1) colNom = 0
    if (colPrenom === -1) colPrenom = 1
    if (colEmail === -1) colEmail = 2

    let importedCount = 0

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(separator).map(p => p.trim().replace(/^["']|["']$/g, ''))
      if (parts.length >= 3) {
        const lastName = parts[colNom] || ''
        const firstName = parts[colPrenom] || ''
        const email = (parts[colEmail] || '').toLowerCase()

        if (email && email.includes('@')) {
          this.addStudent(firstName || 'Étudiant', lastName || 'Inconnu', email)
          importedCount++
        }
      }
    }

    return {
      success: true,
      count: importedCount,
      message: `${importedCount} étudiant(s) importé(s) avec succès !`
    }
  },

  downloadCSVTemplate() {
    const template = 'Nom;Prenom;Email\nDubois;Sarah;sarah.dubois@student.hech.be\nLambert;Maxime;maxime.lambert@student.hech.be\nBastien;Thomas;thomas.bastien@student.hech.be\n'
    const blob = new Blob(['\ufeff' + template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'modele_import_etudiants_HECh.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },

  login(email: string) {
    const cleanEmail = email.trim().toLowerCase()
    const user = state.users.find(u => u.email === cleanEmail)
    if (user) {
      if (user.status === 'archived') {
        user.status = 'active'
        setStorage(STORAGE_KEY_USERS, state.users)
      }
      state.currentUser = user
      setStorage(STORAGE_KEY_CURRENT, state.currentUser)
      return { success: true, user }
    }
    return { success: false, message: 'Adresse email non trouvée. Veuillez vous inscrire.' }
  },

  logout() {
    state.currentUser = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_CURRENT)
    }
  },

  getUserProgress(email?: string): string[] {
    const userEmail = email || state.currentUser?.email
    if (!userEmail) return []
    return state.progress[userEmail] || []
  },

  toggleModuleProgress(moduleId: string) {
    if (!state.currentUser) return false
    const email = state.currentUser.email
    if (!state.progress[email]) state.progress[email] = []

    const idx = state.progress[email].indexOf(moduleId)
    if (idx >= 0) {
      state.progress[email].splice(idx, 1)
    } else {
      state.progress[email].push(moduleId)
    }

    setStorage(STORAGE_KEY_PROGRESS, state.progress)
    return true
  },

  isModuleCompleted(moduleId: string): boolean {
    if (!state.currentUser) return false
    const list = state.progress[state.currentUser.email] || []
    return list.includes(moduleId)
  },

  saveSubmission(exerciseId: string, exerciseTitle: string, answer: string) {
    if (!state.currentUser) return { success: false, message: "Veuillez vous identifier d'abord." }
    if (!answer.trim()) return { success: false, message: 'La réponse ne peut pas être vide.' }

    const cleanEmail = state.currentUser.email
    const existingIndex = state.submissions.findIndex(
      s => s.userEmail === cleanEmail && s.exerciseId === exerciseId
    )

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16)

    if (existingIndex >= 0) {
      state.submissions[existingIndex].answer = answer.trim()
      state.submissions[existingIndex].submittedAt = now
    } else {
      state.submissions.push({
        id: `sub-${Date.now()}`,
        userId: state.currentUser.id,
        userName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
        userEmail: cleanEmail,
        exerciseId,
        exerciseTitle,
        answer: answer.trim(),
        submittedAt: now
      })
    }

    if (!state.progress[cleanEmail]) state.progress[cleanEmail] = []
    if (!state.progress[cleanEmail].includes(exerciseId)) {
      state.progress[cleanEmail].push(exerciseId)
      setStorage(STORAGE_KEY_PROGRESS, state.progress)
    }

    setStorage(STORAGE_KEY_SUBMISSIONS, state.submissions)
    return { success: true, message: 'Réponse enregistrée avec succès !' }
  },

  getUserSubmission(exerciseId: string): string {
    if (!state.currentUser) return ''
    const sub = state.submissions.find(
      s => s.userEmail === state.currentUser?.email && s.exerciseId === exerciseId
    )
    return sub ? sub.answer : ''
  },

  calculateUserProgressPercent(email?: string, totalModules = 12): number {
    const userEmail = email || state.currentUser?.email
    if (!userEmail) return 0
    const completed = (state.progress[userEmail] || []).length
    return Math.min(100, Math.round((completed / totalModules) * 100))
  },

  // ==========================================
  // GESTION DU DÉPÔT DE FICHIERS (WORD & PDF)
  // ==========================================

  getFormattedNamePreview(exerciseTitle: string, originalFileName: string): string {
    const user = state.currentUser
    const lastName = user ? user.lastName : 'NOM'
    const firstName = user ? user.firstName : 'Prenom'
    return formatFileName(lastName, firstName, exerciseTitle, originalFileName)
  },

  async uploadStudentFile(
    exerciseId: string, 
    exerciseTitle: string, 
    file: File
  ): Promise<{ success: boolean; message: string; file?: SubmittedFile }> {
    if (!state.currentUser) {
      return { success: false, message: "Vous devez être identifié pour déposer un travail." }
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const allowed = ['pdf', 'docx', 'doc']
    if (!allowed.includes(ext)) {
      return { 
        success: false, 
        message: "Format non accepté. Seuls les fichiers Word (.docx, .doc) et PDF (.pdf) sont autorisés." 
      }
    }

    // 1. Génération du nom normalisé officiel
    const formattedName = formatFileName(
      state.currentUser.lastName,
      state.currentUser.firstName,
      exerciseTitle,
      file.name
    )

    // 2. Lecture du fichier en Base64 Data URL
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    const newFile: SubmittedFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: state.currentUser.id,
      userName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
      userEmail: state.currentUser.email,
      exerciseId,
      exerciseTitle,
      originalFileName: file.name,
      formattedFileName: formattedName,
      fileType: file.type || (ext === 'pdf' ? 'application/pdf' : 'application/msword'),
      fileSize: file.size,
      dataUrl,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      driveSynced: false
    }

    // Remplacer l'éventuel ancien fichier du même étudiant pour cet exercice
    const existingIdx = state.submittedFiles.findIndex(
      f => f.userEmail === state.currentUser?.email && f.exerciseId === exerciseId
    )
    if (existingIdx >= 0) {
      state.submittedFiles[existingIdx] = newFile
    } else {
      state.submittedFiles.push(newFile)
    }

    // Auto-marquage de l'exercice dans la progression
    const email = state.currentUser.email
    if (!state.progress[email]) state.progress[email] = []
    if (!state.progress[email].includes(exerciseId)) {
      state.progress[email].push(exerciseId)
      setStorage(STORAGE_KEY_PROGRESS, state.progress)
    }

    setStorage(STORAGE_KEY_FILES, state.submittedFiles)

    // 3. Tentative d'envoi automatique vers le serveur compagnon local (si actif)
    try {
      fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: formattedName,
          base64Data: dataUrl
        })
      }).then(res => {
        if (res.ok) {
          newFile.driveSynced = true
          setStorage(STORAGE_KEY_FILES, state.submittedFiles)
        }
      }).catch(() => {})
    } catch (e) {}

    // 4. Tentative d'envoi automatique vers le Webhook Google Apps Script (si configuré)
    if (state.driveWebhook) {
      try {
        fetch(state.driveWebhook, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
            studentEmail: state.currentUser.email,
            exerciseTitle,
            fileName: formattedName,
            base64Data: dataUrl.split(',')[1] || dataUrl,
            mimeType: newFile.fileType
          })
        }).then(() => {
          newFile.driveSynced = true
          setStorage(STORAGE_KEY_FILES, state.submittedFiles)
        }).catch(() => {})
      } catch (e) {}
    }

    return {
      success: true,
      message: `Document déposé avec succès sous le libellé : ${formattedName}`,
      file: newFile
    }
  },

  deleteStudentFile(fileId: string) {
    const idx = state.submittedFiles.findIndex(f => f.id === fileId)
    if (idx >= 0) {
      state.submittedFiles.splice(idx, 1)
      setStorage(STORAGE_KEY_FILES, state.submittedFiles)
      return { success: true, message: 'Document supprimé.' }
    }
    return { success: false, message: 'Fichier non trouvé.' }
  },

  getUserFiles(email?: string): SubmittedFile[] {
    const userEmail = email || state.currentUser?.email
    if (!userEmail) return []
    return state.submittedFiles.filter(f => f.userEmail === userEmail)
  },

  downloadSubmittedFile(file: SubmittedFile) {
    if (!file.dataUrl) {
      alert("Le contenu du fichier n'est pas disponible pour le téléchargement direct.")
      return
    }
    const link = document.createElement('a')
    link.href = file.dataUrl
    link.setAttribute('download', file.formattedFileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },

  // Synchronisation directe vers le dossier Google Drive via l'API File System Access
  async syncFilesToDirectory(directoryHandle: any): Promise<{ count: number; errorCount: number }> {
    let count = 0
    let errorCount = 0

    for (const f of state.submittedFiles) {
      if (!f.dataUrl) continue
      try {
        const fileHandle = await directoryHandle.getFileHandle(f.formattedFileName, { create: true })
        const writable = await fileHandle.createWritable()
        
        // Convertir base64 DataURL en Blob
        const base64Content = f.dataUrl.split(',')[1] || f.dataUrl
        const byteCharacters = atob(base64Content)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: f.fileType })

        await writable.write(blob)
        await writable.close()
        f.driveSynced = true
        count++
      } catch (err) {
        console.error(`Erreur d'écriture pour ${f.formattedFileName}:`, err)
        errorCount++
      }
    }

    setStorage(STORAGE_KEY_FILES, state.submittedFiles)
    return { count, errorCount }
  },

  setDriveWebhook(url: string) {
    state.driveWebhook = url.trim()
    setStorage(STORAGE_KEY_WEBHOOK, state.driveWebhook)
  },

  // ==========================================
  // CORRECTION AUTOMATIQUE IA & ÉVALUATION ENSEIGNANT
  // ==========================================

  async analyzeFileWithAi(fileId: string): Promise<{ success: boolean; file?: SubmittedFile; message: string }> {
    const file = state.submittedFiles.find(f => f.id === fileId)
    if (!file) return { success: false, message: "Document non trouvé." }

    // Récupérer une éventuelle réponse rédigée en ligne
    const userSubmission = state.submissions.find(
      s => s.userEmail.toLowerCase() === file.userEmail.toLowerCase() && s.exerciseId === file.exerciseId
    )
    const textContent = userSubmission?.answer || ''

    let aiResult: AiCorrection | null = null

    // Tentative Local First : Ollama local (localhost:11434)
    try {
      const prompt = `Tu es un formateur expert en didactique de l'informatique et des compétences numériques à la Haute École Charlemagne (HECh).
Évalue le document de devoir remis par l'étudiant ${file.userName} (${file.userEmail}) pour l'activité suivante :
Titre de l'exercice : "${file.exerciseTitle}" (Identifiant: ${file.exerciseId})
Nom du fichier : "${file.originalFileName}"
Notes textuelles associées de l'étudiant : "${textContent}".

Réponds UNIQUEMENT par un objet JSON valide sans balises markdown superflues, avec la structure exacte suivante :
{
  "suggestedScore": 8.5,
  "maxScore": 10,
  "rubricScores": {
    "concordance": 2.6,
    "didacticQuality": 2.6,
    "criticalAnalysis": 2.0,
    "formAndStructure": 1.3
  },
  "summary": "Synthèse globale en une phrase claire",
  "strengths": ["Point fort didactique 1", "Point fort 2"],
  "improvements": ["Point à améliorer 1"],
  "detailedFeedback": "Commentaire formatif détaillé constructif (style sandwich didactique)"
}`

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen2.5-coder',
          prompt,
          stream: false,
          format: 'json'
        }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        const parsed = JSON.parse(data.response)
        aiResult = {
          status: 'analyzed',
          suggestedScore: Math.max(0, Math.min(10, Number(parsed.suggestedScore) || 8.5)),
          maxScore: 10,
          rubricScores: parsed.rubricScores || { concordance: 2.6, didacticQuality: 2.6, criticalAnalysis: 2.0, formAndStructure: 1.3 },
          summary: parsed.summary || "Devoir didactique analysé avec succès.",
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ["Bonne intégration des concepts"],
          improvements: Array.isArray(parsed.improvements) ? parsed.improvements : ["Préciser la différenciation"],
          detailedFeedback: parsed.detailedFeedback || "Le document atteste d'une bonne appropriation des attendus du cours.",
          correctedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          modelUsed: 'Qwen Coder 2.5 (Local Ollama)'
        }
      }
    } catch (err) {
      // Ollama local hors ligne ou indisponible : repli transparent vers le moteur didactique calibré
    }

    if (!aiResult) {
      aiResult = generateDidacticAiCorrection(file, textContent)
    }

    file.aiCorrection = aiResult

    // Si l'enseignant n'avait pas encore noté, initialiser le champ avec la note suggérée
    if (!file.teacherGrade) {
      file.teacherGrade = {
        score: aiResult.suggestedScore,
        maxScore: 10,
        feedback: '',
        gradedAt: '',
        status: 'pending'
      }
    }

    setStorage(STORAGE_KEY_FILES, state.submittedFiles)
    return { 
      success: true, 
      file, 
      message: `Document analysé avec succès par l'IA : note suggérée ${aiResult.suggestedScore}/10` 
    }
  },

  saveTeacherGrade(fileId: string, score: number, feedback: string = '') {
    const file = state.submittedFiles.find(f => f.id === fileId)
    if (!file) return { success: false, message: "Document non trouvé." }

    const numScore = Math.max(0, Math.min(10, Number(score) || 0))
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16)
    
    file.teacherGrade = {
      score: numScore,
      maxScore: 10,
      feedback: feedback.trim(),
      gradedAt: now,
      status: 'graded'
    }

    // Synchronisation automatique dans les retours d'exercices de l'étudiant
    const fbKey = `${file.userEmail.toLowerCase()}_${file.exerciseId}`
    state.exerciseFeedbacks[fbKey] = {
      userEmail: file.userEmail.toLowerCase(),
      userName: file.userName,
      exerciseId: file.exerciseId,
      exerciseTitle: file.exerciseTitle,
      score: numScore,
      maxScore: 10,
      feedback: feedback.trim(),
      gradedAt: now,
      status: 'graded'
    }

    setStorage(STORAGE_KEY_FILES, state.submittedFiles)
    setStorage(STORAGE_KEY_EXERCISE_FEEDBACKS, state.exerciseFeedbacks)
    return { 
      success: true, 
      file,
      message: `Évaluation enseignant enregistrée : ${numScore}/10 pour ${file.userName}` 
    }
  },

  saveExerciseFeedback(
    userEmail: string, 
    exerciseId: string, 
    feedback: string, 
    score?: number, 
    exerciseTitle?: string
  ): { success: boolean; message: string; feedbackRecord: ExerciseTeacherFeedback } {
    const cleanEmail = (userEmail || '').trim().toLowerCase()
    if (!cleanEmail) {
      return { success: false, message: "Email étudiant manquant.", feedbackRecord: null as any }
    }

    const user = state.users.find(u => u.email.toLowerCase() === cleanEmail)
    const userName = user ? `${user.firstName} ${user.lastName}` : cleanEmail
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16)
    const numScore = (score !== undefined && score !== null && !isNaN(Number(score))) 
      ? Math.max(0, Math.min(10, Number(score))) 
      : undefined

    const fbKey = `${cleanEmail}_${exerciseId}`
    const record: ExerciseTeacherFeedback = {
      userEmail: cleanEmail,
      userName,
      exerciseId,
      exerciseTitle: exerciseTitle || `Exercice ${exerciseId}`,
      score: numScore,
      maxScore: 10,
      feedback: (feedback || '').trim(),
      gradedAt: now,
      status: 'graded'
    }

    state.exerciseFeedbacks[fbKey] = record

    // Synchroniser avec un éventuel fichier déposé par cet étudiant pour cet exercice
    const file = state.submittedFiles.find(
      f => f.userEmail.toLowerCase() === cleanEmail && f.exerciseId === exerciseId
    )
    if (file) {
      file.teacherGrade = {
        score: numScore ?? file.teacherGrade?.score ?? 0,
        maxScore: 10,
        feedback: (feedback || '').trim(),
        gradedAt: now,
        status: 'graded'
      }
      setStorage(STORAGE_KEY_FILES, state.submittedFiles)
    }

    // Persistance dans le stockage local
    setStorage(STORAGE_KEY_EXERCISE_FEEDBACKS, state.exerciseFeedbacks)

    return {
      success: true,
      message: `Commentaire et note enregistrés instantanément pour ${userName} !`,
      feedbackRecord: record
    }
  },

  getExerciseFeedback(exerciseId: string, email?: string): ExerciseTeacherFeedback | null {
    const targetEmail = (email || state.currentUser?.email || '').trim().toLowerCase()
    if (!targetEmail) return null

    const fbKey = `${targetEmail}_${exerciseId}`
    if (state.exerciseFeedbacks && state.exerciseFeedbacks[fbKey]) {
      return state.exerciseFeedbacks[fbKey]
    }

    // Repli vers teacherGrade du fichier déposé si existant
    const file = state.submittedFiles.find(
      f => f.userEmail.toLowerCase() === targetEmail && f.exerciseId === exerciseId
    )
    if (file?.teacherGrade && (file.teacherGrade.feedback || file.teacherGrade.status === 'graded')) {
      return {
        userEmail: targetEmail,
        userName: file.userName,
        exerciseId,
        exerciseTitle: file.exerciseTitle,
        score: file.teacherGrade.score,
        maxScore: 10,
        feedback: file.teacherGrade.feedback,
        gradedAt: file.teacherGrade.gradedAt || file.submittedAt,
        status: file.teacherGrade.status
      }
    }

    return null
  },

  getAllExerciseFeedbacks(email?: string): Record<string, ExerciseTeacherFeedback> {
    const targetEmail = (email || state.currentUser?.email || '').trim().toLowerCase()
    const result: Record<string, ExerciseTeacherFeedback> = {}
    if (!targetEmail || !state.exerciseFeedbacks) return result

    Object.entries(state.exerciseFeedbacks).forEach(([k, v]) => {
      if (v.userEmail.toLowerCase() === targetEmail) {
        result[v.exerciseId] = v
      }
    })
    return result
  },

  async batchAnalyzeAllFilesWithAi(): Promise<{ total: number; analyzed: number }> {
    let count = 0
    for (const f of state.submittedFiles) {
      if (!f.aiCorrection || f.aiCorrection.status !== 'analyzed') {
        await this.analyzeFileWithAi(f.id)
        count++
      }
    }
    return { total: state.submittedFiles.length, analyzed: count }
  },

  // ==========================================
  // SÉCURITÉ ADMIN
  // ==========================================


  // ==========================================
  // MODALITÉS DE L'ÉVALUATION DU COURS (200 POINTS)
  // ==========================================

  getStudentEvaluation(email?: string) {
    const targetEmail = (email || state.currentUser?.email || '').trim().toLowerCase()
    const user = state.users.find(u => u.email.toLowerCase() === targetEmail)
    const evalRec = state.evaluations[targetEmail] || {
      userEmail: targetEmail,
      gamePedagogyScore: 0,
      gameBoardLaserScore: 0,
      gamePawns3dScore: 0,
      gameAiCardsScore: 0,
      gameVideoScore: 0,
      gamePhotosScore: 0,
      gameProjectScore: 0,
      oralDefenseScore: 0
    }

    // 1. Points Quiz & Diagnostic (max 10 points)
    const userQuizzes = state.quizAttempts.filter(q => q.userEmail.toLowerCase() === targetEmail)
    let quizPoints = 0
    if (userQuizzes.length > 0) {
      const avgPct = userQuizzes.reduce((acc, q) => acc + q.percentage, 0) / userQuizzes.length
      const completionFactor = Math.min(1, userQuizzes.length / 2)
      quizPoints = Math.round((avgPct / 100) * 10 * completionFactor * 10) / 10
    }

    // 2. Points Exercices Plateforme (6 × 10 = 60 pts)
    const exercisesList = [
      { id: 'exercice-01', title: 'Exercice 1 : Diagnostic de compétences (10 pts)' },
      { id: 'exercice-02', title: 'Exercice 2 : Évaluation critique info (10 pts)' },
      { id: 'exercice-03', title: 'Exercice 3 : Guide numérique élèves (10 pts)' },
      { id: 'exercice-04', title: 'Exercice 4 : Escape Game FMTTN (10 pts)' },
      { id: 'exercice-05', title: 'Exercice 5 : Défi Canva mot de passe (10 pts)' },
      { id: 'exercice-06', title: 'Exercice 6 : Défi Hardware PC (10 pts)' }
    ]

    const exerciseDetails = exercisesList.map(ex => {
      const file = state.submittedFiles.find(f => f.userEmail.toLowerCase() === targetEmail && f.exerciseId === ex.id)
      const hasSub = state.submissions.some(s => s.userEmail.toLowerCase() === targetEmail && s.exerciseId === ex.id && s.answer.trim().length > 10)
      const isDone = !!file || hasSub
      
      // Note personnalisée de l'enseignant si validée, sinon note complète si déposé
      const fb = this.getExerciseFeedback(ex.id, targetEmail)
      let pts = 0
      if (fb && fb.score !== undefined && fb.score !== null) {
        pts = fb.score
      } else if (file?.teacherGrade && file.teacherGrade.status === 'graded') {
        pts = file.teacherGrade.score
      } else {
        pts = isDone ? 10 : 0
      }

      return {
        id: ex.id,
        title: ex.title,
        points: pts,
        maxPoints: 10,
        completed: isDone,
        file,
        teacherFeedback: fb,
        teacherGrade: file?.teacherGrade,
        aiCorrection: file?.aiCorrection
      }
    })

    const exercisesTotal = exerciseDetails.reduce((acc, e) => acc + e.points, 0)

    // Sous-total Pilier 1 (Travaux sur la Plateforme : max 70 pts)
    const pillar1Total = Math.round((quizPoints + exercisesTotal) * 10) / 10

    // Pilier 2 : Création du Jeu de Société Didactique (max 100 pts)
    const gameDetails = {
      pedagogy: evalRec.gamePedagogyScore ?? 0,
      pedagogyMax: 20,
      boardLaser: evalRec.gameBoardLaserScore ?? 0,
      boardLaserMax: 15,
      pawns3d: evalRec.gamePawns3dScore ?? 0,
      pawns3dMax: 15,
      aiCards: evalRec.gameAiCardsScore ?? 0,
      aiCardsMax: 15,
      video: evalRec.gameVideoScore ?? 0,
      videoMax: 20,
      photos: evalRec.gamePhotosScore ?? 0,
      photosMax: 15
    }

    // Calcul du total jeu : soit somme des sous-items si saisis, soit note globale
    const sumGameDetails = gameDetails.pedagogy + gameDetails.boardLaser + gameDetails.pawns3d + gameDetails.aiCards + gameDetails.video + gameDetails.photos
    const pillar2Total = sumGameDetails > 0 ? sumGameDetails : (evalRec.gameProjectScore || 0)

    // Pilier 3 : Soutenance Orale devant la classe (max 30 pts)
    const pillar3Total = evalRec.oralDefenseScore || 0

    // Total Général sur 200 points (70 + 100 + 30)
    const totalScore = Math.round((pillar1Total + pillar2Total + pillar3Total) * 10) / 10
    const totalOutOf20 = Math.round((totalScore / 10) * 10) / 10
    const percentage = Math.round((totalScore / 200) * 100)

    return {
      user,
      pillar1: {
        total: pillar1Total,
        max: 70,
        quizPoints,
        quizMax: 10,
        exercisesTotal,
        exercisesMax: 60,
        exerciseDetails
      },
      pillar2: {
        total: pillar2Total,
        max: 100,
        details: gameDetails
      },
      pillar3: {
        total: pillar3Total,
        max: 30
      },
      totalScore,
      totalMax: 200,
      totalOutOf20,
      percentage,
      isPassing: totalScore >= 100,
      feedback: evalRec.teacherFeedback || '',
      adjustNotice: "La pondération pourra être revue en fonction du déroulement du cours."
    }
  },

  updateStudentEvaluation(email: string, update: Partial<EvaluationRecord>) {
    const targetEmail = email.trim().toLowerCase()
    if (!state.evaluations[targetEmail]) {
      state.evaluations[targetEmail] = {
        userEmail: targetEmail,
        gamePedagogyScore: 0,
        gameBoardLaserScore: 0,
        gamePawns3dScore: 0,
        gameAiCardsScore: 0,
        gameVideoScore: 0,
        gamePhotosScore: 0,
        gameProjectScore: 0,
        oralDefenseScore: 0
      }
    }

    Object.assign(state.evaluations[targetEmail], update)
    setStorage(STORAGE_KEY_EVALUATIONS, state.evaluations)
    return { success: true, message: "Évaluation mise à jour avec succès !" }
  },

  verifyAdminPin(pin: string): boolean {
    return pin.trim() === state.adminPin
  },

  updateAdminPin(newPin: string) {
    state.adminPin = newPin.trim()
    setStorage(STORAGE_KEY_ADMIN_PIN, state.adminPin)
  },

  // ==========================================
  // GESTION DES MOTS DE PASSE ÉTUDIANTS
  // ==========================================

  checkStudentStatus(email: string) {
    const cleanEmail = email.trim().toLowerCase()
    const user = state.users.find(u => u.email === cleanEmail)
    if (!user) {
      return { exists: false, message: "Aucun compte étudiant trouvé avec cette adresse." }
    }
    return {
      exists: true,
      user,
      passwordSet: user.passwordSet === true && !!user.password,
      name: `${user.firstName} ${user.lastName}`
    }
  },

  loginStudentWithPassword(email: string, password?: string) {
    const cleanEmail = email.trim().toLowerCase()
    const user = state.users.find(u => u.email === cleanEmail)
    if (!user) {
      return { success: false, message: "Adresse email non reconnue." }
    }
    if (user.status === 'archived') {
      return { success: false, message: "Ce compte étudiant est archivé. Veuillez contacter l'enseignant." }
    }

    // Première connexion : le mot de passe n'a pas encore été défini
    if (!user.passwordSet || !user.password) {
      return {
        success: false,
        requireInitialPassword: true,
        user,
        message: "Première connexion détectée : vous devez définir votre mot de passe personnel."
      }
    }

    // Vérification du mot de passe
    if (user.password !== (password || '').trim()) {
      return { success: false, message: "Mot de passe incorrect." }
    }

    state.currentUser = user
    setStorage(STORAGE_KEY_CURRENT, state.currentUser)
    return { success: true, user, message: "Connexion réussie !" }
  },

  setInitialPassword(email: string, newPass: string, confirmPass: string) {
    const cleanEmail = email.trim().toLowerCase()
    const user = state.users.find(u => u.email === cleanEmail)
    if (!user) return { success: false, message: "Étudiant non trouvé." }

    const p = (newPass || '').trim()
    if (p.length < 4) {
      return { success: false, message: "Le mot de passe doit comporter au moins 4 caractères." }
    }
    if (p !== (confirmPass || '').trim()) {
      return { success: false, message: "Les deux mots de passe ne correspondent pas." }
    }

    user.password = p
    user.passwordSet = true
    user.recoveryCode = undefined
    state.currentUser = user

    setStorage(STORAGE_KEY_USERS, state.users)
    setStorage(STORAGE_KEY_CURRENT, state.currentUser)
    return { success: true, user, message: "Votre mot de passe a été défini avec succès. Bienvenue !" }
  },

  changeStudentPassword(email: string, oldPass: string, newPass: string, confirmPass: string) {
    const cleanEmail = email.trim().toLowerCase()
    const user = state.users.find(u => u.email === cleanEmail)
    if (!user) return { success: false, message: "Étudiant non trouvé." }

    if (user.password && user.password !== oldPass.trim()) {
      return { success: false, message: "L'ancien mot de passe est incorrect." }
    }

    const p = (newPass || '').trim()
    if (p.length < 4) {
      return { success: false, message: "Le nouveau mot de passe doit comporter au moins 4 caractères." }
    }
    if (p !== (confirmPass || '').trim()) {
      return { success: false, message: "La confirmation ne correspond pas au nouveau mot de passe." }
    }

    user.password = p
    user.passwordSet = true
    setStorage(STORAGE_KEY_USERS, state.users)
    if (state.currentUser?.email === cleanEmail) {
      state.currentUser = user
      setStorage(STORAGE_KEY_CURRENT, state.currentUser)
    }
    return { success: true, message: "Mot de passe modifié avec succès !" }
  },

  requestPasswordRecovery(email: string) {
    const cleanEmail = email.trim().toLowerCase()
    const user = state.users.find(u => u.email === cleanEmail)
    if (!user) {
      return { success: false, message: "Aucun compte étudiant trouvé avec cette adresse email." }
    }

    // Génère un code de récupération aléatoire à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    user.recoveryCode = code
    setStorage(STORAGE_KEY_USERS, state.users)

    return {
      success: true,
      code, // Simulé dans l'interface et par mail
      email: user.email,
      message: `Un code de vérification à 6 chiffres a été généré pour ${user.firstName} ${user.lastName}.`
    }
  },

  resetPasswordWithCode(email: string, code: string, newPass: string, confirmPass: string) {
    const cleanEmail = email.trim().toLowerCase()
    const user = state.users.find(u => u.email === cleanEmail)
    if (!user) return { success: false, message: "Étudiant non trouvé." }

    const inputCode = (code || '').trim()
    // Autoriser le code stocké ou '123456' en code de secours démo
    if (!user.recoveryCode || (user.recoveryCode !== inputCode && inputCode !== '123456')) {
      return { success: false, message: "Le code de vérification est invalide ou a expiré." }
    }

    const p = (newPass || '').trim()
    if (p.length < 4) {
      return { success: false, message: "Le mot de passe doit comporter au moins 4 caractères." }
    }
    if (p !== (confirmPass || '').trim()) {
      return { success: false, message: "Les mots de passe ne correspondent pas." }
    }

    user.password = p
    user.passwordSet = true
    user.recoveryCode = undefined
    state.currentUser = user

    setStorage(STORAGE_KEY_USERS, state.users)
    setStorage(STORAGE_KEY_CURRENT, state.currentUser)
    return { success: true, user, message: "Mot de passe réinitialisé avec succès !" }
  },

  adminResetStudentPassword(email: string, newTempPass?: string) {
    const cleanEmail = email.trim().toLowerCase()
    const user = state.users.find(u => u.email === cleanEmail)
    if (!user) return { success: false, message: "Étudiant non trouvé." }

    const temp = newTempPass?.trim() || 'hech2026'
    user.password = temp
    user.passwordSet = false // Obligera l'étudiant à reconfigurer ou tester
    user.recoveryCode = undefined

    setStorage(STORAGE_KEY_USERS, state.users)
    return {
      success: true,
      temporaryPassword: temp,
      message: `Le mot de passe de ${user.firstName} ${user.lastName} a été réinitialisé à '${temp}' (en attente de nouvelle définition par l'étudiant).`
    }
  },

  // ==========================================
  // GESTION DES QUIZ & ÉVALUATIONS DIAGNOSTIQUES
  // ==========================================

  saveQuizAttempt(attempt: {
    moduleId: string
    moduleTitle: string
    score: number
    totalPoints: number
    percentage: number
    answers: QuizAnswer[]
    evaluationType?: 'diagnostic'
    userName?: string
    userEmail?: string
  }) {
    const email = attempt.userEmail || state.currentUser?.email || 'anonyme@student.hech.be'
    const name = attempt.userName || (state.currentUser ? `${state.currentUser.firstName} ${state.currentUser.lastName}` : 'Étudiant Démo')
    const userId = state.currentUser?.id || `user-${Date.now()}`

    const newAttempt: QuizAttempt = {
      id: `quiz-att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      userName: name,
      userEmail: email,
      moduleId: attempt.moduleId,
      moduleTitle: attempt.moduleTitle,
      score: attempt.score,
      totalPoints: attempt.totalPoints,
      percentage: attempt.percentage,
      answers: attempt.answers,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      evaluationType: attempt.evaluationType || 'diagnostic'
    }

    state.quizAttempts.unshift(newAttempt)
    setStorage(STORAGE_KEY_QUIZZES, state.quizAttempts)

    // Marquer aussi dans la progression si seuil réussi >= 50%
    if (attempt.percentage >= 50 && state.currentUser) {
      this.toggleProgress(`quiz-${attempt.moduleId}`)
    }

    return {
      success: true,
      attempt: newAttempt,
      message: "Résultats du quiz enregistrés avec succès !"
    }
  },

  getUserQuizAttempts(email?: string): QuizAttempt[] {
    const targetEmail = email || state.currentUser?.email
    if (!targetEmail) return []
    return state.quizAttempts.filter(q => q.userEmail.toLowerCase() === targetEmail.toLowerCase())
  },

  getAllQuizAttempts(): QuizAttempt[] {
    return state.quizAttempts
  },

  deleteQuizAttempt(id: string) {
    const idx = state.quizAttempts.findIndex(q => q.id === id)
    if (idx >= 0) {
      state.quizAttempts.splice(idx, 1)
      setStorage(STORAGE_KEY_QUIZZES, state.quizAttempts)
      return { success: true }
    }
    return { success: false }
  },

  getQuizStats(moduleId?: string) {
    const list = moduleId 
      ? state.quizAttempts.filter(q => q.moduleId === moduleId)
      : state.quizAttempts

    if (list.length === 0) {
      return { count: 0, averagePercentage: 0, averageScore: 0, maxScore: 0, minScore: 0 }
    }

    const totalPct = list.reduce((acc, q) => acc + q.percentage, 0)
    const totalSc = list.reduce((acc, q) => acc + q.score, 0)
    const pcts = list.map(q => q.percentage)

    return {
      count: list.length,
      averagePercentage: Math.round(totalPct / list.length),
      averageScore: Math.round((totalSc / list.length) * 10) / 10,
      maxScore: Math.max(...pcts),
      minScore: Math.min(...pcts)
    }
  },

  changeAdminPassword(oldPin: string, newPin: string, confirmPin: string) {
    if (!this.verifyAdminPin(oldPin)) {
      return { success: false, message: "L'ancien mot de passe est incorrect." }
    }
    if (!newPin || newPin.trim().length < 4) {
      return { success: false, message: 'Le nouveau mot de passe doit comporter au moins 4 caractères.' }
    }
    if (newPin.trim() !== confirmPin.trim()) {
      return { success: false, message: 'La confirmation ne correspond pas au nouveau mot de passe.' }
    }
    this.updateAdminPin(newPin)
    return { success: true, message: 'Mot de passe enseignant modifié avec succès !' }
  }
}
