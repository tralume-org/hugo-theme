// 说明：控制顶栏 Pages 下拉面板的展开/收起。
// - 目标：点击 Pages 按钮时展示 pages 分区的页面列表；Esc/点击外部/点击链接时关闭。
// - 注意：该脚本仅在页面存在 data-pages-menu-toggle 与 data-pages-menu-panel 时生效，不依赖额外库。
export const setupPagesMenu = () => {
  const toggle = document.querySelector('[data-pages-menu-toggle]');
  const panel = document.querySelector('[data-pages-menu-panel]');
  if (!(toggle instanceof HTMLButtonElement) || !(panel instanceof HTMLElement)) {
    return;
  }

  let isOpen = false;

  // 说明：根据按钮位置动态定位面板，避免嵌套 backdrop-filter 导致的“无模糊”问题。
  const positionPanel = () => {
    const viewportPadding = 12;
    const offset = 10;
    const toggleRect = toggle.getBoundingClientRect();

    // 说明：限制面板最大宽度，避免在窄屏幕上溢出。
    panel.style.maxWidth = `calc(100vw - ${viewportPadding * 2}px)`;

    // 说明：面板已在展开态（display: block），可直接测量尺寸用于定位。
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
  };

  const closePanel = ({ focusToggle = false } = {}) => {
    if (!isOpen) {
      return;
    }

    isOpen = false;
    toggle.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    panel.classList.remove('is-open');
    panel.style.top = '';
    panel.style.left = '';
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

  // 说明：按钮点击时在展开与收起之间切换。
  toggle.addEventListener('click', () => {
    if (isOpen) {
      closePanel();
    } else {
      openPanel();
    }
  });

  // 说明：点击链接后关闭面板，避免遮挡正文。
  panel.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.closest('a')) {
      closePanel();
    }
  });
};
