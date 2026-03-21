import {
  normalizePostsScrollMode,
  persistPostsScrollMode,
  postsScrollModeChangeEventName,
  readStoredPostsScrollMode,
} from './settings/posts-scroll-state.js';
import { emitAnalyticsEvent } from './analytics-events.js';

// 说明：/posts 与 /pages 列表的“分页 / 无限滚动”渐进增强。
// - 模式开关位于设置面板；本模块只负责按当前模式渲染与加载。
// - 无 JS 时自动回退 Hugo 原生分页，不影响 SEO 与可访问性。
export const setupArticleListInfiniteScroll = () => {
  const feeds = Array.from(document.querySelectorAll('[data-article-list-feed]')).filter((feed) => {
    const section = (feed.getAttribute('data-article-list-feed') || '').toLowerCase();
    return section === 'posts' || section === 'pages';
  });
  if (!feeds.length) {
    return;
  }

  feeds.forEach((feed) => {
    const items = feed.querySelector('[data-article-list-items]');
    const pagination = feed.querySelector('[data-article-list-pagination]');
    const paginationControls = feed.querySelector('[data-article-list-pagination-controls]');
    const sentinel = feed.querySelector('[data-article-list-sentinel]');
    if (!(items instanceof HTMLElement) || !(pagination instanceof HTMLElement)) {
      return;
    }

    // 说明：若浏览器缺少关键能力，回退到常规分页模式。
    const supportsInfinite = typeof window.IntersectionObserver === 'function' && typeof window.DOMParser === 'function';
    const defaultMode = feed.getAttribute('data-article-list-default-mode') || 'pagination';
    let currentPage = Number.parseInt(pagination.getAttribute('data-article-list-current-page') || '1', 10);
    let nextPageURL = pagination.getAttribute('data-article-list-next-url') || '';

    const storedMode = readStoredPostsScrollMode();
    let mode = normalizePostsScrollMode(storedMode, normalizePostsScrollMode(defaultMode));
    if (!supportsInfinite || !Number.isFinite(currentPage) || currentPage > 1) {
      mode = 'pagination';
    }

    let observer = null;
    let isLoading = false;

    const stopObserver = () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    };

    const setInfiniteUIState = (enabled) => {
      pagination.classList.toggle('is-infinite-mode', enabled);
      if (paginationControls instanceof HTMLElement) {
        paginationControls.hidden = enabled;
      }
      if (sentinel instanceof HTMLElement) {
        sentinel.hidden = !enabled;
      }
    };

    const readNextPageURL = (sourcePagination) => {
      if (!(sourcePagination instanceof HTMLElement)) {
        return '';
      }
      return sourcePagination.getAttribute('data-article-list-next-url') || '';
    };

    const appendNextPage = async () => {
      if (!nextPageURL || isLoading || mode !== 'infinite') {
        return;
      }

      isLoading = true;
      try {
        const response = await window.fetch(nextPageURL, {
          credentials: 'same-origin',
          headers: {
            'X-Requested-With': 'tralume-infinite-scroll'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to load page: ${response.status}`);
        }

        const html = await response.text();
        const parsed = new window.DOMParser().parseFromString(html, 'text/html');
        const nextItems = parsed.querySelector('[data-article-list-items]');
        if (!(nextItems instanceof HTMLElement)) {
          throw new Error('Cannot find article list items in next page');
        }

        const cards = Array.from(nextItems.querySelectorAll('.article-card'));
        cards.forEach((card) => {
          items.append(card);
        });

        const nextPagination = parsed.querySelector('[data-article-list-pagination]');
        const loadedPage = Number.parseInt(
          nextPagination?.getAttribute('data-article-list-current-page') || String(currentPage + 1),
          10,
        );
        nextPageURL = readNextPageURL(nextPagination);
        currentPage = Number.isFinite(loadedPage) ? loadedPage : currentPage + 1;
        pagination.setAttribute('data-article-list-current-page', String(currentPage));
        pagination.setAttribute('data-article-list-next-url', nextPageURL);
        emitAnalyticsEvent('load_more_posts', {
          feed: feed.getAttribute('data-article-list-feed') || '',
          current_page: currentPage,
          next_page: nextPageURL ? currentPage + 1 : null,
        });

        if (!nextPageURL) {
          stopObserver();
          emitAnalyticsEvent('reach_list_end', {
            feed: feed.getAttribute('data-article-list-feed') || '',
            page: currentPage,
          });
        }
      } catch (error) {
        stopObserver();
        mode = 'pagination';
        persistPostsScrollMode(mode);
        setInfiniteUIState(false);
      } finally {
        isLoading = false;
      }
    };

    const startObserver = () => {
      if (!(sentinel instanceof HTMLElement) || !nextPageURL) {
        return;
      }

      observer = new window.IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              appendNextPage();
            }
          });
        },
        {
          rootMargin: '320px 0px'
        }
      );

      observer.observe(sentinel);
    };

    const applyMode = (nextMode, { persist = true, shouldReloadOnPagination = false } = {}) => {
      const normalizedMode = normalizePostsScrollMode(nextMode);
      mode = normalizedMode;

      if (!supportsInfinite || !Number.isFinite(currentPage) || currentPage > 1) {
        mode = 'pagination';
      }

      if (persist) {
        persistPostsScrollMode(mode);
      }

      if (mode === 'pagination') {
        stopObserver();
        setInfiniteUIState(false);
        if (shouldReloadOnPagination) {
          window.location.reload();
        }
        return;
      }

      stopObserver();
      setInfiniteUIState(true);
      startObserver();
    };

    window.addEventListener(postsScrollModeChangeEventName, (event) => {
      const detail = event instanceof CustomEvent ? event.detail : null;
      const nextMode =
        detail && typeof detail.mode === 'string'
          ? normalizePostsScrollMode(detail.mode)
          : 'pagination';
      applyMode(nextMode, {
        persist: true,
        shouldReloadOnPagination: nextMode === 'pagination'
      });
    });

    applyMode(mode, { persist: false, shouldReloadOnPagination: false });
  });
};
