// 说明：滚动同步层，负责：重算标题位置、更新进度、驱动大纲高亮，并进行 rAF 节流。
// 注意：该模块只关心“何时更新”，不负责渲染 DOM（由 outline-view 与 progress-floating 负责）。

import { clampNumber } from './utils.js';

export const setupArticleOutlineSync = ({ content, outlineEntries, progress, highlighter }) => {
  const metrics = {
    contentTop: 0,
    contentBottom: 0,
    totalScrollable: 1,
    headingOffsets: [],
  };

  // 说明：重新计算内容高度与各标题的绝对位置，便于滚动时高亮准确。
  const recalcMetrics = () => {
    const contentRect = content.getBoundingClientRect();
    metrics.contentTop = contentRect.top + window.scrollY;
    metrics.contentBottom = metrics.contentTop + content.scrollHeight;
    metrics.headingOffsets = outlineEntries.map((entry) => {
      const rect = entry.element.getBoundingClientRect();
      return rect.top + window.scrollY;
    });

    const rawScrollable = metrics.contentBottom - metrics.contentTop - window.innerHeight;
    metrics.totalScrollable = rawScrollable > 0 ? rawScrollable : 1;
  };

  // 说明：根据滚动位置更新进度条与无障碍信息。
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const reachedBottom = scrollTop + window.innerHeight >= metrics.contentBottom - 1;
    let progressValue = 0;

    if (metrics.contentBottom - metrics.contentTop <= window.innerHeight) {
      progressValue = scrollTop >= metrics.contentTop ? 1 : 0;
    } else if (reachedBottom) {
      progressValue = 1;
    } else {
      progressValue = clampNumber((scrollTop - metrics.contentTop) / metrics.totalScrollable, 0, 1);
    }

    progress.applyProgress(progressValue);
    progress.updateVisibilityForScrollTop(scrollTop);
  };

  // 说明：定位当前视口内最接近的标题，驱动大纲高亮。
  const updateActiveHeading = () => {
    if (!outlineEntries.length) {
      return;
    }

    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;
    const anchorLine = scrollTop + viewportHeight * 0.3;
    const offsets = metrics.headingOffsets;

    let nextActiveId = outlineEntries[0].id;

    for (let index = 0; index < offsets.length; index += 1) {
      if (anchorLine >= offsets[index] - 1) {
        nextActiveId = outlineEntries[index].id;
      } else {
        break;
      }
    }

    if (scrollTop + viewportHeight >= metrics.contentBottom - 1) {
      nextActiveId = outlineEntries[outlineEntries.length - 1].id;
    }

    highlighter.applyActiveId(nextActiveId, progress.getIsScrollingToTop());
  };

  let ticking = false;

  // 说明：滚动与进度更新节流，避免频繁计算。
  const handleScroll = () => {
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(() => {
      updateProgress();
      updateActiveHeading();
      ticking = false;
    });
  };

  const syncLayouts = () => {
    recalcMetrics();
    updateProgress();
    updateActiveHeading();
  };

  syncLayouts();

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', () => {
    syncLayouts();
  });
  window.addEventListener('load', () => {
    syncLayouts();
  });

  const mediaNodes = Array.from(content.querySelectorAll('img, video, iframe'));
  mediaNodes.forEach((node) => {
    node.addEventListener('load', syncLayouts, { once: true });
  });
};

