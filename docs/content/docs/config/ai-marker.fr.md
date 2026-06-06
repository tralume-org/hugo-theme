---
title: Marqueur de contribution IA
weight: 90
date: '2026-06-06T00:00:00+08:00'
---

À mesure que les outils d'IA deviennent courants, divulguer comment l'IA a participé à votre processus d'écriture devient de plus en plus important. Cette fonctionnalité affiche un widget de divulgation repliable : par défaut, seul le niveau de participation de l'IA est visible (par ex. « Assisté par IA »), et les lecteurs peuvent cliquer pour développer et voir les détails complets (domaines d'utilisation, niveau de révision, outils utilisés).

Configurez via l'objet `ai` dans le Front Matter de la page :

```yaml
---
title: "Une journée de collaboration avec l'IA"
# Note : Champs de divulgation IA.
ai:
  # Note : Niveau de participation (omettre ou définir sur none pour masquer le marqueur).
  level: assist

  # Note : Domaines où l'IA a été utilisée (optionnel, plusieurs autorisés).
  usage: [grammar, wording]

  # Note : Niveau de révision humaine (optionnel ; par défaut none).
  review: edited

  # Note : Outils utilisés (optionnel, plusieurs autorisés).
  tools: [chatgpt]
---
```

## Champs supportés

- `ai.level` : niveau de participation.
- `ai.usage` : liste des utilisations (optionnel).
- `ai.review` : niveau de révision humaine (optionnel).
- `ai.tools` : outils utilisés (optionnel).

Note : le marqueur n'est affiché que lorsque `ai.level` n'est pas `none`.

### ai.level

- `none` : aucune IA (masqué)
- `assist` : assisté par IA
- `coauthor` : co-écrit avec l'IA
- `generate` : généré par IA
- `translate` : traduit par IA

### ai.review

- `none` : non spécifié / aucune vérification humaine
- `light` : relu (lecture complète)
- `edited` : édité (révisions ligne par ligne)
- `fact_checked` : faits/données/citations clés vérifiés par un humain

### ai.usage (plusieurs autorisés)

- `outline` : suggestions de plan/structure
- `rewrite` : réécriture/restructuration
- `expand` : développement des détails
- `summarize` : résumé/compression
- `tone` : ajustement du ton/style
- `grammar` : corrections grammaticales
- `wording` : améliorations de formulation
- `title` : suggestions de titre/sous-titre
- `translate` : traduction
- `research` : direction/notes de recherche
- `citation` : suggestions de formatage des citations
- `fact_check_help` : aide à la vérification des faits (signaler les parties suspectes)
- `code` : génération/réécriture de code
- `debug` : suggestions de débogage/analyse de logs
- `data` : nettoyage et conversion de tableaux/données
- `image` : aide/suggestion d'images
- `privacy` : suggestions de confidentialité/caviardage
- `policy` : suggestions de formulation pour conformité/risque

### ai.tools (plusieurs autorisés)

- `chatgpt` : ChatGPT
- `claude` : Claude
- `gemini` : Gemini
- `deepseek` : DeepSeek
- `qwen` : Qwen
- `other` : Autre

## Comportement d'affichage

Le marqueur est affiché comme un élément `<details>` repliable sous le titre de l'article. Initialement, seul le niveau de participation est visible (par ex. « Assisté par IA »). En cliquant sur le résumé, le widget se développe pour révéler :
- **Domaines d'utilisation** (si `ai.usage` est défini)
- **Niveau de révision humaine** (toujours affiché lorsque le marqueur est présent)
- **Outils utilisés** (si `ai.tools` est défini)

Le marqueur n'apparaît que lorsque `ai.level` n'est pas `none`.
