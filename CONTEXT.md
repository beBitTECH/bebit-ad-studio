# CONTEXT.md — Design Decisions

Why this system was built the way it is.

---

## Why HTML/CSS rendering instead of image generation models

Chinese typography must be controlled precisely. Image generation models (Stable Diffusion, DALL-E, Midjourney, Flux) render Chinese characters unreliably — stroke weight, spacing, and brand-specific font choices cannot be enforced. HTML/CSS with Google Fonts (`Noto Sans TC`, `Playfair Display`, `Raleway`) guarantees exact typographic output every time.

## Why Gemini for copy generation

Organizational constraint: only Claude or Gemini are permitted for AI-powered features. Gemini 2.5-flash is stable, cost-effective, and returns structured JSON reliably when `responseMimeType: "application/json"` is set. It produces competent B2B Chinese marketing copy when given a detailed role prompt.

## Why two separate scripts (`app.py` + `convert.mjs`)

Separation of concerns: Flask handles the web UI, data pipeline, and HTML generation; Puppeteer handles pixel-perfect rendering. Each stage can be run, debugged, and replaced independently. The HTML output is inspectable in any browser before conversion — this makes visual debugging fast.

## Quality ceiling

Output quality is determined by the base HTML template design, not AI prompts. To improve output quality, improve the templates in `skill_b_layout.py`. AI is a volume multiplier (generating many variants quickly), not a quality generator. The best-looking banners come from well-crafted HTML/CSS — the AI only fills in the copy.

---

## Abandoned paths

| Path | Reason abandoned |
|------|-----------------|
| Canva MCP | Template fill-in system only; Chinese text garbled in AI-generated elements; creative space limited to preset Canva templates |
| Lovart.ai | Best quality benchmark tested but prohibited by org constraint (no third-party external tools allowed) |
| Figma MCP | All available tutorials and documentation target design-to-code direction; no reliable code-to-image export path found |
| Direct image generation | Chinese text rendering unreliable across all tested models; brand consistency (fonts, colors, logo placement) cannot be guaranteed without fine-tuning |
| Hugging Face MCP | Structured graphic design output quality too unstable; no control over layout or typography |

---

## Relationship to banner-prompt-generator

`banner-prompt-generator` is a successor hypothesis: instead of rendering HTML and screenshotting it, generate a precise visual prompt for GPT image models and let the model compose the image. Both tools exist because neither fully solves the problem alone — this tool gives typographic control, that tool explores whether image models can match brand quality with a good-enough prompt.
