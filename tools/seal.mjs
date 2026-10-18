// Seals the master back office into vault.json (safe to publish).
//   node tools/seal.mjs            -> reads tools/backoffice.json + master.key
// Change the key: edit master.key, run this again, push. Old sign-ins drop out.
// Same scheme app.js opens: PBKDF2-SHA256 -> 256-bit AES-GCM key.
import { readFileSync, writeFileSync } from "node:fs";
import { webcrypto as crypto } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pass = readFileSync(join(root, "master.key"), "utf8").trim();
const plain = JSON.stringify(JSON.parse(readFileSync(join(root, "tools", "backoffice.json"), "utf8")));
if (pass.length < 8) throw new Error("master.key is too short (8+ characters)");

const iter = 310000;
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveBits"]);
const raw = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: iter }, base, 256);
const key = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt"]);
const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plain));

const b64 = (u) => Buffer.from(u).toString("base64");
writeFileSync(join(root, "vault.json"), JSON.stringify({ v: 1, iter, salt: b64(salt), iv: b64(iv), ct: b64(ct) }) + "\n");
console.log("vault.json sealed (" + plain.length + " bytes of back office)");
