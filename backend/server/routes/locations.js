const express = require('express'); // 📥 Import Express
const router = express.Router(); // 🏗️ Initialize the Express Router
const authenticateToken = require('../middleware/authGuard'); // 🛡️ Import the auth guard middleware

// 🛡️ Fallback Safety Net: Curated list of premium Vienna ATM/Branch locations
const fallbackLocations = [
    {
        id: "atm-stephansplatz",
        name: "Stephansplatz ATM",
        type: "ATM",
        lat: 48.2082,
        lng: 16.3738,
        address: "Stephansplatz 1, 1010 Wien"
    },
    {
        id: "branch-graben",
        name: "Vienna Center Branch",
        type: "Branch",
        lat: 48.2087,
        lng: 16.3698,
        address: "Graben 21, 1010 Wien"
    },
    {
        id: "atm-karlsplatz",
        name: "Karlsplatz ATM",
        type: "ATM",
        lat: 48.2001,
        lng: 16.3692,
        address: "Karlsplatz U-Bahn Station, 1040 Wien"
    },
    {
        id: "atm-prater",
        name: "Praterstern ATM",
        type: "ATM",
        lat: 48.2185,
        lng: 16.3924,
        address: "Praterstern 1, 1020 Wien"
    },
    {
        id: "branch-belvedere",
        name: "Belvedere Financial Center",
        type: "Branch",
        lat: 48.1888,
        lng: 16.3804,
        address: "Prinz-Eugen-Straße 27, 1030 Wien"
    }
];

module.exports = (db) => {
    // 📖 GET: Fetch ATM/Branch locations
    // Path: GET http://localhost:5001/api/locations
    router.get('/', authenticateToken, async (req, res) => {
        try {
            // 🌐 1. Fetch live data from Vienna Open Data server
            const response = await fetch('https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:BANKAUSTRIAOGD&srsName=EPSG:4326&outputFormat=json', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            // ⚠️ 2. Check if the server response is successful and is JSON
            if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
                throw new Error('API offline, returning XML errors, or layout changed.');
            }

            // 📦 3. Parse response body as JSON
            const data = await response.json();
            
            // 🗺️ 4. Loop through features and convert to our coordinates schema
            if (data.features && Array.isArray(data.features)) {
                const liveLocations = data.features.map((feature, index) => {
                    // Extract longitude and latitude from GeoJSON
                    const [lng, lat] = feature.geometry.coordinates;
                    const strasse = feature.properties.STRASSE || 'Gasse';
                    const hausnummer = feature.properties.HAUSNUMMER || '';
                    
                    return {
                        id: `live-atm-${index}`,
                        name: `ATM - ${strasse} ${hausnummer}`.trim(),
                        type: 'ATM',
                        lat: parseFloat(lat), // Google Maps needs decimal floats
                        lng: parseFloat(lng),
                        address: `${strasse} ${hausnummer}, Wien`.trim()
                    };
                });

                return res.json(liveLocations);
            }

            throw new Error('Invalid GeoJSON structure received.');
        } catch (error) {
            // 🛡️ 5. Fallback Safety Net: If anything fails, use our local locations
            console.warn('⚠️ Vienna Government ATM server unreachable. Using fallback locations:', error.message);
            return res.json(fallbackLocations);
        }
    });

    // 📤 Return router back to main server.js
    return router;
};