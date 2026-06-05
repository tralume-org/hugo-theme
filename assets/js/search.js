// 说明：搜索模块入口（provider-agnostic UI 核心）。
// 作用：管理搜索弹窗开闭、键盘快捷键、通过抽象 provider 接口执行搜索并渲染结果。
// 注意：所有界面文案优先读取 dialog 上的 data-* 属性（由 Hugo i18n 注入），不存在时回退英文。
import { createPagefindProvider } from './search-providers/pagefind.js';

export const setupSearch = () => {
  const toggle = document.querySelector('[data-search-toggle]');
  const dialog = document.querySelector('[data-search-dialog]');
  const backdrop = document.querySelector('[data-search-backdrop]');
  const input = document.querySelector('[data-search-input]');
  const resultsEl = document.querySelector('[data-search-results]');
  const closeBtn = document.querySelector('[data-search-close]');
  const clearBtn = document.querySelector('[data-search-clear]');

  if (!toggle || !dialog || !backdrop || !input || !resultsEl || !closeBtn) {
    return;
  }

  // 说明：从 dialog 上读取 Hugo i18n 注入的文案（不存在时回退英文）。
  var texts = {
    unavailable: dialog.getAttribute('data-text-unavailable') || 'Search is currently unavailable.',
    untitled: dialog.getAttribute('data-text-untitled') || 'Untitled',
    noResults: dialog.getAttribute('data-text-no-results') || 'No results found.',
    sections: dialog.getAttribute('data-text-sections') || '{count} matching sections'
  };

  // 说明：清空按钮初始隐藏，输入内容后显示。
  if (clearBtn) {
    clearBtn.classList.add('is-hidden');
  }

  // 说明：从 HTML 读取 provider 名称（如 "pagefind"、"meilisearch"），据此初始化对应 provider。
  var providerName = (dialog.getAttribute('data-search-provider') || 'pagefind').toLowerCase();
  var provider = null;

  var providerFactories = {
    pagefind: createPagefindProvider
  };

  var factory = providerFactories[providerName];
  if (factory) {
    provider = factory();
  }

  var selectedIndex = -1;
  var debounceTimer = null;
  var resultItems = [];
  var previousFocusedEl = null;

  var checkProvider = function () {
    return !!(provider && provider.isAvailable && provider.isAvailable());
  };

  var openDialog = function () {
    previousFocusedEl = document.activeElement;
    dialog.classList.add('is-open');
    backdrop.classList.add('is-visible');
    dialog.setAttribute('aria-hidden', 'false');
    dialog.removeAttribute('inert');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    selectedIndex = -1;
    resultItems = [];
    input.value = '';
    hideResults();
    setTimeout(function () {
      input.focus();
    }, 150);
  };

  var closeDialog = function () {
    dialog.classList.remove('is-open');
    backdrop.classList.remove('is-visible');
    dialog.setAttribute('aria-hidden', 'true');
    dialog.setAttribute('inert', '');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    selectedIndex = -1;
    resultItems = [];
    hideResults();
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    if (previousFocusedEl && typeof previousFocusedEl.focus === 'function') {
      previousFocusedEl.focus();
      previousFocusedEl = null;
    }
  };

  var showEmptyState = function () {
    if (!resultsEl) return;
    showResults();
    resultsEl.innerHTML =
      '<p class="app-search__empty">' + (input ? input.getAttribute('placeholder') || '' : '') + '</p>';
  };

  var showLoading = function () {
    if (!resultsEl) return;
    showResults();
    resultsEl.innerHTML =
      '<div class="app-search__loading" aria-busy="true">' +
      '<div class="app-search__spinner" role="status"></div>' +
      '</div>';
  };

  var showNoResults = function () {
    if (!resultsEl) return;
    showResults();
    resultsEl.innerHTML = '<p class="app-search__no-results">' + escapeHTML(texts.noResults) + '</p>';
  };

  var showUnavailable = function () {
    if (!resultsEl) return;
    showResults();
    resultsEl.innerHTML = '<p class="app-search__no-results">' + escapeHTML(texts.unavailable) + '</p>';
  };

  // 说明：显示结果区域（有输入后出现）。
  var showResults = function () {
    if (!resultsEl) return;
    resultsEl.classList.add('is-visible');
  };

  // 说明：隐藏结果区域（空输入或无查询时）。
  var hideResults = function () {
    if (!resultsEl) return;
    resultsEl.classList.remove('is-visible');
    resultsEl.innerHTML = '';
  };

  var escapeHTML = function (str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  // 说明：渲染搜索结果列表（子结果默认折叠，通过 toggle 按钮展开）。
  var renderResults = function (results) {
    if (!resultsEl) return;
    showResults();
    if (!results || results.length === 0) {
      showNoResults();
      return;
    }

    var html = '';
    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      var url = r.url || '';
      var title = r.title || texts.untitled;
      var excerpt = r.excerpt || '';
      var subResults = r.sub_results || [];
      var hasSubs = subResults.length > 0;

      // 说明：主结果和子结果包裹在 .app-search__result-group 中，
      //       避免 <button> 嵌套在 <a> 内（非法 HTML 会导致点击失效）。
      html += '<div class="app-search__result-group">';

      html +=
        '<a class="app-search__result" href="' + escapeHTML(url) + '" data-search-result>' +
        '<span class="app-search__result-title">' + (title || texts.untitled) + '</span>';

      if (excerpt) {
        html += '<span class="app-search__result-excerpt">' + excerpt + '</span>';
      }

      if (!hasSubs && r.meta) {
        html += '<span class="app-search__result-meta">' + escapeHTML(r.meta) + '</span>';
      }

      html += '</a>';

      if (hasSubs) {
        var toggleLabel = texts.sections.replace('{count}', String(subResults.length));
        html +=
          '<details class="app-search__result-toggle">' +
          '<summary>' + escapeHTML(toggleLabel) + '</summary>' +
          '<div class="app-search__sub-results">';
        for (var j = 0; j < subResults.length; j++) {
          var sub = subResults[j];
          html +=
            '<a class="app-search__sub-result" href="' + escapeHTML(sub.url || url) + '" data-search-sub-result>' +
            '<span class="app-search__sub-result-title">' + escapeHTML(sub.title || '') + '</span>';
          if (sub.excerpt) {
            html += '<span class="app-search__sub-result-excerpt">' + sub.excerpt + '</span>';
          }
          html += '</a>';
        }
        html += '</div></details>';
      }

      html += '</div>';
    }

    resultsEl.innerHTML = html;
    resultItems = [].slice.call(resultsEl.querySelectorAll('[data-search-result]'));
    selectedIndex = -1;
  };

  var updateSelection = function () {
    for (var i = 0; i < resultItems.length; i++) {
      if (i === selectedIndex) {
        resultItems[i].classList.add('is-selected');
        resultItems[i].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        resultItems[i].classList.remove('is-selected');
      }
    }
  };

  var openSelected = function () {
    if (selectedIndex >= 0 && selectedIndex < resultItems.length) {
      var href = resultItems[selectedIndex].getAttribute('href');
      if (href) {
        window.location.href = href;
      }
    }
  };

  var doSearch = function (query) {
    var q = (query || '').trim();
    if (q.length === 0) {
      hideResults();
      resultItems = [];
      selectedIndex = -1;
      return;
    }

    if (!checkProvider()) {
      showUnavailable();
      return;
    }

    showLoading();

    provider
      .search(q, { limit: 20 })
      .then(function (results) {
        renderResults(results);
      })
      .catch(function () {
        showNoResults();
      });
  };

  var handleInput = function () {
    if (clearBtn) {
      clearBtn.classList.toggle('is-hidden', !input.value.trim());
    }
    if (!input.value.trim()) {
      hideResults();
      resultItems = [];
      selectedIndex = -1;
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
      return;
    }
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(function () {
      doSearch(input.value);
    }, 300);
  };

  var handleClear = function () {
    input.value = '';
    if (clearBtn) {
      clearBtn.classList.add('is-hidden');
    }
    hideResults();
    resultItems = [];
    selectedIndex = -1;
    input.focus();
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  };

  var handleKeyDown = function (e) {
    var isOpen = dialog.classList.contains('is-open');

    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (isOpen) {
        closeDialog();
      } else {
        openDialog();
      }
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        closeDialog();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (resultItems.length > 0) {
          selectedIndex = Math.min(selectedIndex + 1, resultItems.length - 1);
          updateSelection();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (resultItems.length > 0) {
          selectedIndex = Math.max(selectedIndex - 1, -1);
          updateSelection();
          if (selectedIndex < 0) {
            input.focus();
          }
        }
        break;
      case 'Enter':
        e.preventDefault();
        openSelected();
        break;
    }
  };

  var handleBackdropClick = function (e) {
    if (e.target === backdrop) {
      closeDialog();
    }
  };

  // 说明：处理结果区域点击：主/子结果跳转关闭弹窗。
  var handleResultClick = function (e) {
    var link = e.target.closest('[data-search-result], [data-search-sub-result]');
    if (link) {
      closeDialog();
    }
  };

  // 说明：绑定事件。
  var preloadOnce = false;
  var triggerPreload = function () {
    if (preloadOnce || !provider || !provider.preload) return;
    preloadOnce = true;
    provider.preload();
  };
  toggle.addEventListener('mouseenter', triggerPreload);
  toggle.addEventListener('focus', triggerPreload);

  toggle.addEventListener('click', function () {
    if (dialog.classList.contains('is-open')) {
      closeDialog();
    } else {
      openDialog();
    }
  });

  closeBtn.addEventListener('click', closeDialog);
  if (clearBtn) {
    clearBtn.addEventListener('click', handleClear);
  }
  backdrop.addEventListener('click', handleBackdropClick);
  input.addEventListener('input', handleInput);
  resultsEl.addEventListener('click', handleResultClick);
  document.addEventListener('keydown', handleKeyDown);
};
