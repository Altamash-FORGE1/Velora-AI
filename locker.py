from flask import Blueprint, request, send_file
import io
from locker_service import (
    save_medical_record, get_user_records, 
    get_decrypted_file, delete_medical_record
)
from response import api_response

locker_bp = Blueprint('locker', __name__)

@locker_bp.route('/api/locker', methods=['GET'])
def list_records():
    # Mock user_id from context (would come from JWT)
    user_id = "user_123"
    records = get_user_records(user_id)
    return api_response(data={"records": records})

@locker_bp.route('/api/locker/upload', methods=['POST'])
def upload_record():
    if 'file' not in request.files:
        return api_response(status="error", message="No file provided", code=400)
    
    file = request.files['file']
    try:
        metadata = save_medical_record("user_123", file)
        return api_response(data=metadata, message="File uploaded and encrypted successfully")
    except Exception as e:
        return api_response(status="error", message=str(e), code=500)

@locker_bp.route('/api/locker/view/<filename>', methods=['GET'])
def view_record(filename):
    user_id = "user_123" # Mocked until JWT migration
    decrypted_data = get_decrypted_file(user_id, filename)
    if not decrypted_data:
        return api_response(status="error", message="File not found", code=404)
    
    return send_file(
        io.BytesIO(decrypted_data),
        mimetype='application/pdf' if filename.endswith('.pdf') else 'image/jpeg'
    )

@locker_bp.route('/api/locker/<filename>', methods=['DELETE'])
def delete_record(filename):
    user_id = "user_123"
    if delete_medical_record(user_id, filename):
        return api_response(message="Record deleted successfully")
    return api_response(status="error", message="File not found", code=404)