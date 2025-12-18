// 说明：阅读器宽度滑杆，支持 %/pixel 标签更新与本地持久化。
export const setupReaderWidth = (panel, root) => {
  const readerWidthRange = panel.querySelector('[data-reader-width-range]');
  const readerWidthPercentNode = panel.querySelector('[data-reader-width-percent]');
  const readerWidthPxNode = panel.querySelector('[data-reader-width-px]');
  const readerWidthStorageKey = 'tralume-reader-width';
  const readerWidthPresets = new Map([
    ['compact', 72],
    ['balanced', 80],
    ['wide', 88],
  ]);

  const defaultReaderBounds = { min: 60, max: 92 };
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
    return 80;
  };

  const updateReaderValueLabel = (value) => {
    if (readerWidthPercentNode instanceof HTMLElement) {
      readerWidthPercentNode.textContent = String(Math.round(value));
    }
    if (readerWidthPxNode instanceof HTMLElement) {
      const pxValue = Math.round((window.innerWidth * value) / 100);
      readerWidthPxNode.textContent = String(pxValue);
    }
  };

  const applyReaderWidth = (value, shouldPersist = true) => {
    const nextValue = clampReaderWidth(value);
    root.style.setProperty('--reader-width-max', String(nextValue));
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
