import { emitAnalyticsEvent } from '../analytics-events.js';

// 说明：阅读器宽度滑杆，支持 %/pixel 标签更新与本地持久化。
export const setupReaderWidth = (panel, root) => {
  const readerWidthRange = panel.querySelector('[data-reader-width-range]');
  const readerWidthPercentNode = panel.querySelector('[data-reader-width-percent]');
  const readerWidthStorageKey = 'tralume-reader-width';

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
    const explicitDefault = Number.parseFloat(root.getAttribute('data-reader-width-default') || '');
    if (Number.isFinite(explicitDefault)) {
      return explicitDefault;
    }
    return 80;
  };

  const updateReaderValueLabel = (value) => {
    if (readerWidthPercentNode instanceof HTMLElement) {
      readerWidthPercentNode.textContent = `${Math.round(value)}%`;
    }
  };

  const applyReaderWidth = (value, shouldPersist = true) => {
    const nextValue = clampReaderWidth(value);
    const didChange = currentValue !== nextValue;
    currentValue = nextValue;
    root.style.setProperty('--reader-width-max', String(nextValue));
    if (readerWidthRange instanceof HTMLInputElement) {
      readerWidthRange.value = String(nextValue);
      readerWidthRange.setAttribute('aria-valuenow', String(Math.round(nextValue)));
    }
    updateReaderValueLabel(nextValue);
    if (shouldPersist) {
      persistReaderWidth(nextValue);
      if (didChange) {
        emitAnalyticsEvent('change_reader_width', {
          width: Math.round(nextValue),
        });
      }
    }
  };

  const storedReaderWidth = readStoredReaderWidth();
  const initialReaderWidth = typeof storedReaderWidth === 'number' ? storedReaderWidth : resolveDefaultReaderWidth();
  let currentValue = clampReaderWidth(initialReaderWidth);
  applyReaderWidth(currentValue, false);

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

  // 说明：响应“外观恢复默认值”，阅读宽度回退到站点默认值。
  panel.addEventListener('settings:appearance-reset', () => {
    applyReaderWidth(resolveDefaultReaderWidth(), true);
  });
};
