// 说明：文章列表滚动模式设置（分页 / 无限滚动），并同步到 localStorage。
export const setupPostsScrollMode = (panel) => {
  const controls = panel.querySelector('[data-posts-scroll-controls]');
  if (!(controls instanceof HTMLElement)) {
    return;
  }

  const storageKey = 'tralume-posts-scroll-mode';
  const supportedModes = new Set(['pagination', 'infinite']);
  const buttons = Array.from(controls.querySelectorAll('[data-posts-scroll-option]'));
  if (!buttons.length) {
    return;
  }

  const readStoredMode = () => {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  };

  const persistMode = (mode) => {
    try {
      window.localStorage.setItem(storageKey, mode);
    } catch (error) {
      // 说明：忽略存储失败，避免受限环境抛错影响其余设置项。
    }
  };

  const notifyModeChanged = (mode) => {
    window.dispatchEvent(new CustomEvent('tralume:posts-scroll-mode-change', {
      detail: { mode }
    }));
  };

  const updateButtons = (activeMode) => {
    buttons.forEach((button) => {
      const mode = button.getAttribute('data-posts-scroll-option');
      const isActive = mode === activeMode;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  let currentMode = 'pagination';

  const applyMode = (mode, { persist = true, notify = true } = {}) => {
    const normalizedMode = supportedModes.has(mode) ? mode : 'pagination';
    currentMode = normalizedMode;
    updateButtons(normalizedMode);
    if (persist) {
      persistMode(normalizedMode);
    }
    if (notify) {
      notifyModeChanged(normalizedMode);
    }
  };

  const initialMode = readStoredMode();
  applyMode(initialMode, { persist: false, notify: false });

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.getAttribute('data-posts-scroll-option');
      if (!mode || mode === currentMode) {
        return;
      }
      applyMode(mode, { persist: true, notify: true });
    });
  });
};
