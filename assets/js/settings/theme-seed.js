// 说明：主题色控制。
// 作用：统一管理“全局主题色覆盖开关 + 手动颜色输入”，并映射到动态 token。
// 注意：开启全局覆盖时，会优先于背景 provider 的动态/手动主题色策略。

import {
  defaultThemeSeedPreset,
  isThemeSeedPreset,
  normalizeSeed,
} from './theme-seed-palette.js';

export const themeSeedStorageKey = 'tralume-theme-seed';
const themeSeedOverrideStorageKey = 'tralume-theme-seed-override';

const dynamicColorKeys = [
  '--app-dynamic-primary-light',
  '--app-dynamic-on-primary-light',
  '--app-dynamic-primary-container-light',
  '--app-dynamic-on-primary-container-light',
  '--app-dynamic-primary-dark',
  '--app-dynamic-on-primary-dark',
  '--app-dynamic-primary-container-dark',
  '--app-dynamic-on-primary-container-dark',
  '--app-dynamic-secondary-light',
  '--app-dynamic-on-secondary-light',
  '--app-dynamic-secondary-container-light',
  '--app-dynamic-on-secondary-container-light',
  '--app-dynamic-outline-light',
  '--app-dynamic-outline-variant-light',
  '--app-dynamic-secondary-dark',
  '--app-dynamic-on-secondary-dark',
  '--app-dynamic-secondary-container-dark',
  '--app-dynamic-on-secondary-container-dark',
  '--app-dynamic-outline-dark',
  '--app-dynamic-outline-variant-dark',
];

const hexToRgb = (hexColor) => {
  const normalized = normalizeSeed(hexColor);
  if (!normalized) {
    return null;
  }
  const value = normalized.slice(1);
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return { r, g, b };
};

const clampChannel = (value) => Math.max(0, Math.min(255, Math.round(value)));

const rgbToHex = ({ r, g, b }) => {
  const toHex = (channel) => clampChannel(channel).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const mixHex = (fromHex, toHex, ratio) => {
  const from = hexToRgb(fromHex);
  const to = hexToRgb(toHex);
  if (!from || !to) {
    return normalizeSeed(fromHex) || normalizeSeed(toHex) || '#000000';
  }
  const safeRatio = Number.isFinite(ratio) ? Math.max(0, Math.min(1, ratio)) : 0;
  return rgbToHex({
    r: from.r + (to.r - from.r) * safeRatio,
    g: from.g + (to.g - from.g) * safeRatio,
    b: from.b + (to.b - from.b) * safeRatio,
  });
};

const getRelativeLuminance = (hexColor) => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) {
    return 0;
  }
  const toLinear = (channel) => {
    const value = clampChannel(channel) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const r = toLinear(rgb.r);
  const g = toLinear(rgb.g);
  const b = toLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const getContrast = (foregroundHex, backgroundHex) => {
  const foreground = getRelativeLuminance(foregroundHex);
  const background = getRelativeLuminance(backgroundHex);
  const lighter = Math.max(foreground, background);
  const darker = Math.min(foreground, background);
  return (lighter + 0.05) / (darker + 0.05);
};

const pickOnColor = (backgroundHex, lightText = '#ffffff', darkText = '#101215') => {
  const contrastWithLight = getContrast(lightText, backgroundHex);
  const contrastWithDark = getContrast(darkText, backgroundHex);
  return contrastWithLight >= contrastWithDark ? lightText : darkText;
};

const generateSeedTokens = (seed) => {
  const normalized = normalizeSeed(seed);
  if (!normalized) {
    return null;
  }

  const lightPrimary = normalized;
  const lightContainer = mixHex(normalized, '#ffffff', 0.84);
  const darkPrimary = mixHex(normalized, '#ffffff', 0.36);
  const darkContainer = mixHex(normalized, '#000000', 0.64);
  const lightSecondary = mixHex(normalized, '#6f7680', 0.7);
  const lightSecondaryContainer = mixHex(normalized, '#ffffff', 0.9);
  const darkSecondary = mixHex(normalized, '#b7bfcb', 0.74);
  const darkSecondaryContainer = mixHex(normalized, '#000000', 0.72);
  const lightOutline = mixHex(normalized, '#8a8e96', 0.78);
  const lightOutlineVariant = mixHex(normalized, '#cfd2d8', 0.82);
  const darkOutline = mixHex(normalized, '#90939c', 0.72);
  const darkOutlineVariant = mixHex(normalized, '#40434b', 0.78);

  return {
    '--app-dynamic-primary-light': lightPrimary,
    '--app-dynamic-on-primary-light': pickOnColor(lightPrimary, '#ffffff', '#101215'),
    '--app-dynamic-primary-container-light': lightContainer,
    '--app-dynamic-on-primary-container-light': pickOnColor(lightContainer, '#ffffff', '#1b1f24'),
    '--app-dynamic-primary-dark': darkPrimary,
    '--app-dynamic-on-primary-dark': pickOnColor(darkPrimary, '#101215', '#ffffff'),
    '--app-dynamic-primary-container-dark': darkContainer,
    '--app-dynamic-on-primary-container-dark': pickOnColor(darkContainer, '#e7eaf2', '#101215'),
    '--app-dynamic-secondary-light': lightSecondary,
    '--app-dynamic-on-secondary-light': pickOnColor(lightSecondary, '#ffffff', '#1f2329'),
    '--app-dynamic-secondary-container-light': lightSecondaryContainer,
    '--app-dynamic-on-secondary-container-light': pickOnColor(
      lightSecondaryContainer,
      '#ffffff',
      '#2b2f36',
    ),
    '--app-dynamic-outline-light': lightOutline,
    '--app-dynamic-outline-variant-light': lightOutlineVariant,
    '--app-dynamic-secondary-dark': darkSecondary,
    '--app-dynamic-on-secondary-dark': pickOnColor(darkSecondary, '#101215', '#e7eaf2'),
    '--app-dynamic-secondary-container-dark': darkSecondaryContainer,
    '--app-dynamic-on-secondary-container-dark': pickOnColor(
      darkSecondaryContainer,
      '#e0e3ec',
      '#101215',
    ),
    '--app-dynamic-outline-dark': darkOutline,
    '--app-dynamic-outline-variant-dark': darkOutlineVariant,
  };
};

export const applyThemeSeedToRoot = (root, seed) => {
  const tokens = generateSeedTokens(seed);
  if (!tokens) {
    return false;
  }
  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  return true;
};

export const clearThemeSeedFromRoot = (root) => {
  dynamicColorKeys.forEach((key) => {
    root.style.removeProperty(key);
  });
};

export const readStoredThemeSeed = () => {
  try {
    return normalizeSeed(window.localStorage.getItem(themeSeedStorageKey));
  } catch (error) {
    return '';
  }
};

const writeStoredThemeSeed = (seed) => {
  try {
    if (seed) {
      window.localStorage.setItem(themeSeedStorageKey, seed);
    } else {
      window.localStorage.removeItem(themeSeedStorageKey);
    }
  } catch (error) {
    // 说明：忽略本地存储异常，避免影响面板交互。
  }
};

const readStoredOverrideState = () => {
  try {
    const stored = window.localStorage.getItem(themeSeedOverrideStorageKey);
    if (stored === '1') {
      return true;
    }
    if (stored === '0') {
      return false;
    }
  } catch (error) {
    return null;
  }
  return null;
};

const writeStoredOverrideState = (enabled) => {
  try {
    window.localStorage.setItem(themeSeedOverrideStorageKey, enabled ? '1' : '0');
  } catch (error) {
    // 说明：忽略本地存储异常，避免影响面板交互。
  }
};

export const isThemeSeedOverrideEnabled = () => readStoredOverrideState() === true;

const readComputedDefaultSeed = (root) => {
  const computed = window.getComputedStyle(root).getPropertyValue('--app-dynamic-primary-light');
  const normalized = normalizeSeed(computed);
  return normalized || '#1f2329';
};

const syncInputValue = (input, value) => {
  if (input instanceof HTMLInputElement) {
    input.value = value;
  }
};

export const setupThemeSeed = (panel, root) => {
  const section = panel.querySelector('[data-theme-seed-section]');
  if (!(section instanceof HTMLElement)) {
    return;
  }

  const overrideToggle = section.querySelector('[data-theme-seed-override-toggle]');
  const manualControls = section.querySelector('[data-theme-seed-manual-controls]');
  const seedPicker = section.querySelector('[data-theme-seed-picker]');
  const customButton = section.querySelector('[data-theme-seed-custom-button]');
  const customSwatch = section.querySelector('[data-theme-seed-custom-swatch]');
  const presetButtons = Array.from(section.querySelectorAll('[data-theme-seed-preset-button]'));

  if (
    !(overrideToggle instanceof HTMLInputElement) ||
    !(manualControls instanceof HTMLElement) ||
    !(seedPicker instanceof HTMLInputElement)
  ) {
    return;
  }

  const defaultSeed = normalizeSeed(section.getAttribute('data-theme-seed-default'));
  const defaultOverrideFromAttr =
    (section.getAttribute('data-theme-seed-override-default') || '').trim().toLowerCase() === 'true';
  const fallbackSeed = readComputedDefaultSeed(root);
  const initialSeed = readStoredThemeSeed() || defaultSeed || fallbackSeed;

  const storedOverrideState = readStoredOverrideState();
  const initialOverrideEnabled =
    typeof storedOverrideState === 'boolean'
      ? storedOverrideState
      : Boolean(readStoredThemeSeed()) || defaultOverrideFromAttr;

  const resolveCandidateSeed = () => normalizeSeed(seedPicker.value);

  const syncCustomSwatch = (seed) => {
    if (customSwatch instanceof HTMLElement) {
      customSwatch.style.setProperty('--settings-seed-color', normalizeSeed(seed) || defaultThemeSeedPreset);
    }
  };

  const syncPresetBySeed = (seed) => {
    const normalized = normalizeSeed(seed);
    let hasPresetSelected = false;

    presetButtons.forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }
      const buttonSeed = normalizeSeed(button.getAttribute('data-seed'));
      const isSelected = Boolean(normalized) && buttonSeed === normalized;
      if (isSelected) {
        hasPresetSelected = true;
      }
      button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });

    if (customButton instanceof HTMLButtonElement) {
      const isCustomSelected = Boolean(normalized) && !hasPresetSelected;
      customButton.setAttribute('aria-pressed', isCustomSelected ? 'true' : 'false');
    }
  };

  const syncManualInputs = (seed) => {
    const normalized = normalizeSeed(seed);
    if (normalized) {
      syncInputValue(seedPicker, normalized);
      syncCustomSwatch(normalized);
      syncPresetBySeed(normalized);
      return;
    }
    syncInputValue(seedPicker, defaultThemeSeedPreset);
    syncCustomSwatch(defaultThemeSeedPreset);
    syncPresetBySeed(defaultThemeSeedPreset);
  };

  const emitManualState = () => {
    const manualSeed = overrideToggle.checked ? resolveCandidateSeed() : '';
    root.dispatchEvent(
      new CustomEvent('theme-seed:manual-changed', {
        detail: {
          manualSeed: normalizeSeed(manualSeed),
        },
      }),
    );
  };

  const updateControlsState = () => {
    const enabled = overrideToggle.checked;
    manualControls.hidden = !enabled;
    seedPicker.disabled = !enabled;
    presetButtons.forEach((button) => {
      if (button instanceof HTMLButtonElement) {
        button.disabled = !enabled;
      }
    });
    if (customButton instanceof HTMLButtonElement) {
      customButton.disabled = !enabled;
    }
  };

  const applyManualSeed = (seed, { persistValue = true, emitState = true } = {}) => {
    const normalized = normalizeSeed(seed);
    if (!normalized) {
      return false;
    }
    const applied = applyThemeSeedToRoot(root, normalized);
    if (!applied) {
      return false;
    }
    syncManualInputs(normalized);
    if (persistValue) {
      writeStoredThemeSeed(normalized);
    }
    if (emitState) {
      emitManualState();
    }
    return true;
  };

  const resetManualSeed = ({ persistValue = true } = {}) => {
    const nextSeed = defaultSeed || fallbackSeed || defaultThemeSeedPreset;
    syncManualInputs(nextSeed);
    if (overrideToggle.checked) {
      applyThemeSeedToRoot(root, nextSeed);
    }
    if (persistValue) {
      writeStoredThemeSeed('');
    }
    emitManualState();
  };

  syncManualInputs(initialSeed);

  overrideToggle.checked = initialOverrideEnabled;
  writeStoredOverrideState(initialOverrideEnabled);
  if (initialOverrideEnabled) {
    applyThemeSeedToRoot(root, initialSeed);
  }
  updateControlsState();
  emitManualState();

  overrideToggle.addEventListener('change', () => {
    const enabled = overrideToggle.checked;
    writeStoredOverrideState(enabled);
    if (enabled) {
      const candidate = resolveCandidateSeed() || defaultSeed || fallbackSeed || defaultThemeSeedPreset;
      applyManualSeed(candidate, { persistValue: true, emitState: false });
    } else {
      clearThemeSeedFromRoot(root);
    }
    updateControlsState();
    emitManualState();
  });

  seedPicker.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    const normalized = normalizeSeed(target.value);
    if (!normalized) {
      return;
    }
    syncCustomSwatch(normalized);
    syncPresetBySeed(normalized);
    if (!overrideToggle.checked) {
      writeStoredThemeSeed(normalized);
      updateControlsState();
      return;
    }
    applyManualSeed(normalized, { persistValue: true, emitState: false });
    emitManualState();
    updateControlsState();
  });

  presetButtons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    button.addEventListener('click', () => {
      const nextSeed = normalizeSeed(button.getAttribute('data-seed'));
      if (!isThemeSeedPreset(nextSeed)) {
        return;
      }
      syncInputValue(seedPicker, nextSeed);
      syncCustomSwatch(nextSeed);
      syncPresetBySeed(nextSeed);
      if (!overrideToggle.checked) {
        writeStoredThemeSeed(nextSeed);
        updateControlsState();
        return;
      }
      applyManualSeed(nextSeed, { persistValue: true, emitState: false });
      emitManualState();
      updateControlsState();
    });
  });

  if (customButton instanceof HTMLButtonElement) {
    customButton.addEventListener('click', () => {
      if (!overrideToggle.checked) {
        return;
      }
      seedPicker.click();
    });
  }

  panel.addEventListener('settings:appearance-reset', () => {
    const resetOverride = defaultOverrideFromAttr;
    overrideToggle.checked = resetOverride;
    writeStoredOverrideState(resetOverride);
    resetManualSeed({ persistValue: true });
    if (!resetOverride) {
      clearThemeSeedFromRoot(root);
      emitManualState();
    }
    updateControlsState();
  });

  root.addEventListener('theme-seed:external-apply', (event) => {
    const detail = event instanceof CustomEvent ? event.detail : null;
    const nextSeed = detail && typeof detail.seed === 'string' ? normalizeSeed(detail.seed) : '';
    if (!nextSeed) {
      return;
    }
    syncManualInputs(nextSeed);
    updateControlsState();
  });
};
