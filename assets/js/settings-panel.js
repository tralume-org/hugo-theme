import { setupPanelShell } from './settings/panel-shell.js';
import { setupThemeMode } from './settings/theme-mode.js';
import { setupGlassControls } from './settings/glass-controls.js';
import { setupReaderWidth } from './settings/reader-width.js';
import { setupBackgroundControl } from './settings/background.js';

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
  setupThemeMode(panel, root);
  setupGlassControls(panel, root);
  setupReaderWidth(panel, root);
  setupBackgroundControl(panel, root);
};
