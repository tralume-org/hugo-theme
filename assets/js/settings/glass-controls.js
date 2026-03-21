import { emitAnalyticsEvent } from '../analytics-events.js';

// 说明：玻璃/模糊调节逻辑，负责同步亚克力透明度与模糊半径并持久化。
export const setupGlassControls = (panel, root) => {
  const glassRange = panel.querySelector('[data-glass-strength-range]');
  const glassValueLabel = panel.querySelector('[data-glass-strength-label]');
  const glassBlurRange = panel.querySelector('[data-glass-blur-range]');
  const glassBlurLabel = panel.querySelector('[data-glass-blur-label]');
  const glassStorageKey = 'tralume-glass-strength';
  const glassBlurStorageKey = 'tralume-glass-blur';
  const defaultGlassValue = 45;
  const defaultBlurValue = 24;

  const clampNumber = (value, min, max) => {
    if (!Number.isFinite(value)) {
      return min;
    }
    return Math.max(min, Math.min(max, value));
  };

  let applyGlassStrength = null;
  let applyGlassBlur = null;
  let currentGlassStrength = defaultGlassValue;

  if (glassRange instanceof HTMLInputElement) {
    const sliderMin = Number.isFinite(Number(glassRange.min)) ? Number(glassRange.min) : 0;
    const sliderMax = Number.isFinite(Number(glassRange.max)) ? Number(glassRange.max) : 95;

    const updateLabel = (value) => {
      if (glassValueLabel) {
        glassValueLabel.textContent = `${value}%`;
      }
      glassRange.setAttribute('aria-valuenow', String(value));
    };

    const applyGlassVariables = (baseValue) => {
      const surface = baseValue;
      const elevated = clampNumber(baseValue + 8, sliderMin, 96);
      const strong = clampNumber(baseValue + 16, sliderMin, 99);
      const border = clampNumber(baseValue - 18, 10, 85);
      const borderStrong = clampNumber(baseValue - 6, 20, 90);
      root.style.setProperty('--app-glass-surface-alpha', `${surface}%`);
      root.style.setProperty('--app-glass-elevated-alpha', `${elevated}%`);
      root.style.setProperty('--app-glass-strong-alpha', `${strong}%`);
      root.style.setProperty('--app-glass-border-alpha', `${border}%`);
      root.style.setProperty('--app-glass-border-strong-alpha', `${borderStrong}%`);
    };

    const persistGlassValue = (value) => {
      try {
        window.localStorage.setItem(glassStorageKey, String(value));
      } catch (error) {
        // 说明：忽略存储异常，避免影响交互。
      }
    };

    const readStoredGlassValue = () => {
      try {
        const stored = window.localStorage.getItem(glassStorageKey);
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

    const resolveInitialGlassValue = () => {
      const stored = readStoredGlassValue();
      if (stored !== null) {
        return clampNumber(stored, sliderMin, sliderMax);
      }
      const inputValue = parseFloat(glassRange.value);
      if (!Number.isNaN(inputValue)) {
        return clampNumber(inputValue, sliderMin, sliderMax);
      }
      return defaultGlassValue;
    };

    const handleGlassStrengthChange = (value, shouldPersist = false) => {
      const base = clampNumber(value, sliderMin, sliderMax);
      const didChange = currentGlassStrength !== base;
      currentGlassStrength = base;
      applyGlassVariables(base);
      updateLabel(base);
      glassRange.value = String(base);
      if (shouldPersist) {
        persistGlassValue(base);
        if (didChange) {
          emitAnalyticsEvent('change_glass_strength', {
            strength: base,
          });
        }
      }
    };

    applyGlassStrength = handleGlassStrengthChange;

    const initialGlassValue = resolveInitialGlassValue();
    handleGlassStrengthChange(initialGlassValue, false);

    glassRange.addEventListener('input', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        const value = parseFloat(target.value);
        handleGlassStrengthChange(value, false);
      }
    });

    glassRange.addEventListener('change', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        const value = parseFloat(target.value);
        handleGlassStrengthChange(value, true);
      }
    });
  }

  // 说明：模糊度滑动块，直接控制亚克力 blur 半径。
  if (glassBlurRange instanceof HTMLInputElement) {
    const blurMin = Number.isFinite(Number(glassBlurRange.min)) ? Number(glassBlurRange.min) : 0;
    const blurMax = Number.isFinite(Number(glassBlurRange.max)) ? Number(glassBlurRange.max) : 48;

    const updateBlurLabel = (value) => {
      if (glassBlurLabel instanceof HTMLElement) {
        const unit = glassBlurLabel.getAttribute('data-unit') || 'px';
        glassBlurLabel.textContent = `${value}${unit}`;
      }
    };

    const persistGlassBlurValue = (value) => {
      try {
        window.localStorage.setItem(glassBlurStorageKey, String(value));
      } catch (error) {
        // 说明：忽略存储异常，避免影响模糊度调整体验。
      }
    };

    const readStoredGlassBlurValue = () => {
      try {
        const stored = window.localStorage.getItem(glassBlurStorageKey);
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

    const resolveInitialBlurValue = () => {
      const stored = readStoredGlassBlurValue();
      if (stored !== null) {
        return clampNumber(stored, blurMin, blurMax);
      }
      const inputValue = parseFloat(glassBlurRange.value);
      if (!Number.isNaN(inputValue)) {
        return clampNumber(inputValue, blurMin, blurMax);
      }
      return defaultBlurValue;
    };

    const handleGlassBlurChange = (value, shouldPersist = false) => {
      const base = clampNumber(value, blurMin, blurMax);
      root.style.setProperty('--app-glass-blur-radius', `${base}px`);
      glassBlurRange.value = String(base);
      glassBlurRange.setAttribute('aria-valuenow', String(base));
      updateBlurLabel(base);
      if (shouldPersist) {
        persistGlassBlurValue(base);
      }
    };

    applyGlassBlur = handleGlassBlurChange;

    const initialBlurValue = resolveInitialBlurValue();
    handleGlassBlurChange(initialBlurValue, false);

    glassBlurRange.addEventListener('input', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        const value = parseFloat(target.value);
        handleGlassBlurChange(value, false);
      }
    });

    glassBlurRange.addEventListener('change', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        const value = parseFloat(target.value);
        handleGlassBlurChange(value, true);
      }
    });
  } else {
    root.style.setProperty('--app-glass-blur-radius', `${defaultBlurValue}px`);
  }

  // 说明：响应“外观恢复默认值”，同时重置透明度与磨砂模糊。
  panel.addEventListener('settings:appearance-reset', () => {
    if (typeof applyGlassStrength === 'function') {
      applyGlassStrength(defaultGlassValue, true);
    }
    if (typeof applyGlassBlur === 'function') {
      applyGlassBlur(defaultBlurValue, true);
    } else {
      root.style.setProperty('--app-glass-blur-radius', `${defaultBlurValue}px`);
    }
  });
};
