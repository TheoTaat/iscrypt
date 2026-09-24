# ISCRIPT — Code und Kontext

> ISCRIPT verbindet formale Code-Struktur mit freier Sprache und löst Mehrdeutigkeit kontextuell auf — nicht durch Eliminierung im Programmtext, sondern durch kontrollierte Auflösung bei der Generierung.

---

**Autor:** Rudolf Alexander Weinmann, lyrx GmbH
**Ort:** Schwerzenbach, Schweiz

---

## ISCRIPT

ISCRIPT ist eine JavaScript-abwärtskompatible Programmiersprache mit zwei Ebenen: einer formalen Code-Ebene mit Grammatik und einer grammatikfreien Kontext-Ebene in freier Sprache. Erst beide Ebenen zusammen ergeben ausführbaren Code oder konkrete Artefakte.

Kontextabhängige Begriffsabgrenzung: - Abgrenzung zu TypeScript: TypeScript beseitigt Mehrdeutigkeit im Programmtext; ISCRIPT löst sie kontextuell auf bei der Auflösung.  - Abgrenzung zu DSLs: DSLs sind domänenspezifisch und starr; ISCRIPT ist domänenspezifisch, aber durch den Kontext erweiterbar, ohne die Grammatik zu ändern.

## Code-Ebene

Die Code-Ebene von ISCRIPT ist formales JavaScript plus markierte kontextabhängige Stellen (?{...}). Sie trägt die Struktur, die Relationen und die invariante Fakten.

Abgrenzung zu "Kontext-Ebene": Code sagt WAS (Struktur, Fakten), Kontext sagt WIE (Präsentation, Ton, Fokus).  Beispiel: Im Lebenslauf-Beispiel trägt der Code die Stationen (was, wann, wo) als invariante Fakten.

## Kontext-Ebene

Die Kontext-Ebene von ISCRIPT ist grammatikfreie Prosa. Sie beschreibt Situation, Publikum, Absicht, Ton und Länge. Sie kann nicht falsch sein — nur die Auflösung kann scheitern.

Wichtige Unterscheidung: Der Kontext ist nicht "falsch", wenn er zu einem unerwarteten Artefakt führt.  Er ist einfach ein anderer Kontext.

## Auflösung

Die Auflösung ist der Prozess, der Code und Kontext verbindet und daraus ein konkretes Artefakt erzeugt. Sie ist nachvollziehbar, prüfbar und revidierbar — kein Black-Box-LLM-Aufruf.

Im Prototyp ist die Auflösung regelbasiert: 1.  Kontextparameter werden aus der Prosa extrahiert (Publikum, Ton, Länge, Fokus).

## Die drei Ebenen

ISCRIPT operiert auf drei Ebenen: Code (Struktur und Fakten), Kontext (Präsentation und Absicht) und Auflösung (Verbindung beider). Jede Ebene hat eine eigene Fehlerlogik.

Tabelle der drei Ebenen: Ebene     | Rolle                        | Fehler möglich?  ----------|------------------------------|------------------ Code      | Struktur, Relationen, Fakten | Ja (Syntax, Logik) Kontext   | Situation, Publikum, Absicht | Nein Auflösung | Verbindet beide              | Ja (Fehlinterpretation) Diese Tabelle ist das Kernstück des Artikels.

## Faktum und Rahmung

Faktum ist invariant und kontextunabhängig (z.B. Name, Datum, Ort). Rahmung ist kontextabhängig (z.B. ob ein Datum als Jahreszahl, als Alter oder als Zeitepochenbezug erscheint). ISCRIPT erlaubt Mehrdeutigkeit in der Deutung, aber nicht in den Tatsachen.

Beispiel: Faktum: "Geboren 1978 in Heidelberg" Rahmung (Bewerbung): "1978 in Heidelberg geboren" Rahmung (Autobiografie): "Ich kam 1978 in Heidelberg auf die Welt, in einer Stadt, die mir später als Universitätsstadt in Erinnerung blieb. " Die Tatsache (1978, Heidelberg) bleibt gleich.

## JavaScript als Basis

ISCRIPT wählt JavaScript als Basis, nicht TypeScript. TypeScript beseitigt Mehrdeutigkeit im Programmtext durch statische Typisierung. ISCRIPT löst Mehrdeutigkeit kontextuell auf — die Typsicherheit entsteht durch den Kontext, nicht durch den Programmtext.

Die Begründung in einem Satz: TypeScript macht den Code eindeutiger, ISCRIPT macht den Kontext aussagekräftiger.  Für das fachpublikum (gewicht 5): Ausführliche Erläuterung mit Beispiel: TypeScript: let x: string = "42" ISCRIPT:    let x = "42"  // Kontext: x ist eine //   ID, kein numerischer Wert TypeScript erzwingt die Eindeutigkeit im Code.

## Auflösung ausführen

**Voraussetzung:** Es existiert ein .isc-Datei mit Artikel-Code und eine .txt-Datei mit Kontext.

**Hinweise:**

Kontextabhängige Bemerkung zur Syntax: Für fachpublikum: Die Syntax ist bewusst minimal.  ISCRIPT erfindet keine neuen Konstrukte — es erweitert JavaScript um zwei Dinge: ?

## Kontext schreiben

**Voraussetzung:** null

**Hinweise:**

Für fachpublikum: Der Generische Prozess: 1.  Ontologie für die Domäne finden oder erstellen 2.

## ISCRIPT-Syntax-Elemente

Für fachpublikum (gewicht 5): Das Lebenslauf-Beispiel ist das intuitivste Beispiel für das ISCRIPT-Prinzip.  Jeder kennt die Situation: Derselbe Lebenslauf, drei verschiedene Darstellungen.

## Etablierte Ontologien für ISCRIPT-Domänen

Für fachpublikum: Die Fabula/Syuzhet-Trennung (Propp, Todorov) ist in der Narratologie etabliert.  GOLEM nutzt sie explizit.

Derselbe ISCRIPT-Code, drei Kontexte, drei Artefakte: Der Lebenslauf-Code (person, stationen, fähigkeiten, ziel) wird im Homepage-Kontext zu einer erzählenden HTML-Seite, im Bewerbungs-Kontext zu einem sachlichen PDF, im Autobiografie-Kontext zu einem langen Fließtext. Die Fakten — Name, Daten, Orte — bleiben in allen drei Artefakten identisch. Nur die Rahmung ändert sich.

Für fachpublikum (gewicht 5): Diese fünf Fragen sind die Forschungsagenda.  Der Prototyp beantwortet Frage 3 (Invarianzschutz durch invarianzen.

In der Domäne Narration (GOLEM) bleibt die Fabula — die chronologische Ereignisfolge — stabil. Die Syuzhet — die Erzählweise — ist kontextabhängig: Derselbe Code ergibt als Roman einen linearen Text, als Drehbuch eine dialogbasierte Struktur, als Film ein visuelles Skript.

Für fachpublikum (gewicht 5): Der Meta-Aspekt: Dieser Artikel ist nicht nur über ISCRIPT — er ist ein Beispiel für ISCRIPT.  Der Code (artikel/iscrypt.

Fünf Fragen bleiben offen: Wie läuft die Auflösung konkret ab? Wer verantwortet den Kontext? Wie verhindert man, dass freie Sprache Invarianten des Codes verletzt? Wie viel Struktur muss im Code stecken, damit neue Kontexte ohne neuen Code funktionieren? Wer definiert Domänengrammatiken — vorgegeben, abgeleitet oder deklariert?

ISCRIPT behandelt Mehrdeutigkeit als Feature, nicht als Bug. Die Code-Ebene trägt Struktur und Fakten, die Kontext-Ebene trägt Präsentation und Absicht. Die Auflösung verbindet beide — nachvollziehbar, prüfbar, revidierbar. Der Artikel selbst ist der Prototyp: Er wurde in ISCRIPT geschrieben und mit der beschriebenen Auflösung in dieses Artefakt transformiert.
