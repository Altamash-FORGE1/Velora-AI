import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Phone, Navigation, Crosshair, Loader2, Building2, Search, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { useAuth } from './AuthContext';

// Custom component to handle map centering
const MapController = ({ setMapInstance }) => {
  const map = useMap();
  useEffect(() => {
    if (map) setMapInstance(map);
  }, [map, setMapInstance]);
  return null;
};

const DoctorFinder = () => {
  const { theme } = useAuth();
  const [userLocation, setUserLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [map, setMap] = useState(null);

  const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

  // Custom Icon: Blue Pulse for User
  const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: `<div class="relative">
            <div class="absolute -inset-2 bg-sky-500 rounded-full animate-ping opacity-25"></div>
            <div class="relative w-4 h-4 bg-sky-500 border-2 border-white rounded-full shadow-lg"></div>
          </div>`,
    iconSize: [16, 16],
  });

  // Custom Icon: Red Cross for Doctors/Hospitals
  const medicalIcon = L.divIcon({
    className: 'medical-marker',
    html: `<div class="p-2 bg-rose-500 rounded-lg shadow-lg border border-rose-400/50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="white" stroke-width="3" fill="none">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const fetchNearbyDoctors = useCallback(async (lat, lon) => {
    setLoading(true);
    if (!GEOAPIFY_KEY) {
      console.error("Geoapify API key is missing. Please check your .env file.");
      setLoading(false);
      return;
    }
    try {
      const url = `https://api.geoapify.com/v2/places?categories=healthcare.hospital,healthcare.doctor&filter=circle:${lon},${lat},5000&limit=20&apiKey=${GEOAPIFY_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      setPlaces(data.features || []);
    } catch (error) {
      console.error("Error fetching places:", error);
    } finally {
      setLoading(false);
    }
  }, [GEOAPIFY_KEY]);

  const handleLocateMe = useCallback(() => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const pos = [latitude, longitude];
          setUserLocation(pos);
          if (map) map.setView(pos, 14);
          fetchNearbyDoctors(latitude, longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          const fallback = [12.9716, 77.5946];
          setUserLocation(fallback);
          if (map) map.setView(fallback, 14);
          fetchNearbyDoctors(fallback[0], fallback[1]);
        }
      );
    }
  }, [fetchNearbyDoctors, map, GEOAPIFY_KEY]);

  // Only trigger location logic once the map instance is ready
  useEffect(() => {
    if (map) {
      handleLocateMe();
    }
  }, [map, handleLocateMe]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(searchQuery)}&apiKey=${GEOAPIFY_KEY}`);
      const data = await res.json();
      if (data.features?.length > 0) {
        const [lon, lat] = data.features[0].geometry.coordinates;
        const pos = [lat, lon];
        setUserLocation(pos);
        if (map) map.setView(pos, 14);
        fetchNearbyDoctors(lat, lon);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 h-[calc(100vh-120px)] flex flex-col">
      <div className={`flex-1 flex flex-col relative overflow-hidden rounded-[2.5rem] backdrop-blur-xl border shadow-2xl transition-all duration-500 ${
        theme === 'dark' ? 'bg-slate-900/40 border-white/10' : 'bg-white/80 border-slate-200'
      }`}>
        
        {/* Header Section */}
        <div className="p-8 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500/20 rounded-2xl">
              <Building2 className="text-rose-400" size={28} />
            </div>
            <div>
              <h2 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                Medical <span className="text-sky-400">Locator</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Finding care within 5km of your location</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative group min-w-[300px]">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city or area..."
                className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm border transition-all ${
                  theme === 'dark' ? 'bg-black/20 border-white/10 text-white focus:border-sky-500/50' : 'bg-slate-100 border-slate-200 text-slate-800 focus:border-sky-400'
                }`}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            </form>
            <button 
              onClick={handleLocateMe}
              className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-2xl hover:bg-sky-500/20 transition-all"
              title="My Location"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Crosshair size={20} />}
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Sidebar */}
          <div className={`w-full lg:w-80 border-r overflow-y-auto custom-scrollbar ${
            theme === 'dark' ? 'border-white/5 bg-black/20' : 'border-slate-100 bg-slate-50/30'
          }`}>
            <div className="p-4 space-y-3">
              {places.length === 0 && !loading && (
                <div className="text-center py-10">
                  <MapPin className="mx-auto text-slate-500 mb-2 opacity-20" size={48} />
                  <p className="text-sm text-slate-500">No facilities found in this area.</p>
                </div>
              )}
              {places.map((place, idx) => {
                const { name, address_line2 } = place.properties || {};
                const coordinates = place.geometry?.coordinates;
                if (!coordinates) return null;
                
                const [lon, lat] = coordinates;
                return (
                  <div 
                    key={idx}
                    onClick={() => map?.setView([lat, lon], 17)}
                    className={`p-4 rounded-2xl cursor-pointer border transition-all hover:scale-[1.02] ${
                      theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:shadow-lg'
                    }`}
                  >
                    <h4 className={`font-bold text-sm mb-1 truncate ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{name || 'Medical Facility'}</h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tight line-clamp-2">{address_line2}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map Container */}
          <div className="flex-1 relative min-h-[400px] lg:min-h-0">
          <style>{`
            .leaflet-container { 
              background: #0b0e14;
              height: 100%;
              width: 100%;
            }
            .leaflet-popup-content-wrapper {
              background: rgba(15, 23, 42, 0.9) !important;
              backdrop-filter: blur(12px);
              color: white !important;
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
              border-radius: 1rem !important;
              box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5);
            }
            .leaflet-popup-tip { background: rgba(15, 23, 42, 0.9) !important; }
          `}</style>
          
          <MapContainer
            center={userLocation || [12.9716, 77.5946]} // Default to a valid coordinate
            zoom={13}
            scrollWheelZoom={true}
            className="h-full w-full z-0"
            zoomControl={false}
          >
            <MapController setMapInstance={setMap} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            {userLocation && (
              <>
                <Marker position={userLocation} icon={userIcon}>
                  <Popup>You are here</Popup>
                </Marker>
              </>
            )}

            {places.map((place, idx) => {
              const coordinates = place.geometry?.coordinates;
              if (!coordinates) return null;

              const [lon, lat] = coordinates;
              const { name, address_line2, phone } = place.properties || {};
              
              return (
                <Marker key={idx} position={[lat, lon]} icon={medicalIcon}>
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <h4 className="font-bold text-lg mb-1 leading-tight text-white">{name || 'Medical Facility'}</h4>
                      <p className="text-xs text-slate-400 mb-4">{address_line2}</p>
                      <div className="flex gap-2">
                        {phone && (
                          <a href={`tel:${phone}`} className="flex-1 flex items-center justify-center gap-2 py-2 bg-sky-500 text-white rounded-lg text-xs font-bold transition-transform hover:scale-105">
                            <Phone size={14} /> Call
                          </a>
                        )}
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/10 text-white rounded-lg text-xs font-bold border border-white/10 transition-transform hover:scale-105"
                        >
                          <Navigation size={14} /> Directions
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorFinder;