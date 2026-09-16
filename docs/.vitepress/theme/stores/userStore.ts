import { reactive, computed } from 'vue'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'student' | 'admin'
  registeredAt: string
  status?: 'active' | 'archived'
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
}

const STORAGE_KEY_USERS = 'hech_didac_users'
const STORAGE_KEY_CURRENT = 'hech_didac_current_user'
const STORAGE_KEY_PROGRESS = 'hech_didac_progress'
const STORAGE_KEY_SUBMISSIONS = 'hech_didac_submissions'
const STORAGE_KEY_ADMIN_PIN = 'hech_didac_admin_pin'
const STORAGE_KEY_FILES = 'hech_didac_files'
const STORAGE_KEY_WEBHOOK = 'hech_didac_drive_webhook'

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
    status: 'active'
  },
  {
    id: 'user-2',
    firstName: 'Maxime',
    lastName: 'Lambert',
    email: 'maxime.lambert@student.hech.be',
    role: 'student',
    registeredAt: '2026-09-15 16:15',
    status: 'active'
  },
  {
    id: 'user-3',
    firstName: 'Thomas',
    lastName: 'Bastien',
    email: 'thomas.bastien@student.hech.be',
    role: 'student',
    registeredAt: '2026-09-16 08:45',
    status: 'active'
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
    driveSynced: false
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
    driveSynced: false
  }
]

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
  driveWebhook: getStorage<string>(STORAGE_KEY_WEBHOOK, ''),
  adminPin: getStorage<string>(STORAGE_KEY_ADMIN_PIN, 'hech2026')
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
    const index = state.users.findIndex(u => u.email === cleanEmail)
    if (index >= 0) {
      state.users.splice(index, 1)
      delete state.progress[cleanEmail]
      state.submissions = state.submissions.filter(s => s.userEmail !== cleanEmail)
      state.submittedFiles = state.submittedFiles.filter(f => f.userEmail !== cleanEmail)

      if (state.currentUser?.email === cleanEmail) {
        state.currentUser = null
        if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY_CURRENT)
      }

      setStorage(STORAGE_KEY_USERS, state.users)
      setStorage(STORAGE_KEY_PROGRESS, state.progress)
      setStorage(STORAGE_KEY_SUBMISSIONS, state.submissions)
      setStorage(STORAGE_KEY_FILES, state.submittedFiles)
      return { success: true, message: 'Étudiant supprimé.' }
    }
    return { success: false, message: 'Étudiant non trouvé.' }
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
  // SÉCURITÉ ADMIN
  // ==========================================

  verifyAdminPin(pin: string): boolean {
    return pin.trim() === state.adminPin
  },

  updateAdminPin(newPin: string) {
    state.adminPin = newPin.trim()
    setStorage(STORAGE_KEY_ADMIN_PIN, state.adminPin)
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
