import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Didactique du Numérique",
  titleTemplate: ":title | Didactique Numérique M1 (HECh)",
  description: "Plateforme de cours et parcours didactique hybride pour le Master 1 (HECh / FWB)",
  base: "/Didactique-du-num-rique-M1-plateforme/",
  lang: "fr-FR",
  cleanUrls: true,
  lastUpdated: true,

  themeConfig: {
    logo: { text: "🎓 M1 DidacNum" },
    siteTitle: "Didactique du Numérique M1",

    nav: [
      { text: "Accueil", link: "/" },
      { text: "Guide du cours", link: "/guide/distanciel" },
      { 
        text: "Parcours / Modules", 
        items: [
          { text: "Axe 1 : Fondements & Référentiel", link: "/modules/00-introduction-ia-ethique" },
          { text: "Axe 2 : Ingénierie Pédagogique", link: "/modules/03-pedagogies-actives" },
          { text: "Axe 3 : Projet Jeu de Société", link: "/modules/05-projet-jeu-societe" }
        ]
      },
      { text: "Ateliers & Exercices", link: "/ateliers/" },
      { text: "Ressources & Outils", link: "/ressources/documents" }
    ],

    sidebar: [
      {
        text: "🧭 Cadrage & Accompagnement",
        items: [
          { text: "Guide de l'étudiant à distance", link: "/guide/distanciel" },
          { text: "Modalités d'évaluation & Livrables", link: "/guide/evaluation" }
        ]
      },
      {
        text: "📚 Axe 1 : Fondements & Référentiel",
        items: [
          { text: "00. Penser l'IA & Éthique", link: "/modules/00-introduction-ia-ethique" },
          { text: "01. Compétences numériques", link: "/modules/01-competences-numeriques" },
          { text: "02. Référentiel FMTTN (FWB)", link: "/modules/02-referentiel-fmttn" }
        ]
      },
      {
        text: "🛠️ Axe 2 : Ingénierie Pédagogique",
        items: [
          { text: "03. Enseigner : Pédagogies actives", link: "/modules/03-pedagogies-actives" },
          { text: "04. Préparer une leçon FMTTN", link: "/modules/04-preparation-lecon-fmttn" }
        ]
      },
      {
        text: "🎲 Axe 3 : Projet Fil Rouge (Jeu de Société)",
        items: [
          { text: "05. Ludopédagogie & Édumédias", link: "/modules/05-projet-jeu-societe" },
          { text: "06. Mécanique & Règles du jeu", link: "/modules/06-regles-du-jeu" },
          { text: "07. Photographie, image & droit", link: "/modules/07-photographie-image" },
          { text: "08. [Jalon] Cartes de jeu & IA", link: "/modules/08-cartes-ia" },
          { text: "09. [Jalon] FabLab (Laser & 3D)", link: "/modules/09-prototypage-fablab" },
          { text: "10. Capsule vidéo du jeu", link: "/modules/10-capsule-video" },
          { text: "11. [Jalon] Playtest & Évaluation", link: "/modules/11-playtest-evaluation" }
        ]
      },
      {
        text: "✏️ Ateliers & Exercices Pratiques",
        items: [
          { text: "Vue d'ensemble des ateliers", link: "/ateliers/" },
          { text: "Atelier 1 : Diagnostic compétences", link: "/ateliers/exercice-01" },
          { text: "Atelier 2 : Évaluer une information", link: "/ateliers/exercice-02" },
          { text: "Atelier 3 : Guide collaboratif élèves", link: "/ateliers/exercice-03" },
          { text: "Atelier 4 : Escape Game FMTTN", link: "/ateliers/exercice-04" },
          { text: "Atelier 5 : Défi Canva mot de passe", link: "/ateliers/exercice-05" },
          { text: "Atelier 6 : Défi Hardware (Démonter PC)", link: "/ateliers/exercice-06" },
          { text: "Atelier 7 : Capsule vidéo du jeu", link: "/ateliers/exercice-video" }
        ]
      },
      {
        text: "📖 Ressources & Outils",
        items: [
          { text: "Documents & Référentiels", link: "/ressources/documents" },
          { text: "Bibliographie sélective (APA)", link: "/ressources/bibliographie" }
        ]
      }
    ],

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: 'Rechercher dans le cours...',
                buttonAriaLabel: 'Rechercher'
              },
              modal: {
                noResultsText: 'Aucun résultat trouvé pour',
                resetButtonTitle: 'Effacer la recherche',
                footer: {
                  selectText: 'pour choisir',
                  navigateText: 'pour naviguer',
                  closeText: 'pour fermer'
                }
              }
            }
          }
        }
      }
    },

    docFooter: {
      prev: 'Page précédente',
      next: 'Page suivante'
    },

    outline: {
      level: [2, 3],
      label: 'Sur cette page'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/jeromefoguenne-eng/Didactique-du-num-rique-M1-plateforme' }
    ],

    footer: {
      message: 'Master 1 en Pédagogie / Math-Numérique — Haute École Charlemagne (HECh)',
      copyright: 'Jérôme Foguenne © 2026 — Licence CC BY-NC-SA 4.0'
    }
  }
})
