# beBit TECH Ad Studio

Generates 1080×1080px Facebook ad banners for beBit TECH lecture events.

Input: event information. Output: JPEG files ready for Meta Ads Manager A/B testing.

---

## How it works

1. Fill in event details and select speakers in the web UI
2. Gemini API writes the ad copy (headline, subheadline, CTA)
3. The system builds styled HTML files combining your copy with the selected template
4. Puppeteer converts each HTML file to a 1080×1080px JPEG
5. Upload the JPEGs to Meta Ads Manager

---

## Requirements

- **Python 3.11**: `brew install python@3.11`
- **Node.js**: for Puppeteer (HTML to JPEG conversion)
- **Gemini API key**: paid plan recommended — free plan has unstable quota

---

## Setup

```bash
pip3.11 install -r requirements.txt
npm install
cp .env.example .env
# Open .env and add your GEMINI_API_KEY
```

---

## Run

```bash
python3.11 app.py
```

Open http://127.0.0.1:5000 in Chrome.

> Safari: use http://localhost:5000 instead.

---

## Convert HTML to JPEG

After generating from the web UI, download the ZIP, unzip it, then:

```bash
node convert.mjs --dir ./path-to-unzipped-folder
```

The script defaults to `./output` if no `--dir` argument is given.

---

## Deploy to Render

Push to GitHub. Render auto-deploys on every push to `main`.

Production URL: https://bebit-ad-studio.onrender.com

Flask is already bound to `host="0.0.0.0"` in `app.py` — required for Render to accept connections.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 5000 already in use (macOS) | System Settings → General → AirDrop & Handoff → disable AirPlay Receiver |
| Gemini returns empty or parse error | Add `responseMimeType: "application/json"` to the API request `generationConfig` |
| Gemini model deprecated | Update model name in `skill_a_gemini.py` — current: `gemini-2.5-flash` |
| Render deployment not accessible | Flask must use `host="0.0.0.0"`, not `host="127.0.0.1"` |
| Speaker photo display issue | Never use `mix-blend-mode` on speaker photo elements |
| JPEG has white border | Ensure viewport and clip are both set to 1080×1080 in `convert.mjs` |
