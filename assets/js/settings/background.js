// 说明：自定义背景图与默认色板逻辑，支持输入 URL、持久化与按钮状态更新。
export const setupBackgroundControl = (panel, root) => {
  const backgroundInput = panel.querySelector('[data-background-input]');
  const backgroundApplyButton = panel.querySelector('[data-background-apply]');
  const backgroundResetButton = panel.querySelector('[data-background-reset]');
  const backgroundStorageKey = 'tralume-custom-background-url';
  let hasCustomBackground = false;

  // 说明：壁纸智能取色的默认调色板，确保亮/暗模式拥有安全回退。
  const wallpaperColorFallback = {
    lightPrimary: '#1f2329',
    lightOnPrimary: '#f7f8fb',
    lightPrimaryContainer: '#f6f8fc',
    lightOnPrimaryContainer: '#1c2026',
    darkPrimary: '#dfe3ea',
    darkOnPrimary: '#101215',
    darkPrimaryContainer: '#2c3038',
    darkOnPrimaryContainer: '#e7eaf2',
  };

  // 说明：加载时立即写入默认色板，避免历史缓存影响。
  const applyWallpaperPalette = () => {
    root.style.setProperty('--app-dynamic-primary-light', wallpaperColorFallback.lightPrimary);
    root.style.setProperty('--app-dynamic-on-primary-light', wallpaperColorFallback.lightOnPrimary);
    root.style.setProperty(
      '--app-dynamic-primary-container-light',
      wallpaperColorFallback.lightPrimaryContainer,
    );
    root.style.setProperty(
      '--app-dynamic-on-primary-container-light',
      wallpaperColorFallback.lightOnPrimaryContainer,
    );
    root.style.setProperty('--app-dynamic-primary-dark', wallpaperColorFallback.darkPrimary);
    root.style.setProperty('--app-dynamic-on-primary-dark', wallpaperColorFallback.darkOnPrimary);
    root.style.setProperty(
      '--app-dynamic-primary-container-dark',
      wallpaperColorFallback.darkPrimaryContainer,
    );
    root.style.setProperty(
      '--app-dynamic-on-primary-container-dark',
      wallpaperColorFallback.darkOnPrimaryContainer,
    );
  };

  applyWallpaperPalette();

  const readBackgroundInputValue = () => {
    if (backgroundInput instanceof HTMLInputElement) {
      return backgroundInput.value.trim();
    }
    return '';
  };

  const updateBackgroundButtons = () => {
    const hasTypedValue = readBackgroundInputValue().length > 0;
    if (backgroundApplyButton instanceof HTMLButtonElement) {
      backgroundApplyButton.disabled = !(hasTypedValue || hasCustomBackground);
    }
    if (backgroundResetButton instanceof HTMLButtonElement) {
      backgroundResetButton.disabled = !hasCustomBackground;
    }
  };

  const persistBackgroundValue = (value) => {
    try {
      if (value) {
        window.localStorage.setItem(backgroundStorageKey, value);
      } else {
        window.localStorage.removeItem(backgroundStorageKey);
      }
    } catch (error) {
      // 说明：忽略本地存储失败，避免在隐身模式报错。
    }
  };

  const readStoredBackgroundImage = () => {
    try {
      return window.localStorage.getItem(backgroundStorageKey);
    } catch (error) {
      return null;
    }
  };

  const applyBackgroundImage = (rawUrl, shouldPersist = true) => {
    const trimmed = typeof rawUrl === 'string' ? rawUrl.trim() : '';
    if (!trimmed) {
      root.style.setProperty('--app-custom-background-image', 'none');
      root.style.setProperty('--app-custom-background-opacity', '0');
      hasCustomBackground = false;
      if (shouldPersist) {
        persistBackgroundValue('');
      }
      updateBackgroundButtons();
      return;
    }

    const sanitized = JSON.stringify(trimmed);
    root.style.setProperty('--app-custom-background-image', `url(${sanitized})`);
    root.style.setProperty('--app-custom-background-opacity', '1');
    hasCustomBackground = true;
    if (shouldPersist) {
      persistBackgroundValue(trimmed);
    }
    updateBackgroundButtons();
  };

  const initialBackgroundImage = readStoredBackgroundImage() || '';
  if (backgroundInput instanceof HTMLInputElement) {
    backgroundInput.value = initialBackgroundImage;
  }
  applyBackgroundImage(initialBackgroundImage, false);
  updateBackgroundButtons();

  const handleBackgroundApply = () => {
    const nextValue = readBackgroundInputValue();
    applyBackgroundImage(nextValue, true);
  };

  if (backgroundApplyButton instanceof HTMLButtonElement) {
    backgroundApplyButton.addEventListener('click', handleBackgroundApply);
  }

  if (backgroundInput instanceof HTMLInputElement) {
    backgroundInput.addEventListener('input', () => {
      updateBackgroundButtons();
    });
    backgroundInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleBackgroundApply();
      }
    });
  }

  if (backgroundResetButton instanceof HTMLButtonElement) {
    backgroundResetButton.addEventListener('click', () => {
      if (backgroundInput instanceof HTMLInputElement) {
        backgroundInput.value = '';
      }
      applyBackgroundImage('', true);
    });
  }
};
