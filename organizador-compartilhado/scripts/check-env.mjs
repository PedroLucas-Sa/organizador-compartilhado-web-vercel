import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadLocalEnv() {
  const file = resolve(process.cwd(), ".env.local");
  if (!existsSync(file)) return;

  for (const rawLine of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadLocalEnv();

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
];

const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) {
  console.error(`Variáveis obrigatórias ausentes: ${missing.join(", ")}`);
  console.error("Configure-as em .env.local (local) ou em Vercel > Settings > Environment Variables.");
  process.exit(1);
}

let parsedUrl;
try {
  parsedUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
} catch {
  console.error("NEXT_PUBLIC_SUPABASE_URL não é uma URL válida.");
  process.exit(1);
}

if (parsedUrl.protocol !== "https:" && parsedUrl.hostname !== "localhost") {
  console.error("NEXT_PUBLIC_SUPABASE_URL deve usar HTTPS em produção.");
  process.exit(1);
}

if (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.length < 20) {
  console.error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY parece inválida ou incompleta.");
  process.exit(1);
}

console.log("Configuração de ambiente validada.");
