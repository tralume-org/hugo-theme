// 说明：文章大纲入口逻辑，负责模块装配与生命周期初始化。
// 注意：保持对外 API 稳定（`setupArticleOutline()`），内部实现按职责拆分。

import { getArticleOutlineElements } from './dom.js';
import { collectOutlineHeadings } from './headings.js';
import { applyOutlineAdaptiveSpacing } from './spacing.js';
import { setupArticleOutlineOverlay } from './overlay.js';
import { attachOutlineFocusSync, createOutlineHighlighter, renderArticleOutline } from './outline-view.js';
import { createProgressFloating } from './progress-floating.js';
import { setupArticleOutlineSync } from './sync.js';
import { emitAnalyticsEvent } from '../analytics-events.js';

export const setupArticleOutline = () => {
  const elements = getArticleOutlineElements();
  if (!elements) {
    return;
  }

  const { root, content, outline, list, emptyHint, outlineToggle, outlineClose, layout, progressHost, progressMeter, progressLabel } = elements;

  const prefersReducedMotion =
    typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const getScrollBehavior = () => (prefersReducedMotion && prefersReducedMotion.matches ? 'auto' : 'smooth');

  const headings = collectOutlineHeadings(content);
  if (!headings.length) {
    outline.setAttribute('data-outline-state', 'hidden');
    if (layout) {
      layout.classList.add('article__layout--single');
    }
    if (progressHost instanceof HTMLElement) {
      progressHost.setAttribute('hidden', 'hidden');
    }
    if (outlineToggle instanceof HTMLButtonElement) {
      outlineToggle.setAttribute('hidden', 'hidden');
      outlineToggle.setAttribute('aria-expanded', 'false');
    }
    return;
  }

  const { outlineEntries, outlineHeader } = renderArticleOutline({
    outline,
    list,
    emptyHint,
    layout,
    headings,
  });

  applyOutlineAdaptiveSpacing(root, headings.length);

  const progress = createProgressFloating({
    progressHost,
    progressMeter,
    progressLabel,
    getScrollBehavior,
  });

  progress.applyProgress(0);
  progress.attachScrollToTop();

  const highlighter = createOutlineHighlighter({
    outline,
    outlineHeader,
    outlineEntries,
    getScrollBehavior,
  });

  attachOutlineFocusSync({
    outlineEntries,
    onFocus: (id) => {
      highlighter.applyActiveId(id, progress.getIsScrollingToTop());
    },
  });

  const depthThresholds = [25, 50, 75, 100];
  const reachedDepthThresholds = new Set();

  setupArticleOutlineSync({
    content,
    outlineEntries,
    progress,
    highlighter,
    onProgressChange: (value) => {
      const percent = Math.round(value * 100);
      depthThresholds.forEach((threshold) => {
        if (percent >= threshold && !reachedDepthThresholds.has(threshold)) {
          reachedDepthThresholds.add(threshold);
          emitAnalyticsEvent('scroll_depth', {
            depth: threshold,
          });
        }
      });
    },
  });

  setupArticleOutlineOverlay({
    outline,
    toggleButton: outlineToggle,
    closeButton: outlineClose,
    highlighter,
    headingCount: headings.length,
  });
};
