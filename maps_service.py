import os
import requests

GOOGLE_MAPS_API_KEY = os.environ.get("GOOGLE_MAPS_API_KEY")

def fetch_nearby_clinics(lat, lng, priority=None):
    """
    Proxies requests to Google Places API. 
    Filters for emergency care if triage status was RED.
    """
    if not GOOGLE_MAPS_API_KEY:
        raise Exception("Google Maps API Key not configured")

    location = f"{lat},{lng}"
    radius = 5000 # 5km radius
    
    # Requirement F-03.3: Highlight Emergency/Urgent Care if Red status
    keyword = "emergency room|urgent care" if priority == 'emergency' else "medical clinic"
    
    url = (
        f"https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        f"?location={location}&radius={radius}&type=hospital|medical_care"
        f"&keyword={keyword}&key={GOOGLE_MAPS_API_KEY}"
    )
    
    response = requests.get(url)
    data = response.json()
    
    return data.get('results', [])