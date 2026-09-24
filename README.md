# ISCRIPT

Eine Programmiersprache, die **vier Ebenen** verbindet: **Code**,
**Kontext A + B**, **Auflösung** und **Artefakt**. Erst alle vier
zusammen ergeben ein konkretes, überarbeitbares Ergebnis.

ISCRIPT ist JavaScript-abwärtskompatibel. Gültiges JavaScript bleibt
gültig. Zusätzlich führt ISCRIPT zwei grammatikfreie Ebenen ein —
den **Kontext** in freier menschlicher Sprache.

Der zentrale Punkt: **Das Artefakt ist nie fertig, wenn der
Resolver durchläuft.** Es ist ein Rohling, den der Mensch
überarbeitet. Die Überarbeitung überlebt den nächsten Lauf.

## Status: Prototyp ✅

Dieses Repository enthält einen **lauffähigen Prototyp**:
den Fachartikel über ISCRIPT selbst, geschrieben in ISCRIPT und
mit dem ISCRIPT-Resolver in Markdown aufgelöst.

**Vier Ebenen, nicht drei:**

```
1. Code        (vom Menschen geschrieben, domänenneutral, anpassbar)
        ↓
2. Kontext     (Kontext A: Inhalt + Kontext B: Form, beide anpassbar)
        ↓
3. Auflösung   (KI an genau einer Stelle, protokolliert)
        ↓
4. Artefakt    (KI-generiert, ABER vom Menschen überarbeitbar)
```

Jede Ebene ist rückkoppelbar. Der Mensch arbeitet nicht nur vorne
(Code, Kontext), sondern auch hinten (Artefakt).

Der Artikel ist nicht nur *über* ISCRIPT — er *ist* der Prototyp.

## Kontext A und Kontext B

Der Kontext ist zweigeteilt — in **Inhalt** und **Form**.

### Kontext A – Inhalt (artefakt-unabhängig)

Alles über ISCRIPT an sich. Was es ist, was es leistet, welche
Fakten gelten. Bleibt bei jedem Artefakt-Wechsel gleich.

- Was ist ISCRIPT?
- Die Ebenen und ihre Rollen
- Faktum und Rahmung
- JavaScript, nicht TypeScript
- Die Auflösung konkret
- Beispiele (Lebenslauf, Narration)
- Domänengrammatiken und Ontologien
- Abgrenzungen (TypeScript, DSLs, Template-Engines)
- Offene Fragen
- Fazit

Datei: `artikel/kontexte/iscrypt.inhalt.txt`

### Kontext B – Form (artefakt-abhängig)

Wie das Artefakt strukturiert, aufgebaut, getönt sein soll. Wird
ausgetauscht (Fachartikel, Homepage, Buch, Vortrag).

- Publikum: Wer liest? (Fachpublikum, allgemein, ...)
- Ton: Wie klingt es? (Sachlich, erzählend, ...)
- Länge: Wie ausführlich? (Ziel in Wörtern, Komprimierung)
- Fokus: Worauf konzentrieren? (Gewichte, Ausschlüsse)

Datei: `artikel/kontexte/fachartikel.form.txt` (Fachartikel)
Datei: `artikel/kontexte/homepage.form.txt` (Homepage)

### Die zwei Kontexte im Detail

| Kontext | Was | Wer | Austauschbar? |
|---|---|---|---|
| **Kontext A (Inhalt)** | Fakten, Relationen, These | Mensch | Nein — bleibt gleich |
| **Kontext B (Form)** | Publikum, Ton, Länge, Fokus | Mensch | Ja — pro Artefakt |

## Was wird ausgetauscht?

| Ebene | Artefakt-unabhängig? |
|---|---|
| Kontext A (Inhalt) | ✅ bleibt |
| Code (Fakten, domänenneutral) | ✅ bleibt |
| Resolver | ✅ bleibt |
| Kontext B (Form) | ❌ wird ausgetauscht |
| Domänengrammatik | ❌ wird ausgetauscht |

## Der Artefakt-Wechsel

Um von **Fachartikel** zu **Homepage** zu wechseln, tauscht man nur
noch zwei Dinge:

1. **Kontext B (Form):** `fachartikel.form.txt` →
   `homepage.form.txt`
2. **Domänengrammatik:** `domains/fachpublikation/grammatik.isc`
   → `domains/website/grammatik.isc`

Alles andere bleibt stabil:
- Kontext A (Inhalt) bleibt gleich
- Der domänenneutrale Code bleibt gleich
- Der Resolver bleibt gleich

**Das ist der Test, ob ISCRIPT wirklich trägt.**

## Die vier Ebenen

| Ebene | Was | Wer | Anpassbar? |
|---|---|---|---|
| **Code** | Struktur, Fakten, `?{}` | Mensch | Ja, domänenneutral |
| **Kontext A** | Inhalt: Fakten, Relationen | Mensch | Ja |
| **Kontext B** | Form: Publikum, Ton, Länge, Fokus | Mensch | Ja, pro Artefakt |
| **Auflösung** | Code + Kontext → Rohling | KI (Stufe 2) + Regeln | Protokolliert |
| **Artefakt** | Der fertige Text | KI erzeugt, Mensch überarbeitet | Ja, und die Überarbeitung überlebt |

## Die drei Rückkanäle

```
        ┌──────────────────────────────────┐
        │                                  │
        ▼                                  │
   Code ──→ Kontext A ──→ Auflösung ──→ Artefakt
        ▲        │                      │
        │        ▼                      │
        │   Kontext B ──────────────────┘
        │                                  │
        └──────────────────────────────────┘
              Rückkanal (Mensch)
```

**Drei Rückkanäle:**

1. **Code-Rückkanal:** Autor ändert `artikel/iscrypt.isc` →
   nächster Lauf nutzt neue Struktur
2. **Kontext-Rückkanal:** Autor ändert `artikel/kontexte/*.txt`
   → nächster Lauf nutzt neue Deutung
3. **Artefakt-Rückkanal:** Autor ändert
   `out/artikel.ueberarbeitet.md` → bleibt erhalten, Diff zeigt
   Änderungen

Der Mensch arbeitet nicht nur vorne (Code, Kontext), sondern auch
hinten (Artefakt). Jede Ebene ist rückkoppelbar.

## Schnellstart

Voraussetzung: Node.js ≥ 18, API-Key für einen LLM-Provider
(Mistral, Moonshot oder Anthropic).

**Zwei Stufen:**

```bash
# Stufe 2: Kontext A + B (freie Sprache) → Parameter (JSON) — KIEbene
node resolver/kontext-extrahieren.js \
  --inhalt artikel/kontexte/iscrypt.inhalt.txt \
  --form artikel/kontexte/fachartikel.form.txt \
  --out out/

# Stufe 3: Parameter + Code → Rohling — regelbasiert
node resolver/resolve.js \
  --code artikel/iscrypt.isc \
  --parameter out/parameter.json \
  --domaene fachpublikation \
  --out out/
```

**Ergebnis — drei Dateien in `out/`:**

- `artikel.generiert.md` (oder `.html`) — der Rohling, wird bei
  jedem Lauf überschrieben
- `artikel.ueberarbeitet.md` — die menschliche Überarbeitung, bleibt
  erhalten
- `artikel.diff.md` — was hat sich zwischen neuer Generierung und
  bestehender Überarbeitung geändert?

**Wichtig:** Der Kontext-Text (Kontext A + B) muss vom Autor
kommen — in freier menschlicher Sprache. Die Vorlage
`fachartikel.vorlage.txt` zeigt die vier Abschnitte (Publikum, Ton,
Länge, Fokus). Die KI-Schicht liest diese Texte und extrahiert
strukturierte Parameter. Der Resolver arbeitet nur noch mit den
Parametern, nicht mit der Prosa.

**Das Artefakt ist ein Entwurf, kein Endprodukt.** Der Mensch
überarbeitet `artikel.ueberarbeitet.md`. Beim nächsten Lauf wird
die generierte Schicht neu erzeugt, die überarbeitete Schicht bleibt.
Ein Diff zeigt, was sich geändert hat. Der Mensch entscheidet, ob er
die neue Generierung übernimmt oder seine Überarbeitung behält.

## Wo KI hingehört — und wo nicht

| Stufe | Was | KI? | Warum |
|---|---|---|---|
| 1 | Kontext A + B schreiben | **Nein** | menschliche Autorschaft — freie Sprache ist das Herzstück |
| 2 | Kontext → Parameter | **Ja** | freie Prosa lässt sich nicht mit Regeln verlässlich verstehen |
| 3 | Code parsen | Nein | formal, regelbasiert |
| 4 | Invarianten prüfen | Nein | deterministisch |
| 5 | `?{}` auflösen | Nein | regelbasiert |
| 6 | Rendern | Nein | formal |

Nur Stufe 2 braucht KI. Alle anderen bleiben regelbasiert.
Das ist keine Schwäche — das ist die **Nachvollziehbarkeit**.

Die KI-Schicht (Stufe 2) ist als klar abgegrenzte Funktion
implementiert: `resolver/kontext-extrahieren.js`. Sie ruft ein LLM
auf (Provider-Chain: Mistral → Kimi → Claude), gibt `parameter.json`
heraus und protokolliert den LLM-Output unverändert in
`parameter.log` — damit der Autor prüfen kann, was verstanden
wurde.

## Was die KI nicht kann

- **Die KI erzeugt Rohlinge, keine fertigen Texte.**
- **Keine KI ist derzeit gut genug, menschlichen Text in hoher
  Qualität zu erzeugen.**
- **Deshalb ist das Artefakt überarbeitbar und die Überarbeitung
  bleibt erhalten.**
- **Die KI ist ein Werkzeug zum Vorschlagen, nicht zum
  Fertigstellen.**

Das gilt für die Auflösung von `?{}` genauso wie für die
Kontext-Extraktion. Die KI schlägt vor, der Mensch macht daraus
ein Artefakt.

## Grenzen des Prototyps

- **Die KI-Schicht (Stufe 2) ist nicht deterministisch.**
  Derselbe Kontext kann bei einem erneuten Aufruf zu leicht
  verschiedenen Parametern führen.
- **Deshalb wird der LLM-Output protokolliert** (`parameter.log`)
  **und ist korrigierbar:** Der Autor kann `parameter.override.json`
  anlegen, um extrahierte Parameter manuell zu überschreiben,
  bevor der Resolver (Stufe 3) läuft.
- **Kein LLM verfügbar?** Die KI-Schicht weicht auf eine
  regelbasierte Offline-Extraktion aus. Diese ist bewusst einfach
  und produziert dieselben Fehler wie der alte Schlüsselwort-Ansatz
  — sie dient nur dem Testen, ersetzt die KI-Schicht nicht.
- **Die `?{}`-Blöcke werden als flacher Text aufgelöst,** nicht als
  richtiger Fließtext. Die Struktur-Übersetzung (Task-Schritte,
  Reference-Tabellen) rendern noch nicht sauber.

## Workflow

```
1. Autor schreibt Code (artikel/iscrypt.isc) — domänenneutral
2. Autor schreibt Kontext A (artikel/kontexte/iscrypt.inhalt.txt)
3. Autor schreibt Kontext B (artikel/kontexte/fachartikel.form.txt)
4. KI-Schicht extrahiert Parameter (out/parameter.json)
5. Autor prüft/korrigiert Parameter (out/parameter.override.json)
6. Resolver erzeugt Rohling (out/artikel.generiert.md oder .html)
7. Autor überarbeitet (out/artikel.ueberarbeitet.md)
8. Bei Code-/Kontext-Änderung: zurück zu 4, Diff prüfen,
   Überarbeitung erhalten
9. Bei Artefakt-Wechsel: nur Kontext B + Domänengrammatik tauschen
```

Beim nächsten Lauf wird die generierte Schicht neu erzeugt, die
überarbeitete Schicht bleibt. Ein Diff zeigt, was sich geändert hat.
Der Mensch entscheidet, ob er die neue Generierung übernimmt oder
seine Überarbeitung behält. Das ist wie bei Git: Der generierte Text
ist der „Upstream", die Überarbeitung ist der „Branch". Kein Merge
ohne Prüfung.

## Projektstruktur

```
iscrypt/
├── README.md                        # diese Datei
├── ISCRIPT-Grundlagen.md            # Projektdokumentation (Ausgangspunkt)
├── domains/
│   ├── fachpublikation/
│   │   └── grammatik.isc            # Domänengrammatik (DITA + SPAR)
│   └── website/
│       └── grammatik.isc            # Domänengrammatik (Schema.org)
├── artikel/
│   ├── iscrypt.isc                  # Der Fachartikel als ISCRIPT-Code (domänenneutral)
│   └── kontexte/
│       ├── iscrypt.inhalt.txt       # Kontext A: Inhalt (artefakt-unabhängig)
│       ├── fachartikel.form.txt     # Kontext B: Form des Fachartikels
│       ├── homepage.form.txt        # Kontext B: Form der Homepage
│       └── fachartikel.vorlage.txt  # Vorlage für den Autor
├── resolver/
│   ├── kontext-extrahieren.js       # Stufe 2: KI-Schicht (Kontext A + B → Parameter)
│   └── resolve.js                   # Stufe 3: Resolver (Parameter + Code → Rohling)
└── out/
    ├── parameter.json               # Extrahierte Parameter (aus Stufe 2)
    ├── parameter.log                # Protokoll: LLM-Output + Sicherheit
    ├── parameter.override.json      # (optional) manuelle Korrekturen
    ├── artikel.generiert.md         # Rohling (wird bei jedem Lauf überschrieben)
    ├── artikel.ueberarbeitet.md     # Menschliche Überarbeitung (bleibt erhalten)
    └── artikel.diff.md              # Was hat sich geändert?
```

## Die zwei Ebenen

| Ebene | Was sie trägt | Grammatik? | Fehler möglich? |
|---|---|---|---|
| **Code** (JavaScript + `?{}`) | Struktur, Relationen, Fakten, kontextabhängige Stellen | Ja | Ja (Syntax, Logic) |
| **Kontext A** (freie Sprache) | Fakten, Relationen, These | Nein | Nein — nur die Auflösung kann scheitern |
| **Kontext B** (freie Sprache) | Publikum, Ton, Länge, Fokus | Nein | Nein — nur die Auflösung kann scheitern |

Kontextabhängige Stellen werden im Code mit `?{ ... }` markiert:

```javascript
inhalte [
  {
    id: "was-ist-iscrypt"
    fakten: "ISCRIPT ist eine JavaScript-abwärtskompatible
      Programmiersprache mit zwei Ebenen..."
    kontext: ?{
      // Die zentrale These. Wie wird sie präsentiert?
      // - Als These in einem Fachartikel
      // - Als Hook in einer Homepage
      // - Als Einleitung in einem Buch
    }
  }
]
```

Derselbe Code, drei Kontexte B, drei Artefakte:

- **Fachartikel** → sachlicher, dichter Text in Markdown
- **Homepage** → einladender, erzählender Text in HTML
- **Buch** → ausführlicher, erzählender Text in Markdown

## Grundprinzipien

- **JavaScript als Basis — nicht TypeScript.** TypeScript beseitigt
  Mehrdeutigkeit im Programmtext; ISCRIPT löst sie kontextuell auf.
- **Typsicherheit über Kontext**, nicht über Programmtext.
- **Der Kontext ist grammatikfrei** — einfach Prosa. Er kann nicht
  „falsch" sein, nur die Auflösung kann scheitern.
- **Mehrdeutigkeit ist Feature, nicht Bug** — sie wird kontrolliert,
  nicht eliminiert.
- **Abwärtskompatibilität:** Gültiges JavaScript bleibt gültig.
- **Code ist domänenneutral:** Der Code enthält keine
  Format-Annahmen, keine Struktur-Vorgaben. Die Struktur kommt von
  der Domänengrammatik + Kontext B.

## Die vier Ebenen im Detail

1. **Code** — formal, mit Grammatik, **domänenneutral**
2. **Kontext A** — Inhalte, Fakten, Relationen (artefakt-unabhängig)
3. **Kontext B** — Form, Publikum, Ton, Länge, Fokus (artefakt-abhängig)
4. **Auflösung** — verbindet beide; nachvollziehbar, prüfbar,
   revidierbar
5. **Artefakt** — der fertige Text; KI-generiert, aber vom
   Menschen überarbeitbar. Die Überarbeitung überlebt den nächsten
   Lauf.

## Domänengrammatiken

Der ISCRIPT-Code ist **domänenneutral**. Jede Domäne hat eine eigene
Grammatik, die **nicht erfunden, sondern aus bestehenden
Ontologien abgeleitet** wird.

Generischer Prozess:

1. Ontologie für die Domäne finden oder erstellen
2. Ontologie → Grammatik transformieren (z. B. Onto2Gra, OWL2DSL,
   Melange)
3. Grammatik für Kontext-Auflösung öffnen

Etablierte Ontologien pro Domäne:

- **Menschenleben:** CIDOC CRM, Bio CRM, OntoLife, OntoBio,
  ResumeRDF
- **Fiktion / Narration:** GOLEM, Drammar, NOnt, Transmedia
  Storytelling Ontology (TSO) — mit Fabula/Syuzhet-Trennung
- **Fachpublikation:** SPAR Ontologies (Metadaten) + DITA
  (strukturiertes Authoring)
- **Website:** Schema.org (strukturierte Web-Daten)

### Kritische Trennung

**Faktum** (invariant, kontextunabhängig) vs. **Rahmung**
(kontextabhängig). ISCRIPT erlaubt Mehrdeutigkeit in der *Deutung*,
aber nicht in den *Tatsachen*.

Die Domänengrammatik `domains/fachpublikation/grammatik.isc`
implementiert diese Trennung konkret: Das Feld `invarianzen.faktum`
listet alle Felder, die der Kontext **nicht** verändern darf.

## Der Prototyp-Artikel

`artikel/iscrypt.isc` ist der Fachartikel über ISCRIPT, geschrieben
im domänenneutralen Format:

- **11 Blöcke** — Was ist ISCRIPT? (Definitionen +
  kontextabhängige Abgrenzungen), Code-Ebene, Kontext-Ebene,
  Auflösung, Faktum und Rahmung, JavaScript als Basis,
  Beispiel: Lebenslauf, Beispiel: Narration, Domänengrammatiken,
  Syntax-Elemente, Abgrenzungen, Offene Fragen, Fazit

`artikel/kontexte/iscrypt.inhalt.txt` ist Kontext A: der Inhalt in
freier Sprache.

`artikel/kontexte/fachartikel.form.txt` ist Kontext B: die Form des
Fachartikels (Publikum: Fachpublikum, 4/5, Ton: sachlich, Länge:
dicht, Fokus: Concepts gewichtet 5).

`artikel/kontexte/homepage.form.txt` ist Kontext B: die Form der
Homepage (Publikum: allgemein, 3/5, Ton: erzählend, Länge: dicht,
Fokus: Konzepte + Beispiel).

**Das Artefakt wird in zwei Schichten geteilt:**

- `out/artikel.generiert.md` — was der Resolver erzeugt (wird bei
  jedem Lauf überschrieben)
- `out/artikel.ueberarbeitet.md` — was der Mensch daraus gemacht
  hat (bleibt erhalten)

Bei einem neuen Lauf wird die generierte Schicht neu erzeugt, die
überarbeitete Schicht bleibt. Ein Diff zeigt, was sich geändert hat.
Der Mensch entscheidet, ob er die neue Generierung übernimmt oder
seine Überarbeitung behält.

## Offene Fragen

- Wie läuft die Auflösung konkret ab? → **Im Prototyp beantwortet:**
  regelbasiert, in fünf Schritten, protokolliert
- Wie verhindert man, dass freie Sprache Invarianten des Codes
  verletzt? → **Im Prototyp beantwortet:** Invarianzprüfung als
  Schritt 3
- Wer verantwortet den Kontext?
- Wie viel Struktur muss im Code stecken, damit neue Kontexte ohne
  neuen Code funktionieren?
- Wer definiert Domänengrammatiken — vorgegeben, abgeleitet oder
  deklariert?

## Roadmap

- [x] Konkrete ISCRIPT-Syntax für DITA-Topic-Typen
- [x] Integration von SPAR-Metadaten in den Code
- [x] Auflösungsmechanik für `?{}` konkretisieren (minimal)
- [x] Schnittstelle zwischen Domänengrammatik und freier Kontext-Ebene
- [x] Ersten Fachartikel als Referenzimplementierung
- [x] Vier-Ebenen-Architektur (Code, Kontext, Auflösung, Artefakt)
- [x] Artefakt in zwei Schichten (generiert / überarbeitet) + Diff
- [x] Kontext zweigeteilt: Kontext A (Inhalt) + Kontext B (Form)
- [x] Code domänenneutral (keine DITA-Felder)
- [x] Domänengrammatik „Website" (Schema.org)
- [x] KI-Schicht auf zwei Kontexte angepasst
- [x] Resolver auf domänenneutralen Code + Domänenwahl angepasst
- [ ] Weitere Domänen (Menschenleben, Narration)
- [ ] Weitere Kontexte (Buch, Vortrag, DSL-Grammatik)
- [ ] Weitere Zielformate (DITA-XML, PDF)
- [ ] `?{}`-Blöcke als richtiger Fließtext auflösen
- [ ] Struktur-Übersetzung (Task-Schritte, Reference-Tabellen)
  sauber rendern

## Dokumentation

Die vollständige Projektdokumentation (Ausgangspunkt) liegt in
[`ISCRIPT-Grundlagen.md`](./ISCRIPT-Grundlagen.md).

## Lizenz

MIT
