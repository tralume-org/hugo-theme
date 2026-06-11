---
title: Arrière-plan personnalisé
weight: 40
date: '2026-06-06T00:00:00+08:00'
---

Contrôle la source de l'image d'arrière-plan du site et le flou d'arrière-plan.

Trois fournisseurs sont supportés : URL d'image directe, téléversement local (stocké uniquement dans le navigateur du lecteur) et le service d'images aléatoires Pixaroa.

## Où configurer

Définissez dans `hugo.toml` à la racine de votre site :

```toml
[params.theme]
  # Note : Fournisseur d'arrière-plan par défaut pour les nouveaux visiteurs.
  # Options :
  #   - 'url'    (par défaut) : utiliser l'URL d'image saisie par l'utilisateur (le cas échéant).
  #   - 'upload' : utiliser une image téléversée localement (visible uniquement dans ce navigateur).
  #   - 'pixaroa': utiliser le service d'images aléatoires Pixaroa.
  defaultBackgroundProvider = 'url'

  # Note : Si vous souhaitez utiliser Pixaroa, définissez son URL de base ici.
  # Note : Le laisser vide désactive Pixaroa.
  # Exemples :
  #   - https://pixaroa.example.com/   (recommandé : terminer par une barre oblique)
  #   - /pixaroa/                      (proxy inverse sur la même origine ; terminer également par une barre oblique)
  pixaroaHost = 'https://your-pixaroa-api.com/'

  # Note : Stratégie de rafraîchissement automatique Pixaroa.
  #   - 'session' (par défaut) : rafraîchir une fois par session de navigateur ; la navigation garde la même image.
  #   - 'persist' : réutiliser la dernière image aléatoire récupérée.
  pixaroaRefreshMode = 'session'
```

## Détails des fournisseurs

### Paramètres avancés Pixaroa

Lors de l'utilisation de Pixaroa, le panneau de paramètres expose des options supplémentaires sous une section « Avancé » dépliable :

- **Niveau** (`settings_tier`) : niveau de qualité/taille d'image (auto, 1–6)
- **Orientation** (`settings_orientation`) : auto, paysage, portrait ou carré
- **Format** (`settings_format`) : auto, jxl, avif, webp, jpeg ou png

Ces paramètres sont envoyés à l'API Pixaroa et affectent les images retournées.

### Stratégie de rafraîchissement Pixaroa

Pour afficher un nouvel arrière-plan aléatoire chaque fois qu'un lecteur ouvre le site, tout en conservant la même image pendant la navigation de cette visite, définissez :

```toml
[params.theme]
  defaultBackgroundProvider = 'pixaroa'
  pixaroaHost = 'https://your-pixaroa-api.com/'
  pixaroaRefreshMode = 'session'
```

`session` utilise le `sessionStorage` du navigateur pour mémoriser si la visite actuelle a déjà été rafraîchie. Après un rafraîchissement réussi, l'URL de l'image reste enregistrée localement pour être restaurée lors des chargements de page suivants de la même visite.

## Notes

- **Flou d'arrière-plan** : le panneau de paramètres fournit un curseur dédié pour flouter l'image d'arrière-plan dans l'**onglet Apparence** (pas l'onglet Arrière-plan). Cela se cumule avec le flou acrylique.
- **Confidentialité du téléversement** : le « téléversement » n'envoie pas l'image à votre serveur ; il la stocke dans le navigateur (IndexedDB) sur l'appareil du lecteur.

## Règles de priorité

1. **Paramètres locaux de l'utilisateur** : l'URL, l'image téléversée ou le choix Pixaroa du panneau de paramètres ont la priorité la plus élevée.
2. **Configuration du site** : `defaultBackgroundProvider` est utilisé comme fournisseur par défaut.

## Stratégie de couleur de thème d'arrière-plan

Le thème inclut un module d'extraction d'arrière-plan : une fois qu'un fournisseur d'arrière-plan est actif, il extrait une couleur représentative de l'image d'arrière-plan et la fait correspondre à l'une des 17 couleurs de thème fixes (Material 500).

### Algorithmes d'extraction de couleur

Le panneau de paramètres permet aux lecteurs de choisir parmi quatre algorithmes d'extraction :

| Algorithme | Comportement |
| --- | --- |
| `weighted-average` | Calcule une moyenne pondérée par la luminance de tous les pixels |
| `vibrant-pixel` | Sélectionne le pixel le plus saturé |
| `hue-histogram` | Construit un histogramme de teintes et retourne la teinte dominante à saturation maximale |
| `kmeans-vibrant` | Regroupe les pixels par k-means et retourne le centre du groupe le plus vif |

### Remplacement manuel

Dans **Apparence → Couleur du thème**, vous pouvez choisir de remplacer les stratégies du fournisseur :

1. **Désactiver** : utiliser la stratégie de couleur de thème dynamique/manuel du fournisseur.
2. **Activer** : remplacer globalement la stratégie du fournisseur, puis choisir l'une des 17 préréglages ou saisir un `#RRGGBB` personnalisé.

## Attribution de l'image d'arrière-plan

Lorsqu'une image d'arrière-plan est chargée depuis Pixaroa, Tralume affiche automatiquement une barre d'attribution en bas de la page. Elle montre :

- Titre de l'image
- Nom du photographe
- Informations de licence
- Lien source (l'URL d'origine de l'image)

La barre d'attribution peut être fermée en cliquant sur le bouton de fermeture. Elle utilise les clés i18n suivantes : `backgroundAttributionBarFormat`, `backgroundAttributionTitle`, `backgroundAttributionPhotographer`, `backgroundAttributionLicense`, `backgroundAttributionSource` et `backgroundAttributionClose`.
