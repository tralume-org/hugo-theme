import { emitAnalyticsEvent } from '../analytics-events.js';

// 说明：管理设置面板的开关、聚焦与语言切换，提供基础上下文。
export const setupPanelShell = (panel) => {
  const languageStorageKey = 'tralume-language';
  const root = document.documentElement;
  const toggleButton = panel.querySelector('[data-settings-toggle]');
  const surface = panel.querySelector('[data-settings-surface]');
  const closeButton = panel.querySelector('[data-settings-close]');

  if (!toggleButton || !surface || !closeButton) {
    return null;
  }

  let isOpen = false;

  const setSurfaceHidden = (hidden) => {
    surface.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    if (hidden) {
      surface.setAttribute('inert', '');
    } else {
      surface.removeAttribute('inert');
    }
  };

  setSurfaceHidden(surface.getAttribute('aria-hidden') !== 'false');

  // 说明：关闭面板后清理事件并归还焦点。
  const closePanel = () => {
    if (!isOpen) return;

    isOpen = false;
    panel.classList.remove('is-open');
    toggleButton.setAttribute('aria-expanded', 'false');
    setSurfaceHidden(true);

    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('pointerdown', handlePointerDown);

    window.requestAnimationFrame(() => {
      toggleButton.focus({ preventScroll: true });
    });
  };

  // 说明：Esc 关闭，便于键盘操作。
  const handleKeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closePanel();
    }
  };

  // 说明：点击卡片外区域自动关闭。
  const handlePointerDown = (event) => {
    const path = event.composedPath ? event.composedPath() : [event.target];
    if (!path.includes(panel) && !panel.contains(event.target)) {
      closePanel();
    }
  };

  // 说明：打开面板时聚焦卡片，挂载关闭事件。
  const openPanel = () => {
    if (isOpen) return;

    isOpen = true;
    panel.classList.add('is-open');
    toggleButton.setAttribute('aria-expanded', 'true');
    setSurfaceHidden(false);
    emitAnalyticsEvent('open_settings_panel');

    window.requestAnimationFrame(() => {
      if (closeButton instanceof HTMLElement) {
        closeButton.focus({ preventScroll: true });
      }
    });

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('pointerdown', handlePointerDown);
  };

  toggleButton.addEventListener('click', openPanel);
  closeButton.addEventListener('click', closePanel);

  // 说明：语言切换下拉框，选中后立即跳转到目标语言页面。
  const languageSelect = panel.querySelector('[data-language-select]');
  if (languageSelect instanceof HTMLSelectElement) {
    languageSelect.addEventListener('change', (event) => {
      const target = event.target;
      if (target instanceof HTMLSelectElement) {
        const destination = target.value;
        const selectedOption = target.selectedOptions[0];
        const languageCode = selectedOption?.dataset.languageCode || '';
        if (languageCode) {
          try {
            window.localStorage.setItem(languageStorageKey, languageCode);
          } catch (error) {
            // 说明：本地存储不可用时忽略，仍允许继续跳转。
          }
        }
        if (destination) {
          window.location.href = destination;
        }
      }
    });
  }

  return { root, panel, closePanel };
};
