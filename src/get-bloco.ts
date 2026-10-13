import {
  type BlockContent,
  type BlockName,
  type MovaFile,
  type ScheduleContent,
} from "./schemas.js";
import { emptyPanelContent, parsePanelContent } from "./panel.js";
import { filterVisible } from "./site.js";

export type GetBlocoOptions = {
  /** Conteúdo gerado no build a partir do painel (src/content/panel.generated.json). */
  panel?: unknown;
};

export type GetBloco = <B extends BlockName>(name: B) => BlockContent<B> | null;

/**
 * Cria a função `getBloco` de um site.
 *
 * Os ficheiros (src/content/site.ts) são a base. Um bloco que o cliente editou no
 * painel vem do conteúdo gerado no build e passa à frente do ficheiro. Nos
 * horários, cada horário editado substitui o do mesmo `id` e os restantes
 * ficam como estão nos ficheiros.
 *
 * É síncrona e não faz pedidos: todo o conteúdo já está no build.
 */
export function createGetBloco(site: MovaFile, options: GetBlocoOptions = {}): GetBloco {
  const panel = options.panel === undefined ? emptyPanelContent() : parsePanelContent(options.panel);

  return function getBloco<B extends BlockName>(name: B): BlockContent<B> | null {
    // Um bloco que o site não mostra não é devolvido, mesmo que o painel o tenha.
    if (!site.blocos.includes(name)) return null;

    const fromSite = site.conteudo[name] as BlockContent<B> | undefined;
    const fromPanel = panel.blocos[name] as BlockContent<B> | undefined;

    let content: BlockContent<B> | undefined;
    if (name === "horarios") {
      if (fromSite === undefined && fromPanel === undefined) return null;
      content = {
        ...((fromSite ?? {}) as Record<string, ScheduleContent>),
        ...((fromPanel ?? {}) as Record<string, ScheduleContent>),
      } as BlockContent<B>;
    } else {
      content = fromPanel ?? fromSite;
    }

    return content === undefined ? null : filterVisible(name, content);
  };
}
