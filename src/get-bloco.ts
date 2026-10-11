import { blockSchemas, type BlockContent, type BlockName, type MovaFile } from "./schemas.js";
import { filterVisible } from "./site.js";

export const MOVA_API_BASE_URL = "https://app.movadigital.pt";
export const MOVA_REVALIDATE_SECONDS = 300;
export const MOVA_TIMEOUT_MS = 3000;

const TENANT_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export type GetBlocoOptions = {
  // Por omissão lê a variável de ambiente MOVA_TENANT_ID.
  tenantId?: string;
  // Só para testes.
  fetch?: typeof fetch;
};

export type GetBloco = <B extends BlockName>(name: B) => Promise<BlockContent<B> | null>;

function readTenantId(): string | undefined {
  return typeof process === "undefined" ? undefined : process.env.MOVA_TENANT_ID;
}

/**
 * Cria a função getBloco de um site.
 *
 * Com MOVA_TENANT_ID definido, lê o bloco da API do painel. Se a resposta não for 200
 * ou não passar no esquema, usa o conteúdo de content/site.ts. Nunca lança erros.
 */
export function createGetBloco(site: MovaFile, options: GetBlocoOptions = {}): GetBloco {
  const fetchImpl = options.fetch ?? globalThis.fetch;

  function fromSite<B extends BlockName>(name: B): BlockContent<B> | null {
    const content = site.conteudo[name] as BlockContent<B> | undefined;
    if (content === undefined || !site.blocos.includes(name)) return null;
    return filterVisible(name, content);
  }

  async function fromApi<B extends BlockName>(
    tenantId: string,
    name: B,
  ): Promise<BlockContent<B> | null> {
    try {
      const url = `${MOVA_API_BASE_URL}/api/public/${encodeURIComponent(tenantId)}/${name}`;
      const response = await fetchImpl(url, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(MOVA_TIMEOUT_MS),
        next: { revalidate: MOVA_REVALIDATE_SECONDS },
      } as RequestInit);
      if (response.status !== 200) return null;

      const parsed = blockSchemas[name].safeParse(await response.json());
      return parsed.success ? (parsed.data as BlockContent<B>) : null;
    } catch {
      return null;
    }
  }

  return async function getBloco<B extends BlockName>(name: B): Promise<BlockContent<B> | null> {
    const tenantId = options.tenantId ?? readTenantId();
    if (tenantId !== undefined && TENANT_ID_PATTERN.test(tenantId)) {
      const remote = await fromApi(tenantId, name);
      if (remote !== null) return remote;
    }
    return fromSite(name);
  };
}
