# Lesson 24: External Data Integration (CSV Imports)

## 1. The Concept: Integrations (Stage 4)
According to the Vindobona Pro Roadmap, Stage 4 transitions the app from a closed system into an open one that communicates with the outside world. The first major milestone is allowing users to import real banking data.

Bank statements are universally exported as **CSV (Comma Separated Values)** files. 

## 2. The Implementation Plan
To build this, we will need to utilize the browser's native file-reading capabilities.

### Key Components to Build:
1.  **The UI:** A drag-and-drop or file-selection zone where users can upload their `.csv` file.
2.  **The Parser (`FileReader`):** Native JavaScript logic to open the uploaded file and read the raw text.
3.  **The Data Mapper:** Logic to read the comma-separated text, split it into rows, and convert those rows into `Transaction` objects (mapping the bank's format to our App's format).
4.  **Bulk Injection:** Sending the newly created array of transactions into our central `useTransactions` hook so they are instantly saved to Local Storage and displayed on the Dashboard.

*Note: This lesson marks the official start of Stage 4 (Integrations Layer).*
