import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useLocation } from 'react-router-dom';
import api from './api';
import { Phone, Clock, Star, MapPin } from 'lucide-react';

const mapContainerStyle = { width: '100%', height: 'calc(100vh - 120px)', borderRadius: '16px' };
const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // NYC fallback

const DoctorMap = () => {
  const { state } = useLocation();
  const [center, setCenter] = useState(defaultCenter);
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_JS_API_KEY // For Map rendering
  });

  useEffect(() => {
    // Get User Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = { lat: position.coords.latitude, lng: position.coords.longitude };
          setCenter(userPos);
          loadClinics(userPos);
        },
        () => loadClinics(defaultCenter)
      );
    }
  }, []);

  const loadClinics = async (pos) => {
    try {
      const res = await api.get('/clinics', {
        params: { 
          lat: pos.lat, 
          lng: pos.lng, 
          priority: state?.priority // RED triage status check
        }
      });
      setClinics(res.data.data.clinics);
    } catch (err) {
      console.error("Failed to load clinics", err);
    }
  };

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className="map-wrapper">
      {state?.priority === 'emergency' && (
        <div className="emergency-notice">
          <MapPin className="animate-pulse" />
          Showing nearest Emergency & Urgent Care facilities based on your triage.
        </div>
      )}
      
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
        options={{ disableDefaultUI: true, zoomControl: true }}
      >
        {clinics.map((clinic) => (
          <Marker
            key={clinic.place_id}
            position={clinic.geometry.location}
            onClick={() => setSelectedClinic(clinic)}
            icon={state?.priority === 'emergency' ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png" : undefined}
          />
        ))}

        {selectedClinic && (
          <InfoWindow
            position={selectedClinic.geometry.location}
            onCloseClick={() => setSelectedClinic(null)}
          >
            <div className="info-window">
              <h3 className="font-bold text-lg">{selectedClinic.name}</h3>
              <div className="flex items-center gap-1 text-yellow-600 mb-2">
                <Star size={14} fill="currentColor" />
                <span>{selectedClinic.rating} ({selectedClinic.user_ratings_total})</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{selectedClinic.vicinity}</p>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={14} />
                  <span className={selectedClinic.opening_hours?.open_now ? "text-green-600" : "text-red-600"}>
                    {selectedClinic.opening_hours?.open_now ? "Open Now" : "Closed"}
                  </span>
                </div>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default DoctorMap;