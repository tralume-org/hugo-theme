# i18n Routing and Auto Entry Pages

Tralume lets Hugo generate every formal content URL normally, then adds the “smart language entry pages” as a post-build step.

## Routing modes

- `defaultContentLanguageInSubdir = true`: formal content URLs stay under `/en-us/...` and `/zh-hans/...`, while neutral entry pages use `/` and `/posts/test/`.
- `defaultContentLanguageInSubdir = false`: the default language keeps the root URL, while neutral entry pages move to `/auto/` and `/auto/posts/test/`.
- Explicit language URLs are never rewritten automatically; only the entry pages perform language-based redirects.
- If a `post` or `page` exists in only one language, the entry page redirects straight to that single target without checking `localStorage` or `navigator.languages`.

## Basic configuration

Set this in `hugo.toml`:

```toml
defaultContentLanguage = 'en-US'
defaultContentLanguageInSubdir = true
# 说明：关闭 Hugo 默认语言重定向，改由主题的入口页脚本接管。
disableDefaultLanguageRedirect = true

[params.i18nRouting]
  # 说明：开启构建后生成的智能语言入口页。
  enableAutoEntry = true
```

Only enable this after you have actually wired `python3 tools/gen_auto_entries.py` into your real build pipeline. Otherwise, leave it disabled and keep Hugo's built-in default-language redirect.

## Build flow

The theme first asks Hugo to render the formal pages and `route-manifest.json`, then runs the Python generator:

```bash
# 说明：先构建 Hugo 真实内容页与路由清单。
# 注意：本示例把验证产物输出到 public_test/，避免污染默认 public/。
hugo --destination public_test/hugo-auto-entry

# 说明：读取 route-manifest.json，并在构建产物目录内生成智能入口页。
# 注意：脚本会检查路径冲突，并清理上一次生成但本次已失效的入口页。
python3 tools/gen_auto_entries.py --publish-dir public_test/hugo-auto-entry
```

## Notes

- Entry pages read the fixed `localStorage['tralume-language']` key first.
- If no stored language is available, they fall back to `navigator.languages`.
- If nothing matches, they redirect to the default-language formal page.
- Entry pages always use `noindex,follow` and point canonical to the formal content page; they do not enter Hugo's sitemap or RSS outputs.
- If the feature is not enabled, the theme keeps Hugo's native behavior and lets Hugo handle the root-path default-language redirect.
