// 说明：控制主导航在小屏幕下的折叠/展开行为，保持键盘与触控可用性。
const setupAppNavigation = () => {
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

// 说明：封装设置面板交互逻辑，确保按钮与卡片之间状态同步。
const setupSettingsPanel = () => {
  const panel = document.querySelector('[data-component="settings-panel"]');
  if (!panel) {
    return;
  }

  const root = document.documentElement;
  let hasCustomBackground = false;

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

  // 说明：玻璃效果滑动块，支持透明度与模糊度的双重调节，并与亚克力样式保持同步。
  const glassRange = panel.querySelector('[data-glass-strength-range]');
  const glassValueLabel = panel.querySelector('[data-glass-strength-label]');
  const glassResetButton = panel.querySelector('[data-glass-reset]');
  const glassBlurRange = panel.querySelector('[data-glass-blur-range]');
  const glassBlurLabel = panel.querySelector('[data-glass-blur-label]');
  const glassStorageKey = 'tralume-glass-strength';
  const glassBlurStorageKey = 'tralume-glass-blur';
  const defaultGlassValue = 45;
  const defaultBlurValue = 24;
  const presetGlassValues = new Map([
    ['soft', 45],
    ['balanced', 65],
    ['bold', 80],
  ]);

  const clampNumber = (value, min, max) => {
    if (!Number.isFinite(value)) {
      return min;
    }
    return Math.max(min, Math.min(max, value));
  };

  let applyGlassStrength = null;
  let applyGlassBlur = null;

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
      const preset = presetGlassValues.get(root.getAttribute('data-glass-strength') || '');
      if (typeof preset === 'number') {
        return preset;
      }
      const inputValue = parseFloat(glassRange.value);
      if (!Number.isNaN(inputValue)) {
        return clampNumber(inputValue, sliderMin, sliderMax);
      }
      return defaultGlassValue;
    };

    const handleGlassStrengthChange = (value, shouldPersist = false) => {
      const base = clampNumber(value, sliderMin, sliderMax);
      applyGlassVariables(base);
      updateLabel(base);
      glassRange.value = String(base);
      if (shouldPersist) {
        persistGlassValue(base);
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

  // 说明：模糊度滑动块，直接控制亚克力的 blur 半径并持久化偏好。
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

  if (glassResetButton instanceof HTMLButtonElement) {
    glassResetButton.addEventListener('click', () => {
      if (typeof applyGlassStrength === 'function') {
        applyGlassStrength(defaultGlassValue, true);
      }
      if (typeof applyGlassBlur === 'function') {
        applyGlassBlur(defaultBlurValue, true);
      } else {
        root.style.setProperty('--app-glass-blur-radius', `${defaultBlurValue}px`);
      }
    });
  }

  // 说明：阅读器宽度滑动条，提供更细腻的 rem 范围并持久化偏好。
  const readerWidthRange = panel.querySelector('[data-reader-width-range]');
  const readerWidthRemNode = panel.querySelector('[data-reader-width-rem]');
  const readerWidthPxNode = panel.querySelector('[data-reader-width-px]');
  const readerWidthStorageKey = 'tralume-reader-width';
  const readerWidthPresets = new Map([
    ['compact', 56],
    ['balanced', 64],
    ['wide', 80],
  ]);

  const defaultReaderBounds = { min: 52, max: 104 };
  const readerWidthBounds = {
    min: readerWidthRange instanceof HTMLInputElement ? Number.parseFloat(readerWidthRange.min) || defaultReaderBounds.min : defaultReaderBounds.min,
    max: readerWidthRange instanceof HTMLInputElement ? Number.parseFloat(readerWidthRange.max) || defaultReaderBounds.max : defaultReaderBounds.max,
  };

  const clampReaderWidth = (value) => {
    const safe = Number.isFinite(value) ? value : defaultReaderBounds.max;
    return Math.min(readerWidthBounds.max, Math.max(readerWidthBounds.min, safe));
  };

  const persistReaderWidth = (value) => {
    try {
      window.localStorage.setItem(readerWidthStorageKey, String(value));
    } catch (error) {
      // 说明：忽略本地存储失败，避免阻断交互。
    }
  };

  const readStoredReaderWidth = () => {
    try {
      const stored = window.localStorage.getItem(readerWidthStorageKey);
      if (stored) {
        const parsed = Number.parseFloat(stored);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      return null;
    }
    return null;
  };

  const resolveDefaultReaderWidth = () => {
    const presetAttr = root.getAttribute('data-reader-width');
    if (presetAttr && readerWidthPresets.has(presetAttr)) {
      return readerWidthPresets.get(presetAttr);
    }
    const explicitDefault = Number.parseFloat(root.getAttribute('data-reader-width-default') || '');
    if (Number.isFinite(explicitDefault)) {
      return explicitDefault;
    }
    return 64;
  };

  const updateReaderValueLabel = (value) => {
    if (readerWidthRemNode instanceof HTMLElement) {
      readerWidthRemNode.textContent = String(Math.round(value));
    }
    if (readerWidthPxNode instanceof HTMLElement) {
      const pxValue = Math.round(value * 16);
      readerWidthPxNode.textContent = String(pxValue);
    }
  };

  const applyReaderWidth = (value, shouldPersist = true) => {
    const nextValue = clampReaderWidth(value);
    root.style.setProperty('--reader-width-max', `${nextValue}rem`);
    if (readerWidthRange instanceof HTMLInputElement) {
      readerWidthRange.value = String(nextValue);
      readerWidthRange.setAttribute('aria-valuenow', String(Math.round(nextValue)));
    }
    updateReaderValueLabel(nextValue);
    if (shouldPersist) {
      persistReaderWidth(nextValue);
    }
  };

  const storedReaderWidth = readStoredReaderWidth();
  const initialReaderWidth = typeof storedReaderWidth === 'number' ? storedReaderWidth : resolveDefaultReaderWidth();
  applyReaderWidth(initialReaderWidth, false);

  if (readerWidthRange instanceof HTMLInputElement) {
    readerWidthRange.addEventListener('input', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        const value = Number.parseFloat(target.value);
        applyReaderWidth(value, false);
      }
    });
    readerWidthRange.addEventListener('change', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        const value = Number.parseFloat(target.value);
        applyReaderWidth(value, true);
      }
    });
  }

  // 说明：自定义背景图逻辑，读取用户输入的图片 URL 并与亚克力层叠。
  const backgroundInput = panel.querySelector('[data-background-input]');
  const backgroundApplyButton = panel.querySelector('[data-background-apply]');
  const backgroundResetButton = panel.querySelector('[data-background-reset]');
  const backgroundStorageKey = 'tralume-custom-background-url';
  const wallpaperColorStorageKey = 'tralume-wallpaper-color-cache';

  // 说明：壁纸智能取色的默认调色板，确保亮/暗模式各自拥有灰黑与灰白的安全回退。
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

  const applyWallpaperPalette = (palette = wallpaperColorFallback) => {
    const target = palette || wallpaperColorFallback;
    root.style.setProperty('--app-dynamic-primary-light', target.lightPrimary);
    root.style.setProperty('--app-dynamic-on-primary-light', target.lightOnPrimary);
    root.style.setProperty('--app-dynamic-primary-container-light', target.lightPrimaryContainer);
    root.style.setProperty('--app-dynamic-on-primary-container-light', target.lightOnPrimaryContainer);
    root.style.setProperty('--app-dynamic-primary-dark', target.darkPrimary);
    root.style.setProperty('--app-dynamic-on-primary-dark', target.darkOnPrimary);
    root.style.setProperty('--app-dynamic-primary-container-dark', target.darkPrimaryContainer);
    root.style.setProperty('--app-dynamic-on-primary-container-dark', target.darkOnPrimaryContainer);
  };

  const persistWallpaperPalette = (sourceUrl, palette) => {
    try {
      if (!sourceUrl || !palette) {
        window.localStorage.removeItem(wallpaperColorStorageKey);
        return;
      }
      window.localStorage.setItem(
        wallpaperColorStorageKey,
        JSON.stringify({
          source: sourceUrl,
          palette,
        }),
      );
    } catch (error) {
      // 说明：忽略本地存储异常，避免阻断页面渲染。
    }
  };

  const readPersistedWallpaperPalette = () => {
    try {
      const raw = window.localStorage.getItem(wallpaperColorStorageKey);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && typeof parsed.source === 'string' && parsed.palette) {
        return parsed;
      }
    } catch (error) {
      return null;
    }
    return null;
  };

  const normalizeHex = (value) => {
    if (typeof value !== 'string') {
      return null;
    }
    const trimmed = value.trim().replace(/^#/, '');
    if (trimmed.length === 3) {
      return `#${trimmed
        .split('')
        .map((ch) => ch + ch)
        .join('')}`.toLowerCase();
    }
    if (trimmed.length === 6) {
      return `#${trimmed.toLowerCase()}`;
    }
    return null;
  };

  const hexToRgb = (hex) => {
    const normalized = normalizeHex(hex);
    if (!normalized) {
      return null;
    }
    const value = normalized.replace('#', '');
    return {
      r: Number.parseInt(value.slice(0, 2), 16),
      g: Number.parseInt(value.slice(2, 4), 16),
      b: Number.parseInt(value.slice(4, 6), 16),
    };
  };

  const rgbChannelToHex = (channel) => channel.toString(16).padStart(2, '0');

  const rgbToHex = (r, g, b) => {
    const clamp = (value) => {
      if (!Number.isFinite(value)) {
        return 0;
      }
      return Math.max(0, Math.min(255, Math.round(value)));
    };
    return `#${rgbChannelToHex(clamp(r))}${rgbChannelToHex(clamp(g))}${rgbChannelToHex(clamp(b))}`;
  };

  const mixHexColors = (sourceHex, targetHex, ratio) => {
    const safeRatio = Number.isFinite(ratio) ? Math.min(0.95, Math.max(0.05, ratio)) : 0.5;
    const source = hexToRgb(sourceHex);
    const target = hexToRgb(targetHex);
    if (!source || !target) {
      return targetHex || sourceHex || '#888888';
    }
    const mixChannel = (from, to) => from + (to - from) * safeRatio;
    return rgbToHex(mixChannel(source.r, target.r), mixChannel(source.g, target.g), mixChannel(source.b, target.b));
  };

  const computeRelativeLuminance = (hexColor) => {
    const channels = hexToRgb(hexColor);
    if (!channels) {
      return 0.5;
    }
    const toLinear = (value) => {
      const normalized = value / 255;
      if (normalized <= 0.04045) {
        return normalized / 12.92;
      }
      return ((normalized + 0.055) / 1.055) ** 2.4;
    };
    const r = toLinear(channels.r);
    const g = toLinear(channels.g);
    const b = toLinear(channels.b);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const pickReadableOnColor = (hexColor) => {
    const luminance = computeRelativeLuminance(hexColor);
    return luminance > 0.6 ? '#111215' : '#f7f8fb';
  };

  const buildPaletteFromSource = (hexColor) => {
    const normalized = normalizeHex(hexColor);
    if (!normalized) {
      return wallpaperColorFallback;
    }
    const lightPrimary = mixHexColors(normalized, '#0f1012', 0.35);
    const darkPrimary = mixHexColors(normalized, '#f5f6f8', 0.6);
    const lightPrimaryContainer = mixHexColors(lightPrimary, '#ffffff', 0.85);
    const darkPrimaryContainer = mixHexColors(darkPrimary, '#050608', 0.7);
    return {
      lightPrimary,
      lightOnPrimary: pickReadableOnColor(lightPrimary),
      lightPrimaryContainer,
      lightOnPrimaryContainer: pickReadableOnColor(lightPrimaryContainer),
      darkPrimary,
      darkOnPrimary: pickReadableOnColor(darkPrimary),
      darkPrimaryContainer,
      darkOnPrimaryContainer: pickReadableOnColor(darkPrimaryContainer),
    };
  };

  const extractAverageColor = (image) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      throw new Error('CanvasUnsupported');
    }
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    context.drawImage(image, 0, 0, size, size);
    let imageData;
    try {
      imageData = context.getImageData(0, 0, size, size);
    } catch (error) {
      throw new Error('ReadPixelFailed');
    }
    const { data } = imageData;
    let totalWeight = 0;
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3] / 255;
      if (alpha <= 0.05) {
        continue;
      }
      totalWeight += alpha;
      sumR += data[i] * alpha;
      sumG += data[i + 1] * alpha;
      sumB += data[i + 2] * alpha;
    }
    if (totalWeight === 0) {
      throw new Error('TransparentImage');
    }
    return rgbToHex(sumR / totalWeight, sumG / totalWeight, sumB / totalWeight);
  };

  const loadImageFromUrl = (url) =>
    new Promise((resolve, reject) => {
      if (!url) {
        reject(new Error('EmptyUrl'));
        return;
      }
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.decoding = 'async';
      const cleanup = () => {
        image.onload = null;
        image.onerror = null;
      };
      image.onload = () => {
        cleanup();
        if (!image.naturalWidth || !image.naturalHeight) {
          reject(new Error('InvalidImage'));
          return;
        }
        resolve(image);
      };
      image.onerror = () => {
        cleanup();
        reject(new Error('LoadFailed'));
      };
      image.src = url;
    });

  const derivePaletteFromWallpaper = async (url) => {
    const image = await loadImageFromUrl(url);
    const averageHex = extractAverageColor(image);
    return buildPaletteFromSource(averageHex);
  };

  let wallpaperColorJobId = 0;

  const updateWallpaperColors = (imageUrl, { forceRecompute = false } = {}) => {
    wallpaperColorJobId += 1;
    const jobId = wallpaperColorJobId;

    if (!imageUrl) {
      applyWallpaperPalette(wallpaperColorFallback);
      persistWallpaperPalette('', null);
      return;
    }

    if (!forceRecompute) {
      const cached = readPersistedWallpaperPalette();
      if (cached && cached.source === imageUrl && cached.palette) {
        applyWallpaperPalette(cached.palette);
        return;
      }
    }

    derivePaletteFromWallpaper(imageUrl)
      .then((palette) => {
        if (jobId !== wallpaperColorJobId) {
          return;
        }
        applyWallpaperPalette(palette);
        persistWallpaperPalette(imageUrl, palette);
      })
      .catch(() => {
        if (jobId !== wallpaperColorJobId) {
          return;
        }
        applyWallpaperPalette(wallpaperColorFallback);
      });
  };

  // 说明：立即同步默认调色板，避免某些浏览器在脚本执行前出现闪烁。
  applyWallpaperPalette(wallpaperColorFallback);

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
    const forcePaletteRefresh = Boolean(shouldPersist);
    if (!trimmed) {
      root.style.setProperty('--app-custom-background-image', 'none');
      root.style.setProperty('--app-custom-background-opacity', '0');
      hasCustomBackground = false;
      if (shouldPersist) {
        persistBackgroundValue('');
      }
      updateBackgroundButtons();
      updateWallpaperColors('', { forceRecompute: forcePaletteRefresh });
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
    updateWallpaperColors(trimmed, { forceRecompute: forcePaletteRefresh });
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

// 说明：Markdown 代码块增强逻辑，负责构建 MD3 外观并注入复制按钮。
const setupCodeBlocks = () => {
  const container = document.querySelector('#main-content');
  if (!container) {
    return;
  }

  const copyLabel = container.getAttribute('data-code-copy-label') || 'Copy code';
  const copiedLabel = container.getAttribute('data-code-copied-label') || 'Copied';

  // 说明：从 code 元素的类名或 data-lang 属性中解析语言名称。
  const readLanguage = (codeElement) => {
    if (!(codeElement instanceof HTMLElement)) {
      return '';
    }
    const direct = codeElement.getAttribute('data-lang');
    if (direct) {
      return direct;
    }
    const classList = (codeElement.className || '').split(/\s+/);
    const languageClass = classList.find((item) => item.startsWith('language-') || item.startsWith('lang-'));
    if (!languageClass) {
      return '';
    }
    return languageClass.replace(/^language-/, '').replace(/^lang-/, '');
  };

  // 说明：语言名称做简单格式化，避免全小写影响可读性。
  const formatLanguage = (raw) => {
    if (!raw) {
      return '';
    }
    const trimmed = raw.trim();
    if (trimmed.length <= 3) {
      return trimmed.toUpperCase();
    }
    if (trimmed.includes('-') || trimmed.includes('_')) {
      return trimmed
        .split(/[-_]/g)
        .map((segment) => segment ? segment[0].toUpperCase() + segment.slice(1).toLowerCase() : segment)
        .join(' ');
    }
    return trimmed[0].toUpperCase() + trimmed.slice(1);
  };

  // 说明：复制逻辑同时支持 Clipboard API 与传统命令，提升兼容性。
  const copyText = async (text) => {
    if (!text) {
      return false;
    }
    const normalized = text.replace(/\u00A0/g, ' ');
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(normalized);
        return true;
      }
    } catch (error) {
      // 说明：忽略 Clipboard API 的失败，继续尝试后备方案。
    }

    const textarea = document.createElement('textarea');
    textarea.value = normalized;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.select();
    let succeeded = false;
    try {
      succeeded = document.execCommand('copy');
    } catch (error) {
      succeeded = false;
    }
    textarea.remove();
    return succeeded;
  };

  // 说明：构建复制按钮并绑定状态更新。
  const createCopyButton = (codeElement) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'md3-code-block__copy-button';
    button.dataset.copyLabel = copyLabel;
    button.dataset.copiedLabel = copiedLabel;
    button.textContent = copyLabel;
    button.title = copyLabel;
    button.setAttribute('aria-label', copyLabel);

    let revertTimer = 0;
    const resetState = () => {
      button.classList.remove('is-copied');
      button.textContent = copyLabel;
      button.title = copyLabel;
      button.setAttribute('aria-label', copyLabel);
    };

    button.addEventListener('click', async () => {
      if (codeElement instanceof HTMLElement) {
        const text = codeElement.textContent || '';
        const success = await copyText(text);
        window.clearTimeout(revertTimer);
        if (success) {
          button.classList.add('is-copied');
          button.textContent = copiedLabel;
          button.title = copiedLabel;
          button.setAttribute('aria-label', copiedLabel);
          revertTimer = window.setTimeout(resetState, 2000);
        } else {
          resetState();
        }
      }
    });

    return button;
  };

  // 说明：统一构建代码块的 DOM 结构。
  const buildCodeBlock = (preElement, mountTarget) => {
    if (!(preElement instanceof HTMLElement)) {
      return;
    }
    if (preElement.dataset.md3CodeProcessed === 'true') {
      return;
    }

    const codeElement = preElement.querySelector('code') || preElement;
    const language = formatLanguage(readLanguage(codeElement));

    const wrapper = document.createElement('div');
    wrapper.className = 'md3-code-block';
    wrapper.setAttribute('data-md3-code-block', 'true');

    const toolbar = document.createElement('div');
    toolbar.className = 'md3-code-block__toolbar';

    if (language) {
      const badge = document.createElement('span');
      badge.className = 'md3-code-block__language';
      badge.textContent = language;
      toolbar.appendChild(badge);
    }

    const copyButton = createCopyButton(codeElement);
    toolbar.appendChild(copyButton);

    const body = document.createElement('div');
    body.className = 'md3-code-block__body';

    const originalParent = preElement.parentElement;
    const referenceNode = preElement.nextSibling;

    body.appendChild(preElement);
    wrapper.appendChild(toolbar);
    wrapper.appendChild(body);

    preElement.dataset.md3CodeProcessed = 'true';

    if (mountTarget && mountTarget !== preElement && mountTarget.parentElement) {
      mountTarget.replaceWith(wrapper);
    } else if (originalParent) {
      originalParent.insertBefore(wrapper, referenceNode);
    }
  };

  const highlightBlocks = Array.from(container.querySelectorAll('.highlight'));
  highlightBlocks.forEach((highlight) => {
    const preElement = highlight.querySelector('pre');
    if (preElement) {
      buildCodeBlock(preElement, highlight);
    }
  });

  const loosePreBlocks = Array.from(container.querySelectorAll('pre')).filter((preElement) => {
    if (!(preElement instanceof HTMLElement)) {
      return false;
    }
    if (preElement.dataset.md3CodeProcessed === 'true') {
      return false;
    }
    if (preElement.closest('.md3-code-block')) {
      return false;
    }
    return true;
  });

  loosePreBlocks.forEach((preElement) => {
    buildCodeBlock(preElement, null);
  });
};

// 说明：文章阅读增强逻辑，负责生成大纲、同步滚动高亮与阅读进度条。
const setupArticleOutline = () => {
  const root = document.querySelector('[data-article-root]');
  if (!root) {
    return;
  }

  const content = root.querySelector('[data-article-content]');
  const outline = root.querySelector('[data-article-outline]');
  const list = outline ? outline.querySelector('[data-article-outline-list]') : null;
  const emptyHint = outline ? outline.querySelector('[data-article-outline-empty]') : null;
  const layout = root.querySelector('[data-article-layout]');
  const progressHost = document.querySelector('[data-article-progress-floating]');
  const progressMeter = progressHost ? progressHost.querySelector('[data-article-progress-floating-meter]') : null;
  const progressLabel = progressHost ? progressHost.querySelector('[data-article-progress-floating-label]') : null;

  if (!content || !outline || !list || !progressMeter || !progressLabel) {
    return;
  }

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const lerp = (min, max, t) => min + (max - min) * t;

  let progressCircumference = 1;
  if (progressMeter instanceof SVGCircleElement) {
    const radius = progressMeter.r.baseVal.value || 16;
    progressCircumference = radius > 0 ? 2 * Math.PI * radius : 1;
    const dashArray = `${progressCircumference} ${progressCircumference}`;
    progressMeter.style.strokeDasharray = dashArray;
    progressMeter.style.strokeDashoffset = `${progressCircumference}`;
  }

  const headingElements = Array.from(content.querySelectorAll('h2, h3, h4, h5, h6')).filter(
    (heading) => heading instanceof HTMLElement
  );

  const normalizedHeadings = headingElements
    .map((heading, index) => {
      const level = Number.parseInt(heading.tagName.replace(/^H/i, ''), 10);
      const text = (heading.textContent || '').trim();
      if (!text) {
        return null;
      }

      if (!heading.id) {
        let baseSlug = text
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\u4e00-\u9fff-]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');
        if (!baseSlug) {
          baseSlug = `section-${index + 1}`;
        }
        let candidate = baseSlug;
        let attempts = 1;
        while (document.getElementById(candidate)) {
          candidate = `${baseSlug}-${attempts++}`;
        }
        heading.id = candidate;
      }

      return {
        element: heading,
        id: heading.id,
        level: Number.isFinite(level) ? level : 2,
        text
      };
    })
    .filter(Boolean);

  let outlineEntries = [];
  const outlineHeader = outline.querySelector('.article__outline-header');
  const prefersReducedMotion =
    typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const getScrollBehavior = () => (prefersReducedMotion && prefersReducedMotion.matches ? 'auto' : 'smooth');

  const readOutlineGap = () => {
    if (!(outline instanceof HTMLElement)) {
      return 0;
    }
    const styles = window.getComputedStyle(outline);
    const raw = styles.getPropertyValue('row-gap') || styles.getPropertyValue('gap') || '0';
    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const ensureOutlineVisibility = (link) => {
    if (!(outline instanceof HTMLElement) || !(link instanceof HTMLElement)) {
      return;
    }
    const headerHeight = outlineHeader instanceof HTMLElement ? outlineHeader.offsetHeight : 0;
    const outlineGap = readOutlineGap();
    const containerRect = outline.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const padding = 12;
    const topBoundary = containerRect.top + headerHeight + outlineGap + padding;
    const bottomBoundary = containerRect.bottom - padding;

    if (linkRect.top < topBoundary || linkRect.bottom > bottomBoundary) {
      try {
        link.scrollIntoView({
          block: 'center',
          inline: 'nearest',
          behavior: getScrollBehavior()
        });
      } catch (error) {
        link.scrollIntoView(true);
      }
    }
  };

  if (normalizedHeadings.length) {
    if (layout) {
      layout.classList.remove('article__layout--single');
    }
    const baseLevel = normalizedHeadings.reduce(
      (min, item) => Math.min(min, item.level),
      normalizedHeadings[0].level
    );

    list.innerHTML = '';

    outlineEntries = normalizedHeadings.map((item) => {
      const listItem = document.createElement('li');
      listItem.className = 'article__outline-item';
      const relativeLevel = Math.max(item.level - baseLevel, 0);
      listItem.dataset.outlineLevel = String(relativeLevel);

      const link = document.createElement('a');
      link.className = 'article__outline-link';
      link.href = `#${item.id}`;
      link.textContent = item.text;

      listItem.appendChild(link);
      list.appendChild(listItem);

      return {
        element: item.element,
        id: item.id,
        link
      };
    });

    outline.setAttribute('data-outline-state', 'ready');
    if (emptyHint) {
      emptyHint.setAttribute('aria-hidden', 'true');
    }
  } else {
    outline.setAttribute('data-outline-state', 'hidden');
    if (layout) {
      layout.classList.add('article__layout--single');
    }
    if (progressHost instanceof HTMLElement) {
      progressHost.setAttribute('hidden', 'hidden');
    }
    return;
  }

  const applyAdaptiveSpacing = (count) => {
    const safeCount = Math.max(count, 1);
    const minCount = 4;
    const maxCount = 24;
    const normalized = clamp((safeCount - minCount) / (maxCount - minCount), 0, 1);
    const relaxed = 1 - normalized;

    const outlineFont = lerp(0.78, 0.92, relaxed);
    const outlineGap = lerp(0.55, 0.85, relaxed);
    const outlineItemGap = lerp(0.08, 0.2, relaxed);
    const outlinePaddingBlock = lerp(0.16, 0.26, relaxed);
    const outlinePaddingInline = lerp(0.38, 0.6, relaxed);
    const outlineLineHeight = outlineFont + lerp(0.28, 0.36, relaxed);

    const sectionGap = lerp(0.55, 1.0, relaxed);
    const headingMarginTop = lerp(0.85, 1.25, relaxed);
    const headingMarginBottom = lerp(0.24, 0.45, relaxed);
    const paragraphMargin = lerp(0.28, 0.45, relaxed);
    const dividerMargin = lerp(1.0, 1.6, relaxed);

    root.style.setProperty('--article-outline-font-size', `${outlineFont.toFixed(3)}rem`);
    root.style.setProperty('--article-outline-line-height', `${outlineLineHeight.toFixed(3)}rem`);
    root.style.setProperty('--article-outline-gap', `${outlineGap.toFixed(3)}rem`);
    root.style.setProperty('--article-outline-item-gap', `${outlineItemGap.toFixed(3)}rem`);
    root.style.setProperty('--article-outline-link-padding-block', `${outlinePaddingBlock.toFixed(3)}rem`);
    root.style.setProperty('--article-outline-link-padding-inline', `${outlinePaddingInline.toFixed(3)}rem`);
    root.style.setProperty('--article-section-gap', `${sectionGap.toFixed(3)}rem`);
    root.style.setProperty('--article-heading-margin-top', `${headingMarginTop.toFixed(3)}rem`);
    root.style.setProperty('--article-heading-margin-bottom', `${headingMarginBottom.toFixed(3)}rem`);
    root.style.setProperty('--article-paragraph-margin', `${paragraphMargin.toFixed(3)}rem`);
    root.style.setProperty('--article-divider-margin', `${dividerMargin.toFixed(3)}rem`);
  };

  applyAdaptiveSpacing(normalizedHeadings.length);

  const applyProgressVisuals = (value) => {
    const safeValue = clamp(value, 0, 1);
    const percent = Math.round(safeValue * 100);
    progressLabel.textContent = `${percent}%`;
    if (progressMeter instanceof SVGCircleElement) {
      const offset = progressCircumference * (1 - safeValue);
      progressMeter.style.strokeDashoffset = `${offset}`;
    }

    if (progressHost instanceof HTMLElement) {
      progressHost.setAttribute('aria-valuenow', String(percent));
      if (percent > 0) {
        progressHost.removeAttribute('hidden');
      } else {
        progressHost.setAttribute('hidden', 'hidden');
      }
    }
  };

  applyProgressVisuals(0);

  let activeId = '';

  // 说明：同步激活态样式，保证仅一个标题高亮，同时保持大纲视窗内可见。
  const applyActiveId = (nextId) => {
    if (!outlineEntries.length || !nextId) {
      return;
    }
    activeId = nextId;
    let activeEntry = null;
    outlineEntries.forEach((entry) => {
      const isActive = entry.id === activeId;
      entry.link.classList.toggle('is-active', isActive);
      if (isActive) {
        activeEntry = entry;
      }
    });

    if (activeEntry) {
      ensureOutlineVisibility(activeEntry.link);
    }
  };

  const metrics = {
    contentTop: 0,
    contentBottom: 0,
    totalScrollable: 1,
    headingOffsets: []
  };

  // 说明：重新计算内容高度与各标题的绝对位置，便于滚动时高亮准确。
  const recalcMetrics = () => {
    const contentRect = content.getBoundingClientRect();
    metrics.contentTop = contentRect.top + window.scrollY;
    metrics.contentBottom = metrics.contentTop + content.scrollHeight;
    metrics.headingOffsets = outlineEntries.map((entry) => {
      const rect = entry.element.getBoundingClientRect();
      return rect.top + window.scrollY;
    });

    const rawScrollable = metrics.contentBottom - metrics.contentTop - window.innerHeight;
    metrics.totalScrollable = rawScrollable > 0 ? rawScrollable : 1;
  };

  // 说明：根据滚动位置更新进度条宽度与无障碍信息。
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const reachedBottom = scrollTop + window.innerHeight >= metrics.contentBottom - 1;
    let progressValue = 0;

    if (metrics.contentBottom - metrics.contentTop <= window.innerHeight) {
      progressValue = scrollTop >= metrics.contentTop ? 1 : 0;
    } else if (reachedBottom) {
      progressValue = 1;
    } else {
      progressValue = clamp(
        (scrollTop - metrics.contentTop) / metrics.totalScrollable,
        0,
        1
      );
    }

    applyProgressVisuals(progressValue);
  };

  // 说明：定位当前视口内最接近的标题，驱动大纲高亮。
  const updateActiveHeading = () => {
    if (!outlineEntries.length) {
      return;
    }

    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;
    const anchorLine = scrollTop + viewportHeight * 0.3;
    const offsets = metrics.headingOffsets;

    let nextActiveId = outlineEntries[0].id;

    for (let index = 0; index < offsets.length; index += 1) {
      if (anchorLine >= offsets[index] - 1) {
        nextActiveId = outlineEntries[index].id;
      } else {
        break;
      }
    }

    if (scrollTop + viewportHeight >= metrics.contentBottom - 1) {
      nextActiveId = outlineEntries[outlineEntries.length - 1].id;
    }

    applyActiveId(nextActiveId);
  };

  let ticking = false;

  // 说明：滚动与进度更新节流，避免频繁计算。
  const handleScroll = () => {
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(() => {
      updateProgress();
      updateActiveHeading();
      ticking = false;
    });
  };

  const syncLayouts = () => {
    recalcMetrics();
    updateProgress();
    updateActiveHeading();
  };

  syncLayouts();

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', () => {
    syncLayouts();
  });
  window.addEventListener('load', () => {
    syncLayouts();
  });

  const mediaNodes = Array.from(content.querySelectorAll('img, video, iframe'));
  mediaNodes.forEach((node) => {
    node.addEventListener('load', syncLayouts, { once: true });
  });

  outlineEntries.forEach((entry) => {
    entry.link.addEventListener('focus', () => {
      applyActiveId(entry.id);
    });
  });

  if (progressHost instanceof HTMLElement) {
    progressHost.addEventListener('click', () => {
      const behavior = prefersReducedMotion && prefersReducedMotion.matches ? 'auto' : 'smooth';
      window.scrollTo({ top: 0, left: 0, behavior });
    });
  }
};

// 说明：集中触发初始化逻辑，确保各个组件在 DOM 就绪后挂载事件。
const bootstrap = () => {
  setupAppNavigation();
  setupSettingsPanel();
  setupCodeBlocks();
  setupArticleOutline();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
