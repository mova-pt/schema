import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { writePanelContent } from "../src/build.js";
import { fetchPanelContent, PanelFetchError } from "../src/index.js";

const TENANT = "3f2b8c1e-5d4a-4b6f-9a7c-0e1d2f3a4b5c";
const prices = [{ id: "anual", nome: "Anual", preco: 400, visivel: true }];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

// Responde por bloco: o que não estiver na lista dá 404 (não editado).
function panel(blocks: Record<string, unknown>) {
  return vi.fn(async (url: string | URL | Request, _init?: RequestInit) => {
    const name = new URL(String(url)).pathname.split("/").pop() ?? "";
    return name in blocks ? json(blocks[name]) : json({ erro: "Não encontrado." }, 404);
  });
}

const fast = { retries: 2, retryDelayMs: 0 };

describe("fetchPanelContent", () => {
  it("guarda só os blocos editados (404 é 'não editado')", async () => {
    const result = await fetchPanelContent({
      tenantId: TENANT,
      fetch: panel({ precos: prices }),
      ...fast,
    });
    expect(result).toEqual({ versao: 1, blocos: { precos: prices } });
  });

  it("pede cada bloco ao endereço certo, sem cache e com parâmetro único", async () => {
    const fetchMock = panel({});
    await fetchPanelContent({ tenantId: TENANT, fetch: fetchMock, ...fast });
    const urls = fetchMock.mock.calls.map((call) => new URL(String(call[0])));
    expect(urls).toHaveLength(6);
    expect(urls[0]?.origin).toBe("https://app.movadigital.pt");
    expect(urls.map((u) => u.pathname.split("/").pop()).sort()).toEqual(
      ["avisos", "contactos", "faq", "horarios", "precos", "servicos"].sort(),
    );
    expect(urls.every((u) => u.pathname.startsWith(`/api/public/${TENANT}/`))).toBe(true);
    expect(urls.every((u) => u.searchParams.has("b"))).toBe(true);
    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.cache).toBe("no-store");
    expect(init?.redirect).toBe("error");
  });

  it("repete se o painel falhar e acaba por lançar erro (o build pára)", async () => {
    const fetchMock = vi.fn(async () => json({}, 500));
    await expect(
      fetchPanelContent({ tenantId: TENANT, fetch: fetchMock, ...fast }),
    ).rejects.toBeInstanceOf(PanelFetchError);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("recupera se a primeira tentativa falhar e a seguinte correr bem", async () => {
    let calls = 0;
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      calls += 1;
      if (calls === 1) throw new Error("rede");
      const name = new URL(String(url)).pathname.split("/").pop();
      return name === "precos" ? json(prices) : json({}, 404);
    });
    const result = await fetchPanelContent({ tenantId: TENANT, fetch: fetchMock, ...fast });
    expect(result.blocos.precos).toEqual(prices);
  });

  it("não repete erros 4xx que não sejam 404", async () => {
    const fetchMock = vi.fn(async () => json({}, 403));
    await expect(
      fetchPanelContent({ tenantId: TENANT, fetch: fetchMock, ...fast }),
    ).rejects.toThrow(PanelFetchError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("recusa conteúdo inválido do painel", async () => {
    await expect(
      fetchPanelContent({
        tenantId: TENANT,
        fetch: panel({ precos: [{ id: "A B" }] }),
        ...fast,
      }),
    ).rejects.toThrow(PanelFetchError);
  });

  it("recusa um MOVA_TENANT_ID que não é um UUID, sem fazer pedidos", async () => {
    const fetchMock = vi.fn();
    await expect(
      fetchPanelContent({ tenantId: "../admin", fetch: fetchMock, ...fast }),
    ).rejects.toThrow(PanelFetchError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("writePanelContent", () => {
  it("sem MOVA_TENANT_ID escreve conteúdo vazio e não faz pedidos", async () => {
    const dir = await mkdtemp(join(tmpdir(), "mova-"));
    const out = join(dir, "panel.generated.json");
    const fetchMock = vi.fn();
    await writePanelContent({ tenantId: "", outFile: out, fetch: fetchMock });
    expect(JSON.parse(await readFile(out, "utf8"))).toEqual({ versao: 1, blocos: {} });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("com MOVA_TENANT_ID escreve o conteúdo editado", async () => {
    const dir = await mkdtemp(join(tmpdir(), "mova-"));
    const out = join(dir, "panel.generated.json");
    await writePanelContent({
      tenantId: TENANT,
      outFile: out,
      fetch: panel({ precos: prices }),
      ...fast,
    });
    expect(JSON.parse(await readFile(out, "utf8"))).toEqual({
      versao: 1,
      blocos: { precos: prices },
    });
  });

  it("com o painel em baixo falha e não escreve o ficheiro", async () => {
    const dir = await mkdtemp(join(tmpdir(), "mova-"));
    const out = join(dir, "panel.generated.json");
    await expect(
      writePanelContent({
        tenantId: TENANT,
        outFile: out,
        fetch: vi.fn(async () => json({}, 503)),
        ...fast,
      }),
    ).rejects.toThrow(PanelFetchError);
    await expect(readFile(out, "utf8")).rejects.toThrow();
  });
});
