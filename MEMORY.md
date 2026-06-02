# MEMORY.md — Technical Gotchas

Every entry confirmed in source code or encountered during development.

---

## Environment

| Problem | Solution |
|---------|----------|
| Port 5000 in use on macOS | System Settings → General → AirDrop & Handoff → disable AirPlay Receiver |
| Wrong Python version | Always use `python3.11` explicitly — not `python3` or `python` |
| Render deployment: connection refused | Flask must bind `host="0.0.0.0"` — already set in `app.py` |

---

## Gemini API

| Problem | Solution |
|---------|----------|
| JSON parse error on response | Add `"responseMimeType": "application/json"` to `generationConfig` in the API request |
| Model deprecated error | Current model: `gemini-2.5-flash` — verify at ai.google.dev if error occurs |
| Empty or unstable responses | Free plan has quota limits — paid plan required for reliable operation |
| Poor copy quality | Prompt must set role as B2B marketing consultant, require 5 appeal-angle dimensions (痛點/利益/好奇/緊迫/權威), explicitly prohibit vague slogans |

---

## HTML Template Rules

| Rule | Reason |
|------|--------|
| Never use `mix-blend-mode` on speaker photos | Causes display artifacts in Puppeteer rendering |
| Use SVG `<polygon>` for geometric shapes | CSS `clip-path` and border tricks render inconsistently across Puppeteer versions |
| Add `white-space: nowrap` to all title and 職稱 text | Prevents unexpected line breaks in Chinese job titles (e.g. 資深業務總監) |
| Inject all image paths via layout functions, never hardcode in HTML | Hardcoded paths break when files are unzipped to a different folder structure |
| Use Google Fonts `@import` for Chinese typography | System fonts are inconsistent across environments; Noto Sans TC must load from CDN |
| Set both `html` and `body` to `width:1080px; height:1080px; overflow:hidden` | Prevents content from extending beyond the canvas |

---

## Puppeteer / convert.mjs

| Rule | Reason |
|------|--------|
| `setViewport({width:1080, height:1080, deviceScaleFactor:1})` | Without this, browser auto-scales and introduces white borders |
| `clip:{x:0, y:0, width:1080, height:1080}` with `fullPage:false` | Hard-crops to exactly 1080×1080; `fullPage:true` captures scroll height which may exceed 1080px |
| `waitUntil: "networkidle0"` in `page.goto()` | Required for Google Fonts to load before screenshot |
| `page.waitForTimeout(400)` after load | Extra buffer for font render; `networkidle0` alone is sometimes insufficient |

---

## Canva MCP (abandoned path — for reference only)

| Issue | Note |
|-------|------|
| Chinese text garbled | AI-generated Chinese in Canva requires element-by-element `replace_text` correction for each text node |
| Local file paths rejected | `upload-asset-from-url` requires a public URL, not a local file path |
| Operation sequence | `generate-design` → `create-design-from-candidate` (requires both `job_id` and `candidate_id`) → `start-editing-transaction` → `perform-editing-operations` → `commit-editing-transaction` |

---

## Color/Logo pairing

| Condition | Logo to use |
|-----------|-------------|
| Dark palette (D1, D2, D3, D4) | `darklogo.png` |
| Light palette (L1–L8) | `logo.png` |

`skill_c_color.py::get_logo(color_key)` handles this automatically.
