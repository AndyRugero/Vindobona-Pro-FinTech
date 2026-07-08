# 🎤 5-Minuten-Präsentation: Vindobona Pro FinTech

Dieses Dokument enthält Ihren Sprechtext (Script) und Folien-Notizen für eine 5-minütige Präsentation vor Ihrem Fachbetreuer Constantin Köpplinger. Die Sprache ist in einfachem, klarem Deutsch gehalten.

---

## 📊 Folie 1: Titelblatt (Begrüßung)
* **Visualisierung:** Projekttitel "Vindobona Pro FinTech", Ihr Name, Datum.
* **Zeit:** ~30 Sekunden

**Sprechtext:**
> "Guten Tag, Herr Köpplinger. Ich freue mich, Ihnen heute mein Specialized Project **Vindobona Pro FinTech** vorzustellen.
>
> In dieser Präsentation zeige ich Ihnen, wie ich ein sicheres und intelligentes Online-Banking-Dashboard entwickelt habe, das speziell für Kunden im Raum Wien konzipiert ist."

---

## 📊 Folie 2: Das Problem & Die Motivation
* **Visualisierung:** Stichpunkte zur Ausgangssituation (Alte Banking-Apps, keine Budget-Tools, fehlende Geldautomaten-Suche).
* **Zeit:** ~45 Sekunden

**Sprechtext:**
> "Warum habe ich dieses Projekt entwickelt?
>
> Viele klassische Banking-Apps sind heute starr, kompliziert und bieten den Benutzern zu wenig Hilfe im Alltag. Kunden wollen heute mehr als nur Zahlen sehen:
> 1. Sie wollen genau wissen, wo ihr Geld hingeht.
> 2. Sie brauchen schnelle, lokale Hilfen wie eine Suche für Geldautomaten.
> 3. Sie wünschen sich einen intelligenten Berater für Fragen.
>
> Mit *Vindobona Pro FinTech* habe ich diese modernen Features in einer einzigen App zusammengefasst."

---

## 📊 Folie 3: Die Kern-Features der App
* **Visualisierung:** Icons oder Bilder zu den Funktionen (Wallets, ATM-Karte, KI-Chatbot, Diagramme, FX-Währungsrechner).
* **Zeit:** ~60 Sekunden

**Sprechtext:**
> "Was kann die Web-Applikation? Sie bietet drei große Bereiche:
>
> Erstens, die **Finanzverwaltung**: Der Benutzer hat Wallets für Euro, Dollar und Pfund. Es gibt einen echten **FX-Währungsrechner**, mit dem man Geld sofort wechseln kann. Zudem werden alle Ausgaben in Kreis- und Balkendiagrammen visuell dargestellt.
>
> Zweitens, die **lokalen Wiener Services**: Ich habe eine interaktive OpenStreetMap-Karte mit Leaflet eingebaut, die alle Geldautomaten und Bankfilialen in Wien anzeigt.
>
> Drittens, der **KI-Finanzassistent**: Ein integrierter Chatbot beantwortet Fragen zum Kontostand oder gibt Tipps zum Sparen."

---

## 📊 Folie 4: Sicherheit & Diebstahlschutz
* **Visualisierung:** Symbole für Sicherheit (2FA, Schloss/Einfrieren, SQL-Transaktion, Nginx-Schild).
* **Zeit:** ~60 Sekunden

**Sprechtext:**
> "Ein sehr wichtiger Punkt bei Banken-Apps ist natürlich die Sicherheit. Hier habe ich vier Mechanismen implementiert:
>
> 1. **Datenbank-Transaktionen (SQL):** Bei Überweisungen gilt: Entweder wird die Transaktion komplett durchgeführt oder gar nicht (Rollback). Es kann kein Geld verloren gehen.
> 2. **Karten-Einfrierung (Card Freezing):** Wenn ein Benutzer seine Karte verliert, kann er sie mit einem Klick sofort einfrieren. Jede weitere Zahlung wird blockiert.
> 3. **Zwei-Faktor-Authentifizierung (2FA):** Wichtige Aktionen erfordern einen Einmalcode aus einer App wie dem Google Authenticator.
> 4. **Audit Logs:** Jeder Login-Versuch und jede Überweisung werden sicher protokolliert."

---

## 📊 Folie 5: Architektur \& Nginx Reverse Proxy
* **Visualisierung:** Das rechteckige Architektur-Diagramm aus dem Anhang des Lastenhefts.
* **Zeit:** ~45 Sekunden

**Sprechtext:**
> "Schauen wir uns kurz die Technologie an:
> Das Frontend läuft mit React und TypeScript. Das Backend ist eine Node.js Express API.
>
> Ganz wichtig für die Sicherheit ist der **Nginx Reverse Proxy**. Genau wie bei Großbanken wie der *Erste Group* oder *Raiffeisen* ist unser API-Server niemals direkt aus dem Internet erreichbar. Nginx steht an der Grenze, leitet Anfragen weiter, blockiert Spam durch Rate-Limiting und versteckt die internen Ports."

---

## 📊 Folie 6: DevOps, Cloud \& Qualitätssicherung
* **Visualisierung:** DevOps Logos (Docker, Kubernetes, Azure) und das Wort "Unit Tests".
* **Zeit:** ~40 Sekunden

**Sprechtext:**
> "Für das Deployment habe ich die App mit **Docker** containerisiert. Die Verwaltung der Container übernimmt **Kubernetes** mit 3 Replikaten in der Cloud auf **Microsoft Azure**.
>
> Um sicherzustellen, dass das System fehlerfrei läuft, habe ich automatisierte **Unit-Tests** geschrieben. Diese testen die Login-Logik, die Passwort-Verschlüsselung und alle Währungsumrechnungen vor jedem Start."

---

## 📊 Folie 7: Fazit & Fragen
* **Visualisierung:** Zusammenfassung der Vorteile, "Vielen Dank für Ihre Aufmerksamkeit!", Platz für Fragen.
* **Zeit:** ~20 Sekunden

**Sprechtext:**
> "Zusammenfassend ist *Vindobona Pro FinTech* ein sicheres, modernes Online-Banking-Dashboard, das modernste Technologien wie Containerisierung, Nginx-Security und KI nutzt.
>
> Vielen Dank für Ihre Aufmerksamkeit. Ich freue mich nun auf Ihre Fragen zum Projekt."
