// 说明：背景图归属水印管理器。
// 作用：管理左下角水印条与弹窗的显示/隐藏、文字更新与交互（打开/关闭弹窗）。
// 注意：本模块仅处理 Pixaroa provider 的归属信息；URL/Upload provider 暂不支持。

const STORAGE_KEY = 'tralume-pixaroa-attribution';

// 说明：许可证标识 → 短名称 i18n key 的映射（回退用；API 已直接提供 license_name）。
// 注意：key 名称中的连字符 `-` 在 i18n HTML 属性中需原样保留。
const LICENSE_SHORT_KEY_MAP = {
  'cc-by-4.0': 'backgroundLicenseShort_cc-by-4.0',
  'cc-by-sa-4.0': 'backgroundLicenseShort_cc-by-sa-4.0',
  'cc-by-nd-4.0': 'backgroundLicenseShort_cc-by-nd-4.0',
  'cc-by-nc-4.0': 'backgroundLicenseShort_cc-by-nc-4.0',
  'cc-by-nc-sa-4.0': 'backgroundLicenseShort_cc-by-nc-sa-4.0',
  'cc-by-nc-nd-4.0': 'backgroundLicenseShort_cc-by-nc-nd-4.0',
  'cc0-1.0': 'backgroundLicenseShort_cc0-1.0',
  arr: 'backgroundLicenseShort_arr',
};

// 说明：许可证标识 → 官方许可证页面 URL 的映射（回退用；API 已直接提供 license_url）。
const LICENSE_URL_MAP = {
  'cc-by-4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'cc-by-sa-4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
  'cc-by-nd-4.0': 'https://creativecommons.org/licenses/by-nd/4.0/',
  'cc-by-nc-4.0': 'https://creativecommons.org/licenses/by-nc/4.0/',
  'cc-by-nc-sa-4.0': 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  'cc-by-nc-nd-4.0': 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
  'cc0-1.0': 'https://creativecommons.org/publicdomain/zero/1.0/',
  arr: '',
};

// 说明：从 localStorage 读取归属数据，解析失败或不存在时返回 null。
const readAttribution = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      (parsed.photographer || parsed.license)
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

// 说明：从模板 data 属性读取 i18n 翻译文本，回退到英文默认值。
const readI18n = (key, fallbackLabel) => {
  // 说明：模板通过 data-* 属性嵌入 i18n 值，由 Hugo 在构建时填充。
  const attrName = `data-i18n-bg-${key}`;
  const barEl = document.querySelector('[data-component="background-attribution-bar"]');
  if (barEl) {
    const value = barEl.getAttribute(attrName);
    if (value) {
      return value;
    }
  }
  return fallbackLabel || key;
};

// 说明：获取许可证短名称（优先用 API 提供的 license_name，回退到 i18n 映射）。
const getLicenseShortName = (attribution) => {
  if (attribution.license_name) {
    return attribution.license_name;
  }
  const license = attribution.license || '';
  const key = LICENSE_SHORT_KEY_MAP[license];
  if (key) {
    return readI18n(key, license);
  }
  return license;
};

// 说明：获取许可证链接 URL（优先用 API 提供的 license_url，回退到内置映射）。
const getLicenseUrl = (attribution) => {
  if (attribution.license_url) {
    return attribution.license_url;
  }
  const license = attribution.license || '';
  return LICENSE_URL_MAP[license] || '';
};

// 说明：构建水印条文字（格式：Photo by 张三 / CC BY 4.0）。
const buildBarText = (attribution, formatTemplate) => {
  const photographer = attribution.photographer || '';
  const licenseShort = getLicenseShortName(attribution);
  return formatTemplate
    .replace('{photographer}', photographer)
    .replace('{license}', licenseShort);
};

// 说明：构建弹窗内容的 HTML 片段。
const buildDialogContent = (attribution) => {
  const labelPhotographer = readI18n('backgroundAttributionPhotographer', 'Photographer');
  const labelLicense = readI18n('backgroundAttributionLicense', 'License');
  const labelSource = readI18n('backgroundAttributionSource', 'Source');

  const photographer = attribution.photographer || '';
  const sourceUrl = attribution.source_url || '';
  const licenseShort = getLicenseShortName(attribution);
  const licenseUrl = getLicenseUrl(attribution);

  const rows = [];

  // 说明：摄影师行 —— API 中 source.author 无独立链接，显示为纯文本。
  if (photographer) {
    const escapedName = photographer
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    rows.push(
      `<div class="bg-attribution-dialog__row"><span class="bg-attribution-dialog__label">${labelPhotographer}</span><span class="bg-attribution-dialog__value">${escapedName}</span></div>`,
    );
  }

  // 说明：许可证行 —— 有链接则包裹 a 标签。
  const licenseHtml = licenseUrl
    ? `<a class="bg-attribution-dialog__value" href="${licenseUrl}" target="_blank" rel="noopener">${licenseShort}</a>`
    : `<span class="bg-attribution-dialog__value">${licenseShort}</span>`;
  rows.push(
    `<div class="bg-attribution-dialog__row"><span class="bg-attribution-dialog__label">${labelLicense}</span>${licenseHtml}</div>`,
  );

  // 说明：来源行 —— API 中 source.url 为原图页面链接（如 Unsplash 照片页）。
  if (sourceUrl) {
    const escapedUrl = sourceUrl.replace(/"/g, '&quot;');
    rows.push(
      `<div class="bg-attribution-dialog__row"><span class="bg-attribution-dialog__label">${labelSource}</span><a class="bg-attribution-dialog__value" href="${escapedUrl}" target="_blank" rel="noopener">${escapedUrl}</a></div>`,
    );
  }

  return rows.join('');
};

export const setupBackgroundAttribution = () => {
  const barEl = document.querySelector('[data-component="background-attribution-bar"]');
  const barTextEl = barEl?.querySelector('[data-bg-attribution-bar-text]');
  const dialogEl = document.querySelector('[data-component="background-attribution-dialog"]');
  const dialogContentEl = dialogEl?.querySelector('[data-bg-attribution-dialog-content]');
  const backdropEl = dialogEl?.querySelector('[data-bg-dialog-part="backdrop"]');
  const closeBtn = dialogEl?.querySelector('[data-bg-dialog-action="close"]');

  if (!barEl || !barTextEl || !dialogEl || !dialogContentEl) {
    return;
  }

  let dialogVisible = false;

  // 说明：读取水印条上的 i18n 格式模板（由 Hugo 模板在 data-* 属性中注入）。
  const barFormat =
    barEl.getAttribute('data-i18n-bg-backgroundAttributionBarFormat') ||
    readI18n('backgroundAttributionBarFormat', 'Photo by {photographer} / {license}');

  // 说明：隐藏水印条（清除背景或归属数据为空时调用）。
  const hideBar = () => {
    barEl.hidden = true;
  };

  // 说明：根据归属数据更新水印条文字并显示。
  const showBar = (attribution) => {
    if (!attribution) {
      hideBar();
      return;
    }
    barTextEl.textContent = buildBarText(attribution, barFormat);
    barEl.hidden = false;
  };

  // 说明：关闭弹窗。
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
    }, 250);
  };

  // 说明：打开弹窗并填入归属详情。
  const showDialog = () => {
    if (!dialogEl || dialogVisible) {
      return;
    }
    const attribution = readAttribution();
    if (!attribution) {
      return;
    }
    dialogVisible = true;
    dialogContentEl.innerHTML = buildDialogContent(attribution);
    dialogEl.hidden = false;
    window.requestAnimationFrame(() => {
      dialogEl.classList.add('is-active');
    });
  };

  // 说明：水印条点击 → 打开弹窗。
  barEl.addEventListener('click', showDialog);

  // 说明：遮罩点击 → 关闭弹窗。
  if (backdropEl) {
    backdropEl.addEventListener('click', hideDialog);
  }

  // 说明：关闭按钮 → 关闭弹窗。
  if (closeBtn) {
    closeBtn.addEventListener('click', hideDialog);
  }

  // 说明：Esc 键 → 关闭弹窗。
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      hideDialog();
    }
  });

  // 说明：初始化 —— 读取已存储的归属数据并显示水印。
  const initialAttribution = readAttribution();
  if (initialAttribution) {
    showBar(initialAttribution);
  }

  // 说明：对外暴露更新方法，供 background.js 在 Pixaroa 拉取成功后调用。
  return {
    /** 根据当前 localStorage 中的归属数据更新水印条显示状态。 */
    update: () => {
      const attribution = readAttribution();
      if (attribution) {
        showBar(attribution);
      } else {
        hideBar();
      }
    },
    /** 清除水印条显示（用于清除背景时）。 */
    hide: hideBar,
    /** 读取当前归属数据。 */
    read: readAttribution,
  };
};
