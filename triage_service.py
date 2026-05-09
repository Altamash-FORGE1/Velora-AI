import os
import logging
from groq import Groq

api_key = os.environ.get("GROQ_API_KEY")

logger = logging.getLogger(__name__)

# Using Llama 3.3 70B as the robust default
SYSTEM_PROMPT = "You are Velora AI, a helpful and friendly digital assistant. Provide clear, concise, and helpful answers to the user's questions."

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