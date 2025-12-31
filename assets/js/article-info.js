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

  // 说明：复制逻辑同时支持 Clipboard API 与传统命令，提升兼容性。
  const copyText = async (text) => {
    if (!text) {
      return false;
    }
    const normalized = String(text).replace(/\u00A0/g, ' ');
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(normalized);
        return true;
      }
    } catch (error) {
      // 说明：忽略 Clipboard API 的失败，继续尝试后备方案。
    }

    const textarea = document.createElement('textarea');
    textarea.value = normalized;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.select();
    let succeeded = false;
    try {
      succeeded = document.execCommand('copy');
    } catch (error) {
      succeeded = false;
    }
    textarea.remove();
    return succeeded;
  };

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
      const success = await copyText(copyTextValue);
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
