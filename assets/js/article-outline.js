// 说明：文章阅读增强逻辑，负责生成大纲、同步滚动高亮与阅读进度条。
export const setupArticleOutline = () => {
  const root = document.querySelector('[data-article-root]');
  if (!root) {
    return;
  }

  const content = root.querySelector('[data-article-content]');
  const outline = root.querySelector('[data-article-outline]');
  const list = outline ? outline.querySelector('[data-article-outline-list]') : null;
  const emptyHint = outline ? outline.querySelector('[data-article-outline-empty]') : null;
  const layout = root.querySelector('[data-article-layout]');
  const progressHost = document.querySelector('[data-article-progress-floating]');
  const progressMeter = progressHost ? progressHost.querySelector('[data-article-progress-floating-meter]') : null;
  const progressLabel = progressHost ? progressHost.querySelector('[data-article-progress-floating-label]') : null;

  if (!content || !outline || !list || !progressMeter || !progressLabel) {
    return;
  }

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const lerp = (min, max, t) => min + (max - min) * t;

  let progressCircumference = 1;
  if (progressMeter instanceof SVGCircleElement) {
    const radius = progressMeter.r.baseVal.value || 16;
    progressCircumference = radius > 0 ? 2 * Math.PI * radius : 1;
    const dashArray = `${progressCircumference} ${progressCircumference}`;
    progressMeter.style.strokeDasharray = dashArray;
    progressMeter.style.strokeDashoffset = `${progressCircumference}`;
  }

  const headingElements = Array.from(content.querySelectorAll('h2, h3, h4, h5, h6')).filter(
    (heading) => heading instanceof HTMLElement
  );

  const normalizedHeadings = headingElements
    .map((heading, index) => {
      const level = Number.parseInt(heading.tagName.replace(/^H/i, ''), 10);
      const text = (heading.textContent || '').trim();
      if (!text) {
        return null;
      }

      if (!heading.id) {
        let baseSlug = text
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\u4e00-\u9fff-]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');
        if (!baseSlug) {
          baseSlug = `section-${index + 1}`;
        }
        let candidate = baseSlug;
        let attempts = 1;
        while (document.getElementById(candidate)) {
          candidate = `${baseSlug}-${attempts++}`;
        }
        heading.id = candidate;
      }

      return {
        element: heading,
        id: heading.id,
        level: Number.isFinite(level) ? level : 2,
        text
      };
    })
    .filter(Boolean);

  let outlineEntries = [];
  const outlineHeader = outline.querySelector('.article__outline-header');
  const prefersReducedMotion =
    typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const getScrollBehavior = () => (prefersReducedMotion && prefersReducedMotion.matches ? 'auto' : 'smooth');

  const readOutlineGap = () => {
    if (!(outline instanceof HTMLElement)) {
      return 0;
    }
    const styles = window.getComputedStyle(outline);
    const raw = styles.getPropertyValue('row-gap') || styles.getPropertyValue('gap') || '0';
    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const ensureOutlineVisibility = (link) => {
    if (!(outline instanceof HTMLElement) || !(link instanceof HTMLElement)) {
      return;
    }
    const headerHeight = outlineHeader instanceof HTMLElement ? outlineHeader.offsetHeight : 0;
    const outlineGap = readOutlineGap();
    const containerRect = outline.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const padding = 12;
    const topBoundary = containerRect.top + headerHeight + outlineGap + padding;
    const bottomBoundary = containerRect.bottom - padding;

    if (linkRect.top < topBoundary || linkRect.bottom > bottomBoundary) {
      try {
        link.scrollIntoView({
          block: 'center',
          inline: 'nearest',
          behavior: getScrollBehavior()
        });
      } catch (error) {
        link.scrollIntoView(true);
      }
    }
  };

  if (normalizedHeadings.length) {
    if (layout) {
      layout.classList.remove('article__layout--single');
    }
    const baseLevel = normalizedHeadings.reduce(
      (min, item) => Math.min(min, item.level),
      normalizedHeadings[0].level
    );

    list.innerHTML = '';

    outlineEntries = normalizedHeadings.map((item) => {
      const listItem = document.createElement('li');
      listItem.className = 'article__outline-item';
      const relativeLevel = Math.max(item.level - baseLevel, 0);
      listItem.dataset.outlineLevel = String(relativeLevel);

      const link = document.createElement('a');
      link.className = 'article__outline-link';
      link.href = `#${item.id}`;
      link.textContent = item.text;

      listItem.appendChild(link);
      list.appendChild(listItem);

      return {
        element: item.element,
        id: item.id,
        link
      };
    });

    outline.setAttribute('data-outline-state', 'ready');
    if (emptyHint) {
      emptyHint.setAttribute('aria-hidden', 'true');
    }
  } else {
    outline.setAttribute('data-outline-state', 'hidden');
    if (layout) {
      layout.classList.add('article__layout--single');
    }
    if (progressHost instanceof HTMLElement) {
      progressHost.setAttribute('hidden', 'hidden');
    }
    return;
  }

  const applyAdaptiveSpacing = (count) => {
    const safeCount = Math.max(count, 1);
    const minCount = 4;
    const maxCount = 24;
    const normalized = clamp((safeCount - minCount) / (maxCount - minCount), 0, 1);
    const relaxed = 1 - normalized;

    const outlineFont = lerp(0.78, 0.92, relaxed);
    const outlineGap = lerp(0.55, 0.85, relaxed);
    const outlineItemGap = lerp(0.08, 0.2, relaxed);
    const outlinePaddingBlock = lerp(0.16, 0.26, relaxed);
    const outlinePaddingInline = lerp(0.38, 0.6, relaxed);
    const outlineLineHeight = outlineFont + lerp(0.28, 0.36, relaxed);

    const sectionGap = lerp(0.55, 1.0, relaxed);
    const headingMarginTop = lerp(0.85, 1.25, relaxed);
    const headingMarginBottom = lerp(0.24, 0.45, relaxed);
    const paragraphMargin = lerp(0.28, 0.45, relaxed);
    const dividerMargin = lerp(1.0, 1.6, relaxed);

    root.style.setProperty('--article-outline-font-size', `${outlineFont.toFixed(3)}rem`);
    root.style.setProperty('--article-outline-line-height', `${outlineLineHeight.toFixed(3)}rem`);
    root.style.setProperty('--article-outline-gap', `${outlineGap.toFixed(3)}rem`);
    root.style.setProperty('--article-outline-item-gap', `${outlineItemGap.toFixed(3)}rem`);
    root.style.setProperty('--article-outline-link-padding-block', `${outlinePaddingBlock.toFixed(3)}rem`);
    root.style.setProperty('--article-outline-link-padding-inline', `${outlinePaddingInline.toFixed(3)}rem`);
    root.style.setProperty('--article-section-gap', `${sectionGap.toFixed(3)}rem`);
    root.style.setProperty('--article-heading-margin-top', `${headingMarginTop.toFixed(3)}rem`);
    root.style.setProperty('--article-heading-margin-bottom', `${headingMarginBottom.toFixed(3)}rem`);
    root.style.setProperty('--article-paragraph-margin', `${paragraphMargin.toFixed(3)}rem`);
    root.style.setProperty('--article-divider-margin', `${dividerMargin.toFixed(3)}rem`);
  };

  applyAdaptiveSpacing(normalizedHeadings.length);

  const applyProgressVisuals = (value) => {
    const safeValue = clamp(value, 0, 1);
    const percent = Math.round(safeValue * 100);
    progressLabel.textContent = `${percent}%`;
    if (progressMeter instanceof SVGCircleElement) {
      const offset = progressCircumference * (1 - safeValue);
      progressMeter.style.strokeDashoffset = `${offset}`;
    }

    if (progressHost instanceof HTMLElement) {
      progressHost.setAttribute('aria-valuenow', String(percent));
    }
  };

  applyProgressVisuals(0);

  let activeId = '';
  let isScrollingToTop = false;

  const getScrollRoot = () => {
    const scrollRoot = document.scrollingElement || document.documentElement;
    return scrollRoot instanceof HTMLElement ? scrollRoot : null;
  };

  const scrollToPageTop = () => {
    const scrollRoot = getScrollRoot();
    if (!scrollRoot) {
      window.scrollTo(0, 0);
      return;
    }

    const behavior = getScrollBehavior();
    if (behavior === 'auto') {
      isScrollingToTop = false;
      scrollRoot.scrollTop = 0;
      window.scrollTo(0, 0);
      return;
    }

    // 说明：使用脚本驱动的平滑回顶，避免部分浏览器在长文场景下 `window.scrollTo({ behavior: "smooth" })` 被中途打断。
    const startTop = scrollRoot.scrollTop;
    if (startTop <= 1) {
      return;
    }

    isScrollingToTop = true;
    const durationMs = clamp(280 + startTop / 6, 320, 1200);
    const startTime = typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const t = clamp(elapsed / durationMs, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const nextTop = Math.round(startTop * (1 - eased));

      scrollRoot.scrollTop = nextTop;

      if (nextTop <= 1 || t >= 1) {
        scrollRoot.scrollTop = 0;
        isScrollingToTop = false;
        return;
      }

      window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  };

  // 说明：同步激活态样式，保证仅一个标题高亮，同时保持大纲视窗内可见。
  const applyActiveId = (nextId) => {
    if (!outlineEntries.length || !nextId) {
      return;
    }
    activeId = nextId;
    let activeEntry = null;
    outlineEntries.forEach((entry) => {
      const isActive = entry.id === activeId;
      entry.link.classList.toggle('is-active', isActive);
      if (isActive) {
        activeEntry = entry;
      }
    });

    if (activeEntry && !isScrollingToTop) {
      ensureOutlineVisibility(activeEntry.link);
    }
  };

  const metrics = {
    contentTop: 0,
    contentBottom: 0,
    totalScrollable: 1,
    headingOffsets: []
  };

  // 说明：重新计算内容高度与各标题的绝对位置，便于滚动时高亮准确。
  const recalcMetrics = () => {
    const contentRect = content.getBoundingClientRect();
    metrics.contentTop = contentRect.top + window.scrollY;
    metrics.contentBottom = metrics.contentTop + content.scrollHeight;
    metrics.headingOffsets = outlineEntries.map((entry) => {
      const rect = entry.element.getBoundingClientRect();
      return rect.top + window.scrollY;
    });

    const rawScrollable = metrics.contentBottom - metrics.contentTop - window.innerHeight;
    metrics.totalScrollable = rawScrollable > 0 ? rawScrollable : 1;
  };

  // 说明：根据滚动位置更新进度条宽度与无障碍信息。
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const reachedBottom = scrollTop + window.innerHeight >= metrics.contentBottom - 1;
    let progressValue = 0;

    if (metrics.contentBottom - metrics.contentTop <= window.innerHeight) {
      progressValue = scrollTop >= metrics.contentTop ? 1 : 0;
    } else if (reachedBottom) {
      progressValue = 1;
    } else {
      progressValue = clamp(
        (scrollTop - metrics.contentTop) / metrics.totalScrollable,
        0,
        1
      );
    }

    applyProgressVisuals(progressValue);

    // 说明：仅在真正回到页面顶部后再隐藏进度按钮。
    // 注意：阅读进度以正文起点为基准，接近正文顶部时会变为 0%；
    // 若此时直接隐藏（display:none），在长文平滑滚动回顶过程中可能中断滚动动画或造成“无法完全回到顶部”的观感。
    if (progressHost instanceof HTMLElement) {
      if (scrollTop <= 1) {
        progressHost.setAttribute('hidden', 'hidden');
      } else {
        progressHost.removeAttribute('hidden');
      }
    }
  };

  // 说明：定位当前视口内最接近的标题，驱动大纲高亮。
  const updateActiveHeading = () => {
    if (!outlineEntries.length) {
      return;
    }

    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;
    const anchorLine = scrollTop + viewportHeight * 0.3;
    const offsets = metrics.headingOffsets;

    let nextActiveId = outlineEntries[0].id;

    for (let index = 0; index < offsets.length; index += 1) {
      if (anchorLine >= offsets[index] - 1) {
        nextActiveId = outlineEntries[index].id;
      } else {
        break;
      }
    }

    if (scrollTop + viewportHeight >= metrics.contentBottom - 1) {
      nextActiveId = outlineEntries[outlineEntries.length - 1].id;
    }

    applyActiveId(nextActiveId);
  };

  let ticking = false;

  // 说明：滚动与进度更新节流，避免频繁计算。
  const handleScroll = () => {
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(() => {
      updateProgress();
      updateActiveHeading();
      ticking = false;
    });
  };

  const syncLayouts = () => {
    recalcMetrics();
    updateProgress();
    updateActiveHeading();
  };

  syncLayouts();

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', () => {
    syncLayouts();
  });
  window.addEventListener('load', () => {
    syncLayouts();
  });

  const mediaNodes = Array.from(content.querySelectorAll('img, video, iframe'));
  mediaNodes.forEach((node) => {
    node.addEventListener('load', syncLayouts, { once: true });
  });

  outlineEntries.forEach((entry) => {
    entry.link.addEventListener('focus', () => {
      applyActiveId(entry.id);
    });
  });

  if (progressHost instanceof HTMLElement) {
    progressHost.addEventListener('click', () => {
      scrollToPageTop();
    });
  }
};
