---
title: Routage i18n et pages d'entrée automatiques
weight: 85
date: '2026-06-06T00:00:00+08:00'
---

Tralume laisse Hugo générer normalement chaque URL de contenu formelle, puis ajoute les « pages d'entrée intelligentes par langue » comme étape post-build.

## Modes de routage

- `defaultContentLanguageInSubdir = true` : les URL de contenu formelles restent sous `/en-us/...` et `/zh-hans/...`, tandis que les pages d'entrée neutres utilisent `/` et `/posts/test/`.
- `defaultContentLanguageInSubdir = false` : la langue par défaut conserve l'URL racine, tandis que les pages d'entrée neutres se déplacent vers `/auto/` et `/auto/posts/test/`.
- Les URL de langue explicites ne sont jamais réécrites automatiquement ; seules les pages d'entrée effectuent des redirections basées sur la langue.
- Si un `post` ou une `page` n'existe que dans une seule langue, la page d'entrée redirige directement vers cette cible unique sans vérifier `localStorage` ou `navigator.languages`.

## Configuration de base

Définissez ceci dans `hugo.toml` :

```toml
defaultContentLanguage = 'en-US'
defaultContentLanguageInSubdir = true
# Note : Désactiver la redirection intégrée de langue par défaut de Hugo et laisser le script de page d'entrée du thème la gérer.
disableDefaultLanguageRedirect = true

[params.i18nRouting]
  # Note : Activer les pages d'entrée intelligentes par langue générées après la construction.
  enableAutoEntry = true
```

N'activez ceci qu'après avoir effectivement intégré `python3 tools/gen_auto_entries.py` dans votre véritable pipeline de construction. Sinon, laissez-le désactivé et conservez la redirection de langue par défaut intégrée de Hugo.

## Flux de construction

Le thème demande d'abord à Hugo de générer les pages formelles et `route-manifest.json`, puis exécute le générateur Python :

```bash
# Note : D'abord construire les pages de contenu formelles de Hugo et le manifeste de routage.
# Note : Cet exemple écrit la sortie de vérification dans public_test/ pour éviter de polluer le répertoire public/ par défaut.
hugo --destination public_test/hugo-auto-entry

# Note : Lire route-manifest.json et générer les pages d'entrée intelligentes dans le répertoire de publication.
# Note : Le script vérifie les conflits de chemin et supprime les pages d'entrée obsolètes générées par les exécutions précédentes.
python3 tools/gen_auto_entries.py --publish-dir public_test/hugo-auto-entry
```

## Notes

- Les pages d'entrée lisent d'abord la clé fixe `localStorage['tralume-language']`.
- Si aucune langue stockée n'est disponible, elles utilisent `navigator.languages` comme solution de repli.
- Si rien ne correspond, elles redirigent vers la page formelle de la langue par défaut.
- Les pages d'entrée utilisent toujours `noindex,follow` et pointent le canonical vers la page de contenu formelle ; elles n'entrent pas dans le sitemap ou les sorties RSS de Hugo.
- Si la fonctionnalité n'est pas activée, le thème conserve le comportement natif de Hugo et laisse Hugo gérer la redirection de langue par défaut du chemin racine.
