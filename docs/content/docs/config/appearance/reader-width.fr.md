---
title: Largeur de lecture
weight: 30
date: '2026-06-06T00:00:00+08:00'
---

Différents écrans bénéficient de différentes longueurs de ligne. Ce paramètre vous permet de choisir une largeur maximale par défaut confortable pour la zone de lecture (en pourcentage de la largeur de la fenêtre).

## Où configurer

Définissez dans `hugo.toml` à la racine de votre site :

```toml
[params.theme]
  # Note : Largeur de lecture maximale par défaut (vw = % de la largeur de la fenêtre).
  # Plage : nombre entre 60 et 92.
  # Exemple : 80 signifie que la zone de contenu fait au maximum 80% de large.
  defaultReaderWidthValue = 80
```

## Notes

- **Plage limitée** : le thème limite la valeur à 60%–92% pour une meilleure lisibilité sur tous les écrans.
- **Responsive** : sur les écrans étroits (par ex. les téléphones), ce paramètre est ignoré afin que le contenu puisse utiliser toute la largeur.

## Règles de priorité

1. **Ajustement utilisateur** : la largeur choisie via le panneau de paramètres est stockée localement.
2. **Configuration du site** : pour les nouveaux visiteurs, `defaultReaderWidthValue` est utilisé.
