import { mkdir, writeFile } from "node:fs/promises";
import { z } from "zod";
import { movaFileSchema } from "../src/index.js";

const jsonSchema = {
  ...z.toJSONSchema(movaFileSchema),
  title: "mova.json (versão 1)",
};

await mkdir("schema", { recursive: true });
await writeFile("schema/mova.v1.json", `${JSON.stringify(jsonSchema, null, 2)}\n`, "utf8");
console.log("schema/mova.v1.json gerado");
