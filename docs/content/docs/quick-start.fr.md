---
title: Démarrage rapide
weight: 10
date: '2026-06-06T00:00:00+08:00'
---

## Initialiser le dépôt du site avec la CLI

### Prérequis

- Hugo installé (version étendue non requise, version ≥ 0.161.1)
- Go installé (pour les modules Hugo)
- Git installé (pour les modules Hugo et le contrôle de version)

### Initialiser le site

Exécutez `hugo new site <nom du site>` pour créer un nouveau site.

Entrez dans le dossier du site et exécutez `hugo mod init <chemin du module>` pour initialiser les modules Hugo.
{{< callout type="tip" >}}
Si vous prévoyez d'utiliser un dépôt Git distant pour stocker le site (comme Codeberg ou GitHub), utilisez l'URL de ce dépôt, par exemple `forgejo.alexma.top/tralume/hugo-template`.

Sinon, vous pouvez indiquer n'importe quoi. Il est recommandé d'utiliser le nom de votre site.
{{< /callout >}}

Exécutez `hugo mod get forgejo.alexma.top/tralume-org/hugo-theme` pour ajouter ce thème.

### Utiliser la configuration de base et démarrer

Modifiez `hugo.toml` et remplacez le fichier original par la configuration suivante.

```toml
baseURL = 'https://example.com/'
defaultContentLanguage = 'en-US'
defaultContentLanguageInSubdir = true

[languages]
  [languages."en-US"]
    label = 'English'
    locale = 'en-US'
    weight = 1
    title = "My site"

[menu]
  [[menu.main]]
    identifier = 'home'
    name = 'Home'
    pageRef = 'home'
    weight = 10
  [[menu.main]]
    identifier = 'posts'
    name = 'Posts'
    pageRef = 'posts'
    weight = 20
  [[menu.main]]
    identifier = 'tags'
    name = 'Tags'
    pageRef = 'tags'
    weight = 30
  [[menu.main]]
    identifier = 'pages'
    name = 'Pages'
    pageRef = 'pages'
    weight = 35
  [[menu.main]]
    identifier = 'friends'
    name = 'Friends'
    pageRef = 'friends'
    weight = 40

[module]
  [module.hugoVersion]
    min = '0.161.1'
    extended = false
  [[module.imports]]
    path = "forgejo.alexma.top/tralume-org/hugo-theme"

[markup]
  [markup.highlight]
    lineNos = false
    noClasses = false

[params.search]
  enable = true
  provider = 'pagefind'
```

Exécutez `hugo server` pour démarrer le serveur local, puis ouvrez le site dans votre navigateur comme indiqué.
