{{- /* 说明：Markdown 输出保留页面源码正文，避免把 HTML 布局和交互组件写入 .md。 */ -}}
{{- .Title | replaceRE "\n" " " | plainify | printf "# %s" }}

{{ .RawContent | strings.TrimSpace }}
