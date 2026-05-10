import os
import re
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

def create_app():
    app = Flask(__name__)
    
    # JWT Configuration
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'default_secret_for_dev')
    # Ensure JWT errors don't return HTML
    app.config['PROPAGATE_EXCEPTIONS'] = True
    JWTManager(app)
    
    # Load allowed origins and strip any accidental whitespace
    raw_origins = os.environ.get("ALLOWED_ORIGINS", "")
    allowed_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

    # Always allow localhost on any port and GitHub Codespaces URLs in development
    # This prevents CORS issues when shifting between ports (e.g., 5173 to 5174)
    allowed_origins.extend([
        re.compile(r"^https?://localhost:\d+$"),
        re.compile(r"^https://.*\.app\.github\.dev$"),
        re.compile(r"^https://.*\.github\.dev$")
    ])

    print(f" * CORS: Allowing access from {raw_origins} and dynamic Codespace/Localhost patterns.")

    CORS(app, resources={r"/api/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }})

    # Register blueprints
    from triage import triage_bp
    from locker import locker_bp
    from maps import maps_bp
    from auth import auth_bp

    # Note: If internal routes in blueprints already start with /api, 
    # do not add url_prefix='/api' here to avoid /api/api/ paths.
    app.register_blueprint(triage_bp) # Assumes routes are like /api/triage
    app.register_blueprint(locker_bp) # Assumes routes are like /api/locker
    app.register_blueprint(maps_bp)   # Assumes routes are like /api/clinics
    app.register_blueprint(auth_bp)   # auth.py explicitly uses /api/auth/google

    # Ensure the uploads directory exists on startup
    if not os.path.exists('uploads/medical_records'):
        os.makedirs('uploads/medical_records', exist_ok=True)

    @app.route('/')
    def health_check():
        return "Velora AI Backend is running!"

    return app

app = create_app()