// 说明：根据标题数量自适应排版密度（大纲字号/间距、正文段落间距等）。
// 注意：统一写入 CSS 变量，避免直接操作具体样式类，便于主题整体调参。

import { clampNumber, lerpNumber } from './utils.js';

export const applyOutlineAdaptiveSpacing = (root, count) => {
  const safeCount = Math.max(count, 1);
  const minCount = 4;
  const maxCount = 24;
  const normalized = clampNumber((safeCount - minCount) / (maxCount - minCount), 0, 1);
  const relaxed = 1 - normalized;

  const outlineFont = lerpNumber(0.78, 0.92, relaxed);
  const outlineGap = lerpNumber(0.55, 0.85, relaxed);
  const outlineItemGap = lerpNumber(0.08, 0.2, relaxed);
  const outlinePaddingBlock = lerpNumber(0.16, 0.26, relaxed);
  const outlinePaddingInline = lerpNumber(0.38, 0.6, relaxed);
  const outlineLineHeight = outlineFont + lerpNumber(0.28, 0.36, relaxed);

  const sectionGap = lerpNumber(0.55, 1.0, relaxed);
  const headingMarginTop = lerpNumber(0.85, 1.25, relaxed);
  const headingMarginBottom = lerpNumber(0.24, 0.45, relaxed);
  const paragraphMargin = lerpNumber(0.28, 0.45, relaxed);
  const dividerMargin = lerpNumber(1.0, 1.6, relaxed);

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

