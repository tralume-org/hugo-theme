// 说明：检测 Umami 脚本是否被拦截，若失败则展示贴边提示并支持永久忽略。
export const setupUmamiBlockNotice = () => {
  const scriptEl = document.querySelector('script[data-website-id][data-umami-block-notice="true"]');
  const noticeEl = document.querySelector('[data-component="umami-block-notice"]');
  const dialogEl = document.querySelector('[data-component="umami-block-dialog"]');
  const dialogBackdropEl = dialogEl?.querySelector('[data-umami-dialog-part="backdrop"]');
  const dialogCloseBtn = dialogEl?.querySelector('[data-umami-dialog-action="close"]');

  // 说明：仅在开启提示且存在脚本与占位节点时执行。
  if (!scriptEl || !noticeEl) {
    return;
  }

  const storageKey = 'tralume-umami-block-notice-ignored';
  const detectTimeout = Number(scriptEl.getAttribute('data-umami-detect-timeout')) || 4500;
  let resolved = false;
  let fallbackTimer = null;

  const getUmamiClient = () => {
    if (typeof window === 'undefined') {
      return null;
    }
    const client = window.umami;
    const isFunction = typeof client === 'function';
    const hasTrackMethod = client && typeof client.track === 'function';
    return isFunction || hasTrackMethod ? client : null;
  };

  const markResolved = () => {
    resolved = true;
    if (fallbackTimer) {
      window.clearTimeout(fallbackTimer);
    }
  };

  const readIgnored = () => {
    try {
      return window.localStorage.getItem(storageKey) === '1';
    } catch (error) {
      return false;
    }
  };

  const persistIgnored = () => {
    try {
      window.localStorage.setItem(storageKey, '1');
    } catch (error) {
      // 说明：忽略持久化异常，防止受限环境阻断交互。
    }
  };

  if (readIgnored()) {
    return;
  }

  const ignoreBtn = noticeEl.querySelector('[data-umami-action="dismiss"]');
  const moreBtn = noticeEl.querySelector('[data-umami-action="more"]');
  let dialogVisible = false;
  let noticeWasVisible = false;

  const closeNotice = () => {
    markResolved();
    persistIgnored();
    noticeEl.remove();
  };

  if (ignoreBtn) {
    ignoreBtn.addEventListener('click', closeNotice);
  }

  const hideNoticeTemporarily = () => {
    if (noticeEl.dataset.state === 'visible') {
      noticeWasVisible = true;
    }
    noticeEl.classList.remove('is-active');
    noticeEl.hidden = true;
  };

  const restoreNotice = () => {
    if (!noticeWasVisible || !noticeEl.isConnected) {
      return;
    }
    noticeEl.hidden = false;
    window.requestAnimationFrame(() => {
      noticeEl.classList.add('is-active');
    });
    noticeWasVisible = false;
  };

  // 说明：通过“了解更多”进入中央弹窗，遮罩覆盖页面，其它区域点击或按下 Esc 可关闭弹窗；关闭后恢复原提示。
  const hideDialog = () => {
    if (!dialogEl || !dialogVisible) {
      return;
    }
    dialogVisible = false;
    dialogEl.classList.remove('is-active');
    window.setTimeout(() => {
      if (!dialogVisible) {
        dialogEl.hidden = true;
      }
    }, 200);
    restoreNotice();
  };

  const showDialog = () => {
    if (!dialogEl || dialogVisible) {
      return;
    }
    markResolved();
    dialogVisible = true;
    dialogEl.hidden = false;
    window.requestAnimationFrame(() => {
      dialogEl.classList.add('is-active');
    });
    hideNoticeTemporarily();
  };

  if (moreBtn) {
    moreBtn.addEventListener('click', showDialog);
  }

  if (dialogBackdropEl) {
    dialogBackdropEl.addEventListener('click', hideDialog);
  }

  // 说明：底部关闭按钮用于收起弹窗，并重新展示提示条。
  if (dialogCloseBtn) {
    dialogCloseBtn.addEventListener('click', hideDialog);
  }

  const handleEscape = (event) => {
    if (event.key === 'Escape') {
      hideDialog();
    }
  };

  document.addEventListener('keydown', handleEscape);

  const revealNotice = () => {
    if (noticeEl.dataset.state === 'visible') {
      return;
    }
    markResolved();
    noticeEl.dataset.state = 'visible';
    noticeEl.hidden = false;
    window.requestAnimationFrame(() => {
      noticeEl.classList.add('is-active');
    });
  };

  // 说明：若初始化时全局已存在 umami 客户端，则直接视为正常加载，无需继续检测。
  if (getUmamiClient()) {
    return;
  }

  fallbackTimer = window.setTimeout(() => {
    if (resolved) {
      return;
    }
    if (!getUmamiClient()) {
      revealNotice();
    }
  }, detectTimeout);

  scriptEl.addEventListener('load', () => {
    // 说明：脚本成功加载即可认为未被拦截；额外做一次延迟检查以覆盖延迟注入的客户端。
    if (getUmamiClient()) {
      markResolved();
      return;
    }
    window.setTimeout(() => {
      if (resolved) {
        return;
      }
      if (getUmamiClient()) {
        markResolved();
      } else {
        revealNotice();
      }
    }, 600);
  });

  scriptEl.addEventListener('error', () => {
    if (resolved) {
      return;
    }
    revealNotice();
  });
};
