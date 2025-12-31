// 说明：Pixaroa 背景图片 provider。
// 作用：从 Pixaroa 的 `/api/random` 拉取随机图片，并将返回的 `imgproxy_url` 映射为 CSS 变量（--app-custom-background-*）。
// 注意：
// - 本模块不处理 UI（输入框/按钮/提示文案），仅负责“存储 + 组装请求 + 拉取 + 应用/清除”；
// - `tier` 为必填参数：若用户选择 “auto”，会按当前屏幕尺寸计算；
// - `orientation` 选择 “auto” 时，会按视口宽高比推断横/竖/方；
// - `format` 选择 “auto” 时，会根据浏览器支持的图片格式组装 `Accept`，让服务端做内容协商。

const createStorageAccessor = (storage) => ({
  read: (key) => {
    if (!storage) {
      return '';
    }
    try {
      return storage.getItem(key) || '';
    } catch (error) {
      return '';
    }
  },
  write: (key, value) => {
    if (!storage) {
      return;
    }
    try {
      if (value) {
        storage.setItem(key, value);
      } else {
        storage.removeItem(key);
      }
    } catch (error) {
      // 说明：忽略存储异常，避免在隐私模式/存储被禁用时报错。
    }
  },
});

// 说明：根据视口尺寸选择 tier（短边优先，考虑 devicePixelRatio）。
// 参考：Pixaroa 文档中 Tier 对应的 TargetEdge（px）。
const resolveAutoTierLevel = () => {
  const width = typeof window !== 'undefined' ? window.innerWidth : 0;
  const height = typeof window !== 'undefined' ? window.innerHeight : 0;
  const dpr =
    typeof window !== 'undefined' && Number.isFinite(window.devicePixelRatio)
      ? window.devicePixelRatio
      : 1;
  const shortEdge = Math.max(0, Math.min(width, height)) * dpr;

  if (shortEdge <= 360) {
    return 1;
  }
  if (shortEdge <= 720) {
    return 2;
  }
  if (shortEdge <= 1080) {
    return 3;
  }
  if (shortEdge <= 1440) {
    return 4;
  }
  if (shortEdge <= 2160) {
    return 5;
  }
  return 6;
};

// 说明：根据视口宽高比推断方向；阈值保守，避免“轻微拉伸”导致频繁切换。
const resolveAutoOrientation = () => {
  const width = typeof window !== 'undefined' ? window.innerWidth : 0;
  const height = typeof window !== 'undefined' ? window.innerHeight : 0;
  if (!width || !height) {
    return 'landscape';
  }

  const ratio = width / height;
  if (ratio > 1.15) {
    return 'landscape';
  }
  if (ratio < 0.85) {
    return 'portrait';
  }
  return 'square';
};

const normalizeTierLevel = (value) => {
  const parsed = Number.parseInt(String(value || ''), 10);
  if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 6) {
    return parsed;
  }
  return null;
};

const normalizeOrientation = (value) => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (normalized === 'landscape' || normalized === 'portrait' || normalized === 'square') {
    return normalized;
  }
  return null;
};

const normalizeFormat = (value) => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (normalized === 'jxl' || normalized === 'avif' || normalized === 'webp') {
    return normalized;
  }
  if (normalized === 'jpeg' || normalized === 'png') {
    return normalized;
  }
  return null;
};

const normalizeHostBase = (value) => {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) {
    return '';
  }
  try {
    // 说明：允许输入绝对 URL（https://...）或站内相对路径（/pixaroa/）。
    const base = new URL(trimmed, typeof window !== 'undefined' ? window.location.origin : undefined);
    if (base.protocol !== 'http:' && base.protocol !== 'https:') {
      return '';
    }
    // 说明：host 作为“base URL”，因此强制以 `/` 结尾，便于拼接 `api/random`。
    const href = base.href.replace(/#.*$/, '').replace(/\?.*$/, '');
    return href.endsWith('/') ? href : `${href}/`;
  } catch (error) {
    return '';
  }
};

const buildPixaroaRandomEndpoint = (hostBase) => {
  const trimmed = typeof hostBase === 'string' ? hostBase.trim() : '';
  if (trimmed) {
    const base = normalizeHostBase(trimmed);
    if (!base) {
      return null;
    }
    return new URL('api/random', base);
  }
  // 说明：默认同源请求 `/api/random`（从站点根路径开始，避免被当前页面路径影响）。
  return new URL(
    '/api/random',
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
  );
};

const setCssBackgroundFromUrl = (root, url) => {
  const sanitized = JSON.stringify(url);
  root.style.setProperty('--app-custom-background-image', `url(${sanitized})`);
  root.style.setProperty('--app-custom-background-opacity', '1');
};

const clearCssBackground = (root) => {
  root.style.setProperty('--app-custom-background-image', 'none');
  root.style.setProperty('--app-custom-background-opacity', '0');
};

// 说明：检测浏览器是否支持某个图片 MIME（用于构造 `Accept`，避免服务端返回浏览器无法解码的格式）。
// 注意：此检测依赖 data URI 的解码能力，结果会缓存到内存中。
const createImageSupportDetector = () => {
  const cache = new Map();

  const testImage = (dataUrl) =>
    new Promise((resolve) => {
      if (typeof Image === 'undefined') {
        resolve(false);
        return;
      }
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = dataUrl;
    });

  const detect = async (mime) => {
    if (cache.has(mime)) {
      return cache.get(mime);
    }

    let promise;
    // 说明：只检测 auto 可能用到的格式（jxl/avif/webp）；jpeg/png 默认认为可用。
    if (mime === 'image/webp') {
      // 说明：1x1 WebP（来自常见 feature-detect 片段），用于判断浏览器解码能力。
      promise = testImage(
        'data:image/webp;base64,UklGRiIAAABXRUJQVlA4TAYAAAAvAAAAAAfQ//73v/+BiOh/AAA=',
      );
    } else if (mime === 'image/avif') {
      // 说明：1x1 AVIF（来自常见 feature-detect 片段），用于判断浏览器解码能力。
      promise = testImage(
        'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAG1pZjFhdmlmAAAAIG1ldGEAAAAAaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAAAgAAAAaaW5mZQAAAAAAAQAAABwAAAABAAEAAAAeAAAAFWlwcnAAAAAqaXBjbwAAABRpcG1hAAAAAAEAAQAAAAEAAAABAAAAAQAAAAEAAAAAAAAAAAAAAABPcGl4aQAAAAADCAgIAAAAFGlzbHAAAAABAAAAAQAAABJpcGNvAAAAFGlwY28AAAAADGlwbWEAAAAAAAEAAQAAAAEAAAABAAAAAQAAAAEAAAAAAAAAAAAAAABPcGl4aQAAAAADCAgIAAAAFGlzbHAAAAABAAAAAQAAABRpcGNvAAAADG1kYXQAAAAA',
      );
    } else if (mime === 'image/jxl') {
      // 说明：JXL 在多数浏览器尚未默认支持；此处直接返回 false，避免误发 `Accept: image/jxl`。
      promise = Promise.resolve(false);
    } else {
      promise = Promise.resolve(false);
    }

    cache.set(mime, promise);
    return promise;
  };

  return { detect };
};

const buildAcceptHeader = async ({ detector }) => {
  const accepts = [];

  // 说明：协商顺序按文档：jxl → avif → webp → jpeg → png。
  // 注意：仅在浏览器支持时才加入对应类型，避免拿到无法解码的图片 URL。
  if (await detector.detect('image/jxl')) {
    accepts.push('image/jxl');
  }
  if (await detector.detect('image/avif')) {
    accepts.push('image/avif');
  }
  if (await detector.detect('image/webp')) {
    accepts.push('image/webp');
  }
  accepts.push('image/jpeg');
  accepts.push('image/png');

  return accepts.join(', ');
};

export const createPixaroaBackgroundProvider = ({ root, storage, defaultHost = '' } = {}) => {
  if (!(root instanceof HTMLElement)) {
    throw new Error('createPixaroaBackgroundProvider: "root" must be an HTMLElement.');
  }

  const backingStorage =
    storage ??
    (typeof window !== 'undefined' && window.localStorage ? window.localStorage : null);
  const storageAccessor = createStorageAccessor(backingStorage);

  const keys = {
    host: 'tralume-pixaroa-host',
    tier: 'tralume-pixaroa-tier',
    orientation: 'tralume-pixaroa-orientation',
    format: 'tralume-pixaroa-format',
    lastUrl: 'tralume-pixaroa-last-url',
  };

  const defaults = {
    host: typeof defaultHost === 'string' ? defaultHost.trim() : '',
    tier: 'auto',
    orientation: 'auto',
    format: 'auto',
  };

  const detector = createImageSupportDetector();

  let isActive = false;
  let lastAppliedUrl = '';
  let inflightController = null;

  const readStoredConfig = () => {
    const host = storageAccessor.read(keys.host) || defaults.host;
    const tier = storageAccessor.read(keys.tier) || defaults.tier;
    const orientation = storageAccessor.read(keys.orientation) || defaults.orientation;
    const format = storageAccessor.read(keys.format) || defaults.format;
    return { host, tier, orientation, format };
  };

  const persistConfig = (config) => {
    const next = config && typeof config === 'object' ? config : {};
    storageAccessor.write(keys.host, typeof next.host === 'string' ? next.host.trim() : '');
    storageAccessor.write(keys.tier, typeof next.tier === 'string' ? next.tier.trim() : '');
    storageAccessor.write(
      keys.orientation,
      typeof next.orientation === 'string' ? next.orientation.trim() : '',
    );
    storageAccessor.write(keys.format, typeof next.format === 'string' ? next.format.trim() : '');
  };

  const readStoredUrl = () => storageAccessor.read(keys.lastUrl);
  const persistUrl = (url) => storageAccessor.write(keys.lastUrl, url);

  const applyUrl = (url, { persistValue = true } = {}) => {
    const trimmed = typeof url === 'string' ? url.trim() : '';
    if (!trimmed) {
      clearCssBackground(root);
      isActive = false;
      lastAppliedUrl = '';
      if (persistValue) {
        persistUrl('');
      }
      return false;
    }

    setCssBackgroundFromUrl(root, trimmed);
    isActive = true;
    lastAppliedUrl = trimmed;
    if (persistValue) {
      persistUrl(trimmed);
    }
    return true;
  };

  const applyStored = ({ persistValue = false } = {}) => {
    const stored = readStoredUrl();
    if (!stored) {
      return false;
    }
    return applyUrl(stored, { persistValue });
  };

  const clear = ({ persistValue = true } = {}) => {
    if (inflightController) {
      try {
        inflightController.abort();
      } catch (error) {
        // 说明：忽略 abort 失败。
      }
      inflightController = null;
    }
    applyUrl('', { persistValue });
  };

  const fetchRandom = async ({ host, tier, orientation, format } = {}) => {
    const endpoint = buildPixaroaRandomEndpoint(host);
    if (!endpoint) {
      throw new Error('Pixaroa host is invalid.');
    }
    const resolvedTier = normalizeTierLevel(tier) ?? resolveAutoTierLevel();
    const resolvedOrientation = normalizeOrientation(orientation) ?? resolveAutoOrientation();
    const resolvedFormat = normalizeFormat(format);

    endpoint.searchParams.set('tier', String(resolvedTier));
    endpoint.searchParams.set('limit', '1');
    if (resolvedOrientation) {
      endpoint.searchParams.set('orientation', resolvedOrientation);
    }
    if (resolvedFormat) {
      endpoint.searchParams.set('format', resolvedFormat);
    }

    if (inflightController) {
      try {
        inflightController.abort();
      } catch (error) {
        // 说明：忽略 abort 失败。
      }
    }

    inflightController = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const headers = {};
    if (!resolvedFormat) {
      headers.Accept = await buildAcceptHeader({ detector });
    }

    const response = await fetch(endpoint.toString(), {
      method: 'GET',
      headers,
      cache: 'no-store',
      signal: inflightController ? inflightController.signal : undefined,
    });
    if (!response.ok) {
      throw new Error(`Pixaroa request failed: HTTP ${response.status}`);
    }
    const payload = await response.json();
    const first =
      payload && typeof payload === 'object' && Array.isArray(payload.results) ? payload.results[0] : null;
    const url = first && typeof first === 'object' ? first.imgproxy_url : '';
    if (typeof url !== 'string' || url.trim().length === 0) {
      throw new Error('Pixaroa response is missing "imgproxy_url".');
    }
    return {
      url: url.trim(),
      meta: first,
      tier: payload && typeof payload === 'object' ? payload.tier : null,
    };
  };

  const applyRandom = async ({ config, persistValue = true } = {}) => {
    const nextConfig = config && typeof config === 'object' ? config : readStoredConfig();
    const result = await fetchRandom(nextConfig);
    applyUrl(result.url, { persistValue });
    if (persistValue) {
      persistConfig(nextConfig);
    }
    return result;
  };

  return {
    readStoredConfig,
    persistConfig,
    readStoredUrl,
    applyStored,
    applyRandom,
    clear,
    isActive: () => isActive,
    lastAppliedUrl: () => lastAppliedUrl,
  };
};
