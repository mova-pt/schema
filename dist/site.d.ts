import { type BlockContent, type BlockName, type MovaFile, type MovaFileInput } from "./schemas.js";
export type SiteInput = Omit<MovaFileInput, "versao">;
export declare function defineSite(input: SiteInput): MovaFile;
export declare function buildMovaJson(site: SiteInput | MovaFile): string;
export declare function filterVisible<B extends BlockName>(block: B, content: BlockContent<B>): BlockContent<B>;
