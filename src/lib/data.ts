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

const dataDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../data",
);

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
