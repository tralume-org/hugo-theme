---
title: Pied de page personnalisé
weight: 110
date: '2026-06-06T00:00:00+08:00'
---

Ajoutez vos propres éléments après le copyright et le lien RSS dans le pied de page du site.

C'est utile pour ajouter un numéro d'enregistrement ICP, un lien vers la politique de confidentialité ou un point d'entrée vers une page d'amis. Les éléments sont séparés par `|` et affichés après le lien RSS.

## Où configurer

Définissez dans `hugo.toml` :

```toml
[params.footer]
  # Note : Éléments ajoutés après le lien RSS.
  afterRss = [
    # Exemple 1 : Texte brut
    { text = 'ICP 12345678' },

    # Exemple 2 : Élément lié
    { text = 'Politique de confidentialité', url = '/privacy/' },

    # Exemple 3 : Utiliser une clé i18n (pour les sites multilingues)
    { i18n = 'footerLinkContact' , url = '/contact/' }
  ]
```
