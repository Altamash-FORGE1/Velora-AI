from flask import Blueprint, request, jsonify
from maps_service import fetch_nearby_clinics

maps_bp = Blueprint('maps', __name__)

@maps_bp.route('/api/clinics', methods=['GET'])
def get_clinics():
    lat = request.args.get('lat')
    lng = request.args.get('lng')
    priority = request.args.get('priority') # e.g., 'emergency'
    
    if not lat or not lng:
        return jsonify({"error": "Missing coordinates"}), 400
        
    results = fetch_nearby_clinics(lat, lng, priority)
    return jsonify(data=results)