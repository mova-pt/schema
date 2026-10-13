# @mova-pt/schema

Formato `mova.json` (versão 1) da Mova, num só sítio, e o que os sites dos clientes precisam para o usar. É usado pelos sites e pelo painel admin, para os dois lados falarem sempre o mesmo formato.

Inclui:

- esquemas Zod de cada bloco e do ficheiro completo, com os tipos TypeScript;
- `defineSite`, `buildMovaJson` e `writeMovaJson`, que validam o conteúdo do site e geram o `public/mova.json`;
- `fetchPanelContent` e `writePanelContent`, que vão buscar ao painel, durante o build, o que o cliente editou;
- `createGetBloco`, a função que os componentes usam para ler conteúdo;
- exemplos válidos e inválidos em `examples/`.

**Regra:** nunca escrever estes esquemas à mão num site ou no painel. Se o formato precisar de mudar, muda-se aqui.

## Como funciona

O site é **estático** e não faz pedidos ao painel quando alguém o visita.

1. O conteúdo base está nos ficheiros do site (`content/site.ts`).
2. Quando o cliente edita um bloco no painel, o painel pede à Vercel uma nova construção do site.
3. No build, o script `mova-sync` pergunta à API do painel que blocos o cliente editou e escreve-os em `content/panel.generated.json`.
4. `getBloco` devolve o bloco do painel se o cliente o editou, e o dos ficheiros se não.

Os ficheiros mandam até o cliente mexer. Depois do primeiro edit de um bloco, manda o painel.

## Instalar

```bash
npm install "@mova-pt/schema@https://github.com/mova-pt/schema/archive/<commit>.tar.gz"
```

Usar sempre o endereço `https` com o commit indicado nas instruções da pasta de trabalho. A forma `github:mova-pt/schema` fica registada como `git+ssh` e falha em máquinas sem chaves SSH, como a Vercel. O repositório é público para poder ser instalado sem credenciais: não pôr aqui segredos, dados de clientes nem código do painel.

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
import panel from "@/content/panel.generated.json";

export const getBloco = createGetBloco(site, { panel });
```

`scripts/mova-sync.ts`:

```ts
import { writeMovaJson, writePanelContent } from "@mova-pt/schema/build";
import { site } from "../content/site";

await writePanelContent(); // content/panel.generated.json
await writeMovaJson(site); // public/mova.json
```

`package.json` do site:

```json
{
  "scripts": {
    "predev": "tsx scripts/mova-sync.ts",
    "prebuild": "tsx scripts/mova-sync.ts"
  }
}
```

Num Server Component:

```tsx
const precos = getBloco("precos"); // null se o site não tiver o bloco
```

`content/panel.generated.json` fica no repositório com o conteúdo vazio (`{"versao":1,"blocos":{}}`), para o site compilar sem correr o script. O build substitui-o.

### O que acontece em cada caso

| Situação | Resultado |
|---|---|
| Sem `MOVA_TENANT_ID` (demonstrações, pré-visualizações, desenvolvimento) | O site usa só `content/site.ts`. Nenhum pedido ao painel |
| Com `MOVA_TENANT_ID`, painel a responder | O site usa o que o cliente editou e, para o resto, os ficheiros |
| Com `MOVA_TENANT_ID`, painel em baixo ou resposta inválida | **O build falha** e a versão anterior continua no ar. Nunca se publica o site sem as alterações do cliente |
| Bloco que o cliente nunca editou | A API responde 404 e o site usa os ficheiros |

O `MOVA_TENANT_ID` só se define na Vercel de **produção**, na publicação definitiva de um cliente fechado.

## No painel admin

```ts
import { blockSchemas, movaFileSchema } from "@mova-pt/schema";

const file = movaFileSchema.safeParse(await response.json()); // importação de {link}/mova.json
const precos = blockSchemas.precos.parse(data); // resposta de /api/public/{tenant}/precos
```

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

Para publicar uma versão: atualizar `version` no `package.json`, fazer commit, criar a etiqueta (`git tag vX.Y.Z && git push --tags`) e atualizar o commit no endereço de instalação nos `CLAUDE.md` da pasta de trabalho.
