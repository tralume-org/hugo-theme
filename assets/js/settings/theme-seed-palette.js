// 说明：固定主题种子色（仅保留 Material 色板的 500 档），用于手动选择与自动匹配。

export const themeSeedPresetList = Object.freeze([
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
  '#ffeb3b',
  '#ffc107',
  '#ff9800',
  '#ff5722',
  '#795548',
]);

export const defaultThemeSeedPreset = '#2196f3';

const themeSeedPresetSet = new Set(themeSeedPresetList);

const themeSeedToneMap = Object.freeze({
  '#f44336': Object.freeze({ light: '#e53935', dark: '#ef5350' }),
  '#e91e63': Object.freeze({ light: '#d81b60', dark: '#ec407a' }),
  '#9c27b0': Object.freeze({ light: '#8e24aa', dark: '#ab47bc' }),
  '#673ab7': Object.freeze({ light: '#5e35b1', dark: '#7e57c2' }),
  '#3f51b5': Object.freeze({ light: '#3949ab', dark: '#5c6bc0' }),
  '#2196f3': Object.freeze({ light: '#1e88e5', dark: '#42a5f5' }),
  '#03a9f4': Object.freeze({ light: '#039be5', dark: '#29b6f6' }),
  '#00bcd4': Object.freeze({ light: '#00acc1', dark: '#26c6da' }),
  '#009688': Object.freeze({ light: '#00897b', dark: '#26a69a' }),
  '#4caf50': Object.freeze({ light: '#43a047', dark: '#66bb6a' }),
  '#8bc34a': Object.freeze({ light: '#7cb342', dark: '#9ccc65' }),
  '#cddc39': Object.freeze({ light: '#c0ca33', dark: '#d4e157' }),
  '#ffeb3b': Object.freeze({ light: '#fdd835', dark: '#ffee58' }),
  '#ffc107': Object.freeze({ light: '#ffb300', dark: '#ffca28' }),
  '#ff9800': Object.freeze({ light: '#fb8c00', dark: '#ffa726' }),
  '#ff5722': Object.freeze({ light: '#f4511e', dark: '#ff7043' }),
  '#795548': Object.freeze({ light: '#6d4c41', dark: '#8d6e63' }),
});

export const normalizeSeed = (value) => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (/^#[0-9a-f]{6}$/.test(normalized)) {
    return normalized;
  }
  return '';
};

export const isThemeSeedPreset = (value) => themeSeedPresetSet.has(normalizeSeed(value));

export const resolveThemeSeedTone = (value, mode) => {
  const normalized = normalizeSeed(value);
  if (!normalized) {
    return '';
  }

  const tone = themeSeedToneMap[normalized];
  if (!tone) {
    return normalized;
  }

  if (mode === 'light') {
    return tone.light;
  }
  if (mode === 'dark') {
    return tone.dark;
  }
  return normalized;
};
