// 说明：自定义背景图与默认色板逻辑，支持输入 URL、持久化与按钮状态更新。
import { createUrlBackgroundProvider } from './background/providers/url.js';

export const setupBackgroundControl = (panel, root) => {
  const backgroundInput = panel.querySelector('[data-background-input]');
  const backgroundApplyButton = panel.querySelector('[data-background-apply]');
  const backgroundResetButton = panel.querySelector('[data-background-reset]');
  const backgroundBlurRange = panel.querySelector('[data-background-blur-range]');
  const backgroundBlurLabel = panel.querySelector('[data-background-blur-label]');
  const backgroundBlurStorageKey = 'tralume-custom-background-blur';
  const backgroundUrlProvider = createUrlBackgroundProvider({
    root,
    // 说明：存储键保持不变，确保历史配置可继续读取。
    storageKey: 'tralume-custom-background-url',
  });

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

  // 说明：背景模糊滑动块（仅影响背景图层），默认关闭（0px），支持持久化。
  if (backgroundBlurRange instanceof HTMLInputElement) {
    const blurMin = Number.isFinite(Number(backgroundBlurRange.min))
      ? Number(backgroundBlurRange.min)
      : 0;
    const blurMax = Number.isFinite(Number(backgroundBlurRange.max))
      ? Number(backgroundBlurRange.max)
      : 40;

    const clampNumber = (value, min, max) => {
      if (!Number.isFinite(value)) {
        return min;
      }
      return Math.max(min, Math.min(max, value));
    };

    const updateBlurLabel = (value) => {
      if (backgroundBlurLabel instanceof HTMLElement) {
        const unit = backgroundBlurLabel.getAttribute('data-unit') || 'px';
        backgroundBlurLabel.textContent = `${value}${unit}`;
      }
    };

    const persistBackgroundBlurValue = (value) => {
      try {
        window.localStorage.setItem(backgroundBlurStorageKey, String(value));
      } catch (error) {
        // 说明：忽略存储异常，避免影响设置面板交互。
      }
    };

    const readStoredBackgroundBlurValue = () => {
      try {
        const stored = window.localStorage.getItem(backgroundBlurStorageKey);
        if (stored) {
          const parsed = parseFloat(stored);
          if (!Number.isNaN(parsed)) {
            return parsed;
          }
        }
      } catch (error) {
        return null;
      }
      return null;
    };

    const handleBackgroundBlurChange = (value, shouldPersist = false) => {
      const base = clampNumber(value, blurMin, blurMax);
      root.style.setProperty('--app-custom-background-blur-radius', `${base}px`);
      backgroundBlurRange.value = String(base);
      backgroundBlurRange.setAttribute('aria-valuenow', String(base));
      updateBlurLabel(base);
      if (shouldPersist) {
        persistBackgroundBlurValue(base);
      }
    };

    const initialBlurValue = clampNumber(readStoredBackgroundBlurValue() ?? 0, blurMin, blurMax);
    handleBackgroundBlurChange(initialBlurValue, false);

    backgroundBlurRange.addEventListener('input', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        const value = parseFloat(target.value);
        handleBackgroundBlurChange(value, false);
      }
    });

    backgroundBlurRange.addEventListener('change', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        const value = parseFloat(target.value);
        handleBackgroundBlurChange(value, true);
      }
    });
  } else {
    root.style.setProperty('--app-custom-background-blur-radius', '0px');
  }

  const readBackgroundInputValue = () => {
    if (backgroundInput instanceof HTMLInputElement) {
      return backgroundInput.value.trim();
    }
    return '';
  };

  const updateBackgroundButtons = () => {
    const hasTypedValue = readBackgroundInputValue().length > 0;
    const hasCustomBackground = backgroundUrlProvider.isActive();
    if (backgroundApplyButton instanceof HTMLButtonElement) {
      backgroundApplyButton.disabled = !(hasTypedValue || hasCustomBackground);
    }
    if (backgroundResetButton instanceof HTMLButtonElement) {
      backgroundResetButton.disabled = !hasCustomBackground;
    }
  };

  // 说明：对外保留原本的“应用”语义（含清空即移除），实际实现委托给 URL provider。
  const applyBackgroundImage = (rawUrl, shouldPersist = true) => {
    backgroundUrlProvider.apply(rawUrl, { persistValue: shouldPersist });
    updateBackgroundButtons();
  };

  const initialBackgroundImage = backgroundUrlProvider.readStoredValue();
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
