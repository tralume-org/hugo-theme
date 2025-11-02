// 说明：封装设置面板交互逻辑，确保按钮与卡片之间状态同步。
const setupSettingsPanel = () => {
  const panel = document.querySelector('[data-component="settings-panel"]');
  if (!panel) {
    return;
  }

  const toggleButton = panel.querySelector('[data-settings-toggle]');
  const surface = panel.querySelector('[data-settings-surface]');
  const closeButton = panel.querySelector('[data-settings-close]');

  if (!toggleButton || !surface || !closeButton) {
    return;
  }

  let isOpen = false;

  // 说明：打开面板后允许 Esc 和点击外部关闭，聚焦卡片内容以支持键盘操作。
  const openPanel = () => {
    if (isOpen) return;

    isOpen = true;
    panel.classList.add('is-open');
    toggleButton.setAttribute('aria-expanded', 'true');
    surface.setAttribute('aria-hidden', 'false');

    window.requestAnimationFrame(() => {
      if (closeButton instanceof HTMLElement) {
        closeButton.focus({ preventScroll: true });
      } else {
        surface.focus({ preventScroll: true });
      }
    });

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('pointerdown', handlePointerDown);
  };

  // 说明：关闭面板后撤销事件监听，并将焦点归还触发按钮。
  const closePanel = () => {
    if (!isOpen) return;

    isOpen = false;
    panel.classList.remove('is-open');
    toggleButton.setAttribute('aria-expanded', 'false');
    surface.setAttribute('aria-hidden', 'true');

    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('pointerdown', handlePointerDown);

    window.requestAnimationFrame(() => {
      toggleButton.focus({ preventScroll: true });
    });
  };

  // 说明：监听 Esc 键关闭卡片。
  const handleKeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closePanel();
    }
  };

  // 说明：点击卡片外任意区域时关闭。
  const handlePointerDown = (event) => {
    const path = event.composedPath ? event.composedPath() : [event.target];
    if (!path.includes(panel) && !panel.contains(event.target)) {
      closePanel();
    }
  };

  toggleButton.addEventListener('click', openPanel);
  closeButton.addEventListener('click', closePanel);

  // 说明：语言下拉选单切换后立即跳转至目标页面。
  const languageSelect = panel.querySelector('[data-language-select]');
  if (languageSelect instanceof HTMLSelectElement) {
    languageSelect.addEventListener('change', (event) => {
      const target = event.target;
      if (target instanceof HTMLSelectElement) {
        const destination = target.value;
        if (destination) {
          window.location.href = destination;
        }
      }
    });
  }

  // 说明：主题颜色按钮组，切换后更新根节点属性并持久化本地偏好。
  const colorSwatches = Array.from(panel.querySelectorAll('[data-color-option]'));
  const colorStorageKey = 'tralume-theme-color';
  const root = document.documentElement;

  const updateSwatchState = (activeId) => {
    colorSwatches.forEach((swatch) => {
      const swatchId = swatch.getAttribute('data-color-option');
      const isActive = Boolean(swatchId && swatchId === activeId);
      swatch.classList.toggle('is-active', isActive);
      swatch.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const applyThemeColor = (colorId, shouldPersist = true) => {
    if (!colorId) {
      return;
    }
    root.setAttribute('data-theme-color', colorId);
    updateSwatchState(colorId);
    if (shouldPersist) {
      try {
        window.localStorage.setItem(colorStorageKey, colorId);
      } catch (error) {
        // 说明：忽略存储失败，避免在受限环境下抛出异常。
      }
    }
  };

  const readStoredThemeColor = () => {
    try {
      return window.localStorage.getItem(colorStorageKey);
    } catch (error) {
      return null;
    }
  };

  const initialThemeColor = readStoredThemeColor() || root.getAttribute('data-theme-color') || 'indigo';
  applyThemeColor(initialThemeColor, false);

  colorSwatches.forEach((swatch) => {
    swatch.addEventListener('click', () => {
      const colorId = swatch.getAttribute('data-color-option');
      if (colorId) {
        applyThemeColor(colorId, true);
      }
    });
  });

  // 说明：主题模式按钮组，允许在自动、浅色与深色之间切换。
  const modeButtons = Array.from(panel.querySelectorAll('[data-theme-mode-option]'));
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupSettingsPanel);
} else {
  setupSettingsPanel();
}
