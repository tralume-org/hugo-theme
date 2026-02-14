import {
  dispatchPostsScrollModeChange,
  normalizePostsScrollMode,
  persistPostsScrollMode,
  readStoredPostsScrollMode,
} from './posts-scroll-state.js';

// 说明：文章列表滚动模式设置（分页 / 无限滚动），并同步到 localStorage。
export const setupPostsScrollMode = (panel) => {
  const controls = panel.querySelector('[data-posts-scroll-controls]');
  if (!(controls instanceof HTMLElement)) {
    return;
  }

  const buttons = Array.from(controls.querySelectorAll('[data-posts-scroll-option]'));
  if (!buttons.length) {
    return;
  }

  const updateButtons = (activeMode) => {
    buttons.forEach((button) => {
      const mode = button.getAttribute('data-posts-scroll-option');
      const isActive = mode === activeMode;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  let currentMode = 'pagination';

  const applyMode = (mode, { persist = true, notify = true } = {}) => {
    const normalizedMode = normalizePostsScrollMode(mode);
    currentMode = normalizedMode;
    updateButtons(normalizedMode);
    if (persist) {
      persistPostsScrollMode(normalizedMode);
    }
    if (notify) {
      dispatchPostsScrollModeChange(normalizedMode);
    }
  };

  const initialMode = readStoredPostsScrollMode();
  applyMode(initialMode, { persist: false, notify: false });

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.getAttribute('data-posts-scroll-option');
      if (!mode || mode === currentMode) {
        return;
      }
      applyMode(mode, { persist: true, notify: true });
    });
  });
};
