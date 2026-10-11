import { MOVA_VERSION, isClassesContent, movaFileSchema, } from "./schemas.js";
export const MOVA_SCHEMA_URL = "https://app.movadigital.pt/schema/mova.v1.json";
// Valida o conteúdo de content/site.ts. Lança um erro se o formato estiver errado.
export function defineSite(input) {
    return movaFileSchema.parse({ ...input, versao: MOVA_VERSION });
}
// Texto do ficheiro public/mova.json, já validado.
export function buildMovaJson(site) {
    const file = movaFileSchema.parse({ ...site, versao: MOVA_VERSION });
    const { $schema: _ignored, ...rest } = file;
    return `${JSON.stringify({ $schema: MOVA_SCHEMA_URL, ...rest }, null, 2)}\n`;
}
// Retira os itens com "visivel": false, como faz a API pública.
export function filterVisible(block, content) {
    if (block === "contactos")
        return content;
    if (block === "horarios") {
        const schedules = content;
        const result = {};
        for (const [id, schedule] of Object.entries(schedules)) {
            result[id] = isClassesContent(schedule)
                ? { ...schedule, aulas: schedule.aulas.filter((item) => item.visivel) }
                : schedule;
        }
        return result;
    }
    const items = content;
    return items.filter((item) => item.visivel);
}
