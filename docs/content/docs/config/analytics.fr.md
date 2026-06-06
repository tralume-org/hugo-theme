---
title: Analytique (Umami)
weight: 120
date: '2026-06-06T00:00:00+08:00'
---

Intègre Umami, un système d'analyse léger et respectueux de la vie privée, avec un avis optionnel de « script bloqué », l'affichage des vues par page et des événements d'interaction intégrés pour les composants du thème.

## Injecter le script Umami

Définissez dans `hugo.toml` :

```toml
[params.analytics]
  provider = 'umami'

  [params.analytics.providers.umami]
    # Note : URL du script Umami.
    scriptUrl = 'https://analytics.example.com/script.js'
    # Note : ID du site web depuis votre tableau de bord Umami.
    websiteId = 'your-website-id'

    # Optionnel : afficher un avis convivial si le script est bloqué par un bloqueur de publicités.
    # Lorsqu'activé, une boîte de dialogue en plusieurs étapes guide le lecteur à travers :
    #   1. Un message expliquant pourquoi Umami est utilisé
    #   2. Quelles données sont collectées
    #   3. Pourquoi le script peut être bloqué
    #   4. Comment mettre le site en liste blanche dans les bloqueurs de publicités courants
    blockNotice = true
```

## Vues de page

Appelle l'API publique d'Umami pour afficher le nombre de vues sous le titre de l'article.

```toml
[params.analytics.providers.umami.pageviews]
  # Note : URL de base de l'instance Umami (ne pas inclure /script.js).
  host = 'https://analytics.example.com'

  # Note : ID de partage pour ce site.
  # Note : Activez « share URL » dans Umami ; la dernière chaîne aléatoire dans le lien est l'ID.
  shareId = 'your-share-id'
```

## Événements d'interaction intégrés

Une fois le script injecté, le thème signale automatiquement des événements personnalisés Umami pour les interactions courantes sans câblage supplémentaire dans les templates.

- **Flux de lecture** : `scroll_depth`, `open_outline`, `close_outline`, `click_outline_item`
- **Actions sur le contenu** : `copy_code`, `copy_permalink`, `click_outbound_link`, `click_tag`
- **Navigation globale** : `open_mobile_menu`, `close_mobile_menu`, `open_pages_menu`, `click_nav_link`
- **Préférences d'interface** : `open_settings_panel`, `change_theme_mode`, `change_glass_strength`, `change_reader_width`, `change_background_provider`
- **Listes et modules latéraux** : `load_more_posts`, `reach_list_end`, `click_article_card`, `view_comments`, `click_edit_source`, `view_pageviews_widget`

## Référence des événements

La liste ci-dessous couvre tous les événements personnalisés Umami intégrés actuellement émis par le thème.

### Page et lecture

| Événement | Signification | Principaux champs supplémentaires |
| --- | --- | --- |
| `scroll_depth` | Déclenché lorsque le lecteur atteint un seuil de profondeur. Les seuils actuels sont 25 / 50 / 75 / 100, il est donc normal de voir plusieurs entrées sur la même page. | `depth` |
| `open_outline` | Déclenché lorsque la table des matières mobile est ouverte. | `heading_count` |
| `close_outline` | Déclenché lorsque la table des matières mobile est fermée. | aucun |
| `click_outline_item` | Déclenché lorsqu'un lien de titre dans la table des matières est cliqué. | `heading_id`, `heading_level` |
| `view_pageviews_widget` | Déclenché après que le widget de vues de page est affiché avec succès. | aucun |
| `view_comments` | Déclenché lorsque la section des commentaires entre dans la zone visible et atteint le seuil de visibilité. | `provider` |

### Actions sur le contenu

| Événement | Signification | Principaux champs supplémentaires |
| --- | --- | --- |
| `copy_code` | Déclenché après la copie réussie d'un bloc de code. | `lang`, `line_count` |
| `copy_permalink` | Déclenché après la copie réussie du permalien de l'article. | `title` |
| `click_outbound_link` | Déclenché lorsqu'un lien externe dans le contenu de l'article est cliqué. | `target_url`, `target_host`, `link_text`, `link_position` |
| `click_edit_source` | Déclenché lorsque le lien « Modifier cette page » ou le lien source est cliqué. | `target_url`, `target_host` |
| `click_tag` | Déclenché lorsqu'une étiquette est cliquée. | `tag` |

### Navigation et listes

| Événement | Signification | Principaux champs supplémentaires |
| --- | --- | --- |
| `open_mobile_menu` | Déclenché lorsque le menu mobile est ouvert. | `position` |
| `close_mobile_menu` | Déclenché lorsque le menu mobile est fermé. | `position` |
| `open_pages_menu` | Déclenché lorsque le panneau Pages de la barre supérieure est ouvert. | `position` |
| `click_nav_link` | Déclenché lorsqu'un lien de navigation du thème est cliqué. | `label`, `target_path`, `position` |
| `click_article_card` | Déclenché lorsqu'une carte d'article est cliquée pour ouvrir sa page de détail. | `target_path`, `title`, `position` |
| `load_more_posts` | Déclenché lorsque le défilement infini charge avec succès la page suivante d'articles. | `feed`, `current_page`, `next_page` |
| `reach_list_end` | Déclenché lorsque le défilement infini atteint la fin de la liste. | `feed`, `page` |

### Paramètres et préférences

| Événement | Signification | Principaux champs supplémentaires |
| --- | --- | --- |
| `open_settings_panel` | Déclenché lorsque le panneau de paramètres est ouvert. | aucun |
| `change_theme_mode` | Déclenché lorsque le mode de thème passe à auto, clair ou sombre. | `mode` |
| `change_glass_strength` | Déclenché lorsque la valeur de l'intensité acrylique change. | `strength` |
| `change_reader_width` | Déclenché lorsque la largeur de lecture change. | `width` |
| `change_background_provider` | Déclenché lorsque le fournisseur d'arrière-plan change entre URL, Téléversement et Pixaroa. | `provider` |

## Comment lire les entrées Umami

- Un chemin simple comme `/zh-hans/pages/affiliates/` est un enregistrement de vue de page intégré d'Umami, pas un événement personnalisé défini par le thème.
- `Visitor from ... using ...` est le résumé de session d'Umami pour la localisation, le navigateur, le système d'exploitation et le type d'appareil.
- `view_pageviews_widget on /...` signifie que le widget de vues de page s'est affiché avec succès.
- `view_comments on /...` signifie que la section des commentaires est devenue visible dans la zone d'affichage.
- Plusieurs entrées `scroll_depth` sur la même page signifient généralement que le lecteur a franchi les seuils de 25 %, 50 %, 75 % et 100 % dans l'ordre.

## Notes

- **Respect de la vie privée** : l'analyse est gérée par Umami ; le thème affiche uniquement les résultats lorsque c'est activé.
- **Dégradation gracieuse** : si les requêtes sont bloquées (réseau/bloqueur de pub), l'élément de vues de page est masqué au lieu d'afficher une interface cassée.
- **Contexte cohérent** : chaque événement inclut automatiquement le chemin de la page, la langue et le type de page pour faciliter le filtrage dans Umami.
