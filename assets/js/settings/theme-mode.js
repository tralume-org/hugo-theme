// 说明：主题模式切换（自动/浅色/深色），支持本地存储持久化。
export const setupThemeMode = (panel, root) => {
  const modeButtons = Array.from(panel.querySelectorAll('[data-theme-mode-option]'));
  if (!modeButtons.length) {
    return;
  }

  const modeStorageKey = 'tralume-theme-mode';
  const supportedModes = new Set(['auto', 'light', 'dark']);

  const updateModeState = (activeId) => {
    modeButtons.forEach((button) => {
      const modeId = button.getAttribute('data-theme-mode-option');
      const isActive = Boolean(modeId && modeId === activeId);
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const applyThemeMode = (modeId, shouldPersist = true) => {
    const finalMode = supportedModes.has(modeId) ? modeId : 'auto';
    if (finalMode === 'auto') {
      root.removeAttribute('data-theme-mode');
    } else {
      root.setAttribute('data-theme-mode', finalMode);
    }
    updateModeState(finalMode);

    if (shouldPersist) {
      try {
        window.localStorage.setItem(modeStorageKey, finalMode);
      } catch (error) {
        // 说明：忽略存储异常，保障功能在受限环境继续运行。
      }
    }
  };

  const readStoredThemeMode = () => {
    try {
      return window.localStorage.getItem(modeStorageKey);
    } catch (error) {
      return null;
    }
  };

  const initialThemeMode = readStoredThemeMode() || root.getAttribute('data-theme-mode') || 'auto';
  applyThemeMode(initialThemeMode, false);

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const modeId = button.getAttribute('data-theme-mode-option');
      applyThemeMode(modeId, true);
    });
  });
};
