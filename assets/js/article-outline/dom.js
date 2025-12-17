// 说明：集中获取文章大纲功能依赖的 DOM 节点。
// 注意：保持与现有模板的 data-* 约定一致，避免在业务逻辑里散落 querySelector。

export const getArticleOutlineElements = () => {
  const root = document.querySelector('[data-article-root]');
  if (!(root instanceof HTMLElement)) {
    return null;
  }

  const content = root.querySelector('[data-article-content]');
  const outline = root.querySelector('[data-article-outline]');
  const list = outline ? outline.querySelector('[data-article-outline-list]') : null;
  const emptyHint = outline ? outline.querySelector('[data-article-outline-empty]') : null;
  const layout = root.querySelector('[data-article-layout]');

  const progressHost = document.querySelector('[data-article-progress-floating]');
  const progressMeter = progressHost ? progressHost.querySelector('[data-article-progress-floating-meter]') : null;
  const progressLabel = progressHost ? progressHost.querySelector('[data-article-progress-floating-label]') : null;

  if (
    !(content instanceof HTMLElement) ||
    !(outline instanceof HTMLElement) ||
    !(list instanceof HTMLElement) ||
    !progressMeter ||
    !(progressLabel instanceof HTMLElement)
  ) {
    return null;
  }

  return {
    root,
    content,
    outline,
    list,
    emptyHint,
    layout,
    progressHost,
    progressMeter,
    progressLabel,
  };
};
