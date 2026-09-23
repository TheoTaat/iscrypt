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
Kontext (freie Sprache, vom Autor)
        ↓
KI-Schicht: Kontext → Parameter (JSON)     ← HIER KI
        ↓
Resolver: Parameter + Code → Artikel       ← regelbasiert
```

Der Artikel ist nicht nur *über* ISCRIPT — er *ist* der Prototyp.

## Schnellstart

Voraussetzung: Node.js ≥ 18, API-Key für einen LLM-Provider
(Mistral, Moonshot oder Anthropic).

**Zwei Stufen:**

```bash
# Stufe 2: Kontext (freie Sprache) → Parameter (JSON) — KIEbene
node resolver/kontext-extrahieren.js \
  --kontext artikel/kontexte/fachartikel.txt \
  --out out/

# Stufe 3: Parameter + Code → Artikel — regelbasiert
node resolver/resolve.js \
  --code artikel/iscrypt.isc \
  --parameter out/parameter.json \
  --out out/
```

Ergebnis: `out/artikel.md` — der Fachartikel in Markdown.

**Wichtig:** Der Kontext-Text (`fachartikel.txt`) muss vom Autor
kommen — in freier menschlicher Sprache. Die Vorlage
`fachartikel.vorlage.txt` zeigt die vier Abschnitte (Publikum, Ton,
Länge, Fokus). Die KI-Schicht liest diesen Text und extrahiert
strukturierte Parameter. Der Resolver arbeitet nur noch mit den
Parametern, nicht mit der Prosa.

## Wo KI hingehört — und wo nicht

| Stufe | Was | KI? | Warum |
|---|---|---|---|
| 1 | Kontext schreiben | **Nein** | menschliche Autorschaft — freie Sprache ist das Herzstück |
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
`parameter.log` — damit der Autor prüfen kann, was verstanden wurde.

## Grenzen des Prototyps

- **Die KI-Schicht (Stufe 2) ist nicht deterministisch.** Derselbe
  Kontext kann bei einem erneuten Aufruf zu leicht verschiedenen
  Parametern führen.
- **Deshalb wird der LLM-Output protokolliert** (`parameter.log`)
  **und ist korrigierbar:** Der Autor kann `parameter.override.json`
  anlegen, um extrahierte Parameter manuell zu überschreiben,
  bevor der Resolver (Stufe 3) läuft.
- **Kein LLM verfügbar?** Die KI-Schicht weicht auf eine regelbasierte
  Offline-Extraktion aus. Diese ist bewusst einfach und produziert
  dieselben Fehler wie der alte Schlüsselwort-Ansatz — sie dient nur
  dem Testen, ersetzt die KI-Schicht nicht.
- **Die Task-Schritte und Reference-Tabellen** werden geparst, aber
  im aktuellen Markdown-Output nur teilweise gerendert. Funktioniert,
  aber noch nicht poliert.

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
│       ├── fachartikel.entwurf.txt  # Entwurf (von der KI, zum Anpassen)
│       └── fachartikel.vorlage.txt  # Vorlage für den Autor
├── resolver/
│   ├── kontext-extrahieren.js       # Stufe 2: KI-Schicht (Kontext → Parameter)
│   └── resolve.js                   # Stufe 3: Resolver (Parameter + Code → Artikel)
└── out/
    ├── parameter.json               # Extrahierte Parameter (aus Stufe 2)
    ├── parameter.log                # Protokoll: LLM-Output + Sicherheit
    ├── parameter.override.json      # (optional) manuelle Korrekturen
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
