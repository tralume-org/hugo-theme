---
title: Visibilité RSS
weight: 80
date: '2026-06-06T00:00:00+08:00'
---

Comportement par défaut :

- `content/posts/` : inclus dans le flux RSS par défaut.
- `content/pages/` : exclu du flux RSS par défaut (par ex. À propos, livre d'or).

Vous pouvez contrôler l'inclusion RSS via le Front Matter.

Inclure une page sous `content/pages/` dans le flux RSS :

```yaml
---
title: "À propos"
# Note : Les pages sont exclues du flux RSS par défaut ; définissez ceci sur false pour inclure la page dans le flux RSS.
rssHidden: false
---
```

Exclure un article (généralement sous `content/posts/`) du flux RSS :

```yaml
---
title: "Page de test"
# Note : Définissez ceci sur true pour exclure la page du flux RSS (index.xml).
rssHidden: true
---
```
