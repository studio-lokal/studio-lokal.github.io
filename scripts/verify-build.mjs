import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const distDir = "dist";
const errors = [];

function fail(message) {
  errors.push(message);
}

function readDist(relativePath) {
  const fullPath = join(distDir, relativePath);
  if (!existsSync(fullPath)) {
    fail(`Missing file: ${fullPath}`);
    return null;
  }
  return readFileSync(fullPath, "utf8");
}

function requireSubstring(content, fileLabel, needle) {
  if (content === null) {
    return;
  }
  if (!content.includes(needle)) {
    fail(`${fileLabel}: missing required string: ${needle}`);
  }
}

function headingTextMatches(html, tagName, expectedText) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  for (const match of html.matchAll(pattern)) {
    const innerText = match[1].replace(/<[^>]*>/g, "").trim();
    if (innerText.toLowerCase() === expectedText.toLowerCase()) {
      return true;
    }
  }
  return false;
}

function requireHeading(html, fileLabel, tagName, expectedText) {
  if (html === null) {
    return;
  }
  if (!headingTextMatches(html, tagName, expectedText)) {
    fail(
      `${fileLabel}: missing <${tagName}> with text "${expectedText}"`,
    );
  }
}

const indexHtml = readDist("index.html");
const notFoundHtml = readDist("404.html");

const indexRequiredStrings = [
  '<html lang="ko"',
  'href="#main"',
  'id="main"',
  "Studio Lokal Logo",
  "UA-123798377-1",
  "본문으로 건너뛰기",
  "새 탭에서 열림",
  "갱",
  "후니",
  "@studio-lokal",
  "@studio_lokal",
];

for (const needle of indexRequiredStrings) {
  requireSubstring(indexHtml, "dist/index.html", needle);
}

requireHeading(indexHtml, "dist/index.html", "h1", "lokal");

const sectionH2Titles = [
  "creative lokal",
  "studio lokal",
  "space lokal",
  "collaborators",
  "contact",
];

for (const title of sectionH2Titles) {
  requireHeading(indexHtml, "dist/index.html", "h2", title);
}

requireSubstring(notFoundHtml, "dist/404.html", "Page not found");

if (errors.length > 0) {
  console.error("verify-build failed:\n");
  for (const message of errors) {
    console.error(`  - ${message}`);
  }
  process.exit(1);
}

console.log("verify-build: all checks passed");
