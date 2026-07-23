import { setupMobileMenu } from './mobile-menu.js';
import { setupSettingsPanel } from './settings-panel.js';
import { setupCodeBlocks } from './code-blocks.js';
import { setupArticleOutline } from './article-outline.js';
import { setupArticleInfo } from './article-info.js';
import { setupAnalytics } from './analytics.js';
import { setupPagesMenu } from './pages-menu.js';
import { setupArticleListInfiniteScroll } from './article-list-infinite-scroll.js';
import { setupArticleListMasonry } from './article-list-masonry.js';
import { setupChromaTheme } from './chroma-theme.js';
import { setupArticleLightbox } from './article-lightbox.js';
import { setupArticleAiMarker } from './article-ai-marker.js';
import { setupSearch } from './search.js';

// 说明：集中触发初始化逻辑，确保各个组件在 DOM 就绪后挂载事件。
const bootstrap = () => {
  setupMobileMenu();
  setupPagesMenu();
  setupAnalytics();
  setupChromaTheme();
  setupSettingsPanel();
  setupSearch();
  setupCodeBlocks();
  setupArticleOutline();
  setupArticleInfo();
  setupArticleListInfiniteScroll();
  setupArticleListMasonry();
  setupArticleLightbox();
  setupArticleAiMarker();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
