import { type BlockContent, type BlockName } from "./schemas.js";
export declare const MOVA_API_BASE_URL = "https://app.movadigital.pt";
export declare const MOVA_TIMEOUT_MS = 10000;
export type PanelBlocks = {
    [K in BlockName]?: BlockContent<K>;
};
export type PanelContent = {
    versao: 1;
    blocos: PanelBlocks;
};
export declare class PanelFetchError extends Error {
    name: string;
}
export declare function emptyPanelContent(): PanelContent;
/** Valida o conteúdo vindo do painel (ou do ficheiro gerado). Lança erro se for inválido. */
export declare function parsePanelContent(input: unknown): PanelContent;
export type FetchPanelOptions = {
    tenantId: string;
    baseUrl?: string;
    /** Só para testes. */
    fetch?: typeof fetch;
    timeoutMs?: number;
    /** Tentativas extra se o painel responder com erro de servidor ou não responder. */
    retries?: number;
    retryDelayMs?: number;
};
/**
 * Pergunta ao painel que blocos o cliente editou. Lança `PanelFetchError` se o
 * painel não responder bem: um build não deve publicar o site sem as
 * alterações do cliente, por isso falha e a versão anterior continua no ar.
 */
export declare function fetchPanelContent(options: FetchPanelOptions): Promise<PanelContent>;
