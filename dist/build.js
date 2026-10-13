import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fetchPanelContent, emptyPanelContent } from "./panel.js";
import { buildMovaJson } from "./site.js";
// Funções para os scripts de build dos sites (Node). Não usar em código do site.
async function writeJson(outFile, text) {
    const target = resolve(outFile);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, text, "utf8");
    return target;
}
/** Escreve public/mova.json a partir do conteúdo do site (os ficheiros). */
export async function writeMovaJson(site, outFile = "public/mova.json") {
    return writeJson(outFile, buildMovaJson(site));
}
/**
 * Escreve o conteúdo que o cliente editou no painel (content/panel.generated.json).
 *
 * - Sem `MOVA_TENANT_ID` (demonstrações, pré-visualizações, desenvolvimento):
 *   escreve conteúdo vazio e o site usa só os ficheiros.
 * - Com `MOVA_TENANT_ID`: vai buscar ao painel. Se falhar, lança erro e o build
 *   pára, para nunca se publicar o site sem as alterações do cliente.
 */
export async function writePanelContent(options = {}) {
    const { tenantId = process.env.MOVA_TENANT_ID, outFile = "content/panel.generated.json" } = options;
    const content = tenantId?.trim()
        ? await fetchPanelContent({ ...options, tenantId: tenantId.trim() })
        : emptyPanelContent();
    return writeJson(outFile, `${JSON.stringify(content, null, 2)}\n`);
}
