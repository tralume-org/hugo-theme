// 说明：/posts 列表的“分页 / 无限滚动”渐进增强。
// - 模式开关位于设置面板；本模块只负责按当前模式渲染与加载。
// - 无 JS 时自动回退 Hugo 原生分页，不影响 SEO 与可访问性。
export const setupArticleListInfiniteScroll = () => {
  const feeds = Array.from(document.querySelectorAll('[data-article-list-feed="posts"]'));
  if (!feeds.length) {
    return;
  }

  const storageKey = 'tralume-posts-scroll-mode';
  const supportedModes = new Set(['pagination', 'infinite']);

  const readStoredMode = () => {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  };

  const persistMode = (mode) => {
    try {
      window.localStorage.setItem(storageKey, mode);
    } catch (error) {
      // 说明：忽略存储失败，避免隐私模式下抛错中断功能。
    }
  };

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
    const currentPage = Number.parseInt(pagination.getAttribute('data-article-list-current-page') || '1', 10);
    let nextPageURL = pagination.getAttribute('data-article-list-next-url') || '';

    const storedMode = readStoredMode();
    let mode = supportedModes.has(storedMode) ? storedMode : defaultMode;
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
        nextPageURL = readNextPageURL(nextPagination);
        pagination.setAttribute('data-article-list-next-url', nextPageURL);

        if (!nextPageURL) {
          stopObserver();
        }
      } catch (error) {
        stopObserver();
        mode = 'pagination';
        persistMode(mode);
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
      const normalizedMode = supportedModes.has(nextMode) ? nextMode : 'pagination';
      mode = normalizedMode;

      if (!supportsInfinite || !Number.isFinite(currentPage) || currentPage > 1) {
        mode = 'pagination';
      }

      if (persist) {
        persistMode(mode);
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

    window.addEventListener('tralume:posts-scroll-mode-change', (event) => {
      const detail = event instanceof CustomEvent ? event.detail : null;
      const nextMode = detail && typeof detail.mode === 'string' ? detail.mode : 'pagination';
      applyMode(nextMode, {
        persist: true,
        shouldReloadOnPagination: nextMode === 'pagination'
      });
    });

    applyMode(mode, { persist: false, shouldReloadOnPagination: false });
  });
};
