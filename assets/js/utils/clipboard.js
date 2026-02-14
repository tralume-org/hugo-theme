// 说明：统一封装文本复制逻辑，优先使用 Clipboard API，失败时回退到 execCommand。
// 作用：避免各模块重复实现复制流程，降低维护成本与行为漂移风险。
export const copyTextToClipboard = async (text) => {
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
