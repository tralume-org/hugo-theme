import { setupAppNavigation } from './app-navigation.js';
import { setupSettingsPanel } from './settings-panel.js';
import { setupCodeBlocks } from './code-blocks.js';
import { setupArticleOutline } from './article-outline.js';
import { setupAnalytics } from './analytics.js';
import { setupPagesMenu } from './pages-menu.js';

// 说明：集中触发初始化逻辑，确保各个组件在 DOM 就绪后挂载事件。
const bootstrap = () => {
  setupAppNavigation();
  setupPagesMenu();
  setupSettingsPanel();
  setupCodeBlocks();
  setupArticleOutline();
  setupAnalytics();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
