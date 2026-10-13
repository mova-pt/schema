import { BLOCK_NAMES, blockSchemas } from "./schemas.js";
// Conteúdo que o cliente editou no painel, obtido durante o BUILD do site.
//
// O site é estático. No build, `fetchPanelContent` pergunta à API do painel que
// blocos o cliente já editou e o resultado é escrito num ficheiro
// (content/panel.generated.json). Em funcionamento, o site não faz pedidos ao
// painel: lê só esse ficheiro. Quando o cliente grava, o painel pede à Vercel
// uma nova construção e o ciclo repete-se.
export const MOVA_API_BASE_URL = "https://app.movadigital.pt";
export const MOVA_TIMEOUT_MS = 10_000;
// Identificador de uma empresa: UUID, como no painel.
const TENANT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export class PanelFetchError extends Error {
    name = "PanelFetchError";
}
export function emptyPanelContent() {
    return { versao: 1, blocos: {} };
}
/** Valida o conteúdo vindo do painel (ou do ficheiro gerado). Lança erro se for inválido. */
export function parsePanelContent(input) {
    if (input === undefined || input === null)
        return emptyPanelContent();
    if (typeof input !== "object")
        throw new PanelFetchError("Conteúdo do painel inválido.");
    const raw = input;
    if (raw.versao !== 1 || typeof raw.blocos !== "object" || raw.blocos === null) {
        throw new PanelFetchError("Conteúdo do painel com formato desconhecido.");
    }
    const blocos = {};
    for (const [name, value] of Object.entries(raw.blocos)) {
        if (!BLOCK_NAMES.includes(name)) {
            throw new PanelFetchError(`Bloco desconhecido no conteúdo do painel: "${name}".`);
        }
        const parsed = blockSchemas[name].safeParse(value);
        if (!parsed.success) {
            throw new PanelFetchError(`O bloco "${name}" do painel não respeita o formato.`);
        }
        blocos[name] = parsed.data;
    }
    return { versao: 1, blocos: blocos };
}
async function fetchBlock(name, options) {
    // O parâmetro `b` torna o endereço único em cada build, para nenhuma cache
    // intermédia devolver conteúdo anterior à gravação do cliente.
    const url = `${options.baseUrl}/api/public/${encodeURIComponent(options.tenantId)}/${name}` +
        `?b=${Date.now()}`;
    let lastError = "sem resposta";
    for (let attempt = 0; attempt <= options.retries; attempt += 1) {
        if (attempt > 0 && options.retryDelayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, options.retryDelayMs * attempt));
        }
        try {
            const response = await options.fetch(url, {
                redirect: "error",
                cache: "no-store",
                headers: { accept: "application/json" },
                signal: AbortSignal.timeout(options.timeoutMs),
            });
            // 404: o bloco não foi editado pelo cliente (ou não está ativo). Usa-se o ficheiro.
            if (response.status === 404)
                return null;
            if (response.status === 200)
                return await response.json();
            lastError = `estado ${response.status}`;
            if (response.status < 500)
                break; // erro nosso: repetir não adianta
        }
        catch (error) {
            lastError = error instanceof Error ? error.name : "erro de rede";
        }
    }
    throw new PanelFetchError(`Não foi possível obter o bloco "${name}" do painel (${lastError}).`);
}
/**
 * Pergunta ao painel que blocos o cliente editou. Lança `PanelFetchError` se o
 * painel não responder bem: um build não deve publicar o site sem as
 * alterações do cliente, por isso falha e a versão anterior continua no ar.
 */
export async function fetchPanelContent(options) {
    if (!TENANT_ID_PATTERN.test(options.tenantId)) {
        throw new PanelFetchError("MOVA_TENANT_ID não é um identificador válido.");
    }
    const resolved = {
        tenantId: options.tenantId,
        baseUrl: (options.baseUrl ?? MOVA_API_BASE_URL).replace(/\/+$/, ""),
        fetch: options.fetch ?? globalThis.fetch,
        timeoutMs: options.timeoutMs ?? MOVA_TIMEOUT_MS,
        retries: options.retries ?? 2,
        retryDelayMs: options.retryDelayMs ?? 1_000,
    };
    const blocks = {};
    for (const name of BLOCK_NAMES) {
        const content = await fetchBlock(name, resolved);
        if (content !== null)
            blocks[name] = content;
    }
    return parsePanelContent({ versao: 1, blocos: blocks });
}
