import os
from google import genai


class AIService:

    def __init__(self):
        api_key = os.getenv("##")

        if not api_key:
            raise ValueError("GEMINI_API_KEY is not configured")

        self.client = genai.Client(api_key=api_key)

    def generate_response(self, message: str) -> str:

        prompt = f"""
You are the Ocean Shield AI assistant.

Your job is to help users with ocean safety,
coastal hazards, weather-related safety,
and disaster-management information.

User message:
{message}

Give a clear and concise response.
Do not invent real-time hazard information.
If real-time information is required, tell the user
that official Ocean Shield hazard data should be checked.
"""

        response = self.client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt
        )

        return response.text