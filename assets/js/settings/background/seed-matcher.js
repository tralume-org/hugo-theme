// 说明：将任意颜色匹配到固定 17 个主题 seed（500 档），用于背景提取后的离散化。

import { normalizeSeed, themeSeedPresetList } from '../theme-seed-palette.js';

const clamp01 = (value) => Math.max(0, Math.min(1, value));

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

const srgbToLinear = (channel) => {
  const c = clamp01(channel / 255);
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const rgbToLab = ({ r, g, b }) => {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);

  const x = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375;
  const y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.072175;
  const z = rl * 0.0193339 + gl * 0.119192 + bl * 0.9503041;

  const xn = 0.95047;
  const yn = 1.0;
  const zn = 1.08883;

  const f = (t) => (t > 0.008856 ? t ** (1 / 3) : 7.787 * t + 16 / 116);
  const fx = f(x / xn);
  const fy = f(y / yn);
  const fz = f(z / zn);

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
};

const deltaE76 = (first, second) => {
  const dl = first.l - second.l;
  const da = first.a - second.a;
  const db = first.b - second.b;
  return Math.sqrt(dl * dl + da * da + db * db);
};

const presetLabList = themeSeedPresetList
  .map((seed) => {
    const rgb = hexToRgb(seed);
    if (!rgb) {
      return null;
    }
    return {
      seed,
      lab: rgbToLab(rgb),
    };
  })
  .filter(Boolean);

export const matchClosestThemeSeed = (hexColor) => {
  const normalized = normalizeSeed(hexColor);
  if (!normalized) {
    return null;
  }
  const rgb = hexToRgb(normalized);
  if (!rgb) {
    return null;
  }

  const targetLab = rgbToLab(rgb);
  let best = null;

  presetLabList.forEach((candidate) => {
    const distance = deltaE76(targetLab, candidate.lab);
    if (!best || distance < best.distance) {
      best = {
        seed: candidate.seed,
        distance,
      };
    }
  });

  return best;
};
