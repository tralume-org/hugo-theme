import { emitAnalyticsEvent } from './analytics-events.js';

// 说明：控制移动端顶栏右侧的“全屏菜单”。
// - 目标：移动端顶栏仅保留站点名称 + 菜单按钮，其余导航项集中到全屏面板中展示。
// - 交互：点击按钮展开；Esc/点击关闭按钮/点击链接后自动关闭；打开时锁定页面滚动。
export const setupMobileMenu = () => {
  const root = document.documentElement;
  const toggle = document.querySelector('[data-mobile-menu-toggle]');
  const panel = document.querySelector('[data-mobile-menu-panel]');
  const closeButton = panel?.querySelector?.('[data-mobile-menu-close]');

  if (!(toggle instanceof HTMLButtonElement) || !(panel instanceof HTMLElement) || !(closeButton instanceof HTMLButtonElement)) {
    return;
  }

  const desktopQuery = window.matchMedia?.('(min-width: 48rem)');
  let isOpen = false;

  const setPanelHidden = (hidden) => {
    panel.setAttribute('aria-hidden', hidden ? 'true' : 'false');

    if (hidden) {
      panel.setAttribute('inert', '');
      root.removeAttribute('data-mobile-menu-open');
    } else {
      panel.removeAttribute('inert');
      root.setAttribute('data-mobile-menu-open', 'true');
    }
  };

  setPanelHidden(panel.getAttribute('aria-hidden') !== 'false');

  const closeMenu = ({ focusToggle = true, shouldTrack = false } = {}) => {
    if (!isOpen) return;

    isOpen = false;
    panel.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    setPanelHidden(true);
    document.removeEventListener('keydown', handleKeydown);

    if (shouldTrack) {
      emitAnalyticsEvent('close_mobile_menu', {
        position: 'header',
      });
    }

    if (focusToggle) {
      window.requestAnimationFrame(() => {
        toggle.focus({ preventScroll: true });
      });
    }
  };

  const openMenu = () => {
    if (desktopQuery?.matches || isOpen) {
      return;
    }

    isOpen = true;
    panel.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    setPanelHidden(false);
    panel.scrollTop = 0;

    window.requestAnimationFrame(() => {
      closeButton.focus({ preventScroll: true });
    });

    document.addEventListener('keydown', handleKeydown);
    emitAnalyticsEvent('open_mobile_menu', {
      position: 'header',
    });
  };

  // 说明：Esc 键关闭菜单，并将焦点还给触发按钮。
  const handleKeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu({ shouldTrack: true });
    }
  };

  // 说明：按钮点击时在展开与收起之间切换。
  toggle.addEventListener('click', () => {
    if (isOpen) {
      closeMenu({ shouldTrack: true });
      return;
    }

    openMenu();
  });

  // 说明：点击关闭按钮收起菜单。
  closeButton.addEventListener('click', () => {
    closeMenu({ shouldTrack: true });
  });

  // 说明：点击菜单链接后自动收起，避免遮挡页面内容。
  panel.addEventListener('click', (event) => {
    if (!isOpen) return;

    const target = event.target;
    if (target instanceof HTMLElement && target.closest('a')) {
      closeMenu({ focusToggle: false, shouldTrack: true });
    }
  });

  // 说明：切回桌面端（>= 48rem）时强制关闭，避免状态残留。
  if (desktopQuery) {
    desktopQuery.addEventListener('change', (event) => {
      if (event.matches) {
        closeMenu({ focusToggle: false });
      }
    });
  }
};
