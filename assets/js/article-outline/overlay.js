// 说明：移动端“全屏文章大纲”面板交互（打开/关闭、焦点管理与滚动锁定）。
// - 打开方式：点击右下角的大纲图标按钮。
// - 关闭方式：点击关闭按钮、按 Esc、或点击大纲链接后自动关闭。
// - 桌面端：保持侧栏大纲常驻，不渲染全屏交互（通过媒体查询判定）。

export const setupArticleOutlineOverlay = ({ outline, toggleButton, closeButton, highlighter }) => {
  const root = document.documentElement;
  if (!root || !(outline instanceof HTMLElement) || !(toggleButton instanceof HTMLButtonElement)) {
    return;
  }

  const desktopQuery = typeof window.matchMedia === 'function' ? window.matchMedia('(min-width: 64rem)') : null;

  let isOpen = false;

  const setToggleHidden = (hidden) => {
    if (hidden) {
      toggleButton.setAttribute('hidden', 'hidden');
    } else {
      toggleButton.removeAttribute('hidden');
    }
  };

  // 说明：仅在小屏模式下把大纲当作“模态对话框”处理；桌面端保持普通侧栏可交互。
  const setOutlineModalState = (open) => {
    toggleButton.setAttribute('aria-expanded', open ? 'true' : 'false');

    if (open) {
      outline.setAttribute('role', 'dialog');
      outline.setAttribute('aria-modal', 'true');
      outline.setAttribute('aria-hidden', 'false');
      outline.removeAttribute('inert');
      root.setAttribute('data-article-outline-open', 'true');
      outline.classList.add('is-open');
      return;
    }

    outline.removeAttribute('role');
    outline.removeAttribute('aria-modal');
    outline.setAttribute('aria-hidden', 'true');
    outline.setAttribute('inert', '');
    root.removeAttribute('data-article-outline-open');
    outline.classList.remove('is-open');
  };

  const handleKeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeOverlay();
    }
  };

  const closeOverlay = ({ focusToggle = true } = {}) => {
    if (!isOpen) return;

    isOpen = false;
    setOutlineModalState(false);
    document.removeEventListener('keydown', handleKeydown);

    if (focusToggle) {
      window.requestAnimationFrame(() => {
        toggleButton.focus({ preventScroll: true });
      });
    }
  };

  const openOverlay = () => {
    if (desktopQuery?.matches || isOpen) {
      return;
    }

    isOpen = true;
    setOutlineModalState(true);

    // 说明：打开全屏大纲后，把当前章节滚动到可见位置，避免长文场景下需要手动查找。
    if (highlighter && typeof highlighter.getActiveId === 'function' && typeof highlighter.applyActiveId === 'function') {
      const activeId = highlighter.getActiveId();
      if (activeId) {
        highlighter.applyActiveId(activeId);
      }
    }

    window.requestAnimationFrame(() => {
      if (closeButton instanceof HTMLElement) {
        closeButton.focus({ preventScroll: true });
      }
    });

    document.addEventListener('keydown', handleKeydown);
  };

  const syncViewportState = () => {
    // 说明：桌面端（>= 64rem）不展示入口按钮，同时清理模态属性避免影响侧栏可访问性。
    if (desktopQuery?.matches) {
      isOpen = false;
      setToggleHidden(true);
      root.removeAttribute('data-article-outline-open');
      outline.classList.remove('is-open');
      outline.removeAttribute('role');
      outline.removeAttribute('aria-modal');
      outline.removeAttribute('aria-hidden');
      outline.removeAttribute('inert');
      toggleButton.setAttribute('aria-expanded', 'false');
      document.removeEventListener('keydown', handleKeydown);
      return;
    }

    setToggleHidden(false);
    setOutlineModalState(isOpen);
  };

  syncViewportState();

  toggleButton.addEventListener('click', () => {
    if (isOpen) {
      closeOverlay();
      return;
    }
    openOverlay();
  });

  if (closeButton instanceof HTMLButtonElement) {
    closeButton.addEventListener('click', () => {
      closeOverlay();
    });
  }

  // 说明：点击大纲链接后自动关闭，避免覆盖正文内容。
  outline.addEventListener('click', (event) => {
    if (!isOpen) return;

    const target = event.target;
    if (target instanceof HTMLElement && target.closest('a')) {
      window.requestAnimationFrame(() => {
        closeOverlay({ focusToggle: false });
      });
    }
  });

  // 说明：切回桌面端时强制关闭，避免状态残留。
  if (desktopQuery) {
    desktopQuery.addEventListener('change', () => {
      syncViewportState();
    });
  }
};

