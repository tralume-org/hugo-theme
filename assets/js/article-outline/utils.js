// 说明：文章大纲模块通用工具。
// 注意：仅放置与业务无关的基础工具，避免在其他模块里重复实现。

export const clampNumber = (value, min, max) => {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
};

export const lerpNumber = (min, max, t) => min + (max - min) * t;

