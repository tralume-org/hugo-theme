// 说明：Pixaroa 背景图片 provider。
// 作用：从 Pixaroa 服务的 `api/random` 拉取随机图片，并将返回的 `imgproxy_url` 映射为 CSS 变量（--app-custom-background-*）。
// 注意：
// - 本模块不处理 UI（输入框/按钮/提示文案），仅负责“存储 + 组装请求 + 拉取 + 应用/清除”；
// - `tier` 为必填参数：若用户选择 “auto”，会按当前屏幕尺寸计算；
// - `orientation` 选择 “auto” 时，会按视口宽高比推断横/竖/方；
// - `format` 选择 “auto” 时，会用 data URI 测试图片探测浏览器支持的格式，并把最终格式写进 URL 参数。

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
  if (!trimmed) {
    return null;
  }
  const base = normalizeHostBase(trimmed);
  if (!base) {
    return null;
  }
  return new URL('api/random', base);
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

// 说明：探测浏览器是否支持某个图片 MIME（用于选择 Pixaroa 的 `format` 参数）。
// 注意：此检测依赖 data URI 的解码能力，结果会缓存到内存中。
const createImageSupportDetector = () => {
  const cache = new Map();

  // 说明：用于探测解码能力的“最小测试图片”。
  // 注意：请保持为 data URI，避免额外网络请求引入 CORS/缓存等不确定因素。
  const testImages = {
    webp: 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==',
    avif: 'data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZgAAAWptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAAA5waXRtAAAAAAABAAAALGlsb2MAAAAARAAAAgABAAAAAQAAAY4AAAAUAAIAAAABAAABjgAAABQAAABCaWluZgAAAAAAAgAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAGmluZmUCAAAAAAIAAGF2MDFBbHBoYQAAAAAaaXJlZgAAAAAAAAAOYXV4bAACAAEAAQAAAKdpcHJwAAAAgWlwY28AAAAUaXNwZQAAAAAAAAABAAAAAQAAAA5waXhpAAAAAAEIAAAADGF2MUOBABwAAAAAE2NvbHJuY2x4AAEAAgAGgAAAADhhdXhDAAAAAHVybjptcGVnOm1wZWdCOmNpY3A6c3lzdGVtczphdXhpbGlhcnk6YWxwaGEAAAAAHmlwbWEAAAAAAAAAAgABBAECgwQAAgQBAoMFAAAAHG1kYXQSAAoEGAAGFTIKF4AkkQABdVRSoA==',
    jxl: 'data:image/jxl;base64,/woAEAwMBgCKGwEIEBAAGABLGIsVggE=',
  };

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
      // 说明：使用最小 WebP 测试图探测解码能力。
      promise = testImage(testImages.webp);
    } else if (mime === 'image/avif') {
      // 说明：使用最小 AVIF 测试图探测解码能力。
      promise = testImage(testImages.avif);
    } else if (mime === 'image/jxl') {
      // 说明：JXL 在多数浏览器尚未默认支持；此处用测试图探测，失败则自动回退。
      promise = testImage(testImages.jxl);
    } else {
      promise = Promise.resolve(false);
    }

    cache.set(mime, promise);
    return promise;
  };

  return { detect };
};

// 说明：当用户选择 `format=auto` 时，按优先级探测并返回 Pixaroa 的 format。
// 注意：JPEG/PNG 视为浏览器必备能力，因此无需探测；仅探测 jxl/avif/webp。
const resolveAutoFormat = async ({ detector }) => {
  if (await detector.detect('image/jxl')) {
    return 'jxl';
  }
  if (await detector.detect('image/avif')) {
    return 'avif';
  }
  if (await detector.detect('image/webp')) {
    return 'webp';
  }
  return 'jpeg';
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
    attribution: 'tralume-pixaroa-attribution',
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

  // 说明：读取已存储的归属数据（JSON 反序列化），失败时返回 null。
  const readStoredAttribution = () => {
    try {
      const raw = storageAccessor.read(keys.attribution);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  // 说明：持久化归属数据为 JSON 字符串；传入 null 或不传则清除。
  const persistAttribution = (data) => {
    if (data && typeof data === 'object') {
      try {
        storageAccessor.write(keys.attribution, JSON.stringify(data));
      } catch {
        // 说明：忽略序列化异常。
      }
    } else {
      storageAccessor.write(keys.attribution, '');
    }
  };

  // 说明：清除归属数据。
  const clearAttribution = () => {
    persistAttribution(null);
  };

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
    if (persistValue) {
      clearAttribution();
    }
  };

  const fetchRandom = async ({ host, tier, orientation, format } = {}) => {
    const endpoint = buildPixaroaRandomEndpoint(host);
    if (!endpoint) {
      throw new Error('Pixaroa host is invalid.');
    }
    const resolvedTier = normalizeTierLevel(tier) ?? resolveAutoTierLevel();
    const resolvedOrientation = normalizeOrientation(orientation) ?? resolveAutoOrientation();
    const resolvedFormat = normalizeFormat(format);
    const resolvedAutoFormat = resolvedFormat ? null : await resolveAutoFormat({ detector });
    const finalFormat = resolvedFormat || resolvedAutoFormat;

    endpoint.searchParams.set('tier', String(resolvedTier));
    endpoint.searchParams.set('limit', '1');
    if (resolvedOrientation) {
      endpoint.searchParams.set('orientation', resolvedOrientation);
    }
    // 说明：无论用户显式选择某格式，还是选择 auto，我们都把最终 format 写入 URL，
    // 以避免依赖请求头内容协商。
    endpoint.searchParams.set('format', finalFormat);

    if (inflightController) {
      try {
        inflightController.abort();
      } catch (error) {
        // 说明：忽略 abort 失败。
      }
    }

    inflightController = typeof AbortController !== 'undefined' ? new AbortController() : null;

    const response = await fetch(endpoint.toString(), {
      method: 'GET',
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
    // 说明：从 API 返回的 source 对象中提取归属信息（摄影师、来源链接、许可证）。
    // 注意：API 响应格式见 Pixaroa Cloud 文档；source 可能为 null（无归属数据）。
    const supportedLicenses = new Set([
      'cc-by-4.0', 'cc-by-sa-4.0', 'cc-by-nd-4.0',
      'cc-by-nc-4.0', 'cc-by-nc-sa-4.0', 'cc-by-nc-nd-4.0',
      'cc0-1.0', 'arr',
    ]);
    const source =
      first && typeof first === 'object' && first.source && typeof first.source === 'object'
        ? first.source
        : null;
    const attribution = source
      ? {
          photographer:
            typeof source.author === 'string' ? source.author.trim() : '',
          source_url:
            typeof source.url === 'string' ? source.url.trim() : '',
          license:
            typeof source.license === 'string' && supportedLicenses.has(source.license.trim())
              ? source.license.trim()
              : '',
          // 说明：API 直接提供许可证的人类可读名称与链接，优先使用；为空时前端 JS 会回退到 i18n 映射。
          license_name:
            typeof source.license_name === 'string' ? source.license_name.trim() : '',
          license_url:
            typeof source.license_url === 'string' ? source.license_url.trim() : '',
        }
      : null;
    return {
      url: url.trim(),
      meta: first,
      tier: payload && typeof payload === 'object' ? payload.tier : null,
      attribution,
    };
  };

  const applyRandom = async ({ config, persistValue = true } = {}) => {
    const nextConfig = config && typeof config === 'object' ? config : readStoredConfig();
    const result = await fetchRandom(nextConfig);
    applyUrl(result.url, { persistValue });
    if (persistValue) {
      persistConfig(nextConfig);
      // 说明：归属数据存在时持久化，否则清除旧数据。
      if (result.attribution && (result.attribution.photographer || result.attribution.license)) {
        persistAttribution(result.attribution);
      } else {
        clearAttribution();
      }
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
    readStoredAttribution,
    persistAttribution,
    clearAttribution,
  };
};
