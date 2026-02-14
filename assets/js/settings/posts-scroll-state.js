// 说明：统一管理“文章列表滚动模式”的存储、归一化与事件分发。
// 作用：给设置面板与列表渲染模块提供同一套状态语义，避免重复实现。

const storageKey = 'tralume-posts-scroll-mode';
const supportedModes = new Set(['pagination', 'infinite']);
const fallbackMode = 'pagination';

export const postsScrollModeChangeEventName = 'tralume:posts-scroll-mode-change';

export const normalizePostsScrollMode = (mode, defaultMode = fallbackMode) => {
  const normalizedDefault = supportedModes.has(defaultMode) ? defaultMode : fallbackMode;
  return supportedModes.has(mode) ? mode : normalizedDefault;
};

export const readStoredPostsScrollMode = () => {
  try {
    return window.localStorage.getItem(storageKey);
  } catch (error) {
    return null;
  }
};

export const persistPostsScrollMode = (mode) => {
  try {
    window.localStorage.setItem(storageKey, normalizePostsScrollMode(mode));
  } catch (error) {
    // 说明：忽略存储失败，避免受限环境抛错影响功能。
  }
};

export const dispatchPostsScrollModeChange = (mode) => {
  const normalizedMode = normalizePostsScrollMode(mode);
  window.dispatchEvent(
    new CustomEvent(postsScrollModeChangeEventName, {
      detail: { mode: normalizedMode },
    }),
  );
};
