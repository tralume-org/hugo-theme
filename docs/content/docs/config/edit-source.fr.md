---
title: Lien « Modifier cette page »
weight: 100
date: '2026-06-06T00:00:00+08:00'
---

Affiche un bouton « Modifier cette page » près du bas des pages d'article, encourageant les lecteurs à proposer des corrections et améliorant la qualité du contenu.

## 1. Configuration à l'échelle du site

Définissez les informations du dépôt dans `hugo.toml` :

```toml
[params.source]
  # Note : Activer/désactiver cette fonctionnalité.
  enabled = true

  # Note : Fournisseur d'hébergement Git (github / gitlab / gitea / forgejo).
  provider = 'github'

  # Note : URL du dépôt (sans barre oblique finale).
  repo = 'https://github.com/username/my-blog'

  # Note : Branche par défaut, généralement main ou master.
  branch = 'main'

  # Note : Préfixe de chemin vers votre contenu dans le dépôt (par défaut : content).
  pathPrefix = 'content'
```

## 2. Remplacement par page

Si certaines pages se trouvent dans un dépôt ou une branche différente, vous pouvez remplacer n'importe quel champ dans le Front Matter :

```yaml
---
source:
  # Note : N'importe lequel des champs enabled, provider, repo, branch ou pathPrefix peut être remplacé par page.
  enabled: true
  provider: "gitea"
  repo: "https://gitea.example.com/other-repo"
  branch: "develop"
  pathPrefix: "docs"
---
```

Lorsqu'un champ est omis, il revient à la valeur de `params.source` à l'échelle du site.
