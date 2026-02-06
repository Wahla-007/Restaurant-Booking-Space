
import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, StandaloneSearchBox } from '@react-google-maps/api';

// IMPORTANT: Replace this with your actual Google Maps API Key
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

const containerStyle = {
    width: '100%',
    height: '100%'
};

const defaultCenter = {
    lat: 40.7128,
    lng: -74.0060
};

const libraries = ["places"]; // Required for search box

export default function GoogleLocationPicker({ initialLat, initialLng, onConfirm, onClose }) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: libraries
    });

    const [position, setPosition] = useState(
        initialLat && initialLng
            ? { lat: initialLat, lng: initialLng }
            : defaultCenter
    );

    const [searchBox, setSearchBox] = useState(null);
    const mapRef = useRef(null);

    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);

    const onMapClick = useCallback((e) => {
        setPosition({
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        });
    }, []);

    const onSearchBoxLoad = useCallback((ref) => {
        setSearchBox(ref);
    }, []);

    const onPlacesChanged = () => {
        const places = searchBox.getPlaces();
        if (places.length === 0) return;

        const place = places[0];
        const location = place.geometry.location;

        setPosition({
            lat: location.lat(),
            lng: location.lng()
        });

        if (mapRef.current) {
            mapRef.current.panTo(location);
            mapRef.current.setZoom(15);
        }
    };

    if (loadError) {
        return (
            <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                Map failed to load. Check API Key.
                <button onClick={onClose} style={{ marginLeft: '1rem', padding: '0.5rem', background: 'white', color: 'black', border: 'none' }}>Close</button>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                Loading Google Maps...
            </div>
        );
    }

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass" style={{ width: '90%', height: '80%', maxWidth: '900px', display: 'flex', flexDirection: 'column', padding: '1.5rem', borderRadius: '12px', background: '#0f172a', border: '1px solid var(--glass-border)' }}>
                <h3 style={{ marginBottom: '1rem', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
                    Pick Location (Google Maps)
                    <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>Requires API Key</span>
                </h3>

                <div style={{ paddingBottom: '1rem' }}>
                    <StandaloneSearchBox
                        onLoad={onSearchBoxLoad}
                        onPlacesChanged={onPlacesChanged}
                    >
                        <input
                            type="text"
                            placeholder="Search for a place on Google Maps"
                            className="input"
                            style={{
                                boxSizing: `border-box`,
                                border: `1px solid transparent`,
                                width: `100%`,
                                height: `40px`,
                                padding: `0 12px`,
                                borderRadius: `3px`,
                                boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                                fontSize: `14px`,
                                outline: `none`,
                                textOverflow: `ellipses`,
                                background: 'white',
                                color: 'black'
                            }}
                        />
                    </StandaloneSearchBox>
                </div>

                <div style={{ flex: 1, borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={position}
                        zoom={15}
                        onLoad={onMapLoad}
                        onClick={onMapClick}
                        options={{
                            fullscreenControl: false,
                            streetViewControl: false,
                            mapTypeControl: false
                        }}
                    >
                        <Marker position={position} />
                    </GoogleMap>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {position ? `Selected: ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}` : 'Click on map or search'}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={onClose} className="btn glass" style={{ padding: '0.5rem 1rem' }}>Cancel</button>
                        <button
                            onClick={() => onConfirm(position)}
                            className="btn btn-primary"
                            disabled={!position}
                            style={{ padding: '0.5rem 1.5rem' }}
                        >
                            Confirm Location
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
