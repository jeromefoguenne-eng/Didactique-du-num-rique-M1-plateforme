/**
 * Serveur compagnon local pour synchronisation directe Google Drive
 * Reçoit les fichiers déposés depuis la plateforme web et les enregistre
 * directement dans le dossier local Google Drive de l'enseignant,
 * en créant automatiquement un sous-dossier par nom d'étudiant.
 */

import http from 'http'
import fs from 'fs'
import path from 'path'

const PORT = 3001
const TARGET_DIR = 'C:\\Google Drive\\Prépas light\\HECh\\Péda\\Math-Num\\M1\\Didactique et numérique\\Exercices étudiants Plateforme'

// Vérifier et créer le dossier racine s'il n'existe pas
if (!fs.existsSync(TARGET_DIR)) {
  try {
    fs.mkdirSync(TARGET_DIR, { recursive: true })
    console.log(`[DriveServer] Dossier racine cible créé : ${TARGET_DIR}`)
  } catch (e) {
    console.error(`[DriveServer] Impossible de créer le dossier : ${e.message}`)
  }
}

function sanitizeFolderName(name) {
  if (!name || typeof name !== 'string') return 'Etudiants_Inconnus'
  return name.replace(/[<>:"/\\|?*]/g, '_').trim() || 'Etudiants_Inconnus'
}

function saveFileForStudent(fileName, base64Data, studentName) {
  const safeFolder = sanitizeFolderName(studentName)
  const studentDir = path.join(TARGET_DIR, safeFolder)

  if (!fs.existsSync(studentDir)) {
    fs.mkdirSync(studentDir, { recursive: true })
    console.log(`[DriveServer] 📁 Nouveau dossier étudiant créé : ${safeFolder}`)
  }

  const base64Clean = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data
  const buffer = Buffer.from(base64Clean, 'base64')
  const filePath = path.join(studentDir, fileName)

  fs.writeFileSync(filePath, buffer)
  console.log(`[DriveServer] 💾 Fichier enregistré : [${safeFolder}] / ${fileName} (${buffer.length} octets)`)
  return { filePath, studentDir, size: buffer.length }
}

const server = http.createServer((req, res) => {
  // Headers CORS pour autoriser l'accès depuis GitHub Pages ou localhost
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  if (req.method === 'GET' && req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ 
      status: 'online', 
      targetDir: TARGET_DIR,
      exists: fs.existsSync(TARGET_DIR)
    }))
    return
  }

  // Dépôt unitaire immédiat
  if (req.method === 'POST' && req.url === '/api/upload') {
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })

    req.on('end', () => {
      try {
        const payload = JSON.parse(body)
        const { fileName, base64Data, studentName, userName, studentEmail } = payload

        if (!fileName || !base64Data) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Champs fileName et base64Data requis.' }))
          return
        }

        const effectiveStudentName = studentName || userName || (studentEmail ? studentEmail.split('@')[0] : 'Etudiant')
        const result = saveFileForStudent(fileName, base64Data, effectiveStudentName)

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ 
          success: true, 
          message: `Fichier sauvegardé dans Google Drive sous le dossier "${sanitizeFolderName(effectiveStudentName)}".`,
          fileName,
          filePath: result.filePath
        }))
      } catch (err) {
        console.error('[DriveServer] Erreur de traitement /api/upload :', err)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: err.message }))
      }
    })
    return
  }

  // Synchronisation par lot (batch sync) de tous les travaux
  if (req.method === 'POST' && req.url === '/api/sync-all') {
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })

    req.on('end', () => {
      try {
        const payload = JSON.parse(body)
        const files = Array.isArray(payload.files) ? payload.files : []
        let savedCount = 0

        for (const f of files) {
          if (f.dataUrl && (f.formattedFileName || f.originalFileName)) {
            const fName = f.formattedFileName || f.originalFileName
            const sName = f.userName || (f.userEmail ? f.userEmail.split('@')[0] : 'Etudiant')
            saveFileForStudent(fName, f.dataUrl, sName)
            savedCount++
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ 
          success: true, 
          message: `${savedCount} travail(travaux) synchronisé(s) dans leurs dossiers respectifs.`,
          savedCount
        }))
      } catch (err) {
        console.error('[DriveServer] Erreur de traitement /api/sync-all :', err)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: err.message }))
      }
    })
    return
  }

  // Sauvegarde et chargement direct des échéances
  if (req.method === 'POST' && req.url === '/api/deadlines') {
    let body = ''
    req.on('data', chunk => { body += chunk.toString() })
    req.on('end', () => {
      try {
        const payload = JSON.parse(body)
        const deadlines = payload.deadlines || {}
        const filePath = path.join(TARGET_DIR, 'deadlines.json')
        fs.writeFileSync(filePath, JSON.stringify(deadlines, null, 2), 'utf-8')
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: true, message: 'Échéances enregistrées sur Google Drive.' }))
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: err.message }))
      }
    })
    return
  }

  if (req.method === 'GET' && req.url === '/api/deadlines') {
    try {
      const filePath = path.join(TARGET_DIR, 'deadlines.json')
      let deadlines = {}
      if (fs.existsSync(filePath)) {
        deadlines = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ success: true, deadlines }))
    } catch (err) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ success: true, deadlines: {} }))
    }
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Route non trouvée' }))
})

server.listen(PORT, () => {
  console.log(`=======================================================`)
  console.log(`🚀 Serveur Compagnon Google Drive actif sur le port ${PORT}`)
  console.log(`📁 Dossier cible : ${TARGET_DIR}`)
  console.log(`📂 Organisation : 1 sous-dossier par nom d'étudiant`)
  console.log(`=======================================================`)
})
