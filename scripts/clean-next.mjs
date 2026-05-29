import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const target = resolve(".next");

await rm(target, { force: true, recursive: true });
console.log("Removed .next cache/build output.");
