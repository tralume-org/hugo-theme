// 说明：采集正文标题并规范化（层级、文本、锚点 id）。
// 注意：锚点 id 需在全文范围内唯一，避免重复导致跳转错误。

const createHeadingSlug = (text, fallbackIndex) => {
  let baseSlug = text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!baseSlug) {
    baseSlug = `section-${fallbackIndex}`;
  }
  return baseSlug;
};

const ensureUniqueHeadingId = (heading, text, index) => {
  if (!(heading instanceof HTMLElement)) {
    return '';
  }

  if (heading.id) {
    return heading.id;
  }

  const baseSlug = createHeadingSlug(text, index + 1);
  let candidate = baseSlug;
  let attempts = 1;
  while (document.getElementById(candidate)) {
    candidate = `${baseSlug}-${attempts++}`;
  }
  heading.id = candidate;
  return heading.id;
};

export const collectOutlineHeadings = (content) => {
  const headingElements = Array.from(content.querySelectorAll('h2, h3, h4, h5, h6')).filter(
    (heading) => heading instanceof HTMLElement,
  );

  return headingElements
    .map((heading, index) => {
      const level = Number.parseInt(heading.tagName.replace(/^H/i, ''), 10);
      const text = (heading.textContent || '').trim();
      if (!text) {
        return null;
      }

      const id = ensureUniqueHeadingId(heading, text, index);
      if (!id) {
        return null;
      }

      return {
        element: heading,
        id,
        level: Number.isFinite(level) ? level : 2,
        text,
      };
    })
    .filter(Boolean);
};

