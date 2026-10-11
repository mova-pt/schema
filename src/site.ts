import {
  MOVA_VERSION,
  isClassesContent,
  movaFileSchema,
  type BlockContent,
  type BlockName,
  type MovaFile,
  type MovaFileInput,
  type ScheduleContent,
} from "./schemas.js";

export type SiteInput = Omit<MovaFileInput, "versao">;

// Valida o conteúdo de content/site.ts. Lança um erro se o formato estiver errado.
export function defineSite(input: SiteInput): MovaFile {
  return movaFileSchema.parse({ ...input, versao: MOVA_VERSION });
}

// Texto do ficheiro public/mova.json, já validado.
export function buildMovaJson(site: SiteInput | MovaFile): string {
  const file = movaFileSchema.parse({ ...site, versao: MOVA_VERSION });
  return `${JSON.stringify(file, null, 2)}\n`;
}

// Retira os itens com "visivel": false, como faz a API pública.
export function filterVisible<B extends BlockName>(
  block: B,
  content: BlockContent<B>,
): BlockContent<B> {
  if (block === "contactos") return content;

  if (block === "horarios") {
    const schedules = content as BlockContent<"horarios">;
    const result: Record<string, ScheduleContent> = {};
    for (const [id, schedule] of Object.entries(schedules)) {
      result[id] = isClassesContent(schedule)
        ? { ...schedule, aulas: schedule.aulas.filter((item) => item.visivel) }
        : schedule;
    }
    return result as BlockContent<B>;
  }

  const items = content as { visivel: boolean }[];
  return items.filter((item) => item.visivel) as BlockContent<B>;
}
