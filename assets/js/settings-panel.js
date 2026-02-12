import { setupPanelShell } from './settings/panel-shell.js';
import { setupThemeMode } from './settings/theme-mode.js';
import { setupGlassControls } from './settings/glass-controls.js';
import { setupReaderWidth } from './settings/reader-width.js';
import { setupPostsScrollMode } from './settings/posts-scroll.js';
import { setupBackgroundControl } from './settings/background.js';
import { setupThemeSeed } from './settings/theme-seed.js';

// 说明：封装设置面板交互逻辑，委托各子模块完成独立功能。
export const setupSettingsPanel = () => {
  const panel = document.querySelector('[data-component="settings-panel"]');
  if (!panel) {
    return;
  }

  const shellContext = setupPanelShell(panel);
  if (!shellContext) {
    return;
  }

  const { root } = shellContext;

  // 说明：统一的“外观恢复默认值”入口，触发后由各子模块分别回滚自己的状态与持久化值。
  const appearanceResetButton = panel.querySelector('[data-appearance-reset]');
  if (appearanceResetButton instanceof HTMLButtonElement) {
    appearanceResetButton.addEventListener('click', () => {
      panel.dispatchEvent(new CustomEvent('settings:appearance-reset'));
    });
  }

  setupThemeMode(panel, root);
  setupGlassControls(panel, root);
  setupReaderWidth(panel, root);
  setupPostsScrollMode(panel);
  setupBackgroundControl(panel, root);
  setupThemeSeed(panel, root);
};
