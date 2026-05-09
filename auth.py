import os
import requests
from flask import Blueprint, request
from flask_jwt_extended import create_access_token
from response import api_response

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/google', methods=['POST'])
def google_auth():
    access_token = request.json.get('access_token')
    if not access_token:
        return api_response(status="error", message="Missing access token", code=400)

    # Verify token with Google
    google_res = requests.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    if google_res.status_code != 200:
        return api_response(status="error", message="Invalid Google token", code=401)

    user_info = google_res.json()
    
    # In a real app, you'd find or create the user in your Postgres DB here
    # user = User.query.filter_by(email=user_info['email']).first()
    
    # Create local JWT
    local_token = create_access_token(identity={
        "email": user_info['email'],
        "name": user_info.get('name'),
        "sub": user_info.get('sub')
    })

    return api_response(data={
        "token": local_token,
        "user": user_info
    })