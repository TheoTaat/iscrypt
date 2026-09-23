# ISCRIPT

Eine Programmiersprache, die zwei Ebenen verbindet: **Code** und **Kontext**.

ISCRIPT ist JavaScript-abwärtskompatibel. Gültiges JavaScript bleibt gültig.
Zusätzlich führt ISCRIPT eine zweite, grammatikfreie Ebene ein — den
**Kontext** — in freier menschlicher Sprache. Erst Code und Kontext
zusammen ergeben ausführbaren Code bzw. konkrete Artefakte.

## Die zwei Ebenen

| Ebene | Was sie trägt | Grammatik? | Fehler möglich? |
|---|---|---|---|
| **Code** (JavaScript + `?{}`) | Struktur, Relationen, Fakten, kontextabhängige Stellen | Ja | Ja (Syntax, Logik) |
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
3. **Auflösung** — verbindet beide; nachvollziehbar, prüfbar, revidierbar

## Domänengrammatiken

Der ISCRIPT-Code ist domänenspezifisch. Jede Domäne hat eine eigene
Grammatik, die **nicht erfunden, sondern aus bestehenden Ontologien
abgeleitet** wird.

Generischer Prozess:

1. Ontologie für die Domäne finden oder erstellen
2. Ontologie → Grammatik transformieren (z. B. Onto2Gra, OWL2DSL, Melange)
3. Grammatik für Kontext-Auflösung öffnen

Etablierte Ontologien pro Domäne:

- **Menschenleben:** CIDOC CRM, Bio CRM, OntoLife, OntoBio, ResumeRDF
- **Fiktion / Narration:** GOLEM, Drammar, NOnt, Transmedia Storytelling
  Ontology (TSO) — mit Fabula/Syuzhet-Trennung
- **Fachpublikation:** SPAR Ontologies (Metadaten) + DITA (strukturiertes
  Authoring)

### Kritische Trennung

**Faktum** (invariant, kontextunabhängig) vs. **Rahmung**
(kontextabhängig). ISCRIPT erlaubt Mehrdeutigkeit in der *Deutung*,
aber nicht in den *Tatsachen*.

## Erstes Ziel

Ein veröffentlichbarer **Fachartikel über ISCRIPT** als
Referenzimplementierung:

- **DITA** als Grundlage für die Topic-Struktur (concept, task, reference)
- **SPAR** für Metadaten (Autor, Publikation, Zitationen)
- **Kontext** (freie Sprache) beschreibt Publikum, Ton, Länge, Fokus

## Offene Fragen

- Wie läuft die Auflösung konkret ab? (nachvollziehbar, prüfbar,
  revidierbar — kein Black-Box-LLM-Aufruf)
- Wer verantwortet den Kontext?
- Wie verhindert man, dass freie Sprache Invarianten des Codes verletzt?
- Wie viel Struktur muss im Code stecken, damit neue Kontexte ohne neuen
  Code funktionieren?
- Wer definiert Domänengrammatiken — vorgegeben, abgeleitet oder
  deklariert?

## Roadmap

- [ ] Konkrete ISCRIPT-Syntax für DITA-Topic-Typen
- [ ] Integration von SPAR-Metadaten in den Code
- [ ] Auflösungsmechanik für `?{}` konkretisieren
- [ ] Schnittstelle zwischen Domänengrammatik und freier Kontext-Ebene
- [ ] Ersten Fachartikel als Referenzimplementierung

## Dokumentation

Die vollständige Projektdokumentation (Ausgangspunkt) liegt in
[`ISCRIPT-Grundlagen.md`](./ISCRIPT-Grundlagen.md).

## Lizenz

MIT
