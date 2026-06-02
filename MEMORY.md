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

---

## Current Status & Next Steps (as of 2026-06-02)

### Deployment
- Currently deployed on Render free plan at https://bebit-ad-studio.onrender.com
- Problem: Render free plan sleeps after 15 minutes of inactivity (30–60 sec cold start)
- Decision: migrate to Railway (better Flask support, no sleep on free plan)
- Status: migration not yet started

### Known limitation: HTML to JPEG requires local Node.js
- Current flow: user downloads ZIP from web UI → runs node convert.mjs locally → gets JPEG
- Problem: requires Node.js installed on local machine, not viable for non-technical users
- Decision: move Puppeteer screenshot step to the server so users download JPEG directly
- Status: development not yet started — this is the next feature to build after Railway migration

### Recommended next steps in order
1. Migrate from Render to Railway (move deployment, verify Flask runs correctly, update production URL)
2. Add server-side Puppeteer: modify app.py to run convert.mjs on the server and return JPEG directly instead of HTML ZIP
3. Update PROJECT.md and README.md to reflect new deployment URL and simplified download flow

### Why these decisions were made
- Railway chosen over Vercel (Vercel designed for frontend, extra config needed for Flask), Render paid plan ($7/month), and Hugging Face Spaces (slow cold start)
- Server-side conversion chosen to remove Node.js dependency from end users

## Handover note for incoming AI agent
If you are reading this after a session change:
- The repo is at github.com/beBitTECH/bebit-ad-studio (private)
- Read PROJECT.md first for full system context
- The two immediate tasks above (Railway migration + server-side JPEG) are unstarted
- Do not modify the HTML templates or skill files unless explicitly asked

---

## Deployment Update (2026-06-02)

### Migrated from Render to Railway
- Production URL: https://bebit-ad-studio-production.up.railway.app
- Render is no longer used
- Railway uses Dockerfile builder (not Nixpacks — Nixpacks failed to detect Python when package.json was present)
- Port: Railway assigns $PORT dynamically; gunicorn binds to 0.0.0.0:$PORT

### Railway deployment lessons learned
| Problem | Solution |
|---------|----------|
| Nixpacks detected Node.js instead of Python (package.json present) | Switched to Dockerfile builder |
| python3.11 / python3 / gunicorn not found in container | Dockerfile uses python:3.11-slim base image |
| Chinese text rendering as boxes in JPEG output | Added fonts-noto-cjk to Dockerfile apt-get install |
| libasound2 not found on Debian bookworm | Use libasound2t64 instead |
| libxss1 not found on Debian bookworm | Remove it; Chromium handles it transitively |

### Server-side JPEG conversion (completed 2026-06-02)
- Users now download JPEG ZIP directly — no local Node.js required
- app.py writes HTML to tempfile, copies static/img/ alongside, calls node convert.mjs via subprocess, zips JPEGs, cleans up with try/finally
- convert.mjs updated: --input/--output args, auto-detects /usr/bin/chromium in Docker, setTimeout replaces deprecated waitForTimeout
- Dockerfile includes nodejs, npm, chromium, fonts-noto-cjk

### API Key
- GEMINI_API_KEY set in Railway Variables (not in code)
- Key registered under Marcus's personal Google account: marcusbetch@gmail.com
- Company account cannot create API keys (lacks permission)

### Images in git
- All speaker photos and logos are committed to the repo (static/img/)
- Privacy was not a concern for this project
