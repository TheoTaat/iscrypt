#!/usr/bin/env node
// ============================================================
// ISCRIPT KI-Schicht (Stufe 2): Kontext A + Kontext B → Parameter
//
// Zwei Kontexte werden gelesen:
//   - Kontext A (Inhalt): Alles über ISCRIPT an sich.
//     Was es ist, was es leistet, welche Fakten gelten.
//     Bleibt bei jedem Artefakt-Wechsel gleich.
//   - Kontext B (Form): Wie das Artefakt strukturiert,
//     aufgebaut, getönt sein soll.
//     Wird ausgetauscht (Fachartikel, Homepage, Buch, Vortrag).
//
// Aus beiden wird ein parameter.json mit beiden Gruppen
// extrahiert:
//   - inhalt: { fakten, these, konzepte, ... }
//   - form: { publikum, ton, laenge, fokus, zielformat }
//
// Provider-Chain: Mistral → Moonshot (Kimi) → Anthropic
// Fallback automatisch, wenn ein Provider schlägt.
//
// Aufruf:
//   node resolver/kontext-extrahieren.js \
//     --inhalt artikel/kontexte/iscrypt.inhalt.txt \
//     --form artikel/kontexte/fachartikel.form.txt \
//     --out out/
//
// Erzeugt:
//   out/parameter.json            — extrahierte Parameter (Inhalt + Form)
//   out/parameter.log             — Protokoll: Provider, Output, Sicherheit
//   out/parameter.override.json   — (optional) manuelle Korrekturen
// ============================================================

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve as pathResolve } from "node:path";

// ============================================================
// PROMPT
// ============================================================

const SYSTEM_PROMPT = `Du bist der Kontext-Interpreter von ISCRIPT.

Du erhältst ZWEI Kontexte vom Autor:

1. **Kontext A (Inhalt)** — Alles über ISCRIPT an sich:
   Was es ist, was es leistet, welche Fakten gelten.
   Dieser Kontext ist artefakt-unabhängig.

2. **Kontext B (Form)** — Wie das Artefakt strukturiert,
   aufgebaut, getönt sein soll. Dieser Kontext ist
   artefakt-abhängig (Fachartikel, Homepage, Buch, Vortrag).

Deine Aufgabe: Extrahiere aus beiden Kontexten strukturierte
Parameter als striktes JSON.

Regeln:
- Antworte NUR mit validem JSON, ohne Markdown, ohne Kommentare.
- Benutze die exakten Feldnamen wie im Schema unten.
- Wenn ein Wert nicht klar ist, nutze den Default und setze
  "sicherheit": "niedrig".
- Wenn ein Wert eindeutig ist, setze "sicherheit": "hoch".
- Erfinde nichts. Was nicht im Text steht, ist null.

Schema:
{
  "inhalt": {
    "these": "Kernthese des Inhalts in 1 Satz",
    "konzepte": ["Liste der Kernkonzepte (Kurznamen)"],
    "fakten": ["Liste der wichtigsten invarianten Fakten"],
    "beispiele": ["Liste der Beispiele (Kurznamen)"],
    "offene_fragen": ["Liste der offenen Fragen"],
    "beschreibung": "eigene Zusammenfassung des Inhalts in 1 Satz",
    "sicherheit": "hoch" | "mittel" | "niedrig"
  },
  "form": {
    "publikum": {
      "typ": "fachpublikum" | "allgemein" | "studenten" | "management" | "experten",
      "fachkenntnisse": 1-5,
      "beschreibung": "eigene Zusammenfassung in 1 Satz",
      "sicherheit": "hoch" | "mittel" | "niedrig"
    },
    "ton": {
      "stil": "sachlich" | "erzaehlend" | "ueberzeugend" | "kritisch" | "einladend" | "inspirierend" | "neutral",
      "person": "ich" | "wir" | "erzaehlend",
      "rhetorische_fragen": true | false | null,
      "satzlaenge": "kurz" | "mittel" | "lang",
      "beschreibung": "eigene Zusammenfassung in 1 Satz",
      "sicherheit": "hoch" | "mittel" | "niedrig"
    },
    "laenge": {
      "komprimierung": "kern" | "dicht" | "voll",
      "ziel_woerter": number | null,
      "sektionen": number | null,
      "beschreibung": "eigene Zusammenfassung in 1 Satz",
      "sicherheit": "hoch" | "mittel" | "niedrig"
    },
    "fokus": {
      "gewichtung": {
        "hook": 1-5,
        "konzept": 1-5,
        "beispiel": 1-5,
        "detail": 1-5,
        "abgrenzung": 1-5,
        "ausblick": 1-5,
        "cta": 1-5,
        "concept": 1-5,
        "task": 1-5,
        "reference": 1-5,
        "absatz": 1-5
      },
      "ausschliesse": ["Liste"],
      "beschreibung": "eigene Zusammenfassung in 1 Satz",
      "sicherheit": "hoch" | "mittel" | "niedrig"
    },
    "zielformat": "markdown" | "html" | "dita-xml" | "pdf" | null,
    "domaene": "fachpublikation" | "website" | "buch" | "vortrag" | null
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

function offlineExtract(inhalt, form) {
  const formLower = form.toLowerCase();
  const inhaltLower = inhalt.toLowerCase();

  // Inhalt-Parameter
  const theseMatch = inhalt.match(/Kernthese[^\n]*\n([^\n]+)/i) ||
                     inhalt.match(/zentrale These[^\n]*\n([^\n]+)/i);
  const konzepte = [];
  const konzeptLines = inhalt.split("\n");
  for (const line of konzeptLines) {
    const m = line.match(/^##\s+(.+)$/);
    if (m) konzepte.push(m[1].trim());
  }

  // Form-Parameter
  let typ = "fachpublikum";
  let fachkenntnisse = 4;
  if (formLower.includes("studenten")) typ = "studenten";
  else if (formLower.includes("management")) typ = "management";
  else if (formLower.includes("allgemein") || formLower.includes("breiter")) typ = "allgemein";

  const fk = form.match(/fachkenntnisse:\s*(\d)\s*\/\s*5/i);
  if (fk) fachkenntnisse = parseInt(fk[1]);

  let stil = "sachlich";
  if (formLower.includes("erzählend") || formLower.includes("erzaehlend")) stil = "erzaehlend";
  else if (formLower.includes("überzeugend") || formLower.includes("ueberzeugend")) stil = "ueberzeugend";
  else if (formLower.includes("kritisch")) stil = "kritisch";
  else if (formLower.includes("einladend")) stil = "einladend";

  let person = "erzaehlend";
  if (formLower.includes("ich-form") || /\bich\b.*\bform\b/i.test(formLower)) person = "ich";
  else if (formLower.includes("wir-form") || /\bwir\b.*\bform\b/i.test(formLower)) person = "wir";

  let rhetorischeFragen = null;
  if (formLower.includes("rhetorische fragen sind erlaubt")) rhetorischeFragen = true;
  else if (formLower.includes("keine rhetorischen fragen")) rhetorischeFragen = false;

  let komprimierung = "dicht";
  if (formLower.includes("kern")) komprimierung = "kern";
  else if (formLower.includes("voll")) komprimierung = "voll";

  const ziel = form.match(/ziel:\s*(\d[\d\s\-]*)\s*wörter/i);
  const ziel2 = form.match(/ziel:\s*(\d+)\s*[-–]\s*(\d+)\s*wörter/i);
  let zielWoerter = null;
  if (ziel2) zielWoerter = parseInt(ziel2[1]);
  else if (ziel) zielWoerter = parseInt(ziel[1]);

  const sektionenMatch = form.match(/(\d+)\s*[-–]?\s*(\d+)?\s*Abschnitte/i) ||
                         form.match(/(\d+)\s*Teile/i);
  let sektionen = null;
  if (sektionenMatch) sektionen = parseInt(sektionenMatch[1]);

  let zielformat = null;
  let domaene = null;
  if (formLower.includes("html")) zielformat = "html";
  if (formLower.includes("markdown") || formLower.includes("fachartikel")) { zielformat = "markdown"; domaene = "fachpublikation"; }
  if (formLower.includes("homepage") || formLower.includes("website")) { zielformat = "html"; domaene = "website"; }

  const gewichtung = {};
  const gw = /(\w+)\s*:\s*Gewicht\s*(\d)/gi;
  let m;
  while ((m = gw.exec(form)) !== null) {
    gewichtung[m[1].toLowerCase()] = parseInt(m[2]);
  }

  const ausschliesse = [];
  const ausMatch = form.match(/Ausschluss:\s*(.+)/i);
  if (ausMatch) ausschliesse.push(ausMatch[1].trim());

  return {
    inhalt: {
      these: theseMatch ? theseMatch[1].trim() : "ISCRIPT verbindet formale Code-Struktur mit freier Sprache und löst Mehrdeutigkeit kontextuell auf.",
      konzepte: konzepte.slice(0, 10),
      fakten: ["ISCRIPT ist JavaScript-abwärtskompatibel", "Zwei Ebenen: Code + Kontext", "Auflösung ist regelbasiert", "Invarianzen schützen Fakten"],
      Beispiele: ["Lebenslauf", "Narration"],
      offene_fragen: ["Wer verantwortet den Kontext?", "Wie viel Struktur im Code?", "Wer definiert Domänengrammatiken?"],
      beschreibung: `Offline-Extraktion: ${konzepte.length} Konzepte`,
      sicherheit: "niedrig"
    },
    form: {
      publikum: {
        typ,
        fachkenntnisse,
        beschreibung: `Offline-Extraktion: ${typ} (${fachkenntnisse}/5)`,
        sicherheit: "niedrig"
      },
      ton: {
        stil,
        person,
        rhetorische_fragen: rhetorischeFragen,
        satzlaenge: "mittel",
        beschreibung: `Offline-Extraktion: ${stil}, ${person}`,
        sicherheit: "niedrig"
      },
      laenge: {
        komprimierung,
        ziel_woerter: zielWoerter,
        sektionen,
        beschreibung: `Offline-Extraktion: ${komprimierung}, ${zielWoerter || "?"} Wörter`,
        sicherheit: "niedrig"
      },
      fokus: {
        gewichtung,
        ausschliesse,
        beschreibung: `Offline-Extraktion: ${Object.entries(gewichtung).map(([k, v]) => `${k}=${v}`).join(", ")}`,
        sicherheit: "niedrig"
      },
      zielformat,
      domaene
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

  const inhaltPath = get("--inhalt");
  const formPath = get("--form");
  const outPath = get("--out") || "out";

  if (!inhaltPath || !formPath) {
    console.error("Nutzung: node resolver/kontext-extrahieren.js --inhalt <inhalt.txt> --form <form.txt> --out <dir>");
    console.error("  --inhalt: Kontext A (Inhalt, artefakt-unabhängig)");
    console.error("  --form:   Kontext B (Form, artefakt-abhängig)");
    process.exit(1);
  }

  const inhalt = readFileSync(pathResolve(inhaltPath), "utf-8");
  const form = readFileSync(pathResolve(formPath), "utf-8");
  mkdirSync(pathResolve(outPath), { recursive: true });

  console.log("ISCRIPT KI-Schicht (Stufe 2): Kontext A + B → Parameter");
  console.log("========================================================");
  console.log(`Kontext A (Inhalt): ${inhaltPath}`);
  console.log(`Kontext B (Form):   ${formPath}`);
  console.log(`Wörter A: ${inhalt.split(/\s+/).filter(Boolean).length}`);
  console.log(`Wörter B: ${form.split(/\s+/).filter(Boolean).length}`);
  console.log("");

  // LLM-Aufruf mit Provider-Chain
  console.log("[1/3] LLM-Aufruf (Provider-Chain: Mistral → Kimi → Claude) ...");
  const userPrompt = `Hier sind die beiden Kontexte des Autors:

=== KONTTEXT A (INHALT) ===
${inhalt}

=== KONTTEXT B (FORM) ===
${form}

Extrahiere die Parameter gemäß Schema.`;

  let rawOutput, params, providerUsed;
  try {
    const result = await callLLM(SYSTEM_PROMPT, userPrompt);
    rawOutput = result.text;
    providerUsed = result.providerName;
  } catch (err) {
    console.error(`      ✗ LLM-Fehler: ${err.message}`);
    console.log("");
    console.log("      → Kein LLM verfügbar. Weiche auf Offline-Extraktion aus.");
    console.log("        (Nur für Testen — in Produktion muss ein LLM-Provider verfügbar sein.)");
    params = offlineExtract(inhalt, form);
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
  if (!params.inhalt) {
    console.error("      ✗ Fehlt: inhalt");
    process.exit(1);
  }
  if (!params.form) {
    console.error("      ✗ Fehlt: form");
    process.exit(1);
  }
  for (const r of ["publikum", "ton", "laenge", "fokus"]) {
    if (!params.form[r]) {
      console.error(`      ✗ Fehlt: form.${r}`);
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
    `**Kontext A (Inhalt):** ${inhaltPath}`,
    `**Kontext B (Form):** ${formPath}`,
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
    `- Inhalt: ${params.inhalt.sicherheit || "n/a"}`,
    `- Form/Publikum: ${params.form.publikum.sicherheit || "n/a"}`,
    `- Form/Ton: ${params.form.ton.sicherheit || "n/a"}`,
    `- Form/Länge: ${params.form.laenge.sicherheit || "n/a"}`,
    `- Form/Fokus: ${params.form.fokus.sicherheit || "n/a"}`,
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
  console.log(`    Inhalt: ${params.inhalt.beschreibung} — ${params.inhalt.sicherheit}`);
  console.log(`    Form:   ${params.form.publikum.typ} (${params.form.publikum.fachkenntnisse}/5) — ${params.form.publikum.sicherheit}`);
  console.log(`    Ton:    ${params.form.ton.stil}, Person: ${params.form.ton.person} — ${params.form.ton.sicherheit}`);
  console.log(`    Länge:  ${params.form.laenge.komprimierung}, ${params.form.laenge.ziel_woerter || "?"} Wörter — ${params.form.laenge.sicherheit}`);
  const gw = Object.entries(params.form.fokus.gewichtung || {});
  if (gw.length) console.log(`    Fokus:  ${gw.map(([k, v]) => `${k}=${v}`).join(", ")} — ${params.form.fokus.sicherheit}`);
  if (params.form.zielformat) console.log(`    Zielformat: ${params.form.zielformat}`);
  if (params.form.domaene) console.log(`    Domäne:   ${params.form.domaene}`);
  console.log("");
  console.log("Fertig. Der Resolver (Stufe 3) kann jetzt mit parameter.json arbeiten.");
}

main().catch(err => {
  console.error("Fehler:", err.message);
  process.exit(1);
});
