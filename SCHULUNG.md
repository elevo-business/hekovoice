# HEKO Voice CMS — Bedienungsanleitung

Diese Anleitung richtet sich an alle, die Inhalte der Webseite ändern — keine Programmierkenntnisse nötig.

---

## 1. Anmelden

1. Öffne `https://hekocms-preview.elevo.solutions/admin` im Browser.
2. Trage deine **E-Mail-Adresse** und dein **Passwort** ein.
3. Klick auf **„Anmelden"**.

> 💡 Wenn dein Passwort 5× falsch ist, wirst du für 1 Minute gesperrt. Falls das passiert: kurz warten, nicht hektisch werden.

---

## 2. Was du im CMS findest

In der **linken Sidebar** sind alle Bereiche:

| Symbol | Bereich | Was du dort machst |
| ------ | ------- | ------------------ |
| 📄 | **Startseite** | Alle Sections der Hauptseite (`heko-bs.de/voice`) |
| 📅 | **Termin-Seite** | Inhalte der Buchungs-Seite |
| 🖼️ | **Mediathek** | Bilder hochladen, verwalten, löschen |
| ⚙️ | **Einstellungen** | Telefonnummer, E-Mail, Tracking-IDs (nur Admin) |
| 👥 | **Benutzer** | Wer das CMS bedienen darf (nur Admin) |
| 💾 | **Backup** | Kompletten Stand als Datei sichern (nur Admin) |

---

## 3. Eine Section bearbeiten

Eine **Section** ist ein Block der Webseite — z.B. der Hero, die Preisliste, die FAQ, das Team, ein Banner.

### So geht's:

1. Klicke in der Sidebar auf **Startseite** oder **Termin-Seite**.
2. Du siehst eine Liste aller Sections der Seite, von oben nach unten.
3. **Klicke auf den Text** einer Section → Editor öffnet sich.
4. Felder ausfüllen.
5. Klick **„Speichern"**.
6. Änderung ist innerhalb von ~1 Sekunde live.

> ✅ **Tipp:** Klicke neben dem „Speichern"-Button auf **„↗ Vorschau"**, um die Live-Seite in einem neuen Tab zu öffnen und das Ergebnis zu sehen.

### Sections sortieren

Greife eine Section am **⋮⋮**-Symbol links und ziehe sie nach oben oder unten. Die Reihenfolge wird **automatisch gespeichert**.

### Section ausblenden (ohne löschen)

Klicke auf das **👁️**-Symbol rechts. Die Section wird grau dargestellt und ist auf der Webseite nicht mehr sichtbar — bleibt aber im CMS gespeichert. Wieder einblenden mit nochmaligem Klick.

### Section löschen (nur Admin)

Klicke auf **🗑** rechts. Es kommt eine Sicherheitsabfrage. **Achtung:** Löschen kann über den Versionsverlauf NICHT rückgängig gemacht werden. Wenn du unsicher bist: lieber **ausblenden** statt löschen.

### Section hinzufügen (nur Admin)

Oben rechts auf **„+ Section hinzufügen"**. Wähle einen Typ aus:

- **Hero** — Startbereich mit Headline und Buttons
- **Kundenstimmen** — Zitate von Kunden
- **Preise & Pakete** — Tarif-Tabelle
- **FAQ** — Frage-Antwort-Liste
- **Call-to-Action Banner** — Aufruf zur Aktion
- **HTML-Block (frei)** — beliebiger HTML-Code (für Spezialfälle)

---

## 4. Versionsverlauf — Änderungen rückgängig machen

Jedes Speichern erzeugt automatisch eine **Version** der Section.

### So gehst du zurück zu einer alten Version:

1. Section öffnen (klicken).
2. Im Editor oben auf den **„Versionen"**-Tab.
3. Liste mit allen früheren Ständen erscheint, mit Datum und ggf. Kommentar.
4. Bei der gewünschten Version auf **„Wiederherstellen"** klicken.
5. Der alte Stand wird wieder eingespielt — der aktuelle Stand wird ebenfalls als Version gesichert (nichts geht verloren).

> 💡 **Bis zu 50 Versionen pro Section** werden gespeichert. Bei jedem Save wird eine neue erstellt.

---

## 5. Bilder verwalten — Mediathek

### Bild hochladen

1. Sidebar → **🖼️ Mediathek**.
2. Oben rechts auf **„+ Bild hochladen"**.
3. Bild auswählen (max. **10 MB**, Formate: JPG, PNG, WebP, GIF, SVG, AVIF).
4. Bild erscheint in der Galerie.

### Alt-Text setzen (wichtig für SEO und Barrierefreiheit)

Tippe direkt im **„Alt-Text…"**-Feld unter dem Bild. Wird automatisch beim Verlassen des Felds gespeichert.

### Bild in einer Section verwenden

1. Bild in Mediathek hochladen.
2. Auf **„URL kopieren"** klicken.
3. In der Section-Bearbeitung URL einfügen (im jeweiligen Bild-Feld).

### Bild löschen (nur Admin)

Vorsicht — wenn das Bild noch in einer Section verwendet wird, erscheint dort ein „kaputtes Bild"-Symbol. **Vorher prüfen!**

---

## 6. Globale Einstellungen (nur Admin)

Sidebar → **⚙️ Einstellungen**

Hier änderst du Werte, die auf der **gesamten Webseite** wirken:

| Bereich | Was?                                                       |
| ------- | ---------------------------------------------------------- |
| **Site & SEO** | Seitentitel, Meta-Beschreibung, OG-Bild für Social-Sharing |
| **Kontakt** | Telefonnummer, E-Mail, WhatsApp                            |
| **Firmendaten** | Impressum-Pflichtangaben                                   |
| **Tracking** | Google Tag Manager, GA4, Google Ads, Meta Pixel            |
| **Integrationen** | Pipedrive Form-URL                                         |

Ändere die Werte und klick **„Speichern"** oben rechts. Live in unter 1 Sekunde.

> ⚠️ **Tracking-IDs** sind kritisch — falsche IDs brechen das Conversion-Tracking. Im Zweifel mit der Marketing-Abteilung absprechen.

---

## 7. Benutzer verwalten (nur Admin)

Sidebar → **👥 Benutzer**

### Neuen Benutzer anlegen

1. **„+ Benutzer anlegen"** oben rechts.
2. Name, E-Mail, Rolle, Passwort eintragen (min. 10 Zeichen).
3. **Speichern**.

### Rollen

- **Editor** — kann Inhalte und Bilder bearbeiten, aber keine Sections löschen, keine Settings ändern, keine Benutzer verwalten.
- **Admin** — darf alles.

### Passwort zurücksetzen

Benutzer öffnen → neues Passwort eingeben → speichern. Der Benutzer muss sich danach mit dem neuen Passwort einloggen.

> 🔒 Es muss immer **mindestens 1 Admin** geben — der letzte Admin kann nicht gelöscht oder herabgestuft werden.

---

## 8. Backup erstellen (nur Admin)

Sidebar → **💾 Backup** → **„⬇ Backup herunterladen"**

Lädt eine **JSON-Datei** mit:
- Allen Sections (allen Seiten)
- Allen Einstellungen
- Allen Benutzern (ohne Passwörter)
- Mediathek-Metadaten (nicht die Bilder selbst)

> 💡 Es gibt zusätzlich **automatische Backups** auf dem Server. Manuelles Backup vor großen Änderungen ist trotzdem empfehlenswert.

---

## 9. Was tun, wenn…

### …die Webseite nach einer Änderung kaputt aussieht?

1. Editor der Section wieder öffnen.
2. **„Versionen"**-Tab → vorletzte Version → **„Wiederherstellen"**.
3. Falls mehrere Sections gleichzeitig geändert wurden: Backup einspielen lassen (bitte beim Admin/IT melden).

### …ich aus Versehen eine Section gelöscht habe?

Beim Admin/IT melden — das **Backup** vom Vortag wird eingespielt. Im Idealfall: vorher **ausblenden** statt löschen.

### …ich mein Passwort vergessen habe?

Bei einem Admin melden — der kann ein neues Passwort setzen.

### …die Vorschau leer ist oder nicht aktualisiert?

Browser-Cache leeren (Strg + F5 / Cmd + Shift + R). Cloudflare cached die Seite — bei Änderungen wird das automatisch geleert, kann aber 1–2 Minuten dauern.

### …das System langsam ist?

Bei sehr großen HTML-Blöcken (mehr als ein paar hundert Zeilen) wird der Editor träge. Tipp: solche Blöcke in mehrere kleinere Sections aufteilen.

---

## 10. Best Practices

✅ **Speichern, dann Vorschau anschauen** — bevor du die nächste Section anfasst.
✅ **Bei Pricing/FAQ etc.** den typisierten Editor benutzen, nicht „HTML-Block (frei)".
✅ **Alt-Texte** für jedes Bild — gut für SEO und Barrierefreiheit.
✅ **Backup** vor jeder größeren Änderung.
✅ **Tracking-IDs** zweimal kontrollieren bevor speichern.

❌ Nicht direkt im **HTML-Block** scrollen, wenn du nur kleine Texte ändern willst — typisierten Editor öffnen.
❌ Keine **Skripte** (`<script>...`) in HTML-Blöcke einfügen — Risiko + bricht die Seite oft.
❌ Nicht **mehrere Personen gleichzeitig** dieselbe Section bearbeiten — der letzte gewinnt.

---

## 11. Hilfe & Kontakt

- **Technische Probleme:** elevo Solutions — `hey@elevo.solutions`
- **Fragen zu Inhalten:** intern mit eurem Team klären
- **Notfall (Seite offline):** elevo Solutions anrufen

---

*Stand: Mai 2026 · Version 1.0 · Diese Anleitung wird bei größeren Updates aktualisiert.*
