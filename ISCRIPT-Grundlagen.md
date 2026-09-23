# IScript – Projektdokumentation

Stand: 2026-09-23, übergeben von lyrx.

## Ausgangspunkt
Ziel ist die Entwicklung von IScript, einer Programmiersprache, die zwei
Ebenen verbindet:
- Code-Ebene: formal, hat eine Grammatik, abwärtskompatibel zu JavaScript
- Kontext-Ebene: freie menschliche Sprache, keine Grammatik, austauschbar

Erst beide Ebenen zusammen ergeben ausführbaren Code bzw. konkrete
Artefakte.

## Grundprinzipien
- JavaScript als Basis – nicht TypeScript. TypeScript wird als
  „Verschlimmbesserung" abgelehnt, weil es Mehrdeutigkeit im Code
  beseitigt statt sie kontextuell aufzulösen.
- Typsicherheit über Kontext, nicht über Programmtext.
- Der Kontext ist grammatikfrei – er ist einfach Prosa. Er kann nicht
  „falsch" sein, nur die Auflösung kann scheitern.
- Mehrdeutigkeit ist Feature, nicht Bug – sie wird kontrolliert, nicht
  eliminiert.
- Abwärtskompatibilität: Gültiges JavaScript bleibt gültig.
  Kontextabhängige Stellen werden durch eigene Syntax markiert
  (Vorschlag: `?{ ... }`).

## Die drei Ebenen
| Ebene | Rolle | Fehler möglich? |
| --- | --- | --- |
| Code (JavaScript + ?{}) | Struktur, Relationen, kontextabhängige Stellen | Ja (Syntax, Logik) |
| Kontext (freie Sprache) | Situation, Publikum, Absicht | Nein |
| Auflösung | Verbindet beide | Ja (Fehlinterpretation) |

## Domänengrammatiken
Der Code ist domänenspezifisch. Jede Domäne hat eine eigene Grammatik,
die nicht erfunden, sondern aus bestehenden Ontologien abgeleitet wird.

Generischer Prozess:
1. Ontologie für die Domäne finden oder erstellen
2. Ontologie → Grammatik transformieren (Tools: Onto2Gra, OWL2DSL, Melange)
3. Grammatik für Kontext-Auflösung öffnen

Beispiele etablierter Ontologien:
- Menschenleben: CIDOC CRM, Bio CRM, OntoLife, OntoBio, ResumeRDF
- Fiktion/Narration: GOLEM, Drammar, NOnt, Transmedia Storytelling
  Ontology (TSO) – mit Fabula/Syuzhet-Trennung
- Fachpublikation: SPAR Ontologies (Metadaten) + DITA (strukturiertes
  Authoring)

### Beispiel: Lebenslauf
Derselbe Code, drei Kontexte:

```javascript
lebenslauf {
  person: { name, geboren, ort },
  stationen: [ { was, wann, bedeutung: ?{} } ],
  fähigkeiten: ?{ },
  ziel: ?{ }
}
```
- Homepage-Kontext → erzählende HTML-Seite
- Bewerbungs-Kontext → sachliches PDF
- Autobiografie-Kontext → langer Fließtext

Kritische Trennung: faktum (invariant, kontextunabhängig) vs. rahmung
(kontextabhängig). IScript darf Mehrdeutigkeit in der Deutung erlauben,
aber nicht in den Tatsachen.

### Beispiel: Fiktive Erzählung
Domäne „Narration" mit GOLEM. Fabula (chronologische Ereignisfolge)
bleibt stabil. Syuzhet (Erzählweise) ist kontextabhängig: Roman, Ebook,
Drehbuch, Film.

### Beispiel: Fachbuch über IScript
Erstes konkretes Ziel: ein veröffentlichbarer Fachartikel.
- DITA als Grundlage für die Topic-Struktur (concept, task, reference)
- SPAR für Metadaten (Autor, Publikation, Zitationen)
- Kontext (freie Sprache) beschreibt Publikum, Ton, Länge, Fokus
- Weitere denkbare Kontexte: Fachartikel, Website, DSL-Grammatik, Buch.

## Offene Fragen
- Wie läuft die Auflösung konkret ab? – nachvollziehbar, prüfbar,
  revidierbar; kein Black-Box-LLM-Aufruf
- Wer verantwortet den Kontext? – bei falschem Kontext ist das Programm
  unsicher, nicht der Code
- Wie verhindert man, dass freie Sprache Invarianten des Codes verletzt?
- Wie viel Struktur muss im Code stecken, damit neue Kontexte ohne
  neuen Code funktionieren?
- Wer definiert Domänengrammatiken? – vorgegeben, abgeleitet oder
  deklariert

## Nächste Schritte
- Konkrete IScript-Syntax für DITA-Topic-Typen
- Integration von SPAR-Metadaten in den Code
- Auflösungsmechanik für `?{}` konkretisieren
- Schnittstelle zwischen Domänengrammatik und freier Kontext-Ebene
- Ersten Fachartikel als Referenzimplementierung erstellen

## Hinweis für Theodor Taat
Dies ist der Ausgangspunkt. Der Nutzer denkt in großen Bögen, zieht
etablierte Standards (Ontologien, DITA, SPAR) dem Selbsterfinden vor
und besteht auf der harten Trennung von Code (Grammatik) und Kontext
(freie Sprache). Bei jedem neuen Domänenbeispiel zuerst prüfen, ob es
bereits eine etablierte Ontologie gibt, bevor etwas Neues entworfen
wird.
