// 说明：阅读器宽度滑杆，支持 rem/pixel 标签更新与本地持久化。
export const setupReaderWidth = (panel, root) => {
  const readerWidthRange = panel.querySelector('[data-reader-width-range]');
  const readerWidthRemNode = panel.querySelector('[data-reader-width-rem]');
  const readerWidthPxNode = panel.querySelector('[data-reader-width-px]');
  const readerWidthStorageKey = 'tralume-reader-width';
  const readerWidthPresets = new Map([
    ['compact', 56],
    ['balanced', 64],
    ['wide', 80],
  ]);

  const defaultReaderBounds = { min: 52, max: 104 };
  const readerWidthBounds = {
    min: readerWidthRange instanceof HTMLInputElement ? Number.parseFloat(readerWidthRange.min) || defaultReaderBounds.min : defaultReaderBounds.min,
    max: readerWidthRange instanceof HTMLInputElement ? Number.parseFloat(readerWidthRange.max) || defaultReaderBounds.max : defaultReaderBounds.max,
  };

  const clampReaderWidth = (value) => {
    const safe = Number.isFinite(value) ? value : defaultReaderBounds.max;
    return Math.min(readerWidthBounds.max, Math.max(readerWidthBounds.min, safe));
  };

  const persistReaderWidth = (value) => {
    try {
      window.localStorage.setItem(readerWidthStorageKey, String(value));
    } catch (error) {
      // 说明：忽略本地存储失败，避免阻断交互。
    }
  };

  const readStoredReaderWidth = () => {
    try {
      const stored = window.localStorage.getItem(readerWidthStorageKey);
      if (stored) {
        const parsed = Number.parseFloat(stored);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      return null;
    }
    return null;
  };

  const resolveDefaultReaderWidth = () => {
    const presetAttr = root.getAttribute('data-reader-width');
    if (presetAttr && readerWidthPresets.has(presetAttr)) {
      return readerWidthPresets.get(presetAttr);
    }
    const explicitDefault = Number.parseFloat(root.getAttribute('data-reader-width-default') || '');
    if (Number.isFinite(explicitDefault)) {
      return explicitDefault;
    }
    return 64;
  };

  const updateReaderValueLabel = (value) => {
    if (readerWidthRemNode instanceof HTMLElement) {
      readerWidthRemNode.textContent = String(Math.round(value));
    }
    if (readerWidthPxNode instanceof HTMLElement) {
      const pxValue = Math.round(value * 16);
      readerWidthPxNode.textContent = String(pxValue);
    }
  };

  const applyReaderWidth = (value, shouldPersist = true) => {
    const nextValue = clampReaderWidth(value);
    root.style.setProperty('--reader-width-max', `${nextValue}rem`);
    if (readerWidthRange instanceof HTMLInputElement) {
      readerWidthRange.value = String(nextValue);
      readerWidthRange.setAttribute('aria-valuenow', String(Math.round(nextValue)));
    }
    updateReaderValueLabel(nextValue);
    if (shouldPersist) {
      persistReaderWidth(nextValue);
    }
  };

  const storedReaderWidth = readStoredReaderWidth();
  const initialReaderWidth = typeof storedReaderWidth === 'number' ? storedReaderWidth : resolveDefaultReaderWidth();
  applyReaderWidth(initialReaderWidth, false);

  if (readerWidthRange instanceof HTMLInputElement) {
    readerWidthRange.addEventListener('input', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        const value = Number.parseFloat(target.value);
        applyReaderWidth(value, false);
      }
    });
    readerWidthRange.addEventListener('change', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        const value = Number.parseFloat(target.value);
        applyReaderWidth(value, true);
      }
    });
  }
};
