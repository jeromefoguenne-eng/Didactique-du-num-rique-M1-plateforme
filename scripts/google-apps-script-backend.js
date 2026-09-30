/**
 * =========================================================================
 * BACKEND GOOGLE APPS SCRIPT - DIDACTIQUE DU NUMÉRIQUE M1 (HECh)
 * =========================================================================
 * 
 * Ce script transforme votre compte Google Drive & Google Sheet en une API
 * sécurisée pour synchroniser la plateforme sur tous les appareils :
 * - Smartphones des étudiants (inscriptions, devoirs, quiz)
 * - Ordinateurs des étudiants (connexion nomade sans perte de données)
 * - PC portable et PC fixe de l'enseignant (suivi en temps réel)
 * 
 * PROCÉDURE D'INSTALLATION (Moins de 2 minutes) :
 * 1. Ouvrez https://script.google.com et cliquez sur "Nouveau projet"
 * 2. Renommez le projet : "Plateforme Didactique M1"
 * 3. Effacez le code existant et collez TOUT le contenu de ce fichier
 * 4. Cliquez sur "Déployer" (bouton bleu en haut à droite) > "Nouveau déploiement"
 * 5. Type : Cliquez sur l'engrenage > sélectionnez "Application Web"
 * 6. Configuration :
 *    - Description : "Version 1.0 Production"
 *    - Exécuter en tant que : "Moi" (votre compte Google)
 *    - Qui a accès : "Tout le monde" (Anyone)
 * 7. Cliquez sur "Déployer", autorisez l'accès Google, puis copiez l'URL générée
 *    (se terminant par /exec)
 * 8. Collez cette URL dans l'Espace Admin de votre plateforme !
 * =========================================================================
 */

var SPREADSHEET_NAME = "Didactique Numérique M1 - Données Plateforme";
var DRIVE_FOLDER_NAME = "Exercices étudiants Plateforme";

/**
 * Point d'entrée GET (Lecture / Synchronisation)
 */
function doGet(e) {
  try {
    var params = e ? e.parameter : {};
    var action = params.action || 'syncAll';

    if (action === 'getStudent') {
      var email = (params.email || '').trim().toLowerCase();
      var student = getStudentByEmail(email);
      return createJsonResponse({ status: "success", user: student });
    }

    if (action === 'getQuizAttempts') {
      var fullData = getFullDataFromSheet();
      return createJsonResponse({ status: "success", quizAttempts: fullData.quizAttempts || [] });
    }

    if (action === 'getFiles') {
      var fullData = getFullDataFromSheet();
      return createJsonResponse({ status: "success", submittedFiles: fullData.submittedFiles || [] });
    }

    if (action === 'syncAll') {
      var fullData = getFullDataFromSheet();
      return createJsonResponse({ status: "success", data: fullData });
    }

    return createJsonResponse({ status: "success", message: "API Didactique M1 en ligne." });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

/**
 * Point d'entrée POST (Écriture / Sauvegarde / Fusion)
 */
function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    var action = body.action || '';

    // 1. Synchronisation globale bidirectionnelle
    if (action === 'syncAll') {
      var mergedData = mergeAndSyncAll(body.state || {});
      return createJsonResponse({ status: "success", data: mergedData });
    }

    // 2. Recherche d'étudiant
    if (action === 'getStudent') {
      var email = (body.email || '').trim().toLowerCase();
      var student = getStudentByEmail(email);
      return createJsonResponse({ status: "success", user: student });
    }

    // 3. Inscription d'un nouvel étudiant
    if (action === 'registerStudent') {
      var savedUser = saveOrUpdateStudent(body.user);
      return createJsonResponse({ status: "success", user: savedUser });
    }

    // 4. Mise à jour d'étudiant (ex: mot de passe)
    if (action === 'updateStudent') {
      var updatedUser = saveOrUpdateStudent(body.user);
      return createJsonResponse({ status: "success", user: updatedUser });
    }

    // 4b. Suppression définitive d'un étudiant
    if (action === 'deleteStudent') {
      var delEmail = (body.email || '').trim().toLowerCase();
      var delSuccess = deleteStudentFromSheet(delEmail);
      return createJsonResponse({ status: "success", success: delSuccess, message: "Étudiant supprimé." });
    }

    // 5. Sauvegarde d'un devoir / texte d'exercice
    if (action === 'saveSubmission') {
      saveSubmissionToSheet(body.submission);
      return createJsonResponse({ status: "success", message: "Devoir enregistré." });
    }

    // 6. Sauvegarde d'un résultat de Quiz
    if (action === 'saveQuizAttempt') {
      saveQuizToSheet(body.quizAttempt);
      return createJsonResponse({ status: "success", message: "Quiz enregistré." });
    }

    // 7. Sauvegarde des échéances
    if (action === 'saveDeadlines') {
      saveDeadlinesToSheet(body.deadlines);
      return createJsonResponse({ status: "success", message: "Échéances synchronisées." });
    }

    // 8. Sauvegarde d'une évaluation certificative
    if (action === 'saveEvaluation') {
      saveEvaluationToSheet(body.email, body.evaluation);
      return createJsonResponse({ status: "success", message: "Évaluation synchronisée." });
    }

    // 9. Dépôt de fichier binaire (Word, PDF, ZIP) vers Google Drive
    if (action === 'uploadFile') {
      var fileResult = saveFileToDrive(body);
      return createJsonResponse(fileResult);
    }

    return createJsonResponse({ status: "error", message: "Action non reconnue : " + action });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

/**
 * Utilitaire pour formater la réponse JSON avec en-têtes CORS
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// =========================================================================
// GESTION DU TABLEUR GOOGLE SHEET (BASE DE DONNÉES)
// =========================================================================

function getOrCreateSpreadsheet() {
  // 1. Si le script est lié directement à un classeur
  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active && active.getSheetByName("Etudiants")) return active;
  } catch (e) {}

  // 2. Recherche parmi tous les classeurs portant le nom officiel (sélection du plus complet)
  var files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  var bestSs = null;
  var maxRows = -1;

  while (files.hasNext()) {
    var f = files.next();
    try {
      var candidate = SpreadsheetApp.open(f);
      var uSheet = candidate.getSheetByName("Etudiants");
      var rows = uSheet ? uSheet.getLastRow() : 0;
      if (rows > maxRows) {
        maxRows = rows;
        bestSs = candidate;
      }
    } catch (e) {}
  }

  if (bestSs && maxRows > 1) {
    return bestSs;
  }

  // 3. Recherche élargie par mot-clé si aucun classeur n'avait de données
  try {
    var searchFiles = DriveApp.searchFiles('title contains "Didactique" and mimeType = "application/vnd.google-apps.spreadsheet"');
    while (searchFiles.hasNext()) {
      var sf = searchFiles.next();
      var candidate2 = SpreadsheetApp.open(sf);
      var uSheet2 = candidate2.getSheetByName("Etudiants");
      var rows2 = uSheet2 ? uSheet2.getLastRow() : 0;
      if (rows2 > maxRows) {
        maxRows = rows2;
        bestSs = candidate2;
      }
    }
    if (bestSs && maxRows > 1) return bestSs;
  } catch (e) {}

  if (bestSs) return bestSs;

  // 4. Création d'un nouveau tableur uniquement si aucun fichier n'existe
  var ss = SpreadsheetApp.create(SPREADSHEET_NAME);
  initSheetTabs(ss);
  return ss;
}

function initSheetTabs(ss) {
  // Onglet Étudiants
  var sheetUsers = ss.getSheetByName("Etudiants") || ss.insertSheet("Etudiants");
  if (sheetUsers.getLastRow() === 0) {
    sheetUsers.appendRow(["Email", "Prénom", "Nom", "MotDePasse", "MotDePasseDéfini", "DateInscription", "Statut", "DonnéesJSON"]);
    sheetUsers.getRange("A1:H1").setFontWeight("bold").setBackground("#e0f2fe");
  }

  // Onglet Devoirs
  var sheetSubs = ss.getSheetByName("Devoirs") || ss.insertSheet("Devoirs");
  if (sheetSubs.getLastRow() === 0) {
    sheetSubs.appendRow(["ID", "Email", "NomÉtudiant", "ExerciceID", "TitreExercice", "ContenuTexte", "DateDépôt"]);
    sheetSubs.getRange("A1:G1").setFontWeight("bold").setBackground("#fef08a");
  }

  // Onglet Fichiers Google Drive
  var sheetFiles = ss.getSheetByName("Fichiers") || ss.insertSheet("Fichiers");
  if (sheetFiles.getLastRow() === 0) {
    sheetFiles.appendRow(["ID", "Email", "NomÉtudiant", "ExerciceID", "NomFichier", "LienDrive", "DateDépôt"]);
    sheetFiles.getRange("A1:G1").setFontWeight("bold").setBackground("#dcfce7");
  }

  // Onglet Quiz
  var sheetQuiz = ss.getSheetByName("Quiz") || ss.insertSheet("Quiz");
  if (sheetQuiz.getLastRow() === 0) {
    sheetQuiz.appendRow(["Email", "NomÉtudiant", "QuizID", "Score", "Total", "Pourcentage", "DatePassage"]);
    sheetQuiz.getRange("A1:G1").setFontWeight("bold").setBackground("#f3e8ff");
  }

  // Onglet Échéances
  var sheetDeadlines = ss.getSheetByName("Echeances") || ss.insertSheet("Echeances");
  if (sheetDeadlines.getLastRow() === 0) {
    sheetDeadlines.appendRow(["ExerciceID", "DateÉchéance", "DateVerrouillage", "Bloquant", "Libellé"]);
    sheetDeadlines.getRange("A1:E1").setFontWeight("bold").setBackground("#fed7aa");
  }

  // Onglet Évaluations
  var sheetEval = ss.getSheetByName("Evaluations") || ss.insertSheet("Evaluations");
  if (sheetEval.getLastRow() === 0) {
    sheetEval.appendRow(["Email", "NomÉtudiant", "NoteTotal200", "Pilier1_100", "Pilier2_100", "Pilier3_30", "Commentaire", "DétailsJSON", "DateModif"]);
    sheetEval.getRange("A1:I1").setFontWeight("bold").setBackground("#fce7f3");
  }

  // Supprimer la feuille par défaut si présente
  var defaultSheet = ss.getSheetByName("Feuille 1");
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }
}

// =========================================================================
// OPÉRATIONS CRUD SUR LES ÉTUDIANTS
// =========================================================================

function getStudentByEmail(email) {
  if (!email) return null;
  var ss = getOrCreateSpreadsheet();
  var sheet = ss.getSheetByName("Etudiants") || ss.insertSheet("Etudiants");
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return null;

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[0] && row[0].toString().trim().toLowerCase() === email) {
      if (row[7]) {
        try {
          return JSON.parse(row[7]);
        } catch (e) {}
      }
      return {
        email: row[0],
        firstName: row[1],
        lastName: row[2],
        password: row[3],
        passwordSet: row[4] === true || row[4] === "true",
        registeredAt: row[5],
        status: row[6] || 'active'
      };
    }
  }
  return null;
}

function saveOrUpdateStudent(user) {
  if (!user || !user.email) return null;
  var cleanEmail = user.email.trim().toLowerCase();
  var ss = getOrCreateSpreadsheet();
  var sheet = ss.getSheetByName("Etudiants") || ss.insertSheet("Etudiants");
  var data = sheet.getDataRange().getValues();

  var foundRow = -1;
  var existingPassword = '';
  var existingPasswordSet = false;
  var duplicateRows = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().trim().toLowerCase() === cleanEmail) {
      if (foundRow === -1) {
        foundRow = i + 1;
        existingPassword = (data[i][3] || '').toString().trim();
        existingPasswordSet = data[i][4] === true || data[i][4] === "true" || !!existingPassword;
      } else {
        // Collecte des doublons éventuels
        if (!existingPassword && data[i][3]) {
          existingPassword = (data[i][3] || '').toString().trim();
          existingPasswordSet = true;
        }
        duplicateRows.push(i + 1);
      }
    }
  }

  var incomingPass = (user.password || '').toString().trim();
  var finalPassword = incomingPass || existingPassword || '';
  var finalPasswordSet = user.passwordSet === true || (finalPassword !== '' && existingPasswordSet) || (finalPassword !== '' && incomingPass !== '');

  var finalUser = {
    id: user.id || ('user-' + new Date().getTime()),
    email: cleanEmail,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    password: finalPassword,
    passwordSet: finalPasswordSet,
    registeredAt: user.registeredAt || new Date().toISOString(),
    status: user.status || 'active',
    role: user.role || 'student'
  };

  var rowValues = [
    cleanEmail,
    finalUser.firstName,
    finalUser.lastName,
    finalPassword,
    finalPasswordSet,
    finalUser.registeredAt,
    finalUser.status,
    JSON.stringify(finalUser)
  ];

  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  // Nettoyage des lignes en double de bas en haut
  for (var d = duplicateRows.length - 1; d >= 0; d--) {
    try {
      sheet.deleteRow(duplicateRows[d]);
    } catch (e) {}
  }

  return finalUser;
}

function deleteStudentFromSheet(email) {
  if (!email) return false;
  var cleanEmail = email.trim().toLowerCase();
  var ss = getOrCreateSpreadsheet();
  var sheet = ss.getSheetByName("Etudiants");
  if (!sheet || sheet.getLastRow() <= 1) return false;

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().trim().toLowerCase() === cleanEmail) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

// =========================================================================
// OPÉRATIONS CRUD SUR LES DEVOIRS, QUIZ, ÉCHÉANCES & ÉVALUATIONS
// =========================================================================

function saveSubmissionToSheet(sub) {
  if (!sub || !sub.userEmail) return;
  var ss = getOrCreateSpreadsheet();
  var sheet = ss.getSheetByName("Devoirs") || ss.insertSheet("Devoirs");
  var data = sheet.getDataRange().getValues();

  var cleanEmail = sub.userEmail.trim().toLowerCase();
  var exId = sub.exerciseId || '';

  var foundRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] && data[i][1].toString().trim().toLowerCase() === cleanEmail && data[i][3] === exId) {
      foundRow = i + 1;
      break;
    }
  }

  var rowData = [
    sub.id || Utilities.getUuid(),
    cleanEmail,
    sub.userName || '',
    exId,
    sub.exerciseTitle || '',
    sub.content || '',
    sub.submittedAt || new Date().toISOString()
  ];

  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
}

function saveQuizToSheet(q) {
  if (!q || !q.userEmail) return;
  var ss = getOrCreateSpreadsheet();
  var sheet = ss.getSheetByName("Quiz") || ss.insertSheet("Quiz");
  var cleanEmail = q.userEmail.trim().toLowerCase();
  var qId = (q.quizId || q.moduleId || '').toString();
  var scr = Number(q.score) || 0;
  var tot = Number(q.totalQuestions || q.totalPoints) || 0;
  var pct = Number(q.percentage) || 0;
  var dt = q.completedAt || q.submittedAt || new Date().toISOString();
  var ansJson = q.answersJson || (q.answers ? JSON.stringify(q.answers) : '');

  // Déduplication : si même étudiant, même quizId et même score enregistré le même jour, ne pas dupliquer
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    if (r[0] && r[0].toString().trim().toLowerCase() === cleanEmail &&
        r[2] && r[2].toString().trim() === qId &&
        Number(r[3]) === scr &&
        (r[6] || '').toString().substring(0, 10) === dt.toString().substring(0, 10)) {
      return;
    }
  }

  sheet.appendRow([
    cleanEmail,
    q.userName || '',
    qId,
    scr,
    tot,
    pct,
    dt,
    ansJson
  ]);
}

function saveDeadlinesToSheet(deadlines) {
  if (!deadlines) return;
  var ss = getOrCreateSpreadsheet();
  var sheet = ss.getSheetByName("Echeances") || ss.insertSheet("Echeances");
  sheet.clearContents();
  sheet.appendRow(["ExerciceID", "DateÉchéance", "DateVerrouillage", "Bloquant", "Libellé"]);
  sheet.getRange("A1:E1").setFontWeight("bold").setBackground("#fed7aa");

  Object.keys(deadlines).forEach(function(exId) {
    var d = deadlines[exId];
    if (d) {
      var dueDate = d.deadline || d.dueDate || '';
      var label = d.deadlineLabel || d.label || '';
      sheet.appendRow([
        exId,
        dueDate,
        d.hardDueDate || '',
        d.isBlocking === true,
        label
      ]);
    }
  });
}

function saveEvaluationToSheet(email, ev) {
  if (!email || !ev) return;
  var cleanEmail = email.trim().toLowerCase();
  var ss = getOrCreateSpreadsheet();
  var sheet = ss.getSheetByName("Evaluations") || ss.insertSheet("Evaluations");
  var data = sheet.getDataRange().getValues();

  var foundRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().trim().toLowerCase() === cleanEmail) {
      foundRow = i + 1;
      break;
    }
  }

  var rowData = [
    cleanEmail,
    ev.studentName || '',
    ev.total200 || 0,
    (ev.pillar1 ? ev.pillar1.total : 0),
    (ev.pillar2 ? ev.pillar2.total : 0),
    (ev.pillar3 ? ev.pillar3.total : 0),
    ev.feedback || '',
    JSON.stringify(ev),
    new Date().toISOString()
  ];

  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
}

// =========================================================================
// SYNCHRONISATION GLOBALE & EXTRACTION COMPLÈTE
// =========================================================================

function getFullDataFromSheet() {
  var ss = getOrCreateSpreadsheet();

  // 1. Étudiants (Dédupliqués et protégés contre la perte de mot de passe)
  var users = [];
  var usersMap = {};
  var sheetUsers = ss.getSheetByName("Etudiants");
  if (sheetUsers && sheetUsers.getLastRow() > 1) {
    var dataU = sheetUsers.getDataRange().getValues();
    for (var i = 1; i < dataU.length; i++) {
      var r = dataU[i];
      var uObj = null;
      if (r[7]) {
        try { uObj = JSON.parse(r[7]); } catch (e) {}
      }
      if (!uObj && r[0]) {
        uObj = {
          email: r[0],
          firstName: r[1],
          lastName: r[2],
          password: r[3],
          passwordSet: r[4] === true || r[4] === "true",
          registeredAt: r[5],
          status: r[6] || 'active'
        };
      }
      if (uObj && uObj.email) {
        var key = uObj.email.toString().trim().toLowerCase();
        var incomingPass = (uObj.password && uObj.password.toString().trim()) || (r[3] ? r[3].toString().trim() : '');
        var incomingPSet = uObj.passwordSet === true || uObj.passwordSet === "true" || r[4] === true || r[4] === "true" || !!incomingPass;
        if (!usersMap[key]) {
          usersMap[key] = Object.assign({}, uObj, {
            email: key,
            password: incomingPass,
            passwordSet: incomingPSet
          });
        } else {
          // Fusionner intelligemment sans écraser le mot de passe existant
          var curPass = usersMap[key].password || '';
          var curPSet = usersMap[key].passwordSet === true;
          var finalPass = incomingPass || curPass;
          var finalPSet = incomingPSet || curPSet || !!finalPass;
          usersMap[key] = Object.assign({}, usersMap[key], uObj, {
            email: key,
            password: finalPass,
            passwordSet: finalPSet
          });
        }
      }
    }
    for (var k in usersMap) {
      users.push(usersMap[k]);
    }
  }

  // 2. Devoirs
  var submissions = [];
  var sheetSubs = ss.getSheetByName("Devoirs");
  if (sheetSubs && sheetSubs.getLastRow() > 1) {
    var dataS = sheetSubs.getDataRange().getValues();
    for (var j = 1; j < dataS.length; j++) {
      var s = dataS[j];
      if (s[1] && s[3]) {
        submissions.push({
          id: s[0],
          userEmail: s[1],
          userName: s[2],
          exerciseId: s[3],
          exerciseTitle: s[4],
          content: s[5],
          submittedAt: s[6]
        });
      }
    }
  }

  // 3. Échéances
  var deadlines = {};
  var sheetD = ss.getSheetByName("Echeances");
  if (sheetD && sheetD.getLastRow() > 1) {
    var dataD = sheetD.getDataRange().getValues();
    for (var k = 1; k < dataD.length; k++) {
      var d = dataD[k];
      if (d[0] && d[1]) {
        deadlines[d[0]] = {
          exerciseId: d[0],
          deadline: d[1] || '',
          dueDate: d[1] || '',
          deadlineLabel: d[4] || '',
          hardDueDate: d[2] || null,
          isBlocking: d[3] === true || d[3] === "true",
          label: d[4] || ''
        };
      }
    }
  }

  // 4. Évaluations
  var evaluations = {};
  var sheetE = ss.getSheetByName("Evaluations");
  if (sheetE && sheetE.getLastRow() > 1) {
    var dataE = sheetE.getDataRange().getValues();
    for (var m = 1; m < dataE.length; m++) {
      var ev = dataE[m];
      if (ev[0] && ev[7]) {
        try {
          evaluations[ev[0]] = JSON.parse(ev[7]);
        } catch (e) {}
      }
    }
  }

  // 5. Quiz passés par les étudiants
  var quizAttempts = [];
  var sheetQuiz = ss.getSheetByName("Quiz");
  if (sheetQuiz && sheetQuiz.getLastRow() > 1) {
    var dataQ = sheetQuiz.getDataRange().getValues();
    for (var qIdx = 1; qIdx < dataQ.length; qIdx++) {
      var qr = dataQ[qIdx];
      if (qr[0]) {
        var ans = [];
        if (qr[7]) {
          try { ans = JSON.parse(qr[7]); } catch (e) {}
        }
        var mId = (qr[2] || '01').toString();
        quizAttempts.push({
          id: 'quiz-cloud-' + qIdx + '-' + (qr[0] || '').toString().replace(/[^a-zA-Z0-9]/g, ''),
          userEmail: (qr[0] || '').toString().trim().toLowerCase(),
          userName: qr[1] || '',
          moduleId: mId,
          quizId: mId,
          moduleTitle: 'Module ' + mId,
          score: Number(qr[3]) || 0,
          totalPoints: Number(qr[4]) || 0,
          totalQuestions: Number(qr[4]) || 0,
          percentage: Number(qr[5]) || 0,
          submittedAt: qr[6] ? new Date(qr[6]).toISOString().replace('T', ' ').substring(0, 16) : new Date().toISOString().replace('T', ' ').substring(0, 16),
          answers: ans,
          evaluationType: 'diagnostic'
        });
      }
    }
  }

  // 6. Fichiers déposés par les étudiants (Google Drive)
  var submittedFiles = [];
  var sheetF = ss.getSheetByName("Fichiers");
  if (sheetF && sheetF.getLastRow() > 1) {
    var dataF = sheetF.getDataRange().getValues();
    for (var fIdx = 1; fIdx < dataF.length; fIdx++) {
      var fr = dataF[fIdx];
      if (fr[1]) {
        var rawEx = (fr[3] || '').toString().trim();
        var exId = rawEx;
        if (rawEx.indexOf('Atelier 1') !== -1 || rawEx.indexOf('exercice-01') !== -1) exId = 'exercice-01';
        else if (rawEx.indexOf('Atelier 2') !== -1 || rawEx.indexOf('exercice-02') !== -1) exId = 'exercice-02';
        else if (rawEx.indexOf('Atelier 3') !== -1 || rawEx.indexOf('exercice-03') !== -1) exId = 'exercice-03';
        else if (rawEx.indexOf('Atelier 4') !== -1 || rawEx.indexOf('exercice-04') !== -1) exId = 'exercice-04';
        else if (rawEx.indexOf('Atelier 5') !== -1 || rawEx.indexOf('exercice-05') !== -1) exId = 'exercice-05';
        else if (rawEx.indexOf('Atelier 6') !== -1 || rawEx.indexOf('exercice-06') !== -1) exId = 'exercice-06';
        else if (rawEx.indexOf('Atelier 7') !== -1 || rawEx.indexOf('exercice-07') !== -1) exId = 'exercice-07';
        else if (rawEx.indexOf('Atelier 8') !== -1 || rawEx.indexOf('exercice-08') !== -1) exId = 'exercice-08';
        else if (rawEx.indexOf('exercice-09') !== -1) exId = 'exercice-09';
        else if (rawEx.indexOf('exercice-10') !== -1) exId = 'exercice-10';
        else if (rawEx.indexOf('exercice-11') !== -1) exId = 'exercice-11';
        else if (rawEx.indexOf('exercice-12') !== -1) exId = 'exercice-12';
        else if (rawEx.indexOf('exercice-13') !== -1) exId = 'exercice-13';
        else if (rawEx.indexOf('exercice-14') !== -1) exId = 'exercice-14';
        else if (rawEx.indexOf('exercice-15') !== -1) exId = 'exercice-15';
        else if (rawEx.indexOf('exercice-16') !== -1) exId = 'exercice-16';

        submittedFiles.push({
          id: (fr[0] || ('file-' + fIdx)).toString(),
          userEmail: (fr[1] || '').toString().trim().toLowerCase(),
          userName: fr[2] || '',
          exerciseId: exId,
          exerciseTitle: fr[3] || exId,
          originalFileName: fr[4] || 'Document.pdf',
          formattedFileName: fr[4] || 'Document.pdf',
          driveUrl: fr[5] || '',
          submittedAt: fr[6] ? new Date(fr[6]).toISOString().replace('T', ' ').substring(0, 16) : new Date().toISOString().replace('T', ' ').substring(0, 16),
          driveSynced: true
        });
      }
    }
  }

  return {
    users: users,
    submissions: submissions,
    deadlines: deadlines,
    evaluations: evaluations,
    quizAttempts: quizAttempts,
    submittedFiles: submittedFiles
  };
}

function mergeAndSyncAll(incomingState) {
  var remote = getFullDataFromSheet();

  // Fusion des étudiants
  var mergedUsersMap = {};
  (remote.users || []).forEach(function(u) { if (u.email) mergedUsersMap[u.email.toLowerCase()] = u; });
  (incomingState.users || []).forEach(function(u) {
    if (u.email) {
      var em = u.email.toLowerCase();
      var incomingPass = (u.password || '').toString().trim();
      if (!mergedUsersMap[em]) {
        mergedUsersMap[em] = u;
        saveOrUpdateStudent(u);
      } else {
        // Mettre à jour si mot de passe configuré localement et absent du serveur
        var remotePass = (mergedUsersMap[em].password || '').toString().trim();
        if ((u.passwordSet || incomingPass) && (!mergedUsersMap[em].passwordSet || !remotePass)) {
          mergedUsersMap[em] = Object.assign({}, mergedUsersMap[em], u, {
            password: incomingPass || remotePass,
            passwordSet: true
          });
          saveOrUpdateStudent(mergedUsersMap[em]);
        }
      }
    }
  });

  // Fusion des devoirs
  var mergedSubsMap = {};
  (remote.submissions || []).forEach(function(s) { mergedSubsMap[s.userEmail + '::' + s.exerciseId] = s; });
  (incomingState.submissions || []).forEach(function(s) {
    var key = s.userEmail + '::' + s.exerciseId;
    if (!mergedSubsMap[key]) {
      mergedSubsMap[key] = s;
      saveSubmissionToSheet(s);
    }
  });

  // Fusion des quiz
  if (incomingState.quizAttempts && incomingState.quizAttempts.length > 0) {
    incomingState.quizAttempts.forEach(function(q) {
      saveQuizToSheet(q);
    });
  }

  // Fusion des métadonnées de fichiers
  if (incomingState.submittedFiles && incomingState.submittedFiles.length > 0) {
    var ss = getOrCreateSpreadsheet();
    var sheetF = ss.getSheetByName("Fichiers") || ss.insertSheet("Fichiers");
    var existingFData = sheetF.getDataRange().getValues();
    var existingFMap = {};
    for (var f = 1; f < existingFData.length; f++) {
      if (existingFData[f][1] && existingFData[f][3]) {
        existingFMap[existingFData[f][1].toString().trim().toLowerCase() + '::' + existingFData[f][3]] = true;
      }
    }
    incomingState.submittedFiles.forEach(function(file) {
      if (file && file.userEmail && file.exerciseId) {
        var key = file.userEmail.trim().toLowerCase() + '::' + file.exerciseId;
        if (!existingFMap[key]) {
          sheetF.appendRow([
            file.id || Utilities.getUuid(),
            file.userEmail.trim().toLowerCase(),
            file.userName || '',
            file.exerciseId,
            file.formattedFileName || file.originalFileName || 'Document',
            file.driveUrl || '',
            file.submittedAt || new Date().toISOString()
          ]);
          existingFMap[key] = true;
        }
      }
    });
  }

  // Échéances : si présentes dans incomingState avec au moins une date, les sauvegarder
  if (incomingState.deadlines && Object.keys(incomingState.deadlines).length > 0) {
    var hasValidDeadline = Object.keys(incomingState.deadlines).some(function(k) {
      var item = incomingState.deadlines[k];
      return item && (item.deadline || item.dueDate);
    });
    if (hasValidDeadline) {
      saveDeadlinesToSheet(incomingState.deadlines);
      remote.deadlines = incomingState.deadlines;
    }
  }

  return getFullDataFromSheet();
}

// =========================================================================
// GESTION DU DÉPÔT DE FICHIERS DANS GOOGLE DRIVE
// =========================================================================

function saveFileToDrive(data) {
  if (!data || !data.base64Data || !data.fileName) {
    return { status: "error", message: "base64Data et fileName requis." };
  }

  // 1. Récupération ou création du dossier cible principal
  var folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  var targetFolder = folders.hasNext() ? folders.next() : DriveApp.createFolder(DRIVE_FOLDER_NAME);

  // 1b. Récupération ou création du sous-dossier par nom d'étudiant
  var studentFolderName = (data.studentName || data.studentEmail || "Etudiant_Inconnu").toString().trim();
  studentFolderName = studentFolderName.replace(/[\/\\:*?"<>|]/g, '_');
  var studentFolders = targetFolder.getFoldersByName(studentFolderName);
  var studentFolder = studentFolders.hasNext() ? studentFolders.next() : targetFolder.createFolder(studentFolderName);

  // 2. Décodage base64 et création du fichier dans le dossier de l'étudiant
  var cleanBase64 = data.base64Data.indexOf(',') > -1 ? data.base64Data.split(',')[1] : data.base64Data;
  var decoded = Utilities.base64Decode(cleanBase64);
  var mime = data.mimeType || 'application/octet-stream';
  var blob = Utilities.newBlob(decoded, mime, data.fileName);
  var file = studentFolder.createFile(blob);

  // 3. Enregistrement dans l'onglet "Fichiers" du tableur
  var ss = getOrCreateSpreadsheet();
  var sheetFiles = ss.getSheetByName("Fichiers") || ss.insertSheet("Fichiers");
  var exId = data.exerciseId || data.exerciseTitle || '';
  sheetFiles.appendRow([
    file.getId(),
    data.studentEmail || '',
    data.studentName || '',
    exId,
    data.fileName,
    file.getUrl(),
    new Date().toISOString()
  ]);

  return {
    status: "success",
    fileId: file.getId(),
    fileUrl: file.getUrl(),
    message: "Fichier enregistré avec succès dans Google Drive !"
  };
}
