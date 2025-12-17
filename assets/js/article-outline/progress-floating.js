// 说明：阅读进度浮窗（百分比 + 环形进度）与“点击回顶”交互。
// 注意：回顶动画会影响大纲的自动滚动可见性策略，因此需暴露 `getIsScrollingToTop`。

import { clampNumber } from './utils.js';

const getScrollRoot = () => {
  const scrollRoot = document.scrollingElement || document.documentElement;
  return scrollRoot instanceof HTMLElement ? scrollRoot : null;
};

export const createProgressFloating = ({ progressHost, progressMeter, progressLabel, getScrollBehavior }) => {
  let progressCircumference = 1;
  if (progressMeter instanceof SVGCircleElement) {
    const radius = progressMeter.r.baseVal.value || 16;
    progressCircumference = radius > 0 ? 2 * Math.PI * radius : 1;
    const dashArray = `${progressCircumference} ${progressCircumference}`;
    progressMeter.style.strokeDasharray = dashArray;
    progressMeter.style.strokeDashoffset = `${progressCircumference}`;
  }

  const applyProgress = (value) => {
    const safeValue = clampNumber(value, 0, 1);
    const percent = Math.round(safeValue * 100);
    progressLabel.textContent = `${percent}%`;
    if (progressMeter instanceof SVGCircleElement) {
      const offset = progressCircumference * (1 - safeValue);
      progressMeter.style.strokeDashoffset = `${offset}`;
    }

    if (progressHost instanceof HTMLElement) {
      progressHost.setAttribute('aria-valuenow', String(percent));
    }
  };

  let isScrollingToTop = false;
  const getIsScrollingToTop = () => isScrollingToTop;

  const scrollToPageTop = () => {
    const scrollRoot = getScrollRoot();
    if (!scrollRoot) {
      window.scrollTo(0, 0);
      return;
    }

    const behavior = getScrollBehavior();
    if (behavior === 'auto') {
      isScrollingToTop = false;
      scrollRoot.scrollTop = 0;
      window.scrollTo(0, 0);
      return;
    }

    // 说明：使用脚本驱动的平滑回顶，避免部分浏览器在长文场景下 `window.scrollTo({ behavior: "smooth" })` 被中途打断。
    const startTop = scrollRoot.scrollTop;
    if (startTop <= 1) {
      return;
    }

    isScrollingToTop = true;
    const durationMs = clampNumber(280 + startTop / 6, 320, 1200);
    const startTime =
      typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const t = clampNumber(elapsed / durationMs, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const nextTop = Math.round(startTop * (1 - eased));

      scrollRoot.scrollTop = nextTop;

      if (nextTop <= 1 || t >= 1) {
        scrollRoot.scrollTop = 0;
        isScrollingToTop = false;
        return;
      }

      window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  };

  // 说明：仅在真正回到页面顶部后再隐藏进度按钮，避免长文回顶动画中断。
  const updateVisibilityForScrollTop = (scrollTop) => {
    if (!(progressHost instanceof HTMLElement)) {
      return;
    }
    if (scrollTop <= 1) {
      progressHost.setAttribute('hidden', 'hidden');
    } else {
      progressHost.removeAttribute('hidden');
    }
  };

  const attachScrollToTop = () => {
    if (!(progressHost instanceof HTMLElement)) {
      return;
    }
    progressHost.addEventListener('click', () => {
      scrollToPageTop();
    });
  };

  return {
    applyProgress,
    updateVisibilityForScrollTop,
    attachScrollToTop,
    getIsScrollingToTop,
  };
};

