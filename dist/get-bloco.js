import { blockSchemas } from "./schemas.js";
import { filterVisible } from "./site.js";
export const MOVA_API_BASE_URL = "https://app.movadigital.pt";
export const MOVA_REVALIDATE_SECONDS = 300;
export const MOVA_TIMEOUT_MS = 3000;
const TENANT_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
function readTenantId() {
    return typeof process === "undefined" ? undefined : process.env.MOVA_TENANT_ID;
}
/**
 * Cria a função getBloco de um site.
 *
 * Com MOVA_TENANT_ID definido, lê o bloco da API do painel. Se a resposta não for 200
 * ou não passar no esquema, usa o conteúdo de content/site.ts. Nunca lança erros.
 */
export function createGetBloco(site, options = {}) {
    const fetchImpl = options.fetch ?? globalThis.fetch;
    function fromSite(name) {
        const content = site.conteudo[name];
        if (content === undefined || !site.blocos.includes(name))
            return null;
        return filterVisible(name, content);
    }
    async function fromApi(tenantId, name) {
        try {
            const url = `${MOVA_API_BASE_URL}/api/public/${encodeURIComponent(tenantId)}/${name}`;
            const response = await fetchImpl(url, {
                headers: { accept: "application/json" },
                signal: AbortSignal.timeout(MOVA_TIMEOUT_MS),
                next: { revalidate: MOVA_REVALIDATE_SECONDS },
            });
            if (response.status !== 200)
                return null;
            const parsed = blockSchemas[name].safeParse(await response.json());
            return parsed.success ? parsed.data : null;
        }
        catch {
            return null;
        }
    }
    return async function getBloco(name) {
        const tenantId = options.tenantId ?? readTenantId();
        if (tenantId !== undefined && TENANT_ID_PATTERN.test(tenantId)) {
            const remote = await fromApi(tenantId, name);
            if (remote !== null)
                return remote;
        }
        return fromSite(name);
    };
}
