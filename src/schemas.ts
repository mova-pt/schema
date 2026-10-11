import { z } from "zod";

export const MOVA_VERSION = 1;

export const BLOCK_NAMES = [
  "horarios",
  "precos",
  "avisos",
  "servicos",
  "equipa",
  "contactos",
  "faq",
] as const;

export const SCHEDULE_TYPES = ["opening", "availability", "classes"] as const;

export const CLASS_LEVELS = ["iniciação", "intermédio", "avançado", "todos"] as const;

export const blockNameSchema = z.enum(BLOCK_NAMES);
export const scheduleTypeSchema = z.enum(SCHEDULE_TYPES);

// Identificador fixo: slug em minúsculas, sem acentos.
export const idSchema = z
  .string()
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "id tem de ser um slug em minúsculas, sem acentos");

// Hora local de Lisboa, "HH:MM".
export const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'hora tem de ter o formato "HH:MM"');

// Data "AAAA-MM-DD" que existe no calendário.
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'data tem de ter o formato "AAAA-MM-DD"')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, "data não existe no calendário");

// 1 = segunda ... 7 = domingo.
export const daySchema = z.number().int().min(1).max(7);

const text = (max: number) => z.string().trim().min(1).max(max);

const hasUniqueIds = (items: readonly { id: string }[]) =>
  new Set(items.map((item) => item.id)).size === items.length;

const UNIQUE_IDS_MESSAGE = "ids repetidos na lista";

// Caminho local ("/images/x.webp") ou endereço https.
const imageSchema = z
  .string()
  .max(500)
  .refine((value) => value.startsWith("/") || value.startsWith("https://"), {
    message: 'foto tem de começar por "/" ou "https://"',
  });

const webUrlSchema = z
  .url()
  .max(500)
  .refine((value) => /^https?:\/\//i.test(value), { message: "url tem de ser http ou https" });

export const intervalSchema = z
  .object({ inicio: timeSchema, fim: timeSchema })
  .refine((value) => value.inicio < value.fim, {
    message: "fim tem de ser depois do início",
    path: ["fim"],
  });

const hasNoOverlaps = (intervals: readonly { inicio: string; fim: string }[]) => {
  const sorted = [...intervals].sort((a, b) => a.inicio.localeCompare(b.inicio));
  return sorted.every((interval, index) => {
    const previous = sorted[index - 1];
    return previous === undefined || previous.fim <= interval.inicio;
  });
};

export const scheduleDaySchema = z.object({
  dia: daySchema,
  intervalos: z
    .array(intervalSchema)
    .max(12)
    .refine(hasNoOverlaps, "os intervalos do mesmo dia não se podem sobrepor"),
});

export const scheduleExceptionSchema = z
  .object({
    data: dateSchema,
    fechado: z.boolean(),
    inicio: timeSchema.optional(),
    fim: timeSchema.optional(),
    nota: text(200).optional(),
  })
  .refine(
    (value) => value.inicio === undefined || value.fim === undefined || value.inicio < value.fim,
    { message: "fim tem de ser depois do início", path: ["fim"] },
  );

// Conteúdo de um horário "opening" ou "availability".
export const openingContentSchema = z.object({
  dias: z
    .array(scheduleDaySchema)
    .max(7)
    .refine(
      (days) => new Set(days.map((day) => day.dia)).size === days.length,
      "cada dia só pode aparecer uma vez",
    ),
  excecoes: z.array(scheduleExceptionSchema),
});

export const classSchema = z
  .object({
    id: idSchema,
    dia: daySchema,
    inicio: timeSchema,
    fim: timeSchema,
    modalidade: text(80),
    instrutor: text(80).optional(),
    sala: text(80).optional(),
    nivel: z.enum(CLASS_LEVELS).optional(),
    lotacao: z.number().int().positive().optional(),
    visivel: z.boolean(),
  })
  .refine((value) => value.inicio < value.fim, {
    message: "fim tem de ser depois do início",
    path: ["fim"],
  });

// Conteúdo de um horário "classes".
export const classesContentSchema = z.object({
  aulas: z.array(classSchema).refine(hasUniqueIds, UNIQUE_IDS_MESSAGE),
  excecoes: z.array(scheduleExceptionSchema),
});

export const scheduleContentSchema = z.union([openingContentSchema, classesContentSchema]);

export const scheduleMetaSchema = z.object({
  id: idSchema,
  nome: text(80),
  tipo: scheduleTypeSchema,
});

export const priceSchema = z.object({
  id: idSchema,
  nome: text(120),
  preco: z.number().nonnegative(),
  periodo: text(40).optional(),
  inclui: z.array(text(160)).max(20).optional(),
  destaque: z.boolean().optional(),
  visivel: z.boolean(),
});

export const noticeSchema = z
  .object({
    id: idSchema,
    texto: text(500),
    inicio: dateSchema,
    fim: dateSchema,
    visivel: z.boolean(),
  })
  .refine((value) => value.inicio <= value.fim, {
    message: "fim não pode ser antes do início",
    path: ["fim"],
  });

export const serviceSchema = z.object({
  id: idSchema,
  nome: text(120),
  descricao: text(1000).optional(),
  duracao: z.number().int().positive().optional(),
  preco: z.number().nonnegative().optional(),
  foto: imageSchema.optional(),
  visivel: z.boolean(),
});

export const teamMemberSchema = z.object({
  id: idSchema,
  nome: text(120),
  funcao: text(120).optional(),
  descricao: text(1000).optional(),
  foto: imageSchema.optional(),
  visivel: z.boolean(),
});

export const contactsSchema = z.object({
  telefone: text(30).optional(),
  whatsapp: z
    .string()
    .regex(/^\d{8,15}$/, "whatsapp só com dígitos, com indicativo do país")
    .optional(),
  email: z.email().max(254).optional(),
  morada: text(300).optional(),
  redes: z
    .array(z.object({ tipo: text(40), url: webUrlSchema }))
    .max(12)
    .optional(),
});

export const faqItemSchema = z.object({
  id: idSchema,
  pergunta: text(300),
  resposta: text(2000),
  visivel: z.boolean(),
});

const listOf = <T extends z.ZodType<{ id: string }>>(item: T) =>
  z.array(item).refine(hasUniqueIds, UNIQUE_IDS_MESSAGE);

// Esquema de cada bloco: é o que a API pública devolve em /api/public/{tenant}/{bloco}.
export const blockSchemas = {
  horarios: z.record(idSchema, scheduleContentSchema),
  precos: listOf(priceSchema),
  avisos: listOf(noticeSchema),
  servicos: listOf(serviceSchema),
  equipa: listOf(teamMemberSchema),
  contactos: contactsSchema,
  faq: listOf(faqItemSchema),
} as const;

export const contentSchema = z.object({
  horarios: blockSchemas.horarios.optional(),
  precos: blockSchemas.precos.optional(),
  avisos: blockSchemas.avisos.optional(),
  servicos: blockSchemas.servicos.optional(),
  equipa: blockSchemas.equipa.optional(),
  contactos: blockSchemas.contactos.optional(),
  faq: blockSchemas.faq.optional(),
});

// Ficheiro mova.json completo, versão 1.
export const movaFileSchema = z
  .object({
    $schema: z.string().optional(),
    versao: z.literal(MOVA_VERSION),
    blocos: z
      .array(blockNameSchema)
      .refine((blocks) => new Set(blocks).size === blocks.length, "blocos repetidos"),
    horarios: z.array(scheduleMetaSchema).refine(hasUniqueIds, UNIQUE_IDS_MESSAGE),
    conteudo: contentSchema,
  })
  .superRefine((file, ctx) => {
    for (const block of file.blocos) {
      if (file.conteudo[block] === undefined) {
        ctx.addIssue({
          code: "custom",
          message: `o bloco "${block}" está em "blocos" mas não tem conteúdo`,
          path: ["conteudo", block],
        });
      }
    }

    for (const block of BLOCK_NAMES) {
      if (file.conteudo[block] !== undefined && !file.blocos.includes(block)) {
        ctx.addIssue({
          code: "custom",
          message: `o bloco "${block}" tem conteúdo mas não está em "blocos"`,
          path: ["blocos"],
        });
      }
    }

    const schedulesActive = file.blocos.includes("horarios");

    if (!schedulesActive) {
      if (file.horarios.length > 0) {
        ctx.addIssue({
          code: "custom",
          message: 'há horários definidos mas "horarios" não está em "blocos"',
          path: ["horarios"],
        });
      }
      return;
    }

    if (file.horarios.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: 'o bloco "horarios" está ativo mas não há nenhum horário definido',
        path: ["horarios"],
      });
    }

    const schedules = file.conteudo.horarios ?? {};

    file.horarios.forEach((meta, index) => {
      const schedule = schedules[meta.id];
      if (schedule === undefined) {
        ctx.addIssue({
          code: "custom",
          message: `o horário "${meta.id}" não tem conteúdo`,
          path: ["conteudo", "horarios", meta.id],
        });
        return;
      }
      const isClasses = "aulas" in schedule;
      if ((meta.tipo === "classes") !== isClasses) {
        ctx.addIssue({
          code: "custom",
          message: `o conteúdo do horário "${meta.id}" não corresponde ao tipo "${meta.tipo}"`,
          path: ["horarios", index, "tipo"],
        });
      }
    });

    for (const id of Object.keys(schedules)) {
      if (!file.horarios.some((meta) => meta.id === id)) {
        ctx.addIssue({
          code: "custom",
          message: `o horário "${id}" tem conteúdo mas não está na lista "horarios"`,
          path: ["conteudo", "horarios", id],
        });
      }
    }
  });

export type BlockName = z.infer<typeof blockNameSchema>;
export type ScheduleType = z.infer<typeof scheduleTypeSchema>;
export type ScheduleMeta = z.infer<typeof scheduleMetaSchema>;
export type Interval = z.infer<typeof intervalSchema>;
export type ScheduleDay = z.infer<typeof scheduleDaySchema>;
export type ScheduleException = z.infer<typeof scheduleExceptionSchema>;
export type OpeningContent = z.infer<typeof openingContentSchema>;
export type ClassItem = z.infer<typeof classSchema>;
export type ClassesContent = z.infer<typeof classesContentSchema>;
export type ScheduleContent = z.infer<typeof scheduleContentSchema>;
export type Price = z.infer<typeof priceSchema>;
export type Notice = z.infer<typeof noticeSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type Contacts = z.infer<typeof contactsSchema>;
export type FaqItem = z.infer<typeof faqItemSchema>;
export type MovaFile = z.infer<typeof movaFileSchema>;
export type MovaFileInput = z.input<typeof movaFileSchema>;
export type BlockContentMap = { [K in BlockName]: z.infer<(typeof blockSchemas)[K]> };
export type BlockContent<B extends BlockName> = BlockContentMap[B];

export function isClassesContent(schedule: ScheduleContent): schedule is ClassesContent {
  return "aulas" in schedule;
}
