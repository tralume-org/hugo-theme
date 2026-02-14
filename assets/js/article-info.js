import { copyTextToClipboard } from './utils/clipboard.js';

// 说明：文章信息卡片增强逻辑（Article Info）。
// 作用：为“永久链接”提供一键复制按钮，减少用户手动选中/复制的操作成本。
// 注意：优先使用 Clipboard API；失败时回退到 execCommand('copy')，并在成功后短暂显示“已复制”状态。

export const setupArticleInfo = () => {
  const root = document.querySelector('[data-article-info]');
  if (!root) {
    return;
  }

  const buttons = root.querySelectorAll('[data-article-permalink-copy]');
  if (!buttons.length) {
    return;
  }

  buttons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    if (button.dataset.copyBound === 'true') {
      return;
    }
    button.dataset.copyBound = 'true';

    const copyLabel = button.dataset.copyLabel || button.textContent || 'Copy';
    const copiedLabel = button.dataset.copiedLabel || 'Copied';
    const copyTextValue = button.dataset.copyText || '';
    const initialAriaLabel = button.getAttribute('aria-label') || copyLabel;

    let revertTimer = 0;
    const resetState = () => {
      button.classList.remove('is-copied');
      button.textContent = copyLabel;
      button.setAttribute('aria-label', initialAriaLabel);
    };

    button.addEventListener('click', async () => {
      window.clearTimeout(revertTimer);
      const success = await copyTextToClipboard(copyTextValue);
      if (!success) {
        resetState();
        return;
      }

      button.classList.add('is-copied');
      button.textContent = copiedLabel;
      button.setAttribute('aria-label', copiedLabel);
      revertTimer = window.setTimeout(resetState, 1600);
    });
  });
};
