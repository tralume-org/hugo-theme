---
title: Recherche
weight: 125
date: '2026-06-06T00:00:00+08:00'
---

Configurez la boîte de dialogue de recherche du site. Tralume prend en charge `pagefind` pour la recherche locale statique et `meilisearch` pour la recherche hébergée avec tolérance aux fautes de frappe.

## Fournisseurs supportés

| Fournisseur | Backend | Clés requises |
| --- | --- | --- |
| `pagefind` | Index Pagefind statique | aucune dans la configuration du thème |
| `meilisearch` | Auto-hébergé ou Meilisearch Cloud | `host`, `indexUid` |

## Pagefind

Pagefind est le fournisseur par défaut :

```toml
[params.search]
  # Note : Active le bouton et la boîte de dialogue de recherche.
  enable = true
  # Note : Charge /pagefind/<langue>/pagefind.js généré par votre étape de build Pagefind.
  provider = 'pagefind'
```

Le thème charge uniquement le script Pagefind généré. Votre pipeline de construction doit toujours générer l'index Pagefind dans la sortie du site déployé.

## Meilisearch

Utilisez Meilisearch lorsque vous souhaitez un backend de recherche hébergé, une tolérance aux fautes de frappe, des filtres, des règles de classement ou une recherche partagée entre plusieurs déploiements.

```toml
[params.search]
  # Note : Active la boîte de dialogue de recherche.
  enable = true
  # Note : Bascule le fournisseur frontend vers la recherche REST Meilisearch.
  provider = 'meilisearch'

  [params.search.meilisearch]
    # Note : Point de terminaison Meilisearch public, sans barre oblique finale.
    host = 'https://search.example.com'
    # Note : Utilisez uniquement une clé API de recherche. N'utilisez jamais la clé maître ou la clé admin dans le code frontend.
    apiKey = 'search-only-public-key'
    # Note : UID de l'index contenant les documents pour le site ou la langue actuelle.
    indexUid = 'tralume_posts_en'
```

Le frontend appelle `POST /indexes/{index_uid}/search`. Aucun SDK JavaScript Meilisearch ni script CDN n'est requis.

## Structure des documents

Par défaut, Tralume s'attend à ce que chaque document Meilisearch expose ces champs :

| Champ | Objectif |
| --- | --- |
| `id` | Clé primaire dans Meilisearch |
| `title` | Titre du résultat de recherche |
| `url` | Lien du résultat |
| `content` | Texte principal utilisé pour les extraits tronqués |
| `summary` ou `description` | Extrait de repli optionnel |
| `section` | Métadonnée de résultat optionnelle |

Vous pouvez mapper des noms de champs différents :

```toml
[params.search.meilisearch]
  # Note : Mappe le titre du résultat vers votre champ indexé.
  titleAttribute = 'headline'
  # Note : Mappe l'URL du résultat vers votre champ indexé.
  urlAttribute = 'permalink'
  # Note : Mappe les petites métadonnées affichées sous le titre du résultat.
  metaAttribute = 'category'
  # Note : Champs tronqués par Meilisearch pour les extraits.
  excerptAttributes = ['body', 'summary']
```

## Paramètres de recherche

Tralume expose les paramètres de recherche Meilisearch courants utilisés par la boîte de dialogue :

```toml
[params.search.meilisearch]
  # Note : Nombre maximum de résultats affichés dans la boîte de dialogue.
  limit = 20
  # Note : Nombre maximum de mots dans chaque extrait tronqué retourné par Meilisearch.
  cropLength = 24
  # Note : Restreint les champs retournés. Ces champs doivent être des attributs affichés dans Meilisearch.
  attributesToRetrieve = ['title', 'url', 'content', 'section']
  # Note : Restreint les champs recherchables. Ces champs doivent être des attributs recherchables dans Meilisearch.
  attributesToSearchOn = ['title', 'content']
  # Note : Expression de filtre optionnelle. Les champs filtrés doivent être des attributs filtrables dans Meilisearch.
  filter = 'lang = "en-US"'
  # Note : Règles de tri optionnelles. Les champs triés doivent être des attributs triables dans Meilisearch.
  sort = ['date:desc']
  # Note : Stratégie de correspondance de requête optionnelle supportée par Meilisearch.
  matchingStrategy = 'last'
  # Note : Attributs de surbrillance optionnels. Les termes correspondants dans ces champs sont entourés de balises <em>.
  highlightAttributes = ['title', 'content']
```

Meilisearch nécessite des paramètres d'index avant que les filtres ou les règles de tri puissent fonctionner. Ajoutez chaque champ filtré à `filterableAttributes`, et chaque champ trié à `sortableAttributes`.

## Sites multilingues

Pour les sites multilingues, utilisez soit un index par langue, soit un index partagé avec un filtre de langue.

```toml
[params.search.meilisearch]
  # Note : Utilisez un index spécifique à la langue lorsque chaque langue Hugo a sa propre substitution de params.
  indexUid = 'tralume_posts_en'
```

```toml
[params.search.meilisearch]
  # Note : Utilisez un index partagé et filtrez la langue actuelle si vos documents contiennent lang.
  indexUid = 'tralume_posts'
  filter = 'lang = "en-US"'
```

Si vous utilisez les `locales` Meilisearch, passez les balises de langue ISO supportées par Meilisearch, comme `en` ou `zh` :

```toml
[params.search.meilisearch]
  # Note : Aide Meilisearch à choisir l'analyseur de langue attendu pour la requête.
  locales = ['en']
```

## Sécurité

La valeur `apiKey` est envoyée au navigateur. Utilisez uniquement une clé API de recherche limitée à l'index requis et à l'action `search`. N'exposez jamais la clé maître, la clé admin par défaut ou toute clé pouvant écrire des documents ou modifier les paramètres.

```bash
# Note : Crée une clé API de recherche à portée restreinte pour un index.
# Note : Exécutez ceci sur une machine de confiance avec votre clé maître, pas dans le code navigateur.
curl -X POST "${MEILISEARCH_URL}/keys" \
  -H "Authorization: Bearer ${MEILISEARCH_MASTER_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Recherche frontend Tralume",
    "actions": ["search"],
    "indexes": ["tralume_posts_en"],
    "expiresAt": null
  }'
```

## Notes

- Tralume implémente uniquement l'interface de requête frontend. Il ne téléverse pas le contenu Hugo vers Meilisearch.
- L'hôte Meilisearch doit autoriser les requêtes du navigateur depuis l'origine de votre site via CORS ou un proxy inverse.
- `apiKey` peut être omis uniquement lorsque votre point de terminaison Meilisearch est intentionnellement public et non authentifié.
- L'absence de `host` ou `indexUid` fait que la boîte de dialogue affiche l'état normal d'indisponibilité.
