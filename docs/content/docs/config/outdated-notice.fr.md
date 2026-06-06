---
title: Avis de contenu obsolète
weight: 150
date: '2026-06-06T00:00:00+08:00'
---

Tralume peut automatiquement afficher une bannière d'avertissement sur les pages d'article lorsque le contenu date de plus d'un nombre configurable de jours. Cela aide les lecteurs à comprendre que l'information peut ne plus être à jour.

## Comportement par défaut

Par défaut, tout article datant de plus de **180 jours** (environ 6 mois) affichera un encadré sous le titre :

> ⚠ Cet article a été publié il y a plus de 180 jours. Les informations peuvent ne plus être applicables.

Le seuil par défaut est défini dans le partial du thème (`layouts/partials/outdated-notice.html`) et s'applique à **toutes les sections** (articles, pages, etc.).

## Seuil à l'échelle du site

Pour modifier le seuil par défaut pour l'ensemble de votre site, ajoutez `outdatedThresholdDays` sous `[params]` dans votre configuration de site :

```toml
[params]
  # Note : Les articles plus anciens que ce nombre de jours afficheront l'avis de contenu obsolète.
  # Définissez une valeur plus grande pour être plus indulgent, ou plus petite pour un vieillissement plus strict.
  outdatedThresholdDays = 365
```

## Remplacements par page

Vous pouvez remplacer le seuil pour des pages individuelles via le Front Matter :

```yaml
---
# Note : Remplacer le seuil pour cette page spécifique.
outdatedThresholdDays: 90
---
```

Pour désactiver complètement l'avis pour une page spécifique :

```yaml
---
# Note : Masquer de force l'avis de contenu obsolète sur cette page.
showOutdatedWarning: false
---
```

Définissez `outdatedThresholdDays` à `0` pour désactiver effectivement l'avis (tout âge positif dépassera le seuil).

## Comment la date est déterminée

L'âge est calculé à partir de la date significative **la plus récente** :

1. Si la page a un champ `lastmod` différent de `date`, `lastmod` est utilisé.
2. Sinon, `date` est utilisé.

Cela signifie qu'un article publié il y a 3 ans mais **mis à jour la semaine dernière** n'affichera pas l'avertissement de contenu obsolète.

## i18n

Le texte d'avertissement est géré via la clé i18n `outdatedWarning`, qui accepte un paramètre `{{ .Days }}` :

| Langue | Clé | Traduction par défaut |
|---|---|---|
| Anglais (`en-US`) | `outdatedWarning` | `This article was published over {{ .Days }} days ago. The information may no longer be applicable.` |
| Chinois simplifié (`zh-Hans`) | `outdatedWarning` | `本文发布于 {{ .Days }} 天前，部分信息可能已不再适用。` |

Pour personnaliser le message, remplacez la clé dans le répertoire `i18n/` de votre site.

## Conseils

- **Utilisez `lastmod` activement** : maintenez le champ `lastmod` à jour lorsque vous révisez du contenu. Cela supprime automatiquement l'avertissement pour les articles récemment révisés.
- **Ajustez par section** : si votre site a des sections avec des durées de vie de contenu différentes (par ex. actualités vs référence), ajustez `outdatedThresholdDays` par page ou par `_index.md` de section.
- **Combinez avec `showOutdatedWarning: false`** : utilisez ceci sur les pages intemporelles (par ex. « À propos » ou « Politique de confidentialité ») qui n'ont jamais besoin de l'avertissement.
- **Révision éditoriale** : envisagez d'associer l'avis de contenu obsolète à un flux de révision périodique — lorsque vous voyez la bannière en lisant votre propre site, il est temps de rafraîchir le contenu.
