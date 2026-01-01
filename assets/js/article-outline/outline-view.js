// 说明：渲染文章大纲列表，并负责滚动/聚焦时的高亮与可见性维护。
// 注意：避免把滚动指标/进度计算逻辑塞进该文件，保持“视图层”单职责。

const readOutlineGap = (outline) => {
  if (!(outline instanceof HTMLElement)) {
    return 0;
  }
  const styles = window.getComputedStyle(outline);
  const raw = styles.getPropertyValue('row-gap') || styles.getPropertyValue('gap') || '0';
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const renderArticleOutline = ({ outline, list, emptyHint, layout, headings }) => {
  const baseLevel = headings.reduce((min, item) => Math.min(min, item.level), headings[0].level);
  list.innerHTML = '';

  const outlineEntries = headings.map((item) => {
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
      link,
    };
  });

  outline.setAttribute('data-outline-state', 'ready');
  if (emptyHint) {
    emptyHint.setAttribute('aria-hidden', 'true');
  }
  if (layout) {
    layout.classList.remove('article__layout--single');
  }

  const outlineHeader = outline.querySelector('.article__outline-header');

  return {
    outlineEntries,
    outlineHeader,
  };
};

export const createOutlineHighlighter = ({ outline, outlineHeader, outlineEntries, getScrollBehavior }) => {
  let activeId = '';

  const ensureOutlineVisibility = (link) => {
    if (!(outline instanceof HTMLElement) || !(link instanceof HTMLElement)) {
      return;
    }
    // 说明：大纲在移动端默认隐藏，仅在“全屏大纲”打开时展示；隐藏状态不应触发 scrollIntoView。
    if (!outline.getClientRects().length) {
      return;
    }
    const headerHeight = outlineHeader instanceof HTMLElement ? outlineHeader.offsetHeight : 0;
    const outlineGap = readOutlineGap(outline);
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
          behavior: getScrollBehavior(),
        });
      } catch (error) {
        link.scrollIntoView(true);
      }
    }
  };

  // 说明：同步激活态样式，保证仅一个标题高亮，同时保持大纲视窗内可见。
  const applyActiveId = (nextId, suppressEnsureVisibility = false) => {
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

    if (activeEntry && !suppressEnsureVisibility) {
      ensureOutlineVisibility(activeEntry.link);
    }
  };

  return {
    applyActiveId,
    // 说明：暴露当前激活的标题 id，便于全屏大纲打开时将对应条目滚动到可见区域。
    getActiveId: () => activeId,
  };
};

export const attachOutlineFocusSync = ({ outlineEntries, onFocus }) => {
  outlineEntries.forEach((entry) => {
    entry.link.addEventListener('focus', () => {
      onFocus(entry.id);
    });
  });
};
