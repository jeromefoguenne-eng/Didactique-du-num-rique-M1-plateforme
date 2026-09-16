---
title: "3.5 Démarche de conception itérative & Droit à l'erreur"
description: "Le prototypage rapide, le débogage, le statut positif de l'erreur et l'amélioration continue"
---

# 3.5. Démarche Itérative & Droit à l'Erreur

::: info L'erreur comme moteur d'apprentissage
En informatique et en technologie, personne ne produit un code parfait ou un objet fonctionnel du premier coup. Le cœur de la démarche d'ingénierie réside dans l'**itération** : concevoir, tester, échouer, comprendre l'erreur, corriger et recommencer.
:::

## 1. La boucle de conception itérative

<div style="text-align: center; margin: 1.5rem 0;">
  <img src="/images/image26.jpg" style="max-width: 85%; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: inline-block;" alt="Conception itérative" />
</div>

```mermaid
graph LR
    A["1. Prototyper (Ébauche rapide)"] --> B["2. Tester / Playtester"]
    B --> C["3. Analyser les bugs ou faiblesses"]
    C --> D["4. Corriger & Ajuster"]
    D --> A
    style A fill:#e0f2fe,stroke:#38bdf8
    style B fill:#fef3c7,stroke:#f59e0b
    style C fill:#fee2e2,stroke:#ef4444
    style D fill:#dcfce7,stroke:#22c55e
```

---

## 2. Réhabiliter le statut de l'erreur à l'école

Dans le modèle scolaire traditionnel, l'erreur est souvent sanctionnée par une mauvaise note (faute).  
En didactique du numérique, **l'erreur est une donnée d'apprentissage normale et féconde** :
- Un message d'erreur d'un compilateur n'est pas un blâme, c'est une indication précieuse pour progresser.
- Une découpeuse laser qui brûle trop le bois révèle qu'il faut calibrer la vitesse et la puissance.
- Un jeu dont les règles bloquent les joueurs lors d'un test démontre qu'il faut reformuler l'énoncé.

👉 **Mise en pratique au FabLab** : [Prototypage FabLab & Découpe Laser](/modules/09-prototypage-fablab)
