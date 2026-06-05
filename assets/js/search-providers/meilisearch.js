// 说明：Meilisearch 搜索 provider 实现。
// 作用：通过浏览器端 REST API 调用 Meilisearch，并转换为 search.js 消费的统一结果格式。
// 注意：前端只能配置具备 search 权限的 Search API Key，禁止使用 master/admin key。
export const createMeilisearchProvider = function (config) {
  var cfg = config || {};
  var host = normalizeHost(cfg.host || '');
  var indexUid = cfg.indexUid || '';
  var titleAttribute = cfg.titleAttribute || 'title';
  var urlAttribute = cfg.urlAttribute || 'url';
  var metaAttribute = cfg.metaAttribute || 'section';
  var excerptAttributes = cfg.excerptAttributes && cfg.excerptAttributes.length > 0
    ? cfg.excerptAttributes
    : ['content', 'summary', 'description'];
  var highlightAttributes = cfg.highlightAttributes && cfg.highlightAttributes.length > 0
    ? cfg.highlightAttributes
    : [titleAttribute].concat(excerptAttributes);
  var defaultLimit = toPositiveInteger(cfg.limit, 20);
  var cropLength = toPositiveInteger(cfg.cropLength, 24);

  // 说明：检测必要配置是否存在；网络可达性在实际查询时处理。
  var isAvailable = function () {
    return !!(host && indexUid && typeof window.fetch === 'function');
  };

  // 说明：Meilisearch 无需本地索引预加载，保留该方法以符合 provider 接口。
  var preload = function () {};

  // 说明：执行 POST /indexes/{index_uid}/search。
  // options.limit: UI 希望的最大返回条数；站点配置的 limit 优先级更高。
  var search = function (query, options) {
    var opts = options || {};
    var limit = defaultLimit || opts.limit || 20;
    var body = buildSearchBody(query, limit);
    var headers = {
      'Content-Type': 'application/json'
    };

    if (cfg.apiKey) {
      headers.Authorization = 'Bearer ' + cfg.apiKey;
    }

    return window.fetch(host + '/indexes/' + encodeURIComponent(indexUid) + '/search', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Meilisearch request failed with status ' + response.status);
        }
        return response.json();
      })
      .then(function (payload) {
        return mapHits(payload && payload.hits ? payload.hits : []);
      });
  };

  var buildSearchBody = function (query, limit) {
    var body = {
      q: query,
      limit: limit,
      attributesToCrop: excerptAttributes,
      cropLength: cropLength,
      cropMarker: '...',
      attributesToHighlight: highlightAttributes,
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>'
    };

    assignIfList(body, 'attributesToRetrieve', cfg.attributesToRetrieve);
    assignIfList(body, 'attributesToSearchOn', cfg.attributesToSearchOn);
    assignIfList(body, 'sort', cfg.sort);
    assignIfList(body, 'locales', cfg.locales);
    assignIfValue(body, 'filter', cfg.filter);
    assignIfValue(body, 'matchingStrategy', cfg.matchingStrategy);

    return body;
  };

  var mapHits = function (hits) {
    return hits.map(function (hit) {
      var formatted = hit._formatted || {};
      var url = getValue(hit, urlAttribute) || '';
      var title = getFormattedValue(formatted, hit, titleAttribute) || 'Untitled';
      var excerpt = getFirstFormattedValue(formatted, hit, excerptAttributes);
      var meta = getValue(hit, metaAttribute) || extractBreadcrumb(url);

      return {
        url: String(url),
        title: sanitizeHighlightedHTML(title),
        excerpt: sanitizeHighlightedHTML(excerpt),
        meta: String(meta || ''),
        sub_results: []
      };
    });
  };

  return {
    isAvailable: isAvailable,
    preload: preload,
    search: search
  };
};

var normalizeHost = function (host) {
  return String(host || '').replace(/\/+$/g, '');
};

var toPositiveInteger = function (value, fallback) {
  var n = parseInt(value, 10);
  if (Number.isFinite(n) && n > 0) {
    return n;
  }
  return fallback;
};

var assignIfList = function (target, key, value) {
  if (value && value.length > 0) {
    target[key] = value;
  }
};

var assignIfValue = function (target, key, value) {
  if (value !== undefined && value !== null && String(value).trim()) {
    target[key] = value;
  }
};

var getValue = function (obj, path) {
  if (!obj || !path) return '';
  var parts = String(path).split('.');
  var current = obj;
  for (var i = 0; i < parts.length; i++) {
    if (current === undefined || current === null) return '';
    current = current[parts[i]];
  }
  if (Array.isArray(current)) {
    return current.join(', ');
  }
  if (typeof current === 'object') {
    return '';
  }
  return current;
};

var getFormattedValue = function (formatted, hit, attribute) {
  return getValue(formatted, attribute) || getValue(hit, attribute);
};

var getFirstFormattedValue = function (formatted, hit, attributes) {
  for (var i = 0; i < attributes.length; i++) {
    var value = getFormattedValue(formatted, hit, attributes[i]);
    if (value) {
      return value;
    }
  }
  return '';
};

var extractBreadcrumb = function (url) {
  if (!url) return '';
  var parts = String(url).replace(/^\/+|\/+$/g, '').split('/');
  parts = parts.filter(function (p) {
    return p && !/\.(html|htm)$/i.test(p) && !/^[a-z]{2}(-[a-z]{2,})?$/i.test(p);
  });
  return parts.length > 0 ? parts.join(' \u203A ') : '';
};

var escapeHTML = function (str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

var sanitizeHighlightedHTML = function (str) {
  return escapeHTML(str)
    .replace(/&lt;mark&gt;/gi, '<mark>')
    .replace(/&lt;\/mark&gt;/gi, '</mark>')
    .replace(/&lt;em&gt;/gi, '<mark>')
    .replace(/&lt;\/em&gt;/gi, '</mark>');
};
