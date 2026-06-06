---
title: Licence de contenu
weight: 80
date: '2026-06-06T00:00:00+08:00'
---

Indiquez aux lecteurs comment votre contenu peut être utilisé (usage commercial, œuvres dérivées, attribution, etc.).

Tralume prend en charge les licences Creative Commons courantes et « Tous droits réservés ».

## Clés de licence supportées (liste complète)

| Clé               | Nom de la licence    | Notes                                     | Lien officiel                                         |
| ----------------- | -------------------- | ----------------------------------------- | ----------------------------------------------------- |
| `cc-by-4.0`       | CC BY 4.0            | Attribution                               | <https://creativecommons.org/licenses/by/4.0/>        |
| `cc-by-sa-4.0`    | CC BY-SA 4.0         | Attribution + Partage dans les mêmes conditions | <https://creativecommons.org/licenses/by-sa/4.0/> |
| `cc-by-nd-4.0`    | CC BY-ND 4.0         | Attribution + Pas de modification         | <https://creativecommons.org/licenses/by-nd/4.0/>     |
| `cc-by-nc-4.0`    | CC BY-NC 4.0         | Attribution + Pas d'utilisation commerciale | <https://creativecommons.org/licenses/by-nc/4.0/>   |
| `cc-by-nc-sa-4.0` | CC BY-NC-SA 4.0      | Attribution + Pas d'utilisation commerciale + Partage dans les mêmes conditions | <https://creativecommons.org/licenses/by-nc-sa/4.0/> |
| `cc-by-nc-nd-4.0` | CC BY-NC-ND 4.0      | Attribution + Pas d'utilisation commerciale + Pas de modification | <https://creativecommons.org/licenses/by-nc-nd/4.0/> |
| `cc0-1.0`         | CC0 1.0              | Dédicace au domaine public                | <https://creativecommons.org/publicdomain/zero/1.0/>  |
| `arr`             | ARR                  | Tous droits réservés                      |                                                       |

## 1. Valeur par défaut du site

Définissez la licence par défaut à l'échelle du site dans `hugo.toml` :

```toml
[params]
  # Note : Clé de licence par défaut.
  # Note : Les clés supportées sont la série CC 4.0 + cc0-1.0 + arr.
  contentLicense = 'cc-by-nc-4.0'
```

## 2. Remplacement par page

Remplacez dans le Front Matter d'une page :

```yaml
---
title: "Mon article privé"
# Note : Cette page remplace la valeur par défaut du site et utilise tous droits réservés.
license: "arr"
---
```

## Règles de repli

- Si `license` n'est pas défini : utiliser `params.contentLicense`.
- Si `params.contentLicense` n'est pas non plus défini : revenir à `arr`.
- Si une clé non supportée est fournie : revenir à `arr` (éviter d'afficher une étiquette inconnue).
