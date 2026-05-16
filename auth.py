from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/google', methods=['POST'])
def google_auth():
    """
    Stub for Google Authentication. 
    In production, verify the ID Token from the frontend here.
    """
    data = request.get_json()
    access_token_received = data.get('access_token')

    # In a real app, we would use google-auth-library to verify the token
    # For now, we simulate a successful login
    print(f"DEBUG: Received Google Access Token: {access_token_received[:10]}...")

    # For testing, we return a mock user and a valid JWT
    # We use a consistent mock user to allow frontend to display something
    mock_user = {
        "email": "user@example.com", 
        "name": "Velora User",
        "picture": "https://www.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png"
    }

    # The identity in create_access_token should be the email or unique ID
    access_token = create_access_token(identity=mock_user['email'], additional_claims={
        "name": mock_user['name'],
        "picture": mock_user['picture']
    })

    return jsonify(data={"token": access_token, "user": mock_user})