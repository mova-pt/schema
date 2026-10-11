import { z } from "zod";
export declare const MOVA_VERSION = 1;
export declare const BLOCK_NAMES: readonly ["horarios", "precos", "avisos", "servicos", "contactos", "faq"];
export declare const SCHEDULE_TYPES: readonly ["opening", "availability", "classes"];
export declare const CLASS_LEVELS: readonly ["iniciação", "intermédio", "avançado", "todos"];
export declare const blockNameSchema: z.ZodEnum<{
    horarios: "horarios";
    precos: "precos";
    avisos: "avisos";
    servicos: "servicos";
    contactos: "contactos";
    faq: "faq";
}>;
export declare const scheduleTypeSchema: z.ZodEnum<{
    opening: "opening";
    availability: "availability";
    classes: "classes";
}>;
export declare const idSchema: z.ZodString;
export declare const timeSchema: z.ZodString;
export declare const dateSchema: z.ZodString;
export declare const daySchema: z.ZodNumber;
export declare const intervalSchema: z.ZodObject<{
    inicio: z.ZodString;
    fim: z.ZodString;
}, z.core.$strict>;
export declare const scheduleDaySchema: z.ZodObject<{
    dia: z.ZodNumber;
    intervalos: z.ZodArray<z.ZodObject<{
        inicio: z.ZodString;
        fim: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const scheduleExceptionSchema: z.ZodObject<{
    data: z.ZodString;
    fechado: z.ZodBoolean;
    inicio: z.ZodOptional<z.ZodString>;
    fim: z.ZodOptional<z.ZodString>;
    nota: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const openingContentSchema: z.ZodObject<{
    dias: z.ZodArray<z.ZodObject<{
        dia: z.ZodNumber;
        intervalos: z.ZodArray<z.ZodObject<{
            inicio: z.ZodString;
            fim: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    excecoes: z.ZodArray<z.ZodObject<{
        data: z.ZodString;
        fechado: z.ZodBoolean;
        inicio: z.ZodOptional<z.ZodString>;
        fim: z.ZodOptional<z.ZodString>;
        nota: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const classSchema: z.ZodObject<{
    id: z.ZodString;
    dia: z.ZodNumber;
    inicio: z.ZodString;
    fim: z.ZodString;
    modalidade: z.ZodString;
    instrutor: z.ZodOptional<z.ZodString>;
    sala: z.ZodOptional<z.ZodString>;
    nivel: z.ZodOptional<z.ZodEnum<{
        iniciação: "iniciação";
        intermédio: "intermédio";
        avançado: "avançado";
        todos: "todos";
    }>>;
    lotacao: z.ZodOptional<z.ZodNumber>;
    visivel: z.ZodBoolean;
}, z.core.$strict>;
export declare const classesContentSchema: z.ZodObject<{
    aulas: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        dia: z.ZodNumber;
        inicio: z.ZodString;
        fim: z.ZodString;
        modalidade: z.ZodString;
        instrutor: z.ZodOptional<z.ZodString>;
        sala: z.ZodOptional<z.ZodString>;
        nivel: z.ZodOptional<z.ZodEnum<{
            iniciação: "iniciação";
            intermédio: "intermédio";
            avançado: "avançado";
            todos: "todos";
        }>>;
        lotacao: z.ZodOptional<z.ZodNumber>;
        visivel: z.ZodBoolean;
    }, z.core.$strict>>;
    excecoes: z.ZodArray<z.ZodObject<{
        data: z.ZodString;
        fechado: z.ZodBoolean;
        inicio: z.ZodOptional<z.ZodString>;
        fim: z.ZodOptional<z.ZodString>;
        nota: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const scheduleContentSchema: z.ZodUnion<readonly [z.ZodObject<{
    dias: z.ZodArray<z.ZodObject<{
        dia: z.ZodNumber;
        intervalos: z.ZodArray<z.ZodObject<{
            inicio: z.ZodString;
            fim: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    excecoes: z.ZodArray<z.ZodObject<{
        data: z.ZodString;
        fechado: z.ZodBoolean;
        inicio: z.ZodOptional<z.ZodString>;
        fim: z.ZodOptional<z.ZodString>;
        nota: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    aulas: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        dia: z.ZodNumber;
        inicio: z.ZodString;
        fim: z.ZodString;
        modalidade: z.ZodString;
        instrutor: z.ZodOptional<z.ZodString>;
        sala: z.ZodOptional<z.ZodString>;
        nivel: z.ZodOptional<z.ZodEnum<{
            iniciação: "iniciação";
            intermédio: "intermédio";
            avançado: "avançado";
            todos: "todos";
        }>>;
        lotacao: z.ZodOptional<z.ZodNumber>;
        visivel: z.ZodBoolean;
    }, z.core.$strict>>;
    excecoes: z.ZodArray<z.ZodObject<{
        data: z.ZodString;
        fechado: z.ZodBoolean;
        inicio: z.ZodOptional<z.ZodString>;
        fim: z.ZodOptional<z.ZodString>;
        nota: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>]>;
export declare const scheduleMetaSchema: z.ZodObject<{
    id: z.ZodString;
    nome: z.ZodString;
    tipo: z.ZodEnum<{
        opening: "opening";
        availability: "availability";
        classes: "classes";
    }>;
}, z.core.$strict>;
export declare const priceSchema: z.ZodObject<{
    id: z.ZodString;
    nome: z.ZodString;
    preco: z.ZodNumber;
    periodo: z.ZodOptional<z.ZodString>;
    inclui: z.ZodOptional<z.ZodArray<z.ZodString>>;
    destaque: z.ZodOptional<z.ZodBoolean>;
    visivel: z.ZodBoolean;
}, z.core.$strict>;
export declare const noticeSchema: z.ZodObject<{
    id: z.ZodString;
    texto: z.ZodString;
    inicio: z.ZodString;
    fim: z.ZodString;
    visivel: z.ZodBoolean;
}, z.core.$strict>;
export declare const serviceSchema: z.ZodObject<{
    id: z.ZodString;
    nome: z.ZodString;
    descricao: z.ZodOptional<z.ZodString>;
    duracao: z.ZodOptional<z.ZodNumber>;
    preco: z.ZodOptional<z.ZodNumber>;
    foto: z.ZodOptional<z.ZodString>;
    visivel: z.ZodBoolean;
}, z.core.$strict>;
export declare const contactsSchema: z.ZodObject<{
    telefone: z.ZodOptional<z.ZodString>;
    whatsapp: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodEmail>;
    morada: z.ZodOptional<z.ZodString>;
    redes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tipo: z.ZodString;
        url: z.ZodURL;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export declare const faqItemSchema: z.ZodObject<{
    id: z.ZodString;
    pergunta: z.ZodString;
    resposta: z.ZodString;
    visivel: z.ZodBoolean;
}, z.core.$strict>;
export declare const blockSchemas: {
    readonly horarios: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodObject<{
        dias: z.ZodArray<z.ZodObject<{
            dia: z.ZodNumber;
            intervalos: z.ZodArray<z.ZodObject<{
                inicio: z.ZodString;
                fim: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        excecoes: z.ZodArray<z.ZodObject<{
            data: z.ZodString;
            fechado: z.ZodBoolean;
            inicio: z.ZodOptional<z.ZodString>;
            fim: z.ZodOptional<z.ZodString>;
            nota: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        aulas: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            dia: z.ZodNumber;
            inicio: z.ZodString;
            fim: z.ZodString;
            modalidade: z.ZodString;
            instrutor: z.ZodOptional<z.ZodString>;
            sala: z.ZodOptional<z.ZodString>;
            nivel: z.ZodOptional<z.ZodEnum<{
                iniciação: "iniciação";
                intermédio: "intermédio";
                avançado: "avançado";
                todos: "todos";
            }>>;
            lotacao: z.ZodOptional<z.ZodNumber>;
            visivel: z.ZodBoolean;
        }, z.core.$strict>>;
        excecoes: z.ZodArray<z.ZodObject<{
            data: z.ZodString;
            fechado: z.ZodBoolean;
            inicio: z.ZodOptional<z.ZodString>;
            fim: z.ZodOptional<z.ZodString>;
            nota: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>]>>;
    readonly precos: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        nome: z.ZodString;
        preco: z.ZodNumber;
        periodo: z.ZodOptional<z.ZodString>;
        inclui: z.ZodOptional<z.ZodArray<z.ZodString>>;
        destaque: z.ZodOptional<z.ZodBoolean>;
        visivel: z.ZodBoolean;
    }, z.core.$strict>>;
    readonly avisos: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        texto: z.ZodString;
        inicio: z.ZodString;
        fim: z.ZodString;
        visivel: z.ZodBoolean;
    }, z.core.$strict>>;
    readonly servicos: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        nome: z.ZodString;
        descricao: z.ZodOptional<z.ZodString>;
        duracao: z.ZodOptional<z.ZodNumber>;
        preco: z.ZodOptional<z.ZodNumber>;
        foto: z.ZodOptional<z.ZodString>;
        visivel: z.ZodBoolean;
    }, z.core.$strict>>;
    readonly contactos: z.ZodObject<{
        telefone: z.ZodOptional<z.ZodString>;
        whatsapp: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodEmail>;
        morada: z.ZodOptional<z.ZodString>;
        redes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            tipo: z.ZodString;
            url: z.ZodURL;
        }, z.core.$strict>>>;
    }, z.core.$strict>;
    readonly faq: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        pergunta: z.ZodString;
        resposta: z.ZodString;
        visivel: z.ZodBoolean;
    }, z.core.$strict>>;
};
export declare const contentSchema: z.ZodObject<{
    horarios: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodObject<{
        dias: z.ZodArray<z.ZodObject<{
            dia: z.ZodNumber;
            intervalos: z.ZodArray<z.ZodObject<{
                inicio: z.ZodString;
                fim: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        excecoes: z.ZodArray<z.ZodObject<{
            data: z.ZodString;
            fechado: z.ZodBoolean;
            inicio: z.ZodOptional<z.ZodString>;
            fim: z.ZodOptional<z.ZodString>;
            nota: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        aulas: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            dia: z.ZodNumber;
            inicio: z.ZodString;
            fim: z.ZodString;
            modalidade: z.ZodString;
            instrutor: z.ZodOptional<z.ZodString>;
            sala: z.ZodOptional<z.ZodString>;
            nivel: z.ZodOptional<z.ZodEnum<{
                iniciação: "iniciação";
                intermédio: "intermédio";
                avançado: "avançado";
                todos: "todos";
            }>>;
            lotacao: z.ZodOptional<z.ZodNumber>;
            visivel: z.ZodBoolean;
        }, z.core.$strict>>;
        excecoes: z.ZodArray<z.ZodObject<{
            data: z.ZodString;
            fechado: z.ZodBoolean;
            inicio: z.ZodOptional<z.ZodString>;
            fim: z.ZodOptional<z.ZodString>;
            nota: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>]>>>;
    precos: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        nome: z.ZodString;
        preco: z.ZodNumber;
        periodo: z.ZodOptional<z.ZodString>;
        inclui: z.ZodOptional<z.ZodArray<z.ZodString>>;
        destaque: z.ZodOptional<z.ZodBoolean>;
        visivel: z.ZodBoolean;
    }, z.core.$strict>>>;
    avisos: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        texto: z.ZodString;
        inicio: z.ZodString;
        fim: z.ZodString;
        visivel: z.ZodBoolean;
    }, z.core.$strict>>>;
    servicos: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        nome: z.ZodString;
        descricao: z.ZodOptional<z.ZodString>;
        duracao: z.ZodOptional<z.ZodNumber>;
        preco: z.ZodOptional<z.ZodNumber>;
        foto: z.ZodOptional<z.ZodString>;
        visivel: z.ZodBoolean;
    }, z.core.$strict>>>;
    contactos: z.ZodOptional<z.ZodObject<{
        telefone: z.ZodOptional<z.ZodString>;
        whatsapp: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodEmail>;
        morada: z.ZodOptional<z.ZodString>;
        redes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            tipo: z.ZodString;
            url: z.ZodURL;
        }, z.core.$strict>>>;
    }, z.core.$strict>>;
    faq: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        pergunta: z.ZodString;
        resposta: z.ZodString;
        visivel: z.ZodBoolean;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export declare const movaFileSchema: z.ZodObject<{
    versao: z.ZodLiteral<1>;
    blocos: z.ZodArray<z.ZodEnum<{
        horarios: "horarios";
        precos: "precos";
        avisos: "avisos";
        servicos: "servicos";
        contactos: "contactos";
        faq: "faq";
    }>>;
    horarios: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        nome: z.ZodString;
        tipo: z.ZodEnum<{
            opening: "opening";
            availability: "availability";
            classes: "classes";
        }>;
    }, z.core.$strict>>>;
    conteudo: z.ZodObject<{
        horarios: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodObject<{
            dias: z.ZodArray<z.ZodObject<{
                dia: z.ZodNumber;
                intervalos: z.ZodArray<z.ZodObject<{
                    inicio: z.ZodString;
                    fim: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            excecoes: z.ZodArray<z.ZodObject<{
                data: z.ZodString;
                fechado: z.ZodBoolean;
                inicio: z.ZodOptional<z.ZodString>;
                fim: z.ZodOptional<z.ZodString>;
                nota: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            aulas: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                dia: z.ZodNumber;
                inicio: z.ZodString;
                fim: z.ZodString;
                modalidade: z.ZodString;
                instrutor: z.ZodOptional<z.ZodString>;
                sala: z.ZodOptional<z.ZodString>;
                nivel: z.ZodOptional<z.ZodEnum<{
                    iniciação: "iniciação";
                    intermédio: "intermédio";
                    avançado: "avançado";
                    todos: "todos";
                }>>;
                lotacao: z.ZodOptional<z.ZodNumber>;
                visivel: z.ZodBoolean;
            }, z.core.$strict>>;
            excecoes: z.ZodArray<z.ZodObject<{
                data: z.ZodString;
                fechado: z.ZodBoolean;
                inicio: z.ZodOptional<z.ZodString>;
                fim: z.ZodOptional<z.ZodString>;
                nota: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>]>>>;
        precos: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            nome: z.ZodString;
            preco: z.ZodNumber;
            periodo: z.ZodOptional<z.ZodString>;
            inclui: z.ZodOptional<z.ZodArray<z.ZodString>>;
            destaque: z.ZodOptional<z.ZodBoolean>;
            visivel: z.ZodBoolean;
        }, z.core.$strict>>>;
        avisos: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            texto: z.ZodString;
            inicio: z.ZodString;
            fim: z.ZodString;
            visivel: z.ZodBoolean;
        }, z.core.$strict>>>;
        servicos: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            nome: z.ZodString;
            descricao: z.ZodOptional<z.ZodString>;
            duracao: z.ZodOptional<z.ZodNumber>;
            preco: z.ZodOptional<z.ZodNumber>;
            foto: z.ZodOptional<z.ZodString>;
            visivel: z.ZodBoolean;
        }, z.core.$strict>>>;
        contactos: z.ZodOptional<z.ZodObject<{
            telefone: z.ZodOptional<z.ZodString>;
            whatsapp: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodEmail>;
            morada: z.ZodOptional<z.ZodString>;
            redes: z.ZodOptional<z.ZodArray<z.ZodObject<{
                tipo: z.ZodString;
                url: z.ZodURL;
            }, z.core.$strict>>>;
        }, z.core.$strict>>;
        faq: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            pergunta: z.ZodString;
            resposta: z.ZodString;
            visivel: z.ZodBoolean;
        }, z.core.$strict>>>;
    }, z.core.$strict>;
}, z.core.$strict>;
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
export type Contacts = z.infer<typeof contactsSchema>;
export type FaqItem = z.infer<typeof faqItemSchema>;
export type MovaFile = z.infer<typeof movaFileSchema>;
export type MovaFileInput = z.input<typeof movaFileSchema>;
export type BlockContentMap = {
    [K in BlockName]: z.infer<(typeof blockSchemas)[K]>;
};
export type BlockContent<B extends BlockName> = BlockContentMap[B];
export declare function isClassesContent(schedule: ScheduleContent): schedule is ClassesContent;
