---
title: Infos du site et SEO
weight: 50
date: '2026-06-06T00:00:00+08:00'
---

Contrôle la description du site et les règles des robots d'exploration (par ex. Google, Bing).

## Description du site

Fournissez une courte description pour votre site. Elle apparaît dans les aperçus des résultats de recherche et est également utilisée comme description du flux RSS.

Définissez dans `hugo.toml` :

```toml
[params]
  # Note : Courte description du site.
  description = 'Tralume : un thème Hugo moderne, léger et élégant.'
```

## Favicon

Tralume peut générer des liens de favicon à partir de `params.favicon`. Placez les fichiers d'icône dans le répertoire `static/` de votre site, puis référencez-les avec des chemins relatifs à la racine :

```toml
[params.favicon]
  icon = '/favicon.ico'
  svg = '/favicon.svg'
  appleTouch = '/apple-touch-icon.png'
  manifest = '/site.webmanifest'
```

Champs supportés :

- `icon` : favicon standard, généralement `.ico` ou `.png`
- `svg` : favicon SVG pour les navigateurs modernes
- `appleTouch` : icône d'écran d'accueil iOS
- `manifest` : manifeste d'application web

## Cartes de partage social (Open Graph / Twitter Card)

Tralume génère automatiquement les métadonnées Open Graph et Twitter Card.

Le thème résout l'image de partage dans cet ordre de priorité :

1. **Front matter au niveau de la page** : `image` > `featuredImage` > `featured_image` > `cover` > `thumbnail` > `banner` > première ressource image du Page Bundle
2. **Paramètres à l'échelle du site** (dans l'ordre) : `params.socialImage` > `params.seo.image` > `params.seo.cardImage`
3. **Repli** : `params.favicon.appleTouch` > `params.favicon.icon` > aucune image

Définissez une image de partage par défaut à l'échelle du site :

```toml
[params]
  # Note : Image de carte de partage social à l'échelle du site.
  # Note : Ceci est vérifié en premier parmi les valeurs par défaut à l'échelle du site.
  socialImage = '/social-card.png'
```

Vous pouvez également définir des valeurs par défaut sous `params.seo` :

```toml
[params.seo]
  # Note : Image de carte de partage social par défaut à l'échelle du site.
  # Note : Une image 1200x630 est recommandée.
  image = '/seo-default.png'
  # Note : image a priorité sur cardImage.
  cardImage = '/social-card.png'
```

Pour utiliser n'importe quel champ d'image de niveau page supporté, ajoutez-le au front matter :

```toml
+++
# Note : Remplace l'image de la carte de partage pour cette page uniquement.
# Note : N'importe lequel de image, featuredImage, featured_image, cover, thumbnail, banner fonctionne.
featuredImage = '/posts/example/cover.png'
+++
```

## Auteur et éditeur en données structurées (JSON-LD)

Tralume génère du JSON-LD pour la page d'accueil et les pages d'article.

- Les pages d'article peuvent inclure `author`
- Les pages d'accueil et d'article peuvent inclure `publisher`
- `publisher.logo` peut être défini explicitement, et revient à `params.seo.logo` > `params.favicon.appleTouch` > `params.favicon.icon` lorsqu'il est omis

Définissez les métadonnées d'auteur et d'éditeur à l'échelle du site dans `hugo.toml` :

```toml
[params.seo.author]
  # Note : Nom d'auteur par défaut pour les pages d'article.
  name = 'AlexMa'
  # Note : URL du profil ou de la page à propos de l'auteur.
  url = 'https://example.com/about/'

[params.seo.publisher]
  # Note : Nom de l'éditeur utilisé dans les données structurées.
  name = 'AlexMa\'s Blog'
  # Note : URL de la page d'accueil de l'éditeur.
  url = 'https://example.com/'
  # Note : Logo de l'éditeur.
  # Note : Utilisez une URL absolue stable ou un chemin relatif à la racine.
  logo = '/publisher-logo.png'
```

Pour remplacer l'auteur pour un seul article, ajoutez ceci au front matter :

```toml
+++
# Note : Remplace l'auteur des données structurées pour cet article.
[author]
  name = 'Auteur invité'
  url = 'https://example.com/team/guest-author/'
+++
```

## Règles robots (robots.txt)

Indiquez aux moteurs de recherche quelles pages ils peuvent explorer, et désactivez éventuellement l'exploration pour l'ensemble du site (utile avant un lancement public).

Activez la génération du robots.txt de Hugo au niveau supérieur de `hugo.toml` :

```toml
enableRobotsTXT = true

[params.robotsTxt]
  # Note : Autoriser ou non les moteurs de recherche à explorer.
  # Si défini sur false, tout le site est interdit (Disallow: /).
  enabled = true

  # Note : Inclure ou non le lien du sitemap dans robots.txt.
  sitemap = true
```
