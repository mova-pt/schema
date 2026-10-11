import { type BlockContent, type BlockName, type MovaFile } from "./schemas.js";
export declare const MOVA_API_BASE_URL = "https://app.movadigital.pt";
export declare const MOVA_REVALIDATE_SECONDS = 300;
export declare const MOVA_TIMEOUT_MS = 3000;
export type GetBlocoOptions = {
    tenantId?: string;
    fetch?: typeof fetch;
};
export type GetBloco = <B extends BlockName>(name: B) => Promise<BlockContent<B> | null>;
/**
 * Cria a função getBloco de um site.
 *
 * Com MOVA_TENANT_ID definido, lê o bloco da API do painel. Se a resposta não for 200
 * ou não passar no esquema, usa o conteúdo de content/site.ts. Nunca lança erros.
 */
export declare function createGetBloco(site: MovaFile, options?: GetBlocoOptions): GetBloco;
