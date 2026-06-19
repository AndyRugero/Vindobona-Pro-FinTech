// 📥 1. IMPORT NECESSARY REACT TOOLS & ICONS
import React, { useState, useEffect, useRef } from 'react';
// Lucide icons: MapPin = marker pin, Search = search magnifying glass
import { MapPin, Search } from 'lucide-react';
// Import the Stylesheet (completely separate from TSX - no inline styles!)
import '../Styles/ATMMap.css';
// Import our backend API address
import { API_BASE_URL } from '../config';

// 📐 2. TYPESCRIPT DATA CONTRACTS (INTERFACES)
interface ATMMapProps {
    token: string | null; // Secure user JWT authentication token
}

interface LocationItem {
    id: string;
    name: string;
    type: 'ATM' | 'Branch';
    lat: number;
    lng: number;
    address: string;
}

// 🏗️ 3. THE ATMMAP COMPONENT FUNCTION
const ATMMap: React.FC<ATMMapProps> = ({ token }) => {
    // 💾 React Memory States
    const [locations, setLocations] = useState<LocationItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [mapLoaded, setMapLoaded] = useState(false); // True when Leaflet CDN scripts finished loading
    const [fetchError, setFetchError] = useState<string | null>(null); // Track network/API errors

    // References to hold the Leaflet map object and HTML container element in memory
    const mapRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    // 🌐 useEffect A: Dynamically loads Leaflet CSS and JS files from CDN on mount
    useEffect(() => {
        // If Leaflet is already loaded in the window, skip downloading
        if ((window as any).L) {
            setMapLoaded(true);
            return;
        }

        // 1. Inject Leaflet CSS stylesheet into HTML <head>
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        cssLink.crossOrigin = '';
        document.head.appendChild(cssLink);

        // 2. Inject Leaflet JS library script into HTML <body>
        const jsScript = document.createElement('script');
        jsScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        jsScript.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        jsScript.crossOrigin = '';

        jsScript.onload = () => {
            setMapLoaded(true);
        };
        document.body.appendChild(jsScript);
    }, []);

    // 📡 FETCH: Retrieve ATM/Branch coordinate lists from database
    const fetchLocations = async () => {
        if (!token) {
            setFetchError("Missing authentication token.");
            return;
        }
        try {
            setFetchError(null);
            const response = await fetch(`${API_BASE_URL}/api/locations`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Pass JWT token securely
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setLocations(data);
            } else {
                const errData = await response.json().catch(() => ({}));
                setFetchError(errData.error || `Server returned error ${response.status}`);
            }
        } catch (error: any) {
            console.error('Failed to fetch ATM locations:', error);
            setFetchError(error.message || 'Failed to connect to the backend server.');
        }
    };

    // 🌐 useEffect B: Fetches location data once the Leaflet CDN script is ready
    useEffect(() => {
        if (mapLoaded && token) {
            fetchLocations();
        }
    }, [mapLoaded, token]);

    // 🗺️ useEffect C: Initializes the Leaflet map and applies the dark mode theme skin
    useEffect(() => {
        if (!mapLoaded || !mapContainerRef.current || mapRef.current) return;

        const L = (window as any).L;

        // Center the map on Vienna coordinates [48.2082, 16.3738]
        mapRef.current = L.map(mapContainerRef.current).setView([48.2082, 16.3738], 13);

        // Load CartoDB dark mode map tile skin
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            maxZoom: 20
        }).addTo(mapRef.current);
    }, [mapLoaded]);

    // 📍 useEffect D: Places custom markers for each location on the map
    useEffect(() => {
        if (!mapLoaded || !mapRef.current || locations.length === 0) return;

        const L = (window as any).L;

        // Create a marker layers group
        const markersGroup = L.featureGroup().addTo(mapRef.current);

        locations.forEach(loc => {
            // Determine marker class based on type (Branch is cyan, ATM is blue)
            const markerClass = loc.type === 'Branch' ? 'map-pin branch' : 'map-pin atm';

            // Create custom HTML icon (completely styled inside ATMMap.css!)
            const customIcon = L.divIcon({
                className: 'custom-map-icon-container',
                html: `<div class="${markerClass}"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            });

            // Place marker on map coordinates
            const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });

            // Bind popup card details
            marker.bindPopup(`
                <div class="map-popup-card">
                    <h4>${loc.name}</h4>
                    <span class="popup-badge">${loc.type}</span>
                    <p>${loc.address}</p>
                </div>
            `);

            marker.addTo(markersGroup);
        });

        // Zoom map to fit all pins inside view bounds
        mapRef.current.fitBounds(markersGroup.getBounds().pad(0.1));

        // Cleanup: remove old markers on update or page change
        return () => {
            markersGroup.clearLayers();
        };
    }, [locations, mapLoaded]);

    // 🔍 FILTER: Filter locations dynamically as you search
    const filteredLocations = locations.filter(loc => {
        const query = searchTerm.toLowerCase().trim();

        // If search is empty, show all locations
        if (!query) return true;

        // 1. Standard matches for name and address
        const nameMatches = loc.name.toLowerCase().includes(query);
        const addressMatches = loc.address.toLowerCase().includes(query);

        // 2. Smart Match: If user types "vienna", also check if the address contains "wien"
        const isViennaQuery = query === 'vienna' || query === 'vienna branch' || query === 'vienna atm';
        const addressViennaMatches = isViennaQuery && loc.address.toLowerCase().includes('wien');

        return nameMatches || addressMatches || addressViennaMatches;
    });

    // 🎯 CLICK HANDLER: Center and zoom in on the chosen location, then open its popup
    const handleSelectLocation = (loc: LocationItem) => {
        if (!mapRef.current) return;

        const L = (window as any).L;

        // Zoom in to level 16 on coordinate
        mapRef.current.setView([loc.lat, loc.lng], 16);

        // Open popup
        L.popup()
            .setLatLng([loc.lat, loc.lng])
            .setContent(`
                <div class="map-popup-card">
                    <h4>${loc.name}</h4>
                    <span class="popup-badge">${loc.type}</span>
                    <p>${loc.address}</p>
                </div>
            `)
            .openOn(mapRef.current);
    };

    return (
        <div className="map-view-container">
            {!mapLoaded ? (
                <div className="map-loading-screen">
                    <div className="spinner"></div>
                    <p>Loading Vienna branch map...</p>
                </div>
            ) : (
                <div className="map-grid-layout">
                    {/* Left Sidebar Pane */}
                    <div className="map-sidebar-panel">
                        <div className="map-sidebar-header">
                            <h3>Find branches & ATMs</h3>
                            <p>Locate active cash networks in Vienna</p>
                        </div>

                        {/* Search Input */}
                        <div className="map-search-bar">
                            <Search size={16} className="search-icon" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search Vienna locations..."
                            />
                        </div>

                        {/* Error Message if Fetch Fails */}
                        {fetchError && (
                            <div className="map-error-banner">
                                ⚠️ {fetchError}
                            </div>
                        )}

                        {/* Scrollable Location listings */}
                        <div className="map-locations-list">
                            {filteredLocations.map(loc => (
                                <div
                                    key={loc.id}
                                    className="map-location-card"
                                    onClick={() => handleSelectLocation(loc)}
                                >
                                    <div className="map-card-row">
                                        <span className="map-card-title">{loc.name}</span>
                                        <span className={`map-card-badge ${loc.type.toLowerCase()}`}>
                                            {loc.type}
                                        </span>
                                    </div>
                                    <div className="map-card-addr">
                                        <MapPin size={12} className="pin-icon" />
                                        <span>{loc.address}</span>
                                    </div>
                                </div>
                            ))}
                            {filteredLocations.length === 0 && (
                                <span className="map-empty-message">No active locations found.</span>
                            )}
                        </div>
                    </div>

                    {/* Right Map Canvas Element */}
                    <div className="map-view-canvas">
                        <div ref={mapContainerRef} className="map-canvas-element" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ATMMap;