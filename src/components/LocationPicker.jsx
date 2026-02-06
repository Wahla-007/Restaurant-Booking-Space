
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

export default function LocationPicker({ initialLat, initialLng, onConfirm, onClose }) {
    const defaultCenter = { lat: initialLat || 40.7128, lng: initialLng || -74.0060 }; // Default NY
    const [position, setPosition] = useState(initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass" style={{ width: '90%', height: '80%', maxWidth: '800px', display: 'flex', flexDirection: 'column', padding: '1.5rem', borderRadius: '12px', background: '#0f172a', border: '1px solid var(--glass-border)' }}>
                <h3 style={{ marginBottom: '1rem', color: 'white' }}>Pick Location on Map</h3>
                <div style={{ flex: 1, borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                    <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <LocationMarker position={position} setPosition={setPosition} />
                    </MapContainer>
                </div>
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {position ? `Selected: ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}` : 'Click on map to select'}
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
