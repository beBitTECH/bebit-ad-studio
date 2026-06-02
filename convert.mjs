/**
 * convert.mjs — HTML → JPG 批量轉換
 *
 * 使用方式（本地，指定同一目錄）：
 *   node convert.mjs --dir ./output
 *
 * 伺服器端呼叫（分離 input / output 目錄）：
 *   node convert.mjs --input /tmp/html_dir --output /tmp/jpeg_dir
 *
 * 白邊修正：
 *   - page.setViewport 強制 1080×1080
 *   - screenshot clip 硬切 1080×1080
 *   - fullPage: false
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── 參數解析 ──
const args = process.argv.slice(2);

const inputIdx  = args.indexOf('--input');
const outputIdx = args.indexOf('--output');
const dirIdx    = args.indexOf('--dir');  // backwards compat: input = output

const inputDir  = inputIdx  !== -1 ? args[inputIdx  + 1]
                : dirIdx    !== -1 ? args[dirIdx + 1]
                : './output';
const outputDir = outputIdx !== -1 ? args[outputIdx + 1]
                : dirIdx    !== -1 ? args[dirIdx + 1]
                : inputDir;

const absInput  = path.resolve(__dirname, inputDir);
const absOutput = path.resolve(__dirname, outputDir);

const files = fs.readdirSync(absInput).filter(f => f.endsWith('.html'));
if (files.length === 0) {
  console.error(`❌ 找不到 HTML 檔案：${absInput}`);
  process.exit(1);
}

fs.mkdirSync(absOutput, { recursive: true });

console.log(`\n🚀 HTML → JPG 轉換`);
console.log(`   來源：${absInput}`);
console.log(`   輸出：${absOutput}`);
console.log(`   共 ${files.length} 個檔案\n`);

// Use system Chromium in Docker, fall back to Puppeteer's bundled binary locally
const executablePath = fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined;

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

let done = 0;
for (const file of files) {
  const page = await browser.newPage();

  // ★ 白邊修正關鍵：強制 viewport = 1080×1080，不讓瀏覽器自行縮放
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 });

  const fileUrl = `file://${path.join(absInput, file)}`;
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 15000 });

  // 等字體載入（waitForTimeout 已在 Puppeteer v22 移除，改用 setTimeout）
  await new Promise(r => setTimeout(r, 400));

  const outPath = path.join(absOutput, file.replace('.html', '.jpg'));
  await page.screenshot({
    path: outPath,
    type: 'jpeg',
    quality: 95,
    // ★ 強制截取精確 1080×1080，不會有多餘邊距
    clip: { x: 0, y: 0, width: 1080, height: 1080 },
    fullPage: false,
  });

  await page.close();
  done++;
  console.log(`  ✅ ${done}/${files.length}  ${file.replace('.html', '.jpg')}`);
}

await browser.close();
console.log(`\n🎉 完成！${done} 個 JPG 已存至 ${absOutput}/`);
