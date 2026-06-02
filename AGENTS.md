# AGENTS.md

Primary entry point for OpenAI Codex and other agent frameworks. Read `PROJECT.md` first.

## Pipeline stages

| Stage | File | Input | Output |
|-------|------|-------|--------|
| Copy generation | `skill_a_gemini.py` | Event info dict | 15 copy variants: `{h, s, cta}` keyed A01–A15 |
| Layout decisions | `skill_b_layout.py` | Copy + speaker selection | 1080×1080px HTML string |
| Color scheme | `skill_c_color.py` | Layout key | Color values dict + logo filename |
| Decoration | `skill_d_deco.py` | Variant index + color dict | SVG string injected into HTML |
| HTML rendering | `app.py` | All skill outputs combined | ZIP of N HTML files |
| JPEG conversion | `convert.mjs` | Path to folder of HTML files | JPEG files at 1080×1080px |

## How to add a new HTML template

1. Create the layout function in `skill_b_layout.py` following the existing naming pattern (`S_L7`, `M_L3`, etc.)
2. Register it in `SOLO_LAYOUTS` or `MULTI_LAYOUTS` dict and the corresponding sequence list (`SOLO_SEQ` / `MULTI_SEQ`)
3. Test with at least 3 different event info inputs and all 12 color palettes
4. Add the template to the templates table in `PROJECT.md` with a 1–2 sentence visual description

## How to add a new speaker

Call `add_speaker(key, name, title, company, file)` in `speakers.py`, or add directly to `_SPEAKERS` dict. Place the speaker photo at `static/img/<file>`.

## Full project context: see PROJECT.md
