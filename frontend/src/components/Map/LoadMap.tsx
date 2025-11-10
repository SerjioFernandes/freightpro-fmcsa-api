import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
// @ts-ignore - no types available for @changey/react-leaflet-markercluster
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import type { Load } from '../../types/load.types';

declare global {
  interface Window {
    L?: typeof L;
  }
}

interface LoadMapProps {
  loads: Load[];
  onLoadClick?: (load: Load) => void;
  selectedLoadId?: string;
}

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LoadMap = ({ loads, onLoadClick, selectedLoadId }: LoadMapProps) => {
  const [clusterReady, setClusterReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadClusterResources = async () => {
      if (typeof window === 'undefined') {
        return;
      }

      window.L = window.L || L;

      try {
        await Promise.all([
          import('leaflet.markercluster'),
          import('leaflet.markercluster/dist/MarkerCluster.css'),
          import('leaflet.markercluster/dist/MarkerCluster.Default.css'),
        ]);

        if (isMounted) {
          setClusterReady(true);
        }
      } catch (error) {
        console.error('Failed to load Leaflet marker cluster plugin', error);
      }
    };

    loadClusterResources();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!clusterReady) {
    return (
      <div className="w-full min-h-[600px] rounded-xl overflow-hidden shadow-lg border-2 border-gray-200 bg-white flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-blue/20 border-t-primary-blue"></div>
        <p className="text-sm text-gray-500">Loading interactive map…</p>
      </div>
    );
  }

  // Calculate bounds for all loads
  const calculateBounds = () => {
    const validCoords: [number, number][] = [];
    
    loads.forEach(load => {
      if (load.origin.coordinates?.lat && load.origin.coordinates?.lng) {
        validCoords.push([load.origin.coordinates.lat, load.origin.coordinates.lng]);
      }
      if (load.destination.coordinates?.lat && load.destination.coordinates?.lng) {
        validCoords.push([load.destination.coordinates.lat, load.destination.coordinates.lng]);
      }
    });

    if (validCoords.length === 0) {
      return { center: [39.8283, -98.5795] as [number, number], zoom: 4 }; // Center of USA
    }

    // Simple bounds calculation (not using fitBounds here to avoid auto-recenter on updates)
    const center: [number, number] = validCoords.length > 0
      ? validCoords[Math.floor(validCoords.length / 2)]
      : [39.8283, -98.5795];

    return { center, zoom: 5 };
  };

  const bounds = calculateBounds();

  // Create markers for each load
  const markers = loads
    .filter(load => load.origin.coordinates?.lat && load.origin.coordinates?.lng)
    .map(load => ({
      load,
      position: [load.origin.coordinates!.lat!, load.origin.coordinates!.lng!] as [number, number]
    }));

  return (
    <div className="w-full h-full min-h-[600px] rounded-xl overflow-hidden shadow-lg border-2 border-gray-200">
      <MapContainer
        center={bounds.center}
        zoom={bounds.zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={60}
        >
          {markers.map(({ load, position }) => (
            <Marker
              key={load._id}
              position={position}
              eventHandlers={{
                click: () => onLoadClick?.(load)
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg mb-2">{load.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{load.description}</p>
                  <div className="text-xs space-y-1">
                    <p><strong>Origin:</strong> {load.origin.city}, {load.origin.state}</p>
                    <p><strong>Destination:</strong> {load.destination.city}, {load.destination.state}</p>
                    <p><strong>Equipment:</strong> {load.equipmentType}</p>
                    <p className="text-green-600 font-bold">${load.rate.toLocaleString()}</p>
                    {onLoadClick && (
                      <button
                        onClick={() => onLoadClick(load)}
                        className="mt-2 w-full bg-primary-blue text-white px-3 py-1 rounded hover:bg-primary-blue-dark transition-colors"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
              
              {/* Route line if destination coordinates available */}
              {load.destination.coordinates?.lat && load.destination.coordinates?.lng && (
                <Polyline
                  positions={[
                    [load.origin.coordinates!.lat!, load.origin.coordinates!.lng!],
                    [load.destination.coordinates.lat, load.destination.coordinates.lng]
                  ] as LatLngExpression[]}
                  pathOptions={{
                    color: selectedLoadId === load._id ? '#ff6a3d' : '#2563eb',
                    weight: selectedLoadId === load._id ? 4 : 2,
                    opacity: 0.7
                  }}
                  eventHandlers={{
                    click: () => onLoadClick?.(load)
                  }}
                />
              )}
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default LoadMap;

