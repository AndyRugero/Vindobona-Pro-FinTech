# 🏦 Lasten- und Pflichtenheft: Vindobona Pro FinTech

**Projektname:** Vindobona Pro FinTech  
**Projektträger:** Andy Rugero  
**Dokumentenversion:** 1.0.0  
**Datum:** 03. Juli 2026  
**Status:** Freigegeben  

---

## 1. Einleitung

### 1.1. Ausgangssituation
Im modernen Banken- und Finanzsektor ist der Zugriff auf schnelle, sichere und intuitive digitale Dienstleistungen ein entscheidender Erfolgsfaktor. Bestehende Online-Banking-Systeme sind jedoch häufig starr, bieten keine integrierten, datengestützten Hilfestellungen (wie Budget-Manager oder künstliche Intelligenz) und vernachlässigen oft die nahtlose Integration von lokalen Services wie einer Geldautomaten- und Filialsuche. Das Projekt **Vindobona Pro FinTech** setzt genau hier an und etabliert ein modulares, hochverfügbares Online-Banking-Dashboard, das speziell für den Großraum Wien konzipiert ist.

### 1.2. Zielsetzung
Das primäre Ziel dieses Projekts ist die Entwicklung und Bereitstellung einer webbasierten FinTech-Plattform. Diese Plattform kombiniert klassische Kernbanken-Funktionalitäten (Kontoführung, Ledger, Überweisungen, Währungs-Wallets) mit modernen Services wie einem KI-gestützten Finanzassistenten (Chatbot) und einer interaktiven Wiener Filial- und Geldautomatensuche (Leaflet-Map). Das System soll nach modernen Software-Engineering-Standards (Microservices, Docker, Kubernetes) entworfen und auf Cloud-Infrastrukturen (Azure, Vercel) hochverfügbar bereitgestellt werden.

### 1.3. Zielgruppe
* **Privatkunden (Endverbraucher):** Nutzen das Dashboard zur Verwaltung ihrer Wallets, zur Durchführung von simulierten Zahlungen und Überweisungen sowie zur Budgetplanung und Interaktion mit dem Chatbot.
* **Administratoren (Bankmitarbeiter):** Überwachen das System, verwalten Kontostände, führen Rollen-Updates durch und frieren bei Sicherheitsvorfällen Karten ein.
* **Sicherheits-Auditoren (Compliance-Beauftragte):** Analysieren die lückenlosen System- und Sicherheitsereignisse im Live-Audit-Log.

---

## 2. Projektbeschreibung

### 2.1. Vision
*Vindobona Pro FinTech* vereint Ästhetik und Hochleistung. Die Benutzeroberfläche folgt einem futuristischen, übersichtlichen Design-System (Dark Mode, Glassmorphismus, BEM-CSS-Richtlinien), während die Backend-Architektur durch Containerisierung (Docker) und Orchestrierung (Kubernetes) maximale Ausfallsicherheit und Skalierbarkeit im Enterprise-Bereich gewährleistet.

### 2.2. Hauptmerkmale (Scope)
Das System teilt sich in folgende funktionale Kernbereiche auf:
1. **Benutzerverwaltung & Sicherheit:** Registrierung, Login mit JWT (JSON Web Tokens), Passwort-Reset per E-Mail-Token, Google-OAuth-Integration sowie Zwei-Faktor-Authentifizierung (2FA).
2. **Multi-Währungs-Wallets (Multi-Currency System):** Verwaltung von Guthaben in verschiedenen Währungen (EUR, USD, GBP etc.) inklusive Wechselkurs-Rechner.
3. **Transaktions-Ledger (Hauptbuch):** Live-Feed aller Einnahmen und Ausgaben mit automatischer, KI-basierter Kategorisierung (z. B. Erkennung von "Netflix" als "Entertainment").
4. **KI-Chatbot-Assistent:** Integriertes Chat-Interface zur Auswertung von Transaktionen, zur Abfrage von Kontoständen und zur Finanzberatung per LLM-Anbindung.
5. **Wiener Geldautomaten- & Filialfinder:** Interaktive, kostenfreie Leaflet-Karte mit benutzerdefinierten Neon-Pins und Such-Sidebar.
6. **Budget-Manager:** Definition von monatlichen Ausgabenlimits pro Kategorie mit Echtzeit-Fortschrittsbalken und visueller Warnung bei Überschreitung.
7. **Mitglieder-Überweisungen (P2P):** Direktüberweisungen zwischen registrierten Benutzern der Plattform mit interaktiver Betragsauswahl.
8. **Admin-Panel & Sicherheits-Audit-Logs:** Rollenbasierter Zugriff (`role === 'admin'`) zur Überwachung aller Systembenutzer, Karten-Einfrierung und Live-Streaming von Sicherheitslogs.
9. **Kontoauszug-Export:** Generierung und direkter Download von Bankauszügen im CSV- und PDF-Format.

---

## 3. Anforderungen

### 3.1. Funktionale Anforderungen (Requirements)

| ID | Name | Beschreibung | Priorität |
| :--- | :--- | :--- | :--- |
| **FA-100** | **Authentifizierung** | Registrierung und Login via JWT. Absicherung kritischer API-Routen. | Hoch |
| **FA-101** | **Erweiterte Security** | Unterstützung von Google OAuth, E-Mail-Passwort-Reset und 2FA (Zwei-Faktor). | Mittel |
| **FA-200** | **Wallet-Management** | Erstellung von Wallets für EUR, USD, GBP. Anzeige der Kontostände. | Hoch |
| **FA-201** | **Währungswechsel** | Tausch von Währungen basierend auf aktuellen Wechselkursen. | Mittel |
| **FA-300** | **Transaktions-Ledger** | Hinzufügen, Auflisten und Filtern von Ledger-Einträgen. | Hoch |
| **FA-301** | **Kategorie-Prädiktion**| Automatisierte Zuweisung von Kategorien basierend auf Empfängername. | Mittel |
| **FA-400** | **KI-Chatbot** | Interaktiver Dialog über Transaktionsdaten und Kontostände via LLM-API. | Mittel |
| **FA-500** | **ATM- & Filialfinder** | Leaflet-Map mit Wiener Standorten, Suchleiste und Fly-to-Location. | Mittel |
| **FA-600** | **Budget-Manager** | Setzen von Limits pro Kategorie. Anzeige von Fortschritten (Ist vs. Soll). | Mittel |
| **FA-700** | **Admin-Panel** | Benutzerliste, Rollenzuweisung, Kontosperrung/Karten-Freezing. | Hoch |
| **FA-701** | **Audit-Logs** | Lückenlose Protokollierung von Logins, IP-Adressen und Aktionen im Admin-Feed. | Hoch |
| **FA-800** | **Dokumenten-Export** | Browser-Download von Transaktionen als CSV- und PDF-Dateien. | Mittel |

### 3.2. Nicht-funktionale Anforderungen (NFA)

* **NFA-100: Sicherheit & Datenschutz (DSGVO)**
  * Passwörter müssen mit einem starken Hashing-Algorithmus (bcrypt) in der Datenbank verschlüsselt werden.
  * Tokens dürfen keine sensiblen Passwörter im Payload enthalten und müssen eine begrenzte Lebensdauer aufweisen.
  * Einhaltung der DSGVO-Richtlinien durch Anonymisierungsmöglichkeiten und Transparenz der erfassten Logdaten.
* **NFA-200: Benutzerfreundlichkeit (Usability)**
  * Das Design-System muss reaktionsschnell (Responsive Design) sein und auf Desktops sowie mobilen Endgeräten fehlerfrei funktionieren.
  * Visuelles Feedback bei Ladezeiten (z. B. Shimmer-Effekte, Spinner) und Interaktionen (z. B. Micro-Animations bei Button-Hovers).
* **NFA-300: Leistung (Performance) & Zuverlässigkeit**
  * Antwortzeit der API-Schnittstellen unter normaler Last < 500 ms.
  * Schutz der API durch Rate-Limiting (z. B. maximal 100 Anfragen pro 15 Minuten pro IP).
* **NFA-400: Skalierbarkeit & Deployment (DevOps)**
  * Containerisierung der Backend-API mit Docker.
  * Orchestrierung mittels Kubernetes (K8s) mit einer Replika-Anzahl von mindestens 3 Pods zur Lastverteilung und Ausfallsicherung.
  * Automatisiertes Deployment (CI/CD) über GitHub Actions hin zu Azure App Services und Vercel.

---

## 4. Architektur und Technologie

### 4.1. Systemarchitektur
Die Anwendung basiert auf einer modernen Client-Server-Architektur, getrennt in ein Single Page Application (SPA) Frontend und eine RESTful Web API im Backend.

```mermaid
graph TD
    subgraph Client-Ebene (Frontend)
        A["React TSX Web App (Vite)"]
        B["Leaflet.js (Karten-Rendering)"]
    end
    
    subgraph Gateway & Security
        C["Nginx / Ingress Controller"]
        D["Express Rate Limiter"]
    end

    subgraph Server-Ebene (Backend API)
        E["Node.js / Express Server"]
        F["JWT Authentifizierung"]
        G["LLM-Chatbot-Service"]
    end

    subgraph Daten-Ebene (Storage)
        H[("PostgreSQL Database (Azure)")]
        I[("SQLite Database (Lokal)")]
    end

    A -->|HTTPS / API Requests| C
    C -->|Verteilt Traffic| D
    D -->|Validierte Anfragen| E
    E --> F
    E --> G
    E -->|Schreiben / Lesen| H
    E -->|Alternativ (Lokal)| I
```

### 4.2. Technologieschnitt (Tech Stack)
* **Frontend:** React 19.x, TypeScript (TSX), Vite, Vanilla CSS (BEM-Konvention), Lucide Icons, Leaflet Maps.
* **Backend:** Node.js, Express.js, JWT, `express-rate-limit`.
* **Datenbanken:** SQLite (für die lokale Entwicklung), PostgreSQL Flexible Server auf Microsoft Azure (für die Cloud-Produktion).
* **Infrastruktur & DevOps:** Docker, Kubernetes (YAML manifests), GitHub Actions (CI/CD), Vercel (Frontend-Hosting), Azure Web App for Containers (Backend-Hosting).

---

## 5. Zeitplan (Timeline)

Das Projekt wird in sechs Hauptphasen über ein Semester hinweg realisiert:

```
+--------------------------------------------------------------------------------+
| Phase 1: Spezifikation & Design (Wochen 1-2)                                   |
| =======>                                                                       |
| Phase 2: Kernentwicklung & Auth (Wochen 3-5)                                   |
|         ===========>                                                           |
| Phase 3: Erweiterte Features (Wochen 6-8)                                      |
|                     ===========>                                               |
| Phase 4: DevOps & Container (Wochen 9-10)                                      |
|                                 =======>                                       |
| Phase 5: Kubernetes & Cloud Deploy (Wochen 11-12)                              |
|                                         =======>                               |
| Phase 6: QA, Tests & Abgabe (Wochen 13-14)                                     |
|                                                 =======>                       |
+--------------------------------------------------------------------------------+
```

1. **Woche 01-02:** Erstellung des Lasten- und Pflichtenhefts, Design der UI-Wireframes (Sidebar, Topbar) und Datenmodellierung.
2. **Woche 03-05:** Entwicklung der User-Registrierung/Login (JWT, 2FA), Implementierung des Transaktions-Ledgers und Wallet-Systems.
3. **Woche 06-08:** Integration des AI-Chatbots, Entwicklung des ATM-Finders mit Leaflet und Anbindung des Budget-Managers.
4. **Woche 09-10:** Schreiben von Dockerfiles, Setup von Docker Compose, Implementierung von GitHub Actions CI/CD-Pipelines.
5. **Woche 11-12:** Schreiben von Kubernetes YAML-Manifesten (Deployments, Services, ConfigMaps, Secrets), Deployment auf Microsoft Azure.
6. **Woche 13-14:** Systemintegrationstests, Penetrationstests der API, Performance-Optimierung, Generierung der Dokumentation und finale PDF-Abgabe.

---

## 6. Risikobewertung

| ID | Risiko | Auswirkung | Wahrscheinlichkeit | Gegenmaßnahme (Mitigation) |
| :--- | :--- | :--- | :--- | :--- |
| **R-1** | **Sicherheitslücke bei JWT / Token-Diebstahl** | Hoch | Gering | HTTPS-Zwang, kurze Ablaufzeiten (Exp), Speicherung im Secure Context des Frontends, Implementierung von 2FA. |
| **R-2** | **Ausfall der Backend-API bei hoher Last** | Hoch | Mittel | Einsatz von Kubernetes (3 Replikate), automatische Skalierung, liveness/readiness Probes für Self-Healing. Rate-Limiting. |
| **R-3** | **Unerwartete Google-Maps API-Kosten** | Mittel | Hoch | Austausch von Google Maps durch die kostenfreie Leaflet.js-Bibliothek in Kombination mit OpenStreetMap-Daten. |
| **R-4** | **Halluzinationen des KI-Finanzassistenten** | Mittel | Mittel | System-Prompt-Beschränkungen (Context-Limiting), deutliche Kennzeichnung im UI, dass Antworten rein informativ sind. |
| **R-5** | **Datenbank-Datenverlust in Produktion** | Kritisch | Gering | Automatisierte Backups über Azure PostgreSQL Flexible Server, Trennung von Backup- und Live-Repositories. |

---

## 7. Zuständigkeiten

* **Andy Rugero (Student / Lead Developer):**
  * Gesamte Softwareentwicklung (Frontend React TSX, Backend Node.js, Datenbankmodelle).
  * Systemkonfiguration, Containerisierung (Docker) und Kubernetes-Manifeste.
  * Bereitstellung auf Azure und Vercel.
* **Antigravity AI (Pair Programming Partner & Technical Advisor):**
  * Review des Quellcodes auf Best Practices (BEM CSS, TSX-Skelette).
  * Unterstützung bei Debugging-Prozessen und der Formulierung von Bereitstellungsszenarien.
* **Fachbetreuung / Projekt-Prüfer (Hochschule):**
  * Regelmäßiges Feedback zu Meilensteinen.
  * Endabnahme des Pflichtenhefts und der lauffähigen Web-Applikation.

---

## 8. Genehmigung (Sign-off)

Mit den nachfolgenden Unterschriften wird dieses Lasten- und Pflichtenheft als vertragliche und technische Arbeitsgrundlage für das Projekt *Vindobona Pro FinTech* genehmigt.

\
**Projektleiter / Student:**
\
`_______________________________`  
*Andy Rugero*  

\
**Betreuer / Prüfer:**
\
`_______________________________`  
*(Name Fachbetreuer)*  

---

## 9. Mögliche Anhänge

### Anhang A: Datenbankschema (DDL)
Die Tabellenstruktur der SQLite/PostgreSQL-Datenbank sieht wie folgt aus:

* **`users`:** Speichert Benutzerprofile, Hashes, 2FA-Status und Rollen.
* **`transactions`:** Enthält Betrag, Datum, Empfänger, Kategorie und den ausführenden Benutzer.
* **`wallets`:** Verwaltet währungsspezifische Kontostände (EUR, USD, GBP) pro Benutzer.
* **`budgets`:** Speichert finanzielle Limits für Kategorien.
* **`audit_logs`:** Dokumentiert Sicherheitsereignisse und administrative Aktionen mit IP-Adresse und Zeitstempel.

### Anhang B: API-Routen (Schnittstellenspezifikation)
* `POST /api/users/register` - Registrierung eines neuen Benutzers
* `POST /api/auth/login` - Login mit Rückgabe des JWT
* `GET /api/transactions` - Abrufen des persönlichen Ledger-Verlaufs
* `POST /api/transactions` - Buchen einer neuen Transaktion
* `POST /api/transactions/transfer` - Geldtransfer zu einem anderen Mitglied
* `GET /api/budgets` - Abrufen der gesetzten Budgetlimits
* `POST /api/budgets` - Festlegen eines Budgetlimits pro Kategorie
* `GET /api/locations` - Abfragen der Wiener ATM- und Filial-Koordinaten
* `POST /api/chat` - Kommunikation mit dem AI-Finanzassistenten
* `GET /api/admin/logs` - Abrufen der Audit-Logs (nur für Administratoren)
