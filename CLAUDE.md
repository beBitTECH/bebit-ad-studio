# CLAUDE.md

Primary entry point for Claude Code. Read `PROJECT.md` first — all project details are there.

## Quick reference

| Item | Value |
|------|-------|
| Entry point | `app.py` (Flask server) |
| Local dev | `python3.11 app.py` → http://127.0.0.1:5000 |
| Screenshot | `node convert.mjs` (run after app.py generates HTML output) |
| Templates | Plain HTML in `/templates/` — no frontend framework |
| API key | Set `GEMINI_API_KEY` in `.env` file |

## Claude-specific notes

- Always read `PROJECT.md` before modifying any template or skill file.
- Image paths must be injected via the data pipeline — never hardcode in HTML.
- When adding a new template: create the HTML file, update layout logic in `skill_b_layout.py`, document the visual style in `PROJECT.md`.
- Current Gemini model: `gemini-2.5-flash` — check Google AI Studio if deprecated.
- `skill_a_copy.py` is a legacy file retained for reference; do not use it as the active copy source.
