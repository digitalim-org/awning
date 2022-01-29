import { DB } from "./deps.ts";
import seed from "./seed.ts";

export const db = new DB("./dev.db");

seed(db);

export { default as Model } from "./Model.ts";
export { default as Database } from "./Database.ts";
