// 说明：从背景图片提取代表色；提取失败时返回空字符串，由上层决定回退策略。

import { normalizeSeed } from '../theme-seed-palette.js';

export const backgroundSeedExtractAlgorithmList = [
  'weighted-average',
  'vibrant-pixel',
  'hue-histogram',
  'kmeans-vibrant',
];

export const defaultBackgroundSeedExtractAlgorithm = 'weighted-average';

export const normalizeBackgroundSeedExtractAlgorithm = (rawValue) => {
  const value = typeof rawValue === 'string' ? rawValue.trim() : '';
  return backgroundSeedExtractAlgorithmList.includes(value) ? value : defaultBackgroundSeedExtractAlgorithm;
};

const clampChannel = (value) => Math.max(0, Math.min(255, Math.round(value)));

const rgbToHex = ({ r, g, b }) => {
  const toHex = (channel) => clampChannel(channel).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const clamp01 = (value) => Math.max(0, Math.min(1, value));

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

const deltaE76Square = (first, second) => {
  const dl = first.l - second.l;
  const da = first.a - second.a;
  const db = first.b - second.b;
  return dl * dl + da * da + db * db;
};

const rgbToHue = ({ r, g, b }) => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  if (delta <= 0) {
    return 0;
  }

  let hue = 0;
  if (max === rn) {
    hue = ((gn - bn) / delta) % 6;
  } else if (max === gn) {
    hue = (bn - rn) / delta + 2;
  } else {
    hue = (rn - gn) / delta + 4;
  }

  const degrees = hue * 60;
  return degrees < 0 ? degrees + 360 : degrees;
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

const collectPixelSamples = (rgbaData) => {
  const samples = [];

  for (let index = 0; index < rgbaData.length; index += 4) {
    const alpha = rgbaData[index + 3] / 255;
    if (alpha < 0.08) {
      continue;
    }

    const r = rgbaData[index];
    const g = rgbaData[index + 1];
    const b = rgbaData[index + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    const value = max / 255;
    const lightness = (max + min) / 510;
    const hue = rgbToHue({ r, g, b });

    samples.push({
      r,
      g,
      b,
      alpha,
      saturation,
      value,
      lightness,
      hue,
      lab: rgbToLab({ r, g, b }),
    });
  }

  return samples;
};

const extractByWeightedAverage = (samples) => {
  let weightedR = 0;
  let weightedG = 0;
  let weightedB = 0;
  let totalWeight = 0;

  samples.forEach((sample) => {
    const weight = sample.alpha * (0.35 + sample.saturation * 0.65);
    weightedR += sample.r * weight;
    weightedG += sample.g * weight;
    weightedB += sample.b * weight;
    totalWeight += weight;
  });

  if (totalWeight <= 0) {
    return '';
  }

  return rgbToHex({
    r: weightedR / totalWeight,
    g: weightedG / totalWeight,
    b: weightedB / totalWeight,
  });
};

const extractByVibrantPixel = (samples) => {
  const scoredSamples = [];

  samples.forEach((sample) => {
    const lightnessBalance = 1 - Math.min(1, Math.abs(sample.lightness - 0.56) / 0.56);
    const visibleValueScore = sample.value < 0.12 ? sample.value / 0.12 : 1;
    const score =
      sample.alpha *
      (0.22 + sample.saturation * 0.78) *
      (0.35 + lightnessBalance * 0.65) *
      visibleValueScore;

    if (score > 0) {
      scoredSamples.push({
        sample,
        score,
      });
    }
  });

  if (scoredSamples.length === 0) {
    return '';
  }

  // 说明：使用高分像素 Top-N 共识，降低单个亮点/噪点像素导致的主题色漂移。
  scoredSamples.sort((first, second) => second.score - first.score);
  const topCount = Math.min(24, scoredSamples.length);
  let weightedR = 0;
  let weightedG = 0;
  let weightedB = 0;
  let totalWeight = 0;

  for (let index = 0; index < topCount; index += 1) {
    const current = scoredSamples[index];
    weightedR += current.sample.r * current.score;
    weightedG += current.sample.g * current.score;
    weightedB += current.sample.b * current.score;
    totalWeight += current.score;
  }

  if (totalWeight <= 0) {
    return rgbToHex(scoredSamples[0].sample);
  }

  return rgbToHex({
    r: weightedR / totalWeight,
    g: weightedG / totalWeight,
    b: weightedB / totalWeight,
  });
};

const extractByHueHistogram = (samples) => {
  const hueBinCount = 24;
  const bins = Array.from({ length: hueBinCount }, () => ({
    weight: 0,
    r: 0,
    g: 0,
    b: 0,
  }));

  samples.forEach((sample) => {
    if (sample.saturation < 0.08 || sample.value < 0.08) {
      return;
    }
    const index = Math.min(hueBinCount - 1, Math.floor((sample.hue / 360) * hueBinCount));
    const weight = sample.alpha * (0.25 + sample.saturation * 0.75) * (0.5 + sample.value * 0.5);
    const bucket = bins[index];
    bucket.weight += weight;
    bucket.r += sample.r * weight;
    bucket.g += sample.g * weight;
    bucket.b += sample.b * weight;
  });

  const best = bins.reduce((winner, candidate) => {
    if (!winner || candidate.weight > winner.weight) {
      return candidate;
    }
    return winner;
  }, null);

  if (!best || best.weight <= 0) {
    return '';
  }

  return rgbToHex({
    r: best.r / best.weight,
    g: best.g / best.weight,
    b: best.b / best.weight,
  });
};

const compactKmeansSamples = (samples, targetSize = 240) => {
  const filtered = samples.filter((sample) => sample.alpha >= 0.12 && sample.value >= 0.06);
  if (filtered.length <= targetSize) {
    return filtered;
  }
  const step = Math.max(1, Math.floor(filtered.length / targetSize));
  const compacted = [];
  for (let index = 0; index < filtered.length; index += step) {
    compacted.push(filtered[index]);
  }
  return compacted;
};

const extractByKmeansVibrant = (samples) => {
  const source = compactKmeansSamples(samples, 240);
  if (source.length === 0) {
    return '';
  }

  const clusterCount = Math.max(2, Math.min(4, Math.round(Math.sqrt(source.length / 45))));
  const sorted = [...source].sort(
    (first, second) => first.hue - second.hue || second.saturation - first.saturation,
  );
  const centers = Array.from({ length: clusterCount }, (_, index) => {
    const pickAt = Math.min(sorted.length - 1, Math.floor(((index + 0.5) / clusterCount) * sorted.length));
    return { ...sorted[pickAt].lab };
  });

  let clusters = [];
  for (let iteration = 0; iteration < 5; iteration += 1) {
    clusters = Array.from({ length: clusterCount }, () => ({
      count: 0,
      l: 0,
      a: 0,
      b: 0,
      r: 0,
      g: 0,
      blue: 0,
      saturation: 0,
      lightness: 0,
    }));

    source.forEach((sample) => {
      let targetIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      centers.forEach((center, index) => {
        const distance = deltaE76Square(sample.lab, center);
        if (distance < bestDistance) {
          bestDistance = distance;
          targetIndex = index;
        }
      });

      const cluster = clusters[targetIndex];
      cluster.count += 1;
      cluster.l += sample.lab.l;
      cluster.a += sample.lab.a;
      cluster.b += sample.lab.b;
      cluster.r += sample.r;
      cluster.g += sample.g;
      cluster.blue += sample.b;
      cluster.saturation += sample.saturation;
      cluster.lightness += sample.lightness;
    });

    centers.forEach((center, index) => {
      const cluster = clusters[index];
      if (cluster.count > 0) {
        center.l = cluster.l / cluster.count;
        center.a = cluster.a / cluster.count;
        center.b = cluster.b / cluster.count;
      }
    });
  }

  const bestCluster = clusters.reduce((winner, candidate) => {
    if (!candidate || candidate.count <= 0) {
      return winner;
    }

    const averageSaturation = candidate.saturation / candidate.count;
    const averageLightness = candidate.lightness / candidate.count;
    const balance = 1 - Math.min(1, Math.abs(averageLightness - 0.58) / 0.58);
    const score = candidate.count * (0.28 + averageSaturation * 0.72) * (0.32 + balance * 0.68);
    if (!winner || score > winner.score) {
      return {
        cluster: candidate,
        score,
      };
    }
    return winner;
  }, null);

  if (!bestCluster || bestCluster.cluster.count <= 0) {
    return '';
  }

  const target = bestCluster.cluster;
  return rgbToHex({
    r: target.r / target.count,
    g: target.g / target.count,
    b: target.blue / target.count,
  });
};

const extractByAlgorithm = (samples, algorithm) => {
  const normalizedAlgorithm = normalizeBackgroundSeedExtractAlgorithm(algorithm);

  if (normalizedAlgorithm === 'vibrant-pixel') {
    return extractByVibrantPixel(samples) || extractByWeightedAverage(samples);
  }
  if (normalizedAlgorithm === 'hue-histogram') {
    return extractByHueHistogram(samples) || extractByWeightedAverage(samples);
  }
  if (normalizedAlgorithm === 'kmeans-vibrant') {
    return extractByKmeansVibrant(samples) || extractByWeightedAverage(samples);
  }
  return extractByWeightedAverage(samples);
};

export const extractDominantColorFromImageUrl = async (
  imageUrl,
  { sampleSize = 40, algorithm = defaultBackgroundSeedExtractAlgorithm } = {},
) => {
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

    const samples = collectPixelSamples(imageData.data);
    if (samples.length === 0) {
      return '';
    }

    const color = extractByAlgorithm(samples, algorithm);
    return normalizeSeed(color);
  } catch (error) {
    return '';
  }
};
