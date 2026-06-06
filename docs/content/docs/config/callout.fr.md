---
title: Encadrés (Admonitions)
weight: 70
date: '2026-06-06T00:00:00+08:00'
---

Tralume prend en charge les encadrés d'alerte de style GitHub dans le contenu Markdown. Utilisez la syntaxe `> [!TYPE]` pour afficher des blocs de note mis en évidence avec des icônes et des couleurs appropriées.

## Syntaxe

```markdown
> [!NOTE]
> Ceci est un encadré de note.

> [!WARNING]
> Ceci est un encadré d'avertissement.
```

## Types supportés

| Type | Icône | Objectif |
|------|------|---------|
| `[!NOTE]` | info | Information générale |
| `[!TIP]` | tips_and_updates | Conseil utile |
| `[!IMPORTANT]` | priority_high | Information clé |
| `[!WARNING]` | warning | À prendre en compte |
| `[!CAUTION]` | warning | Risque potentiel |
| `[!DANGER]` | dangerous | Avertissement critique |

## Titre personnalisé

Vous pouvez remplacer le titre par défaut en ajoutant du texte après le type :

```markdown
> [!NOTE]+ Mon titre personnalisé
> Contenu de l'encadré.
```

## i18n

Les titres des encadrés utilisent les clés i18n suivantes. Les valeurs par défaut sont :

| Type | Clé i18n | Valeur par défaut (en-US) |
|------|----------|---------------------------|
| `note` | `calloutNoteLabel` | Note |
| `tip` | `calloutTipLabel` | Astuce |
| `important` | `calloutImportantLabel` | Important |
| `warning` | `calloutWarningLabel` | Avertissement |
| `caution` | `calloutCautionLabel` | Attention |
| `danger` | `calloutDangerLabel` | Danger |

Vous pouvez les remplacer dans le répertoire `i18n/` de votre site pour personnaliser les étiquettes par langue.
