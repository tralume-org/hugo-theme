// 说明：控制顶栏的“下滑隐藏、上滑出现”行为。
// - 目标：向下阅读时减少遮挡；回看/上滑时快速找回导航入口。
// - 注意：顶栏采用 position: fixed + 占位元素（.app-header-spacer）实现，避免隐藏时出现空白占位。
export const setupHeaderVisibility = () => {
  const header = document.querySelector('[data-app-header]');
  const spacer = document.querySelector('[data-app-header-spacer]');
  if (!(header instanceof HTMLElement) || !(spacer instanceof HTMLElement)) {
    return;
  }

  const rootStyle = document.documentElement.style;
  rootStyle.setProperty('--app-header-offset', '0px');
  const isAutohideEnabled = header.dataset.appHeaderAutohide === 'true';

  // 说明：将顶栏真实高度写入 CSS 变量，供占位元素与锚点滚动偏移复用。
  let measuredHeaderHeight = 0;
  const syncHeaderHeight = () => {
    const height = header.getBoundingClientRect().height;
    if (!Number.isFinite(height) || height <= 0) {
      return;
    }

    const resolved = Math.ceil(height);
    measuredHeaderHeight = resolved;
    rootStyle.setProperty('--app-header-height', `${resolved}px`);
    // 说明：锚点跳转时为顶栏预留空间，避免标题被遮挡（额外 +1rem 用于留白）。
    rootStyle.setProperty('--app-header-scroll-offset', `${resolved}px`);
    rootStyle.setProperty('--app-header-scroll-offset-mobile', `${resolved}px`);
  };

  syncHeaderHeight();

  if (typeof ResizeObserver === 'function') {
    const resizeObserver = new ResizeObserver(() => {
      syncHeaderHeight();
    });
    resizeObserver.observe(header);
  } else {
    window.addEventListener('resize', syncHeaderHeight, { passive: true });
  }

  // 说明：仅在 posts/pages 页面启用“下滑隐藏，上滑出现”，其他页面保持固定顶栏常显。
  if (!isAutohideEnabled) {
    return;
  }

  let lastScrollY = window.scrollY;
  let rafId = 0;
  let headerOffset = 0;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const setHeaderOffset = (nextOffset) => {
    const resolvedHeight = measuredHeaderHeight || header.getBoundingClientRect().height || 0;
    const clamped = clamp(nextOffset, 0, resolvedHeight);
    headerOffset = clamped;
    // 说明：保留小数以获得更细腻的“跟随滚动”手感，避免四舍五入造成轻微跳动。
    rootStyle.setProperty('--app-header-offset', `${clamped.toFixed(2)}px`);
  };

  // 说明：当移动端折叠菜单/Pages 面板展开时，保持顶栏可见，避免用户找不到关闭入口。
  const shouldKeepVisible = () => {
    const navList = document.querySelector('[data-app-nav-list]');
    if (navList instanceof HTMLElement && navList.classList.contains('is-open')) {
      return true;
    }

    const pagesPanel = document.querySelector('[data-pages-menu-panel]');
    if (pagesPanel instanceof HTMLElement && pagesPanel.classList.contains('is-open')) {
      return true;
    }

    return false;
  };

  const handleScroll = () => {
    if (rafId) {
      return;
    }

    rafId = window.requestAnimationFrame(() => {
      rafId = 0;

      const currentY = window.scrollY;
      const delta = currentY - lastScrollY;
      lastScrollY = currentY;

      if (shouldKeepVisible()) {
        setHeaderOffset(0);
        return;
      }

      const resolvedHeight = measuredHeaderHeight || header.getBoundingClientRect().height || 0;
      if (resolvedHeight <= 0) {
        return;
      }

      // 说明：页面顶部区域采用“跟随滚动”的方式隐藏（效果类似未吸顶时 header 被内容滑走）。
      // - currentY <= headerHeight：顶栏位移与滚动距离一致，视觉上与普通文档流一致。
      if (currentY <= resolvedHeight) {
        setHeaderOffset(currentY);
        return;
      }

      // 说明：离开顶部区域后，按滚动方向增减位移：
      // - 下滑：位移增加（更隐藏）
      // - 上滑：位移减少（更出现）
      // 注意：followFactor < 1 会让显隐比滚动“更慢一些”，但仍与滚动速度线性同步。
      const followFactor = 0.85;

      // 说明：小幅滚动不触发，避免触控板细碎 delta 造成抖动。
      if (Math.abs(delta) < 2) {
        return;
      }

      setHeaderOffset(headerOffset + delta * followFactor);
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // 说明：发生锚点跳转（目录/内部链接）时强制展示顶栏，避免“跳转后导航入口消失”。
  window.addEventListener('hashchange', () => {
    setHeaderOffset(0);
  });

  // 说明：键盘导航进入顶栏时，确保顶栏可见（避免 tab 到不可见区域）。
  header.addEventListener('focusin', () => {
    setHeaderOffset(0);
  });
};
