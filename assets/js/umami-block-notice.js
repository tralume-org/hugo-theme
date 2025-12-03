// 说明：检测 Umami 脚本是否被拦截，若失败则展示贴边提示并支持永久忽略。
export const setupUmamiBlockNotice = () => {
  const scriptEl = document.querySelector('script[data-website-id][data-umami-block-notice="true"]');
  const noticeEl = document.querySelector('[data-component="umami-block-notice"]');

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

  const closeNotice = () => {
    markResolved();
    persistIgnored();
    noticeEl.remove();
  };

  if (ignoreBtn) {
    ignoreBtn.addEventListener('click', closeNotice);
  }

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
