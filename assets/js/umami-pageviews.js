// 说明：从 Umami share API 拉取单页“阅读量（pageviews）”，并填充到文章标题信息栏。
// 用途：在不暴露账号密码的前提下，通过 shareId 获取短期 token，再用 token 查询指定 URL 的总浏览量。
// 注意：
// - 依赖站点配置 `params.analytics.providers.umami.pageviews.host/shareId`；
// - 常见广告拦截器可能会拦截 analytics 域名，请做好“读取失败则隐藏”的降级。

import { emitAnalyticsEvent } from './analytics-events.js';

const shareCache = new Map();
const statsCache = new Map();

// 说明：请求超时（毫秒）。
// 用途：当统计域名被拦截导致 fetch 长时间挂起时，避免页面一直停留在“加载中”。
const DEFAULT_REQUEST_TIMEOUT = 4500;

const fetchWithTimeout = async (url, options = {}, timeoutMs = DEFAULT_REQUEST_TIMEOUT) => {
  const resolvedTimeout = Number(timeoutMs);
  const shouldTimeout = Number.isFinite(resolvedTimeout) && resolvedTimeout > 0;

  if (!shouldTimeout) {
    return fetch(url, options);
  }

  const hasSignal = Boolean(options && options.signal);
  const controller = !hasSignal && typeof AbortController !== 'undefined' ? new AbortController() : null;
  const signal = controller ? controller.signal : options.signal;
  const mergedOptions = signal ? { ...options, signal } : options;

  let timer = null;
  const timeoutPromise = new Promise((_, reject) => {
    timer = window.setTimeout(() => {
      if (controller) {
        controller.abort();
      }
      reject(new Error('Umami request timeout'));
    }, resolvedTimeout);
  });

  try {
    return await Promise.race([fetch(url, mergedOptions), timeoutPromise]);
  } finally {
    if (timer) {
      window.clearTimeout(timer);
    }
  }
};

const normalizeHost = (rawHost) => {
  if (!rawHost) {
    return '';
  }
  try {
    const url = new URL(rawHost);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return '';
    }
    return url.origin;
  } catch (error) {
    return '';
  }
};

const pickPageviewsCount = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const { pageviews } = payload;
  if (typeof pageviews === 'number') {
    return pageviews;
  }

  if (pageviews && typeof pageviews.value === 'number') {
    return pageviews.value;
  }

  if (pageviews && typeof pageviews.total === 'number') {
    return pageviews.total;
  }

  return null;
};

const formatCount = (count) => {
  const lang = document.documentElement?.lang || undefined;
  try {
    return new Intl.NumberFormat(lang).format(count);
  } catch (error) {
    return String(count);
  }
};

const fetchShareInfo = async (host, shareId, timeoutMs) => {
  const cacheKey = `${host}::${shareId}`;
  const cached = shareCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetchWithTimeout(`${host}/api/share/${encodeURIComponent(shareId)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'omit',
  }, timeoutMs);

  if (!response.ok) {
    throw new Error(`Umami share request failed: ${response.status}`);
  }

  const payload = await response.json();
  const websiteId = payload?.websiteId;
  const shareToken = payload?.token;
  if (!websiteId || !shareToken) {
    throw new Error('Umami share payload missing websiteId/token');
  }

  const result = { websiteId, shareToken };
  shareCache.set(cacheKey, result);
  return result;
};

const fetchPageviews = async ({ host, shareId, path, endAt, timeoutMs }) => {
  const cacheKey = `${host}::${shareId}::${path}::${endAt}`;
  const cached = statsCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const { websiteId, shareToken } = await fetchShareInfo(host, shareId, timeoutMs);
  const params = new URLSearchParams();
  params.set('startAt', '0');
  params.set('endAt', String(endAt));
  // 说明：使用 path 过滤到某个页面路径（例如 /posts/hello/），避免传入完整 URL。
  params.set('path', path);

  const response = await fetchWithTimeout(`${host}/api/websites/${encodeURIComponent(websiteId)}/stats?${params.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      // 说明：使用 Umami share token 作为鉴权头，避免依赖账号体系的 Bearer token。
      'x-umami-share-token': shareToken,
    },
    credentials: 'omit',
  }, timeoutMs);

  if (!response.ok) {
    throw new Error(`Umami stats request failed: ${response.status}`);
  }

  const payload = await response.json();
  const count = pickPageviewsCount(payload);
  if (typeof count !== 'number') {
    throw new Error('Umami stats payload missing pageviews');
  }

  statsCache.set(cacheKey, count);
  return count;
};

export const setupUmamiPageviews = () => {
  const nodes = Array.from(document.querySelectorAll('[data-umami-pageviews]'));
  if (!nodes.length) {
    return;
  }

  nodes.forEach((node) => {
    const host = normalizeHost(node.getAttribute('data-umami-pageviews-host') || '');
    const shareId = (node.getAttribute('data-umami-pageviews-share-id') || '').trim();
    const path = node.getAttribute('data-umami-pageviews-path') || '';
    const timeoutMs = Number(node.getAttribute('data-umami-pageviews-timeout')) || DEFAULT_REQUEST_TIMEOUT;
    const countEl = node.querySelector('[data-umami-pageviews-count]');

    // 说明：配置不完整或缺少占位节点时直接隐藏，避免展示“半成品”信息。
    if (!host || !shareId || !path || !countEl) {
      node.hidden = true;
      return;
    }

    countEl.textContent = '…';
    const endAt = Date.now();

    fetchPageviews({ host, shareId, path, endAt, timeoutMs })
      .then((count) => {
        countEl.textContent = formatCount(count);
        emitAnalyticsEvent('view_pageviews_widget');
      })
      .catch(() => {
        // 说明：被拦截/跨域/服务端错误等都视为不可用，直接隐藏该项。
        node.hidden = true;
      });
  });
};
