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

function forbidSubstring(content, fileLabel, needle) {
  if (content === null) {
    return;
  }
  if (content.includes(needle)) {
    fail(`${fileLabel}: unexpected string: ${needle}`);
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

function forbidHeading(html, fileLabel, tagName, expectedText) {
  if (html === null) {
    return;
  }
  if (headingTextMatches(html, tagName, expectedText)) {
    fail(
      `${fileLabel}: unexpected <${tagName}> with text "${expectedText}"`,
    );
  }
}

const indexHtml = readDist("index.html");
const archiveHtml = readDist("archive/index.html");
const notFoundHtml = readDist("404.html");

const sharedRequiredStrings = [
  '<html lang="ko"',
  'href="#main"',
  'id="main"',
  "Studio Lokal Logo",
  "UA-123798377-1",
  "본문으로 건너뛰기",
  "새 탭에서 열림",
];

for (const needle of sharedRequiredStrings) {
  requireSubstring(indexHtml, "dist/index.html", needle);
  requireSubstring(archiveHtml, "dist/archive/index.html", needle);
}

requireHeading(indexHtml, "dist/index.html", "h1", "lokal");
requireSubstring(indexHtml, "dist/index.html", "lokal은 장르에 구애받지 않는");
requireSubstring(indexHtml, "dist/index.html", 'href="/archive"');
requireSubstring(indexHtml, "dist/index.html", 'aria-current="page">lokal');

const projectNames = [
  "월간 Montag",
  "아키식당",
  "샹송빵따곤",
  "탱고펜타고노",
  "던던클럽",
  "미크리프",
  "일하다 죽지 않을 직장 찾기",
  "오픈와치",
  "뉴웨이즈",
  "슬러기시 해커스 커뮤니티 모임",
];

for (const name of projectNames) {
  requireSubstring(indexHtml, "dist/index.html", name);
  requireSubstring(indexHtml, "dist/index.html", `<b>${name}`);
}

forbidSubstring(indexHtml, "dist/index.html", "<ol");

const archiveOnlyHeadings = [
  "creative lokal",
  "studio lokal",
  "space lokal",
  "collaborators",
  "contact",
];

for (const title of archiveOnlyHeadings) {
  requireHeading(archiveHtml, "dist/archive/index.html", "h2", title);
  forbidHeading(indexHtml, "dist/index.html", "h2", title);
}

const archiveRequiredStrings = [
  "갱",
  "후니",
  "@studio-lokal",
  "@studio_lokal",
  "로칼베이스",
  'href="/"',
  'aria-current="page">archive',
];

for (const needle of archiveRequiredStrings) {
  requireSubstring(archiveHtml, "dist/archive/index.html", needle);
}

forbidSubstring(indexHtml, "dist/index.html", "요기더기");
forbidSubstring(indexHtml, "dist/index.html", "로칼베이스");

requireSubstring(notFoundHtml, "dist/404.html", "Page not found");

if (errors.length > 0) {
  console.error("verify-build failed:\n");
  for (const message of errors) {
    console.error(`  - ${message}`);
  }
  process.exit(1);
}

console.log("verify-build: all checks passed");
