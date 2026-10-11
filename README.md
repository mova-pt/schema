# @mova-pt/schema

Formato `mova.json` (versão 1) da Mova, num só sítio. É usado pelos sites dos clientes e pelo painel admin, para os dois lados falarem sempre o mesmo formato.

Inclui:

- esquemas Zod de cada bloco e do ficheiro completo, com os tipos TypeScript;
- `createGetBloco`, a função que os sites usam para ler conteúdo;
- `buildMovaJson` e `writeMovaJson`, que geram o `public/mova.json` no build;
- o JSON Schema em `schema/mova.v1.json`;
- exemplos válidos e inválidos em `examples/`.

**Regra:** nunca escrever estes esquemas à mão num site ou no painel. Se o formato precisar de mudar, muda-se aqui.

## Instalar

```bash
npm install github:mova-pt/schema#v1.0.0
```

O repositório é privado: a máquina que instala precisa de acesso ao GitHub da organização.

## Num site de cliente

`content/site.ts`:

```ts
import { defineSite } from "@mova-pt/schema";

export const site = defineSite({
  blocos: ["horarios", "contactos"],
  horarios: [{ id: "rececao", nome: "Receção", tipo: "opening" }],
  conteudo: {
    horarios: {
      rececao: {
        dias: [{ dia: 1, intervalos: [{ inicio: "09:00", fim: "18:00" }] }],
        excecoes: [],
      },
    },
    contactos: { telefone: "+351 912 345 678" },
  },
});
```

`lib/schemas.ts`:

```ts
export * from "@mova-pt/schema";
```

`lib/get-bloco.ts`:

```ts
import { createGetBloco } from "@mova-pt/schema";
import { site } from "@/content/site";

export const getBloco = createGetBloco(site);
```

Num Server Component:

```tsx
const precos = await getBloco("precos"); // null se o site não tiver o bloco
```

`getBloco` nunca lança erros:

- com `MOVA_TENANT_ID` definido, faz `GET https://app.movadigital.pt/api/public/{tenant}/{bloco}` com `revalidate` de 300 s e timeout de 3 s;
- se a resposta não for 200 ou não passar no esquema, usa o conteúdo de `content/site.ts`;
- em ambos os casos, os itens com `"visivel": false` não são devolvidos.

### Gerar o `public/mova.json`

`scripts/mova-json.ts`:

```ts
import { writeMovaJson } from "@mova-pt/schema/build";
import { site } from "../content/site";

await writeMovaJson(site);
```

No `package.json` do site:

```json
{ "scripts": { "prebuild": "tsx scripts/mova-json.ts" } }
```

O build falha se o conteúdo não respeitar o formato, por isso um `mova.json` errado nunca é publicado.

## No painel admin

```ts
import { blockSchemas, movaFileSchema } from "@mova-pt/schema";

const file = movaFileSchema.safeParse(await response.json()); // importação de {link}/mova.json
const precos = blockSchemas.precos.parse(data); // resposta de /api/public/{tenant}/precos
```

O painel deve servir o ficheiro `schema/mova.v1.json` em `https://app.movadigital.pt/schema/mova.v1.json`, que é o endereço que os `mova.json` indicam em `"$schema"`.

## Regras do formato

- `"blocos"` lista só os blocos com secção visível no site, e cada um tem de ter conteúdo.
- Cada horário tem `id`, `nome` e `tipo`: `opening` (funcionamento), `availability` (atendimento ou marcação) ou `classes` (aulas). O conteúdo de `opening` e `availability` tem `dias` e `excecoes`; o de `classes` tem `aulas` e `excecoes`.
- Dias: 1 = segunda ... 7 = domingo. Horas em `"HH:MM"`, hora local de Lisboa. Datas em `"AAAA-MM-DD"`.
- Os `id` são slugs em minúsculas, sem acentos, e não se repetem na mesma lista.
- O fim é sempre depois do início e os intervalos do mesmo dia não se sobrepõem.
- Endereços de redes sociais só `http` ou `https`. Fotos só caminhos locais (`/images/...`) ou `https`.

## Evolução do formato

- **Sem mudar a versão:** acrescentar campos opcionais ou blocos novos.
- **Com versão nova (`"versao": 2`):** renomear, remover ou tornar obrigatório um campo. O painel aceita as duas versões durante a transição.
- Campos desconhecidos são ignorados, não rejeitados.

## Desenvolvimento

```bash
npm install
npm run check   # tipos, build e testes
```

A pasta `dist/` e o `schema/mova.v1.json` estão no repositório para o pacote poder ser instalado diretamente do GitHub. Depois de alterar `src/`, correr `npm run build` antes do commit; um teste falha se o JSON Schema ficar desatualizado.

Para publicar uma versão: atualizar `version` no `package.json`, fazer commit e criar a etiqueta (`git tag v1.0.1 && git push --tags`).
