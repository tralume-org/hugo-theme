// 说明：背景图片 URL provider。
// 作用：负责读取/写入用户配置的图片 URL，并将其映射为 CSS 变量（--app-custom-background-*）。
// 注意：本模块不处理任何 UI（输入框、按钮、提示文案）；调用方只需根据返回值更新界面状态。

export const createUrlBackgroundProvider = ({ root, storageKey, storage } = {}) => {
  if (!(root instanceof HTMLElement)) {
    throw new Error('createUrlBackgroundProvider: "root" must be an HTMLElement.');
  }

  // 说明：保持现有存储键不变，避免用户已保存的背景配置失效。
  const key =
    typeof storageKey === 'string' && storageKey.trim().length > 0
      ? storageKey.trim()
      : 'tralume-custom-background-url';

  const backingStorage =
    storage ??
    (typeof window !== 'undefined' && window.localStorage ? window.localStorage : null);

  let hasCustomBackground = false;
  let hasStoredValueCache = null;

  const persist = (value) => {
    if (!backingStorage) {
      return;
    }
    try {
      if (value) {
        backingStorage.setItem(key, value);
        hasStoredValueCache = true;
      } else {
        backingStorage.removeItem(key);
        hasStoredValueCache = false;
      }
    } catch (error) {
      // 说明：忽略本地存储失败，避免在隐身模式或存储被禁用时报错。
    }
  };

  const readStoredValue = () => {
    if (!backingStorage) {
      return '';
    }
    try {
      const value = backingStorage.getItem(key) || '';
      hasStoredValueCache = value.length > 0;
      return value;
    } catch (error) {
      return '';
    }
  };

  // 说明：将 URL 写入 CSS 变量；空字符串会清除背景并回落到默认底色。
  const apply = (rawUrl, { persistValue = true } = {}) => {
    const trimmed = typeof rawUrl === 'string' ? rawUrl.trim() : '';
    if (!trimmed) {
      root.style.setProperty('--app-custom-background-image', 'none');
      root.style.setProperty('--app-custom-background-opacity', '0');
      hasCustomBackground = false;
      hasStoredValueCache = false;
      if (persistValue) {
        persist('');
      }
      return hasCustomBackground;
    }

    // 说明：使用 JSON 字符串转义，避免 url(...) 注入与引号破坏。
    const sanitized = JSON.stringify(trimmed);
    root.style.setProperty('--app-custom-background-image', `url(${sanitized})`);
    root.style.setProperty('--app-custom-background-opacity', '1');
    hasCustomBackground = true;
    hasStoredValueCache = true;
    if (persistValue) {
      persist(trimmed);
    }
    return hasCustomBackground;
  };

  return {
    storageKey: key,
    readStoredValue,
    apply,
    clear: (options) => apply('', options),
    // 说明：仅重置运行时状态，避免在其他 provider 覆盖背景时误判“当前已应用”。
    deactivate: () => {
      hasCustomBackground = false;
    },
    hasStoredValue: () => {
      if (typeof hasStoredValueCache === 'boolean') {
        return hasStoredValueCache;
      }
      return readStoredValue().length > 0;
    },
    isActive: () => hasCustomBackground,
  };
};
