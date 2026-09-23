# ISCRIPT

Eine Programmiersprache, die zwei Ebenen verbindet: **Code** und
**Kontext**. Erst beide zusammen ergeben ein konkretes Artefakt.

ISCRIPT ist JavaScript-abwärtskompatibel. Gültiges JavaScript bleibt
gültig. Zusätzlich führt ISCRIPT eine zweite, grammatikfreie Ebene ein
— den **Kontext** — in freier menschlicher Sprache.

## Status: Prototyp ✅

Dieses Repository enthält einen **lauffähigen Prototyp**:
den Fachartikel über ISCRIPT selbst, geschrieben in ISCRIPT und
mit dem ISCRIPT-Resolver in Markdown aufgelöst.

```
Code (.isc) + Kontext (.txt) → Artikel (Markdown)
```

Der Artikel ist nicht nur *über* ISCRIPT — er *ist* der Prototyp.

## Schnellstart

Voraussetzung: Node.js ≥ 18.

```bash
node resolver/resolve.js \
  --code artikel/iscrypt.isc \
  --kontext artikel/kontexte/fachartikel.txt \
  --out out/
```

Ergebnis: `out/artikel.md` — der Fachartikel in Markdown.

Der Resolver arbeitet in fünf Schritten (regelbasiert, kein
Black-Box-LLM):

1. **Parsen** — die `.isc`-Datei wird in einen AST mit markierten
   `?{}`-Stellen umgewandelt
2. **Kontext extrahieren** — aus der freien Prosa werden vier
   Parametergruppen extrahiert: Publikum, Ton, Länge, Fokus
3. **Invarianzprüfung** — der Kontext darf keine faktum-Felder
   verändern
4. **`?{}` auflösen** — jede kontextabhängige Stelle wird anhand der
   Kontextparameter aufgelöst
5. **Generieren** — der aufgelöste AST wird in Markdown übersetzt

Jeder Schritt wird im Log protokolliert — die Auflösung ist
nachvollziehbar und prüfbar.

## Projektstruktur

```
iscrypt/
├── README.md                        # diese Datei
├── ISCRIPT-Grundlagen.md            # Projektdokumentation (Ausgangspunkt)
├── domains/
│   └── fachpublikation/
│       └── grammatik.isc            # Domänengrammatik (DITA + SPAR)
├── artikel/
│   ├── iscrypt.isc                  # Der Fachartikel als ISCRIPT-Code
│   └── kontexte/
│       └── fachartikel.txt          # Kontext: Publikum, Ton, Länge, Fokus
├── resolver/
│   └── resolve.js                   # Der Resolver (Node.js, regelbasiert)
└── out/
    └── artikel.md                   # Generierter Artikel (Prototyp-Output)
```

## Die zwei Ebenen

| Ebene | Was sie trägt | Grammatik? | Fehler möglich? |
|---|---|---|---|
| **Code** (JavaScript + `?{}`) | Struktur, Relationen, Fakten, kontextabhängige Stellen | Ja | Ja (Syntax, Logic) |
| **Kontext** (freie Sprache) | Situation, Publikum, Absicht, Ton | Nein | Nein — nur die Auflösung kann scheitern |

Kontextabhängige Stellen werden im Code mit `?{ ... }` markiert:

```javascript
lebenslauf {
  person: { name, geboren, ort },
  stationen: [ { was, wann, bedeutung: ?{} } ],
  fähigkeiten: ?{ },
  ziel: ?{ }
}
```

Derselbe Code, drei Kontexte, drei Artefakte:

- **Homepage** → erzählende HTML-Seite
- **Bewerbung** → sachliches PDF
- **Autobiografie** → langer Fließtext

## Grundprinzipien

- **JavaScript als Basis — nicht TypeScript.** TypeScript beseitigt
  Mehrdeutigkeit im Programmtext; ISCRIPT löst sie kontextuell auf.
- **Typsicherheit über Kontext**, nicht über Programmtext.
- **Der Kontext ist grammatikfrei** — einfach Prosa. Er kann nicht
  „falsch" sein, nur die Auflösung kann scheitern.
- **Mehrdeutigkeit ist Feature, nicht Bug** — sie wird kontrolliert,
  nicht eliminiert.
- **Abwärtskompatibilität:** Gültiges JavaScript bleibt gültig.

## Die drei Ebenen im Detail

1. **Code** — formal, mit Grammatik, domänenspezifisch
2. **Kontext** — freie Sprache, austauschbar, beschreibend
3. **Auflösung** — verbindet beide; nachvollziehbar, prüfbar,
   revidierbar

## Domänengrammatiken

Der ISCRIPT-Code ist domänenspezifisch. Jede Domäne hat eine eigene
Grammatik, die **nicht erfunden, sondern aus bestehenden Ontologien
abgeleitet** wird.

Generischer Prozess:

1. Ontologie für die Domäne finden oder erstellen
2. Ontologie → Grammatik transformieren (z. B. Onto2Gra, OWL2DSL,
   Melange)
3. Grammatik für Kontext-Auflösung öffnen

Etablierte Ontologien pro Domäne:

- **Menschenleben:** CIDOC CRM, Bio CRM, OntoLife, OntoBio, ResumeRDF
- **Fiktion / Narration:** GOLEM, Drammar, NOnt, Transmedia Storytelling
  Ontology (TSO) — mit Fabula/Syuzhet-Trennung
- **Fachpublikation:** SPAR Ontologies (Metadaten) + DITA
  (strukturiertes Authoring)

### Kritische Trennung

**Faktum** (invariant, kontextunabhängig) vs. **Rahmung**
(kontextabhängig). ISCRIPT erlaubt Mehrdeutigkeit in der *Deutung*,
aber nicht in den *Tatsachen*.

Die Domänengrammatik `domains/fachpublikation/grammatik.isc`
implementiert diese Trennung konkret: Das Feld `invarianzen.faktum`
listet alle Felder, die der Kontext **nicht** verändern darf.

## Der Prototyp-Artikel

`artikel/iscrypt.isc` ist der Fachartikel über ISCRIPT, geschrieben
in der Domänengrammatik „Fachpublikation" (DITA + SPAR):

- **7 Concepts** — Was ist ISCRIPT? (Definitionen +
  kontextabhängige Abgrenzungen)
- **2 Tasks** — Auflösung ausführen, Kontext schreiben
- **2 References** — Syntax-Elemente, etablierte Ontologien
- **4 Absätze** — Beispiele (Lebenslauf, Narration), offene Fragen,
  Fazit

`artikel/kontexte/fachartikel.txt` ist der Kontext in freier Sprache:
Publikum (Fachpublikum, 4/5), Ton (sachlich-überzeugend), Länge
(dicht), Fokus (Concepts gewichtet 5).

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
- [ ] Weitere Domänen (Menschenleben, Narration)
- [ ] Weitere Kontexte (Website, Buch, DSL-Grammatik)
- [ ] LLM-Anbindung (optional, für komplexere Auflösung)
- [ ] Weitere Zielformate (HTML, DITA-XML, PDF)

## Dokumentation

Die vollständige Projektdokumentation (Ausgangspunkt) liegt in
[`ISCRIPT-Grundlagen.md`](./ISCRIPT-Grundlagen.md).

## Lizenz

MIT
