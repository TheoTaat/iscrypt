#!/usr/bin/env node
// ============================================================
// ISCRIPT KI-Schicht (Stufe 2): Kontext → Parameter
//
// Freie Sprache (vom Autor) → strukturierte Parameter (JSON)
//
// Diese Schicht BRAUCHT KI — freie Prosa lässt sich nicht mit
// Schlüsselwörtern verlässlich verstehen. Sie ist die EINZIGE
// Stelle in der Pipeline, an der KI hingehört.
//
// Provider-Chain: Mistral → Moonshot (Kimi) → Anthropic
// Fallback automatisch, wenn ein Provider schlägt.
//
// Ausgabe wird protokolliert (log-Datei), damit der Autor prüfen
// kann, was verstanden wurde. Die Parameter sind korrigierbar
// (Override-Datei).
//
// Aufruf:
//   node resolver/kontext-extrahieren.js \
//     --kontext artikel/kontexte/fachartikel.txt \
//     --out out/
//
// Erzeugt:
//   out/parameter.json            — extrahierte Parameter
//   out/parameter.log             — Protokoll: Provider, Output, Sicherheit
//   out/parameter.override.json   — (optional) manuelle Korrekturen
// ============================================================

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve as pathResolve } from "node:path";

// ============================================================
// PROMPT
// ============================================================

const SYSTEM_PROMPT = `Du bist der Kontext-Interpreter von ISCRIPT.
Deine Aufgabe: Aus freier deutscher Prosa (geschrieben vom Autor)
extrahierst du vier Parametergruppen als striktes JSON.

Regeln:
- Antworte NUR mit validem JSON, ohne Markdown, ohne Kommentare.
- Benutze die exakten Feldnamen wie im Schema unten.
- Wenn ein Wert nicht klar ist, nutze den Default und setze
  "sicherheit": "niedrig".
- Wenn ein Wert eindeutig ist, setze "sicherheit": "hoch".
- Erfinde nichts. Was nicht im Text steht, ist null.

Schema:
{
  "publikum": {
    "typ": "fachpublikum" | "allgemein" | "studenten" | "management" | "experten",
    "fachkenntnisse": 1-5,
    "beschreibung": "eigene Zusammenfassung in 1 Satz",
    "sicherheit": "hoch" | "mittel" | "niedrig"
  },
  "ton": {
    "stil": "sachlich" | "erzaehlend" | "ueberzeugend" | "kritisch" | "inspirierend" | "neutral",
    "person": "ich" | "wir" | "erzaehlend",
    "satzlaenge": "kurz" | "mittel" | "lang",
    "beschreibung": "eigene Zusammenfassung in 1 Satz",
    "sicherheit": "hoch" | "mittel" | "niedrig"
  },
  "laenge": {
    "komprimierung": "kern" | "dicht" | "voll",
    "ziel_woerter": number | null,
    "teil_anzahl": number | null,
    "beschreibung": "eigene Zusammenfassung in 1 Satz",
    "sicherheit": "hoch" | "mittel" | "niedrig"
  },
  "fokus": {
    "gewichtung": {
      "concept": 1-5,
      "task": 1-5,
      "reference": 1-5,
      "absatz": 1-5
    },
    "ausschliesse": ["Liste"],
    "beschreibung": "eigene Zusammenfassung in 1 Satz",
    "sicherheit": "hoch" | "mittel" | "niedrig"
  }
}`;

// ============================================================
// PROVIDER-CHAIN: Mistral → Moonshot → Anthropic
// ============================================================

const providers = [
  {
    id: "mistral-small",
    name: "Mistral Small",
    baseUrl: "https://api.mistral.ai/v1/chat/completions",
    model: "mistral-small-latest",
    temperature: 0,
    apiKey: () => process.env.MISTRAL_API_KEY,
    authHeader: k => ({ Authorization: `Bearer ${k}`, "Content-Type": "application/json" }),
    buildBody: (sys, usr) => ({
      model: "mistral-small-latest",
      max_tokens: 2000,
      temperature: 0,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: usr }
      ]
    }),
    extract: d => d.choices?.[0]?.message?.content || ""
  },
  {
    id: "kimi-k2.6",
    name: "Kimi K2.6",
    baseUrl: "https://api.moonshot.ai/v1/chat/completions",
    model: "kimi-k2.6",
    temperature: 1,
    apiKey: () => process.env.MOONSHOT_API_KEY,
    authHeader: k => ({ Authorization: `Bearer ${k}`, "Content-Type": "application/json" }),
    buildBody: (sys, usr) => ({
      model: "kimi-k2.6",
      max_tokens: 2000,
      temperature: 1,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: usr }
      ]
    }),
    extract: d => d.choices?.[0]?.message?.content || ""
  },
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    baseUrl: "https://api.anthropic.com/v1/messages",
    model: "claude-sonnet-4-6",
    temperature: 0,
    apiKey: () => process.env.ANTHROPIC_API_KEY,
    authHeader: k => ({
      "x-api-key": k,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    }),
    buildBody: (sys, usr) => ({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      temperature: 0,
      system: sys,
      messages: [{ role: "user", content: usr }]
    }),
    extract: d => d.content?.[0]?.text || ""
  }
];

async function callLLM(systemPrompt, userPrompt) {
  const errors = [];
  for (const p of providers) {
    const key = p.apiKey();
    if (!key) { errors.push(`${p.name}: kein API-Key`); continue; }
    try {
      const res = await fetch(p.baseUrl, {
        method: "POST",
        headers: p.authHeader(key),
        body: JSON.stringify(p.buildBody(systemPrompt, userPrompt))
      });
      if (!res.ok) {
        const body = await res.text();
        errors.push(`${p.name}: HTTP ${res.status} ${body.slice(0, 120)}`);
        continue;
      }
      const data = await res.json();
      const text = p.extract(data);
      if (text && text.trim().length > 10) {
        return { text, provider: p.id, providerName: p.name };
      }
      errors.push(`${p.name}: leerer Output`);
    } catch (err) {
      errors.push(`${p.name}: ${err.message}`);
    }
  }
  throw new Error("Alle Provider fehlgeschlagen:\n" + errors.map(e => "  • " + e).join("\n"));
}

// ============================================================
// OFFLINE-FALLBACK: Regelbasierte Extraktion (nur für Testen)
// ============================================================
// Dieser Fallback wird NUR genutzt, wenn KEIN LLM erreichbar ist.
// Er ist bewusst einfach und ersetzt die KI-Schicht NICHT.
// In Produktion muss ein LLM-Provider verfügbar sein.

function offlineExtract(prosa) {
  const lower = prosa.toLowerCase();
  
  // Publikum
  let typ = "fachpublikum";
  let fachkenntnisse = 4;
  if (lower.includes("studenten")) typ = "studenten";
  else if (lower.includes("management")) typ = "management";
  else if (lower.includes("allgemein")) typ = "allgemein";
  
  const fk = prosa.match(/fachkenntnisse:\s*(\d)\s*\/\s*5/i);
  if (fk) fachkenntnisse = parseInt(fk[1]);
  
  // Ton
  let stil = "sachlich";
  if (lower.includes("erzählend") || lower.includes("erzaehlend")) stil = "erzaehlend";
  else if (lower.includes("überzeugend") || lower.includes("ueberzeugend")) stil = "ueberzeugend";
  else if (lower.includes("kritisch")) stil = "kritisch";
  
  let person = "erzaehlend";
  if (lower.includes("ich-form")) person = "ich";
  else if (lower.includes("wir-form")) person = "wir";
  
  // Länge
  let komprimierung = "dicht";
  if (lower.includes("kern")) komprimierung = "kern";
  else if (lower.includes("voll")) komprimierung = "voll";
  
  const ziel = prosa.match(/ziel:\s*(\d[\d\s]*)\s*wörter/i);
  
  // Fokus
  const gewichtung = { concept: 5, task: 4, reference: 3, absatz: 4 };
  const gw = /(concept|task|reference|absatz)\s*:\s*Gewicht\s*(\d)/gi;
  let m;
  while ((m = gw.exec(prosa)) !== null) {
    gewichtung[m[1].toLowerCase()] = parseInt(m[2]);
  }
  
  const ausschliesse = [];
  const ausMatch = prosa.match(/Ausschluss:\s*(.+)/i);
  if (ausMatch) {
    ausschliesse.push(ausMatch[1].trim());
  }
  
  return {
    publikum: {
      typ,
      fachkenntnisse,
      beschreibung: `Offline-Extraktion: ${typ} (${fachkenntnisse}/5)`,
      sicherheit: "niedrig"  // Offline-Modus ist weniger verlässlich
    },
    ton: {
      stil,
      person,
      satzlaenge: "mittel",
      beschreibung: `Offline-Extraktion: ${stil}, ${person}`,
      sicherheit: "niedrig"
    },
    laenge: {
      komprimierung,
      ziel_woerter: ziel ? parseInt(ziel[1]) : null,
      teil_anzahl: null,
      beschreibung: `Offline-Extraktion: ${komprimierung}`,
      sicherheit: "niedrig"
    },
    fokus: {
      gewichtung,
      ausschliesse,
      beschreibung: `Offline-Extraktion: ${Object.entries(gewichtung).map(([k,v]) => `${k}=${v}`).join(", ")}`,
      sicherheit: "niedrig"
    }
  };
}

function parseLLMJson(text) {
  let clean = text.replace(/^```(?:json)?\s*\n?/gm, "").replace(/\n?```\s*$/gm, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Kein JSON im LLM-Output");
  clean = clean.slice(start, end + 1);
  return JSON.parse(clean);
}

// ============================================================
// OVERRIDE-LOGIK: Manuelle Korrekturen vom Autor
// ============================================================

function applyOverride(params, override) {
  if (!override) return params;
  const merged = structuredClone(params);
  for (const [key, val] of Object.entries(override)) {
    if (val === null) { delete merged[key]; continue; }
    if (typeof val === "object" && !Array.isArray(val) && typeof merged[key] === "object") {
      Object.assign(merged[key], val);
    } else {
      merged[key] = val;
    }
  }
  return merged;
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  const args = process.argv.slice(2);
  const get = f => { const i = args.indexOf(f); return i !== -1 && i + 1 < args.length ? args[i + 1] : null; };

  const kontextPath = get("--kontext");
  const outPath = get("--out") || "out";

  if (!kontextPath) {
    console.error("Nutzung: node resolver/kontext-extrahieren.js --kontext <.txt> --out <dir>");
    process.exit(1);
  }

  const kontext = readFileSync(pathResolve(kontextPath), "utf-8");
  mkdirSync(pathResolve(outPath), { recursive: true });

  console.log("ISCRIPT KI-Schicht (Stufe 2): Kontext → Parameter");
  console.log("==============================================");
  console.log(`Kontext: ${kontextPath}`);
  console.log(`Wörter: ${kontext.split(/\s+/).filter(Boolean).length}`);
  console.log("");

  // LLM-Aufruf mit Provider-Chain
  console.log("[1/3] LLM-Aufruf (Provider-Chain: Mistral → Kimi → Claude) ...");
  let rawOutput, params, providerUsed;
  try {
    const result = await callLLM(SYSTEM_PROMPT, `Hier ist der Kontext des Autors:\n\n${kontext}`);
    rawOutput = result.text;
    providerUsed = result.providerName;
  } catch (err) {
    console.error(`      ✗ LLM-Fehler: ${err.message}`);
    console.log("");
    console.log("      → Kein LLM verfügbar. Weiche auf Offline-Extraktion aus.");
    console.log("        (Nur für Testen — in Produktion muss ein LLM-Provider verfügbar sein.)");
    params = offlineExtract(kontext);
    rawOutput = "[OFFLINE-MODUS] Kein LLM erreichbar. Regelbasierte Extraktion statt KI.";
    providerUsed = "offline (regelbasiert)";
  }

  if (providerUsed.startsWith("offline")) {
    // Skip JSON parsing in offline mode
  } else {
    // JSON-Parse
    console.log("[2/3] JSON parsen ...");
    try {
      params = parseLLMJson(rawOutput);
    } catch (err) {
      console.error(`      ✗ JSON-Parsee: ${err.message}`);
      console.error(`      Roh-Output (erste 300): ${rawOutput.slice(0, 300)}`);
      process.exit(1);
    }
  }

  // Override anwenden (wenn vorhanden)
  const overridePath = join(pathResolve(outPath), "parameter.override.json");
  if (existsSync(overridePath)) {
    const override = JSON.parse(readFileSync(overridePath, "utf-8"));
    params = applyOverride(params, override);
    console.log("      → Override aus parameter.override.json angewendet");
  }

  // Validierung
  console.log("[3/3] Validieren + schreiben ...");
  const required = ["publikum", "ton", "laenge", "fokus"];
  for (const r of required) {
    if (!params[r]) {
      console.error(`      ✗ Fehlt: ${r}`);
      process.exit(1);
    }
  }

  // Schreiben
  const paramFile = join(pathResolve(outPath), "parameter.json");
  writeFileSync(paramFile, JSON.stringify(params, null, 2), "utf-8");

  // Log schreiben
  const logFile = join(pathResolve(outPath), "parameter.log");
  const log = [
    `# Protokoll: KI-Extraktion (Stufe 2)`,
    ``,
    `**Zeit:** ${new Date().toISOString()}`,
    `**Kontext-Datei:** ${kontextPath}`,
    `**Provider:** ${providerUsed}`,
    ``,
    `## Extrahierte Parameter`,
    ``,
    "```json",
    JSON.stringify(params, null, 2),
    "```",
    ``,
    `## Sicherheit`,
    ``,
    `- Publikum: ${params.publikum.sicherheit || "n/a"}`,
    `- Ton: ${params.ton.sicherheit || "n/a"}`,
    `- Länge: ${params.laenge.sicherheit || "n/a"}`,
    `- Fokus: ${params.fokus.sicherheit || "n/a"}`,
    ``,
    `## Roh-Output des LLM (unverändert)`,
    ``,
    "```",
    rawOutput,
    "```",
    ``,
    `## Hinweis`,
    ``,
    `Diese Extraktion ist **nicht deterministisch**. Dieselbe`,
    `Kontext-Datei kann bei einem erneuten Aufruf leicht`,
    `andere Parameter liefern. Die Parameter sind in`,
    `parameter.json gespeichert und können per`,
    `parameter.override.json manuell korrigiert werden,`,
    `bevor der Resolver (Stufe 3) läuft.`,
    ``
  ].join("\n");
  writeFileSync(logFile, log, "utf-8");

  // Zusammenfassung
  console.log(`      → ${paramFile}`);
  console.log(`      → ${logFile}`);
  console.log("");
  console.log(`    Publikum: ${params.publikum.typ} (${params.publikum.fachkenntnisse}/5) — ${params.publikum.sicherheit}`);
  console.log(`    Ton: ${params.ton.stil}, Person: ${params.ton.person} — ${params.ton.sicherheit}`);
  console.log(`    Länge: ${params.laenge.komprimierung}, ${params.laenge.ziel_woerter || "?"} Wörter — ${params.laenge.sicherheit}`);
  const gw = Object.entries(params.fokus.gewichtung || {});
  if (gw.length) console.log(`    Fokus: ${gw.map(([k, v]) => `${k}=${v}`).join(", ")} — ${params.fokus.sicherheit}`);
  console.log("");
  console.log("Fertig. Der Resolver (Stufe 3) kann jetzt mit parameter.json arbeiten.");
}

main().catch(err => {
  console.error("Fehler:", err.message);
  process.exit(1);
});
