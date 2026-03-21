import { emitAnalyticsEvent } from './analytics-events.js';

// 说明：控制顶栏 Pages 下拉面板的展开/收起。
// - 目标：点击 Pages 按钮时展示 pages 分区的页面列表；Esc/点击外部/点击链接时关闭。
// - 注意：该脚本仅在页面存在 data-pages-menu-toggle 与 data-pages-menu-panel 时生效，不依赖额外库。
export const setupPagesMenu = () => {
  const toggle = document.querySelector('[data-pages-menu-toggle]');
  const panel = document.querySelector('[data-pages-menu-panel]');
  if (!(toggle instanceof HTMLElement) || !(panel instanceof HTMLElement)) {
    return;
  }

  let isOpen = false;
  // 说明：仅在支持 hover 的设备上启用“悬浮展开”，避免触摸设备误触或造成难以收起。
  const supportsHover = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false;
  let hoverCloseTimer = 0;

  // 说明：清理延迟关闭的定时器，避免快速移入/移出时出现“闪关”。
  const clearHoverCloseTimer = () => {
    if (hoverCloseTimer) {
      window.clearTimeout(hoverCloseTimer);
      hoverCloseTimer = 0;
    }
  };

  // 说明：延迟关闭，给鼠标从按钮移动到面板的过程留出缓冲（两者间存在间隙）。
  const scheduleHoverClose = (delayMs = 160) => {
    clearHoverCloseTimer();
    hoverCloseTimer = window.setTimeout(() => {
      closePanel();
    }, delayMs);
  };

  // 说明：根据按钮位置动态定位面板，避免嵌套 backdrop-filter 导致的“无模糊”问题。
  const positionPanel = () => {
    const viewportPadding = 12;
    const offset = 10;
    const toggleRect = toggle.getBoundingClientRect();

    // 说明：限制面板最大宽度，避免在窄屏幕上溢出。
    panel.style.maxWidth = `calc(100vw - ${viewportPadding * 2}px)`;

    // 说明：面板在 CSS 中使用 opacity/visibility 控制显隐（始终可测量），可直接测量尺寸用于定位。
    const panelRect = panel.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const resolvedWidth = panelRect.width || Math.min(320, viewportWidth - viewportPadding * 2);
    const resolvedHeight = panelRect.height || 0;

    let top = toggleRect.bottom + offset;
    const canFlip = resolvedHeight > 0;
    if (canFlip && top + resolvedHeight + viewportPadding > viewportHeight) {
      top = toggleRect.top - resolvedHeight - offset;
    }
    top = Math.max(viewportPadding, Math.min(top, viewportHeight - resolvedHeight - viewportPadding));

    // 说明：弹层水平居中对齐触发按钮（以按钮中心点为基准），并在视口边缘进行夹取。
    let left = toggleRect.left + toggleRect.width / 2 - resolvedWidth / 2;
    left = Math.max(viewportPadding, Math.min(left, viewportWidth - resolvedWidth - viewportPadding));

    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
    // 说明：当弹层翻转到按钮上方时，从底部展开更自然；否则从顶部展开。
    panel.style.transformOrigin = top < toggleRect.top ? 'bottom center' : 'top center';
  };

  const closePanel = ({ focusToggle = false } = {}) => {
    if (!isOpen) {
      return;
    }

    clearHoverCloseTimer();
    isOpen = false;
    toggle.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    panel.classList.remove('is-open');
    // 说明：不清空定位，避免关闭动画过程中“跳回 (0,0)”的视觉闪动；下次打开时会重新定位。
    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('pointerdown', handlePointerDown);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('scroll', handleScroll, { capture: true });

    if (focusToggle) {
      window.requestAnimationFrame(() => {
        toggle.focus({ preventScroll: true });
      });
    }
  };

  const openPanel = () => {
    if (isOpen) {
      return;
    }

    isOpen = true;
    toggle.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
    panel.classList.add('is-open');
    positionPanel();
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('resize', handleResize);
    // 说明：页面滚动时关闭面板，避免 header 离开视口后弹层悬空。
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    emitAnalyticsEvent('open_pages_menu', {
      position: 'header',
    });
  };

  // 说明：Esc 键关闭面板并返回焦点。
  const handleKeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closePanel({ focusToggle: true });
    }
  };

  // 说明：点击面板外部时关闭。
  const handlePointerDown = (event) => {
    const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
    const inToggle = path.includes(toggle) || toggle.contains(event.target);
    const inPanel = path.includes(panel) || panel.contains(event.target);
    if (!inToggle && !inPanel) {
      closePanel();
    }
  };

  // 说明：视口尺寸变化时重新定位，保证弹层始终贴近触发按钮。
  const handleResize = () => {
    if (isOpen) {
      positionPanel();
    }
  };

  // 说明：滚动时直接关闭，避免复杂的跟随计算。
  const handleScroll = () => {
    closePanel();
  };

  // 说明：仅对 button 触发器启用“点击展开/收起”；若触发器是链接则保留默认导航行为。
  if (toggle instanceof HTMLButtonElement) {
    toggle.addEventListener('click', (event) => {
      // 说明：桌面端 hover 模式下，点击保持展开，避免“悬浮打开但点击立刻关闭”的违和感。
      if (supportsHover && isOpen) {
        event.preventDefault();
        return;
      }

      if (isOpen) {
        closePanel();
        return;
      }

      openPanel();
    });
  }

  if (supportsHover) {
    // 说明：鼠标悬浮自动展开；离开按钮/面板后延迟收起，避免跨越间隙时误关。
    toggle.addEventListener('pointerenter', () => {
      clearHoverCloseTimer();
      openPanel();
    });
    toggle.addEventListener('pointerleave', () => {
      scheduleHoverClose();
    });
    panel.addEventListener('pointerenter', () => {
      clearHoverCloseTimer();
    });
    panel.addEventListener('pointerleave', () => {
      scheduleHoverClose();
    });
  }

  // 说明：点击链接后关闭面板，避免遮挡正文。
  panel.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.closest('a')) {
      closePanel();
    }
  });
};
