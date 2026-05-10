from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/google', methods=['POST'])
def google_auth():
    """
    Stub for Google Authentication. 
    In production, verify the ID Token from the frontend here.
    """
    # For testing, we return a mock user and a valid JWT
    mock_user = {"email": "user@example.com", "name": "Velora User"}
    access_token = create_access_token(identity=mock_user['email'])
    return jsonify(data={"token": access_token, "user": mock_user})