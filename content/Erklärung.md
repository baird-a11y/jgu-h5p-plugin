# Code-Dokumentation für das H5P Documentation Tool (JGU)

Diese README dient als Nachschlagewerk für den übernommenen JSON-Code. Hier findest du eine Erklärung zu den einzelnen Abschnitten, verwendeten Parametern und Hinweise, wie du die Datei erweitern kannst.

---

## Übersicht

Der JSON-Code beschreibt die Struktur eines H5P-Elements, das aus mehreren Seiten besteht. Jede Seite enthält spezifische Parameter und Funktionen, wie z. B. die Anzeige von Änderungen, das Definieren von Zielen, das Bewerten von Zielen sowie den Export von Dokumenten.

---

## Aufbau des JSON-Codes

### 1. Allgemeine Struktur

- **`taskDescription`**  
  Beschreibt kurz die Funktion des Tools (hier: "Documentation Tool (JGU)").

- **`pagesList`**  
  Eine Liste von Seiten (Seiten-Elemente), die das Element ausmachen. Jede Seite wird durch eigene Parameter, verwendete Bibliotheken und Metadaten beschrieben.

- **`i10n`**  
  Enthält internationalisierungsbezogene Labels (z. B. Beschriftungen für Navigationselemente wie "Previous documentation step", "Next documentation step" und "Close").

---

### 2. Seiten im Detail

#### a) StandardPage (Seite "Changes")
- **`params.elementList`**  
  Enthält Elemente (hier einen Textblock), der HTML-Code mit einer Liste von Änderungen enthält.
- **`library`**  
  Gibt die verwendete H5P-Bibliothek an (z. B. `"H5P.Text 1.1"`).
- **`metadata`**  
  Metainformationen wie `contentType`, `license` und `title`.

#### b) GoalsPage (Seite "Goals")
- **`params`**  
  Enthält Einstellungen und Texte, die beim Definieren von Zielen genutzt werden:
  - `description`: Kurze Beschreibung, worum es geht.
  - Texte für Buttons und Labels (z. B. `defineGoalText`, `definedGoalLabel`, etc.).
  - **`predefinedGoals`**  
    Eine Liste vordefinierter Ziele, die mit Gewichtungen versehen sind.
- **`library` und `metadata`**  
  Spezifische Angaben zur H5P-Bibliothek und Seitentyp.

#### c) GoalsAssessmentPage (Seite "Goals assessment")
- **`params`**  
  Enthält die Parameter zur Bewertung der definierten Ziele:
  - Verschiedene Bewertungsstufen (von 1.0 bis 5.0).
  - Optionen, ob Kommentare erlaubt sind.
  - Texte für verschiedene Bereiche (z. B. `noGoalsText`, `legendHeader`).
- **`l10n`**  
  Lokalisierung von speziellen Texten, z. B. zur Anzeige des Durchschnittswerts.

#### d) DocumentExportPage (Seite "Document Export")
- **`params`**  
  Enthält Einstellungen und Beschriftungen für den Exportvorgang:
  - Beschreibungen und Labels für Aktionen (z. B. `createDocumentLabel`, `submitTextLabel`).
  - Eine Fehlermeldung, falls erforderliche Felder nicht ausgefüllt wurden.
  
---

## Erweiterungsmöglichkeiten

- **Neue Seiten hinzufügen:**  
  Füge weitere Objekte in die `pagesList` ein. Achte darauf, für jeden neuen Seitentyp die entsprechenden Parameter, Bibliotheken und Metadaten zu definieren.

- **Wie wird eine neue Seite hinzugefügt?**
  Folgende Aufbau sollte immer gleich sein: <br>
  `"params": {` Beginnt die Seite <br>
  `"elementList": [` Auflistung der Elemente die Vorhanden sein sollten <br>
    `{` Da es sich um ein Array mit Elementen handelt, muss jedes Element einzeln übergeben werden. <br>
`"text":"Text"` Hier kann Text angegeben werden, der dann angezeigt werden soll. Dabei können HTML Operation für Textdarstellung benutzt werden <br>
`},` <br>
`"library": "H5P.Text 1.1",` – Gibt an, welche H5P-Bibliothek für dieses Element genutzt wird <br>
`"metadata": {` – Metadaten des Elements <br>
`"contentType": "Text",` Gibt an um was für ein Element es sich handelt <br>
`"license": "U",` Welche Lizenz benutzt wird. Hier bedeuet das es gibt keine Lizenz  <br>
`"title": "Untitled Text"` Titel der der Seite beim anlegen im Hintergrund (Prüfen) <br>
`},` <br>
`"subContentId": "fe4bcfab-7ec3-468c-a09c-a7a2d23bc2f2"` ist eine eindeutige Kennung, die dazu dient, einzelne Inhaltelemente oder Unterabschnitte innerhalb eines H5P-Pakets zu identifizieren. Kann erstmal freigelassen werden. Wird dann von z.B. Lumi automatisch vergeben. (Prüfen) <br>
`}` <br>
`],` <br>
`"helpTextLabel": "More information",` – Optional: Label für Hilfetexte <br>
`"helpText": ""` – Optional: Hilfetext <br>
`},` <br>
`"library": "H5P.StandardPage 1.5",` – Definiert die H5P-Bibliothek, die für die gesamte Seite verwendet wird <br>
`"metadata": {` – Metadaten der Seite <br>
`"contentType": "Standard page",` <br>
`"license": "U",` <br>
`"title": "Changes"` <br>
`},` <br>
`"subContentId": "4ad06395-77e8-42d2-ae27-eb0e9fc6ed3f"` Siehe Kommentar oben zu subContentId

Beispiel für die Startseite: <br>
```
{
        "params": {
          "elementList": [ 
            { 
              "params": { 
                "text": "Text" 
              }, 
              "library": "H5P.Text 1.1", 
              "metadata": { 
                "contentType": "Text", 
                "license": "U", 
                "title": "Untitled Text" 
              }, 
              "subContentId": "fe4bcfab-7ec3-468c-a09c-a7a2d23bc2f2" 
            } 
          ], 
          "helpTextLabel": "More information", 
          "helpText": "" 
        },
        "library": "H5P.StandardPage 1.5",
        "metadata": { 
          "contentType": "Standard page", 
          "license": "U", 
          "title": "Changes"
        }, 
        "subContentId": "4ad06395-77e8-42d2-ae27-eb0e9fc6ed3f" 
      },
```


- **Anpassung von Texten und Labels:**  
  Um die Benutzeroberfläche anzupassen, kannst du in den jeweiligen `params`-Objekten Texte ändern oder neue Labels hinzufügen.

- **Internationalisierung (i10n):**  
  Für zusätzliche Sprachen erweitere den `i10n`-Bereich oder passe die Lokalisierungsschlüssel in den einzelnen Seiten an.

- **Feedback und Bewertungen:**  
  Sollten weitere Funktionen wie zusätzliche Bewertungsstufen oder Feedback-Optionen benötigt werden, erweitere das `params`-Objekt der entsprechenden Seite (z. B. GoalsAssessmentPage).

---

## Hinweise zur Anpassung

- **Validierung:**  
  Achte darauf, dass der JSON-Code valide bleibt (z. B. alle Kommas, Anführungszeichen etc. korrekt gesetzt sind).  
- **Testen:**  
  Änderungen sollten immer in einer Testumgebung überprüft werden, bevor sie in den Main Branch übernommen werden.
- **Dokumentation aktualisieren:**  
  Passe diese README.md an, wenn neue Parameter oder Seiten hinzukommen, damit sie stets den aktuellen Stand widerspiegelt.

---

## Zusammenfassung

Diese README.md ist als Leitfaden für den JSON-Code des H5P Documentation Tools (JGU) gedacht. Sie erklärt den Aufbau und die einzelnen Komponenten und gibt Hinweise, wie und wo Erweiterungen vorgenommen werden können. Bei Fragen oder Unklarheiten sollten die offiziellen H5P-Dokumentationen und internen Entwicklerdokumente konsultiert werden.
