import os
import logging
from groq import Groq

api_key = os.environ.get("GROQ_API_KEY")

logger = logging.getLogger(__name__)

# Using Llama 3.3 70B as the robust default
SYSTEM_PROMPT = """You are Velora AI, a highly experienced medical triage assistant.
Your role is to help users assess the urgency of their symptoms. 
Always be empathetic but professional. 

CRITICAL SAFETY INSTRUCTIONS:
1. If the user describes symptoms of a medical emergency (e.g., severe chest pain, inability to breathe, major trauma), you MUST immediately advise them to call 911 or visit the nearest Emergency Room.
2. Always include a disclaimer that you provide informational triage and are not a substitute for a professional medical diagnosis."""

def analyze_symptoms(messages, stream=False):
    """
    Processes multi-turn chat with Groq as a general assistant.
    """
    if not api_key:
        raise Exception("GROQ_API_KEY is not configured on the server.")

    client = Groq(api_key=api_key)
    model_id = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")

    conversation = [{"role": "system", "content": SYSTEM_PROMPT}] + [m for m in messages if m.get("role") != "system"]

    try:
        completion = client.chat.completions.create(
            model=model_id,
            messages=conversation,
            temperature=0.5,
            max_tokens=1024,
            top_p=1,
            stream=stream,
        )
        
        if stream:
            return completion

        ai_content = completion.choices[0].message.content
        
        return {
            "content": ai_content
        }
    except Exception as e:
        logger.error(f"Groq API Error: {str(e)}")
        raise e