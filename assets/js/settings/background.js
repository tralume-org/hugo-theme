// 说明：自定义背景图与默认色板逻辑，支持输入 URL、持久化与按钮状态更新。
import { createUrlBackgroundProvider } from './background/providers/url.js';
import { createUploadBackgroundProvider } from './background/providers/upload.js';
import { createPixaroaBackgroundProvider } from './background/providers/pixaroa.js';

export const setupBackgroundControl = (panel, root) => {
  const backgroundSection = panel.querySelector('[data-background-section]');
  if (!backgroundSection) {
    return;
  }

  const providerTabs = Array.from(
    backgroundSection.querySelectorAll('[data-background-provider-tab]'),
  );
  const providerPanels = Array.from(
    backgroundSection.querySelectorAll('[data-background-provider-panel]'),
  );

  const backgroundInput = backgroundSection.querySelector('[data-background-input]');
  const backgroundApplyButton = backgroundSection.querySelector('[data-background-apply]');
  const backgroundResetButton = backgroundSection.querySelector('[data-background-reset]');
  const backgroundBlurRange = backgroundSection.querySelector('[data-background-blur-range]');
  const backgroundBlurLabel = backgroundSection.querySelector('[data-background-blur-label]');
  const uploadInput = backgroundSection.querySelector('[data-background-upload-input]');
  const uploadApplyButton = backgroundSection.querySelector('[data-background-upload-apply]');
  const uploadResetButton = backgroundSection.querySelector('[data-background-upload-reset]');
  const uploadStatus = backgroundSection.querySelector('[data-background-upload-status]');
  const pixaroaHostInput = backgroundSection.querySelector('[data-background-pixaroa-host]');
  const pixaroaTierSelect = backgroundSection.querySelector('[data-background-pixaroa-tier]');
  const pixaroaOrientationSelect = backgroundSection.querySelector('[data-background-pixaroa-orientation]');
  const pixaroaFormatSelect = backgroundSection.querySelector('[data-background-pixaroa-format]');
  const pixaroaApplyButton = backgroundSection.querySelector('[data-background-pixaroa-apply]');
  const pixaroaResetButton = backgroundSection.querySelector('[data-background-pixaroa-reset]');
  const pixaroaStatus = backgroundSection.querySelector('[data-background-pixaroa-status]');
  const backgroundBlurStorageKey = 'tralume-custom-background-blur';
  const backgroundUrlProvider = createUrlBackgroundProvider({
    root,
    // 说明：存储键保持不变，确保历史配置可继续读取。
    storageKey: 'tralume-custom-background-url',
  });
  const backgroundProviderStorageKey = 'tralume-custom-background-provider';
  const backgroundUploadProvider = createUploadBackgroundProvider({ root });
  const pixaroaBackgroundProvider = createPixaroaBackgroundProvider({ root });
  let activeProvider = 'url';

  const readStoredProvider = () => {
    try {
      const stored = window.localStorage.getItem(backgroundProviderStorageKey);
      return stored === 'upload' || stored === 'url' || stored === 'pixaroa' ? stored : '';
    } catch (error) {
      return '';
    }
  };

  const persistProvider = (provider) => {
    try {
      if (provider) {
        window.localStorage.setItem(backgroundProviderStorageKey, provider);
      } else {
        window.localStorage.removeItem(backgroundProviderStorageKey);
      }
    } catch (error) {
      // 说明：忽略存储失败，避免影响基础功能。
    }
  };

  // 说明：provider 切换逻辑只负责显示/隐藏对应面板；具体读写与应用由各 provider 自行处理。
  const setActiveProvider = (nextProvider, { shouldFocusTab = false } = {}) => {
    const normalized = typeof nextProvider === 'string' ? nextProvider.trim() : '';
    const resolved = normalized.length > 0 ? normalized : 'url';
    activeProvider = resolved;

    providerTabs.forEach((tab) => {
      const provider = tab.getAttribute('data-provider') || '';
      const isSelected = provider === resolved;
      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      tab.tabIndex = isSelected ? 0 : -1;
      if (shouldFocusTab && isSelected) {
        tab.focus();
      }
    });

    providerPanels.forEach((panelEl) => {
      const provider = panelEl.getAttribute('data-provider') || '';
      panelEl.hidden = provider !== resolved;
    });
  };

  // 说明：壁纸智能取色的默认调色板，确保亮/暗模式拥有安全回退。
  const wallpaperColorFallback = {
    lightPrimary: '#1f2329',
    lightOnPrimary: '#f7f8fb',
    lightPrimaryContainer: '#f6f8fc',
    lightOnPrimaryContainer: '#1c2026',
    darkPrimary: '#dfe3ea',
    darkOnPrimary: '#101215',
    darkPrimaryContainer: '#2c3038',
    darkOnPrimaryContainer: '#e7eaf2',
  };

  // 说明：加载时立即写入默认色板，避免历史缓存影响。
  const applyWallpaperPalette = () => {
    root.style.setProperty('--app-dynamic-primary-light', wallpaperColorFallback.lightPrimary);
    root.style.setProperty('--app-dynamic-on-primary-light', wallpaperColorFallback.lightOnPrimary);
    root.style.setProperty(
      '--app-dynamic-primary-container-light',
      wallpaperColorFallback.lightPrimaryContainer,
    );
    root.style.setProperty(
      '--app-dynamic-on-primary-container-light',
      wallpaperColorFallback.lightOnPrimaryContainer,
    );
    root.style.setProperty('--app-dynamic-primary-dark', wallpaperColorFallback.darkPrimary);
    root.style.setProperty('--app-dynamic-on-primary-dark', wallpaperColorFallback.darkOnPrimary);
    root.style.setProperty(
      '--app-dynamic-primary-container-dark',
      wallpaperColorFallback.darkPrimaryContainer,
    );
    root.style.setProperty(
      '--app-dynamic-on-primary-container-dark',
      wallpaperColorFallback.darkOnPrimaryContainer,
    );
  };

  applyWallpaperPalette();

  const readPixaroaConfigFromInputs = () => {
    const host =
      pixaroaHostInput instanceof HTMLInputElement ? pixaroaHostInput.value.trim() : '';
    const tier =
      pixaroaTierSelect instanceof HTMLSelectElement ? pixaroaTierSelect.value.trim() : 'auto';
    const orientation =
      pixaroaOrientationSelect instanceof HTMLSelectElement
        ? pixaroaOrientationSelect.value.trim()
        : 'auto';
    const format =
      pixaroaFormatSelect instanceof HTMLSelectElement ? pixaroaFormatSelect.value.trim() : 'auto';
    return { host, tier, orientation, format };
  };

  const persistPixaroaConfigFromInputs = () => {
    pixaroaBackgroundProvider.persistConfig(readPixaroaConfigFromInputs());
  };

  const setPixaroaStatus = (mode) => {
    if (!(pixaroaStatus instanceof HTMLElement)) {
      return;
    }
    const idleText = pixaroaStatus.getAttribute('data-idle') || '';
    const loadingText = pixaroaStatus.getAttribute('data-loading') || '';
    const errorText = pixaroaStatus.getAttribute('data-error') || '';

    if (mode === 'loading') {
      pixaroaStatus.textContent = loadingText || idleText;
      return;
    }
    if (mode === 'error') {
      pixaroaStatus.textContent = errorText || idleText;
      return;
    }
    pixaroaStatus.textContent = idleText;
  };

  const updatePixaroaButtons = () => {
    const hasStoredUrl = pixaroaBackgroundProvider.readStoredUrl().length > 0;
    const hasActive = pixaroaBackgroundProvider.isActive();
    const hasStoredProvider = readStoredProvider() === 'pixaroa';
    if (pixaroaResetButton instanceof HTMLButtonElement) {
      // 说明：即便 Pixaroa 拉取失败，只要用户曾选中过该 provider，也应允许一键清空并回退。
      pixaroaResetButton.disabled = !(hasStoredUrl || hasActive || hasStoredProvider);
    }
  };

  // 说明：背景模糊滑动块（仅影响背景图层），默认关闭（0px），支持持久化。
  if (backgroundBlurRange instanceof HTMLInputElement) {
    const blurMin = Number.isFinite(Number(backgroundBlurRange.min))
      ? Number(backgroundBlurRange.min)
      : 0;
    const blurMax = Number.isFinite(Number(backgroundBlurRange.max))
      ? Number(backgroundBlurRange.max)
      : 40;

    const clampNumber = (value, min, max) => {
      if (!Number.isFinite(value)) {
        return min;
      }
      return Math.max(min, Math.min(max, value));
    };

    const updateBlurLabel = (value) => {
      if (backgroundBlurLabel instanceof HTMLElement) {
        const unit = backgroundBlurLabel.getAttribute('data-unit') || 'px';
        backgroundBlurLabel.textContent = `${value}${unit}`;
      }
    };

    const persistBackgroundBlurValue = (value) => {
      try {
        window.localStorage.setItem(backgroundBlurStorageKey, String(value));
      } catch (error) {
        // 说明：忽略存储异常，避免影响设置面板交互。
      }
    };

    const readStoredBackgroundBlurValue = () => {
      try {
        const stored = window.localStorage.getItem(backgroundBlurStorageKey);
        if (stored) {
          const parsed = parseFloat(stored);
          if (!Number.isNaN(parsed)) {
            return parsed;
          }
        }
      } catch (error) {
        return null;
      }
      return null;
    };

    const handleBackgroundBlurChange = (value, shouldPersist = false) => {
      const base = clampNumber(value, blurMin, blurMax);
      root.style.setProperty('--app-custom-background-blur-radius', `${base}px`);
      backgroundBlurRange.value = String(base);
      backgroundBlurRange.setAttribute('aria-valuenow', String(base));
      updateBlurLabel(base);
      if (shouldPersist) {
        persistBackgroundBlurValue(base);
      }
    };

    const initialBlurValue = clampNumber(readStoredBackgroundBlurValue() ?? 0, blurMin, blurMax);
    handleBackgroundBlurChange(initialBlurValue, false);

    backgroundBlurRange.addEventListener('input', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        const value = parseFloat(target.value);
        handleBackgroundBlurChange(value, false);
      }
    });

    backgroundBlurRange.addEventListener('change', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        const value = parseFloat(target.value);
        handleBackgroundBlurChange(value, true);
      }
    });
  } else {
    root.style.setProperty('--app-custom-background-blur-radius', '0px');
  }

  const readBackgroundInputValue = () => {
    if (backgroundInput instanceof HTMLInputElement) {
      return backgroundInput.value.trim();
    }
    return '';
  };

  const updateUrlButtons = () => {
    const hasTypedValue = readBackgroundInputValue().length > 0;
    const hasCustomBackground = backgroundUrlProvider.isActive();
    if (backgroundApplyButton instanceof HTMLButtonElement) {
      backgroundApplyButton.disabled = !(hasTypedValue || hasCustomBackground);
    }
    if (backgroundResetButton instanceof HTMLButtonElement) {
      backgroundResetButton.disabled = !hasCustomBackground;
    }
  };

  const replacePlaceholderName = (template, name) => {
    if (typeof template !== 'string' || template.length === 0) {
      return '';
    }
    return template.replace('__NAME__', name);
  };

  const setUploadStatus = ({ mode, name } = {}) => {
    if (!(uploadStatus instanceof HTMLElement)) {
      return;
    }
    const emptyText = uploadStatus.getAttribute('data-empty') || '';
    const storedText = uploadStatus.getAttribute('data-stored') || '';
    const selectedTemplate = uploadStatus.getAttribute('data-selected-template') || '';

    if (mode === 'selected') {
      uploadStatus.textContent = replacePlaceholderName(selectedTemplate, name || '') || emptyText;
      return;
    }
    if (mode === 'stored') {
      uploadStatus.textContent = storedText || emptyText;
      return;
    }
    uploadStatus.textContent = emptyText;
  };

  const updateUploadButtons = ({ hasSelectedFile = false } = {}) => {
    const hasStoredUpload = backgroundUploadProvider.hasStoredUpload();
    if (uploadApplyButton instanceof HTMLButtonElement) {
      uploadApplyButton.disabled = !(hasSelectedFile || hasStoredUpload);
    }
    if (uploadResetButton instanceof HTMLButtonElement) {
      uploadResetButton.disabled = !hasStoredUpload;
    }
  };

  // 说明：对外保留原本的“应用”语义（含清空即移除），实际实现委托给 URL provider。
  const applyBackgroundImage = (rawUrl, shouldPersist = true) => {
    // 说明：URL 生效后可安全释放上传 provider 的 object URL（若存在），避免内存泄漏。
    backgroundUrlProvider.apply(rawUrl, { persistValue: shouldPersist });
    if (shouldPersist) {
      persistProvider(typeof rawUrl === 'string' && rawUrl.trim() ? 'url' : '');
    }
    backgroundUploadProvider.releaseObjectUrl();
    updateUrlButtons();
  };

  const applyUploadFile = async (file, { persistValue = true } = {}) => {
    if (!(file instanceof File)) {
      return false;
    }
    // 说明：切换到上传背景时，仅重置 URL provider 的运行时状态，避免误判“当前已应用 URL 背景”。
    backgroundUrlProvider.deactivate();
    const ok = await backgroundUploadProvider.applyBlob(file, { persistValue });
    if (ok) {
      if (persistValue) {
        persistProvider('upload');
      }
    }
    updateUrlButtons();
    updateUploadButtons({ hasSelectedFile: false });
    setUploadStatus({ mode: 'stored' });
    updatePixaroaButtons();
    return ok;
  };

  const applyStoredUploadIfAny = async () => {
    const ok = await backgroundUploadProvider.applyStored({ persistValue: false });
    if (ok) {
      backgroundUrlProvider.deactivate();
      setUploadStatus({ mode: 'stored' });
    }
    updateUploadButtons({ hasSelectedFile: false });
    updateUrlButtons();
    updatePixaroaButtons();
    return ok;
  };

  const initialBackgroundImage = backgroundUrlProvider.readStoredValue();
  if (backgroundInput instanceof HTMLInputElement) {
    backgroundInput.value = initialBackgroundImage;
  }

  // 说明：初始化 Pixaroa 表单：回填已保存的配置，避免每次打开都要重新输入。
  const initialPixaroaConfig = pixaroaBackgroundProvider.readStoredConfig();
  if (pixaroaHostInput instanceof HTMLInputElement) {
    pixaroaHostInput.value = initialPixaroaConfig.host || '';
  }
  if (pixaroaTierSelect instanceof HTMLSelectElement) {
    pixaroaTierSelect.value = initialPixaroaConfig.tier || 'auto';
  }
  if (pixaroaOrientationSelect instanceof HTMLSelectElement) {
    pixaroaOrientationSelect.value = initialPixaroaConfig.orientation || 'auto';
  }
  if (pixaroaFormatSelect instanceof HTMLSelectElement) {
    pixaroaFormatSelect.value = initialPixaroaConfig.format || 'auto';
  }
  setPixaroaStatus('idle');
  updatePixaroaButtons();

  // 说明：初始化 secondary tabs：读取模板默认选中项并绑定点击/键盘导航。
  if (providerTabs.length > 0 && providerPanels.length > 0) {
    const selectedTab = providerTabs.find((tab) => tab.getAttribute('aria-selected') === 'true');
    const initialProvider =
      (selectedTab && selectedTab.getAttribute('data-provider')) ||
      providerTabs[0]?.getAttribute('data-provider') ||
      'url';
    setActiveProvider(initialProvider, { shouldFocusTab: false });

    providerTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const provider = tab.getAttribute('data-provider') || 'url';
        setActiveProvider(provider, { shouldFocusTab: false });
        activeProvider = provider;
        updateUrlButtons();
        updateUploadButtons({
          hasSelectedFile:
            uploadInput instanceof HTMLInputElement && uploadInput.files && uploadInput.files.length > 0,
        });
        updatePixaroaButtons();
      });

      tab.addEventListener('keydown', (event) => {
        const { key } = event;
        const currentIndex = providerTabs.indexOf(tab);
        if (currentIndex < 0) {
          return;
        }

        const focusProviderAt = (index) => {
          const target = providerTabs[index];
          if (!target) {
            return;
          }
          const provider = target.getAttribute('data-provider') || 'url';
          setActiveProvider(provider, { shouldFocusTab: true });
          activeProvider = provider;
          updateUrlButtons();
          updateUploadButtons({
            hasSelectedFile:
              uploadInput instanceof HTMLInputElement && uploadInput.files && uploadInput.files.length > 0,
          });
          updatePixaroaButtons();
        };

        if (key === 'ArrowRight') {
          event.preventDefault();
          focusProviderAt((currentIndex + 1) % providerTabs.length);
          return;
        }
        if (key === 'ArrowLeft') {
          event.preventDefault();
          focusProviderAt((currentIndex - 1 + providerTabs.length) % providerTabs.length);
          return;
        }
        if (key === 'Home') {
          event.preventDefault();
          focusProviderAt(0);
          return;
        }
        if (key === 'End') {
          event.preventDefault();
          focusProviderAt(providerTabs.length - 1);
        }
      });
    });
  } else {
    // 说明：若模板未启用 provider tabs，默认按 URL provider 处理。
    setActiveProvider('url', { shouldFocusTab: false });
  }

  // 说明：根据上次使用的 provider 自动应用背景（若有保存），避免每次刷新都需要重新操作。
  const storedProvider = readStoredProvider();
  if (storedProvider) {
    setActiveProvider(storedProvider, { shouldFocusTab: false });
    activeProvider = storedProvider;
  }
  if (storedProvider === 'upload') {
    void applyStoredUploadIfAny().then((ok) => {
      if (!ok) {
        applyBackgroundImage(initialBackgroundImage, false);
        setUploadStatus({ mode: backgroundUploadProvider.hasStoredUpload() ? 'stored' : 'empty' });
      }
    });
  } else if (storedProvider === 'pixaroa') {
    // 说明：即便当前使用 Pixaroa 背景，也要同步“上传背景”面板的已保存状态提示。
    void backgroundUploadProvider.readStoredBlob().then((blob) => {
      setUploadStatus({ mode: blob ? 'stored' : 'empty' });
      updateUploadButtons({ hasSelectedFile: false });
    });
    const applied = pixaroaBackgroundProvider.applyStored({ persistValue: false });
    if (!applied) {
      // 说明：若无法从本地恢复（可能是存储不可用），则尝试按当前屏幕/浏览器能力拉取一次随机图。
      if (pixaroaApplyButton instanceof HTMLButtonElement) {
        pixaroaApplyButton.disabled = true;
      }
      setPixaroaStatus('loading');
      void pixaroaBackgroundProvider
        .applyRandom({ config: readPixaroaConfigFromInputs(), persistValue: false })
        .then(() => {
          backgroundUrlProvider.deactivate();
          backgroundUploadProvider.releaseObjectUrl();
          updateUrlButtons();
          updateUploadButtons({ hasSelectedFile: false });
          updatePixaroaButtons();
          setPixaroaStatus('idle');
        })
        .catch(() => {
          setPixaroaStatus('error');
        })
        .finally(() => {
          if (pixaroaApplyButton instanceof HTMLButtonElement) {
            pixaroaApplyButton.disabled = false;
          }
          updatePixaroaButtons();
        });
    } else {
      backgroundUrlProvider.deactivate();
      backgroundUploadProvider.releaseObjectUrl();
      updateUrlButtons();
      updateUploadButtons({ hasSelectedFile: false });
      updatePixaroaButtons();
      setPixaroaStatus('idle');
    }
  } else {
    applyBackgroundImage(initialBackgroundImage, false);
    void backgroundUploadProvider.readStoredBlob().then((blob) => {
      setUploadStatus({ mode: blob ? 'stored' : 'empty' });
      updateUploadButtons({ hasSelectedFile: false });
    });
  }
  updateUrlButtons();
  updatePixaroaButtons();

  const handleBackgroundApply = () => {
    const nextValue = readBackgroundInputValue();
    applyBackgroundImage(nextValue, true);
  };

  if (backgroundApplyButton instanceof HTMLButtonElement) {
    backgroundApplyButton.addEventListener('click', handleBackgroundApply);
  }

  if (backgroundInput instanceof HTMLInputElement) {
    backgroundInput.addEventListener('input', () => {
      updateUrlButtons();
    });
    backgroundInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleBackgroundApply();
      }
    });
  }

  if (backgroundResetButton instanceof HTMLButtonElement) {
    backgroundResetButton.addEventListener('click', () => {
      if (backgroundInput instanceof HTMLInputElement) {
        backgroundInput.value = '';
      }
      applyBackgroundImage('', true);
    });
  }

  // 说明：上传 provider：选择文件后可直接应用，并将图片持久化到 IndexedDB。
  if (uploadInput instanceof HTMLInputElement) {
    uploadInput.addEventListener('change', () => {
      const file = uploadInput.files && uploadInput.files[0];
      if (file) {
        setUploadStatus({ mode: 'selected', name: file.name });
        updateUploadButtons({ hasSelectedFile: true });
        void applyUploadFile(file, { persistValue: true });
      } else {
        setUploadStatus({
          mode: backgroundUploadProvider.hasStoredUpload() ? 'stored' : 'empty',
        });
        updateUploadButtons({ hasSelectedFile: false });
      }
    });
  }

  if (uploadApplyButton instanceof HTMLButtonElement) {
    uploadApplyButton.addEventListener('click', () => {
      const file =
        uploadInput instanceof HTMLInputElement && uploadInput.files ? uploadInput.files[0] : null;
      if (file) {
        void applyUploadFile(file, { persistValue: true });
        return;
      }
      void applyStoredUploadIfAny();
    });
  }

  if (uploadResetButton instanceof HTMLButtonElement) {
    uploadResetButton.addEventListener('click', () => {
      if (uploadInput instanceof HTMLInputElement) {
        uploadInput.value = '';
      }
      void backgroundUploadProvider.clear({ persistValue: true }).then(() => {
        persistProvider('');
        setUploadStatus({ mode: 'empty' });
        updateUploadButtons({ hasSelectedFile: false });
        updateUrlButtons();
        updatePixaroaButtons();
      });
    });
  }

  // 说明：Pixaroa provider：保存配置并拉取随机背景图。
  if (pixaroaHostInput instanceof HTMLInputElement) {
    pixaroaHostInput.addEventListener('change', () => {
      persistPixaroaConfigFromInputs();
      setPixaroaStatus('idle');
    });
  }
  if (pixaroaTierSelect instanceof HTMLSelectElement) {
    pixaroaTierSelect.addEventListener('change', () => {
      persistPixaroaConfigFromInputs();
      setPixaroaStatus('idle');
    });
  }
  if (pixaroaOrientationSelect instanceof HTMLSelectElement) {
    pixaroaOrientationSelect.addEventListener('change', () => {
      persistPixaroaConfigFromInputs();
      setPixaroaStatus('idle');
    });
  }
  if (pixaroaFormatSelect instanceof HTMLSelectElement) {
    pixaroaFormatSelect.addEventListener('change', () => {
      persistPixaroaConfigFromInputs();
      setPixaroaStatus('idle');
    });
  }

  if (pixaroaApplyButton instanceof HTMLButtonElement) {
    pixaroaApplyButton.addEventListener('click', () => {
      const config = readPixaroaConfigFromInputs();
      persistPixaroaConfigFromInputs();
      pixaroaApplyButton.disabled = true;
      setPixaroaStatus('loading');

      void pixaroaBackgroundProvider
        .applyRandom({ config, persistValue: true })
        .then(() => {
          // 说明：Pixaroa 生效后，清理其他 provider 的运行时状态，避免按钮逻辑误判。
          backgroundUrlProvider.deactivate();
          backgroundUploadProvider.releaseObjectUrl();
          persistProvider('pixaroa');
          updateUrlButtons();
          updateUploadButtons({ hasSelectedFile: false });
          updatePixaroaButtons();
          setPixaroaStatus('idle');
        })
        .catch((error) => {
          console.warn('[Tralume] Pixaroa background fetch failed.', error);
          setPixaroaStatus('error');
        })
        .finally(() => {
          pixaroaApplyButton.disabled = false;
          updatePixaroaButtons();
        });
    });
  }

  if (pixaroaResetButton instanceof HTMLButtonElement) {
    pixaroaResetButton.addEventListener('click', () => {
      pixaroaBackgroundProvider.clear({ persistValue: true });
      persistProvider('');
      updateUrlButtons();
      updateUploadButtons({ hasSelectedFile: false });
      updatePixaroaButtons();
      setPixaroaStatus('idle');
    });
  }
};
