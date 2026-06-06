---
title: Mode de thème et couleur du thème
weight: 10
date: '2026-06-06T00:00:00+08:00'
---

Contrôle le mode de couleur par défaut de votre site et la couleur source du thème par défaut. Le thème prend en charge le suivi du paramètre système, le forçage du mode clair/sombre et la définition d'une couleur d'accentuation par défaut.

## Où configurer

Définissez dans `hugo.toml` (ou `config.toml`) à la racine de votre site :

```toml
[params.theme]
  # Note : Mode par défaut pour les nouveaux visiteurs.
  # Options :
  #   - 'auto'  (recommandé) : suivre la préférence du système/navigateur.
  #   - 'light' : forcer le mode clair.
  #   - 'dark'  : forcer le mode sombre.
  defaultMode = 'auto'

  # Note : Couleur source du thème par défaut au format #RRGGBB.
  # Si non défini, le thème utilise #1f2329 par défaut.
  # Les lecteurs peuvent la remplacer via le panneau de paramètres (Apparence → Couleur du thème).
  defaultSeed = '#1f2329'
```

Le paramètre `defaultSeed` définit la couleur d'accentuation du site utilisée par Material Design 3. Il accepte un code couleur hexadécimal à 6 chiffres ; les valeurs invalides sont silencieusement ignorées et reviennent à la valeur par défaut intégrée.

## Contrôles du panneau de paramètres

L'onglet Apparence fournit :

- **Mode de thème** : bascule auto / clair / sombre
- **Couleur du thème** : une palette de 17 couleurs Material 500, plus une saisie `#RRGGBB` personnalisée

## Règles de priorité

1. **Choix de l'utilisateur** : si le lecteur modifie le mode ou la couleur source dans le panneau de paramètres, cela est stocké localement et prend la priorité la plus élevée.
2. **Configuration du site** : pour les nouveaux visiteurs, `defaultMode` et `defaultSeed` sont utilisés.
3. **Repli** : si non défini, le mode revient à `auto` et la couleur source à `#1f2329`.
