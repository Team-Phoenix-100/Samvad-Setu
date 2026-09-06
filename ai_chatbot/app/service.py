import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()


class AIService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            pass
        self.client = genai.Client(api_key=api_key) if api_key else None
# give response in short answer of user given question
    def generate_response(self, message: str) -> str:
        if not self.client:
            return "AI Service is not configured with an API key."
        prompt = f"""
You are an AI assistant for the Samvad-Setu platform.
Your job is to answer general queries from citizens about civic issues.
User message:
{message}
Give a clear and concise response.
"""
        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text
# classify user question into category
    def classify_complaint(self, text: str) -> dict:
        if not self.client:
            return {"category": "other", "confidence": 0.0}

        prompt = f"""
You are an AI classification engine for the Samvad-Setu civic platform.

You will receive a citizen complaint which might be in English, Hindi, or Hinglish.

Classify the complaint into exactly ONE of these categories:

- Education
- Agriculture
- Healthcare
- Water
- Environment
- Energy
- Urban Development
- Accessibility
- Public Administration
- Rural Livelihoods

Also estimate the problem severity:
- Low
- Medium
- High
- Critical

IMPORTANT RULE:
If the complaint does NOT clearly belong to any of the above categories:
- category MUST be "other"
- confidence MUST be 0.0

If category is "other", NEVER return confidence greater than 0.0.

Return ONLY valid JSON in format:
{{
  "category": "...",
  "confidence": 0.0 to 1.0,
  "severity": "Low" | "Medium" | "High" | "Critical"
}}

Text to classify:
{text}
"""

        try:
            response = self.client.models.generate_content(
                model="gemini-3.5-flash",
                contents=prompt
            )

            result_text = response.text.strip()

            if result_text.startswith("```json"):
                result_text = result_text[7:]

            if result_text.endswith("```"):
                result_text = result_text[:-3]

            result = json.loads(result_text.strip())

            # Safety check
            if result.get("category", "").lower() == "other":
                result["confidence"] = 0.0

            return result

        except Exception as e:
            print(f"Classification error: {e}")
            return {
                "category": "other",
                "confidence": 0.0
            }