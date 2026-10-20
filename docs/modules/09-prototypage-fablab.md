---
title: "6.5 Fabriquer le plateau de jeu avec la découpeuse laser"
description: "Fabrication numérique au FabLab HECh : conception graphique avec Canva, vectorisation avec VectorCraft (Suite ArtCraft), et pilotage de la découpeuse laser avec LightBurn pour le plateau de jeu."
---

# 6.5. Fabriquer le plateau de jeu avec la découpeuse laser

::: info Extrait intégral des Notes de cours
Ce chapitre reproduit fidèlement et dans son intégralité les contenus didactiques et techniques du syllabus officiel du cours de Didactique du numérique (Master 1 - HECh, Point 10) concernant la fabrication assistée par ordinateur d'un plateau de jeu de société à la découpeuse laser.
:::

---

## 10. Fabriquer le plateau de jeu avec la découpeuse laser

La découpeuse laser permet de transformer une conception numérique en objet physique en découpant ou en gravant avec précision différents matériaux (carton, bois, plexiglas, etc.). Son intérêt pédagogique dépasse donc la simple fabrication : elle permet de faire le lien entre conception, numérique, expérimentation et production concrète.

Dans une perspective pédagogique, elle favorise notamment :
- **La créativité et la conception :** les élèves imaginent, dessinent et prototypent leurs propres objets.
- **La démarche de projet :** passer d'une idée à un objet fini implique de planifier, concevoir, tester, corriger et améliorer.
- **La résolution de problèmes :** dimensions, assemblages, tolérances, matériaux et paramètres de découpe imposent de prendre des décisions et de résoudre des problèmes techniques.
- **L'apprentissage par l'erreur et l'itération :** un prototype imparfait devient un support d'analyse permettant d'améliorer la conception.
- **La littératie numérique :** l'élève apprend à manipuler des logiciels de conception, des formats vectoriels et une chaîne de fabrication numérique.
- **La compréhension du lien numérique-réel :** une production réalisée à l'écran devient un objet tangible, ce qui permet de comprendre concrètement la logique de la fabrication numérique.

### Un outil particulièrement pertinent pour les FMTTN

Dans le cadre des FMTTN (Formation Manuelle, Technique, Technologique et Numérique), la découpeuse laser constitue un outil particulièrement intéressant parce qu'elle se situe précisément à l'intersection des dimensions manuelle, technique, technologique et numérique. Elle permet de dépasser une approche où le numérique serait uniquement associé à la consommation ou à l'utilisation d'outils : l'élève devient concepteur et producteur.

Elle s'intègre naturellement dans une démarche de design et de résolution de problème :  
**Identifier un besoin → Imaginer une solution → La modéliser → Fabriquer un prototype → Le tester → Analyser les résultats → Améliorer la conception**

La découpeuse laser peut ainsi soutenir des apprentissages très variés : création d'objets, géométrie et mesures, compréhension des matériaux, initiation à la conception assistée par ordinateur, programmation de paramètres, éducation aux médias et au numérique ou encore fabrication d'outils pédagogiques.

---

## 10.1. Créer un plateau de jeu personnalisé avec Canva

[Accéder à l'application en ligne Canva (canva.com)](https://www.canva.com/){target="_blank" rel="noopener noreferrer"}

Canva permet de concevoir facilement un plateau de jeu au format A3, même sans maîtriser un logiciel professionnel de dessin vectoriel. L'objectif est de produire une image qui pourra ensuite être exportée, vectorisée et préparée pour la découpe ou la gravure laser.

### 1. Créer le document
Dans Canva :
1. Cliquer sur **Créer un design → Dimensions personnalisées**.
2. Choisir le format **A3 : 420 × 297 mm**.
3. Pour un plateau destiné à une découpeuse laser, travailler de préférence avec une **composition horizontale**.
4. Prévoir une **marge extérieure suffisante** afin que les éléments importants ne soient pas trop proches du bord.

### 2. Concevoir la structure du plateau
Avant d'ajouter les éléments graphiques, définir la structure du jeu :
- zone de départ et d'arrivée ;
- parcours ou cases ;
- zones réservées aux cartes, pions ou ressources ;
- éventuelles zones de texte ;
- éléments décoratifs ;
- titre et identité visuelle du jeu.

::: tip Le plateau comme interface
Il est préférable de penser le plateau comme une interface : le joueur doit comprendre rapidement où commencer, où aller et quelles informations sont importantes.
:::

### 3. Créer ou importer les éléments graphiques
Canva permet d'utiliser :
- des formes géométriques ;
- des illustrations ;
- des icônes ;
- du texte ;
- des images générées avec une IA ;
- le logo du jeu ;
- des éléments graphiques créés dans d'autres logiciels.

Pour un projet destiné à la gravure laser, **privilégier une composition simple et lisible**. Les détails extrêmement fins ou les dégradés complexes peuvent être difficiles à reproduire correctement lors de la gravure.

---

## De Canva à VectorCraft : vectoriser et préparer le plateau pour la découpe laser

[Accéder directement à l'application VectorCraft (getartcraft.com/apps/vectorcraft)](https://getartcraft.com/apps/vectorcraft){target="_blank" rel="noopener noreferrer"}

Une image conçue dans Canva est une **image matricielle (composée d'une grille fixe de pixels : PNG ou JPEG)**. Or, une découpeuse laser ne fonctionne pas comme une imprimante de bureau classique : elle est guidée par des coordonnées cartésiennes et des équations géométriques de courbes (tracés vectoriels). Pour que la machine puisse découper les contours du bois ou graver les motifs avec une précision chirurgicale, il est indispensable de transformer votre image de pixels en un fichier vectoriel (SVG).

Pour cette étape, nous utilisons **VectorCraft**, l'outil de dessin vectoriel de nouvelle génération de la suite **ArtCraft**.

---

### 1. Présentation de la suite ArtCraft et de l'outil VectorCraft

<div class="callout-concept">
  <div class="callout-title">🎨 La suite ArtCraft : des outils créatifs libres, souverains et sans installation</div>
  <p>
    La <strong>suite ArtCraft</strong> (<a href="https://getartcraft.com/" target="_blank" rel="noopener noreferrer">getartcraft.com</a>) est un écosystème ouvert d'applications créatives et bureautiques professionnelles, pensé comme une alternative moderne et gratuite aux suites propriétaires lourdes (telles qu'Adobe Creative Cloud).
  </p>
  <ul>
    <li><strong>Technologie de pointe (Rust & WebAssembly) :</strong> Les applications sont ultra-légères, ultra-rapides et s'exécutent directement dans votre navigateur web à 60 images par seconde, sans nécessiter aucune installation logicielle préalable ni compte obligatoire.</li>
    <li><strong>Écosystème complet :</strong> La suite intègre <em>PhotoCraft</em> (retouche photo type Photoshop), <em>FilmCraft</em> (montage vidéo type Premiere Pro), <em>LightCraft</em> (développement photo RAW) et <strong>VectorCraft</strong> pour l'illustration vectorielle.</li>
    <li><strong>Souveraineté et respect des données :</strong> Vos créations restent traitées localement dans la mémoire de votre navigateur, garantissant une confidentialité totale et une accessibilité immédiate depuis n'importe quel ordinateur d'école ou du FabLab.</li>
  </ul>
</div>

**L'application VectorCraft** ([getartcraft.com/apps/vectorcraft](https://getartcraft.com/apps/vectorcraft)) se positionne comme l'équivalent libre d'Adobe Illustrator. Elle intègre tous les outils essentiels du graphisme vectoriel : tracé de courbes de Bézier à la plume, formes paramétriques, opérations booléennes (Pathfinder), gestion fine des calques, et surtout un **moteur de vectorisation automatique haute précision (*Image Trace*)** particulièrement performant pour convertir vos images PNG ou JPEG en tracés vectoriels mathématiques.

---

### 2. Pourquoi vectoriser une image matricielle (PNG/JPEG) pour la découpeuse laser ?

Une image matricielle (PNG ou JPG) est une grille fixe de carrés de couleur (pixels). Si vous zoomez sur les détails de votre plateau de jeu, les bordures deviennent floues et crénelées.

Pour la découpeuse laser :
1. **Pour découper :** Le faisceau laser doit suivre une ligne vectorielle continue (un chemin sans épaisseur). La tête laser se déplace physiquement le long de cette courbe pour trancher la matière (contreplaqué, MDF, plexiglas). Une image PNG ne possède pas de trajectoire : la machine ne saurait pas où couper !
2. **Pour graver :** Si la machine peut techniquement graver une image de pixels par balayage horizontal ligne par ligne (comme une imprimante), cette méthode est très lente. Un tracé vectoriel permet une gravure au trait (*vector marking*) ultra-rapide et nette, ou un remplissage précis des formes fermées.

La vectorisation consiste donc à **faire analyser les contours de votre image PNG par un algorithme mathématique qui recrée des lignes, des arcs et des polygones parfaits**.

---

### 3. Comment vectoriser une image PNG ou JPEG avec VectorCraft pas à pas

Voici la méthode complète pour transformer votre plateau Canva en fichier vectoriel pour la découpeuse laser :

#### Étape 1 — Exporter votre visuel depuis Canva
1. Dans Canva, ouvrez votre plateau de jeu conçu au format **A3 (420 × 297 mm)**.
2. Cliquez sur **Partager → Télécharger**.
3. Sélectionnez le format **PNG** (ou **JPEG qualité maximale**).
4. Cochez une résolution élevée (de préférence 300 DPI si disponible) et téléchargez le fichier.

#### Étape 2 — Importer l'image dans VectorCraft
1. Ouvrez votre navigateur web et rendez-vous sur : **[https://getartcraft.com/apps/vectorcraft](https://getartcraft.com/apps/vectorcraft)**.
2. Créez un nouveau document ou définissez le plan de travail aux dimensions réelles de votre plateau : **Largeur = 420 mm**, **Hauteur = 297 mm**.
3. Importez votre image PNG ou JPEG par simple **glisser-déposer** sur le canevas, ou via le menu **File → Import**.
4. Ajustez l'image pour qu'elle occupe exactement l'espace du plateau A3.

#### Étape 3 — Lancer la vectorisation d'image (*Image Trace*)
1. Cliquez sur l'image avec l'outil de sélection (flèche noire) pour l'activer.
2. Dans la barre d'options supérieure ou le panneau latéral droit, activez le bouton **Image Trace** (Vectoriser l'image).
3. VectorCraft génère immédiatement un aperçu vectoriel en temps réel au-dessus de l'image de pixels.

#### Étape 4 — Régler les paramètres de traçage pour le laser
Pour obtenir un résultat optimal destiné à une découpeuse laser, ajustez les curseurs dans le panneau *Image Trace* :
* **Mode de traçage :** Choisissez **Black & White (Noir et Blanc)** ou **Silhouettes**. Ce mode élimine les nuances de couleurs pour créer des contours ultra-nets parfaitement exploitables par la machine laser.
* **Seuil de détection (*Threshold*) :** Ce curseur détermine à partir de quelle luminosité un pixel devient noir ou blanc. Augmentez-le légèrement pour que les lignes fines de votre parcours de jeu soient bien épaisses et continues.
* **Lissage des courbes (*Curve / Line Snapping*) :** Activez l'alignement pour que les segments droits deviennent de vraies droites mathématiques et que les cercles soient réguliers, sans bosses.
* **Réduction du bruit (*Noise / Ignore White*) :** Augmentez le filtre de bruit pour ignorer les petits artefacts de compression JPEG ou les poussières de pixels qui créeraient des micro-gravures indésirables. Cochez *Ignore White* pour supprimer automatiquement le fond blanc inutile.

#### Étape 5 — Décomposer en tracés vectoriels (*Expand*)
1. Une fois l'aperçu satisfaisant, cliquez sur le bouton **Expand** (Décomposer).
2. L'image matricielle d'origine disparaît et laisse place à de **véritables tracés vectoriels modifiables** composés de points d'ancrage et de tangentes de Bézier.
3. Vous pouvez désormais sélectionner chaque tracé individuellement, modifier un contour ou supprimer un élément parasite.

#### Étape 6 — Séparer les couleurs pour LightBurn (Découpe vs Gravure)
Pour que le logiciel de la découpeuse laser (LightBurn) sache exactement ce qu'il doit découper et ce qu'il doit graver, attribuez des couleurs conventionnelles :
* **Contour extérieur du plateau :** Sélectionnez le rectangle périphérique de 420 × 297 mm et attribuez-lui un **contour rouge fin (épaisseur 0.1 mm ou filet technique)** sans fond de remplissage.
* **Cases, textes et illustrations :** Attribuez-leur une couleur **noire** (fond noir pour la gravure de surface, ou contour noir pour la gravure au trait).

#### Étape 7 — Exporter au format SVG
1. Rendez-vous dans **File → Export**.
2. Choisissez le format standard **SVG (Scalable Vector Graphics)**.
3. Enregistrez le fichier sur votre clé USB ou votre espace Google Drive : il est prêt à être piloté au FabLab !

---

### 4. Exemple concret : Vectorisation d'un plateau de jeu conçu sous Canva

Imaginons le cas concret d'un binôme d'étudiants préparant le plateau de leur jeu de société pour l'Exercice 12 :

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       LE WORKFLOW DU PLATEAU DE JEU                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. CANVA (Graphisme)       → Création du plateau A3 avec cases, logos,      │
│                              zones de pioche de cartes et consignes.        │
│                              Export en fichier PNG haute résolution.        │
│                                            ↓                                │
│ 2. VECTORCRAFT (ArtCraft)  → Glisser-déposer du PNG sur le canevas A3.      │
│                              Image Trace (Mode Noir & Blanc, seuil dosé).   │
│                              Expand → Tracés Bézier mathématiques nets.     │
│                              Contour externe = Rouge | Motifs internes = Noir│
│                              Export en fichier SVG.                         │
│                                            ↓                                │
│ 3. LIGHTBURN (FabLab)      → Import du SVG. Détection des 2 couches :       │
│                              • Couche Noire = Gravure rapide (300 mm/s)     │
│                              • Couche Rouge = Découpe laser (15 mm/s)       │
│                              Production physique en contreplaqué 3 mm.      │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Pourquoi cet exemple est typique en classe ?**
* Sous Canva, l'élève a disposé un logo de son jeu généré par IA, 30 cases de parcours numérotées et deux rectangles prévus pour poser les pioches de cartes FMTTN.
* Lorsqu'il exporte son travail, Canva produit un fichier PNG de 4960 × 3508 pixels.
* En ouvrant **VectorCraft**, l'élève importe le PNG. En appliquant la fonction *Image Trace*, l'outil détecte les cases et les lettres des consignes : en 10 secondes, l'ensemble devient une mosaïque vectorielle parfaite.
* L'élève sélectionne le rectangle de pourtour et lui applique la couleur rouge : la découpeuse saura qu'elle doit d'abord graver tout le plateau à faible puissance, puis découper la planche nette à forte puissance pour que le plateau se détache tout seul du panneau de bois !

---

<div class="callout-concept" style="margin: 2rem 0;">
  <div class="callout-title">🎬 Tutoriel Vidéo : Vectoriser une image (PNG / JPEG) pour la découpe et la gravure laser</div>
  <p>
    <strong>Tutoriel pas-à-pas en français : Transformer un visuel matriciel en fichier vectoriel SVG net et dimensionné.</strong><br />
    Découvrez dans cette vidéo les principes indispensables de la vectorisation automatique, la suppression des fonds, le réglage des seuils de détection et la préparation d'un fichier SVG propre pour l'usinage au laser.
  </p>

  <div style="text-align: center; margin: 1.2rem 0;">
    <a 
      href="https://www.youtube.com/watch?v=WnokVfJu5F0" 
      target="_blank" 
      rel="noopener noreferrer"
      style="display: inline-block; position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.18); border: 2px solid var(--vp-c-divider); max-width: 580px; width: 100%; text-decoration: none;"
      title="Cliquer pour visionner le tutoriel de vectorisation d'image en français sur YouTube"
    >
      <img 
        src="/images/vignette-vectorcraft-decoupe.jpg" 
        alt="Vignette tutoriel VectorCraft vectorisation découpe laser" 
        style="width: 100%; height: auto; display: block; object-fit: cover;" 
      />
      <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(15, 23, 42, 0.9)); color: white; padding: 12px 16px; font-size: 0.92rem; font-weight: 700; text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <span>▶️ Cliquer pour lancer le tutoriel de vectorisation sur YouTube ↗</span>
      </div>
    </a>
  </div>

  <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin-top: 1rem;">
    <a 
      href="https://getartcraft.com/apps/vectorcraft" 
      target="_blank" 
      rel="noopener noreferrer"
      class="btn-primary"
      style="display: inline-flex; align-items: center; gap: 8px; text-decoration: none !important; color: white !important; padding: 9px 16px; border-radius: 8px; font-weight: 600; background: #0284c7;"
    >
      <span>🚀 Ouvrir VectorCraft en ligne (gratuit, sans installation) ↗</span>
    </a>
    <a 
      href="https://www.youtube.com/watch?v=amtlbWQwYDs" 
      target="_blank" 
      rel="noopener noreferrer"
      class="btn-secondary"
      style="display: inline-flex; align-items: center; gap: 8px; text-decoration: none !important; padding: 9px 16px; border-radius: 8px; font-weight: 600; border: 1px solid var(--vp-c-divider);"
    >
      <span>📺 Démonstration de VectorCraft (Alternative Illustrator) ↗</span>
    </a>
  </div>

  <p style="font-size: 0.85rem; color: var(--vp-c-text-2); text-align: center; margin: 0.8rem 0 0 0;">
    💡 <em>Ressource recommandée pour les étudiants et enseignants : vectorisation sans installation complexe de logiciel lourd sur les machines du FabLab.</em>
  </p>
</div>

---

## De VectorCraft à LightBurn : préparer la découpe et la gravure

Une fois votre plateau vectorisé et nettoyé dans VectorCraft, il faut l'importer dans LightBurn, le logiciel qui permet de préparer et de piloter la découpeuse laser du FabLab. L'objectif est d'assigner à chaque tracé vectoriel les instructions physiques de puissance et de vitesse adaptées au matériau.

### 1. Exporter le fichier SVG depuis VectorCraft
Dans VectorCraft, assurez-vous que les cotes sont bien respectées (ex. 420 × 297 mm pour un format A3 standard) puis exportez le fichier :  
**File → Export → SVG**

Le format SVG conserve l'ensemble des coordonnées géométriques, l'échelle et la séparation des couleurs de calques.

### 2. Importer le fichier dans LightBurn
Dans LightBurn :
1. Ouvrez un nouveau projet.
2. Cliquez sur **Fichier → Importer** (ou faites glisser votre fichier SVG sur la grille de travail).
3. **Vérifiez immédiatement les dimensions affichées en haut de l'écran.**

Le plateau apparaît alors fidèlement dans l'espace de travail de LightBurn.

::: warning Attention à l'échelle (Format A3)
Il est impératif de contrôler les dimensions après chaque transfert : un plateau A3 doit mesurer exactement 420 mm de large sur 297 mm de haut dans LightBurn.
:::

### 3. Distinguer découpe et gravure
LightBurn utilise notamment les **calques de couleurs** pour déterminer les opérations à effectuer.

Par exemple :

| Couche | Élément | Opération |
| :--- | :--- | :--- |
| **Rouge** | Contour du plateau | ✂️ Découpe |
| **Noir** | Texte et illustrations | 🔥 Gravure |
| **Bleu** | Trous ou éléments particuliers | ✂️ Découpe |

Dans LightBurn, chaque couleur peut être associée à un paramétrage différent. L'intérêt est de pouvoir dire à la machine :
- *« Ce tracé doit être gravé »*
- *« Celui-ci doit être découpé »*

### 4. Configurer la gravure
Pour les éléments graphiques du plateau, on utilise généralement une opération de gravure.  
Il faut notamment définir :
- la puissance du laser ;
- la vitesse de déplacement ;
- la résolution ou le nombre de lignes par unité de distance ;
- le type de remplissage utilisé.

Ces paramètres dépendent fortement de la machine utilisée et du matériau. Par exemple, graver du contreplaqué de 3 mm et graver du plexiglas ne nécessitent pas nécessairement les mêmes réglages.

> **Consigne de sécurité et d'atelier :** Il ne faut pas fournir aux étudiants des valeurs universelles de puissance et de vitesse. Ils doivent utiliser les paramètres validés par la HECh pour la machine et le matériau utilisés.

### 5. Configurer la découpe
Pour le contour extérieur, on utilise une opération de découpe vectorielle.  
LightBurn permet de définir notamment :
- la vitesse de déplacement ;
- la puissance ;
- le nombre de passages ;
- l'ordre des opérations.

::: important Règle d'or : La gravure AVANT la découpe
La découpe doit généralement être réalisée après la gravure : si le plateau était découpé avant la gravure, les différentes pièces pourraient bouger pendant les opérations suivantes.
:::

L'ordre des opérations doit donc être configuré de la manière suivante :
1. **Gravure des éléments graphiques**  
   ↓  
2. **Gravure des détails**  
   ↓  
3. **Découpe des éléments intérieurs (trous, fentes)**  
   ↓  
4. **Découpe du contour extérieur**

### 6. Utiliser le « Preview » (Simulation)
Avant de lancer le laser, LightBurn propose une fonction **Preview**.  
Elle permet de simuler le travail de la machine et de vérifier :
- l'ordre des opérations ;
- les éléments qui seront gravés ;
- les éléments qui seront découpés ;
- les éventuels tracés oubliés ;
- la durée approximative du travail.

C'est une étape particulièrement intéressante pédagogiquement : la simulation permet de détecter une erreur avant de consommer du matériau ou de lancer la machine.

### 7. Tester avant de fabriquer le plateau définitif
Avant de lancer directement la fabrication du plateau A3, il est pertinent de réaliser un test sur une chute du même matériau.  
Les étudiants peuvent tester différentes combinaisons de :  
**Vitesse × Puissance × Nombre de passages**

puis observer :
- la profondeur de gravure ;
- la lisibilité des textes ;
- la qualité des contours ;
- la capacité de découpe ;
- les traces de brûlure éventuelles.

Ils sélectionnent ensuite les paramètres appropriés pour leur production finale.

Cette étape transforme la fabrication en démarche expérimentale : les étudiants ne se contentent pas d'appliquer des paramètres fournis ; ils observent les effets des réglages, formulent des hypothèses et ajustent leur procédure.

<div class="callout-concept" style="margin: 2rem 0;">
  <div class="callout-title">🎬 Tutoriel Vidéo : Pilotage de la découpeuse laser sous LightBurn</div>
  <p>
    <strong>Guide pratique de paramétrage LightBurn : Calques, vitesses, puissances et simulation.</strong><br />
    Découvrez comment assigner les calques de découpe et de gravure, régler la focalisation de la tête laser, ordonner les passes de travail, utiliser la prévisualisation (Preview) et lancer votre fabrication en toute sécurité.
  </p>

  <div style="text-align: center; margin: 1.2rem 0;">
    <a 
      href="https://www.youtube.com/watch?v=3z8Y_yXq6bE" 
      target="_blank" 
      rel="noopener noreferrer"
      style="display: inline-block; position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.18); border: 2px solid var(--vp-c-divider); max-width: 580px; width: 100%; text-decoration: none;"
      title="Cliquer pour visionner le tutoriel LightBurn pour découpeuse laser sur YouTube"
    >
      <img 
        src="/images/vignette-lightburn-decoupe.jpg" 
        alt="Vignette tutoriel LightBurn réglage découpeuse laser" 
        style="width: 100%; height: auto; display: block; object-fit: cover;" 
      />
      <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(15, 23, 42, 0.9)); color: white; padding: 12px 16px; font-size: 0.92rem; font-weight: 700; text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <span>▶️ Cliquer sur l'image pour lancer le tutoriel LightBurn sur YouTube ↗</span>
      </div>
    </a>
  </div>

  <p style="font-size: 0.85rem; color: var(--vp-c-text-2); text-align: center; margin: 0.5rem 0 0 0;">
    💡 <em>Support pédagogique pour la prise en main de LightBurn, l'optimisation des parcours d'usinage et la prévention des accidents de fabrication.</em>
  </p>
</div>

::: tip Équipement et sécurité au FabLab HECh
Au FabLab de la HECh, vous disposez d'une découpeuse laser professionnelle équipée d'un plateau nid d'abeille et d'un extracteur de fumées raccordé à l'extérieur. 
- Ne jamais ouvrir le capot pendant que le faisceau laser est en fonctionnement.
- Vérifier systématiquement la mise en route de l'assistance d'air (*air assist*) et de la ventilation d'extraction avant de lancer le programme.
- Restez présent à proximité immédiate de la machine pendant toute la durée de la fabrication.
:::

---

## 🎓 Auto-évaluation & Réflexivité (6.5)

Testez votre maîtrise des concepts de fabrication numérique, de vectorisation sous VectorCraft et de pilotage machine sous LightBurn :

<ClientOnly>
  <QuizBox moduleId="09-1" moduleTitle="6.5 Fabriquer le plateau de jeu avec la découpeuse laser" />
</ClientOnly>

---

## 📝 Exercice Pratique Associé : Exercice 12 (Découpeuse Laser & Plateau)

<div class="callout-exercise" style="margin: 2rem 0;">
  <div class="callout-title">⚡ Exercice 12 — Découpeuse laser : Réalisation du plateau</div>
  <p>
    En groupe, concevez le fichier vectoriel du plateau de votre jeu de société et réalisez son prototypage physique à la découpeuse laser au FabLab de la HECh.
  </p>
  <p style="margin-top: 0.8rem; font-size: 0.95rem; color: var(--vp-c-text-2);">
    Consultez le document de consignes complètes de l'Exercice 12 sur Google Docs pour découvrir les attendus d'évaluation, les gabarits vectoriels A3 recommandés et les créneaux d'accès aux machines du FabLab.
  </p>
  <div style="margin-top: 1.2rem;">
    <a 
      href="https://docs.google.com/document/d/1Ov_huVW9al2DKuoBmW89QO3ZqE5E-nzU/edit?usp=sharing" 
      target="_blank" 
      rel="noopener noreferrer"
      class="btn-primary"
      style="display: inline-flex; align-items: center; gap: 8px; text-decoration: none !important; color: white !important; padding: 10px 18px; border-radius: 8px; font-weight: 600; background: var(--vp-c-brand-1);"
    >
      <span>📄 Ouvrir l'Exercice 12 sur Google Docs ↗</span>
    </a>
  </div>
</div>

---

## Navigation
- ⬅️ **[6.4 Créer les cartes & supports avec l'IA](/modules/08-cartes-ia)**
- 🏠 **[06. Hub Projet Jeu de société](/modules/05-projet-jeu-societe)**
- ➡️ **[6.6 Concevoir les pions à l'imprimante 3D](/modules/09-pions-3d)**
