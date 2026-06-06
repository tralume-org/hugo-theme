---
title: Interactions d'article
weight: 65
date: '2026-06-06T00:00:00+08:00'
---

Contrôle les fonctionnalités interactives disponibles sur les pages d'article : navigation par table des matières, progression de lecture, lightbox d'images et copie de bloc de code.

## Table des matières

Tralume construit automatiquement une table des matières à partir des titres de l'article.

- **Ordinateur** : une table des matières latérale fixe apparaît à côté du contenu principal, mettant en surbrillance le titre actuellement visible.
- **Mobile** : un bouton flottant ouvre une superposition plein écran avec la grille de la table des matières. Un second bouton flottant affiche le pourcentage de progression de lecture.

La table des matières est affichée automatiquement lorsque l'article contient au moins un titre. Aucune configuration n'est nécessaire.

### Indicateur de progression de lecture

Un bouton flottant dans le coin inférieur droit de l'écran affiche la progression de lecture en pourcentage. Il apparaît sur les pages d'article et se met à jour au fur et à mesure que le lecteur fait défiler le contenu. Un clic dessus ouvre la table des matières mobile.

## Lightbox d'images

Cliquer sur une image intégrée dans le contenu de l'article l'ouvre dans une superposition plein écran (lightbox). La lightbox prend en charge :

- Zoom avant/arrière avec gestes de pincement ou boutons
- Déplacement lorsque le zoom est actif
- Fermeture via le bouton ×, le clic sur la superposition ou la touche Échap

La lightbox fonctionne automatiquement pour toutes les images de contenu. Aucune configuration n'est nécessaire.

## Copie de bloc de code

Chaque bloc de code dans le contenu de l'article affiche un bouton de copie dans le coin supérieur droit au survol. Cliquer dessus copie le contenu du code dans le presse-papiers et affiche brièvement une confirmation « Copié ».

Le bouton de copie utilise les clés i18n `codeBlockCopyLabel` et `codeBlockCopiedLabel` pour ses étiquettes.
