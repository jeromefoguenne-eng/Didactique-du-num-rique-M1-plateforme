---
title: "06. Projet Jeu de société : Vue d'ensemble"
description: "Hub de la thématique 6 : Dispositif de création d'un jeu de société ludo-éducatif articulé aux médias et au numérique"
---

<script setup>
const subCategories = [
  {
    title: "6.1 Ludopédagogie & Édumédias",
    tag: "Fondements & Théories",
    desc: "Théories du jeu (Huizinga, Caillois), cercle magique, apprentissage par l'erreur et chaîne de conception globale.",
    link: "/modules/05-1-ludopedagogie-edumedias",
    image: "/images/subcategories/sub-5-1-ludopedagogy.jpg"
  },
  {
    title: "6.2 Créer les règles du jeu",
    tag: "Règles du Jeu",
    desc: "Structure formelle des règles, clarté, accessibilité, boucle de jeu et anticipation des problèmes de jouabilité.",
    link: "/modules/06-regles-du-jeu",
    image: "/images/subcategories/sub-5-2-rules.jpg"
  },
  {
    title: "6.3 La photographie & composition visuelle",
    tag: "Photographie",
    desc: "Repères historiques, droit à l'image et les 6 techniques de composition visuelle pour questionner le numérique.",
    link: "/modules/07-photographie-image",
    image: "/images/subcategories/sub-5-3-graphics.jpg"
  },
  {
    title: "6.4 Créer les cartes & supports avec l'IA",
    tag: "IA Générative",
    desc: "Génération d'illustrations (Gemini), avatars cohérents, règles (ChatGPT), logo (Recraft) et mise en page (Canva).",
    link: "/modules/08-cartes-ia",
    image: "/images/subcategories/sub-5-4-cards-ai.jpg"
  },
  {
    title: "6.5 Fabriquer le plateau à la découpeuse laser",
    tag: "En construction",
    desc: "Découpeuse laser pour le plateau de jeu et gravure vectorielle au FabLab HECh.",
    link: "/modules/09-prototypage-fablab",
    image: "/images/subcategories/sub-5-5-fablab.jpg"
  },
  {
    title: "6.6 Réaliser des pions grâce à l'imprimante 3D",
    tag: "En construction",
    desc: "Modélisation 3D, tranchage et impression des pions personnalisés au FabLab HECh.",
    link: "/modules/09-pions-3d",
    image: "/images/subcategories/sub-6-6-hardware.jpg"
  },
  {
    title: "6.7 Concevoir une capsule vidéo",
    tag: "Capsule Vidéo",
    desc: "Les règles du tournage (11.1), cadrage, prise de son, pitch dynamique de 2 à 3 min pour valoriser votre jeu.",
    link: "/modules/10-capsule-video",
    image: "/images/subcategories/sub-5-6-video.jpg"
  },
  {
    title: "6.8 Tester et faire tester le jeu",
    tag: "Playtest & Données",
    desc: "Test par les pairs en conditions réelles, questionnaire Google Forms, analyse quantitative et qualitative sur Google Sheets.",
    link: "/modules/11-playtest-evaluation",
    image: "/images/subcategories/sub-5-7-playtest.jpg"
  },
  {
    title: "6.9 Présentation finale devant la classe",
    tag: "Exercice Final",
    desc: "Présentation de 20 min du dispositif complet, démonstration interactive et articulation avec la leçon FMTTN.",
    link: "/modules/12-presentation-finale",
    image: "/images/subcategories/sub-4-3-lessonplan.jpg"
  }
]
</script>

# 06. Projet Jeu de Société : Vue d'ensemble

<div class="callout-concept" style="margin: 1.5rem 0 2rem 0;">
  <div class="callout-title">🎲 Dispositif du Projet : Création d'un jeu de société ludo-éducatif</div>
  <p>
    Les étudiants vont constituer des <strong>groupes de 2 ou 3</strong> qui resteront <strong>figés pour tous les exercices</strong> liés à la création d'un jeu de société sur l'éducation aux médias. Vous devrez imaginer une thématique liée à l'éducation aux médias et développer un dispositif intégrant de nombreuses étapes numériques pour la création de ce jeu de société (photographie, IA, découpe laser, impression 3D, vidéo, etc.). Vous devrez enfin tester et faire tester votre dispositif et le présenter devant la classe.
  </p>
</div>

::: info Hub du Projet Jeu de Société
Retrouvez ci-dessous l'ensemble des modules méthodologiques et des fiches d'exercices pratiques guidant la réalisation de votre jeu de société, de l'idéation ludique jusqu'à la soutenance finale.
:::

<div class="callout-concept" style="margin: 1.8rem 0 2rem 0;">
  <div class="callout-title">📋 Démarche du Projet : Du concept à l'expérimentation</div>
  <p style="margin-top: 0.8rem; font-size: 0.98rem; line-height: 1.6;">
    Le projet proposé consiste à placer les étudiants dans la situation de concepteurs d'un jeu de société intégrant des apprentissages liés au numérique, aux médias et aux technologies. L'objectif n'est pas simplement de fabriquer un objet amusant. Les étudiants doivent concevoir un dispositif pédagogique cohérent, depuis l'idée initiale jusqu'à l'expérimentation avec des joueurs.
  </p>
  <p style="font-size: 0.98rem; line-height: 1.6;">
    Cette démarche est particulièrement intéressante parce qu'elle transforme l'étudiant en designer, producteur, technicien, communicant et évaluateur de sa propre production.
  </p>
  <p style="font-size: 0.98rem; line-height: 1.6; font-weight: 600; margin-bottom: 0.6rem;">
    Le projet se déroule en 7 étapes, depuis la conception jusqu’à l’expérimentation :
  </p>
  <ol style="margin-bottom: 0; line-height: 1.7; font-size: 0.93rem;">
    <li><strong>Imaginer le concept et les règles :</strong> par groupes, les étudiants définissent le thème, le public cible, l’objectif du jeu, les mécanismes ludiques, les règles, les conditions de victoire et les différents éléments nécessaires. Ils doivent justifier leurs choix et veiller à la cohérence entre le jeu et les apprentissages visés.</li>
    <li><strong>Intégrer la photographie :</strong> les notions abordées dans le cours de photographie deviennent des éléments du jeu. Les étudiants peuvent notamment créer des cartes permettant d’identifier, analyser ou produire des photographies selon différentes contraintes : cadrage, composition, lumière, point de vue, etc.</li>
    <li><strong>Créer les cartes avec l’IA :</strong> les étudiants utilisent des outils d’intelligence artificielle pour générer ou retravailler les illustrations des cartes. Ils apprennent à formuler des prompts, sélectionner et modifier les productions et exercer leur esprit critique face aux contenus générés.</li>
    <li><strong>Fabriquer le plateau avec la découpeuse laser :</strong> le plateau est conçu numériquement puis fabriqué à l’aide de la découpeuse laser. Cette étape permet de travailler la conception, les contraintes techniques, les dimensions et le passage du modèle numérique à l’objet physique.</li>
    <li><strong>Fabriquer les pions en 3D :</strong> les étudiants conçoivent ou adaptent des modèles de pions, préparent les fichiers puis réalisent leur impression en 3D. Ils expérimentent ainsi l'ensemble de la chaîne de fabrication numérique.</li>
    <li><strong>Présenter le jeu en vidéo :</strong> chaque groupe réalise une courte vidéo présentant le concept, les règles, les mécanismes et les différents éléments du jeu. Cette production permet de travailler la communication audiovisuelle et la capacité à expliquer clairement une réalisation.</li>
    <li><strong>Tester, évaluer et améliorer :</strong> les groupes organisent une phase de playtest avec d’autres étudiants. Ils observent la compréhension des règles, la jouabilité, l’équilibre, l'intérêt et les éventuels problèmes. À partir des retours obtenus, ils améliorent leur prototype.</li>
  </ol>
</div>

### 🎯 Choisissez une étape du projet pour explorer les ressources et consignes :

<SubCategoryTiles :items="subCategories" />

---

## Navigation
- ⬅️ **[05. Évaluer un cours de numérique](/modules/evaluer-cours-numerique)**
- 🏠 **[Accueil du Cours](/)**
- ➡️ **[6.1 Ludopédagogie & Édumédias](/modules/05-1-ludopedagogie-edumedias)**
