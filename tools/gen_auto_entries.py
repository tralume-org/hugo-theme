#!/usr/bin/env python3
"""Generate smart language entry pages after the Hugo build."""

from __future__ import annotations

import argparse
import html
import json
import sys
import tomllib
from pathlib import Path
from typing import Any


AUTO_PREFIX = "auto"
AUTO_MANIFEST_NAME = "__auto_entry_manifest.json"
LANGUAGE_STORAGE_KEY = "tralume-language"
LANGUAGE_FALLBACKS = {
    "zh": "zh-hans",
    "en": "en-us",
}


class AutoEntryError(RuntimeError):
    """Auto entry page generation failed."""


def load_toml(path: Path) -> dict[str, Any]:
    with path.open("rb") as handle:
        return tomllib.load(handle)


def normalize_lang(lang: str) -> str:
    return lang.strip().lower()


def normalize_route(route: str) -> str:
    value = (route or "/").strip()
    if not value:
        value = "/"
    if not value.startswith("/"):
        value = f"/{value}"
    if value != "/" and not value.endswith("/"):
        value = f"{value}/"
    return value


def join_route(prefix: str, logical_path: str) -> str:
    prefix_route = normalize_route(prefix)
    path_route = normalize_route(logical_path)
    if prefix_route == "/":
        return path_route
    if path_route == "/":
        return prefix_route
    return normalize_route(f"{prefix_route.rstrip('/')}{path_route}")


def route_to_output_path(publish_dir: Path, route: str) -> Path:
    normalized = normalize_route(route)
    if normalized == "/":
        return publish_dir / "index.html"
    return publish_dir.joinpath(*normalized.strip("/").split("/")) / "index.html"


def output_path_to_relative(path: Path, publish_dir: Path) -> str:
    return path.relative_to(publish_dir).as_posix()


def prune_empty_parents(start: Path, stop: Path) -> None:
    current = start
    while current != stop and current.exists():
        try:
            current.rmdir()
        except OSError:
            break
        current = current.parent


def load_previous_generated_files(publish_dir: Path) -> set[str]:
    manifest_path = publish_dir / AUTO_MANIFEST_NAME
    if not manifest_path.exists():
        return set()
    with manifest_path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    files = payload.get("files", [])
    return {str(item) for item in files}


def cleanup_generated_files(publish_dir: Path, files: set[str]) -> None:
    for relative_path in sorted(files, reverse=True):
        target = publish_dir / relative_path
        if target.exists():
            target.unlink()
            prune_empty_parents(target.parent, publish_dir)
    manifest_path = publish_dir / AUTO_MANIFEST_NAME
    if manifest_path.exists():
        manifest_path.unlink()


def resolve_publish_dir(
    config: dict[str, Any], cli_publish_dir: str | None, workspace_root: Path
) -> Path:
    if cli_publish_dir:
        return (workspace_root / cli_publish_dir).resolve()
    publish_dir = str(config.get("publishDir", "public"))
    return (workspace_root / publish_dir).resolve()


def resolve_manifest_path(
    publish_dir: Path, default_language: str, default_in_subdir: bool
) -> Path:
    candidates: list[Path] = []
    if not default_in_subdir:
        candidates.append(publish_dir / "route-manifest.json")
    lang_candidates = [default_language, normalize_lang(default_language)]
    for lang in lang_candidates:
        candidates.append(publish_dir / lang / "route-manifest.json")
    for candidate in candidates:
        if candidate.exists():
            return candidate
    joined = ", ".join(str(path) for path in candidates)
    raise AutoEntryError(f"Could not find route-manifest.json. Checked: {joined}")


def pick_home_entry(
    home_targets: dict[str, Any], default_language: str
) -> dict[str, Any]:
    normalized_targets = {
        normalize_lang(lang): target for lang, target in home_targets.items()
    }
    if not normalized_targets:
        raise AutoEntryError("The manifest is missing homeTargets.")
    if len(normalized_targets) == 1:
        target = next(iter(normalized_targets.values()))
        return {
            "mode": "single",
            "logicalPath": "/",
            "canonical": target,
            "targets": normalized_targets,
        }
    default_target = normalized_targets.get(normalize_lang(default_language))
    if default_target is None:
        raise AutoEntryError("homeTargets is missing the default language home target.")
    return {
        "mode": "detect",
        "logicalPath": "/",
        "canonical": default_target,
        "targets": normalized_targets,
    }


def build_language_order(
    languages: list[dict[str, Any]], default_language: str
) -> list[str]:
    ordered: list[str] = []
    seen: set[str] = set()
    default_lang = normalize_lang(default_language)
    if default_lang:
        ordered.append(default_lang)
        seen.add(default_lang)
    for language in languages:
        candidate = normalize_lang(str(language.get("lang", "")))
        if candidate and candidate not in seen:
            ordered.append(candidate)
            seen.add(candidate)
    return ordered


def choose_canonical_target(
    targets: dict[str, Any], default_language: str, language_order: list[str]
) -> tuple[str, dict[str, Any]]:
    default_lang = normalize_lang(default_language)
    if default_lang and default_lang in targets:
        return default_lang, targets[default_lang]
    for lang in language_order:
        if lang in targets:
            return lang, targets[lang]
    canonical_lang = sorted(targets)[0]
    return canonical_lang, targets[canonical_lang]


def pick_entry(
    entry: dict[str, Any], default_language: str, language_order: list[str]
) -> dict[str, Any]:
    raw_targets = entry.get("targets", {})
    targets = {normalize_lang(lang): target for lang, target in raw_targets.items()}
    if not targets:
        raise AutoEntryError(
            f"Entry is missing targets: {entry.get('entrySourcePath', 'unknown')}"
        )

    if len(targets) == 1:
        target = next(iter(targets.values()))
        return {
            "mode": "single",
            "logicalPath": normalize_route(str(target.get("logicalPath", "/"))),
            "canonical": target,
            "targets": targets,
        }

    _, canonical_target = choose_canonical_target(
        targets, default_language, language_order
    )

    return {
        "mode": "detect",
        "logicalPath": normalize_route(str(canonical_target.get("logicalPath", "/"))),
        "canonical": canonical_target,
        "targets": targets,
    }


def render_link_items(targets: dict[str, Any], canonical_lang: str) -> str:
    ordered = []
    if canonical_lang in targets:
        ordered.append((canonical_lang, targets[canonical_lang]))
    ordered.extend(
        (lang, target) for lang, target in targets.items() if lang != canonical_lang
    )
    items = []
    for lang, target in ordered:
        href = str(target.get("relPermalink", "/"))
        title = str(target.get("title", href))
        items.append(
            f'<li><a href="{html.escape(href, quote=True)}">'
            f"{html.escape(title)} ({html.escape(lang)})</a></li>"
        )
    return "\n      ".join(items)


def render_detection_script(targets: dict[str, Any], fallback_url: str) -> str:
    target_map = {
        lang: str(target.get("relPermalink", fallback_url))
        for lang, target in targets.items()
    }
    script_payload = json.dumps(target_map, ensure_ascii=True, sort_keys=True)
    fallback_payload = json.dumps(LANGUAGE_FALLBACKS, ensure_ascii=True, sort_keys=True)
    storage_key_payload = json.dumps(LANGUAGE_STORAGE_KEY, ensure_ascii=True)
    fallback_url_payload = json.dumps(fallback_url, ensure_ascii=True)
    return f"""(function () {{
  var targets = {script_payload};
  var storageKey = {storage_key_payload};
  var fallbackMap = {fallback_payload};
  var fallbackURL = {fallback_url_payload};

  var navigate = function (url) {{
    window.location.replace(url || fallbackURL);
  }};

  var resolveFallback = function (value) {{
    var mapped = fallbackMap[value];
    if (!mapped) {{
      return '';
    }}
    var candidates = Array.isArray(mapped) ? mapped : [mapped];
    for (var index = 0; index < candidates.length; index += 1) {{
      if (targets[candidates[index]]) {{
        return candidates[index];
      }}
    }}
    return '';
  }};

  var resolveLanguage = function (rawValue) {{
    if (!rawValue) {{
      return '';
    }}
    var normalized = String(rawValue).trim().toLowerCase();
    if (!normalized) {{
      return '';
    }}
    if (targets[normalized]) {{
      return normalized;
    }}
    var fallbackMatch = resolveFallback(normalized);
    if (fallbackMatch) {{
      return fallbackMatch;
    }}
    var primary = normalized.split('-')[0];
    if (targets[primary]) {{
      return primary;
    }}
    fallbackMatch = resolveFallback(primary);
    if (fallbackMatch) {{
      return fallbackMatch;
    }}
    return '';
  }};

  try {{
    var stored = window.localStorage.getItem(storageKey);
    var storedLang = resolveLanguage(stored);
    if (storedLang) {{
      navigate(targets[storedLang]);
      return;
    }}
  }} catch (error) {{
  }}

  var browserLanguages = Array.isArray(window.navigator.languages) && window.navigator.languages.length
    ? window.navigator.languages
    : [window.navigator.language || ''];
  for (var index = 0; index < browserLanguages.length; index += 1) {{
    var matchedLang = resolveLanguage(browserLanguages[index]);
    if (matchedLang) {{
      navigate(targets[matchedLang]);
      return;
    }}
  }}

  navigate(fallbackURL);
}})();"""


def render_single_target_script(target_url: str) -> str:
    payload = json.dumps(target_url, ensure_ascii=True)
    return f"window.location.replace({payload});"


def render_entry_html(entry: dict[str, Any]) -> str:
    canonical = entry["canonical"]
    canonical_lang = normalize_lang(str(canonical.get("lang", "")))
    canonical_url = str(canonical.get("permalink", canonical.get("relPermalink", "/")))
    fallback_url = str(canonical.get("relPermalink", "/"))
    title = str(canonical.get("title", "Redirecting"))
    document_lang = str(canonical.get("lang", "en")) or "en"
    targets = entry["targets"]

    if entry["mode"] == "single":
        script = render_single_target_script(fallback_url)
    else:
        script = render_detection_script(targets, fallback_url)

    link_items = render_link_items(targets, canonical_lang)
    return f"""<!DOCTYPE html>
<html lang="{html.escape(document_lang, quote=True)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(title)}</title>
  <meta name="robots" content="noindex,follow">
  <meta http-equiv="refresh" content="0; url={html.escape(fallback_url, quote=True)}">
  <link rel="canonical" href="{html.escape(canonical_url, quote=True)}">
  <script>{script}</script>
</head>
<body>
  <main>
    <p>Redirecting to {html.escape(fallback_url)}</p>
    <noscript>
      <p>JavaScript is disabled. Choose a language page:</p>
      <ul>
      {link_items}
      </ul>
    </noscript>
  </main>
</body>
</html>
"""


def ensure_safe_to_write(
    output_path: Path, publish_dir: Path, previous_files: set[str]
) -> None:
    relative_path = output_path_to_relative(output_path, publish_dir)
    if output_path.exists() and relative_path not in previous_files:
        raise AutoEntryError(
            f"The target path is already occupied by an existing file: {relative_path}"
        )
    if output_path.parent.exists() and output_path.parent.is_file():
        raise AutoEntryError(
            f"The target parent path is not a directory: {output_path.parent}"
        )


def write_entry(output_path: Path, html: str) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(html, encoding="utf-8")


def generate_entries(
    config: dict[str, Any], manifest: dict[str, Any], publish_dir: Path
) -> set[str]:
    default_language = str(config.get("defaultContentLanguage", "")).strip()
    default_in_subdir = bool(config.get("defaultContentLanguageInSubdir", False))
    language_order = build_language_order(
        manifest.get("languages", []), default_language
    )
    entry_prefix = "/" if default_in_subdir else f"/{AUTO_PREFIX}/"

    previous_files = load_previous_generated_files(publish_dir)
    next_files: set[str] = set()

    home_entry = pick_home_entry(manifest.get("homeTargets", {}), default_language)
    home_route = join_route(entry_prefix, home_entry["logicalPath"])
    home_output = route_to_output_path(publish_dir, home_route)
    ensure_safe_to_write(home_output, publish_dir, previous_files)
    write_entry(home_output, render_entry_html(home_entry))
    next_files.add(output_path_to_relative(home_output, publish_dir))

    for raw_entry in manifest.get("entries", []):
        entry = pick_entry(raw_entry, default_language, language_order)
        entry_route = join_route(entry_prefix, entry["logicalPath"])
        output_path = route_to_output_path(publish_dir, entry_route)
        ensure_safe_to_write(output_path, publish_dir, previous_files)
        write_entry(output_path, render_entry_html(entry))
        next_files.add(output_path_to_relative(output_path, publish_dir))

    stale_files = previous_files - next_files
    for relative_path in sorted(stale_files, reverse=True):
        target = publish_dir / relative_path
        if target.exists():
            target.unlink()
            prune_empty_parents(target.parent, publish_dir)

    manifest_path = publish_dir / AUTO_MANIFEST_NAME
    manifest_path.write_text(
        json.dumps({"files": sorted(next_files)}, ensure_ascii=True, indent=2) + "\n",
        encoding="utf-8",
    )
    return next_files


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate Tralume auto entry pages after Hugo build."
    )
    parser.add_argument("--config", default="hugo.toml", help="Path to hugo.toml")
    parser.add_argument("--publish-dir", default=None, help="Override Hugo publishDir")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    workspace_root = Path.cwd()
    config_path = (workspace_root / args.config).resolve()
    if not config_path.exists():
        raise AutoEntryError(f"The config file does not exist: {config_path}")

    config = load_toml(config_path)
    publish_dir = resolve_publish_dir(config, args.publish_dir, workspace_root)
    params = config.get("params", {})
    routing_config = params.get("i18nRouting", {})
    auto_entry_enabled = bool(routing_config.get("enableAutoEntry", False))
    previous_files = load_previous_generated_files(publish_dir)

    if not auto_entry_enabled:
        if previous_files:
            cleanup_generated_files(publish_dir, previous_files)
        return 0

    if not bool(config.get("disableDefaultLanguageRedirect", False)):
        raise AutoEntryError(
            "`disableDefaultLanguageRedirect = true` is required when smart "
            "language entry pages are enabled."
        )

    manifest_path = resolve_manifest_path(
        publish_dir=publish_dir,
        default_language=str(config.get("defaultContentLanguage", "")),
        default_in_subdir=bool(config.get("defaultContentLanguageInSubdir", False)),
    )
    with manifest_path.open("r", encoding="utf-8") as handle:
        manifest = json.load(handle)

    generated_files = generate_entries(config, manifest, publish_dir)
    print(f"Generated {len(generated_files)} auto entry files in {publish_dir}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AutoEntryError as error:
        print(f"[gen_auto_entries] {error}", file=sys.stderr)
        raise SystemExit(1)
