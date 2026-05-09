import os
from cryptography.fernet import Fernet

# In production, load this from an environment variable
key = os.environ.get("ENCRYPTION_KEY")
ENCRYPTION_KEY = key.encode() if key else Fernet.generate_key()
fernet = Fernet(ENCRYPTION_KEY)

def encrypt_file(file_data):
    """Encrypts binary file data."""
    return fernet.encrypt(file_data)

def decrypt_file(encrypted_data):
    """Decrypts binary file data."""
    return fernet.decrypt(encrypted_data)