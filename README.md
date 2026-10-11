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
npm install "@mova-pt/schema@https://github.com/mova-pt/schema/archive/087ef6d6069dd3336a1abbc71d95fc0bb545c296.tar.gz"
```

O endereço fixa a versão 1.0.2 pelo commit, e o `package-lock.json` guarda a soma de verificação do ficheiro. Usar sempre esta forma `https`: a forma `github:mova-pt/schema` fica registada como `git+ssh` e falha em máquinas sem chaves SSH, como a Vercel.

O repositório é público para poder ser instalado sem credenciais. Não pôr aqui segredos, dados de clientes nem código do painel.

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

O ficheiro `schema/mova.v1.json` é o mesmo formato em JSON Schema, para documentação e para validar fora do TypeScript.

## Regras do formato

- Blocos da versão 1: `horarios`, `precos`, `avisos`, `servicos`, `contactos` e `faq`.
- `"blocos"` lista só os blocos com secção visível no site, e cada um tem de ter conteúdo.
- Os objetos são estritos: um campo que não esteja no formato é um erro, tal como no painel.
- Cada horário tem `id`, `nome` e `tipo`: `opening` (funcionamento), `availability` (atendimento ou marcação) ou `classes` (aulas). O conteúdo de `opening` e `availability` tem `dias` e `excecoes`; o de `classes` tem `aulas` e `excecoes`.
- Dias: 1 = segunda ... 7 = domingo. Horas em `"HH:MM"`, hora local de Lisboa. Datas em `"AAAA-MM-DD"`.
- Os `id` são slugs em minúsculas, sem acentos, e não se repetem na mesma lista.
- O fim é sempre depois do início e os intervalos do mesmo dia não se sobrepõem.
- Endereços de redes sociais só `https`. Fotos só caminhos de imagens do próprio site (`/images/pilates.webp`).
- Tudo tem limite de tamanho (por exemplo, 60 preços, 80 serviços, 300 aulas por horário). Os limites são os mesmos do painel.

## Evolução do formato

- Como os objetos são estritos, qualquer campo ou bloco novo tem de chegar primeiro ao painel e só depois aos sites. A ordem é: nova versão deste pacote, atualizar o painel, atualizar os sites.
- **Sem mudar `"versao"`:** acrescentar campos opcionais ou blocos novos.
- **Com `"versao": 2`:** renomear, remover ou tornar obrigatório um campo. O painel aceita as duas versões durante a transição.

## Desenvolvimento

```bash
npm install
npm run check   # tipos, build e testes
```

A pasta `dist/` e o `schema/mova.v1.json` estão no repositório para o pacote poder ser instalado diretamente do GitHub. Depois de alterar `src/`, correr `npm run build` antes do commit; um teste falha se o JSON Schema ficar desatualizado.

Para publicar uma versão: atualizar `version` no `package.json`, fazer commit, criar a etiqueta (`git tag v1.0.3 && git push --tags`) e atualizar o commit no endereço de instalação acima e nos `CLAUDE.md` da pasta de trabalho.
