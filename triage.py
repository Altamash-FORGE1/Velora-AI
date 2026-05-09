import json
from flask import Blueprint, request, Response, stream_with_context
from triage_service import analyze_symptoms
from response import api_response

triage_bp = Blueprint('triage', __name__)

@triage_bp.route('/api/triage', methods=['POST'])
def chat():
    data = request.json
    messages = data.get('messages', [])
    stream = data.get('stream', False)
    
    if not messages:
        return api_response(status="error", message="No messages provided", code=400)

    try:
        result = analyze_symptoms(messages, stream=stream)
        
        if stream:
            @stream_with_context
            def generate():
                print("--- Chat Stream Started ---")
                try:
                    for chunk in result:
                        if chunk.choices and chunk.choices[0].delta.content:
                            yield chunk.choices[0].delta.content
                except Exception as stream_err:
                    print(f"Stream Error: {str(stream_err)}")
                    # Provide a clear error chunk if the AI fails mid-stream
                    yield f"\n\n[ERROR: {str(stream_err)}]"

            return Response(
                generate(), 
                mimetype='text/plain',
                headers={
                    'X-Accel-Buffering': 'no', 
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive'
                }
            )
            
        return api_response(data=result)
    except Exception as e:
        return api_response(status="error", message=str(e), code=500)