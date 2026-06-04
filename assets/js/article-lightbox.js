/* 说明：文章图片灯箱模块，基于原生 <dialog> 实现。
 * 作用：点击文章内带 data-lightbox 属性的图片时，在全屏弹窗中展示原图，支持 ESC / 遮罩点击 / 关闭按钮关闭。
 * 注意：dialog 在首次触发时懒创建，复用同一实例；关闭时清空内容以避免残留大图占用内存。
 */

let dialog = null;

/* 说明：创建或返回已存在的灯箱 dialog 实例，懒初始化以节省 DOM 开销。 */
const getDialog = () => {
  if (dialog) return dialog;

  dialog = document.createElement('dialog');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-label', document.documentElement.dataset.lightboxCloseLabel || 'Close lightbox');
  dialog.classList.add('app-lightbox');

  /* 说明：点击遮罩区域关闭灯箱。判断依据为点击目标为 dialog 本身而非内部图片。 */
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      closeLightbox();
    }
  });

  /* 说明：ESC 键关闭由 <dialog> 原生行为处理，此处仅做清理。 */
  dialog.addEventListener('close', () => {
    dialog.innerHTML = '';
  });

  document.body.appendChild(dialog);
  return dialog;
};

/* 说明：关闭灯箱并清理内部图片节点，释放内存。 */
const closeLightbox = () => {
  if (!dialog) return;
  if (dialog.open) {
    dialog.close();
  }
  dialog.innerHTML = '';
};

/* 说明：打开灯箱，插入图片与关闭按钮，以模态方式展示。 */
const openLightbox = (imgSrc, imgAlt) => {
  const d = getDialog();

  /* 说明：若灯箱已处于打开状态（用户连续点击不同图片），先关闭旧弹窗再打开新内容。
   *       close() 会同步触发 'close' 事件清空 innerHTML，避免手动清空产生竞态。 */
  if (d.open) {
    d.close();
  }

  /* 说明：构建灯箱内容：全尺寸图片 + 左上角关闭按钮。 */
  const content = document.createDocumentFragment();

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'app-lightbox__close app-glass app-glass--surface app-card app-card--interactive';
  closeBtn.setAttribute('aria-label', document.documentElement.dataset.lightboxCloseLabel || 'Close lightbox');
  closeBtn.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true">close</span>';
  closeBtn.addEventListener('click', closeLightbox);
  content.appendChild(closeBtn);

  const img = document.createElement('img');
  img.src = imgSrc;
  img.alt = imgAlt || '';
  img.className = 'app-lightbox__image';
  content.appendChild(img);

  d.innerHTML = '';
  d.appendChild(content);

  /* 说明：使用 showModal() 以触发原生 backdrop 与 ESC 关闭行为。 */
  d.showModal();
};

/* 说明：初始化灯箱，为所有 [data-lightbox] 图片绑定点击事件。
 *       使用事件委托监听 body，兼容动态加载的无限滚动内容。
 */
export const setupArticleLightbox = () => {
  document.body.addEventListener('click', (event) => {
    const target = event.target.closest('[data-lightbox]');
    if (!target) return;
    /* 说明：仅在文章正文区域内触发灯箱，避免干扰其他区域的图片点击。 */
    if (!target.closest('[data-article-content]')) return;

    event.preventDefault();
    openLightbox(target.src, target.alt);
  });
};
