import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { MOVA_SCHEMA_URL, blockSchemas, movaFileSchema, BLOCK_NAMES } from "../src/index.js";

const read = (path: string) => JSON.parse(readFileSync(path, "utf8")) as unknown;
const filesIn = (dir: string) => readdirSync(dir).filter((file) => file.endsWith(".json"));

describe("exemplos válidos", () => {
  for (const file of filesIn("examples/valid")) {
    it(`${file} passa no esquema`, () => {
      const result = movaFileSchema.safeParse(read(join("examples/valid", file)));
      expect(result.error?.issues ?? []).toEqual([]);
    });
  }

  it("cada bloco do exemplo passa no esquema do bloco (formato da API pública)", () => {
    const file = movaFileSchema.parse(read("examples/valid/ginasio.json"));
    for (const block of BLOCK_NAMES) {
      expect(blockSchemas[block].safeParse(file.conteudo[block]).success).toBe(true);
    }
  });
});

describe("exemplos inválidos", () => {
  const invalid = filesIn("examples/invalid");

  it("existem exemplos inválidos", () => {
    expect(invalid.length).toBeGreaterThan(5);
  });

  for (const file of invalid) {
    it(`${file} é rejeitado`, () => {
      expect(movaFileSchema.safeParse(read(join("examples/invalid", file))).success).toBe(false);
    });
  }
});

describe("evolução do formato", () => {
  it("ignora campos desconhecidos em vez de rejeitar o ficheiro", () => {
    const file = read("examples/valid/loja.json") as Record<string, unknown>;
    const result = movaFileSchema.safeParse({ ...file, campoNovo: true });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("campoNovo");
  });
});

describe("JSON Schema publicado", () => {
  it("schema/mova.v1.json está atualizado (correr npm run build)", () => {
    const expected = {
      ...z.toJSONSchema(movaFileSchema),
      $id: MOVA_SCHEMA_URL,
      title: "mova.json (versão 1)",
    };
    expect(read("schema/mova.v1.json")).toEqual(JSON.parse(JSON.stringify(expected)));
  });
});
