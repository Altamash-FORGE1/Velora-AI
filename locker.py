from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from locker_service import get_user_records, save_medical_record

locker_bp = Blueprint('locker', __name__)

@locker_bp.route('/api/locker/records', methods=['GET'])
@jwt_required()
def list_records():
    user_id = get_jwt_identity()
    records = get_user_records(user_id)
    return jsonify(data={"records": records})

@locker_bp.route('/api/locker/upload', methods=['POST'])
@jwt_required()
def upload_record():
    user_id = get_jwt_identity()
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400
    metadata = save_medical_record(user_id, file)
    return jsonify(data=metadata)