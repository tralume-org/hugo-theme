---
title: Effet acrylique
weight: 20
date: '2026-06-06T00:00:00+08:00'
---

Contrôle l'effet acrylique (verre dépoli) utilisé par les surfaces principales (par ex. les cartes, la navigation).

## Où configurer

Définissez dans `hugo.toml` à la racine de votre site :

```toml
[params.theme]
  # Note : Opacité acrylique par défaut (pourcentage).
  # Plage : nombre entre 0 et 95.
  # Plus élevé = plus opaque ; plus bas = plus transparent.
  defaultGlassStrength = 45
```

## Contrôles du panneau de paramètres

L'onglet Apparence du panneau de paramètres fournit trois curseurs :

1. **Opacité** (`settingsPanelGlassRangeLabel`) : contrôle la transparence des surfaces acryliques. Plage : 0%–95%, par défaut : `defaultGlassStrength`.
2. **Rayon de flou** (`settingsPanelGlassBlurLabel`) : contrôle l'intensité du flou d'arrière-plan. Plage : 0px–48px, par défaut : 24px.
3. **Flou d'arrière-plan** (`settingsPanelBackgroundBlurLabel`) : contrôle le flou appliqué à l'image d'arrière-plan personnalisée. Plage : 0px–40px, par défaut : 0px.

Les lecteurs peuvent ajuster les trois en temps réel, et leurs choix sont enregistrés localement.

## Règles de priorité

1. **Ajustement utilisateur** : les lecteurs peuvent modifier les deux valeurs dans le panneau de paramètres ; les valeurs enregistrées ont la priorité la plus élevée.
2. **Configuration du site** : pour les nouveaux visiteurs, `defaultGlassStrength` est utilisé comme valeur d'opacité initiale.
