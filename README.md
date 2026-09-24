# ISCRIPT

Eine Programmiersprache, die **formale Code-Struktur mit freier
Sprache** verbindet. ISCRIPT ist JavaScript-abwärtskompatibel.
Gültiges JavaScript bleibt gültig. Zusätzlich führt ISCRIPT eine
grammatikfreie Kontext-Ebene ein — in freier menschlicher Sprache.

Dieses Repository enthält die **Sprache und ihre Werkzeuge**:
die Domänengrammatiken, die KI-Schicht und den Resolver.
Wiederverwendbar für jeden Artikel, jedes Buch, jede Homepage.

**Kein konkreter Artikel.** Ein konkretes Beispiel — der Fachartikel
über ISCRIPT selbst — liegt in
[TheoTaat/iscrypt-artikel](https://github.com/TheoTaat/iscrypt-artikel)
als Abhängigkeit dieses Repos.

## Die vier Ebenen

```
1. Code        (vom Menschen geschrieben, domänenneutral)
        ↓
2. Kontext     (Kontext A: Inhalt + Kontext B: Form)
        ↓
3. Auflösung   (KI an genau einer Stelle, protokolliert)
        ↓
4. Artefakt    (KI-generiert, ABER vom Menschen überarbeitbar)
```

Jede Ebene ist rückkoppelbar. Der Mensch arbeitet nicht nur vorne
(Code, Kontext), sondern auch hinten (Artefakt).

| Ebene | Was | Wer | Anpassbar? |
|---|---|---|---|
| **Code** | Struktur, Fakten, `?{}` | Mensch | Ja, domänenneutral |
| **Kontext A** | Inhalt: Fakten, Relationen | Mensch | Ja |
| **Kontext B** | Form: Publikum, Ton, Länge, Fokus | Mensch | Ja, pro Artefakt |
| **Auflösung** | Code + Kontext → Rohling | KI (Stufe 2) + Regeln | Protokolliert |
| **Artefakt** | Der fertige Text | KI erzeugt, Mensch überarbeitet | Ja, überlebt den nächsten Lauf |

## Der Code

Formales JavaScript plus markierte kontextabhängige Stellen `?{...}`.
Der Code trägt die Struktur, die Relationen und die invarianten
Fakten. Er sagt **WAS** — nicht **WIE**.

**Domänenneutral:** Der Code enthält keine Format-Annahmen, keine
Struktur-Vorgaben. Die Struktur kommt von der Domänengrammatik und
Kontext B. Derselbe Code erzeugt Fachartikel, Homepage, Buch — je
nach Kontext und Domäne.

```javascript
inhalte [
  {
    id: "beispiel"
    fakten: "Derselbe Code, drei Kontexte, drei Artefakte."
    kontext: ?{
      // Wie wird das Beispiel präsentiert?
      // - Als These in einem Fachartikel
      // - Als Hook in einer Homepage
      // - Als Einleitung in einem Buch
    }
  }
]
```

## Kontext A und Kontext B

Der Kontext ist zweigeteilt — in **Inhalt** und **Form**.

### Kontext A – Inhalt (artefakt-unabhängig)

Alles über das Thema an sich. Was es ist, was es leistet, welche
Fakten gelten. Bleibt bei jedem Artefakt-Wechsel gleich.

### Kontext B – Form (artefakt-abhängig)

Wie das Artefakt strukturiert, aufgebaut, getönt sein soll. Wird
ausgetauscht (Fachartikel, Homepage, Buch, Vortrag).

- Publikum: Wer liest?
- Ton: Wie klingt es?
- Länge: Wie ausführlich?
- Fokus: Worauf konzentrieren?

Generische Vorlagen: `vorlagen/kontext-inhalt.vorlage.txt` und
`vorlagen/kontext-form.vorlage.txt`.

## Was wird ausgetauscht?

| Ebene | Artefakt-unabhängig? |
|---|---|
| Kontext A (Inhalt) | ✅ bleibt |
| Code (Fakten, domänenneutral) | ✅ bleibt |
| Resolver | ✅ bleibt |
| Kontext B (Form) | ❌ wird ausgetauscht |
| Domänengrammatik | ❌ wird ausgetauscht |

Beim Artefakt-Wechsel tauscht man nur Kontext B und die
Domänengrammatik. Alles andere bleibt stabil.

## Domänengrammatiken

Jede Domäne hat eine eigene Grammatik, die **nicht erfunden,
sondern aus bestehenden Ontologien abgeleitet** wird.

| Domäne | Datei | Ontologie | Zielformat |
|---|---|---|---|
| Fachpublikation | `domains/fachpublikation/grammatik.isc` | DITA + SPAR | Markdown |
| Website | `domains/website/grammatik.isc` | Schema.org | HTML |

Jede Grammatik definiert:
- **Metadaten** (invariant, SPAR/Schema.org-basiert)
- **Struktur** (Teile/Sektionen mit `?{}`-Stellen)
- **Invarianzen** (welche Felder der Kontext nicht verändern darf)
- **Kontextparameter** (Publikum, Ton, Länge, Fokus)
- **Auflösungenregeln** (deterministisch, regelbasiert)

## Die Werkzeuge

Zwei Stufen — nur Stufe 2 braucht KI:

### Stufe 2: KI-Schicht (`resolver/kontext-extrahieren.js`)

Liest Kontext A + B (freie Sprache), extrahiert strukturierte
Parameter als JSON. Provider-Chain: Mistral → Kimi → Claude.
Fallback: regelbasiert (Offline). LLM-Output wird protokolliert
in `parameter.log`, korrigierbar per `parameter.override.json`.

### Stufe 3: Resolver (`resolver/resolve.js`)

Parsen den domänenneutralen Code, laden die Parameter, prüfen
Invarianzen, lösen `?{}`-Blöcke auf, erzeugen den Rohling im
Zielformat. Regelbasiert, deterministisch.

**Das Artefakt wird in zwei Schichten geteilt:**
- `artikel.generiert.md` — wird bei jedem Lauf überschrieben
- `artikel.ueberarbeitet.md` — bleibe erhält (menschliche Überarbeitung)
- `artikel.diff.md` — was hat sich geändert?

## Verwendung

```bash
# 1. Dieses Repo als Abhängigkeit installieren
npm install github:TheoTaat/iscrypt

# 2. Kontext A + B → Parameter
node node_modules/iscrypt/resolver/kontext-extrahieren.js \
  --inhalt kontexte/ihalt.txt \
  --form kontexte/fachartikel.form.txt \
  --out out/

# 3. Code + Parameter → Rohling
node node_modules/iscrypt/resolver/resolve.js \
  --code code/article.isc \
  --parameter out/parameter.json \
  --domaene fachpublikation \
  --out out/
```

**Ein konkretes Beispiel** mit `package.json`, Skripten und
fertig generierten Artefakten:
[TheoTaat/iscrypt-artikel](https://github.com/TheoTaat/iscrypt-artikel)

Um einen eigenen Artikel zu erstellen:
1. `code/article.isc` schreiben (Fakten + `?{}`-Stellen)
2. `kontexte/` mit Kontext A + B anlegen (Vorlagen in `vorlagen/`)
3. Stufe 2 + 3 laufen lassen
4. Artefakt überarbeiten, diff prüfen

## Projektstruktur

```
iscrypt/
├── README.md                     # diese Datei
├── ISCRIPT-Grundlagen.md         # Projektdokumentation
├── domains/
│   ├── fachpublikation/
│   │   └── grammatik.isc         # DITA + SPAR → Markdown
│   └── website/
│       └── grammatik.isc         # Schema.org → HTML
├── resolver/
│   ├── kontext-extrahieren.js    # Stufe 2: KI-Schicht
│   └── resolve.js                # Stufe 3: Resolver
└── vorlagen/
    ├── kontext-inhalt.vorlage.txt   # Vorlage Kontext A
    └── kontext-form.vorlage.txt     # Vorlage Kontext B
```

## Grundprinzipien

- **JavaScript als Basis — nicht TypeScript.** TypeScript beseitigt
  Mehrdeutigkeit im Programmtext; ISCRIPT löst sie kontextuell auf.
- **Typsicherheit über Kontext**, nicht über Programmtext.
- **Der Kontext ist grammatikfrei** — einfach Prosa. Er kann nicht
  „falsch" sein, nur die Auflösung kann scheitern.
- **Mehrdeutigkeit ist Feature, nicht Bug** — kontrolliert,
  nicht eliminiert.
- **Code ist domänenneutral:** keine Format-Annahmen, keine
  Struktur-Vorgaben.
- **Standards vor Selbsterfindung:** Domänengrammatiken aus
  bestehenden Ontologien.

## Roadmap

- [x] Domänenneutrale Syntax
- [x] Kontext zweigeteilt: A (Inhalt) + B (Form)
- [x] Domänengrammatiken (Fachpublikation, Website)
- [x] KI-Schicht auf zwei Kontexte
- [x] Resolver mit Domänenwahl
- [ ] Weitere Domänen (Menschenleben, Narration)
- [ ] Weitere Zielformate (DITA-XML, PDF)
- [ ] `?{}`-Blöcke als richtiger Fließtext auflösen

## Dokumentation

Vollständige Projektdokumentation:
[`ISCRIPT-Grundlagen.md`](./ISCRIPT-Grundlagen.md).

## Lizenz

MIT