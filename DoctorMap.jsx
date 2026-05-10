import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { Phone, Clock, Star, MapPin, Navigation, AlertCircle } from 'lucide-react';

const mapContainerStyle = { width: '100%', height: 'calc(100vh - 120px)', borderRadius: '16px' };
const MAP_CENTER = { lat: 12.9716, lng: 77.5946 }; // Cubbon Park, Bengaluru

const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#e9e9e9" }] }
];

const DoctorMap = () => {
  const { state } = useLocation();
  const [center, setCenter] = useState(MAP_CENTER);
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_JS_API_KEY,
    libraries: ['places']
  });

  const onMapLoad = (map) => {
    const service = new window.google.maps.places.PlacesService(map);
    const request = {
      location: MAP_CENTER,
      radius: '5000',
      type: ['hospital']
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setClinics(results);
      }
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  };

  if (!isLoaded) return <div className="p-8 text-center">Loading Maps...</div>;

  return (
    <div className="p-6 h-full flex flex-col">
      {state?.priority === 'emergency' && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 font-medium">
          <AlertCircle size={20} />
          <span>Emergency facilities nearby based on your symptoms.</span>
        </div>
      )}

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
        onLoad={onMapLoad}
        options={{ styles: mapStyles, disableDefaultUI: true, zoomControl: true }}
      >
        {clinics.map((clinic) => (
          <Marker
            key={clinic.place_id}
            position={clinic.geometry.location}
            onClick={() => setSelectedClinic(clinic)}
          />
        ))}
        {selectedClinic && (
          <InfoWindow
            position={selectedClinic.geometry.location}
            onCloseClick={() => setSelectedClinic(null)}
          >
            <div className="p-2">
              <h3 className="font-bold text-gray-900">{selectedClinic.name}</h3>
              <p className="text-xs text-gray-600">{selectedClinic.vicinity}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};
export default DoctorMap;