#!/usr/bin/env node
// ============================================================
// ISCRIPT Resolver — regelbasiert, nachvollziehbar
// Code (.isc) + Kontext (.txt) → Artikel (Markdown)
//
// Aufruf:
//   node resolver/resolve.js \
//     --code artikel/iscrypt.isc \
//     --kontext artikel/kontexte/fachartikel.txt \
//     --out out/
// ============================================================

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve as pathResolve } from "node:path";

// ============================================================
// PARSER
// ============================================================

function parseIsc(source) {
  const ast = {
    spar: {},
    artikel: { titel: null, thes: null, teile: [] },
    _blocks: []
  };

  const lines = source.split("\n").map(l => l.trim());

  let i = 0;
  let section = null; // "spar" | "artikel"
  let currentTeil = null;
  let inContext = false;
  let contextBuffer = [];
  let contextKey = "";
  let sparSub = null;

  while (i < lines.length) {
    const line = lines[i];
    i++;

    // Skip empty lines
    if (!line) continue;

    // Context block content (inside ?{...})
    if (inContext) {
      if (line === "}" || line === "},") {
        ast._blocks.push({ key: contextKey, content: contextBuffer.join("\n").trim() });
        inContext = false;
        contextBuffer = [];
        continue;
      }
      contextBuffer.push(line);
      continue;
    }

    // Sektion: spar
    if (line === "spar {") {
      section = "spar";
      continue;
    }

    // Sektion: artikel
    if (line === "artikel {") {
      section = "artikel";
      continue;
    }

    // Spar parsing
    if (section === "spar") {
      const subMatch = line.match(/^(\w+)\s*\{\s*$/);
      if (subMatch) {
        sparSub = subMatch[1];
        ast.spar[sparSub] = {};
        continue;
      }
      if (line === "}" || line === "},") {
        if (sparSub) sparSub = null;
        else section = null;
        continue;
      }
      const pairMatch = line.match(/^(\w+)\s*:\s*(.+),?\s*$/);
      if (pairMatch && sparSub) {
        const key = pairMatch[1];
        let val = pairMatch[2].trim().replace(/,$/, "");
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        ast.spar[sparSub][key] = val;
      }
      continue;
    }

    // Artikel parsing
    if (section !== "artikel") continue;

    // Titel
    const titelMatch = line.match(/^titel\s*:\s*(.+),?\s*$/);
    if (titelMatch) {
      let val = titelMatch[1].trim().replace(/,$/, "");
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      ast.artikel.titel = val;
      continue;
    }

    // These
    const theseMatch = line.match(/^these\s*:\s*(.+),?\s*$/);
    if (theseMatch) {
      let val = theseMatch[1].trim().replace(/,$/, "");
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      ast.artikel.thes = val;
      continue;
    }

    // Neue Teil
    const conceptMatch = line.match(/^concept\s*\{\s*$/);
    if (conceptMatch) {
      currentTeil = { typ: "concept", name: null, definition: null };
      continue;
    }
    const taskMatch = line.match(/^task\s*\{\s*$/);
    if (taskMatch) {
      currentTeil = { typ: "task", name: null, vorraussetzung: null, schritte: [] };
      continue;
    }
    const refMatch = line.match(/^reference\s*\{\s*$/);
    if (refMatch) {
      currentTeil = { typ: "reference", name: null, eintraege: [] };
      continue;
    }
    const absMatch = line.match(/^absatz\s*\{\s*$/);
    if (absMatch) {
      currentTeil = { typ: "absatz", inhalt: null };
      continue;
    }

    // Context block start: key: ?{
    const ctxMatch = line.match(/^(\w+)\s*:\s*\?\{\s*$/);
    if (ctxMatch && currentTeil) {
      inContext = true;
      contextKey = ctxMatch[1];
      contextBuffer = [];
      continue;
    }

    // Teil-Ende
    if (line === "}" || line === "},") {
      if (currentTeil) {
        ast.artikel.teile.push(currentTeil);
        currentTeil = null;
      }
      continue;
    }

    // Key-Value in Teil
    if (!currentTeil) continue;
    const kvMatch = line.match(/^(\w+)\s*:\s*(.+),?\s*$/);
    if (!kvMatch) continue;
    const key = kvMatch[1];
    let val = kvMatch[2].trim().replace(/,$/, "");
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);

    if (key === "name") currentTeil.name = val;
    else if (key === "definition") currentTeil.definition = val;
    else if (key === "inhalt") currentTeil.inhalt = val;
    else if (key === "vorraussetzung") currentTeil.vorraussetzung = val || null;
    else if (key === "schritte") {
      // Multi-line array: collect until ]
      let arrStr = val;
      let depth = 1;
      while (depth > 0 && i < lines.length) {
        const next = lines[i];
        for (const ch of next) { if (ch === "[") depth++; if (ch === "]") depth--; }
        arrStr += "\n" + next;
        i++;
        if (depth <= 0) break;
      }
      // Parse steps
      const steps = [];
      const stepPattern = /\{\s*anleitung\s*:\s*"([^"]*)"\s*,\s*ergebnis\s*:\s*"([^"]*)"\s*\}/g;
      let m;
      while ((m = stepPattern.exec(arrStr)) !== null) {
        steps.push({ anleitung: m[1], ergebnis: m[2] });
      }
      if (steps.length === 0) {
        const stepPattern2 = /\{\s*anleitung\s*:\s*"([^"]*)"\s*\}/g;
        while ((m = stepPattern2.exec(arrStr)) !== null) {
          steps.push({ anleitung: m[1], ergebnis: null });
        }
      }
      currentTeil.schritte = steps;
    }
    else if (key === "eintraege") {
      // Multi-line array: collect until ]
      let arrStr = val;
      let depth = 1;
      while (depth > 0 && i < lines.length) {
        const next = lines[i];
        for (const ch of next) { if (ch === "[") depth++; if (ch === "]") depth--; }
        arrStr += "\n" + next;
        i++;
        if (depth <= 0) break;
      }
      const entries = [];
      const entryPattern = /\{\s*schluessel\s*:\s*"([^"]*)"\s*,\s*wert\s*:\s*"([^"]*)"\s*,\s*einheit\s*:\s*"([^"]*)"\s*\}/g;
      while ((m = entryPattern.exec(arrStr)) !== null) {
        entries.push({ schluessel: m[1], wert: m[2], einheit: m[3] });
      }
      currentTeil.eintraege = entries;
    }
  }

  return ast;
}

// ============================================================
// KONTTEXT-EXTRAKTION
// ============================================================

function extractKontext(prosa) {
  const params = {
    publikum: { typ: "fachpublikum", fachkenntnisse: 4 },
    ton: { stil: "sachlich", person: "erzaehlend" },
    laenge: { komprimierung: "dicht", ziel: null },
    fokus: { gewichtung: {}, ausschliesse: null }
  };
  const lower = prosa.toLowerCase();

  if (lower.includes("studenten")) params.publikum.typ = "studenten";
  else if (lower.includes("management")) params.publikum.typ = "management";
  else if (lower.includes("allgemein")) params.publikum.typ = "allgemein";

  const fk = prosa.match(/fachkenntnisse:\s*(\d)\s*\/\s*5/i);
  if (fk) params.publikum.fachkenntnisse = parseInt(fk[1]);

  if (lower.includes("erzählend") || lower.includes("erzaehlend")) params.ton.stil = "erzaehlend";
  else if (lower.includes("überzeugend") || lower.includes("ueberzeugend")) params.ton.stil = "ueberzeugend";
  else if (lower.includes("kritisch")) params.ton.stil = "kritisch";
  else params.ton.stil = "sachlich";

  if (lower.includes("ich-form") || /\bich\b.*\bform\b/i.test(lower)) params.ton.person = "ich";
  else if (lower.includes("wir-form") || /\bwir\b.*\bform\b/i.test(lower)) params.ton.person = "wir";
  else params.ton.person = "erzaehlend";

  if (lower.includes("kern")) params.laenge.komprimierung = "kern";
  else if (lower.includes("dicht")) params.laenge.komprimierung = "dicht";
  else params.laenge.komprimierung = "voll";

  const ziel = prosa.match(/ziel:\s*(\d[\d\s]*)\s*wörter/i);
  if (ziel) params.laenge.ziel = ziel[1].trim();

  const gw = /(\w+)\s*:\s*Gewicht\s*(\d)/gi;
  let m;
  while ((m = gw.exec(prosa)) !== null) {
    params.fokus.gewichtung[m[1].toLowerCase()] = parseInt(m[2]);
  }

  const aus = prosa.match(/Ausschluss:\s*(.+)/i);
  if (aus) params.fokus.ausschliesse = aus[1].trim();

  return params;
}

// ============================================================
// INvarianzprüfung
// ============================================================

function checkInvarianzen(kontextParams) {
  const verletzungen = [];
  const ok = ["publikum", "ton", "laenge", "fokus"];
  for (const k of Object.keys(kontextParams)) {
    if (!ok.includes(k)) verletzungen.push({ feld: k });
  }
  return { ok: verletzungen.length === 0, verletzungen };
}

// ============================================================
// AUFLÖSUNG: ?{}-Blöcke
// ============================================================

function resolveBlock(block, kontextParams) {
  const { komprimierung } = kontextParams.laenge;

  const lines = block.content
    .split("\n")
    .map(l => l.trim().replace(/^\/\//, "").trim())
    .filter(l => l.length > 0);

  if (lines.length === 0) return null;

  let text = lines.join(" ");

  if (komprimierung === "kern") {
    const sentences = text.match(/[^.!?]+[.!?]+/g);
    if (sentences && sentences.length > 0) {
      text = sentences.slice(0, 2).join(" ").trim();
      if (text.length > 400) text = text.slice(0, 400) + "…";
    }
  }
  return text;
}

// ============================================================
// MARKDOWN
// ============================================================

function toMarkdown(ast, kontextParams, resolvedBlocks) {
  const md = [];
  const a = ast.artikel;

  if (a.titel) { md.push(`# ${a.titel}`); md.push(""); }
  if (a.thes) { md.push(`> ${a.thes}`); md.push(""); }

  const spar = ast.spar;
  if (spar.autor || spar.publikation) {
    md.push("---"); md.push("");
    if (spar.autor?.name) md.push(`**Autor:** ${spar.autor.name}${spar.autor.organisation ? ", " + spar.autor.organisation : ""}`);
    if (spar.publikation?.zeitraum?.von) md.push(`**Datum:** ${spar.publikation.zeitraum.von}`);
    if (spar.publikation?.ort) md.push(`**Ort:** ${spar.publikation.ort}`);
    if (spar.werk?.zitation?.format) md.push(`**Zitation:** ${spar.werk.zitation.format}`);
    md.push(""); md.push("---"); md.push("");
  }

  let bi = 0;
  for (const t of a.teile) {
    const resolved = resolvedBlocks[bi] || null;
    bi++;

    if (t.typ === "concept") {
      md.push(`## ${t.name || "Konzept"}`); md.push("");
      if (t.definition) { md.push(t.definition); md.push(""); }
      if (resolved) { md.push(resolved); md.push(""); }
    } else if (t.typ === "task") {
      md.push(`## ${t.name || "Aufgabe"}`); md.push("");
      if (t.vorraussetzung) { md.push(`**Voraussetzung:** ${t.vorraussetzung}`); md.push(""); }
      if (t.schritte?.length > 0) {
        md.push("### Schritte"); md.push("");
        for (const [i, s] of t.schritte.entries()) {
          md.push(`${i + 1}. **${s.anleitung}**`);
          if (s.ergebnis) md.push(`   → *${s.ergebnis}*`);
          md.push("");
        }
      }
      if (resolved) { md.push("**Hinweise:**"); md.push(""); md.push(resolved); md.push(""); }
    } else if (t.typ === "reference") {
      md.push(`## ${t.name || "Referenz"}`); md.push("");
      if (t.eintraege?.length > 0) {
        md.push("| Schlüssel | Wert | Einheit |"); md.push("|---|---|---|");
        for (const e of t.eintraege) md.push(`| \`${e.schluessel}\` | ${e.wert} | ${e.einheit} |`);
        md.push("");
      }
      if (resolved) { md.push(resolved); md.push(""); }
    } else if (t.typ === "absatz") {
      if (t.inhalt) { md.push(t.inhalt); md.push(""); }
      if (resolved) { md.push(resolved); md.push(""); }
    }
  }
  return md.join("\n");
}

// ============================================================
// MAIN
// ============================================================

function main() {
  const args = process.argv.slice(2);
  const get = f => { const i = args.indexOf(f); return i !== -1 && i + 1 < args.length ? args[i + 1] : null; };

  const codePath = get("--code");
  const kontextPath = get("--kontext");
  const outPath = get("--out") || "out";

  if (!codePath || !kontextPath) {
    console.error("Nutzung: node resolver/resolve.js --code <.isc> --kontext <.txt> --out <dir>");
    process.exit(1);
  }

  const code = readFileSync(pathResolve(codePath), "utf-8");
  const kontext = readFileSync(pathResolve(kontextPath), "utf-8");

  console.log("ISCRIPT Resolver — Code + Kontext → Artikel");
  console.log("============================================");

  console.log("[1/5] Code parsen ...");
  const ast = parseIsc(code);
  console.log(`      → Titel: ${ast.artikel.titel || "(keiner)"}`);
  console.log(`      → ${ast.artikel.teile.length} Teile:`);
  for (const t of ast.artikel.teile) console.log(`        • ${t.typ}: ${t.name || "(unnamed)"}`);
  console.log(`      → ${ast._blocks.length} ?{}-Blöcke`);
  console.log(`      → SPAR: autor=${ast.spar.autor?.name || "?"}`);

  console.log("[2/5] Kontext extrahieren ...");
  const kp = extractKontext(kontext);
  console.log(`      → Publikum: ${kp.publikum.typ} (${kp.publikum.fachkenntnisse}/5)`);
  console.log(`      → Ton: ${kp.ton.stil}, Person: ${kp.ton.person}`);
  console.log(`      → Komprimierung: ${kp.laenge.komprimierung}`);
  const gw = Object.entries(kp.fokus.gewichtung);
  if (gw.length) console.log(`      → Fokus: ${gw.map(([k, v]) => `${k}=${v}`).join(", ")}`);

  console.log("[3/5] Invarianzprüfung ...");
  const inv = checkInvarianzen(kp);
  if (!inv.ok) {
    console.error("      ✗ Verletzt: " + inv.verletzungen.map(v => v.feld).join(", "));
    process.exit(1);
  }
  console.log("      ✓ OK");

  console.log("[4/5] ?{}-Blöcke auflösen ...");
  const resolved = ast._blocks.map(b => resolveBlock(b, kp));
  const ok = resolved.filter(Boolean).length;
  console.log(`      → ${ok}/${ast._blocks.length} aufgelöst`);

  console.log("[5/5] Markdown generieren ...");
  const md = toMarkdown(ast, kp, resolved);
  mkdirSync(pathResolve(outPath), { recursive: true });
  const out = join(pathResolve(outPath), "artikel.md");
  writeFileSync(out, md, "utf-8");
  const words = md.split(/\s+/).filter(Boolean).length;
  console.log(`      → ${out} (${words} Wörter)`);
  console.log("");
  console.log("Fertig.");
}

main();
