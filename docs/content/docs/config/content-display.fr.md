---
title: Affichage du contenu et résumés
weight: 60
date: '2026-06-06T00:00:00+08:00'
---

Contrôle les limites d'articles sur la page d'accueil, la pagination de `/posts` et `/pages`, et la longueur des résumés dans les cartes de liste.

## Limite d'articles récents sur la page d'accueil

Pour garder la page d'accueil propre, vous pouvez limiter le nombre d'articles récents affichés. Les articles supplémentaires sont accessibles via un bouton « Voir plus ».

### Où configurer

Définissez dans `hugo.toml` :

```toml
[params.home]
  # Note : Nombre d'articles récents affichés sur la page d'accueil.
  recentPostsLimit = 6
```

## Longueur de troncature des résumés

Dans les listes d'articles, si une page n'a pas de description explicite, le thème extrait un extrait du début du contenu comme résumé. Vous pouvez contrôler la longueur maximale.

Définissez dans `hugo.toml` :

```toml
[params]
  # Note : Longueur du résumé pour les cartes de la page d'accueil et des listes, en caractères.
  articleCardSummaryLength = 160
```

## Taille de page pour /posts et /pages

Les pages d'entrée `/posts` et `/pages` partagent désormais exactement la même interface d'aperçu : liste de cartes horizontale, interface de pagination identique et le même comportement de bascule entre pagination et défilement infini.

Définissez dans `hugo.toml` :

```toml
[params.posts]
  # Note : Contrôle le nombre d'éléments affichés par page pour /posts et /pages ; la liste totale est paginée automatiquement.
  # Note : Les valeurs inférieures ou égales à 0 reviennent à la valeur par défaut de 10.
  pageSize = 10
```

## Conseils

- **Séparation manuelle du résumé** : utilisez `<!--more-->` dans votre contenu pour définir la zone de résumé (le thème le préfère).
- **Préférez `description`** : si une page définit `description`, le thème l'utilise comme résumé sur les cartes de la page d'accueil, `/posts` et `/pages`.
- **Pagination mobile** : sur les petits écrans, le pagineur est fusionné en une seule barre affichant seulement précédent / actuel / suivant.
- **Le mode défilement s'applique aux deux listes** : le commutateur pagination/défilement infini du panneau de paramètres affecte désormais à la fois `/posts` et `/pages`.

## Images de couverture des cartes d'article

Les cartes d'article dans les vues en liste affichent automatiquement une image de couverture lorsqu'elle est disponible. Le thème vérifie ces champs du front matter dans l'ordre :

`image` > `featuredImage` > `featured_image` > `cover` > `thumbnail` > `banner`

Si aucun ne correspond, le thème utilise la première ressource image du Page Bundle. Lorsqu'une image de couverture est trouvée, la carte reçoit la classe `article-card--with-cover` et affiche l'image au-dessus du titre.

## Correspondance de type de contenu

Les sections `/posts` et `/pages` incluent également le contenu où le champ `type` du front matter est défini sur `posts` ou `pages`. Cela signifie que définir `type: posts` dans le front matter d'une page l'inclura dans l'interface de liste des articles, même si elle se trouve en dehors du répertoire `/posts/`.
