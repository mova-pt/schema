import { z } from "zod";
export const MOVA_VERSION = 1;
export const BLOCK_NAMES = [
    "horarios",
    "precos",
    "avisos",
    "servicos",
    "contactos",
    "faq",
];
export const SCHEDULE_TYPES = ["opening", "availability", "classes"];
export const CLASS_LEVELS = ["iniciação", "intermédio", "avançado", "todos"];
export const blockNameSchema = z.enum(BLOCK_NAMES);
export const scheduleTypeSchema = z.enum(SCHEDULE_TYPES);
// Identificador fixo: slug em minúsculas, sem acentos.
export const idSchema = z
    .string()
    .max(64)
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
const text = (max) => z.string().trim().min(1).max(max);
const hasUniqueIds = (items) => new Set(items.map((item) => item.id)).size === items.length;
const UNIQUE_IDS_MESSAGE = "ids repetidos na lista";
// Caminho de uma imagem do próprio site (ex.: "/images/pilates.webp").
const imageSchema = z
    .string()
    .max(200)
    .regex(/^\/[A-Za-z0-9/_.-]+\.(webp|avif|jpg|jpeg|png)$/, "foto tem de ser o caminho de uma imagem do próprio site");
const webUrlSchema = z.url({ protocol: /^https$/ }).max(300);
export const intervalSchema = z
    .strictObject({ inicio: timeSchema, fim: timeSchema })
    .refine((value) => value.inicio < value.fim, {
    message: "fim tem de ser depois do início",
    path: ["fim"],
});
const hasNoOverlaps = (intervals) => {
    const sorted = [...intervals].sort((a, b) => a.inicio.localeCompare(b.inicio));
    return sorted.every((interval, index) => {
        const previous = sorted[index - 1];
        return previous === undefined || previous.fim <= interval.inicio;
    });
};
export const scheduleDaySchema = z.strictObject({
    dia: daySchema,
    intervalos: z
        .array(intervalSchema)
        .max(6)
        .refine(hasNoOverlaps, "os intervalos do mesmo dia não se podem sobrepor"),
});
export const scheduleExceptionSchema = z
    .strictObject({
    data: dateSchema,
    fechado: z.boolean(),
    inicio: timeSchema.optional(),
    fim: timeSchema.optional(),
    nota: text(200).optional(),
})
    .refine((value) => value.inicio === undefined || value.fim === undefined || value.inicio < value.fim, { message: "fim tem de ser depois do início", path: ["fim"] });
const exceptionsSchema = z.array(scheduleExceptionSchema).max(200);
// Conteúdo de um horário "opening" ou "availability".
export const openingContentSchema = z.strictObject({
    dias: z
        .array(scheduleDaySchema)
        .max(7)
        .refine((days) => new Set(days.map((day) => day.dia)).size === days.length, "cada dia só pode aparecer uma vez"),
    excecoes: exceptionsSchema,
});
export const classSchema = z
    .strictObject({
    id: idSchema,
    dia: daySchema,
    inicio: timeSchema,
    fim: timeSchema,
    modalidade: text(80),
    instrutor: text(80).optional(),
    sala: text(80).optional(),
    nivel: z.enum(CLASS_LEVELS).optional(),
    lotacao: z.number().int().min(1).max(1000).optional(),
    visivel: z.boolean(),
})
    .refine((value) => value.inicio < value.fim, {
    message: "fim tem de ser depois do início",
    path: ["fim"],
});
// Conteúdo de um horário "classes".
export const classesContentSchema = z.strictObject({
    aulas: z.array(classSchema).max(300).refine(hasUniqueIds, UNIQUE_IDS_MESSAGE),
    excecoes: exceptionsSchema,
});
export const scheduleContentSchema = z.union([openingContentSchema, classesContentSchema]);
export const scheduleMetaSchema = z.strictObject({
    id: idSchema,
    nome: text(80),
    tipo: scheduleTypeSchema,
});
export const priceSchema = z.strictObject({
    id: idSchema,
    nome: text(120),
    preco: z.number().min(0).max(100000),
    periodo: text(40).optional(),
    inclui: z.array(text(160)).max(20).optional(),
    destaque: z.boolean().optional(),
    visivel: z.boolean(),
});
export const noticeSchema = z
    .strictObject({
    id: idSchema,
    texto: text(400),
    inicio: dateSchema,
    fim: dateSchema,
    visivel: z.boolean(),
})
    .refine((value) => value.inicio <= value.fim, {
    message: "fim não pode ser antes do início",
    path: ["fim"],
});
export const serviceSchema = z.strictObject({
    id: idSchema,
    nome: text(120),
    descricao: text(600).optional(),
    duracao: z.number().int().min(1).max(1440).optional(),
    preco: z.number().min(0).max(100000).optional(),
    foto: imageSchema.optional(),
    visivel: z.boolean(),
});
export const contactsSchema = z.strictObject({
    telefone: text(30).optional(),
    whatsapp: z
        .string()
        .regex(/^\d{8,15}$/, "whatsapp só com dígitos, com indicativo do país")
        .optional(),
    email: z.email().max(200).optional(),
    morada: text(300).optional(),
    redes: z
        .array(z.strictObject({ tipo: text(40), url: webUrlSchema }))
        .max(12)
        .optional(),
});
export const faqItemSchema = z.strictObject({
    id: idSchema,
    pergunta: text(200),
    resposta: text(1200),
    visivel: z.boolean(),
});
const listOf = (item, max) => z.array(item).max(max).refine(hasUniqueIds, UNIQUE_IDS_MESSAGE);
// Todos os objetos são estritos: um campo a mais é um erro, tal como no painel.
// Esquema de cada bloco: é o que a API pública devolve em /api/public/{tenant}/{bloco}.
export const blockSchemas = {
    horarios: z.record(idSchema, scheduleContentSchema),
    precos: listOf(priceSchema, 60),
    avisos: listOf(noticeSchema, 40),
    servicos: listOf(serviceSchema, 80),
    contactos: contactsSchema,
    faq: listOf(faqItemSchema, 60),
};
export const contentSchema = z.strictObject({
    horarios: blockSchemas.horarios.optional(),
    precos: blockSchemas.precos.optional(),
    avisos: blockSchemas.avisos.optional(),
    servicos: blockSchemas.servicos.optional(),
    contactos: blockSchemas.contactos.optional(),
    faq: blockSchemas.faq.optional(),
});
// Ficheiro mova.json completo, versão 1.
export const movaFileSchema = z
    .strictObject({
    versao: z.literal(MOVA_VERSION),
    blocos: z
        .array(blockNameSchema)
        .max(BLOCK_NAMES.length)
        .refine((blocks) => new Set(blocks).size === blocks.length, "blocos repetidos"),
    horarios: z
        .array(scheduleMetaSchema)
        .max(12)
        .refine(hasUniqueIds, UNIQUE_IDS_MESSAGE)
        .default([]),
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
export function isClassesContent(schedule) {
    return "aulas" in schedule;
}
