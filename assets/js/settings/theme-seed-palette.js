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

export const normalizeSeed = (value) => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (/^#[0-9a-f]{6}$/.test(normalized)) {
    return normalized;
  }
  return '';
};

export const isThemeSeedPreset = (value) => themeSeedPresetSet.has(normalizeSeed(value));
