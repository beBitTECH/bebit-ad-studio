# PROJECT.md — beBit TECH Ad Studio

> Single source of truth. All other AI tools should read this file first.

## What this system does

Generates 1080×1080px Facebook ad banners for beBit TECH lecture events: takes event information as input, calls Gemini to write ad copy, renders styled HTML templates, and converts them to JPEG via Puppeteer — producing ready-to-upload files for Meta Ads Manager A/B testing.

---

## Complete pipeline

```
Event info (name, date, venue, topic, speakers, audience)
  │
  ▼ skill_a_gemini.py
Gemini 2.5-flash generates 15 copy variants
  { h: headline, s: subheadline, cta: call-to-action }
  │
  ▼ skill_b_layout.py  +  skill_c_color.py  +  skill_d_deco.py
HTML template rendered at 1080×1080px
  (layout × color palette × SVG decoration layer)
  │
  ▼ app.py (Flask /api/generate)
ZIP of N HTML files delivered to browser
  │
  ▼ user unzips, then: node convert.mjs --dir ./unzipped-folder
Puppeteer screenshots each HTML → JPEG (quality 95, clip 1080×1080)
  │
  ▼
JPEG files — ready for Meta Ads Manager upload
```

---

## File map

| File | Role |
|------|------|
| `app.py` | Flask server v5; routes: `/` (UI), `/api/speakers`, `/api/generate_copy` (Gemini), `/api/generate` (ZIP) |
| `skill_a_gemini.py` | Gemini API client; generates 15 copy variants with `generate_copies(event, api_key)`; fallback copies via `get_copies_fallback()` |
| `skill_a_copy.py` | Legacy static copy bank (25 hardcoded variants, no Gemini); used as reference; superseded by `skill_a_gemini.py` |
| `skill_b_layout.py` | 8 solo layouts (S_L1–S_L6, S_D1, S_D2) + 3 multi-speaker layouts (M_L1, M_L2, M_D1); `render_single()` and `render_multi()` are the main entry points |
| `skill_c_color.py` | 12 color palettes: L1–L8 (light) + D1–D4 (dark); `get_logo(k)` returns `logo.png` or `darklogo.png` based on palette |
| `skill_d_deco.py` | 5 SVG decoration variants (hexagon grid, dot grid, corner polygons, wave curves, diagonal lines); injected as absolute-positioned overlay |
| `speakers.py` | 4 pre-configured speakers; `get_speakers()` returns the dict; `add_speaker()` adds new entries |
| `templates/index.html` | Full web UI: API key input, event form, speaker selector, quantity control, generate button, download button |
| `convert.mjs` | Puppeteer ESM script; reads `--dir` argument (defaults to `./output`); screenshots each `.html` → `.jpg` at 1080×1080 |
| `requirements.txt` | Python deps: `flask>=3.0.0`, `flask-cors>=4.0.0` |
| `package.json` | Node dep: `puppeteer^24.40.0` |
| `static/img/logo.png` | Light-background beBit TECH logo |
| `static/img/darklogo.png` | Dark-background beBit TECH logo |
| `static/img/speaker1.jpg` | Mars Chen photo |
| `static/img/speaker2.jpg` | Miya Hsieh photo |
| `static/img/speaker3.jpg` | Ryan Lai photo |
| `static/img/speaker4.jpg` | Olivia Hsiang photo |
| `html-files/` | 50 pre-rendered HTML ad banners from a prior run (reference examples) |
| `output-jpegs/` | 50 JPEG outputs corresponding to `html-files/` (reference examples) |
| `.env.example` | Template for required environment variables |
| `.gitignore` | Excludes `__pycache__`, `.env`, `node_modules`, speaker/logo images |

---

## Pre-configured speakers

| Key | Name | Chinese Name | 職稱 | Image file |
|-----|------|-------------|------|------------|
| S1 | Mars Chen | 陳冠綸 | 業務總監 | speaker1.jpg |
| S2 | Miya Hsieh | 謝宜珊 | 銷售總監 | speaker2.jpg |
| S3 | Ryan Lai | 賴泓睿 | 資深業務總監 | speaker3.jpg |
| S4 | Olivia Hsiang | 項靖雅 | 業務副總監 | speaker4.jpg |

---

## HTML templates (layouts)

### Solo layouts (single speaker)

| Key | Visual style |
|-----|-------------|
| S_L1 | White background; large serif headline left, speaker photo right in rounded rectangle; hexagon SVG grid overlay |
| S_L2 | Clean split: text column left, speaker photo right with accent color rule above; dot-grid SVG overlay |
| S_L3 | Structured layout with category tag, headline, horizontal rule, subheadline; speaker photo in right column |
| S_L4 | Prominent speaker panel on right side with accent border; bold headline dominates left column |
| S_L5 | Speaker card with rounded corners and border at right; lighter typographic treatment |
| S_L6 | Three-column mid section: copy / speaker / meta; more editorial feel |
| S_D1 | Dark background variant; high-contrast text; speaker in rounded container; corner polygon SVG accents |
| S_D2 | Dark background with chip-style speaker label; wave-curve SVG overlay; minimal photo treatment |

### Multi-speaker layouts (2–4 speakers)

| Key | Visual style |
|-----|-------------|
| M_L1 | Light background; speakers in a horizontal row of portrait cards below the headline |
| M_L2 | Light background; speakers arranged in a grid; headline and copy above |
| M_D1 | Dark background; speaker row with name/title chips; bold headline treatment |

---

## Color palettes

| Key | Name | Mode |
|-----|------|------|
| L1 | 純白海軍 | Light |
| L2 | 霧白石墨 | Light |
| L3 | 冰藍商務 | Light |
| L4 | 暖白鉛灰 | Light |
| L5 | 珍珠蔚藍 | Light |
| L6 | 米白主管 | Light |
| L7 | 冷灰精英 | Light |
| L8 | 白底朱紅 | Light |
| D1 | 科技深藍 | Dark |
| D2 | 深夜石墨 | Dark |
| D3 | 墨綠科技 | Dark |
| D4 | 深寶藍 | Dark |

---

## Hard technical rules

These rules are extracted from the actual code and confirmed in the pre-rendered HTML samples. Violating them causes visual artifacts or broken layouts.

1. **Never use `mix-blend-mode` on speaker photos.** It causes display artifacts when Puppeteer renders the file.

2. **Use SVG `<polygon>` for geometric shapes.** CSS `clip-path` and border tricks render inconsistently across Puppeteer and browser versions. All decorative shapes in `skill_d_deco.py` use SVG polygons.

3. **All title and 職稱 text requires `white-space: nowrap`.** Chinese job titles (e.g. 資深業務總監) break onto multiple lines without it, destroying layout proportion.

4. **All image paths must be injected via the data pipeline, never hardcoded in HTML.** The layout functions in `skill_b_layout.py` inject `speaker_file` and `logo.png`/`darklogo.png` via f-strings. Hardcoded paths break when the ZIP is unzipped to a different folder structure.

5. **HTML canvas size is fixed at 1080×1080px.** Both `html` and `body` elements are set to `width:1080px; height:1080px; overflow:hidden`. Do not change this.

6. **Puppeteer viewport must be set to `1080×1080` with `deviceScaleFactor:1`.** `convert.mjs` enforces this. Using `fullPage:true` or omitting the clip causes white borders.

7. **Use Google Fonts `@import` for Chinese typography.** Noto Sans TC is used consistently. System fonts are inconsistent across environments and will not render Chinese correctly on Render.

---

## Required environment variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google AI Studio API key (starts with `AIza`). Without it, the system falls back to static copy. Paid plan recommended — free plan has unstable quota. |
| `FLASK_ENV` | `development` for local; omit or set `production` on Render |

---

## Common errors and exact fixes

| Problem | Fix |
|---------|-----|
| Port 5000 in use on macOS | System Settings → General → AirDrop & Handoff → disable AirPlay Receiver |
| Gemini returns empty or JSON parse error | Ensure `responseMimeType: "application/json"` is set in `generationConfig` in `skill_a_gemini.py` |
| Gemini model deprecated | Update model name in `skill_a_gemini.py` — current: `gemini-2.5-flash`. Verify at ai.google.dev |
| Render deployment connection refused | Flask must bind `host="0.0.0.0"` — already set in `app.py` `__main__` block |
| Speaker photo display issue | Never use `mix-blend-mode` on speaker photo elements |
| JPEG has white border | Ensure `page.setViewport({width:1080, height:1080, deviceScaleFactor:1})` and `clip:{x:0,y:0,width:1080,height:1080}` in `convert.mjs` |
| Wrong Python version | Always use `python3.11` explicitly — not `python3` or `python` |
