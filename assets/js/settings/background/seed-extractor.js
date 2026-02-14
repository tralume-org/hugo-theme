// 说明：从背景图片提取代表色；提取失败时返回空字符串，由上层决定回退策略。

import { normalizeSeed } from '../theme-seed-palette.js';

const clampChannel = (value) => Math.max(0, Math.min(255, Math.round(value)));

const rgbToHex = ({ r, g, b }) => {
  const toHex = (channel) => clampChannel(channel).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const loadImage = (url) =>
  new Promise((resolve, reject) => {
    if (typeof Image === 'undefined') {
      reject(new Error('Image is not available in current runtime.'));
      return;
    }

    const image = new Image();
    image.decoding = 'async';
    image.crossOrigin = 'anonymous';
    image.referrerPolicy = 'no-referrer';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image for color extraction.'));
    image.src = url;
  });

export const extractDominantColorFromImageUrl = async (imageUrl, { sampleSize = 40 } = {}) => {
  const normalizedUrl = typeof imageUrl === 'string' ? imageUrl.trim() : '';
  if (!normalizedUrl) {
    return '';
  }
  if (typeof document === 'undefined') {
    return '';
  }

  try {
    const image = await loadImage(normalizedUrl);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      return '';
    }

    const width = Math.max(1, Math.min(sampleSize, image.naturalWidth || image.width || sampleSize));
    const height = Math.max(1, Math.min(sampleSize, image.naturalHeight || image.height || sampleSize));
    canvas.width = width;
    canvas.height = height;

    context.drawImage(image, 0, 0, width, height);

    let imageData;
    try {
      imageData = context.getImageData(0, 0, width, height);
    } catch (error) {
      // 说明：远程图片若未开放 CORS，Canvas 像素读取会失败；此时返回空交给上层回退。
      return '';
    }

    const { data } = imageData;
    let weightedR = 0;
    let weightedG = 0;
    let weightedB = 0;
    let totalWeight = 0;

    for (let index = 0; index < data.length; index += 4) {
      const alpha = data[index + 3] / 255;
      if (alpha < 0.08) {
        continue;
      }

      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;
      const weight = alpha * (0.35 + saturation * 0.65);

      weightedR += r * weight;
      weightedG += g * weight;
      weightedB += b * weight;
      totalWeight += weight;
    }

    if (totalWeight <= 0) {
      return '';
    }

    const color = rgbToHex({
      r: weightedR / totalWeight,
      g: weightedG / totalWeight,
      b: weightedB / totalWeight,
    });

    return normalizeSeed(color);
  } catch (error) {
    return '';
  }
};
