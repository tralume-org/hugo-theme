---
title: Article Interactions
weight: 65
date: '2026-06-06T00:00:00+08:00'
---

Controls interactive features available on article pages: outline navigation, reading progress, image lightbox, and code block copy.

## Article outline

Tralume automatically builds a table of contents (outline) from the article's headings.

- **Desktop**: a sticky sidebar outline appears alongside the main content, highlighting the currently visible heading.
- **Mobile**: a floating button opens a full-screen overlay with the outline grid. A second floating button shows the reading progress percentage.

The outline is rendered automatically when the article contains at least one heading. No configuration is needed.

### Reading progress indicator

A floating button in the lower-right corner of the screen shows reading progress as a percentage. It appears on article pages and updates as the reader scrolls through the content. Clicking it opens the mobile outline overlay.

## Image lightbox

Clicking an inline image in article content opens it in a full-screen overlay (lightbox). The lightbox supports:

- Zoom in/out with pinch gestures or buttons
- Pan when zoomed in
- Close via the × button, overlay click, or Escape key

The lightbox works automatically for all content images. No configuration is needed.

## Code block copy

Every code block in article content shows a copy button in the upper-right corner on hover. Clicking it copies the code content to the clipboard and briefly shows a "Copied" confirmation.

The copy button uses the `codeBlockCopyLabel` and `codeBlockCopiedLabel` i18n keys for its labels.
