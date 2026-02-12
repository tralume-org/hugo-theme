// 说明：主题种子色控制。
// 作用：允许用户输入固定 seed（#RRGGBB），并映射到 primary 相关动态 token。
// 注意：仅覆盖 --app-dynamic-primary-* 变量，不改 secondary/surface 等其余 token。

const themeSeedStorageKey = 'tralume-theme-seed';

const dynamicPrimaryKeys = [
  '--app-dynamic-primary-light',
  '--app-dynamic-on-primary-light',
  '--app-dynamic-primary-container-light',
  '--app-dynamic-on-primary-container-light',
  '--app-dynamic-primary-dark',
  '--app-dynamic-on-primary-dark',
  '--app-dynamic-primary-container-dark',
  '--app-dynamic-on-primary-container-dark',
];

const normalizeSeed = (value) => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (/^#[0-9a-f]{6}$/.test(normalized)) {
    return normalized;
  }
  return '';
};

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

  return {
    '--app-dynamic-primary-light': lightPrimary,
    '--app-dynamic-on-primary-light': pickOnColor(lightPrimary, '#ffffff', '#101215'),
    '--app-dynamic-primary-container-light': lightContainer,
    '--app-dynamic-on-primary-container-light': pickOnColor(lightContainer, '#ffffff', '#1b1f24'),
    '--app-dynamic-primary-dark': darkPrimary,
    '--app-dynamic-on-primary-dark': pickOnColor(darkPrimary, '#101215', '#ffffff'),
    '--app-dynamic-primary-container-dark': darkContainer,
    '--app-dynamic-on-primary-container-dark': pickOnColor(darkContainer, '#e7eaf2', '#101215'),
  };
};

const applySeedTokens = (root, seed) => {
  const tokens = generateSeedTokens(seed);
  if (!tokens) {
    return false;
  }
  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  return true;
};

const clearSeedTokens = (root) => {
  dynamicPrimaryKeys.forEach((key) => {
    root.style.removeProperty(key);
  });
};

const readStorage = () => {
  try {
    return normalizeSeed(window.localStorage.getItem(themeSeedStorageKey));
  } catch (error) {
    return '';
  }
};

const writeStorage = (seed) => {
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

  const seedInput = section.querySelector('[data-theme-seed-input]');
  const seedPicker = section.querySelector('[data-theme-seed-picker]');
  const applyButton = section.querySelector('[data-theme-seed-apply]');
  const resetButton = section.querySelector('[data-theme-seed-reset]');

  if (!(seedInput instanceof HTMLInputElement) || !(seedPicker instanceof HTMLInputElement)) {
    return;
  }

  const defaultSeed = normalizeSeed(section.getAttribute('data-theme-seed-default'));
  const fallbackSeed = readComputedDefaultSeed(root);

  const updateButtons = () => {
    const candidate = normalizeSeed(seedInput.value);
    if (applyButton instanceof HTMLButtonElement) {
      applyButton.disabled = !candidate;
    }
    if (resetButton instanceof HTMLButtonElement) {
      resetButton.disabled = false;
    }
  };

  const syncInputs = (seed) => {
    syncInputValue(seedInput, seed);
    syncInputValue(seedPicker, seed);
    updateButtons();
  };

  const applySeed = (seed, { persistValue = true } = {}) => {
    const normalized = normalizeSeed(seed);
    if (!normalized) {
      return false;
    }
    const applied = applySeedTokens(root, normalized);
    if (!applied) {
      return false;
    }
    syncInputs(normalized);
    if (persistValue) {
      writeStorage(normalized);
    }
    return true;
  };

  const resetSeed = ({ persistValue = true } = {}) => {
    clearSeedTokens(root);
    const nextSeed = defaultSeed || fallbackSeed;
    if (defaultSeed) {
      applySeed(defaultSeed, { persistValue: false });
    } else {
      syncInputs(nextSeed);
    }
    if (persistValue) {
      writeStorage('');
    }
  };

  const initialSeed = readStorage() || defaultSeed;
  if (initialSeed) {
    applySeed(initialSeed, { persistValue: false });
  } else {
    syncInputs(fallbackSeed);
  }

  seedPicker.addEventListener('input', (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      syncInputValue(seedInput, target.value.toLowerCase());
      updateButtons();
    }
  });

  seedInput.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    const normalized = normalizeSeed(target.value);
    if (normalized) {
      syncInputValue(seedPicker, normalized);
    }
    updateButtons();
  });

  seedInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    applySeed(seedInput.value, { persistValue: true });
  });

  if (applyButton instanceof HTMLButtonElement) {
    applyButton.addEventListener('click', () => {
      applySeed(seedInput.value, { persistValue: true });
    });
  }

  if (resetButton instanceof HTMLButtonElement) {
    resetButton.addEventListener('click', () => {
      resetSeed({ persistValue: true });
    });
  }

  panel.addEventListener('settings:appearance-reset', () => {
    resetSeed({ persistValue: true });
  });

  updateButtons();
};
