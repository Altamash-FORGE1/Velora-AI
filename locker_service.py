import os
from werkzeug.utils import secure_filename
from security import encrypt_file, decrypt_file

UPLOAD_FOLDER = 'uploads/medical_records'

def save_medical_record(user_id, file):
    """
    Saves an encrypted version of a medical record and generates Bento-style metadata.
    """
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    filename = secure_filename(f"{user_id}_{file.filename}")
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    
    # Read and Encrypt
    file_content = file.read()
    encrypted_content = encrypt_file(file_content)
    
    with open(filepath, 'wb') as f:
        f.write(encrypted_content)

    # Return metadata for Grid Visualization (Requirement F-02.UI)
    return {
        "id": filename,
        "name": file.filename,
        "type": file.content_type,
        "grid_size": "large" if "report" in file.filename.lower() else "small",
        "last_modified": "Just now",
        "triage_relevance": "High" if "report" in file.filename.lower() or "blood" in file.filename.lower() else "Normal"
    }

def get_user_records(user_id):
    """
    Retrieves records. In production, this queries the HealthRecord model:
    return HealthRecord.query.filter_by(user_id=user_id).all()
    """
    if not os.path.exists(UPLOAD_FOLDER):
        return []
    
    files = os.listdir(UPLOAD_FOLDER)
    records = []
    for f in files:
        if f.startswith(f"{user_id}_"):
            original_name = f.replace(f"{user_id}_", "")
            records.append({
                "id": f,
                "name": original_name,
                "type": "pdf" if f.endswith('.pdf') else "image",
                "grid_size": "large" if "report" in f.lower() else "small",
                "last_modified": "Recent",
                "triage_relevance": "High" if "report" in f.lower() or "blood" in f.lower() else "Normal"
            })
    return records

def get_decrypted_file(user_id, filename):
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(filepath):
        return None
    with open(filepath, 'rb') as f:
        encrypted_data = f.read()
    return decrypt_file(encrypted_data)

def delete_medical_record(user_id, filename):
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
        return True
    return False