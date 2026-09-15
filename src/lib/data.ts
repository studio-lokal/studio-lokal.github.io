import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "yaml";

export type Member = {
  name: string;
  emoji: string;
  description: string;
  link?: string;
};

export type Contact = {
  name: string;
  link: string;
  label: string;
};

export type Site = {
  title: string;
  description: string;
  keywords: string;
  contacts: Contact[];
};

function resolveDataDir(): string {
  const relativeToModule = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../data",
  );
  if (fs.existsSync(path.join(relativeToModule, "site.yml"))) {
    return relativeToModule;
  }
  return path.join(process.cwd(), "src/data");
}

const dataDir = resolveDataDir();

function readYamlFile(filename: string): unknown {
  const filePath = path.join(dataDir, filename);
  const contents = fs.readFileSync(filePath, "utf8");
  return yaml.parse(contents);
}

export function loadSite(): Site {
  return readYamlFile("site.yml") as Site;
}

export function loadMembers(): Member[] {
  return readYamlFile("members.yml") as Member[];
}
