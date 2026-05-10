from flask import Blueprint, request, Response, jsonify
from triage_service import analyze_symptoms

triage_bp = Blueprint('triage', __name__)

@triage_bp.route('/api/triage', methods=['POST'])
def triage():
    """
    Endpoint for AI Triage supporting both standard and streaming responses.
    """
    data = request.json
    messages = data.get('messages', [])
    stream = data.get('stream', False)

    if stream:
        def generate():
            completion = analyze_symptoms(messages, stream=True)
            for chunk in completion:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        return Response(generate(), mimetype='text/plain')
    else:
        result = analyze_symptoms(messages)
        return jsonify(result)