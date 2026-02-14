// 说明：背景 provider 主题种子协调器。
// 作用：在“全局主题色覆盖开关”关闭时，按 provider 配置（提取/预设/自定义）应用主题 seed。

import { applyThemeSeedToRoot, isThemeSeedOverrideEnabled } from '../theme-seed.js';
import {
  defaultThemeSeedPreset,
  isThemeSeedPreset,
  normalizeSeed,
} from '../theme-seed-palette.js';
import {
  defaultBackgroundSeedExtractAlgorithm,
  extractDominantColorFromImageUrl,
  normalizeBackgroundSeedExtractAlgorithm,
} from './seed-extractor.js';
import { matchClosestThemeSeed } from './seed-matcher.js';

const providerList = ['url', 'upload', 'pixaroa'];
const supportedModes = new Set(['extract', 'preset', 'custom']);
const seedConfigStorageKey = 'tralume-background-seed-config';
const seedMatchStorageKey = 'tralume-background-seed-last-match';

const createDefaultProviderConfig = () => ({
  mode: 'extract',
  preset: defaultThemeSeedPreset,
  custom: '',
  extractor: defaultBackgroundSeedExtractAlgorithm,
});

const normalizeProviderConfig = (rawValue) => {
  const source = rawValue && typeof rawValue === 'object' ? rawValue : {};
  const mode =
    typeof source.mode === 'string' && supportedModes.has(source.mode.trim())
      ? source.mode.trim()
      : 'extract';
  const preset = isThemeSeedPreset(source.preset) ? normalizeSeed(source.preset) : defaultThemeSeedPreset;
  const custom = normalizeSeed(source.custom);
  const extractor = normalizeBackgroundSeedExtractAlgorithm(source.extractor);
  return {
    mode,
    preset,
    custom,
    extractor,
  };
};

const createDefaultSeedConfig = () => ({
  url: createDefaultProviderConfig(),
  upload: createDefaultProviderConfig(),
  pixaroa: createDefaultProviderConfig(),
});

const readSeedConfig = () => {
  const fallback = createDefaultSeedConfig();
  try {
    const raw = window.localStorage.getItem(seedConfigStorageKey);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return fallback;
    }
    providerList.forEach((provider) => {
      fallback[provider] = normalizeProviderConfig(parsed[provider]);
    });
    return fallback;
  } catch (error) {
    return fallback;
  }
};

const writeSeedConfig = (config) => {
  try {
    window.localStorage.setItem(seedConfigStorageKey, JSON.stringify(config));
  } catch (error) {
    // 说明：本地持久化失败时保持内存配置即可，避免阻塞设置交互。
  }
};

const writeLastMatchRecord = (provider, extractedSeed, matchedSeed, extractor) => {
  try {
    const raw = window.localStorage.getItem(seedMatchStorageKey);
    const parsed = raw ? JSON.parse(raw) : {};
    const next = parsed && typeof parsed === 'object' ? parsed : {};
    next[provider] = {
      extracted: extractedSeed,
      matched: matchedSeed,
      extractor,
      updatedAt: Date.now(),
    };
    window.localStorage.setItem(seedMatchStorageKey, JSON.stringify(next));
  } catch (error) {
    // 说明：匹配记录仅用于调试/扩展，写入失败可忽略。
  }
};

export const createBackgroundThemeSeedCoordinator = ({ root, getActiveProvider, resolveProviderImageUrl } = {}) => {
  if (!(root instanceof HTMLElement)) {
    return {
      onProviderActivated: () => {},
      onProviderApplied: () => {},
      getProviderSeedExtractor: () => defaultBackgroundSeedExtractAlgorithm,
      setProviderSeedExtractor: () => false,
      resetProviderSeedExtractors: () => {},
    };
  }

  const config = readSeedConfig();
  let requestCounter = 0;

  const emitExternalSeedApplied = (seed, provider, mode) => {
    root.dispatchEvent(
      new CustomEvent('theme-seed:external-apply', {
        detail: {
          seed,
          provider,
          mode,
          source: 'background-provider',
        },
      }),
    );
  };

  const resolveSeedByConfig = async (provider, providerConfig, imageUrl) => {
    if (providerConfig.mode === 'preset') {
      return normalizeSeed(providerConfig.preset) || defaultThemeSeedPreset;
    }

    if (providerConfig.mode === 'custom') {
      return normalizeSeed(providerConfig.custom);
    }

    if (!imageUrl) {
      return '';
    }

    const extractor = normalizeBackgroundSeedExtractAlgorithm(providerConfig.extractor);
    const extracted = await extractDominantColorFromImageUrl(imageUrl, { algorithm: extractor });
    const matched = extracted ? matchClosestThemeSeed(extracted) : null;
    if (matched && matched.seed) {
      writeLastMatchRecord(provider, extracted, matched.seed, extractor);
      return matched.seed;
    }

    return '';
  };

  const applyProviderSeed = async (provider, { force = false } = {}) => {
    if (!providerList.includes(provider)) {
      return false;
    }
    if (!force && isThemeSeedOverrideEnabled()) {
      return false;
    }

    const providerConfig = normalizeProviderConfig(config[provider]);
    const imageUrl =
      typeof resolveProviderImageUrl === 'function' ? resolveProviderImageUrl(provider) : '';
    const requestId = ++requestCounter;
    const nextSeed = await resolveSeedByConfig(provider, providerConfig, imageUrl);

    if (requestId !== requestCounter) {
      return false;
    }

    const normalized = normalizeSeed(nextSeed);
    if (!normalized) {
      return false;
    }

    const applied = applyThemeSeedToRoot(root, normalized);
    if (applied) {
      emitExternalSeedApplied(normalized, provider, providerConfig.mode);
    }
    return applied;
  };

  const applyActiveProviderSeed = () => {
    const activeProvider =
      typeof getActiveProvider === 'function' ? (getActiveProvider() || '').trim() : '';
    if (!providerList.includes(activeProvider)) {
      return;
    }
    void applyProviderSeed(activeProvider, { force: false });
  };

  root.addEventListener('theme-seed:manual-changed', (event) => {
    const detail = event instanceof CustomEvent ? event.detail : null;
    const manualSeed = detail && typeof detail.manualSeed === 'string' ? detail.manualSeed : '';
    if (!normalizeSeed(manualSeed)) {
      applyActiveProviderSeed();
    }
  });

  return {
    onProviderActivated: (provider) => {
      if (!providerList.includes(provider)) {
        return;
      }
      void applyProviderSeed(provider, { force: false });
    },
    onProviderApplied: (provider) => {
      if (!providerList.includes(provider)) {
        return;
      }
      void applyProviderSeed(provider, { force: false });
    },
    getProviderSeedExtractor: (provider) => {
      if (!providerList.includes(provider)) {
        return defaultBackgroundSeedExtractAlgorithm;
      }
      const providerConfig = normalizeProviderConfig(config[provider]);
      return normalizeBackgroundSeedExtractAlgorithm(providerConfig.extractor);
    },
    setProviderSeedExtractor: (provider, extractor) => {
      if (!providerList.includes(provider)) {
        return false;
      }
      const normalizedExtractor = normalizeBackgroundSeedExtractAlgorithm(extractor);
      const providerConfig = normalizeProviderConfig(config[provider]);
      if (providerConfig.extractor === normalizedExtractor) {
        return false;
      }
      config[provider] = {
        ...providerConfig,
        extractor: normalizedExtractor,
      };
      writeSeedConfig(config);
      return true;
    },
    resetProviderSeedExtractors: () => {
      providerList.forEach((provider) => {
        const providerConfig = normalizeProviderConfig(config[provider]);
        config[provider] = {
          ...providerConfig,
          extractor: defaultBackgroundSeedExtractAlgorithm,
        };
      });
      writeSeedConfig(config);
    },
  };
};
