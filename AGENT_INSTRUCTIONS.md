# 🎓 Agent Antigravity — Plateforme Didactique du Numérique (M1 - HECh / FWB)

Ce fichier d'instructions régit le comportement des agents IA Antigravity travaillant sur ce projet.

---

## 🔄 Règle d'Or de Synchronisation Multi-PC (Auto-Sync)

Pour garantir que les travaux réalisés sur un ordinateur soient immédiatement disponibles sur l'autre :

1. **Au démarrage de chaque session / tâche** :
   - Exécuter systématiquement en arrière-plan : `git pull origin main` (avec `http.sslVerify=false` si nécessaire).
   - En cas d'erreur de fusion (conflict), informer l'utilisateur et proposer une résolution propre.

2. **À la fin de chaque bloc de travail / modification** :
   - Effectuer un `git add .` des fichiers modifiés/créés.
   - Créer un commit clair (ex: `feat: ...` ou `docs: ...`).
   - Effectuer un `git push origin main` afin que l'autre ordinateur accède immédiatement aux données à jour.

---

## 🛠️ Commandes du Projet (VitePress)

- **Serveur de développement** : `npm run docs:dev`
- **Build de production** : `npm run docs:build`
- **Prévisualisation du build** : `npm run docs:preview`
