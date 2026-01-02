/**
 * Font Awesome SVG → PNG Exporter
 *
 * Generates PNG icons from Font Awesome (Free) SVGs,
 * with controlled padding, transparent background,
 * and white color via currentColor.
 *
 * Generated sizes:
 *  - 800x800 (110px padding)
 *  - 196x196 (proportional padding)
 *
 * Output structure:
 *  out/800/<style>/*.png
 *  out/196/<style>/*.png
 *
 * Script author: Mário Valney with ChatGPT
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== CONFIGURATION =====
const DENSITY = 600;

const TARGETS = [
  { size: 800, padding: 110 },
  { size: 196, padding: 27 },
];

const faRoot = path.dirname(
  require.resolve("@fortawesome/fontawesome-free/package.json")
);

const inputDirs = [
  path.join(faRoot, "svgs-full", "solid"),
  path.join(faRoot, "svgs-full", "regular"),
  path.join(faRoot, "svgs-full", "brands"),
];

const outRoot = path.join(__dirname, "..", "out");

// ==========================

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

// Font Awesome uses currentColor → defining "color" on <svg> is enough
function forceWhite(svg) {
  if (svg.includes('color="')) {
    return svg.replace(/color="[^"]*"/, 'color="white"');
  }
  return svg.replace("<svg", '<svg color="white"');
}

function renderProgressLine({ style, targetSize, current, total, name }) {
  const width = 30;
  const pct = current / total;
  const filled = Math.round(width * pct);
  const bar = "█".repeat(filled) + "░".repeat(width - filled);
  const percentTxt = String(Math.floor(pct * 100)).padStart(3, " ");

  const left = `${style} @ ${targetSize}px`;
  const right = `${current}/${total}`;

  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  process.stdout.write(
    `${left} | ${bar} | ${percentTxt}% | ${right} | ${name}`
  );
}

function endProgressLine(message) {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  console.log(message);
}

async function svgToPaddedPng(svgBuffer, outPath, canvasSize, padding) {
  const innerSize = canvasSize - padding * 2;

  const iconBuffer = await sharp(svgBuffer, { density: DENSITY })
    .resize(innerSize, innerSize, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: iconBuffer, gravity: "center" }])
    .png()
    .toFile(outPath);
}


async function convertDir(inputDir) {
  const style = path.basename(inputDir);
  const files = fs.readdirSync(inputDir).filter((f) => f.endsWith(".svg"));

  for (const target of TARGETS) {
    const outDir = path.join(outRoot, String(target.size), style);
    ensureDir(outDir);

    const total = files.length;
    let current = 0;

    for (const file of files) {
      current++;

      const name = path.basename(file, ".svg");
      renderProgressLine({
        style,
        targetSize: target.size,
        current,
        total,
        name,
      });

      const svgPath = path.join(inputDir, file);
      const outPath = path.join(outDir, `${name}.png`);

      const rawSvg = fs.readFileSync(svgPath, "utf8");
      const whiteSvg = forceWhite(rawSvg);
      const svgBuffer = Buffer.from(whiteSvg);

      await svgToPaddedPng(svgBuffer, outPath, target.size, target.padding);
    }

    endProgressLine(`✔ ${style} @ ${target.size}px: ${total} icons`);
  }
}

(async () => {
  console.log("Font Awesome root:", faRoot);
  console.log("Output directory:", outRoot);
  console.log(
    "Targets:",
    TARGETS.map((t) => `${t.size}px`).join(", ")
  );
  console.log("");

  // Remove previous output directory
  if (fs.existsSync(outRoot)) {
    fs.rmSync(outRoot, { recursive: true, force: true });
    console.log("Previous output directory removed\n");
  }

  ensureDir(outRoot);

  for (const dir of inputDirs) {
    if (fs.existsSync(dir)) {
      await convertDir(dir);
    }
  }

  console.log("\n🎉 finished");
})().catch((err) => {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  console.error("ERROR:", err);
  process.exit(1);
});
