import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildMovaJson,
  createGetBloco,
  defineSite,
  movaFileSchema,
  type SiteInput,
} from "../src/index.js";

const input = JSON.parse(readFileSync("examples/valid/ginasio.json", "utf8")) as SiteInput;
const site = defineSite(input);
const empty = { versao: 1, blocos: {} };

describe("getBloco sem conteúdo do painel", () => {
  it("usa o conteúdo dos ficheiros", () => {
    expect(createGetBloco(site)("precos")).toEqual(site.conteudo.precos);
    expect(createGetBloco(site, { panel: empty })("precos")).toEqual(site.conteudo.precos);
  });

  it("retira os itens com visivel = false", () => {
    const schedules = createGetBloco(site)("horarios");
    const classes = schedules?.aulas;
    expect(classes && "aulas" in classes ? classes.aulas.map((item) => item.id) : []).toEqual([
      "pilates-seg-1830",
    ]);
  });

  it("devolve null para um bloco que o site não tem", () => {
    const shop = defineSite(
      JSON.parse(readFileSync("examples/valid/loja.json", "utf8")) as SiteInput,
    );
    expect(createGetBloco(shop)("faq")).toBeNull();
  });
});

describe("getBloco com conteúdo do painel", () => {
  const edited = [{ id: "anual", nome: "Anual", preco: 400, visivel: true }];

  it("o bloco editado passa à frente do ficheiro", () => {
    const getBloco = createGetBloco(site, { panel: { versao: 1, blocos: { precos: edited } } });
    expect(getBloco("precos")).toEqual(edited);
    // Os restantes continuam a vir dos ficheiros.
    expect(getBloco("faq")).toEqual(site.conteudo.faq);
  });

  it("nos horários, o editado substitui o do mesmo id e os outros ficam", () => {
    const editedReception = {
      dias: [{ dia: 1, intervalos: [{ inicio: "09:00", fim: "13:00" }] }],
      excecoes: [],
    };
    const getBloco = createGetBloco(site, {
      panel: { versao: 1, blocos: { horarios: { rececao: editedReception } } },
    });
    const schedules = getBloco("horarios");
    expect(schedules?.rececao).toEqual(editedReception);
    expect(schedules?.aulas).toBeDefined();
  });

  it("não devolve um bloco que o site não mostra", () => {
    const shop = defineSite(
      JSON.parse(readFileSync("examples/valid/loja.json", "utf8")) as SiteInput,
    );
    const getBloco = createGetBloco(shop, { panel: { versao: 1, blocos: { precos: edited } } });
    expect(getBloco("precos")).toBeNull();
  });

  it("recusa conteúdo do painel inválido ou com versão desconhecida", () => {
    expect(() =>
      createGetBloco(site, { panel: { versao: 1, blocos: { precos: [{ id: "A B" }] } } }),
    ).toThrow();
    expect(() => createGetBloco(site, { panel: { versao: 2, blocos: {} } })).toThrow();
    expect(() => createGetBloco(site, { panel: { versao: 1, blocos: { galeria: [] } } })).toThrow();
  });
});

describe("buildMovaJson", () => {
  it("gera um ficheiro válido com a versão", () => {
    const file = JSON.parse(buildMovaJson(input)) as Record<string, unknown>;
    expect(Object.keys(file)).toEqual(["versao", "blocos", "horarios", "conteudo"]);
    expect(file.versao).toBe(1);
    expect(movaFileSchema.safeParse(file).success).toBe(true);
  });

  it("falha se o conteúdo não respeitar o formato", () => {
    expect(() => buildMovaJson({ ...input, blocos: ["faq", "faq"] })).toThrow();
  });
});
