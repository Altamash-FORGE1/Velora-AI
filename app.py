import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from triage import triage_bp
from locker import locker_bp
from maps import maps_bp
from auth import auth_bp

def create_app():
    app = Flask(__name__)
    
    # JWT Configuration
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'default_secret_for_dev')
    # Ensure JWT errors don't return HTML
    app.config['PROPAGATE_EXCEPTIONS'] = True
    JWTManager(app)
    
    # Load allowed origins from environment variable for portability
    allowed_origins = os.environ.get("ALLOWED_ORIGINS", "").split(",")
    # Add a fallback for local dev if environment variable is empty
    if not allowed_origins or allowed_origins == ['']:
        allowed_origins = ["http://localhost:5173"]
    
    CORS(app, resources={r"/api/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }})

    # Register blueprints
    app.register_blueprint(triage_bp)
    app.register_blueprint(locker_bp)
    app.register_blueprint(maps_bp)
    app.register_blueprint(auth_bp)

    # Ensure the uploads directory exists on startup
    if not os.path.exists('uploads/medical_records'):
        os.makedirs('uploads/medical_records', exist_ok=True)

    @app.route('/')
    def health_check():
        return "Velora AI Backend is running!"

    return app

app = create_app()