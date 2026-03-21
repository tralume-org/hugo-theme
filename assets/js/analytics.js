import { setupUmamiBlockNotice } from './umami-block-notice.js';
import { setupAnalyticsEvents } from './analytics-events.js';
import { setupUmamiPageviews } from './umami-pageviews.js';

// 说明：Analytics provider 初始化入口。
// 用途：集中挂载各 provider 的前端增强逻辑；未启用的 provider 会在内部自行 no-op。
export const setupAnalytics = () => {
  setupAnalyticsEvents();
  setupUmamiBlockNotice();
  setupUmamiPageviews();
};
