// 说明：控制主导航在小屏幕下的折叠/展开行为，保持键盘与触控可用性。
export const setupAppNavigation = () => {
  const navRoot = document.querySelector('[data-app-nav]');
  if (!navRoot) {
    return;
  }

  const toggle = navRoot.querySelector('[data-app-nav-toggle]');
  const list = navRoot.querySelector('[data-app-nav-list]');
  if (!toggle || !list) {
    return;
  }

  const desktopQuery = window.matchMedia('(min-width: 48rem)');
  let isOpen = false;

  // 说明：挂载 data-nav-ready 属性以便样式只在脚本完成初始化后生效。
  navRoot.setAttribute('data-nav-ready', 'true');

  const closeNav = ({ focusToggle = false } = {}) => {
    if (isOpen) {
      isOpen = false;
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('pointerdown', handlePointerDown);
    }

    list.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');

    if (desktopQuery.matches) {
      list.setAttribute('aria-hidden', 'false');
    } else {
      list.setAttribute('aria-hidden', 'true');
    }

    if (focusToggle) {
      window.requestAnimationFrame(() => {
        toggle.focus({ preventScroll: true });
      });
    }
  };

  const openNav = () => {
    if (desktopQuery.matches || isOpen) {
      return;
    }

    isOpen = true;
    list.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    list.setAttribute('aria-hidden', 'false');

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('pointerdown', handlePointerDown);
  };

  // 说明：Esc 键关闭折叠菜单，并将焦点返回到触发按钮。
  const handleKeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeNav({ focusToggle: true });
    }
  };

  // 说明：点击导航外部区域时自动收起菜单。
  const handlePointerDown = (event) => {
    const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
    if (!path.includes(navRoot) && !navRoot.contains(event.target)) {
      closeNav();
    }
  };

  // 说明：按钮点击时在展开与收起之间切换。
  toggle.addEventListener('click', () => {
    if (isOpen) {
      closeNav();
    } else {
      openNav();
    }
  });

  // 说明：点击导航链接后自动收起，避免遮挡内容。
  list.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.matches('a')) {
      closeNav();
    }
  });

  // 说明：屏幕尺寸变化时同步适配状态。
  const handleMediaChange = (event) => {
    if (event.matches) {
      closeNav();
      list.setAttribute('aria-hidden', 'false');
    } else if (!isOpen) {
      list.setAttribute('aria-hidden', 'true');
    }
  };

  desktopQuery.addEventListener('change', handleMediaChange);

  if (desktopQuery.matches) {
    list.setAttribute('aria-hidden', 'false');
  } else {
    list.setAttribute('aria-hidden', 'true');
  }
};
