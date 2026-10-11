import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MOVA_REVALIDATE_SECONDS,
  buildMovaJson,
  createGetBloco,
  defineSite,
  movaFileSchema,
  type SiteInput,
} from "../src/index.js";

const input = JSON.parse(readFileSync("examples/valid/ginasio.json", "utf8")) as SiteInput;
const site = defineSite(input);

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getBloco sem MOVA_TENANT_ID", () => {
  it("usa o conteúdo do site e não faz pedidos", async () => {
    const fetchMock = vi.fn();
    const getBloco = createGetBloco(site, { fetch: fetchMock });
    expect(await getBloco("precos")).toEqual(site.conteudo.precos);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("retira os itens com visivel = false", async () => {
    const getBloco = createGetBloco(site, { fetch: vi.fn() });
    const schedules = await getBloco("horarios");
    const classes = schedules?.aulas;
    expect(classes && "aulas" in classes ? classes.aulas.map((item) => item.id) : []).toEqual([
      "pilates-seg-1830",
    ]);
  });

  it("devolve null para um bloco que o site não tem", async () => {
    const shop = defineSite(
      JSON.parse(readFileSync("examples/valid/loja.json", "utf8")) as SiteInput,
    );
    expect(await createGetBloco(shop, { fetch: vi.fn() })("faq")).toBeNull();
  });
});

describe("getBloco com MOVA_TENANT_ID", () => {
  const remotePrices = [{ id: "anual", nome: "Anual", preco: 400, visivel: true }];

  it("lê da API do painel com revalidate de 300 s", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(remotePrices));
    const getBloco = createGetBloco(site, { tenantId: "tenant_123", fetch: fetchMock });

    expect(await getBloco("precos")).toEqual(remotePrices);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit & { next?: unknown }];
    expect(url).toBe("https://app.movadigital.pt/api/public/tenant_123/precos");
    expect(init.next).toEqual({ revalidate: MOVA_REVALIDATE_SECONDS });
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("lê o tenant da variável de ambiente", async () => {
    vi.stubEnv("MOVA_TENANT_ID", "tenant_env");
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(remotePrices));
    await createGetBloco(site, { fetch: fetchMock })("precos");
    expect(fetchMock.mock.calls[0]?.[0]).toContain("/api/public/tenant_env/precos");
  });

  it.each([
    ["resposta 404", () => Promise.resolve(jsonResponse({ erro: "x" }, 404))],
    ["resposta 500", () => Promise.resolve(jsonResponse({}, 500))],
    ["dados que não passam no Zod", () => Promise.resolve(jsonResponse([{ id: "A B" }]))],
    ["corpo que não é JSON", () => Promise.resolve(new Response("<html>", { status: 200 }))],
    ["falha de rede ou timeout", () => Promise.reject(new Error("timeout"))],
  ])("usa o conteúdo do site com %s", async (_name, respond) => {
    const getBloco = createGetBloco(site, { tenantId: "tenant_123", fetch: vi.fn(respond) });
    expect(await getBloco("precos")).toEqual(site.conteudo.precos);
  });

  it("não faz pedidos com um tenant de formato inválido", async () => {
    const fetchMock = vi.fn();
    const getBloco = createGetBloco(site, { tenantId: "../admin", fetch: fetchMock });
    expect(await getBloco("precos")).toEqual(site.conteudo.precos);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("buildMovaJson", () => {
  it("gera um ficheiro válido com $schema e versão", () => {
    const file = JSON.parse(buildMovaJson(input)) as Record<string, unknown>;
    expect(file.$schema).toBe("https://app.movadigital.pt/schema/mova.v1.json");
    expect(file.versao).toBe(1);
    expect(movaFileSchema.safeParse(file).success).toBe(true);
  });

  it("falha se o conteúdo não respeitar o formato", () => {
    expect(() => buildMovaJson({ ...input, blocos: ["faq", "faq"] })).toThrow();
  });
});
