---
title: Liens d'amis
weight: 140
date: '2026-06-06T00:00:00+08:00'
---

Contrôle la façon dont les liens sont affichés sur la page « Amis », y compris le regroupement i18n et l'ordre manuel par poids.

## Emplacement du fichier de données

Créez `data/friends.yaml` dans votre site Hugo (vous pouvez aussi utiliser `.toml` ou `.json`). La page visible par le lecteur est généralement intitulée « Amis ».

## Exemple de données

```yaml
- name:
    zh-Hans: "我的站点"
    en-US: "My Site"
    default: "My Site" # Optionnel : valeur de repli lorsque la langue actuelle est absente.
  description:
    zh-Hans: "你好"
    en-US: "Hello"
  url: "https://example.com"
  avatar: "https://example.com/avatar.png"
  # Optionnel : poids de tri manuel ; les valeurs plus petites apparaissent en premier, la valeur par défaut est 10000.
  weight: 10
  # Optionnel : utilisé pour le regroupement « préférer la langue actuelle » et les étiquettes de langue des cartes.
  # Note : .lang est également accepté comme alias pour language.
  language: ["zh-Hans", "en-US"]

# Note : Si vous n'avez pas besoin d'i18n, vous pouvez utiliser directement des chaînes simples.
- name: "My Site"
  description: "Hello"
  url: "https://example.com"
  avatar: "https://example.com/avatar.png"
  # Optionnel : lorsqu'il est omis, le thème utilise 10000.
  weight: 100
  # Optionnel : utilisé pour le regroupement « préférer la langue actuelle » et les étiquettes de langue des cartes.
```

## Fonctionnalités clés

- **Compatible i18n** : `name` et `description` peuvent être des chaînes simples ou une table de langues.
- **Ordre par poids** : les valeurs `weight` plus petites apparaissent en premier ; lorsqu'il est omis, le thème utilise `10000`.
- **Aléatoire pour les poids égaux** : les liens avec le même `weight` sont mélangés au moment de la construction du site. Rafraîchir une page statique déployée ne changera généralement pas l'ordre.
- **Préférer la langue actuelle comme groupe** : les liens dont `language` inclut la langue actuelle du site sont affichés en premier comme un groupe, puis les liens des autres langues sont affichés ensuite.
