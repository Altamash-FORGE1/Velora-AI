from flask import Blueprint, request
from maps_service import fetch_nearby_clinics
from response import api_response

maps_bp = Blueprint('maps', __name__)

@maps_bp.route('/api/clinics', methods=['GET'])
def get_clinics():
    lat = request.args.get('lat')
    lng = request.args.get('lng')
    priority = request.args.get('priority') # 'emergency' or None
    
    if not lat or not lng:
        return api_response(status="error", message="Coordinates required", code=400)
        
    try:
        clinics = fetch_nearby_clinics(lat, lng, priority)
        return api_response(data={"clinics": clinics})
    except Exception as e:
        return api_response(status="error", message=str(e), code=500)