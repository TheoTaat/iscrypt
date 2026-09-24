# Kontext A – Inhalt: ISCRIPT

## Was ist ISCRIPT?

ISCRIPT ist eine JavaScript-abwärtskompatible Programmiersprache mit
zwei Ebenen: einer formalen Code-Ebene mit Grammatik und einer
grammatikfreien Kontext-Ebene in freier Sprache. Erst beide Ebenen
zusammen ergeben ausführbaren Code oder konkrete Artefakte.

Die zentrale These: ISCRIPT verbindet formale Code-Struktur mit freier
Sprache und löst Mehrdeutigkeit kontextuell auf — nicht durch
Eliminierung im Programmtext, sondern durch kontrollierte Auflösung
bei der Generierung.

## Die Ebenen und ihre Rollen

Die Code-Ebene ist formales JavaScript plus markierte
kontextabhängige Stellen (?{...}). Sie trägt die Struktur, die
Relationen und die invariante Fakten. Sie sagt WAS.

Die Kontext-Ebene ist grammatikfreie Prosa. Sie beschreibt Situation,
Publikum, Absicht, Ton und Länge. Sie sagt WIE. Sie kann nicht falsch
sein — nur die Auflösung kann scheitern.

Die Auflösung ist der Prozess, der Code und Kontext verbindet und
daraus ein konkretes Artefakt erzeugt. Sie ist nachvollziehbar,
prüfbar und revidierbar — kein Black-Box-LLM-Aufruf.

## Die Ebenen im Detail

Die Code-Ebene: Struktur, Relationen, Fakten. Fehler möglich:
Syntax, Logik.

Die Kontext-Ebene: Situation, Publikum, Absicht. Fehler möglich:
Nein.

Die Auflösung: Verbindet beide. Fehler möglich: Fehlinterpretation.

## Faktum und Rahmung

Faktum ist invariant und kontextunabhängig (z.B. Name, Datum, Ort).
Rahmung ist kontextabhängig (z.B. ob ein Datum als Jahreszahl, als
Alter oder als Zeitepochenbezug erscheint). ISCRIPT erlaubt
Mehrdeutigkeit in der Deutung, aber nicht in den Tatsachen.

Beispiel:
Faktum: "Geboren 1978 in Heidelberg"
Rahmung (Bewerbung): "1978 in Heidelberg geboren"
Rahmung (Autobiografie): "Ich kam 1978 in Heidelberg auf die Welt,
in einer Stadt, die mir später als Universitätsstadt in Erinnerung
blieb."

Die Tatsache (1978, Heidelberg) bleibt gleich. Die Rahmung ändert
sich mit dem Kontext.

## JavaScript, nicht TypeScript

ISCRIPT wählt JavaScript als Basis, nicht TypeScript. TypeScript
beseitigt Mehrdeutigkeit im Programmtext durch statische Typisierung.
ISCRIPT löst Mehrdeutigkeit kontextuell auf — die Typsicherheit
entsteht durch den Kontext, nicht durch den Programmtext.

Die Begründung: TypeScript macht den Code eindeutiger, ISCRIPT macht
den Kontext aussagekräftiger.

Für das fachpublikum: Ausführliche Erläuterung mit Beispiel:
TypeScript: let x: string = "42"
ISCRIPT: let x = "42"  // Kontext: x ist eine ID, kein numerischer
Wert

TypeScript erzwingt die Eindeutigkeit im Code. ISCRIPT delegiert die
Eindeutigkeit an den Kontext.

## Die Auflösung konkret

Die Auflösung im Prototyp ist regelbasiert:

1. Kontextparameter werden aus der Prosa extrahiert (Publikum, Ton,
   Länge, Fokus).
2. Invarianzen werden geprüft: Der Kontext darf keine faktum-Felder
   verändern.
3. Die ?{}-Felder werden anhand der Kontextparameter aufgelöst
   (Vollständigkeit, Komprimierung, Ton).
4. Das Artefakt wird generiert.

LLM-Anbindung ist später möglich, aber nicht erforderlich für die
Kernfunktionalität.

Die Invarianzprüfung ist die wichtigste Sicherheitsmaßnahme. Sie
stellt sicher, dass der Kontext nie Fakten verändert.

Die regelbasierte Extraktion der Kontextparameter ist bewusst
konservativ: Wenn ein Parameter nicht gefunden wird, wird ein Default
verwendet, nicht geraten.

## Beispiel: Lebenslauf

Derselbe ISCRIPT-Code, drei Kontexte, drei Artefakte: Der
Lebenslauf-Code (person, stationen, fähigkeiten, ziel) wird im
Homepage-Kontext zu einer erzählenden HTML-Seite, im
Bewerbungs-Kontext zu einem sachlichen PDF, im Autobiografie-Kontext
zu einem langen Fließtext. Die Fakten — Name, Daten, Orte — bleiben
in allen drei Artefakten identisch. Nur die Rahmung ändert sich.

Das Lebenslauf-Beispiel ist das intuitivste Beispiel für das
ISCRIPT-Prinzip. Jeder kennt die Situation: Derselbe Lebenslauf, drei
verschiedene Darstellungen. Der Code trägt die Fakten, der Kontext
die Darstellungsentscheidung.

## Beispiel: Fiktive Erzählung

In der Domäne Narration (GOLEM) bleibt die Fabula — die
chronologische Ereignisfolge — stabil. Die Syuzhet — die Erzählweise
— ist kontextabhängig: Derselbe Code ergibt als Roman einen linearen
Text, als Drehbuch eine dialogbasierte Struktur, als Film ein
visuelles Skript.

Die Fabula/Syuzhet-Trennung (Propp, Todorov) ist in der
Narratologie etabliert. GOLEM nutzt sie explizit. ISCRIPT überträgt
dieses Muster auf jede Domäne: Die invariante Faktenbasis bleibt
stabil, die Darstellung ist kontextabhängig.

## Domänengrammatiken und Ontologien

Die Domänengrammatik wird nicht erfunden — sie wird aus bestehenden
Ontologien abgeleitet. Das ist der Kern des ISCRIPT-Ansatzes:
Standards dem Selbsterfinden vorziehen.

Der generische Prozess:
1. Ontologie für die Domäne finden oder erstellen
2. Ontologie → Grammatik transformieren
3. Grammatik für Kontext-Auflösung öffnen

Etablierte Ontologien pro Domäne:
- Menschenleben: CIDOC CRM, Bio CRM, OntoLife, OntoBio, ResumeRDF
- Fiktion / Narration: GOLEM, Drammar, NOnt, Transmedia Storytelling
  Ontology (TSO)
- Fachpublikation: SPAR Ontologies (Metadaten) + DITA (strukturiertes
  Authoring)
- Website: Schema.org (strukturierte Web-Daten)

## Die ISCRIPT-Syntax-Elemente

?{...} — Markiert eine kontextabhängige Stelle. Der Inhalt wird bei
der Auflösung anhand der Kontextparameter bestimmt.

domain — Definiert eine Domänengrammatik. Enthält Struktur,
Invarianzen und Auflösungsregeln.

concept — DITA-Topic: Erklärt, was etwas ist. Enthalten: name,
definition (invariant), begrifflich (kontextabhängig).

task — DITA-Topic: Erklärt, wie man etwas tut. Enthalten: name,
schritte (invariant), hinweise (kontextabhängig).

reference — DITA-Topic: Dokumentiert, was existiert. Enthalten: name,
eintraege (invariant), bemerkung (kontextabhängig).

absatz — Freier DITA-Body-Text. Enthalten: inhalt (invariant),
kontext (kontextabhängig).

invarianzen — Liste der faktum-Felder, die der Kontext nicht
verändern darf.

kontextparameter — Die vier Parametergruppen, die aus der
Kontext-Prosa extrahiert werden: publikum, ton, laenge, fokus.

auflösung — Die Regelmenge, die die Verbindung von Code und Kontext
steuert. Deterministisch und nachvollziehbar.

Die Syntax ist bewusst minimal. ISCRIPT erfindet keine neuen
Konstrukte — es erweitert JavaScript um zwei Dinge: ?{} für
kontextabhängige Stellen und domain für die Domänengrammatik. Alles
andere ist JavaScript.

Wenn man JavaScript kann, kann man ISCRIPT lesen. Der einzige neue
Baustein ist ?{}, und der sagt: "Hier entscheidet der Kontext."

## Abgrenzung zu TypeScript

TypeScript beseitigt Mehrdeutigkeit im Programmtext durch statische
Typisierung. ISCRIPT löst sie kontextuell auf bei der Auflösung.

## Abgrenzung zu DSLs

DSLs sind domänenspezifisch und starr; ISCRIPT ist domänenspezifisch,
aber durch den Kontext erweiterbar, ohne die Grammatik zu ändern.

## Abgrenzung zu Template-Engines

Templates variieren Ausgabe durch Parameter; ISCRIPT variiert Ausgabe
durch Prosa, nicht durch strukturierte Parameter.

## Offene Fragen

Fünf Fragen bleiben offen:

1. Wie läuft die Auflösung konkret ab?
2. Wer verantwortet den Kontext?
3. Wie verhindert man, dass freie Sprache Invarianten des Codes
   verletzt?
4. Wie viel Struktur muss im Code stecken, damit neue Kontexte ohne
   neuen Code funktionieren?
5. Wer definiert Domänengrammatiken — vorgegeben, abgeleitet oder
   deklariert?

Diese fünf Fragen sind die Forschungsagenda. Der Prototyp beantwortet
Frage 3 (Invarianzschutz durch invarianzen.faktum) und Frage 1
(regelbasierte Auflösung). Fragen 2, 4 und 5 bleiben offen für
weitere Arbeit.

ISCRIPT ist ein Anfang, keine fertige Lösung. Die fünf offenen Fragen
zeigen, wo die Arbeit noch steht — und wo die interessanten Probleme
liegen.

## Fazit

ISCRIPT behandelt Mehrdeutigkeit als Feature, nicht als Bug. Die
Code-Ebene trägt Struktur und Fakten, die Kontext-Ebene trägt
Präsentation und Absicht. Die Auflösung verbindet beide —
nachvollziehbar, prüfbar, revidierbar.

Der Artikel selbst ist der Prototyp: Er wurde in ISCRIPT geschrieben
und mit der beschriebenen Auflösung in dieses Artefakt transformiert.

Der Meta-Aspekt: Dieser Artikel ist nicht nur über ISCRIPT — er ist
ein Beispiel für ISCRIPT. Der Code + der Kontext + die Auflösung =
dieses Artefakt. Das ist die Referenzimplementierung.

Der wichtigste Satz dieses Artikels ist der letzte: Der Artikel
selbst ist der Prototyp. Nicht die Beschreibung des Prototyps — der
Prototyp selbst.

## Metadaten

Autor: Rudolf Alexander Weinmann, lyrx GmbH
Organisation: lyrx GmbH
Affiliation: KI-gestützte Softwareentwicklung
Titel: ISCRIPT — Code und Kontext: Eine Sprache, die
Mehrdeutigkeit als Feature behandelt
Sprache: de
Zitationsstil: chicagoo
Zitationsformat: Weinmann, Rudolf Alexander. ISCRIPT — Code und
Kontext. Schwerzenbach: lyrx GmbH, 2026.
Publikationsort: Schwerzenbach, Schweiz
