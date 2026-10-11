import { type BlockContent, type BlockName, type MovaFile, type MovaFileInput } from "./schemas.js";
export declare const MOVA_SCHEMA_URL = "https://app.movadigital.pt/schema/mova.v1.json";
export type SiteInput = Omit<MovaFileInput, "versao" | "$schema">;
export declare function defineSite(input: SiteInput): MovaFile;
export declare function buildMovaJson(site: SiteInput | MovaFile): string;
export declare function filterVisible<B extends BlockName>(block: B, content: BlockContent<B>): BlockContent<B>;
