import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import type { Load } from '../../types/load.types';
import { getStateCentroid, getStateCodeFromInput } from '../../utils/geo';

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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const displayLoads = useMemo(() => {
    return loads.map((load) => {
      const originCoords =
        load.origin.coordinates?.lat && load.origin.coordinates?.lng
          ? { lat: load.origin.coordinates.lat, lng: load.origin.coordinates.lng }
          : getStateCentroid(getStateCodeFromInput(load.origin.state) || load.origin.state?.toUpperCase());

      const destinationCoords =
        load.destination.coordinates?.lat && load.destination.coordinates?.lng
          ? { lat: load.destination.coordinates.lat, lng: load.destination.coordinates.lng }
          : getStateCentroid(getStateCodeFromInput(load.destination.state) || load.destination.state?.toUpperCase());

      return {
        data: load,
        originCoords,
        destinationCoords
      };
    });
  }, [loads]);

  const validOriginPositions = displayLoads
    .filter((item) => item.originCoords)
    .map((item) => [item.originCoords!.lat, item.originCoords!.lng] as [number, number]);

  const bounds = useMemo(() => {
    if (!validOriginPositions.length) {
      return { center: [39.8283, -98.5795] as [number, number], zoom: 4 };
    }
    const center = validOriginPositions[Math.floor(validOriginPositions.length / 2)];
    return { center, zoom: 5 };
  }, [validOriginPositions]);

  const markers = displayLoads.filter((item) => item.originCoords);

  if (!isClient) {
    return (
      <div className="w-full min-h-[600px] rounded-xl overflow-hidden shadow-lg border-2 border-gray-200 bg-white flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-blue/20 border-t-primary-blue"></div>
        <p className="text-sm text-gray-500">Preparing map visualization…</p>
      </div>
    );
  }

  if (markers.length === 0) {
    return (
      <div className="w-full min-h-[600px] rounded-xl overflow-hidden shadow-lg border-2 border-dashed border-gray-300 bg-gradient-to-br from-slate-50 to-white flex flex-col items-center justify-center gap-4 text-center p-12">
        <div className="bg-blue-100 text-blue-600 h-16 w-16 rounded-full flex items-center justify-center shadow-inner">
          <span className="text-2xl font-bold">CL</span>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No locations available</h3>
          <p className="text-sm text-slate-500 max-w-md">
            These loads are missing precise coordinates. Try adjusting your filters or ensure origin/destination details include states or cities.
          </p>
        </div>
      </div>
    );
  }

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
        {markers.map(({ data: load, originCoords, destinationCoords }) => (
          <Marker
            key={load._id}
            position={[originCoords!.lat, originCoords!.lng]}
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
              {destinationCoords && (
              <Polyline
                positions={[
                    [originCoords!.lat, originCoords!.lng],
                    [destinationCoords.lat, destinationCoords.lng]
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
      </MapContainer>
    </div>
  );
};

export default LoadMap;

