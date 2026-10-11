import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { MovaFile } from "./schemas.js";
import { buildMovaJson, type SiteInput } from "./site.js";

// Escreve public/mova.json a partir do conteúdo do site. Só para scripts de build (Node).
export async function writeMovaJson(
  site: SiteInput | MovaFile,
  outFile = "public/mova.json",
): Promise<string> {
  const target = resolve(outFile);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, buildMovaJson(site), "utf8");
  return target;
}
