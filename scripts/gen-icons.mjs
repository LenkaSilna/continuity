import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = resolve(root, "public/icon.svg");
const svg = readFileSync(svgPath);

const targets = [
  { out: "app/icon.png", size: 32 },
  { out: "app/apple-icon.png", size: 180 },
  { out: "public/icon-192.png", size: 192 },
  { out: "public/icon-512.png", size: 512 },
];

for (const { out, size } of targets) {
  const abs = resolve(root, out);
  await sharp(svg, { density: 384 }).resize(size, size).png().toFile(abs);
  console.log(`✓ ${out} (${size}x${size})`);
}

const ico = resolve(root, "app/favicon.ico");
const icoSrc = resolve(root, "app/icon.png");
try {
  execFileSync("magick", [icoSrc, "-define", "icon:auto-resize=16,32,48", ico]);
  console.log(`✓ app/favicon.ico (16,32,48)`);
} catch {
  console.warn("⚠ favicon.ico skipped — install ImageMagick: brew install imagemagick");
}
