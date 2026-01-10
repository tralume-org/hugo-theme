// 说明：Markdown 代码块增强逻辑，负责构建 MD3 外观并注入复制按钮。
export const setupCodeBlocks = () => {
  const container = document.querySelector('#main-content');
  if (!container) {
    return;
  }

  const copyLabel = container.getAttribute('data-code-copy-label') || 'Copy code';
  const copiedLabel = container.getAttribute('data-code-copied-label') || 'Copied';

  // 说明：计算代码的“可见行数”，用于决定是否展示行号（<= 3 行不显示，避免噪音）。
  // 注意：仅移除末尾单个换行符（若存在），避免把 Hugo/Chroma 常见的尾随换行当作额外一行。
  const countCodeLines = (text) => {
    if (!text) {
      return 0;
    }
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const trimmed = normalized.endsWith('\n') ? normalized.slice(0, -1) : normalized;
    if (!trimmed) {
      return 0;
    }
    return trimmed.split('\n').length;
  };

  // 说明：为代码块注入行号（与 code 元素同级），并添加标记类以便 CSS 进行双列布局。
  // 注意：行号被设置为不可选中/不可交互，避免影响复制与文本选择。
  const ensureLineNumbers = ({ preElement, codeElement, lineCount }) => {
    if (!(preElement instanceof HTMLElement) || !(codeElement instanceof HTMLElement)) {
      return false;
    }
    if (lineCount <= 3) {
      return false;
    }
    const alreadyInjected = Array.from(preElement.children).some((child) =>
      child instanceof HTMLElement && child.classList.contains('md3-code-block__line-numbers')
    );
    if (alreadyInjected) {
      return true;
    }

    const lineNumbers = document.createElement('span');
    lineNumbers.className = 'md3-code-block__line-numbers';
    lineNumbers.setAttribute('aria-hidden', 'true');
    lineNumbers.textContent = Array.from({ length: lineCount }, (_, index) => String(index + 1)).join('\n');
    preElement.insertBefore(lineNumbers, codeElement);
    return true;
  };

  // 说明：语言别名到 Devicon 图标名的映射（仅维护主题需要的最小集合）。
  // 注意：这里的“图标名”需与 `assets/css/icons/devicon.css` 中的 `.app-devicon--{name}` 对齐。
  const resolveDeviconName = (language) => {
    if (!language) {
      return '';
    }
    const normalized = language.trim().toLowerCase();
    const aliasTable = {
      sh: 'bash',
      shell: 'bash',
      zsh: 'bash',
      bash: 'bash',
      c: 'c',
      cpp: 'cplusplus',
      cplusplus: 'cplusplus',
      'c++': 'cplusplus',
      cs: 'csharp',
      csharp: 'csharp',
      'c#': 'csharp',
      css: 'css3',
      css3: 'css3',
      docker: 'docker',
      dockerfile: 'docker',
      go: 'go',
      golang: 'go',
      gql: 'graphql',
      graphql: 'graphql',
      html: 'html5',
      html5: 'html5',
      java: 'java',
      js: 'javascript',
      javascript: 'javascript',
      json: 'json',
      kt: 'kotlin',
      kotlin: 'kotlin',
      md: 'markdown',
      markdown: 'markdown',
      mysql: 'mysql',
      node: 'nodejs',
      nodejs: 'nodejs',
      php: 'php',
      postgres: 'postgresql',
      postgresql: 'postgresql',
      ps1: 'powershell',
      powershell: 'powershell',
      py: 'python',
      python: 'python',
      react: 'react',
      jsx: 'react',
      tsx: 'react',
      rb: 'ruby',
      ruby: 'ruby',
      rs: 'rust',
      rust: 'rust',
      sqlite: 'sqlite',
      swift: 'swift',
      ts: 'typescript',
      typescript: 'typescript',
      vue: 'vuejs',
      vuejs: 'vuejs',
      yml: 'yaml',
      yaml: 'yaml',
    };
    return aliasTable[normalized] || '';
  };

  // 说明：从 code 元素的类名或 data-lang 属性中解析语言名称。
  const readLanguage = (codeElement) => {
    if (!(codeElement instanceof HTMLElement)) {
      return '';
    }
    const direct = codeElement.getAttribute('data-lang');
    if (direct) {
      return direct;
    }
    const classList = (codeElement.className || '').split(/\s+/);
    const languageClass = classList.find((item) => item.startsWith('language-') || item.startsWith('lang-'));
    if (!languageClass) {
      return '';
    }
    return languageClass.replace(/^language-/, '').replace(/^lang-/, '');
  };

  // 说明：语言名称做简单格式化，避免全小写影响可读性。
  const formatLanguage = (raw) => {
    if (!raw) {
      return '';
    }
    const trimmed = raw.trim();
    if (trimmed.length <= 3) {
      return trimmed.toUpperCase();
    }
    if (trimmed.includes('-') || trimmed.includes('_')) {
      return trimmed
        .split(/[-_]/g)
        .map((segment) => segment ? segment[0].toUpperCase() + segment.slice(1).toLowerCase() : segment)
        .join(' ');
    }
    return trimmed[0].toUpperCase() + trimmed.slice(1);
  };

  // 说明：构建“语言 + 图标”的标签；图标缺失时仅展示语言文本。
  const createLanguageBadge = (rawLanguage, formattedLanguage) => {
    if (!formattedLanguage) {
      return null;
    }
    const badge = document.createElement('span');
    badge.className = 'md3-code-block__language';

    const deviconName = resolveDeviconName(rawLanguage);
    if (deviconName) {
      const icon = document.createElement('span');
      icon.className = `md3-code-block__language-icon app-devicon app-devicon--${deviconName}`;
      icon.setAttribute('aria-hidden', 'true');
      badge.appendChild(icon);
    }

    const text = document.createElement('span');
    text.className = 'md3-code-block__language-text';
    text.textContent = formattedLanguage;
    badge.appendChild(text);

    return badge;
  };

  // 说明：复制逻辑同时支持 Clipboard API 与传统命令，提升兼容性。
  const copyText = async (text) => {
    if (!text) {
      return false;
    }
    const normalized = text.replace(/\u00A0/g, ' ');
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(normalized);
        return true;
      }
    } catch (error) {
      // 说明：忽略 Clipboard API 的失败，继续尝试后备方案。
    }

    const textarea = document.createElement('textarea');
    textarea.value = normalized;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.select();
    let succeeded = false;
    try {
      succeeded = document.execCommand('copy');
    } catch (error) {
      succeeded = false;
    }
    textarea.remove();
    return succeeded;
  };

  // 说明：构建复制按钮并绑定状态更新。
  const createCopyButton = (codeElement) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'md3-code-block__copy-button';
    button.dataset.copyLabel = copyLabel;
    button.dataset.copiedLabel = copiedLabel;
    button.title = copyLabel;
    button.setAttribute('aria-label', copyLabel);

    // 说明：复制按钮采用“文字 + 图标”呈现，图标使用 Material Symbols（本地字体）。
    // 注意：不要用 `innerHTML`，避免引入 XSS 面；同时保留 aria-label 保障可访问性。
    const icon = document.createElement('span');
    icon.className = 'material-symbols-rounded md3-code-block__copy-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = 'content_copy';
    button.appendChild(icon);

    const label = document.createElement('span');
    label.className = 'md3-code-block__copy-label';
    label.textContent = copyLabel;
    button.appendChild(label);

    let revertTimer = 0;
    const resetState = () => {
      button.classList.remove('is-copied');
      icon.textContent = 'content_copy';
      label.textContent = copyLabel;
      button.title = copyLabel;
      button.setAttribute('aria-label', copyLabel);
    };

    button.addEventListener('click', async () => {
      if (codeElement instanceof HTMLElement) {
        const text = codeElement.textContent || '';
        const success = await copyText(text);
        window.clearTimeout(revertTimer);
        if (success) {
          button.classList.add('is-copied');
          icon.textContent = 'check';
          label.textContent = copiedLabel;
          button.title = copiedLabel;
          button.setAttribute('aria-label', copiedLabel);
          revertTimer = window.setTimeout(resetState, 2000);
        } else {
          resetState();
        }
      }
    });

    return button;
  };

  // 说明：统一构建代码块的 DOM 结构。
  const buildCodeBlock = (preElement, mountTarget) => {
    if (!(preElement instanceof HTMLElement)) {
      return;
    }
    if (preElement.dataset.md3CodeProcessed === 'true') {
      return;
    }

    let codeElement = preElement.querySelector('code');
    if (!(codeElement instanceof HTMLElement)) {
      // 说明：兼容仅有 `<pre>text</pre>` 的场景：将内容包裹进 code，便于统一复制与行号逻辑。
      codeElement = document.createElement('code');
      while (preElement.firstChild) {
        codeElement.appendChild(preElement.firstChild);
      }
      preElement.appendChild(codeElement);
    }

    // 说明：Hugo/Chroma 默认可能在 `<pre style="background-color: #...">` 注入内联背景色（常见为纯黑）。
    // 注意：内联样式会覆盖主题 CSS，导致“语法高亮版本”与主题玻璃拟态不一致；这里仅移除背景相关属性，保留其余内联样式（如 token 颜色）。
    preElement.style.removeProperty('background');
    preElement.style.removeProperty('background-color');
    preElement.style.removeProperty('background-image');
    if (codeElement !== preElement) {
      codeElement.style.removeProperty('background');
      codeElement.style.removeProperty('background-color');
      codeElement.style.removeProperty('background-image');
    }

    const lineCount = countCodeLines(codeElement.textContent || '');
    const hasLineNumbers = ensureLineNumbers({ preElement, codeElement, lineCount });

    const rawLanguage = readLanguage(codeElement);
    const language = formatLanguage(rawLanguage);

    const wrapper = document.createElement('div');
    // 说明：代码块外层复用统一玻璃拟态表面与卡片阴影，避免在组件 CSS 里重复声明 border/background/backdrop-filter。
    wrapper.className = 'md3-code-block app-glass app-glass--surface app-card';
    wrapper.setAttribute('data-md3-code-block', 'true');
    if (hasLineNumbers) {
      wrapper.classList.add('md3-code-block--with-line-numbers');
    }

    const toolbar = document.createElement('div');
    toolbar.className = 'md3-code-block__toolbar';

    if (language) {
      const badge = createLanguageBadge(rawLanguage, language);
      if (badge) {
        toolbar.appendChild(badge);
      }
    }

    const copyButton = createCopyButton(codeElement);
    toolbar.appendChild(copyButton);

    const body = document.createElement('div');
    body.className = 'md3-code-block__body';

    const originalParent = preElement.parentElement;
    const referenceNode = preElement.nextSibling;

    body.appendChild(preElement);
    wrapper.appendChild(toolbar);
    wrapper.appendChild(body);

    preElement.dataset.md3CodeProcessed = 'true';

    if (mountTarget && mountTarget !== preElement && mountTarget.parentElement) {
      mountTarget.replaceWith(wrapper);
    } else if (originalParent) {
      originalParent.insertBefore(wrapper, referenceNode);
    }
  };

  const highlightBlocks = Array.from(container.querySelectorAll('.highlight'));
  highlightBlocks.forEach((highlight) => {
    const preElement = highlight.querySelector('pre');
    if (preElement) {
      buildCodeBlock(preElement, highlight);
    }
  });

  const loosePreBlocks = Array.from(container.querySelectorAll('pre')).filter((preElement) => {
    if (!(preElement instanceof HTMLElement)) {
      return false;
    }
    if (preElement.dataset.md3CodeProcessed === 'true') {
      return false;
    }
    if (preElement.closest('.md3-code-block')) {
      return false;
    }
    return true;
  });

  loosePreBlocks.forEach((preElement) => {
    buildCodeBlock(preElement, null);
  });
};
