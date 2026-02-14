// 说明：背景图片上传（本地文件）provider。
// 作用：允许用户选择本地图片作为背景，并通过 IndexedDB 将图片持久化到当前浏览器。
// 注意：这是“本地存储”，不会上传到服务器；图片仅在当前设备/浏览器可用。

const openDatabase = (dbName, storeName) =>
  new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available.'));
      return;
    }

    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB.'));
  });

const withStore = async ({ dbName, storeName, mode, operation }) => {
  const db = await openDatabase(dbName, storeName);
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      operation({ store, resolve, reject });
      transaction.oncomplete = () => resolve(undefined);
      transaction.onerror = () => reject(transaction.error || new Error('IndexedDB transaction failed.'));
    });
  } finally {
    db.close();
  }
};

export const createUploadBackgroundProvider = ({
  root,
  dbName = 'tralume-background',
  storeName = 'uploads',
  recordKey = 'current',
} = {}) => {
  if (!(root instanceof HTMLElement)) {
    throw new Error('createUploadBackgroundProvider: "root" must be an HTMLElement.');
  }

  let currentObjectUrl = null;
  let hasStoredUpload = false;
  let isActive = false;

  const releaseObjectUrl = () => {
    if (currentObjectUrl) {
      try {
        URL.revokeObjectURL(currentObjectUrl);
      } catch (error) {
        // 说明：忽略 revoke 失败，避免影响交互流程。
      }
      currentObjectUrl = null;
    }
  };

  const setCssBackgroundFromUrl = (url) => {
    const sanitized = JSON.stringify(url);
    root.style.setProperty('--app-custom-background-image', `url(${sanitized})`);
    root.style.setProperty('--app-custom-background-opacity', '1');
  };

  const clearCssBackground = () => {
    root.style.setProperty('--app-custom-background-image', 'none');
    root.style.setProperty('--app-custom-background-opacity', '0');
  };

  const readStoredBlob = async () => {
    try {
      const result = await withStore({
        dbName,
        storeName,
        mode: 'readonly',
        operation: ({ store, resolve, reject }) => {
          const request = store.get(recordKey);
          request.onsuccess = () => resolve(request.result ?? null);
          request.onerror = () => reject(request.error || new Error('Failed to read record.'));
        },
      });
      const blob = result instanceof Blob ? result : null;
      hasStoredUpload = Boolean(blob);
      return blob;
    } catch (error) {
      hasStoredUpload = false;
      return null;
    }
  };

  const persistBlob = async (blob) => {
    try {
      await withStore({
        dbName,
        storeName,
        mode: 'readwrite',
        operation: ({ store, resolve, reject }) => {
          const request = store.put(blob, recordKey);
          request.onsuccess = () => resolve(undefined);
          request.onerror = () => reject(request.error || new Error('Failed to persist record.'));
        },
      });
      hasStoredUpload = true;
      return true;
    } catch (error) {
      hasStoredUpload = false;
      return false;
    }
  };

  const removeStoredBlob = async () => {
    try {
      await withStore({
        dbName,
        storeName,
        mode: 'readwrite',
        operation: ({ store, resolve, reject }) => {
          const request = store.delete(recordKey);
          request.onsuccess = () => resolve(undefined);
          request.onerror = () => reject(request.error || new Error('Failed to delete record.'));
        },
      });
      hasStoredUpload = false;
      return true;
    } catch (error) {
      return false;
    }
  };

  const applyBlob = async (blob, { persistValue = true } = {}) => {
    if (!(blob instanceof Blob)) {
      return false;
    }

    if (persistValue) {
      await persistBlob(blob);
    } else {
      hasStoredUpload = true;
    }

    releaseObjectUrl();
    const objectUrl = URL.createObjectURL(blob);
    currentObjectUrl = objectUrl;
    setCssBackgroundFromUrl(objectUrl);
    isActive = true;
    return true;
  };

  const applyStored = async ({ persistValue = false } = {}) => {
    const stored = await readStoredBlob();
    if (!stored) {
      return false;
    }
    return applyBlob(stored, { persistValue });
  };

  const clear = async ({ persistValue = true } = {}) => {
    releaseObjectUrl();
    isActive = false;
    clearCssBackground();
    if (persistValue) {
      await removeStoredBlob();
    }
  };

  return {
    applyBlob,
    applyStored,
    clear,
    readStoredBlob,
    releaseObjectUrl,
    hasStoredUpload: () => hasStoredUpload,
    isActive: () => isActive,
    currentBackgroundUrl: () => currentObjectUrl || '',
  };
};
