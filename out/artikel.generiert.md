# ISCRIPT — Code und Kontext

> Eine Sprache, die Mehrdeutigkeit als Feature behandelt

---

**Autor:** Rudolf Alexander Weinmann, lyrx GmbH
**Ort:** Schwerzenbach, Schweiz
**Zitation:** Weinmann, Rudolf Alexander. ISCRIPT — Code und Kontext. Schwerzenbach: lyrx GmbH, 2026.

---

## was-ist-iscrypt

ISCRIPT ist eine JavaScript-abwärtskompatible Programmiersprache mit zwei Ebenen: einer formalen Code-Ebene mit Grammatik und einer grammatikfreien Kontext-Ebene in freier Sprache. Erst beide Ebenen zusammen ergeben ausführbaren Code oder konkrete Artefakte.

Die zentrale These.  Wie wird sie präsentiert?

## code-ebene

Die Code-Ebene von ISCRIPT ist formales JavaScript plus markierte kontextabhängige Stellen (?{...}). Sie trägt die Struktur, die Relationen und die invariante Fakten. Sie sagt WAS.

Abgrenzung zur Kontext-Ebene: Code sagt WAS (Struktur, Fakten), Kontext sagt WIE (Präsentation, Ton, Fokus).  Beispiel: Im Lebenslauf-Beispiel trägt der Code die Stationen (was, wann, wo) als invariante Fakten.

## kontext-ebene

Die Kontext-Ebene von ISCRIPT ist grammatikfreie Prosa. Sie beschreibt Situation, Publikum, Absicht, Ton und Länge. Sie kann nicht falsch sein — nur die Auflösung kann scheitern.

Wichtige Unterscheidung: Der Kontext ist nicht "falsch", wenn er zu einem unerwarteten Artefakt führt.  Er ist einfach ein anderer Kontext.

## auflösung

Die Auflösung ist der Prozess, der Code und Kontext verbindet und daraus ein konkretes Artefakt erzeugt. Sie ist nachvollziehbar, prüfbar und revidierbar — kein Black-Box-LLM-Aufruf.

Im Prototyp ist die Auflösung regelbasiert: 1.  Kontextparameter werden aus der Prosa extrahiert (Publikum, Ton, Länge, Fokus).

## faktum-und-rahmung

Faktum ist invariant und kontextunabhängig (z.B. Name, Datum, Ort). Rahmung ist kontextabhängig (z.B. ob ein Datum als Jahreszahl, als Alter oder als Zeitepochenbezug erscheint). ISCRIPT erlaubt Mehrdeutigkeit in der Deutung, aber nicht in den Tatsachen.

Beispiel: Faktum: "Geboren 1978 in Heidelberg" Rahmung (Bewerbung): "1978 in Heidelberg geboren" Rahmung (Autobiografie): "Ich kam 1978 in Heidelberg auf die Welt, in einer Stadt, die mir später als Universitätsstadt in Erinnerung blieb. " Die Tatsache (1978, Heidelberg) bleibt gleich.

## javascript-basis

ISCRIPT wählt JavaScript als Basis, nicht TypeScript. TypeScript beseitigt Mehrdeutigkeit im Programmtext durch statische Typisierung. ISCRIPT löst Mehrdeutigkeit kontextuell auf — die Typsicherheit entsteht durch den Kontext, nicht durch den Programmtext.

Die Begründung in einem Satz: TypeScript macht den Code eindeutiger, ISCRIPT macht den Kontext aussagekräftiger.  Für das fachpublikum (gewicht 5): Ausführliche Erläuterung mit Beispiel: TypeScript: let x: string = "42" ISCRIPT:    let x = "42"  // Kontext: x ist eine //   ID, kein numerischer Wert TypeScript erzwingt die Eindeutigkeit im Code.

## beispiel-lebenslauf

Derselbe ISCRIPT-Code, drei Kontexte, drei Artefakte: Der Lebenslauf-Code (person, stationen, fähigkeiten, ziel) wird im Homepage-Kontext zu einer erzählenden HTML-Seite, im Bewerbungs-Kontext zu einem sachlichen PDF, im Autobiografie-Kontext zu einem langen Fließtext. Die Fakten — Name, Daten, Orte — bleiben in allen drei Artefakten identisch. Nur die Rahmung ändert sich.

Für fachpublikum (gewicht 5): Das Lebenslauf-Beispiel ist das intuitivste Beispiel für das ISCRIPT-Prinzip.  Jeder kennt die Situation: Derselbe Lebenslauf, drei verschiedene Darstellungen.

## beispiel-narration

In der Domäne Narration (GOLEM) bleibt die Fabula — die chronologische Ereignisfolge — stabil. Die Syuzhet — die Erzählweise — ist kontextabhängig: Derselbe Code ergibt als Roman einen linearen Text, als Drehbuch eine dialogbasierte Struktur, als Film ein visuelles Skript.

Für fachpublikum: Die Fabula/Syuzhet-Trennung (Propp, Todorov) ist in der Narratologie etabliert.  GOLEM nutzt sie explizit.

## doemänengrammatiken

Die Domänengrammatik wird nicht erfunden — sie wird aus bestehenden Ontologien abgeleitet. Das ist der Kern des ISCRIPT-Ansatzes: Standards dem Selbsterfinden vorziehen.

Der generische Prozess: 1.  Ontologie für die Domäne finden oder erstellen 2.

## syntax-elemente

ISCRIPT erweitert JavaScript um zwei Bausteine: ?{} für kontextabhängige Stellen und domain für die Domänengrammatik. Alles andere ist JavaScript.

| Schlüssel | Wert | Einheit |
|---|---|---|
| `?{...}` | Markiert eine kontextabhängige Stelle. Der Inhalt wird bei der Auflösung anhand der Kontextparameter bestimmt. | Syntax |
| `domain` | Definiert eine Domänengrammatik. Enthält Struktur, Invarianzen und Auflösungsregeln. | Deklaration |
| `meta` | Invariante Metadaten (Autor, Titel, Zitation). Unabhängig vom Artefakt-Typ. | Metadaten |
| `inhalte` | Liste der inhaltlichen Blöcke. Jeder Block hat id, fakten und kontext (?{}). | Struktur |
| `invarianzen` | Liste der faktum-Felder, die der Kontext nicht verändern darf. | Sicherheitsmechanismus |
| `kontextparameter` | Die vier Parametergruppen, die aus der Kontext-Prosa extrahiert werden: publikum, ton, laenge, fokus. | Schnittstelle |

Für fachpublikum: Die Syntax ist bewusst minimal.  ISCRIPT erfindet keine neuen Konstrukte — es erweitert JavaScript um zwei Dinge: ?

## abgrenzung-typescript

TypeScript beseitigt Mehrdeutigkeit im Programmtext durch statische Typisierung. ISCRIPT löst sie kontextuell auf bei der Auflösung.

Je nach Publikum: - Fachpublikum: Ausführliche Abgrenzung mit Beispiel - Allgemein: Ein Satz - Homepage: Kein eigener Abschnitt, nur ein Satz im Fließtext

## abgrenzung-dsl

DSLs sind domänenspezifisch und starr; ISCRIPT ist domänenspezifisch, aber durch den Kontext erweiterbar, ohne die Grammatik zu ändern.

Je nach Publikum: - Fachpublikum: Ausführliche Abgrenzung - Allgemein: Ein Satz - Homepage: Kein eigener Abschnitt

## abgrenzung-template

Templates variieren Ausgabe durch Parameter; ISCRIPT variiert Ausgabe durch Prosa, nicht durch strukturierte Parameter.

Je nach Publikum: - Fachpublikum: Ausführliche Abgrenzung - Allgemein: Ein Satz - Homepage: Kein eigener Abschnitt

## offene-fragen

Fünf Fragen bleiben offen: 1. Wie läuft die Auflösung konkret ab? 2. Wer verantwortet den Kontext? 3. Wie verhindert man, dass freie Sprache Invarianten des Codes verletzt? 4. Wie viel Struktur muss im Code stecken, damit neue Kontexte ohne neuen Code funktionieren? 5. Wer definiert Domänengrammatiken — vorgegeben, abgeleitet oder deklariert?

Für fachpublikum (gewicht 5): Diese fünf Fragen sind die Forschungsagenda.  Der Prototyp beantwortet Frage 3 (Invarianzschutz durch invarianzen.

## fazit

ISCRIPT behandelt Mehrdeutigkeit als Feature, nicht als Bug. Die Code-Ebene trägt Struktur und Fakten, die Kontext-Ebene trägt Präsentation und Absicht. Die Auflösung verbindet beide — nachvollziehbar, prüfbar, revidierbar.

Für fachpublikum (gewicht 5): Der Meta-Aspekt: Dieser Artikel ist nicht nur über ISCRIPT — er ist ein Beispiel für ISCRIPT.  Der Code + der Kontext + die Auflösung = dieses Artefakt.
