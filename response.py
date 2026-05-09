from flask import jsonify

def api_response(status="success", data=None, message="", code=200):
    """
    Standardized JSON response for Web and Mobile clients.
    """
    response = {
        "status": status,
        "data": data if data is not None else {},
        "message": message,
        "timestamp": None # Could add ISO timestamp here
    }
    return jsonify(response), code