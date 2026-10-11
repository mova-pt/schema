import type { MovaFile } from "./schemas.js";
import { type SiteInput } from "./site.js";
export declare function writeMovaJson(site: SiteInput | MovaFile, outFile?: string): Promise<string>;
