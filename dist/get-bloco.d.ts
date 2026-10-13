import { type BlockContent, type BlockName, type MovaFile } from "./schemas.js";
export type GetBlocoOptions = {
    /** Conteúdo gerado no build a partir do painel (content/panel.generated.json). */
    panel?: unknown;
};
export type GetBloco = <B extends BlockName>(name: B) => BlockContent<B> | null;
/**
 * Cria a função `getBloco` de um site.
 *
 * Os ficheiros (content/site.ts) são a base. Um bloco que o cliente editou no
 * painel vem do conteúdo gerado no build e passa à frente do ficheiro. Nos
 * horários, cada horário editado substitui o do mesmo `id` e os restantes
 * ficam como estão nos ficheiros.
 *
 * É síncrona e não faz pedidos: todo o conteúdo já está no build.
 */
export declare function createGetBloco(site: MovaFile, options?: GetBlocoOptions): GetBloco;
