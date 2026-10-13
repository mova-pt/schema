import { type FetchPanelOptions } from "./panel.js";
import type { MovaFile } from "./schemas.js";
import { type SiteInput } from "./site.js";
/** Escreve public/mova.json a partir do conteúdo do site (os ficheiros). */
export declare function writeMovaJson(site: SiteInput | MovaFile, outFile?: string): Promise<string>;
export type WritePanelOptions = Partial<Omit<FetchPanelOptions, "tenantId">> & {
    /** Por omissão, a variável de ambiente MOVA_TENANT_ID. */
    tenantId?: string;
    outFile?: string;
};
/**
 * Escreve o conteúdo que o cliente editou no painel (content/panel.generated.json).
 *
 * - Sem `MOVA_TENANT_ID` (demonstrações, pré-visualizações, desenvolvimento):
 *   escreve conteúdo vazio e o site usa só os ficheiros.
 * - Com `MOVA_TENANT_ID`: vai buscar ao painel. Se falhar, lança erro e o build
 *   pára, para nunca se publicar o site sem as alterações do cliente.
 */
export declare function writePanelContent(options?: WritePanelOptions): Promise<string>;
