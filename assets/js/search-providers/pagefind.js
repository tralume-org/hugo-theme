// 说明：Pagefind 搜索 provider 实现。
// 作用：封装 Pagefind 全局 API，将原生结果转换为统一格式供 search.js 消费。
// 接口约定（所有 search provider 必须遵循）：
//   isAvailable() → boolean       检测 provider 是否就绪
//   search(query, options) → Promise<SearchResult[]>  执行搜索
// SearchResult: { url, title, excerpt, meta, sub_results: [{ url, title, excerpt }] }
export const createPagefindProvider = function () {

  // 说明：检测 Pagefind 库是否已加载并就绪。
  var isAvailable = function () {
    return !!(window.pagefind && typeof window.pagefind.search === 'function');
  };

  // 说明：预加载索引元数据（hover 搜索按钮时调用，减少首次搜索延迟）。
  var preload = function () {
    if (isAvailable() && typeof window.pagefind.init === 'function') {
      window.pagefind.init();
    }
  };

  // 说明：从 URL 提取面包屑路径。
  var extractBreadcrumb = function (url) {
    if (!url) return '';
    var parts = url.replace(/^\/+|\/+$/g, '').split('/');
    parts = parts.filter(function (p) {
      return p && !/\.(html|htm)$/i.test(p) && !/^[a-z]{2}(-[a-z]{2,})?$/i.test(p);
    });
    if (parts.length > 0) {
      return parts.join(' \u203A ');
    }
    return '';
  };

  // 说明：将 Pagefind 子结果转换为统一格式。
  var mapSubResults = function (subResults) {
    if (!subResults || subResults.length === 0) return [];
    return subResults.map(function (sub) {
      return {
        url: sub.url || '',
        title: sub.title || '',
        excerpt: sub.excerpt || '',
        meta: ''
      };
    });
  };

  // 说明：执行搜索，返回标准化结果数组（含子结果）。
  // options.limit: 最大返回条数（默认 20）。
  var search = function (query, options) {
    var opts = options || {};
    var limit = opts.limit || 20;

    return window.pagefind
      .search(query)
      .then(function (result) {
        if (!result || !result.results || result.results.length === 0) {
          return [];
        }

        var limited = result.results.slice(0, limit);
        return Promise.all(
          limited.map(function (r) {
            return r.data();
          })
        ).then(function (dataList) {
          return dataList.map(function (data) {
            var url = data.url || '';
            var title = (data.meta && data.meta.title) ? data.meta.title : '';
            var excerpt = data.excerpt || '';
            var subResults = mapSubResults(data.sub_results);
            var subResultCount = subResults.length;

            return {
              url: url,
              title: title || 'Untitled',
              excerpt: excerpt,
              meta: extractBreadcrumb(url),
              sub_results: subResults
            };
          });
        });
      });
  };

  return {
    isAvailable: isAvailable,
    preload: preload,
    search: search
  };
};
