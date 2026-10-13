import { emptyPanelContent, parsePanelContent } from "./panel.js";
import { filterVisible } from "./site.js";
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
export function createGetBloco(site, options = {}) {
    const panel = options.panel === undefined ? emptyPanelContent() : parsePanelContent(options.panel);
    return function getBloco(name) {
        // Um bloco que o site não mostra não é devolvido, mesmo que o painel o tenha.
        if (!site.blocos.includes(name))
            return null;
        const fromSite = site.conteudo[name];
        const fromPanel = panel.blocos[name];
        let content;
        if (name === "horarios") {
            if (fromSite === undefined && fromPanel === undefined)
                return null;
            content = {
                ...(fromSite ?? {}),
                ...(fromPanel ?? {}),
            };
        }
        else {
            content = fromPanel ?? fromSite;
        }
        return content === undefined ? null : filterVisible(name, content);
    };
}
