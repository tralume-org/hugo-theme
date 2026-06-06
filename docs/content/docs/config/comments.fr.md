---
title: Commentaires
weight: 130
date: '2026-06-05T00:00:00+08:00'
---

Configurez le widget de commentaires d'article. Tralume prend en charge `remark42`, `giscus`, `utterances`, `waline` et `twikoo`, et permet au widget de suivre le thème actuel du site et la langue de la page lorsque le fournisseur le prend en charge. Par défaut, les fils de commentaires utilisent l'URL formelle de la langue par défaut au lieu d'être divisés par des URL spécifiques à chaque langue.

## Fournisseurs supportés

| Fournisseur | Backend | Clés requises |
| --- | --- | --- |
| `remark42` | Remark42 auto-hébergé | `host` |
| `giscus` | Discussions GitHub | `repo`, `repoId`, `category`, `categoryId` |
| `utterances` | Issues GitHub | `repo` |
| `waline` | Serveur Waline | `serverURL` |
| `twikoo` | Environnement Twikoo | `envId` |

## Configuration de base

Définissez un fournisseur dans `hugo.toml` :

```toml
[params.comments]
  provider = 'remark42'
  # Note : Stratégie utilisée pour fusionner les fils de commentaires.
  # Note : defaultLanguage utilise l'URL formelle de la langue par défaut ; c'est la valeur par défaut du thème.
  mergeStrategy = 'defaultLanguage'

  [params.comments.providers.remark42]
    # Note : URL du service Remark42. Doit correspondre à REMARK_URL dans la configuration du backend.
    host = 'https://remark42.example.com'
    # Note : ID du site. Doit correspondre à SITE dans les paramètres de démarrage du backend Remark42.
    siteId = 'my-site'
```

Seul le fournisseur sélectionné est affiché. Si les clés requises pour ce fournisseur sont manquantes, la carte de commentaires n'est pas affichée.

## Giscus

```toml
[params.comments]
  provider = 'giscus'
  # Note : defaultLanguage partage une seule discussion entre les pages traduites.
  mergeStrategy = 'defaultLanguage'

  [params.comments.providers.giscus]
    # Note : Dépôt GitHub sur lequel Giscus est installé.
    repo = 'owner/repo'
    # Note : ID du dépôt depuis la page de configuration Giscus.
    repoId = 'R_kgDOExample'
    # Note : Nom de la catégorie Discussions GitHub.
    category = 'Announcements'
    # Note : ID de la catégorie depuis la page de configuration Giscus.
    categoryId = 'DIC_kwDOExample'
```

Paramètres Giscus optionnels :

```toml
[params.comments.providers.giscus]
  # Note : Mode de mappage. La valeur par défaut du thème est specific, utilisant l'URL du fil partagé comme terme.
  mapping = 'specific'
  # Note : Terme personnalisé. Laisser vide pour utiliser l'URL générée par mergeStrategy.
  term = 'custom-thread-id'
  # Note : Activer la correspondance stricte des titres.
  strict = false
  # Note : Afficher les contrôles de réaction.
  reactionsEnabled = true
  # Note : Émettre des événements de métadonnées de discussion.
  emitMetadata = false
  # Note : Position de la saisie du commentaire.
  inputPosition = 'bottom'
  # Note : Thèmes Giscus utilisés pour le mode clair/sombre de Tralume.
  lightTheme = 'light'
  darkTheme = 'dark'
```

## Utterances

```toml
[params.comments]
  provider = 'utterances'
  mergeStrategy = 'defaultLanguage'

  [params.comments.providers.utterances]
    # Note : Dépôt GitHub sur lequel Utterances est installé.
    repo = 'owner/repo'
```

Paramètres Utterances optionnels :

```toml
[params.comments.providers.utterances]
  # Note : Terme d'issue personnalisé. Laisser vide pour utiliser l'URL générée par mergeStrategy.
  issueTerm = 'custom-thread-id'
  # Note : Étiquette appliquée aux issues créées par Utterances.
  label = 'comments'
  # Note : Thèmes Utterances utilisés pour le mode clair/sombre de Tralume.
  lightTheme = 'github-light'
  darkTheme = 'github-dark'
```

## Waline

```toml
[params.comments]
  provider = 'waline'
  mergeStrategy = 'defaultLanguage'

  [params.comments.providers.waline]
    # Note : URL du serveur Waline.
    serverURL = 'https://waline.example.com'
```

Paramètres Waline optionnels :

```toml
[params.comments.providers.waline]
  # Note : Code de langue personnalisé. Laisser vide pour suivre la langue de la page actuelle.
  lang = 'en-US'
  # Note : Champs de métadonnées requis avant de publier un commentaire.
  requiredMeta = ['nick', 'mail']
  # Note : Activer les compteurs de réaction, de vues et de commentaires si votre serveur Waline les prend en charge.
  reaction = true
  pageview = true
  comment = true
```

## Twikoo

```toml
[params.comments]
  provider = 'twikoo'
  mergeStrategy = 'defaultLanguage'

  [params.comments.providers.twikoo]
    # Note : ID d'environnement Twikoo ou URL du serveur, selon votre cible de déploiement.
    envId = 'https://twikoo.example.com'
```

Paramètres Twikoo optionnels :

```toml
[params.comments.providers.twikoo]
  # Note : Région Tencent Cloud, uniquement nécessaire pour un déploiement Tencent CloudBase.
  region = 'ap-shanghai'
  # Note : Code de langue personnalisé. Laisser vide pour suivre la langue de la page actuelle.
  lang = 'en'
```

## Paramètres optionnels Remark42

```toml
[params.comments.providers.remark42]
  # Note : Nombre maximum de commentaires affichés par défaut sur mobile.
  maxShownComments = 20
  # Note : Afficher l'entrée d'abonnement par e-mail aux visiteurs.
  showEmailSubscription = true
  # Note : Afficher l'entrée d'abonnement RSS aux visiteurs.
  showRssSubscription = true
  # Note : Activer une interface plus simple.
  simpleView = false
  # Note : Masquer le pied de page Remark42. Masqué par défaut (true) ; définir sur false pour l'afficher.
  noFooter = true
```

## Notes

- Le widget de commentaires est affiché comme une carte dédiée après la carte de métadonnées de l'article.
- Remark42, Giscus, Utterances et Waline suivent automatiquement le mode clair/sombre actuel du site. Twikoo utilise son propre comportement de thème frontend.
- La langue du fournisseur suit la langue de la page actuelle lorsque c'est supporté. Le thème mappe `zh-Hans` vers `zh-CN` ; l'anglais mappe vers `en`, sauf Waline qui utilise `en-US`.
- `mergeStrategy = 'smartPath'` : fusionne `/zh-hans/posts/test/` et `/en-us/posts/test/` en un seul fil neutre ; lorsque `defaultContentLanguageInSubdir = true`, l'URL du fil reste `/posts/test/`, et lorsque `defaultContentLanguageInSubdir = false` avec `params.i18nRouting.enableAutoEntry = true`, elle devient `/auto/posts/test/` afin que les e-mails de notification atterrissent également d'abord sur la page d'entrée intelligente.
- `mergeStrategy = 'defaultLanguage'` : toujours utiliser l'URL formelle de la langue par défaut comme identifiant de fil partagé. C'est la valeur par défaut du thème. Gardez la langue par défaut au `weight` le plus bas pour que l'ordre des langues de Hugo reste aligné.
- `mergeStrategy = 'none'` : conserve un fil indépendant par URL de langue.
- Giscus utilise par défaut `mapping = 'specific'`, Utterances utilise par défaut un terme d'issue personnalisé, et Waline/Twikoo utilisent `path` ; tous trois utilisent l'URL générée par `mergeStrategy` sauf si vous remplacez le paramètre de terme/chemin spécifique au fournisseur.
