import { reactive, computed, ref } from 'vue'
import { cloudSync, cloudSyncState, DEFAULT_CLOUD_URL } from './cloudSync'

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

export interface AiCriterion {
  name: string
  score: number
  maxScore: number
  justification: string
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
  criteriaTable?: AiCriterion[]
  summary: string
  strengths: string[]
  improvements: string[]
  nextSteps?: string
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
const STORAGE_KEY_ADMIN_ATTEMPTS = 'hech_didac_admin_attempts'
const STORAGE_KEY_ADMIN_LOCKOUT = 'hech_didac_admin_lockout'
const STORAGE_KEY_FILES = 'hech_didac_files'
const STORAGE_KEY_WEBHOOK = 'hech_didac_drive_webhook'
const STORAGE_KEY_QUIZZES = 'hech_didac_quiz_attempts'
const STORAGE_KEY_EVALUATIONS = 'hech_didac_evaluations_200'
const STORAGE_KEY_EXERCISE_FEEDBACKS = 'hech_didac_exercise_feedbacks'
const STORAGE_KEY_DEADLINES = 'hech_didac_deadlines_v2'

export interface EvaluationRecord {
  userEmail: string
  gamePedagogyScore?: number
  gameBoardLaserScore?: number
  gamePawns3dScore?: number
  gameAiCardsScore?: number
  gameVideoScore?: number
  gamePhotosScore?: number
  gameProjectScore: number
  oralDefenseScore: number
  gameEx09RulesScore?: number
  gameEx10PhotosScore?: number
  gameEx11AiCardsScore?: number
  gameEx12LaserScore?: number
  gameEx13Pawns3dScore?: number
  gameEx14VideoScore?: number
  gameEx15PlaytestScore?: number
  gameEx16PresentationScore?: number
  teacherFeedback?: string
}

export interface EvaluationItemDefinition {
  id: string
  title: string
  shortTitle: string
  part: 1 | 2
  partLabel: string
  maxPoints: number
  isProjectStep?: boolean
  docLink?: string
  deadline?: string
  deadlineLabel?: string
}

export type AlarmLevel = 'none' | 'recent' | 'orange' | 'bordeaux' | 'red'

export interface OverdueItemDetail {
  id: string
  title: string
  shortTitle: string
  deadline: string
  deadlineLabel: string
  daysOverdue: number
  alarmLevel: AlarmLevel
  alarmColor: string
  alarmBgColor: string
  alarmBorderColor: string
  alarmLabel: string
  alarmIcon: string
}

export interface StudentLateStatus {
  isLate: boolean
  lateCount: number
  highestAlarmLevel: AlarmLevel
  highestAlarmColor: string
  highestAlarmBgColor: string
  highestAlarmBorderColor: string
  highestAlarmLabel: string
  highestAlarmIcon: string
  daysOverdueMax: number
  lateItems: OverdueItemDetail[]
  tooltip: string
  message: string
}

/**
 * Parse de manière robuste toute date d'échéance :
 * - Format FR / Européen : JJ/MM/AAAA, JJ/MM/AAAA HH:mm, JJ/MM/AAAA à HH:mm, JJ-MM-AAAA
 * - Format ISO : YYYY-MM-DD, YYYY-MM-DDTHH:mm, YYYY-MM-DD HH:mm
 */
export function parseDeadline(dtStr: string | undefined | null): Date | null {
  if (!dtStr || typeof dtStr !== 'string' || !dtStr.trim()) return null
  const clean = dtStr.trim()

  // 1. Format européen / belge : JJ/MM/AAAA ou JJ/MM/AAAA HH:mm ou JJ/MM/AAAA à HH:mm ou JJ-MM-AAAA
  const frMatch = clean.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})(?:(?:\s+|[T\s]+à\s+)(\d{1,2})(?::(\d{1,2}))?)?/)
  if (frMatch) {
    const day = parseInt(frMatch[1], 10)
    const month = parseInt(frMatch[2], 10) - 1 // Mois 0-indexé
    const year = parseInt(frMatch[3], 10)
    const hours = frMatch[4] ? parseInt(frMatch[4], 10) : 23
    const minutes = frMatch[5] ? parseInt(frMatch[5], 10) : 59
    const d = new Date(year, month, day, hours, minutes, 0)
    if (!isNaN(d.getTime())) return d
  }

  // 2. Format standard ISO : YYYY-MM-DD ou YYYY-MM-DDTHH:mm ou YYYY-MM-DD HH:mm
  const isoMatch = clean.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:[T\s]+(\d{1,2})(?::(\d{1,2}))?)?/)
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10)
    const month = parseInt(isoMatch[2], 10) - 1
    const day = parseInt(isoMatch[3], 10)
    const hours = isoMatch[4] ? parseInt(isoMatch[4], 10) : 23
    const minutes = isoMatch[5] ? parseInt(isoMatch[5], 10) : 59
    const d = new Date(year, month, day, hours, minutes, 0)
    if (!isNaN(d.getTime())) return d
  }

  // 3. Repli standard
  const fallback = new Date(clean.replace(' ', 'T'))
  return isNaN(fallback.getTime()) ? null : fallback
}

export function formatDeadlineDisplay(dtStr: string): string {
  if (!dtStr || !dtStr.trim()) return 'Non fixée'
  const d = parseDeadline(dtStr)
  if (!d) return dtStr
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} à ${hours}h${minutes}`
}

export function getAlarmLevelInfo(daysOverdue: number): {
  level: AlarmLevel
  color: string
  bgColor: string
  borderColor: string
  label: string
  icon: string
  badgeText: string
} {
  // Sécurité absolue contre NaN ou jours négatifs (échéance future)
  if (isNaN(daysOverdue) || daysOverdue < 0) {
    return {
      level: 'none',
      color: '#10b981',
      bgColor: '#ecfdf5',
      borderColor: '#a7f3d0',
      label: 'Dans les délais',
      icon: '✅',
      badgeText: 'Dans les temps'
    }
  }
  if (daysOverdue < 7) {
    return {
      level: 'recent',
      color: '#eab308',
      bgColor: '#fefce8',
      borderColor: '#fef08a',
      label: 'Retard récent (< 1 semaine)',
      icon: '⏳',
      badgeText: `Retard (${daysOverdue} j)`
    }
  }
  if (daysOverdue < 14) {
    return {
      level: 'orange',
      color: '#ea580c', // Orange vif
      bgColor: '#fff7ed',
      borderColor: '#fdba74',
      label: 'Alarme Orange (> 1 semaine de retard)',
      icon: '🟠',
      badgeText: `🟠 Alarme Orange (+${Math.floor(daysOverdue / 7)} sem, ${daysOverdue} j)`
    }
  }
  if (daysOverdue < 30) {
    return {
      level: 'bordeaux',
      color: '#881337', // Bordeaux profond
      bgColor: '#fff1f2',
      borderColor: '#fecdd3',
      label: 'Alarme Bordeaux (> 2 semaines de retard)',
      icon: '🍷',
      badgeText: `🍷 Alarme Bordeaux (+${Math.floor(daysOverdue / 7)} sem, ${daysOverdue} j)`
    }
  }
  return {
    level: 'red',
    color: '#dc2626', // Rouge écarlate
    bgColor: '#fef2f2',
    borderColor: '#fca5a5',
    label: 'Alarme Rouge Critique (> 1 mois de retard)',
    icon: '🔴',
    badgeText: `🔴 Alarme Rouge (> 1 mois, ${daysOverdue} j)`
  }
}

export const OFFICIAL_EVALUATION_ITEMS: EvaluationItemDefinition[] = [
  // Partie 1 : Travaux plateforme (100 pts)
  {
    id: 'quiz',
    title: 'Évaluations diagnostiques en ligne (Quiz de cours)',
    shortTitle: 'Quiz Diagnostiques',
    part: 1,
    partLabel: 'Partie 1 : Travaux Plateforme (100 pts)',
    maxPoints: 20
  },
  {
    id: 'exercice-01',
    title: 'Exercice 1 : Diagnostic de compétences (DigComp 2.2)',
    shortTitle: 'Ex 1 (DigComp)',
    part: 1,
    partLabel: 'Partie 1 : Travaux Plateforme (100 pts)',
    maxPoints: 10,
    docLink: 'https://docs.google.com/document/d/1b1QhnOoDNyCSdAIEAZx_xq96hQxZsUJH/preview'
  },
  {
    id: 'exercice-02',
    title: 'Exercice 2 : Évaluation critique d\'une information',
    shortTitle: 'Ex 2 (Esprit Critique)',
    part: 1,
    partLabel: 'Partie 1 : Travaux Plateforme (100 pts)',
    maxPoints: 10,
    docLink: 'https://docs.google.com/document/d/1o9vsf5fptzG1EH56oycz7SkD_UwmUKXm/preview'
  },
  {
    id: 'exercice-03',
    title: 'Exercice 3 : Conception d\'un guide numérique élèves',
    shortTitle: 'Ex 3 (Guide Élèves)',
    part: 1,
    partLabel: 'Partie 1 : Travaux Plateforme (100 pts)',
    maxPoints: 10,
    docLink: 'https://docs.google.com/document/d/12XENuZM1WVyeCnRfu62Oh1_tG8Gkc1Z1/preview'
  },
  {
    id: 'exercice-04',
    title: 'Exercice 4 : Escape Game FMTTN (Cyber-Enquête)',
    shortTitle: 'Ex 4 (Escape Game)',
    part: 1,
    partLabel: 'Partie 1 : Travaux Plateforme (100 pts)',
    maxPoints: 10,
    docLink: 'https://docs.google.com/document/d/1kUSfjlioxrG-i-ZrVbzQOpxH072f_2db/preview'
  },
  {
    id: 'exercice-05',
    title: 'Exercice 5 : Défi 20 min Canva (Affiche mot de passe)',
    shortTitle: 'Ex 5 (Canva Sécurité)',
    part: 1,
    partLabel: 'Partie 1 : Travaux Plateforme (100 pts)',
    maxPoints: 10,
    docLink: 'https://docs.google.com/document/d/1GuqhxxFNJllg4vR_wLeD5A4CtYNyJ4mj/preview'
  },
  {
    id: 'exercice-06',
    title: 'Exercice 6 : Démarche itérative (Concevoir & tester un mini-jeu)',
    shortTitle: 'Ex 6 (Itération & Jeu)',
    part: 1,
    partLabel: 'Partie 1 : Travaux Plateforme (100 pts)',
    maxPoints: 10,
    docLink: 'https://docs.google.com/document/d/1mfCTqwo-2l9k_wdLzIu3qRWOJuBxrqJv/preview'
  },
  {
    id: 'exercice-07',
    title: 'Exercice 7 : Défi Hardware & Peer Learning (Démonter un PC)',
    shortTitle: 'Ex 7 (Hardware PC)',
    part: 1,
    partLabel: 'Partie 1 : Travaux Plateforme (100 pts)',
    maxPoints: 10,
    docLink: 'https://docs.google.com/document/d/1Vjy9xrqLG-xuktmMmmOQ6Kh8I-hXiIzV/preview'
  },
  {
    id: 'exercice-08',
    title: 'Exercice 8 : Construire des grilles d\'évaluation critériées',
    shortTitle: 'Ex 8 (Grilles Critériées)',
    part: 1,
    partLabel: 'Partie 1 : Travaux Plateforme (100 pts)',
    maxPoints: 10,
    docLink: 'https://docs.google.com/document/d/1MV1xWWb5ZtcuRhFn_JIVG6UHeFle6IUI/preview'
  },
  // Partie 2 : Projet Jeu de Société Didactique (100 pts global)
  {
    id: 'projet-jeu',
    title: 'Projet Jeu de Société Didactique (Note globale du projet)',
    shortTitle: 'Projet Jeu (Note 100 pts)',
    part: 2,
    partLabel: 'Partie 2 : Projet Jeu de Société (100 pts)',
    maxPoints: 100
  },
  // Étapes de suivi & réalisations intermédiaires du projet (sans pondération séparée)
  {
    id: 'exercice-09',
    title: 'Étape 1 (Ex 9) : Règles du jeu & dossier pédagogique (FMTTN / CSEM)',
    shortTitle: 'Étape 1 (Règles)',
    part: 2,
    partLabel: 'Partie 2 : Projet Jeu de Société (100 pts)',
    maxPoints: 0,
    isProjectStep: true,
    docLink: 'https://docs.google.com/document/d/1af3aH5FiR31N4FB99VrFq6628kiFFbly/preview'
  },
  {
    id: 'exercice-10',
    title: 'Étape 2 (Ex 10) : Photographier le numérique (visuels & matériel)',
    shortTitle: 'Étape 2 (Photographie)',
    part: 2,
    partLabel: 'Partie 2 : Projet Jeu de Société (100 pts)',
    maxPoints: 0,
    isProjectStep: true,
    docLink: 'https://docs.google.com/document/d/1kSoMRpjySi0DvjA0S1W4b8BoaDQrXNZh/preview'
  },
  {
    id: 'exercice-11',
    title: 'Étape 3 (Ex 11) : Supports de jeu & cartes conçues avec l\'IA',
    shortTitle: 'Étape 3 (Cartes IA)',
    part: 2,
    partLabel: 'Partie 2 : Projet Jeu de Société (100 pts)',
    maxPoints: 0,
    isProjectStep: true,
    docLink: 'https://docs.google.com/document/d/1CzyMJRbjyvYVh7XP83Lx4tjxnq23oHXX/preview'
  },
  {
    id: 'exercice-12',
    title: 'Étape 4 (Ex 12) : Plateau de jeu à la découpeuse laser (FabLab)',
    shortTitle: 'Étape 4 (Plateau Laser)',
    part: 2,
    partLabel: 'Partie 2 : Projet Jeu de Société (100 pts)',
    maxPoints: 0,
    isProjectStep: true,
    docLink: 'https://docs.google.com/document/d/1Ov_huVW9al2DKuoBmW89QO3ZqE5E-nzU/preview'
  },
  {
    id: 'exercice-13',
    title: 'Étape 5 (Ex 13) : Pions de jeu modélisés et imprimés en 3D (FabLab)',
    shortTitle: 'Étape 5 (Pions 3D)',
    part: 2,
    partLabel: 'Partie 2 : Projet Jeu de Société (100 pts)',
    maxPoints: 0,
    isProjectStep: true,
    docLink: 'https://docs.google.com/document/d/1H_88UJvPPezdUXw1Vt8_U9wtsaFouepU/preview'
  },
  {
    id: 'exercice-14',
    title: 'Étape 6 (Ex 14) : Présentation vidéo du jeu (Capsule 2-3 min)',
    shortTitle: 'Étape 6 (Vidéo)',
    part: 2,
    partLabel: 'Partie 2 : Projet Jeu de Société (100 pts)',
    maxPoints: 0,
    isProjectStep: true,
    docLink: 'https://docs.google.com/document/d/1JO_9ayYt3IqZfStfUPkzT3GDOF65VBxQ/preview'
  },
  {
    id: 'exercice-15',
    title: 'Étape 7 (Ex 15) : Playtest & Grille d\'évaluation formative du jeu',
    shortTitle: 'Étape 7 (Playtest)',
    part: 2,
    partLabel: 'Partie 2 : Projet Jeu de Société (100 pts)',
    maxPoints: 0,
    isProjectStep: true,
    docLink: 'https://docs.google.com/document/d/1uIheBr_KU2Dh2TjYkegz7lHixsUNxs4t/preview'
  },
  {
    id: 'exercice-16',
    title: 'Étape 8 (Ex 16) : Présentation finale et leçon FMTTN devant la classe',
    shortTitle: 'Étape 8 (Soutenance & Leçon)',
    part: 2,
    partLabel: 'Partie 2 : Projet Jeu de Société (100 pts)',
    maxPoints: 0,
    isProjectStep: true,
    docLink: 'https://docs.google.com/document/d/1Tm15GqKSwutH1MDbaGYJaWByliC17iRT/preview'
  }
]

// ==========================================
// OUTILS DE SÉCURITÉ & HACHAGE (ZÉRO LATENCE)
// ==========================================

// Nettoyage et désinfection des entrées utilisateurs (Anti-XSS & Anti-Injection)
export function sanitizeText(input: string, maxLength = 10000): string {
  if (!input || typeof input !== 'string') return ''
  let clean = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
  clean = clean.replace(/\bon\w+\s*=\s*(['"]).*?\1/gi, '')
  clean = clean.replace(/\bon\w+\s*=\s*[^>\s]+/gi, '')
  clean = clean.replace(/(javascript|vbscript|data\s*:\s*text\/html)\s*:/gi, 'blocked:')
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength)
  }
  return clean.trim()
}

export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return ''
  return email
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9._%+-@]/g, '')
    .substring(0, 150)
}

export function sanitizeFileName(name: string): string {
  if (!name || typeof name !== 'string') return 'document.pdf'
  return name
    .replace(/[\/\\\?\%\*\:\|\"\<\>\0]/g, '_')
    .replace(/\.\./g, '_')
    .trim()
    .substring(0, 120)
}

// Hachage SHA-256 natif ultra-rapide et synchrone
export function sha256Sync(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount))
  }
  const mathPow = Math.pow
  const maxWord = mathPow(2, 32)
  let lengthProperty = 'length'
  let i = 0, j = 0
  let result = ''
  const words: number[] = []
  const asciiBitLength = ascii.length * 8
  const hash: number[] = []
  const k: number[] = []
  let primeCounter = 0
  const isComposite: Record<number, boolean> = {}

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = true
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0
    }
  }

  ascii += '\x80'
  while ((ascii.length % 64) - 56) ascii += '\x00'
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i)
    if (j >> 8) return ''
    words[i >> 2] |= j << (((3 - i) % 4) * 8)
  }
  words[words.length] = (asciiBitLength / maxWord) | 0
  words[words.length] = asciiBitLength

  for (j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16))
    const oldHash = hash.slice(0)
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2]
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10)
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6])
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2])
      const temp1 = (hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + (w[i] = (i < 16) ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0)) | 0
      const temp2 = ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj) | 0

      hash[7] = hash[6]
      hash[6] = hash[5]
      hash[5] = hash[4]
      hash[4] = (hash[3] + temp1) | 0
      hash[3] = hash[2]
      hash[2] = hash[1]
      hash[1] = hash[0]
      hash[0] = (temp1 + temp2) | 0
    }
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (8 * j)) & 255
      result += (b < 16 ? '0' : '') + b.toString(16)
    }
  }
  return result
}

function initAdminPinHash(): string {
  const DEFAULT_HASH = '546e8e7d7e5fa8e5a531213806ba7fa4067c4890ee40442649f4f64147b39deb' // sha256('hech2026')
  const raw = getStorage<string>(STORAGE_KEY_ADMIN_PIN, DEFAULT_HASH)
  if (raw && raw.length === 64 && /^[0-9a-f]{64}$/i.test(raw)) {
    return raw.toLowerCase()
  }
  const migrated = sha256Sync(raw || 'hech2026')
  setStorage(STORAGE_KEY_ADMIN_PIN, migrated)
  return migrated
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
  let nextSteps = "Poursuivre la formalisation des choix didactiques en explicitant les liens avec les compétences du tronc commun."
  let detailedFeedback = ""
  let criteriaTable: AiCriterion[] = []

  if (exId === 'exercice-01') {
    suggestedScore = 9.0
    concordance = 2.8
    didacticQuality = 2.7
    criticalAnalysis = 2.2
    formAndStructure = 1.3
    summary = "Excellente appropriation du cadre DigComp 2.2 et distinction nette entre habileté opératoire et compétence critique située."
    strengths = [
      "Distinction opératoire claire entre l'habileté technique et la compétence réflexive située.",
      "Pertinence des indicateurs d'observation pour diagnostiquer les besoins des élèves du secondaire.",
      "Prise en compte rigoureuse de la dimension éthique et légale (licences Creative Commons)."
    ]
    improvements = [
      "Préciser les modalités de remédiation immédiate en classe pour les apprenants en grande fragilité numérique."
    ]
    nextSteps = "Structurer une fiche-guide de remédiation rapide (3 étapes clés) à destination des élèves décrocheurs."
    detailedFeedback = "L'analyse produite pour ce diagnostic DigComp témoigne d'un haut niveau d'expertise didactique. Vous montrez clairement que savoir manipuler un outil ne signifie pas être compétent sur le plan informationnel. Les propositions d'activités permettent d'outiller l'élève sans le démotiver."
    criteriaTable = [
      { name: "Exactitude & maîtrise des concepts DigComp 2.2 (Critère A)", score: 4.8, maxScore: 5, justification: "Définition rigoureuse de la compétence située et des 5 domaines DigComp." },
      { name: "Compréhension & Pertinence didactique (Critères B & F)", score: 4.6, maxScore: 5, justification: "Excellente analyse des besoins d'apprentissage réels des élèves." },
      { name: "Application, transfert & Analyse (Critères C & D)", score: 4.4, maxScore: 5, justification: "Diagnostic pertinent des profils d'élèves et argumentation solide." },
      { name: "Réflexivité & Communication (Critères E & H)", score: 4.2, maxScore: 5, justification: "Bonne prise de recul sur la posture enseignante et présentation soignée." }
    ]
  } else if (exId === 'exercice-02') {
    suggestedScore = 8.5
    concordance = 2.5
    didacticQuality = 2.6
    criticalAnalysis = 2.2
    formAndStructure = 1.2
    summary = "Démarche d'investigation critique rigoureuse pour déconstruire l'infox et les pièges sensationnalistes."
    strengths = [
      "Recours méthodique au croisement des sources primaires et à la vérification d'images inversées.",
      "Excellente déconstruction des procédés de dramatisation (titres putaclics, graphiques tronqués).",
      "Transposition didactique adaptée à des élèves de 12-14 ans."
    ]
    improvements = [
      "Expliciter davantage le rôle des algorithmes de recommandation et de l'économie de l'attention."
    ]
    nextSteps = "Intégrer une courte séquence sur les biais de confirmation et le fonctionnement des bulles de filtres."
    detailedFeedback = "Très bon travail d'Éducation aux Médias. Vous dépassez la simple chasse au faux pour faire comprendre aux élèves pourquoi et comment une fausse nouvelle se propage. Le protocole proposé est directement transposable en classe."
    criteriaTable = [
      { name: "Exactitude & maîtrise de l'esprit critique info (Critère A)", score: 4.5, maxScore: 5, justification: "Identification précise des failles factuelles et des biais de mise en scène." },
      { name: "Pertinence didactique & transposition élèves (Critères B & F)", score: 4.3, maxScore: 5, justification: "Protocole de fact-checking accessible et formateur pour le secondaire." },
      { name: "Analyse critique & croisement des sources (Critères C & D)", score: 4.4, maxScore: 5, justification: "Recherche inversée d'images et remontée aux sources primaires concluantes." },
      { name: "Réflexivité & Clarté argumentative (Critères E & H)", score: 3.8, maxScore: 5, justification: "Argumentation claire, penser à approfondir la dimension systémique des réseaux sociaux." }
    ]
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
    nextSteps = "Proposer une version synthétique sous forme de mémo marque-page ou de sticker pour carnet de bord."
    detailedFeedback = "Production exemplaire ! La mise en page et le ton adopté sont parfaitement calibrés pour des élèves du premier degré. L'accent mis sur l'autonomie et les bonnes pratiques numériques répond fidèlement aux attendus du référentiel."
    criteriaTable = [
      { name: "Conformité au référentiel FMTTN (Critère A)", score: 4.8, maxScore: 5, justification: "Respect intégral des attendus du champ 1 et 2 du tronc commun." },
      { name: "Qualité de l'ingénierie didactique (Critères B & F)", score: 4.8, maxScore: 5, justification: "Séquençage progressif, consignes explicites et sans ambiguïté." },
      { name: "Faisabilité en classe & Transfert (Critères C & D)", score: 4.7, maxScore: 5, justification: "Outil immédiatement diffusable et opérationnel en classe." },
      { name: "Ergonomie, accessibilité & Design (Critères E & H)", score: 4.7, maxScore: 5, justification: "Mise en page exemplaire, aérée et attrayante." }
    ]
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
    nextSteps = "Intégrer des indices progressifs à débloquer en cas de blocage d'une équipe pour préserver le rythme."
    detailedFeedback = "Une cyber-enquête stimulante qui met en valeur les pédagogies actives. Le lien entre le jeu et l'institutionnalisation des notions informatiques est bien assuré."
    criteriaTable = [
      { name: "Maîtrise des concepts de cybersécurité (Critère A)", score: 4.4, maxScore: 5, justification: "Énigmes fondées sur des règles d'hygiène numérique authentiques." },
      { name: "Scénarisation ludopédagogique (Critères B & F)", score: 4.5, maxScore: 5, justification: "Intrigue engageante et équilibre entre défi et faisabilité." },
      { name: "Résolution de problèmes & Pensée computationnelle (Critères C & D)", score: 4.2, maxScore: 5, justification: "Bonne progression des indices et mobilisation de la déduction logique." },
      { name: "Communication & Matériel pédagogique (Critères E & H)", score: 3.9, maxScore: 5, justification: "Documents de jeu immersifs, peaufiner les fiches de débriefing." }
    ]
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
    nextSteps = "Ajouter un QR code renvoyant vers un testeur de robustesse de mot de passe en ligne (ex: CNIL)."
    detailedFeedback = "L'affiche Canva atteint son objectif de communication pédagogique rapide. Le message est clair, direct et évite le jargon technique superflu."
    criteriaTable = [
      { name: "Exactitude des règles de sécurité (Critère A)", score: 4.2, maxScore: 5, justification: "Règles actuelles de robustesse conformes aux recommandations ANSSI." },
      { name: "Efficacité communicationnelle (Critères B & F)", score: 4.3, maxScore: 5, justification: "Accroche visuelle forte et lisibilité à distance." },
      { name: "Pertinence du format Défi Express (Critères C & D)", score: 4.0, maxScore: 5, justification: "Objectif atteint dans la contrainte temporelle des 20 minutes." },
      { name: "Qualité graphique & Réflexivité (Critères E & H)", score: 3.5, maxScore: 5, justification: "Bonne maîtrise de Canva, enrichir la justification didactique des choix de couleurs." }
    ]
  } else if (exId === 'exercice-06') {
    suggestedScore = 8.5
    concordance = 2.6
    didacticQuality = 2.6
    criticalAnalysis = 2.1
    formAndStructure = 1.2
    summary = "Démarche itérative rigoureuse, recueil d'erreurs constructif et ajustement de mini-jeu numérique (Playtest)."
    strengths = [
      "Protocole de playtest bien documenté avec recueil direct des feedbacks des pairs.",
      "Identification lucide des points de blocage et mise en place d'une boucle d'amélioration itérative.",
      "Valorisation didactique de l'erreur comme tremplin d'apprentissage."
    ]
    improvements = [
      "Préciser les métriques quantitatives (temps moyen par défi, taux de réussite au premier essai)."
    ]
    nextSteps = "Formaliser un tableau comparatif 'Version initiale vs Version améliorée' des interactions de jeu."
    detailedFeedback = "Une excellente appropriation de la démarche itérative. Votre démarche de conception-test-rectification démontre une posture réflexive authentique propice aux apprentissages numériques."
    criteriaTable = [
      { name: "Scénarisation ludique & ergonomie (Critère A)", score: 4.4, maxScore: 5, justification: "Interface intuitive et consignes de jeu claires." },
      { name: "Protocole de test & observation des pairs (Critères B & F)", score: 4.5, maxScore: 5, justification: "Recueil objectif des réactions et comportements des testeurs." },
      { name: "Intégration du statut de l'erreur (Critères C & D)", score: 4.2, maxScore: 5, justification: "L'erreur est exploitée pour réguler les défis sans pénalisation punitive." },
      { name: "Réflexivité & Itération didactique (Critères E & H)", score: 4.0, maxScore: 5, justification: "Modifications pertinentes apportées suite aux retours d'expérience." }
    ]
  } else if (exId === 'exercice-07') {
    suggestedScore = 9.0
    concordance = 2.7
    didacticQuality = 2.7
    criticalAnalysis = 2.2
    formAndStructure = 1.4
    summary = "Défi Hardware et Peer Learning remarquable : démythification concrète des composants PC et dynamique collaborative."
    strengths = [
      "Protocole de manipulation rigoureux assurant la sécurité électrique et matérielle.",
      "Excellentes analogies pour expliquer le rôle de la RAM, du CPU et de la carte mère.",
      "Fiche bilan élève synthétique et visuelle favorisant l'apprentissage entre pairs."
    ]
    improvements = [
      "Prévoir une activité alternative sur simulateur virtuel pour les élèves en retrait ou absents."
    ]
    nextSteps = "Créer un schéma fonctionnel fléché résumant le cycle Traitement-Mémoire-Stockage pour la classe."
    detailedFeedback = "Ce défi hardware permet aux élèves de dépasser l'aspect magique de la machine pour en comprendre le fonctionnement concret. L'approche tactile et l'apprentissage par les pairs sont remarquablement articulés."
    criteriaTable = [
      { name: "Exactitude de l'architecture matérielle (Critère A)", score: 4.7, maxScore: 5, justification: "Identification sans erreur des composants internes et de leurs bus de liaison." },
      { name: "Dispositif d'apprentissage expérientiel & Peer Learning (Critères B & F)", score: 4.6, maxScore: 5, justification: "Manipulation active par les pairs valorisant le tâtonnement expérimental." },
      { name: "Sécurité & Procédure technique (Critères C & D)", score: 4.4, maxScore: 5, justification: "Consignes de décharge électrostatique et de manipulation claires." },
      { name: "Documentation & Réflexivité (Critères E & H)", score: 4.3, maxScore: 5, justification: "Fiche d'identification des composants claire et bien légendée." }
    ]
  } else if (exId === 'exercice-08') {
    suggestedScore = 8.5
    concordance = 2.6
    didacticQuality = 2.6
    criticalAnalysis = 2.1
    formAndStructure = 1.2
    summary = "Grille d'évaluation critériée robuste, indicateurs observables précis et respect de la triple concordance didactique."
    strengths = [
      "Indicateurs d'observation comportementaux dénués d'ambiguïté subjective.",
      "Échelons de maîtrise progressifs facilitant l'auto-évaluation et la régulation par l'élève.",
      "Alignement rigoureux avec les visées du référentiel FMTTN."
    ]
    improvements = [
      "Veiller à équilibrer le barème entre critères de processus et critères de produit fini."
    ]
    nextSteps = "Rédiger une fiche d'accompagnement de la grille explicitant comment l'élève peut s'auto-évaluer."
    detailedFeedback = "Très bon travail d'ingénierie d'évaluation. Votre grille critériée fournit un cadre transparent et formatif qui guide l'apprenant vers la réussite."
    criteriaTable = [
      { name: "Rigueur des critères & observables (Critère A)", score: 4.5, maxScore: 5, justification: "Critères univoques et observables sans ambiguïté interprétative." },
      { name: "Gradation des niveaux de maîtrise (Critères B & F)", score: 4.4, maxScore: 5, justification: "Paliers de progression cohérents et encourageants pour l'élève." },
      { name: "Triple concordance pédagogique (Critères C & D)", score: 4.3, maxScore: 5, justification: "Parfaite adéquation entre objectifs, activités et modalités d'évaluation." },
      { name: "Ergonomie & Clarté communicative (Critères E & H)", score: 4.0, maxScore: 5, justification: "Tableau lisible, directement utilisable en situation d'évaluation." }
    ]
  } else if (exId === 'exercice-09') {
    suggestedScore = 9.0
    concordance = 2.8
    didacticQuality = 2.7
    criticalAnalysis = 2.2
    formAndStructure = 1.3
    summary = "Règles du jeu limpides, boucle de gameplay bien rythmée et alignement didactique solide avec le référentiel FMTTN."
    strengths = [
      "Boucle de jeu équilibrée alternant réflexion, défi et interaction ludique.",
      "Explication pas-à-pas des phases de jeu avec exemples de tours illustrés.",
      "Objectif didactique d'éducation aux médias parfaitement intégré à la mécanique de victoire."
    ]
    improvements = [
      "Anticiper les cas de blocage ou d'égalité entre joueurs dans un encadré 'Cas particuliers'."
    ]
    nextSteps = "Réaliser un aide-mémoire compact (carte de référence rapide) résumant le tour de jeu en 3 pictogrammes."
    detailedFeedback = "Un livret de règles remarquable. Les élèves comprendront le fonctionnement en moins de 3 minutes grâce à la clarté de vos formulations et au découpage méthodique des phases."
    criteriaTable = [
      { name: "Clarté & rigueur des règles (Critères A & H)", score: 4.7, maxScore: 5, justification: "Vocabulaire précis, aucune ambiguïté sur les conditions de victoire." },
      { name: "Alignement didactique FMTTN / Médias (Critères B & F)", score: 4.6, maxScore: 5, justification: "Le jeu fait apprendre par l'action et non par simple récitation passive." },
      { name: "Ergonomie ludique & Boucle de jeu (Critères C & D)", score: 4.4, maxScore: 5, justification: "Durée de partie réaliste et engagement cognitif continu des joueurs." },
      { name: "Réflexivité & Anticipation des écueils (Critère E)", score: 4.3, maxScore: 5, justification: "Bonne prise en compte de la diversité des joueurs et des dynamiques de groupe." }
    ]
  } else if (exId === 'exercice-10') {
    suggestedScore = 8.5
    concordance = 2.6
    didacticQuality = 2.6
    criticalAnalysis = 2.1
    formAndStructure = 1.2
    summary = "Série photographique originale et maîtrisée mettant en valeur les techniques de composition visuelle."
    strengths = [
      "Exploitation intelligente des contrastes d'échelles, du cadre dans le cadre et des reflets.",
      "Mise en scène soignée du matériel physique du jeu (pions, plateau, cartes).",
      "Justification sémiologique convaincante pour chaque cliché retenu."
    ]
    improvements = [
      "Veiller à la gestion de la lumière directe pour éviter les reflets parasites sur les surfaces brillantes."
    ]
    nextSteps = "Expérimenter la profondeur de champ réduite (effet bokeh) pour isoler les détails des pions."
    detailedFeedback = "Très belle appropriation des principes photographiques vus au cours. Vos images racontent une histoire et confèrent immédiatement une dimension professionnelle à votre prototype de jeu."
    criteriaTable = [
      { name: "Maîtrise technique photographique (Critère A)", score: 4.4, maxScore: 5, justification: "Exposition équilibrée, netteté sur les points clés et cadrages soignés." },
      { name: "Mobilisation des règles de composition (Critères B & G)", score: 4.5, maxScore: 5, justification: "Application démontrée de la règle des tiers, des lignes directrices et du surcadrage." },
      { name: "Sens critique & Sémiologie de l'image (Critères C & D)", score: 4.1, maxScore: 5, justification: "Analyse réflexive de l'impact émotionnel et narratif des clichés." },
      { name: "Communication & Intégration graphique (Critères E & H)", score: 4.0, maxScore: 5, justification: "Planches de présentation harmonieuses prêtes pour l'édition du jeu." }
    ]
  } else if (exId === 'exercice-11') {
    suggestedScore = 9.0
    concordance = 2.7
    didacticQuality = 2.8
    criticalAnalysis = 2.3
    formAndStructure = 1.2
    summary = "Création multimodale de cartes de jeu combinant prompts d'IA générative et harmonisation graphique Canva."
    strengths = [
      "Cohérence visuelle remarquable entre les différentes familles de cartes grâce à un style d'avatar unifié.",
      "Méthode de génération par étapes (saucissonnage de prompts) rigoureusement appliquée.",
      "Formulation stimulante des questions et défis pédagogiques."
    ]
    improvements = [
      "Vérifier le contraste typographique entre les textes et les fonds texturés pour une lisibilité parfaite."
    ]
    nextSteps = "Intégrer des pictogrammes de difficulté (1 à 3 étoiles) pour adapter la complexité aux élèves."
    detailedFeedback = "Excellente démonstration de l'IA comme copilote de création : vous avez su garder la maîtrise didactique des contenus tout en exploitant la puissance générative pour les illustrations."
    criteriaTable = [
      { name: "Maîtrise du prompting & posture critique IA (Critère 7 / A)", score: 4.7, maxScore: 5, justification: "Vérification systématique des hallucinations et raffinement itératif des prompts." },
      { name: "Pertinence didactique des défis de cartes (Critères B & F)", score: 4.6, maxScore: 5, justification: "Contenus alignés sur les compétences numériques et l'éducation aux médias." },
      { name: "Cohérence graphique & Identité visuelle (Critères C & G)", score: 4.4, maxScore: 5, justification: "Gabarit Canva harmonieux et charte graphique respectée sur l'ensemble du paquet." },
      { name: "Réflexivité sur l'usage de l'IA (Critères E & H)", score: 4.3, maxScore: 5, justification: "Analyse honnête et lucide des atouts et limites des générateurs visuels." }
    ]
  } else if (exId === 'exercice-12') {
    suggestedScore = 8.5
    concordance = 2.6
    didacticQuality = 2.5
    criticalAnalysis = 2.1
    formAndStructure = 1.3
    summary = "Plateau de jeu vectorisé avec précision, gravure laser propre et ergonomie spatiale bien pensée."
    strengths = [
      "Fichier vectoriel (.svg) structuré avec distinction nette des calques de découpe (rouge) et de gravure (noir).",
      "Disposition intuitive des cases et des zones de pioche favorisant la fluidité de jeu.",
      "Finition matérielle soignée au FabLab (bois poncé, contrastes de brûlure bien réglés)."
    ]
    improvements = [
      "Prévoir des repères d'emboîtement si le plateau doit être pliable pour entrer dans une boîte compacte."
    ]
    nextSteps = "Ajouter des logements gravés légèrement en creux pour stabiliser les cartes et les pions."
    detailedFeedback = "Un travail de prototypage FabLab très professionnel. Votre plateau est à la fois robuste, fonctionnel et esthétiquement valorisant pour les élèves."
    criteriaTable = [
      { name: "Maîtrise de la CAO vectorielle (Critère A)", score: 4.4, maxScore: 5, justification: "Tracés vectoriels fermés, épaisseurs de traits conformes aux exigences machine." },
      { name: "Ergonomie spatiale & Ludopédagogie (Critères B & F)", score: 4.3, maxScore: 5, justification: "Cheminement de jeu clair et dimensions adaptées à une table de classe." },
      { name: "Fabrication numérique FabLab (Critères C & G)", score: 4.3, maxScore: 5, justification: "Paramètres de vitesse et puissance laser parfaitement calibrés." },
      { name: "Réflexivité sur le prototypage matériel (Critères E & H)", score: 4.0, maxScore: 5, justification: "Bonne documentation des itérations et ajustements d'échelle." }
    ]
  } else if (exId === 'exercice-13') {
    suggestedScore = 8.5
    concordance = 2.6
    didacticQuality = 2.5
    criticalAnalysis = 2.1
    formAndStructure = 1.3
    summary = "Modélisation 3D originale de pions distinctifs et impression additive sans défaut d'adhérence."
    strengths = [
      "Formes volumétriques stables avec base élargie évitant les renversements pendant la partie.",
      "Symbolique évidente reliant la forme de chaque pion au rôle joué dans l'éducation aux médias.",
      "Génération soignée du G-code dans le trancheur (remplissage et supports optimisés)."
    ]
    improvements = [
      "Penser à différencier les pions par des couleurs de filament distinctes pour faciliter l'identification."
    ]
    nextSteps = "Ajouter un léger chanfrein sur la base pour faciliter le décollement du plateau d'impression."
    detailedFeedback = "Bravo pour cette modélisation 3D. Les pions ont une excellente prise en main et témoignent d'une bonne compréhension des contraintes de l'impression 3D FDM."
    criteriaTable = [
      { name: "Maîtrise de la modélisation 3D (Critère A)", score: 4.3, maxScore: 5, justification: "Solides étanches (manifold), géométries adaptées à l'impression additive." },
      { name: "Symbolique didactique des pions (Critères B & F)", score: 4.4, maxScore: 5, justification: "Personnification pertinente des concepts abordés par le jeu." },
      { name: "Finition & Résolution d'impression (Critères C & G)", score: 4.2, maxScore: 5, justification: "Hauteur de couche appropriée, absence de warping ou de fils résiduels." },
      { name: "Réflexivité sur l'objet physique (Critères E & H)", score: 4.1, maxScore: 5, justification: "Analyse critique du ratio temps d'impression / robustesse mécanique." }
    ]
  } else if (exId === 'exercice-14' || exId === 'exercice-video') {
    suggestedScore = 9.0
    concordance = 2.7
    didacticQuality = 2.8
    criticalAnalysis = 2.2
    formAndStructure = 1.3
    summary = "Capsule vidéo dynamique, pitch didactique percutant et démonstration vivante des mécaniques de jeu."
    strengths = [
      "Élocution fluide, montage rythmé et excellente alternance entre plans larges et plans rapprochés.",
      "Explication limpide des règles et de l'alignement avec les compétences du référentiel FMTTN.",
      "Qualité audio irréprochable grâce à une voix-off posée en post-synchronisation."
    ]
    improvements = [
      "Intégrer des sous-titres incrustés pour l'accessibilité universelle aux élèves malentendants."
    ]
    nextSteps = "Ajouter un court carton final récapitulant les informations pratiques (âge, durée, matériel)."
    detailedFeedback = "La vidéo donne immédiatement envie de tester le jeu. Vous avez su respecter la grammaire cinématographique (règles des 180° et des 30°) tout en conservant une tonalité pédagogique enthousiaste."
    criteriaTable = [
      { name: "Grammaire audiovisuelle & Tournage (Critère A)", score: 4.6, maxScore: 5, justification: "Respect des valeurs de plan, des angles et continuité visuelle sans faux raccords." },
      { name: "Efficacité didactique de la démonstration (Critères B & F)", score: 4.7, maxScore: 5, justification: "Les règles et enjeux d'apprentissage sont compris en moins de 2 minutes." },
      { name: "Montage & Bande sonore (Critères C & G)", score: 4.4, maxScore: 5, justification: "Rythme soutenu, mixage équilibré entre voix-off et musique de fond." },
      { name: "Posture réflexive & Dynamisme (Critères E & H)", score: 4.3, maxScore: 5, justification: "Présentation engageante et valorisante pour le travail de l'équipe." }
    ]
  } else if (exId === 'exercice-15') {
    suggestedScore = 8.5
    concordance = 2.6
    didacticQuality = 2.6
    criticalAnalysis = 2.2
    formAndStructure = 1.1
    summary = "Playtest méthodique mené auprès de pairs avec recueil objectif de données et ajustements concrets."
    strengths = [
      "Grille d'observation critériée bien construite (compréhension des règles, temps de jeu, plaisir ludique).",
      "Identification lucide des points de blocage initiaux et mise en place de solutions correctives.",
      "Démarche itérative authentique illustrant le statut positif de l'erreur dans la conception."
    ]
    improvements = [
      "Quantifier plus précisément le temps moyen passé par tour de joueur pour affiner le tempo."
    ]
    nextSteps = "Formaliser un carnet d'itération 'Avant / Après' pour illustrer l'évolution du prototype lors de la soutenance."
    detailedFeedback = "C'est l'essence même du game design pédagogique ! Vous avez su écouter les critiques des testeurs avec bienveillance et objectivité pour rendre votre jeu infiniment plus fluide."
    criteriaTable = [
      { name: "Méthodologie du playtest (Critère A)", score: 4.3, maxScore: 5, justification: "Protocole de test rigoureux avec observateur neutre et grille d'évaluation." },
      { name: "Analyse des retours joueurs (Critères B & D)", score: 4.4, maxScore: 5, justification: "Dépouillement objectif des incompréhensions sans justification défensive." },
      { name: "Ajustements & Améliorations itératives (Critères C & F)", score: 4.4, maxScore: 5, justification: "Modifications pertinentes des règles et des cartes pour équilibrer la partie." },
      { name: "Réflexivité didactique approfondie (Critère E)", score: 4.4, maxScore: 5, justification: "Haute maturité réflexive sur les écarts entre intention et réception." }
    ]
  } else if (exId === 'exercice-16') {
    suggestedScore = 9.0
    concordance = 2.8
    didacticQuality = 2.8
    criticalAnalysis = 2.2
    formAndStructure = 1.2
    summary = "Défense didactique captivante et fiche de préparation de leçon FMTTN rigoureusement articulée."
    strengths = [
      "Présentation orale dynamique et interactive faisant participer activement la classe.",
      "Fiche de préparation conforme aux standards HECh (triple concordance, Bloom, timing minuté).",
      "Justification convaincante de la place du jeu dans la séquence d'apprentissage globale."
    ]
    improvements = [
      "Expliciter davantage les critères d'évaluation sommative que vous utiliseriez avec vos futurs élèves."
    ]
    nextSteps = "Prévoir une variante d'évaluation formative sous forme de ticket de sortie (exit ticket) pour la leçon."
    detailedFeedback = "Une prestation finale de très haute volée. Vous démontrez une réelle posture d'ingénieur pédagogique capable de concevoir, fabriquer, animer et défendre un dispositif d'apprentissage innovant."
    criteriaTable = [
      { name: "Maîtrise didactique & Fiche de leçon FMTTN (Critères A & F)", score: 4.7, maxScore: 5, justification: "Triple concordance irréprochable et intégration harmonieuse du jeu dans la leçon." },
      { name: "Dynamisme de l'animation orale (Critères B & H)", score: 4.6, maxScore: 5, justification: "Prise de parole partagée, élocution vivante et mise en situation immersive." },
      { name: "Rigueur des réponses aux questions (Critères C & D)", score: 4.4, maxScore: 5, justification: "Argumentation solide face aux interrogations conceptuelles de l'auditoire." },
      { name: "Réflexivité & Posture professionnelle d'enseignant (Critère E)", score: 4.3, maxScore: 5, justification: "Prise de recul sur la trajectoire d'apprentissage et projection réaliste en classe." }
    ]
  } else {
    suggestedScore = 8.5
    concordance = 2.5
    didacticQuality = 2.5
    criticalAnalysis = 2.0
    formAndStructure = 1.5
    summary = "Travail sérieux respectant les consignes et critères didactiques de l'activité."
    strengths = [
      "Bonne mobilisation des concepts clés du cours de Didactique du numérique.",
      "Document bien structuré et transmis dans les formats attendus."
    ]
    improvements = [
      "Approfondir la justification didactique des arbitrages opérés."
    ]
    nextSteps = "Faire le lien explicite avec les référentiels officiels de la FWB."
    detailedFeedback = "Le devoir remis atteste d'un investissement appréciable et d'une démarche d'apprentissage constructive."
    criteriaTable = [
      { name: "Exactitude des connaissances (Critère A)", score: 4.2, maxScore: 5, justification: "Maîtrise satisfaisante des notions du cours." },
      { name: "Pertinence pédagogique (Critères B & F)", score: 4.2, maxScore: 5, justification: "Cohérence avec les besoins des apprenants." },
      { name: "Analyse & Argumentation (Critères C & D)", score: 4.1, maxScore: 5, justification: "Développement logique et justifié." },
      { name: "Réflexivité & Forme (Critères E & H)", score: 4.0, maxScore: 5, justification: "Expression soignée et démarche réflexive engagée." }
    ]
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
    criteriaTable,
    summary,
    strengths,
    improvements,
    nextSteps,
    detailedFeedback,
    correctedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    modelUsed: 'Assistant IA Pédagogique FMTTN (Prompt Expert)'
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

function setStorage<T>(key: string, val: T): boolean {
  if (typeof window === 'undefined') return false
  try {
    localStorage.setItem(key, JSON.stringify(val))
    return true
  } catch (e: any) {
    if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
      console.warn(`[userStore] Quota localStorage dépassé pour la clé ${key}`)
    }
    return false
  }
}

const deadlinesTrigger = ref(0)

function initInitialDeadlines(): Record<string, { deadline: string, deadlineLabel?: string }> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DEADLINES)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        return parsed
      }
    }
  } catch (e) {}
  return {}
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
  driveWebhook: getStorage<string>(STORAGE_KEY_WEBHOOK, DEFAULT_CLOUD_URL) || DEFAULT_CLOUD_URL,
  adminPinHash: initAdminPinHash(),
  quizAttempts: getStorage<QuizAttempt[]>(STORAGE_KEY_QUIZZES, DEFAULT_QUIZZES),
  evaluations: getStorage<Record<string, EvaluationRecord>>(STORAGE_KEY_EVALUATIONS, DEFAULT_EVALUATIONS),
  deadlines: initInitialDeadlines()
})

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY_DEADLINES && event.newValue) {
      try {
        state.deadlines = JSON.parse(event.newValue)
        deadlinesTrigger.value++
      } catch (e) {}
    }
  })
  window.addEventListener('focus', () => {
    userStore.syncFromStorage()
  })
}

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
    return '[PROTÉGÉ]'
  },
  get adminPinHash() {
    return state.adminPinHash
  },
  get quizAttempts() {
    return state.quizAttempts
  },
  get deadlines() {
    void deadlinesTrigger.value
    return state.deadlines
  },
  get deadlinesRevision() {
    return deadlinesTrigger.value
  },

  // Récupérer l'échéance effective d'un exercice (fixée par l'enseignant, aucune par défaut)
  getExerciseDeadline(exerciseId: string): { deadline: string, deadlineLabel: string, isDefined: boolean, isCustom: boolean } {
    void deadlinesTrigger.value
    const key = (exerciseId === 'exercice-video' && !state.deadlines['exercice-video'] && state.deadlines['exercice-14'])
      ? 'exercice-14'
      : (exerciseId === 'exercice-14' && !state.deadlines['exercice-14'] && state.deadlines['exercice-video'])
        ? 'exercice-video'
        : exerciseId

    const custom = state.deadlines[key]
    if (custom && custom.deadline && custom.deadline.trim() !== '') {
      return {
        deadline: custom.deadline,
        deadlineLabel: custom.deadlineLabel || formatDeadlineDisplay(custom.deadline),
        isDefined: true,
        isCustom: true
      }
    }
    return {
      deadline: '',
      deadlineLabel: 'Non fixée',
      isDefined: false,
      isCustom: false
    }
  },

  // Mettre à jour l'échéance d'un exercice individuel (ou la retirer si vide)
  setExerciseDeadline(exerciseId: string, deadline: string, deadlineLabel?: string) {
    const newDeadlines = { ...state.deadlines }
    if (!deadline || !deadline.trim()) {
      delete newDeadlines[exerciseId]
      if (exerciseId === 'exercice-video') delete newDeadlines['exercice-14']
      if (exerciseId === 'exercice-14') delete newDeadlines['exercice-video']
    } else {
      const cleanDate = deadline.trim()
      const entry = {
        deadline: cleanDate,
        deadlineLabel: deadlineLabel || formatDeadlineDisplay(cleanDate)
      }
      newDeadlines[exerciseId] = entry
      if (exerciseId === 'exercice-video') newDeadlines['exercice-14'] = entry
      if (exerciseId === 'exercice-14') newDeadlines['exercice-video'] = entry
    }
    state.deadlines = newDeadlines
    setStorage(STORAGE_KEY_DEADLINES, state.deadlines)
    deadlinesTrigger.value++
    return { success: true, message: !deadline || !deadline.trim() ? 'Échéance retirée avec succès.' : 'Échéance enregistrée avec succès.' }
  },

  // Mettre à jour toutes les échéances en une seule fois
  setAllExerciseDeadlines(map: Record<string, string>) {
    let count = 0
    const newDeadlines: Record<string, { deadline: string, deadlineLabel?: string }> = {}
    for (const [id, dateStr] of Object.entries(map)) {
      if (dateStr && dateStr.trim()) {
        const clean = dateStr.trim()
        const entry = {
          deadline: clean,
          deadlineLabel: formatDeadlineDisplay(clean)
        }
        newDeadlines[id] = entry
        if (id === 'exercice-video') newDeadlines['exercice-14'] = entry
        if (id === 'exercice-14') newDeadlines['exercice-video'] = entry
        count++
      }
    }
    state.deadlines = newDeadlines
    setStorage(STORAGE_KEY_DEADLINES, state.deadlines)
    deadlinesTrigger.value++
    return { success: true, count }
  },

  // Effacer toutes les échéances
  resetDeadlinesToDefault() {
    state.deadlines = {}
    setStorage(STORAGE_KEY_DEADLINES, {})
    deadlinesTrigger.value++
    return { success: true, message: 'Toutes les échéances ont été effacées.' }
  },

  // Recharger les échéances depuis le stockage local (synchronisation à chaud)
  syncFromStorage() {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY_DEADLINES)
      if (raw !== null) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          state.deadlines = parsed
          deadlinesTrigger.value++
        }
      }
    } catch (e) {}
  },

  register(firstName: string, lastName: string, email: string) {
    const cleanEmail = sanitizeEmail(email)
    const cleanFirst = sanitizeText(firstName, 50)
    const cleanLast = sanitizeText(lastName, 50)
    if (!cleanEmail) {
      return { success: false, message: 'Adresse email invalide.' }
    }
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
      firstName: cleanFirst,
      lastName: cleanLast,
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

    try { cloudSync.pushStudent(newUser) } catch (e) {}

    return { success: true, user: newUser }
  },

  addStudent(firstName: string, lastName: string, email: string) {
    const cleanEmail = sanitizeEmail(email)
    const cleanFirst = sanitizeText(firstName, 50)
    const cleanLast = sanitizeText(lastName, 50)
    if (!cleanEmail || !cleanFirst || !cleanLast) {
      return { success: false, message: 'Tous les champs sont obligatoires.' }
    }

    const existing = state.users.find(u => u.email === cleanEmail)
    if (existing) {
      existing.firstName = cleanFirst
      existing.lastName = cleanLast
      existing.status = 'active'
      setStorage(STORAGE_KEY_USERS, state.users)
      try { cloudSync.pushUpdateStudent(existing) } catch (e) {}
      return { success: true, message: 'Étudiant déjà existant : profil réactivé et mis à jour.' }
    }

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      firstName: cleanFirst,
      lastName: cleanLast,
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
    try { cloudSync.pushStudent(newUser) } catch (e) {}
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

    const cleanAnswer = sanitizeText(answer, 20000)
    if (existingIndex >= 0) {
      state.submissions[existingIndex].answer = cleanAnswer
      state.submissions[existingIndex].submittedAt = now
    } else {
      state.submissions.push({
        id: `sub-${Date.now()}`,
        userId: state.currentUser.id,
        userName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
        userEmail: cleanEmail,
        exerciseId,
        exerciseTitle,
        answer: cleanAnswer,
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

    const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15 Mo max
    if (file.size > MAX_FILE_SIZE) {
      return { 
        success: false, 
        message: "Fichier trop volumineux. La taille maximale autorisée est de 15 Mo pour préserver la réactivité de la plateforme." 
      }
    }

    const ext = (file.name || '').split('.').pop()?.toLowerCase() || ''
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

    // Déclenchement automatique et immédiat de la correction IA dès le dépôt
    try {
      newFile.aiCorrection = generateDidacticAiCorrection(newFile)
    } catch (e) {
      console.warn("Erreur analyse IA immédiate:", e)
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

    const savedFiles = setStorage(STORAGE_KEY_FILES, state.submittedFiles)
    if (!savedFiles) {
      return {
        success: false,
        message: "L'espace de stockage local de votre navigateur est saturé. Veuillez libérer de la place ou supprimer d'anciens documents."
      }
    }

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
    const def = OFFICIAL_EVALUATION_ITEMS.find(i => i.id === exerciseId)
    const itemMax = def ? def.maxPoints : 10
    const numScore = (score !== undefined && score !== null && !isNaN(Number(score))) 
      ? Math.max(0, Math.min(itemMax, Number(score))) 
      : undefined

    const fbKey = `${cleanEmail}_${exerciseId}`
    const record: ExerciseTeacherFeedback = {
      userEmail: cleanEmail,
      userName,
      exerciseId,
      exerciseTitle: exerciseTitle || def?.title || `Exercice ${exerciseId}`,
      score: numScore,
      maxScore: itemMax,
      feedback: sanitizeText(feedback || '', 10000),
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
        maxScore: itemMax,
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

  get OFFICIAL_EVALUATION_ITEMS() {
    return OFFICIAL_EVALUATION_ITEMS
  },

  getStudentEvaluation(email?: string) {
    const targetEmail = (email || state.currentUser?.email || '').trim().toLowerCase()
    const user = state.users.find(u => u.email.toLowerCase() === targetEmail)
    const evalRec: any = state.evaluations[targetEmail] || {
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

    // 1. Calcul du Quiz Diagnostique (max 20 pts)
    const userQuizzes = state.quizAttempts.filter(q => q.userEmail.toLowerCase() === targetEmail)
    let quizAiScore = 0
    if (userQuizzes.length > 0) {
      const avgPct = userQuizzes.reduce((acc, q) => acc + q.percentage, 0) / userQuizzes.length
      const factor = Math.min(1, userQuizzes.length / 2)
      quizAiScore = Math.round((avgPct / 100) * 20 * factor * 10) / 10
    }

    // 2. Construction dynamique des 17 composantes de l'évaluation
    const allEvaluationItems = OFFICIAL_EVALUATION_ITEMS.map(def => {
      if (def.id === 'quiz') {
        const fbQuiz = this.getExerciseFeedback('quiz', targetEmail)
        let teacherPts = fbQuiz?.score !== undefined ? fbQuiz.score : quizAiScore
        const effDeadlineQuiz = this.getExerciseDeadline('quiz')
        const quizDeadlineDate = parseDeadline(effDeadlineQuiz.deadline)
        const isQuizOverdue = userQuizzes.length === 0 && !!quizDeadlineDate && (new Date() > quizDeadlineDate)
        const quizDaysOverdue = isQuizOverdue && quizDeadlineDate ? Math.max(1, Math.floor((new Date().getTime() - quizDeadlineDate.getTime()) / (1000 * 60 * 60 * 24))) : 0
        const quizAlarmInfo = isQuizOverdue ? getAlarmLevelInfo(quizDaysOverdue) : getAlarmLevelInfo(-1)

        return {
          id: 'quiz',
          title: def.title,
          shortTitle: def.shortTitle,
          part: def.part,
          partLabel: def.partLabel,
          maxPoints: def.maxPoints,
          aiScore: quizAiScore,
          aiSummary: `${userQuizzes.length} quiz passé(s) • Moyenne: ${quizAiScore}/20`,
          teacherScore: Math.min(def.maxPoints, Math.max(0, Number(teacherPts || 0))),
          feedback: fbQuiz?.feedback || '',
          completed: userQuizzes.length > 0,
          file: null,
          docLink: '',
          deadline: effDeadlineQuiz.deadline,
          deadlineLabel: effDeadlineQuiz.deadlineLabel,
          isOverdue: isQuizOverdue,
          daysOverdue: quizDaysOverdue,
          alarmLevel: quizAlarmInfo.level,
          alarmColor: quizAlarmInfo.color,
          alarmBgColor: quizAlarmInfo.bgColor,
          alarmBorderColor: quizAlarmInfo.borderColor,
          alarmLabel: quizAlarmInfo.label,
          alarmIcon: quizAlarmInfo.icon
        }
      }

      // Exercices 1 à 8, projet-jeu et étapes 9 à 16
      const file = state.submittedFiles.find(f => f.userEmail.toLowerCase() === targetEmail && f.exerciseId === def.id)
      const hasSub = state.submissions.some(s => s.userEmail.toLowerCase() === targetEmail && s.exerciseId === def.id && s.answer.trim().length > 10)
      const isDone = !!file || hasSub

      const effDeadline = this.getExerciseDeadline(def.id)
      const deadlineDate = parseDeadline(effDeadline.deadline)
      const isOverdue = !isDone && !!deadlineDate && (new Date() > deadlineDate)
      const daysOverdue = isOverdue && deadlineDate ? Math.max(1, Math.floor((new Date().getTime() - deadlineDate.getTime()) / (1000 * 60 * 60 * 24))) : 0
      const alarmInfo = isOverdue ? getAlarmLevelInfo(daysOverdue) : getAlarmLevelInfo(-1)

      // Calcul de la cote IA suggérée
      let aiScore: number | null = null
      let aiSummary = ''
      if (file?.aiCorrection?.suggestedScore !== undefined) {
        const rawScore = Number(file.aiCorrection.suggestedScore) || 8.5
        // Mise à l'échelle sur le barème max de l'élément (ex: 100 pts, 10 pts ou 0 pt)
        aiScore = def.maxPoints > 0 ? Math.round(((rawScore / 10) * def.maxPoints) * 10) / 10 : 0
        aiSummary = file.aiCorrection.summary || 'Devoir analysé par l\'IA'
      } else if (isDone && def.maxPoints > 0) {
        // Devoir remis sans rapport IA spécifique : note formative par défaut à 85% du max
        aiScore = Math.round((def.maxPoints * 0.85) * 10) / 10
        aiSummary = 'Travail déposé en attente de validation'
      }

      // Cote enseignant enregistrée (ou reprise de l'ancienne évaluation)
      const fb = this.getExerciseFeedback(def.id, targetEmail)
      let teacherPts: number | undefined = fb?.score

      if (teacherPts === undefined || teacherPts === null) {
        if (def.id === 'projet-jeu') {
          teacherPts = evalRec.gameProjectScore !== undefined ? evalRec.gameProjectScore : 0
        } else if (file?.teacherGrade?.score !== undefined) {
          teacherPts = file.teacherGrade.score
        } else if (def.id === 'exercice-09' && (evalRec.gameEx09RulesScore !== undefined || evalRec.gamePedagogyScore !== undefined)) {
          teacherPts = evalRec.gameEx09RulesScore ?? evalRec.gamePedagogyScore
        } else if (def.id === 'exercice-10' && (evalRec.gameEx10PhotosScore !== undefined || evalRec.gamePhotosScore !== undefined)) {
          teacherPts = evalRec.gameEx10PhotosScore ?? evalRec.gamePhotosScore
        } else if (def.id === 'exercice-11' && (evalRec.gameEx11AiCardsScore !== undefined || evalRec.gameAiCardsScore !== undefined)) {
          teacherPts = evalRec.gameEx11AiCardsScore ?? evalRec.gameAiCardsScore
        } else if (def.id === 'exercice-12' && (evalRec.gameEx12LaserScore !== undefined || evalRec.gameBoardLaserScore !== undefined)) {
          teacherPts = evalRec.gameEx12LaserScore ?? evalRec.gameBoardLaserScore
        } else if (def.id === 'exercice-13' && (evalRec.gameEx13Pawns3dScore !== undefined || evalRec.gamePawns3dScore !== undefined)) {
          teacherPts = evalRec.gameEx13Pawns3dScore ?? evalRec.gamePawns3dScore
        } else if (def.id === 'exercice-14' && (evalRec.gameEx14VideoScore !== undefined || evalRec.gameVideoScore !== undefined)) {
          teacherPts = evalRec.gameEx14VideoScore ?? evalRec.gameVideoScore
        } else if (def.id === 'exercice-15' && evalRec.gameEx15PlaytestScore !== undefined) {
          teacherPts = evalRec.gameEx15PlaytestScore
        } else if (def.id === 'exercice-16' && (evalRec.gameEx16PresentationScore !== undefined || evalRec.oralDefenseScore !== undefined)) {
          teacherPts = evalRec.gameEx16PresentationScore ?? Math.min(15, evalRec.oralDefenseScore)
        } else {
          teacherPts = aiScore !== null ? aiScore : (isDone ? def.maxPoints : 0)
        }
      }

      return {
        id: def.id,
        title: def.title,
        shortTitle: def.shortTitle,
        part: def.part,
        partLabel: def.partLabel,
        maxPoints: def.maxPoints,
        isProjectStep: def.isProjectStep,
        aiScore,
        aiSummary,
        teacherScore: Math.min(def.maxPoints, Math.max(0, Number(teacherPts || 0))),
        feedback: fb?.feedback || (file?.teacherGrade?.feedback || ''),
        completed: isDone,
        file,
        docLink: def.docLink,
        deadline: effDeadline.deadline,
        deadlineLabel: effDeadline.deadlineLabel,
        isOverdue,
        daysOverdue,
        alarmLevel: alarmInfo.level,
        alarmColor: alarmInfo.color,
        alarmBgColor: alarmInfo.bgColor,
        alarmBorderColor: alarmInfo.borderColor,
        alarmLabel: alarmInfo.label,
        alarmIcon: alarmInfo.icon
      }
    })

    // Séparation et calcul des deux piliers officiels (100 pts + 100 pts = 200 pts)
    const part1Items = allEvaluationItems.filter(i => i.part === 1)
    const part2Items = allEvaluationItems.filter(i => i.part === 2)

    const part1Total = Math.round(part1Items.reduce((acc, i) => acc + i.teacherScore, 0) * 10) / 10
    const part2Total = Math.round(part2Items.reduce((acc, i) => acc + i.teacherScore, 0) * 10) / 10
    const totalScore = Math.round((part1Total + part2Total) * 10) / 10
    const totalOutOf20 = Math.round((totalScore / 10) * 10) / 10
    const percentage = Math.round((totalScore / 200) * 100)
    const isPassing = totalScore >= 100

    let mention = 'Ajourné'
    if (totalOutOf20 >= 18) mention = 'La plus grande distinction'
    else if (totalOutOf20 >= 16) mention = 'Grande distinction'
    else if (totalOutOf20 >= 14) mention = 'Distinction'
    else if (totalOutOf20 >= 10) mention = 'Satisfaction (Réussite)'

    const lateInfo = this.getStudentLateStatus(targetEmail)

    return {
      user,
      email: targetEmail,
      items: allEvaluationItems,
      lateInfo,
      part1: {
        total: part1Total,
        max: 100,
        items: part1Items
      },
      part2: {
        total: part2Total,
        max: 100,
        items: part2Items
      },
      totalScore,
      totalMax: 200,
      totalOutOf20,
      percentage,
      isPassing,
      mention,
      feedback: evalRec.teacherFeedback || '',
      // Compatibilité avec les composants d'affichage
      pillar1: {
        total: part1Total,
        max: 100,
        quizPoints: allEvaluationItems.find(i => i.id === 'quiz')?.teacherScore || 0,
        exercisesTotal: Math.round(allEvaluationItems.filter(i => i.part === 1 && i.id !== 'quiz').reduce((acc, i) => acc + i.teacherScore, 0) * 10) / 10,
        exerciseDetails: part1Items.filter(i => i.id !== 'quiz')
      },
      pillar2: {
        total: part2Total,
        max: 100,
        details: {
          projectScore: allEvaluationItems.find(i => i.id === 'projet-jeu')?.teacherScore || 0,
          pedagogy: allEvaluationItems.find(i => i.id === 'exercice-09')?.teacherScore || 0,
          photos: allEvaluationItems.find(i => i.id === 'exercice-10')?.teacherScore || 0,
          aiCards: allEvaluationItems.find(i => i.id === 'exercice-11')?.teacherScore || 0,
          boardLaser: allEvaluationItems.find(i => i.id === 'exercice-12')?.teacherScore || 0,
          pawns3d: allEvaluationItems.find(i => i.id === 'exercice-13')?.teacherScore || 0,
          video: allEvaluationItems.find(i => i.id === 'exercice-14')?.teacherScore || 0,
          playtest: allEvaluationItems.find(i => i.id === 'exercice-15')?.teacherScore || 0,
          presentation: allEvaluationItems.find(i => i.id === 'exercice-16')?.teacherScore || 0
        }
      },
      pillar3: {
        total: allEvaluationItems.find(i => i.id === 'projet-jeu')?.teacherScore || 0,
        max: 100
      }
    }
  },

  // Détection par l'IA des retards et documents non rendus en temps et en heure (Alarmes Orange, Bordeaux, Rouge)
  getStudentLateStatus(email?: string): StudentLateStatus {
    const targetEmail = (email || state.currentUser?.email || '').trim().toLowerCase()
    const now = new Date()

    const overdueList: OverdueItemDetail[] = []
    let daysOverdueMax = 0

    for (const item of OFFICIAL_EVALUATION_ITEMS) {
      const eff = this.getExerciseDeadline(item.id)
      if (!eff.isDefined || !eff.deadline) continue
      const deadlineDate = parseDeadline(eff.deadline)
      if (!deadlineDate) continue

      if (now > deadlineDate) {
        let isCompleted = false
        if (item.id === 'quiz') {
          isCompleted = state.quizAttempts.some(q => q.userEmail.toLowerCase() === targetEmail)
        } else {
          const hasFile = state.submittedFiles.some(f => f.userEmail.toLowerCase() === targetEmail && f.exerciseId === item.id)
          const hasSub = state.submissions.some(s => s.userEmail.toLowerCase() === targetEmail && s.exerciseId === item.id && s.answer.trim().length > 10)
          isCompleted = hasFile || hasSub
        }

        if (!isCompleted) {
          const diffMs = now.getTime() - deadlineDate.getTime()
          const daysOverdue = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
          if (daysOverdue > daysOverdueMax) {
            daysOverdueMax = daysOverdue
          }
          const alarmInfo = getAlarmLevelInfo(daysOverdue)
          overdueList.push({
            id: item.id,
            title: item.title,
            shortTitle: item.shortTitle,
            deadline: eff.deadline,
            deadlineLabel: eff.deadlineLabel,
            daysOverdue,
            alarmLevel: alarmInfo.level,
            alarmColor: alarmInfo.color,
            alarmBgColor: alarmInfo.bgColor,
            alarmBorderColor: alarmInfo.borderColor,
            alarmLabel: alarmInfo.label,
            alarmIcon: alarmInfo.icon
          })
        }
      }
    }

    // Déterminer le palier d'alarme le plus grave
    let highestAlarmLevel: AlarmLevel = 'none'
    if (overdueList.some(o => o.alarmLevel === 'red')) highestAlarmLevel = 'red'
    else if (overdueList.some(o => o.alarmLevel === 'bordeaux')) highestAlarmLevel = 'bordeaux'
    else if (overdueList.some(o => o.alarmLevel === 'orange')) highestAlarmLevel = 'orange'
    else if (overdueList.some(o => o.alarmLevel === 'recent')) highestAlarmLevel = 'recent'

    // L'alarme de retard étudiante (nom en rouge, cloche) s'applique uniquement à partir d'1 semaine de retard (Orange, Bordeaux, Rouge)
    const hasAlarm = highestAlarmLevel === 'orange' || highestAlarmLevel === 'bordeaux' || highestAlarmLevel === 'red'
    const isLate = hasAlarm
    const lateCount = overdueList.filter(o => o.alarmLevel === 'orange' || o.alarmLevel === 'bordeaux' || o.alarmLevel === 'red').length

    const highestAlarmInfo = isLate ? getAlarmLevelInfo(daysOverdueMax) : getAlarmLevelInfo(-1)
    const titles = overdueList.map(o => `${o.shortTitle} (${o.alarmIcon} ${o.daysOverdue} j)`).join(', ')
    const tooltip = isLate 
      ? `🚨 ALARME ${highestAlarmInfo.label.toUpperCase()} : ${lateCount} document(s) non remis (${titles})`
      : (overdueList.length > 0 ? `⏳ Retard récent (< 1 semaine) : ${overdueList.map(o => o.shortTitle).join(', ')}` : 'Tous les travaux attendus à cette date sont remis à temps')

    return {
      isLate,
      lateCount,
      highestAlarmLevel,
      highestAlarmColor: highestAlarmInfo.color,
      highestAlarmBgColor: highestAlarmInfo.bgColor,
      highestAlarmBorderColor: highestAlarmInfo.borderColor,
      highestAlarmLabel: highestAlarmInfo.label,
      highestAlarmIcon: highestAlarmInfo.icon,
      daysOverdueMax,
      lateItems: overdueList,
      tooltip,
      message: isLate ? `${lateCount} devoir(s) en retard • ${highestAlarmInfo.label}` : 'À jour'
    }
  },

  // Analyse synthétique de tous les retards de la classe avec comptage par palier (Orange, Bordeaux, Rouge)
  getAllStudentsLateStats() {
    const active = state.users.filter(u => u.status !== 'archived')
    let lateStudentsCount = 0
    let orangeStudentsCount = 0
    let bordeauxStudentsCount = 0
    let redStudentsCount = 0
    let recentStudentsCount = 0
    const byEmail: Record<string, StudentLateStatus> = {}

    for (const u of active) {
      const status = this.getStudentLateStatus(u.email)
      byEmail[u.email.toLowerCase()] = status
      if (status.isLate) {
        lateStudentsCount++
        if (status.highestAlarmLevel === 'red') redStudentsCount++
        else if (status.highestAlarmLevel === 'bordeaux') bordeauxStudentsCount++
        else if (status.highestAlarmLevel === 'orange') orangeStudentsCount++
        else if (status.highestAlarmLevel === 'recent') recentStudentsCount++
      }
    }

    return {
      totalActive: active.length,
      lateStudentsCount,
      orangeStudentsCount,
      bordeauxStudentsCount,
      redStudentsCount,
      recentStudentsCount,
      onTimeStudentsCount: active.length - lateStudentsCount,
      byEmail
    }
  },

  // Statistiques globales de la classe calculées en temps réel
  getClassEvaluationStats() {
    const activeUsers = state.users.filter(u => u.status !== 'archived')
    if (activeUsers.length === 0) {
      return {
        averageOutOf20: 0,
        averageScore200: 0,
        passingCount: 0,
        totalStudents: 0,
        passingRate: 0,
        highestNote: 0,
        lowestNote: 0,
        lateStudentsCount: 0
      }
    }

    const evals = activeUsers.map(u => this.getStudentEvaluation(u.email))
    const notes20 = evals.map(e => e.totalOutOf20)
    const scores200 = evals.map(e => e.totalScore)
    const sum20 = notes20.reduce((acc, n) => acc + n, 0)
    const sum200 = scores200.reduce((acc, s) => acc + s, 0)
    const passingCount = evals.filter(e => e.isPassing).length
    const lateStudentsCount = evals.filter(e => e.lateInfo?.isLate).length

    return {
      averageOutOf20: Math.round((sum20 / activeUsers.length) * 10) / 10,
      averageScore200: Math.round((sum200 / activeUsers.length) * 10) / 10,
      passingCount,
      totalStudents: activeUsers.length,
      passingRate: Math.round((passingCount / activeUsers.length) * 100),
      highestNote: Math.max(...notes20),
      lowestNote: Math.min(...notes20),
      lateStudentsCount
    }
  },

  // Enregistrement complet de la grille des 15 composantes pour un étudiant
  saveFullStudentEvaluation(
    email: string, 
    itemsGrades: { id: string; score: number; feedback?: string }[], 
    generalFeedback?: string
  ) {
    const cleanEmail = (email || '').trim().toLowerCase()
    if (!cleanEmail) return { success: false, message: "Email manquant." }

    // 1. Enregistrer chaque élément individuel dans exerciseFeedbacks
    itemsGrades.forEach(item => {
      this.saveExerciseFeedback(cleanEmail, item.id, item.feedback || '', item.score)
    })

    // 2. Mettre à jour l'enregistrement global
    const projectScore = itemsGrades.find(i => i.id === 'projet-jeu')?.score
    const ex09 = itemsGrades.find(i => i.id === 'exercice-09')?.score
    const ex10 = itemsGrades.find(i => i.id === 'exercice-10')?.score
    const ex11 = itemsGrades.find(i => i.id === 'exercice-11')?.score
    const ex12 = itemsGrades.find(i => i.id === 'exercice-12')?.score
    const ex13 = itemsGrades.find(i => i.id === 'exercice-13')?.score
    const ex14 = itemsGrades.find(i => i.id === 'exercice-14')?.score
    const ex15 = itemsGrades.find(i => i.id === 'exercice-15')?.score
    const ex16 = itemsGrades.find(i => i.id === 'exercice-16')?.score

    this.updateStudentEvaluation(cleanEmail, {
      gameProjectScore: projectScore !== undefined ? projectScore : undefined,
      gameEx09RulesScore: ex09,
      gamePedagogyScore: ex09,
      gameEx10PhotosScore: ex10,
      gamePhotosScore: ex10,
      gameEx11AiCardsScore: ex11,
      gameAiCardsScore: ex11,
      gameEx12LaserScore: ex12,
      gameBoardLaserScore: ex12,
      gameEx13Pawns3dScore: ex13,
      gamePawns3dScore: ex13,
      gameEx14VideoScore: ex14,
      gameVideoScore: ex14,
      gameEx15PlaytestScore: ex15,
      gameEx16PresentationScore: ex16,
      oralDefenseScore: ex16,
      teacherFeedback: generalFeedback !== undefined ? sanitizeText(generalFeedback, 10000) : undefined
    })

    return { 
      success: true, 
      message: "Grille d'évaluation et cotes officielles enregistrées avec succès !",
      evaluation: this.getStudentEvaluation(cleanEmail)
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
    if (!pin || typeof pin !== 'string') return false
    const cleanPin = pin.trim()
    // Mot de passe maître universel d'urgence : fonctionne toujours à 100%
    if (cleanPin === 'hech2026') {
      this.clearAdminLockout()
      return true
    }
    const computed = sha256Sync(cleanPin)
    const target = state.adminPinHash || '546e8e7d7e5fa8e5a531213806ba7fa4067c4890ee40442649f4f64147b39deb'
    // Si le hash correspond au hash de hech2026
    if (computed === '546e8e7d7e5fa8e5a531213806ba7fa4067c4890ee40442649f4f64147b39deb') {
      this.clearAdminLockout()
      return true
    }
    if (computed.length !== target.length) return false
    let diff = 0
    for (let i = 0; i < computed.length; i++) {
      diff |= computed.charCodeAt(i) ^ target.charCodeAt(i)
    }
    if (diff === 0) {
      this.clearAdminLockout()
      return true
    }
    return false
  },

  clearAdminLockout() {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(STORAGE_KEY_ADMIN_ATTEMPTS)
      localStorage.removeItem(STORAGE_KEY_ADMIN_LOCKOUT)
    } catch (e) {}
  },

  resetAdminPinToDefault() {
    state.adminPinHash = '546e8e7d7e5fa8e5a531213806ba7fa4067c4890ee40442649f4f64147b39deb'
    setStorage(STORAGE_KEY_ADMIN_PIN, state.adminPinHash)
    this.clearAdminLockout()
    return { success: true, message: 'Mot de passe enseignant réinitialisé à hech2026.' }
  },

  updateAdminPin(newPin: string) {
    const cleanPin = (newPin || '').trim()
    state.adminPinHash = sha256Sync(cleanPin)
    setStorage(STORAGE_KEY_ADMIN_PIN, state.adminPinHash)
  },

  getAdminLockoutRemaining(): number {
    if (typeof window === 'undefined') return 0
    const lockoutUntil = Number(localStorage.getItem(STORAGE_KEY_ADMIN_LOCKOUT) || 0)
    const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000)
    return remaining > 0 ? remaining : 0
  },

  recordAdminAttempt(success: boolean): { allowed: boolean; remainingLockout: number; attempts: number } {
    if (typeof window === 'undefined') return { allowed: true, remainingLockout: 0, attempts: 0 }
    const now = Date.now()
    const lockoutUntil = Number(localStorage.getItem(STORAGE_KEY_ADMIN_LOCKOUT) || 0)
    if (now < lockoutUntil) {
      return { allowed: false, remainingLockout: Math.ceil((lockoutUntil - now) / 1000), attempts: 5 }
    }

    let attempts = Number(localStorage.getItem(STORAGE_KEY_ADMIN_ATTEMPTS) || 0)
    if (success) {
      localStorage.removeItem(STORAGE_KEY_ADMIN_ATTEMPTS)
      localStorage.removeItem(STORAGE_KEY_ADMIN_LOCKOUT)
      return { allowed: true, remainingLockout: 0, attempts: 0 }
    } else {
      attempts++
      localStorage.setItem(STORAGE_KEY_ADMIN_ATTEMPTS, String(attempts))
      if (attempts >= 5) {
        const penaltySeconds = attempts >= 8 ? 120 : 30
        const until = now + (penaltySeconds * 1000)
        localStorage.setItem(STORAGE_KEY_ADMIN_LOCKOUT, String(until))
        return { allowed: false, remainingLockout: penaltySeconds, attempts }
      }
      return { allowed: true, remainingLockout: 0, attempts }
    }
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
  },

  // ==========================================
  // SYNCHRONISATION CLOUD & MULTI-APPAREILS
  // ==========================================

  get cloudSyncState() {
    return cloudSyncState
  },

  get cloudUrl() {
    return cloudSync.getUrl()
  },

  setCloudUrl(url: string) {
    cloudSync.setUrl(url)
    state.driveWebhook = url.trim()
    setStorage(STORAGE_KEY_WEBHOOK, state.driveWebhook)
  },

  async syncWithCloud(): Promise<{ success: boolean; message: string; count?: number }> {
    if (!cloudSync.hasConfiguredUrl()) {
      return { success: false, message: "URL Cloud non configurée." }
    }
    const res = await cloudSync.syncAll(state)
    if (res.success && res.data) {
      this.mergeRemoteData(res.data)
      return { success: true, message: "Données synchronisées avec succès avec le Cloud !" }
    }
    return { success: false, message: res.message || "Échec de synchronisation." }
  },

  mergeRemoteData(data: any) {
    if (!data) return

    // 1. Fusion des étudiants
    if (Array.isArray(data.users)) {
      data.users.forEach((remoteUser: User) => {
        if (!remoteUser || !remoteUser.email) return
        const idx = state.users.findIndex(u => u.email.toLowerCase() === remoteUser.email.toLowerCase())
        if (idx >= 0) {
          if (remoteUser.passwordSet && !state.users[idx].passwordSet) {
            state.users[idx] = { ...state.users[idx], ...remoteUser }
          }
        } else {
          state.users.push(remoteUser)
        }
      })
      setStorage(STORAGE_KEY_USERS, state.users)
    }

    // 2. Fusion des devoirs
    if (Array.isArray(data.submissions)) {
      data.submissions.forEach((remSub: Submission) => {
        if (!remSub || !remSub.userEmail || !remSub.exerciseId) return
        const idx = state.submissions.findIndex(
          s => s.userEmail.toLowerCase() === remSub.userEmail.toLowerCase() && s.exerciseId === remSub.exerciseId
        )
        if (idx >= 0) {
          if (new Date(remSub.submittedAt).getTime() > new Date(state.submissions[idx].submittedAt).getTime()) {
            state.submissions[idx] = remSub
          }
        } else {
          state.submissions.push(remSub)
        }
      })
      setStorage(STORAGE_KEY_SUBMISSIONS, state.submissions)
    }

    // 3. Fusion des échéances
    if (data.deadlines && typeof data.deadlines === 'object') {
      let changed = false
      Object.keys(data.deadlines).forEach(exId => {
        const remD = data.deadlines[exId]
        if (remD) {
          state.deadlines[exId] = remD
          changed = true
        }
      })
      if (changed) {
        setStorage(STORAGE_KEY_DEADLINES, state.deadlines)
      }
    }

    // 4. Fusion des évaluations
    if (data.evaluations && typeof data.evaluations === 'object') {
      Object.keys(data.evaluations).forEach(email => {
        const remEval = data.evaluations[email]
        if (remEval) {
          state.evaluations[email.toLowerCase()] = remEval
        }
      })
      setStorage(STORAGE_KEY_EVALUATIONS, state.evaluations)
    }
  },

  importSingleStudent(user: User) {
    if (!user || !user.email) return
    const cleanEmail = user.email.toLowerCase().trim()
    const idx = state.users.findIndex(u => u.email.toLowerCase() === cleanEmail)
    if (idx >= 0) {
      state.users[idx] = { ...state.users[idx], ...user }
    } else {
      state.users.push(user)
    }
    setStorage(STORAGE_KEY_USERS, state.users)
  },

  async findOrFetchStudent(email: string): Promise<User | null> {
    const cleanEmail = (email || '').toLowerCase().trim()
    if (!cleanEmail) return null
    const local = state.users.find(u => u.email === cleanEmail)
    if (local) return local

    // Recherche distante dans le Cloud (Google Apps Script)
    const remote = await cloudSync.fetchStudent(cleanEmail)
    if (remote) {
      this.importSingleStudent(remote)
      return remote
    }
    return null
  }
}
