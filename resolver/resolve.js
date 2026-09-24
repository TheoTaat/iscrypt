// ============================================================
// ISCRIPT Resolver (Stufe 3) — regelbasiert, nachvollziehbar
// Parameter (.json) + Code (.isc) → Artikel (Markdown)
//
// Ebene 4: Das Artefakt wird in zwei Schichten geteilt:
//   - artikel.generiert.md   → wird bei jedem Lauf überschrieben
//   - artikel.ueberarbeitet.md → bleibt erhalten (menschliche Überarbeitung)
//   - artikel.diff.md        → was hat sich geändert?
//
// Aufruf:
//   node resolver/resolve.js \
//     --code artikel/iscrypt.isc \
//     --parameter out/parameter.json \
//     --out out/
// ============================================================

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
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
// DIFF-MEKANISMUS: neue Generierung vs. bestehende Überarbeitung
// ============================================================

function generateDiff(generated, edited) {
  if (generated === edited) {
    return [
      "# Diff: neue Generierung vs. bestehende Überarbeitung",
      "",
      "**Keine Unterschiede.**",
      "Die generierte Ausgabe stimmt mit der bestehenden Überarbeitung überein.",
      ""
    ].join("\n");
  }
  
  const genLines = generated.split("\n");
  const editLines = edited.split("\n");
  
  // Einfacher Linien-Diff (sufficient für Prototyp)
  const added = [];
  const removed = [];
  const unchanged = [];
  
  // Naiver Vergleich: Zeilen, die in generated sind aber nicht in edited
  for (const line of genLines) {
    if (!editLines.includes(line)) {
      added.push(line);
    } else {
      unchanged.push(line);
    }
  }
  
  // Zeilen, die in edited sind aber nicht in generated
  for (const line of editLines) {
    if (!genLines.includes(line)) {
      removed.push(line);
    }
  }
  
  const diff = [
    "# Diff: neue Generierung vs. bestehende Überarbeitung",
    "",
    "**Die generierte Ausgabe hat sich geändert.**",
    "Die bestehende Überarbeitung (artikel.ueberarbeitet.md) bleibt erhalten.",
    "Der Mensch entscheidet, ob er die neue Generierung übernimmt oder seine Überarbeitung behält.",
    "",
    "## Geändert (in der neuen Generierung, nicht in der Überarbeitung)",
    "",
  ];
  
  if (added.length === 0) {
    diff.push("(keine neuen Zeilen)", "");
  } else {
    diff.push("```markdown");
    diff.push(added.join("\n"));
    diff.push("```", "");
  }
  
  diff.push("## Entfernt (in der Überarbeitung, nicht in der neuen Generierung)", "");
  
  if (removed.length === 0) {
    diff.push("(keine entfernten Zeilen)", "");
  } else {
    diff.push("```markdown");
    diff.push(removed.join("\n"));
    diff.push("```", "");
  }
  
  diff.push("## Aktion",
    "");
  diff.push("Entscheidung: ",
    "- **Übernehmen:** Die neue Generierung ist besser → `artikel.generiert.md` in `artikel.ueberarbeitet.md` kopieren");
  diff.push("- **Behalten:** Die bestehende Überarbeitung ist besser → `artikel.ueberarbeitet.md` bleibt so");
  diff.push("- **Mischen:** Manuell auswählen, was aus der neuen Generierung übernommen wird");
  
  return diff.join("\n");
}

// ============================================================
// MAIN
// ============================================================

function main() {
  const args = process.argv.slice(2);
  const get = f => { const i = args.indexOf(f); return i !== -1 && i + 1 < args.length ? args[i + 1] : null; };

  const codePath = get("--code");
  const parameterPath = get("--parameter"); // Neu: parameter.json aus Stufe 2
  const outPath = get("--out") || "out";

  if (!codePath || !parameterPath) {
    console.error("Nutzung: node resolver/resolve.js --code <.isc> --parameter <parameter.json> --out <dir>");
    console.error("  parameter.json wird von resolver/kontext-extrahieren.js erzeugt.");
    process.exit(1);
  }

  const code = readFileSync(pathResolve(codePath), "utf-8");
  const kontextParams = JSON.parse(readFileSync(pathResolve(parameterPath), "utf-8"));

  console.log("ISCRIPT Resolver (Stufe 3) — Parameter + Code → Artikel");
  console.log("============================================");
  console.log(`Parameter: ${pathResolve(parameterPath)}`);

  console.log("[1/5] Code parsen ...");
  const ast = parseIsc(code);
  console.log(`      → Titel: ${ast.artikel.titel || "(keiner)"}`);
  console.log(`      → ${ast.artikel.teile.length} Teile:`);
  for (const t of ast.artikel.teile) console.log(`        • ${t.typ}: ${t.name || "(unnamed)"}`);
  console.log(`      → ${ast._blocks.length} ?{}-Blöcke`);
  console.log(`      → SPAR: autor=${ast.spar.autor?.name || "?"}`);

  console.log("[2/5] Parameter laden (aus Stufe 2) ...");
  console.log(`      → Publikum: ${kontextParams.publikum.typ} (${kontextParams.publikum.fachkenntnisse}/5) — ${kontextParams.publikum.sicherheit}`);
  console.log(`      → Ton: ${kontextParams.ton.stil}, Person: ${kontextParams.ton.person} — ${kontextParams.ton.sicherheit}`);
  console.log(`      → Komprimierung: ${kontextParams.laenge.komprimierung} — ${kontextParams.laenge.sicherheit}`);
  const gw = Object.entries(kontextParams.fokus.gewichtung || {});
  if (gw.length) console.log(`      → Fokus: ${gw.map(([k, v]) => `${k}=${v}`).join(", ")} — ${kontextParams.fokus.sicherheit}`);

  console.log("[3/5] Invarianzprüfung ...");
  const inv = checkInvarianzen(kontextParams);
  if (!inv.ok) {
    console.error("      ✗ Verletzt: " + inv.verletzungen.map(v => v.feld).join(", "));
    process.exit(1);
  }
  console.log("      ✓ OK");

  console.log("[4/5] ?{}-Blöcke auflösen ...");
  const resolved = ast._blocks.map(b => resolveBlock(b, kontextParams));
  const ok = resolved.filter(Boolean).length;
  console.log(`      → ${ok}/${ast._blocks.length} aufgelöst`);

  console.log("[5/5] Markdown generieren ...");
  const md = toMarkdown(ast, kontextParams, resolved);
  mkdirSync(pathResolve(outPath), { recursive: true });
  
  // Ebene 4: Artefakt in zwei Schichten teilen
  const generatedPath = join(pathResolve(outPath), "artikel.generiert.md");
  const editedPath = join(pathResolve(outPath), "artikel.ueberarbeitet.md");
  
  // Generierte Schicht: wird bei jedem Lauf überschrieben
  writeFileSync(generatedPath, md, "utf-8");
  
  // Überarbeitete Schicht: bleibt erhalten, wenn sie existiert
  let editedMd = md; // Default: wenn keine Überarbeitung existiert, übernehmen wir die Generierung
  if (existsSync(editedPath)) {
    editedMd = readFileSync(editedPath, "utf-8");
    console.log("      → Bestehende Überarbeitung gefunden: artikel.ueberarbeitet.md");
    console.log("      → Diff wird erzeugt (neue Generierung vs. bestehende Überarbeitung)");
  } else {
    console.log("      → Keine bestehende Überarbeitung — artikel.ueberarbeitet.md wird initialisiert");
  }
  writeFileSync(editedPath, editedMd, "utf-8");
  
  // Diff-Mechanismus: was hat sich zwischen Generierung und Überarbeitung geändert?
  const diffPath = join(pathResolve(outPath), "artikel.diff.md");
  const diff = generateDiff(md, editedMd);
  writeFileSync(diffPath, diff, "utf-8");
  
  const words = md.split(/\s+/).filter(Boolean).length;
  console.log(`      → ${generatedPath} (${words} Wörter)`);
  console.log(`      → ${editedPath} (bleibt erhalten)`);
  console.log(`      → ${diffPath} (was hat sich geändert?)`);
  console.log("");
  console.log("Fertig. Der Mensch entscheidet, ob er die neue Generierung übernimmt");
  console.log("oder seine Überarbeitung behält.");
}

main();
