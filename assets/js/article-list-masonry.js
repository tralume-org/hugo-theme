// 说明：将文章列表渐进增强为桌面双列 masonry。
// - DOM 顺序始终保持时间倒序，JS 只写入定位样式，不移动卡片节点。
// - 桌面端按时间顺序逐张放入当前更短的列，避免 flex/grid 的明显行对齐。
export const setupArticleListMasonry = () => {
  const lists = Array.from(document.querySelectorAll('.article-list--horizontal[data-article-list-items]'));
  if (!lists.length || typeof window.matchMedia !== 'function' || typeof window.MutationObserver !== 'function') {
    return;
  }

  const desktopQuery = window.matchMedia('(min-width: 48rem)');

  lists.forEach((list) => {
    let isApplying = false;
    let isRenderQueued = false;
    let nextIndex = 0;

    const collectCards = () => Array.from(list.querySelectorAll('.article-card'))
      .filter((card) => card instanceof HTMLElement);

    const ensureCardOrder = (cards) => {
      cards.forEach((card) => {
        if (!card.hasAttribute('data-masonry-order')) {
          card.setAttribute('data-masonry-order', String(nextIndex));
          nextIndex += 1;
        }
      });

      return [...cards].sort((a, b) => {
        const aOrder = Number.parseInt(a.getAttribute('data-masonry-order') || '0', 10);
        const bOrder = Number.parseInt(b.getAttribute('data-masonry-order') || '0', 10);
        return aOrder - bOrder;
      });
    };

    const resetLayout = (cards) => {
      list.classList.remove('is-masonry');
      list.style.removeProperty('height');
      cards.forEach((card) => {
        card.style.removeProperty('position');
        card.style.removeProperty('width');
        card.style.removeProperty('transform');
        card.style.removeProperty('--app-masonry-transform');
      });
    };

    const getMasonryGap = () => {
      const styles = window.getComputedStyle(list);
      return Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
    };

    const applyMasonry = (cards) => {
      const gap = getMasonryGap();
      const columnWidth = (list.clientWidth - gap) / 2;
      const columnHeights = [0, 0];

      list.classList.add('is-masonry');

      cards.forEach((card) => {
        const columnIndex = columnHeights[0] <= columnHeights[1] ? 0 : 1;
        const x = columnIndex === 0 ? 0 : columnWidth + gap;
        const y = columnHeights[columnIndex];

        card.style.width = `${columnWidth}px`;
        card.style.setProperty('--app-masonry-transform', `translate(${x}px, ${y}px)`);

        const height = card.getBoundingClientRect().height;
        columnHeights[columnIndex] += height + gap;
      });

      const maxHeight = Math.max(...columnHeights);
      list.style.height = `${Math.max(0, maxHeight - gap)}px`;
    };

    const watchCoverImages = (cards) => {
      cards.forEach((card) => {
        const image = card.querySelector('.article-card__cover');
        if (!(image instanceof HTMLImageElement) || image.hasAttribute('data-masonry-image-watched')) {
          return;
        }

        image.setAttribute('data-masonry-image-watched', 'true');
        image.addEventListener('load', scheduleRender, { once: true });
        image.addEventListener('error', scheduleRender, { once: true });
      });
    };

    const scheduleRender = () => {
      if (isApplying || isRenderQueued) {
        return;
      }

      isRenderQueued = true;
      window.requestAnimationFrame(() => {
        isRenderQueued = false;
        render();
      });
    };

    const render = () => {
      if (isApplying) {
        return;
      }

      isApplying = true;
      observer.disconnect();
      const cards = ensureCardOrder(collectCards());
      if (desktopQuery.matches) {
        applyMasonry(cards);
      } else {
        resetLayout(cards);
      }
      watchCoverImages(cards);
      observer.observe(list, { childList: true, subtree: true });
      isApplying = false;
    };

    const observer = new MutationObserver(() => {
      scheduleRender();
    });

    observer.observe(list, { childList: true, subtree: true });
    desktopQuery.addEventListener('change', scheduleRender);
    window.addEventListener('resize', scheduleRender, { passive: true });
    render();
  });
};
