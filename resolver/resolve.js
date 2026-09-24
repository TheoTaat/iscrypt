// ============================================================
// ISCRIPT Resolver (Stufe 3) — regelbasiert, nachvollziehbar
// Domänenneutraler Code + Parameter (Kontext A + B) + Domänen-
// grammatik → Artefakt im Zielformat
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
//     --domaene fachpublikation \
//     --out out/
// ============================================================

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve as pathResolve } from "node:path";

// ============================================================
// PARSER: Domänenneutraler Code
// ============================================================

function parseIsc(source) {
  const ast = {
    meta: {},
    eintraege: [],
    _blocks: []
  };

  const lines = source.split("\n").map(l => l.trim());

  let i = 0;
  let section = null; // "meta" | "inhalte"
  let currentBlock = null;
  let inContext = false;
  let contextBuffer = [];
  let contextKey = "";
  let inEintraege = false;
  let eintraegeBuffer = [];

  while (i < lines.length) {
    const line = lines[i];
    i++;

    // Context block content (inside ?{...}) — including comments
    if (inContext) {
      if (line === "}" || line === "},") {
        ast._blocks.push({ key: contextKey, content: contextBuffer.join("\n").trim() });
        inContext = false;
        contextBuffer = [];
        continue;
      }
      if (line) contextBuffer.push(line);
      continue;
    }

    // Skip empty lines and comments (outside context blocks)
    if (!line || line.startsWith("//")) continue;

    // Eintraege array content
    if (inEintraege) {
      if (line === "]" || line === "],") {
        inEintraege = false;
        if (currentBlock) {
          currentBlock.eintraege = eintraegeBuffer;
        }
        eintraegeBuffer = [];
        continue;
      }
      const entryMatch = line.match(/\{\s*schluessel\s*:\s*"([^"]*)"\s*,\s*wert\s*:\s*"([^"]*)"\s*,\s*einheit\s*:\s*"([^"]*)"\s*\}/);
      if (entryMatch) {
        eintraegeBuffer.push({
          schluessel: entryMatch[1],
          wert: entryMatch[2],
          einheit: entryMatch[3]
        });
      }
      continue;
    }

    // Sektion: meta
    if (line === "meta {") {
      section = "meta";
      continue;
    }

    // Sektion: inhalt
    if (line === "inhalte [") {
      section = "inhalte";
      continue;
    }

    // Meta parsing
    if (section === "meta") {
      if (line === "}" || line === "},") {
        section = null;
        continue;
      }
      const pairMatch = line.match(/^(\w+)\s*:\s*(.+),?\s*$/);
      if (pairMatch) {
        const key = pairMatch[1];
        let val = pairMatch[2].trim().replace(/,$/, "");
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        ast.meta[key] = val;
      }
      continue;
    }

    // Inhalt parsing
    if (section !== "inhalte") continue;

    // Neue Block
    const blockStart = line.match(/^\{\s*$/);
    if (blockStart) {
      currentBlock = { id: null, fakten: null, kontext: null, eintraege: [] };
      ast.eintraege.push(currentBlock);
      continue;
    }

    // Context block start: key: ?{
    const ctxMatch = line.match(/^(\w+)\s*:\s*\?\{\s*$/);
    if (ctxMatch && currentBlock) {
      inContext = true;
      contextKey = ctxMatch[1];
      contextBuffer = [];
      continue;
    }

    // Eintraege array start
    const eintraegeStart = line.match(/^eintraege\s*\[\s*$/);
    if (eintraegeStart && currentBlock) {
      inEintraege = true;
      eintraegeBuffer = [];
      continue;
    }

    // Block-Ende
    if (line === "}" || line === "},") {
      if (currentBlock) {
        currentBlock = null;
      }
      continue;
    }

    // Array-Ende
    if (line === "]" || line === "],") {
      section = null;
      continue;
    }

    // Key-Value in Block
    if (!currentBlock) continue;
    const kvMatch = line.match(/^(\w+)\s*:\s*(.+),?\s*$/);
    if (!kvMatch) continue;
    const key = kvMatch[1];
    let val = kvMatch[2].trim().replace(/,$/, "");
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);

    if (key === "id") currentBlock.id = val;
    else if (key === "fakten") currentBlock.fakten = val;
    else if (key === "kontext" && val === "?{") {
      // Handled by ctxMatch above
    }
  }

  return ast;
}

// ============================================================
// KONTTEXT-EXTRAKTION (Offline-Fallback für Stufe 3)
// ============================================================

function extractKontext(params) {
  // params kommt jetzt aus Stufe 2 (parameter.json)
  // Wenn nicht vorhanden, Offline-Extraktion
  if (params.form && params.inhalt) {
    return params;
  }
  // Fallback: leere Parameter
  return {
    inhalt: { these: null, konzepte: [], fakten: [], Beispiele: [], offene_fragen: [], beschreibung: null, sicherheit: "niedrig" },
    form: {
      publikum: { typ: "fachpublikum", fachkenntnisse: 4, beschreibung: null, sicherheit: "niedrig" },
      ton: { stil: "sachlich", person: "erzaehlend", rhetorische_fragen: null, satzlaenge: "mittel", beschreibung: null, sicherheit: "niedrig" },
      laenge: { komprimierung: "dicht", ziel_woerter: null, sektionen: null, beschreibung: null, sicherheit: "niedrig" },
      fokus: { gewichtung: {}, ausschliesse: [], beschreibung: null, sicherheit: "niedrig" },
      zielformat: "markdown",
      domaene: "fachpublikation"
    }
  };
}

// ============================================================
// INvarianzprüfung
// ============================================================

function checkInvarianzen(params) {
  const verletzungen = [];
  const okKeys = ["inhalt", "form"];
  for (const k of Object.keys(params)) {
    if (!okKeys.includes(k)) verletzungen.push({ feld: k });
  }
  return { ok: verletzungen.length === 0, verletzungen };
}

// ============================================================
// AUFLÖSUNG: ?{}-Blöcke
// ============================================================

function resolveBlock(block, params) {
  const { komprimierung } = params.form.laenge;

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
// MARKDOWN (Fachpublikation)
// ============================================================

function toMarkdown(ast, params, resolvedBlocks) {
  const md = [];
  const meta = ast.meta;

  if (meta.titel) { md.push(`# ${meta.titel}`); md.push(""); }
  if (meta.untertitel) { md.push(`> ${meta.untertitel}`); md.push(""); }

  if (meta.autor || meta.organisation) {
    md.push("---"); md.push("");
    if (meta.autor) md.push(`**Autor:** ${meta.autor}${meta.organisation ? ", " + meta.organisation : ""}`);
    if (meta.ort) md.push(`**Ort:** ${meta.ort}`);
    if (meta.zitation) md.push(`**Zitation:** ${meta.zitation}`);
    md.push(""); md.push("---"); md.push("");
  }

  let bi = 0;
  for (const block of ast.eintraege) {
    const resolved = resolvedBlocks[bi] || null;
    bi++;

    md.push(`## ${block.id || "Abschnitt"}`); md.push("");
    if (block.fakten) { md.push(block.fakten); md.push(""); }
    if (block.eintraege?.length > 0) {
      md.push("| Schlüssel | Wert | Einheit |"); md.push("|---|---|---|");
      for (const e of block.eintraege) md.push(`| \`${e.schluessel}\` | ${e.wert} | ${e.einheit} |`);
      md.push("");
    }
    if (resolved) { md.push(resolved); md.push(""); }
  }
  return md.join("\n");
}

// ============================================================
// HTML (Website)
// ============================================================

function toHTML(ast, params, resolvedBlocks) {
  const meta = ast.meta;
  const html = [];

  html.push("<!DOCTYPE html>");
  html.push("<html lang=\"de\">");
  html.push("<head>");
  html.push(`  <meta charset="UTF-8">`);
  html.push(`  <meta name="viewport" content="width=device-width, initial-scale=1.0">`);
  html.push(`  <title>${meta.titel || "ISCRIPT"}</title>`);
  html.push(`  <meta name="description" content="${meta.untertitel || ""}">`);
  html.push(`  <meta name="author" content="${meta.autor || ""}">`);
  html.push(`  <style>`);
  html.push(`    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; color: #333; }`);
  html.push(`    h1 { font-size: 2rem; margin-bottom: 0.5rem; }`);
  html.push(`    h2 { font-size: 1.4rem; margin-top: 2rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }`);
  html.push(`    .meta { color: #666; font-size: 0.9rem; margin-bottom: 2rem; }`);
  html.push(`    .cta a { display: inline-block; padding: 0.75rem 1.5rem; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 1rem; }`);
  html.push(`    .cta a:hover { background: #1d4ed8; }`);
  html.push(`    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }`);
  html.push(`    th, td { padding: 0.5rem; border: 1px solid #ddd; text-align: left; }`);
  html.push(`    th { background: #f5f5f5; }`);
  html.push(`  </style>`);
  html.push("</head>");
  html.push("<body>");

  if (meta.titel) html.push(`  <h1>${meta.titel}</h1>`);
  if (meta.untertitel) html.push(`  <p class="meta">${meta.untertitel}</p>`);

  if (meta.autor || meta.ort) {
    html.push(`  <div class="meta">`);
    if (meta.autor) html.push(`    <span>${meta.autor}${meta.organisation ? ", " + meta.organisation : ""}</span>`);
    if (meta.ort) html.push(`    <span> · ${meta.ort}</span>`);
    html.push(`  </div>`);
  }

  let bi = 0;
  for (const block of ast.eintraege) {
    const resolved = resolvedBlocks[bi] || null;
    bi++;

    const id = block.id || "abschnitt";
    html.push(`  <section class="${id}">`);
    html.push(`    <h2>${id}</h2>`);
    if (block.fakten) html.push(`    <p>${block.fakten}</p>`);
    if (block.eintraege?.length > 0) {
      html.push(`    <table>`);
      html.push(`      <thead><tr><th>Schlüssel</th><th>Wert</th><th>Einheit</th></tr></thead>`);
      html.push(`      <tbody>`);
      for (const e of block.eintraege) {
        html.push(`        <tr><td><code>${e.schluessel}</code></td><td>${e.wert}</td><td>${e.einheit}</td></tr>`);
      }
      html.push(`      </tbody>`);
      html.push(`    </table>`);
    }
    if (resolved) html.push(`    <p>${resolved}</p>`);
    html.push(`  </section>`);
  }

  html.push("</body>");
  html.push("</html>");
  return html.join("\n");
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

  const added = [];
  const removed = [];

  for (const line of genLines) {
    if (!editLines.includes(line)) {
      added.push(line);
    }
  }

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
    "",
    "Entscheidung: ",
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
  const parameterPath = get("--parameter");
  const domaene = get("--domaene") || "fachpublikation";
  const outPath = get("--out") || "out";

  if (!codePath || !parameterPath) {
    console.error("Nutzung: node resolver/resolve.js --code <.isc> --parameter <parameter.json> --domaene <name> --out <dir>");
    console.error("  --domaene: fachpublikation | website");
    process.exit(1);
  }

  const code = readFileSync(pathResolve(codePath), "utf-8");
  const params = JSON.parse(readFileSync(pathResolve(parameterPath), "utf-8"));

  console.log("ISCRIPT Resolver (Stufe 3) — Parameter + Code → Artikel");
  console.log("============================================");
  console.log(`Code:      ${pathResolve(codePath)}`);
  console.log(`Parameter: ${pathResolve(parameterPath)}`);
  console.log(`Domäne:    ${domaene}`);
  console.log("");

  console.log("[1/5] Code parsen ...");
  const ast = parseIsc(code);
  console.log(`      → Titel: ${ast.meta.titel || "(keiner)"}`);
  console.log(`      → ${ast.eintraege.length} Blöcke:`);
  for (const b of ast.eintraege) console.log(`        • ${b.id || "(unnamed)"}`);
  console.log(`      → ${ast._blocks.length} ?{}-Blöcke`);
  console.log(`      → Meta: autor=${ast.meta.autor || "?"}`);

  console.log("[2/5] Parameter laden (aus Stufe 2) ...");
  console.log(`      → Inhalt: ${params.inhalt?.beschreibung || "?"} — ${params.inhalt?.sicherheit || "?"}`);
  console.log(`      → Publikum: ${params.form?.publikum?.typ || "?"} (${params.form?.publikum?.fachkenntnisse || "?"}/5) — ${params.form?.publikum?.sicherheit || "?"}`);
  console.log(`      → Ton: ${params.form?.ton?.stil || "?"}, Person: ${params.form?.ton?.person || "?"} — ${params.form?.ton?.sicherheit || "?"}`);
  console.log(`      → Komprimierung: ${params.form?.laenge?.komprimierung || "?"} — ${params.form?.laenge?.sicherheit || "?"}`);
  const gw = Object.entries(params.form?.fokus?.gewichtung || {});
  if (gw.length) console.log(`      → Fokus: ${gw.map(([k, v]) => `${k}=${v}`).join(", ")} — ${params.form?.fokus?.sicherheit || "?"}`);
  console.log(`      → Zielformat: ${params.form?.zielformat || "markdown"}`);

  console.log("[3/5] Invarianzprüfung ...");
  const inv = checkInvarianzen(params);
  if (!inv.ok) {
    console.error("      ✗ Verletzt: " + inv.verletzungen.map(v => v.feld).join(", "));
    process.exit(1);
  }
  console.log("      ✓ OK");

  console.log("[4/5] ?{}-Blöcke auflösen ...");
  const resolved = ast._blocks.map(b => resolveBlock(b, params));
  const ok = resolved.filter(Boolean).length;
  console.log(`      → ${ok}/${ast._blocks.length} aufgelöst`);

  console.log("[5/5] Artefakt generieren ...");
  const zielformat = params.form?.zielformat || "markdown";
  let generated, generatedExt;

  if (zielformat === "html" || domaene === "website") {
    generated = toHTML(ast, params, resolved);
    generatedExt = "html";
  } else {
    generated = toMarkdown(ast, params, resolved);
    generatedExt = "md";
  }

  mkdirSync(pathResolve(outPath), { recursive: true });

  // Ebene 4: Artefakt in zwei Schichten teilen
  const generatedPath = join(pathResolve(outPath), `artikel.generiert.${generatedExt}`);
  const editedPath = join(pathResolve(outPath), `artikel.ueberarbeitet.${generatedExt}`);

  // Generierte Schicht: wird bei jedem Lauf überschrieben
  writeFileSync(generatedPath, generated, "utf-8");

  // Überarbeitete Schicht: bleibt erhalten, wenn sie existiert
  let editedMd = generated;
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
  const diff = generateDiff(generated, editedMd);
  writeFileSync(diffPath, diff, "utf-8");

  const words = generated.split(/\s+/).filter(Boolean).length;
  console.log(`      → ${generatedPath} (${words} Wörter)`);
  console.log(`      → ${editedPath} (bleibt erhalten)`);
  console.log(`      → ${diffPath} (was hat sich geändert?)`);
  console.log("");
  console.log("Fertig. Der Mensch entscheidet, ob er die neue Generierung übernimmt");
  console.log("oder seine Überarbeitung behält.");
}

main();
