# AI Contribution Marker

As AI tools become common, disclosing how AI participated in your writing process is increasingly important. This feature renders a standardized, nice-looking disclosure bar, so you don’t have to write it manually in the content.

Configure via the `ai` object in page Front Matter:

```yaml
---
title: "A day with AI collaboration"
# Note: AI disclosure fields.
ai:
  # Note: Participation level (omit or set to none to hide the marker).
  level: assist

  # Note: Where AI was used (optional, multiple allowed).
  usage: [grammar, wording]

  # Note: Human review level (optional; defaults to none).
  review: edited

  # Note: Tools used (optional, multiple allowed).
  tools: [chatgpt]
---
```

## Supported fields

- `ai.level`: participation level.
- `ai.usage`: usage list (optional).
- `ai.review`: human review level (optional).
- `ai.tools`: tools used (optional).

Note: the marker is only shown when `ai.level` is not `none`.

### ai.level

- `none`: no AI (hidden)
- `assist`: AI-assisted
- `coauthor`: AI co-authored
- `generate`: AI-generated
- `translate`: AI-translated

### ai.review

- `none`: not specified / no human check
- `light`: reviewed (read-through)
- `edited`: edited (line-by-line revisions)
- `fact_checked`: key facts/data/citations verified by a human

### ai.usage (multiple allowed)

- `outline`: outline/structure suggestions
- `rewrite`: rewrite/restructure
- `expand`: expand details
- `summarize`: summarize/compress
- `tone`: tone/style adjustment
- `grammar`: grammar fixes
- `wording`: wording improvements
- `title`: title/subtitle suggestions
- `translate`: translation
- `research`: research direction/notes
- `citation`: citation formatting suggestions
- `fact_check_help`: fact-check assistance (flag suspicious parts)
- `code`: code generation/rewrite
- `debug`: debugging/log analysis suggestions
- `data`: table/data cleanup and conversion
- `image`: image prompt/help
- `privacy`: privacy/redaction suggestions
- `policy`: compliance/risk wording suggestions

### ai.tools (multiple allowed)

- `chatgpt`: ChatGPT
- `claude`: Claude
- `gemini`: Gemini
- `deepseek`: DeepSeek
- `qwen`: Qwen
- `other`: Other
