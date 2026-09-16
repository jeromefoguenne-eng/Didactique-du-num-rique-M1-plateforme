/**
 * Serveur compagnon local pour synchronisation directe Google Drive
 * Reçoit les fichiers déposés depuis la plateforme web et les enregistre
 * directement dans le dossier local Google Drive de l'enseignant.
 */

import http from 'http'
import fs from 'fs'
import path from 'path'

const PORT = 3001
const TARGET_DIR = 'C:\\Google Drive\\Prépas light\\HECh\\Péda\\Math-Num\\M1\\Didactique et numérique\\Exercices étudiants Plateforme'

// Vérifier et créer le dossier si besoin
if (!fs.existsSync(TARGET_DIR)) {
  try {
    fs.mkdirSync(TARGET_DIR, { recursive: true })
    console.log(`[DriveServer] Dossier cible créé : ${TARGET_DIR}`)
  } catch (e) {
    console.error(`[DriveServer] Impossible de créer le dossier : ${e.message}`)
  }
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
    res.end(JSON.stringify({ status: 'online', targetDir: TARGET_DIR }))
    return
  }

  if (req.method === 'POST' && req.url === '/api/upload') {
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })

    req.on('end', () => {
      try {
        const payload = JSON.parse(body)
        const { fileName, base64Data } = payload

        if (!fileName || !base64Data) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Champs fileName et base64Data requis.' }))
          return
        }

        // Nettoyage de la chaîne base64 (supprimer l'en-tête data:*/*;base64, si présent)
        const base64Clean = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data
        const buffer = Buffer.from(base64Clean, 'base64')
        const filePath = path.join(TARGET_DIR, fileName)

        fs.writeFileSync(filePath, buffer)
        console.log(`[DriveServer] Fichier écrit avec succès : ${fileName} (${buffer.length} octets)`)

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Fichier enregistré avec succès dans Google Drive.',
          fileName,
          filePath
        }))
      } catch (err) {
        console.error('[DriveServer] Erreur de traitement :', err)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: err.message }))
      }
    })
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Route non trouvée' }))
})

server.listen(PORT, () => {
  console.log(`=======================================================`)
  console.log(`🚀 Serveur Compagnon Google Drive actif sur le port ${PORT}`)
  console.log(`📁 Dossier cible : ${TARGET_DIR}`)
  console.log(`=======================================================`)
})
