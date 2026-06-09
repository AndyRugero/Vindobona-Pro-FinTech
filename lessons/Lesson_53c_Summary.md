# Lesson 53c Summary: Google Maps API (Vienna ATM & Branch Finder) 🗺️🏧

Welcome to the summary of **Lesson 53c** (Vienna ATM & Branch Finder Integration).

---

## 📍 Key Concepts Learned

### 1. Geolocation & Map Integration
For a banking app, enabling customers to find ATMs or branch locations is a core feature. We use mapping services (like Google Maps Javascript API or Leaflet.js) to display interactive maps.

### 2. Backend Spatial Seed Data
We create a backend endpoint `GET /api/locations` that serves geo-coordinates (latitude and longitude) of physical ATMs and branches in Vienna.
```json
[
  {
    "id": "atm-stephansplatz",
    "name": "Stephansplatz ATM",
    "type": "ATM",
    "lat": 48.2082,
    "lng": 16.3738,
    "address": "Stephansplatz 1, 1010 Wien"
  },
  {
    "id": "branch-graben",
    "name": "Vienna Center Branch",
    "type": "Branch",
    "lat": 48.2087,
    "lng": 16.3698,
    "address": "Graben 21, 1010 Wien"
  }
]
```

### 3. Custom Map Styling (Premium Aesthetics)
To prevent the map from looking generic (bright yellow and green defaults), we apply custom JSON styling (dark mode theme) using Google Maps Cloud Styling or custom Map Options to match the premium dark/glassmorphic interface of Vindobona.

---

## 🏗️ Action Plan for Lesson 53c

### Step 1: Create the Locations API (`locations.js`)
*   Implement `GET /api/locations` returning a list of bank locations around Vienna (Stephansplatz, Karlsplatz, Prater, etc.).

### Step 2: Mount Locations Router (`server.js`)
*   Mount the router under `/api/locations`.

### Step 3: Frontend Map Component (`AtmMap.jsx`)
*   Implement a React map view component loading the Map script securely using environment variables (`VITE_GOOGLE_MAPS_API_KEY`).
*   Loop through fetched locations and place customized markers (a blue pin for ATMs, a gold pin for branches).
*   Add InfoWindows showing address and opening hours when markers are tapped.
