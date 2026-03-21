const analyticsDispatchEventName = 'tralume:analytics-track';

let hasBoundAnalyticsBridge = false;
let hasBoundGlobalTrackers = false;

const getPageMetaRoot = () => {
  const root = document.querySelector('#main-content');
  return root instanceof HTMLElement ? root : null;
};

const pickFirstNonEmpty = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
};

const parseUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }
  try {
    return new URL(value, window.location.href);
  } catch (error) {
    return null;
  }
};

const resolveHrefValue = (anchor, attributeName) => {
  if (!(anchor instanceof HTMLAnchorElement)) {
    return '';
  }
  return pickFirstNonEmpty(anchor.getAttribute(attributeName), anchor.getAttribute('href'));
};

const resolveTargetPath = (rawValue) => {
  const url = parseUrl(rawValue);
  if (!url) {
    return pickFirstNonEmpty(rawValue);
  }
  if (url.origin === window.location.origin) {
    return `${url.pathname}${url.search}${url.hash}`;
  }
  return url.href;
};

const resolveTargetHost = (rawValue) => {
  const url = parseUrl(rawValue);
  return url ? url.host : '';
};

const isExternalHttpUrl = (rawValue) => {
  const url = parseUrl(rawValue);
  if (!url) {
    return false;
  }
  const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
  return isHttp && url.origin !== window.location.origin;
};

const readPageContext = () => {
  const root = getPageMetaRoot();
  return {
    path: pickFirstNonEmpty(root?.dataset.pagePath, window.location.pathname),
    title: pickFirstNonEmpty(root?.dataset.pageTitle),
    locale: pickFirstNonEmpty(root?.dataset.pageLocale, document.documentElement?.lang),
    page_type: pickFirstNonEmpty(root?.dataset.pageType),
  };
};

const getUmamiTrack = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  const client = window.umami;
  if (typeof client === 'function') {
    return client;
  }
  if (client && typeof client.track === 'function') {
    return (...args) => client.track(...args);
  }
  return null;
};

const compactPayload = (payload) => {
  const result = {};
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }
    if (typeof value === 'string' && !value.trim()) {
      return;
    }
    result[key] = value;
  });
  return result;
};

export const trackAnalyticsEvent = (eventName, payload = {}) => {
  if (typeof eventName !== 'string' || !eventName.trim()) {
    return;
  }
  const track = getUmamiTrack();
  if (!track) {
    return;
  }
  const context = readPageContext();
  const finalPayload = compactPayload({ ...context, ...payload });
  track(eventName.trim(), finalPayload);
};

// 说明：供各个交互模块派发语义事件，真正的 Umami 调用统一留在本文件处理。
export const emitAnalyticsEvent = (eventName, payload = {}) => {
  document.dispatchEvent(
    new CustomEvent(analyticsDispatchEventName, {
      detail: {
        name: eventName,
        payload,
      },
    }),
  );
};

const bindAnalyticsBridge = () => {
  if (hasBoundAnalyticsBridge) {
    return;
  }
  hasBoundAnalyticsBridge = true;

  document.addEventListener(analyticsDispatchEventName, (event) => {
    const detail = event instanceof CustomEvent ? event.detail : null;
    const eventName = typeof detail?.name === 'string' ? detail.name : '';
    const payload = detail && typeof detail.payload === 'object' ? detail.payload : {};
    trackAnalyticsEvent(eventName, payload);
  });
};

const resolveLinkText = (anchor) => {
  if (!(anchor instanceof HTMLAnchorElement)) {
    return '';
  }
  return (anchor.textContent || '').replace(/\s+/g, ' ').trim();
};

const bindGlobalClickTracking = () => {
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const navLink = target.closest('[data-nav-link]');
    if (navLink instanceof HTMLAnchorElement) {
      const targetValue = resolveHrefValue(navLink, 'data-nav-target');
      trackAnalyticsEvent('click_nav_link', {
        label: pickFirstNonEmpty(navLink.getAttribute('data-nav-label')),
        target_path: resolveTargetPath(targetValue),
        position: pickFirstNonEmpty(navLink.getAttribute('data-nav-position')),
      });
      return;
    }

    const articleCardLink = target.closest('[data-article-card-link]');
    if (articleCardLink instanceof HTMLAnchorElement) {
      const targetValue = resolveHrefValue(articleCardLink, 'data-target-path');
      trackAnalyticsEvent('click_article_card', {
        target_path: resolveTargetPath(targetValue),
        title: pickFirstNonEmpty(articleCardLink.getAttribute('data-card-title')),
        position: pickFirstNonEmpty(articleCardLink.getAttribute('data-card-position')),
      });
      return;
    }

    const tagLink = target.closest('[data-tag-link]');
    if (tagLink instanceof HTMLAnchorElement) {
      trackAnalyticsEvent('click_tag', {
        tag: pickFirstNonEmpty(tagLink.getAttribute('data-tag-name'), resolveLinkText(tagLink)),
      });
      return;
    }

    const sourceEditLink = target.closest('[data-source-edit-link]');
    if (sourceEditLink instanceof HTMLAnchorElement) {
      const targetValue = resolveHrefValue(sourceEditLink, 'data-target-url');
      trackAnalyticsEvent('click_edit_source', {
        target_url: targetValue,
        target_host: resolveTargetHost(targetValue),
      });
      return;
    }

    const articleContentLink = target.closest('[data-article-content] a');
    if (articleContentLink instanceof HTMLAnchorElement) {
      const targetValue = resolveHrefValue(articleContentLink, 'href');
      if (!isExternalHttpUrl(targetValue)) {
        return;
      }
      trackAnalyticsEvent('click_outbound_link', {
        target_url: targetValue,
        target_host: resolveTargetHost(targetValue),
        link_text: resolveLinkText(articleContentLink),
        link_position: 'article-body',
      });
    }
  });
};

const bindCommentsVisibilityTracking = () => {
  if (typeof window.IntersectionObserver !== 'function') {
    return;
  }
  const commentsSection = document.querySelector('[data-article-comments]');
  if (!(commentsSection instanceof HTMLElement)) {
    return;
  }

  const observer = new window.IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        trackAnalyticsEvent('view_comments', {
          provider: pickFirstNonEmpty(commentsSection.getAttribute('data-comments-provider')),
        });
        observer.disconnect();
      });
    },
    {
      threshold: 0.25,
    },
  );

  observer.observe(commentsSection);
};

const bindGlobalTrackers = () => {
  if (hasBoundGlobalTrackers) {
    return;
  }
  hasBoundGlobalTrackers = true;
  bindGlobalClickTracking();
  bindCommentsVisibilityTracking();
};

export const setupAnalyticsEvents = () => {
  bindAnalyticsBridge();
  bindGlobalTrackers();
};
