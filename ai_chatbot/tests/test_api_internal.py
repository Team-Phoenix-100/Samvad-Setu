"""
Unit tests for Task 9 internal FastAPI endpoints in app/main.py.

Tests:
1. GET  /internal/health
2. POST /internal/ai/classify (unified output: category, confidence, needsHumanReview, severity, priority, department)
3. POST /internal/ai/dedup
4. POST /internal/ai/chatbot/message (FAQ answer or exact fallback)
5. POST /internal/ai/feedback (saves correction to CSV)
"""

import unittest
from fastapi.testclient import TestClient
from app.main import app


class TestInternalAIEndpoints(unittest.TestCase):
    """Integration tests for internal AI endpoints used by Node.js."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_check(self):
        """GET /internal/health returns status healthy."""
        response = self.client.get("/internal/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["service"], "samvad-setu-ai-engine")
        self.assertIn("version", data)

    def test_classify_unified_output(self):
        """
        POST /internal/ai/classify combines:
        category, confidence, needsHumanReview, severity, priority, department
        """
        payload = {
            "complaint": "There is no drinking water in our village"
        }
        response = self.client.post("/internal/ai/classify", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Check required fields
        self.assertIn("category", data)
        self.assertIn("confidence", data)
        self.assertIn("needsHumanReview", data)
        self.assertIn("severity", data)
        self.assertIn("priority", data)
        self.assertIn("department", data)

        # Value checks
        self.assertIsInstance(data["category"], str)
        self.assertIsInstance(data["confidence"], float)
        self.assertIsInstance(data["needsHumanReview"], bool)
        self.assertIn(data["severity"], ["Critical", "High", "Medium", "Low"])
        self.assertIsInstance(data["priority"], int)
        self.assertGreaterEqual(data["priority"], 1)
        self.assertLessEqual(data["priority"], 100)
        self.assertIsInstance(data["department"], str)

        # Expected classification for drinking water
        self.assertEqual(data["category"], "water")
        self.assertEqual(data["department"], "Water Department")

    def test_classify_emergency_override(self):
        """Emergency keywords like contaminated or fire must force severity to Critical."""
        payload = {
            "complaint": "Drinking water is contaminated with toxic waste in ward 4"
        }
        response = self.client.post("/internal/ai/classify", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["severity"], "Critical")
        self.assertGreaterEqual(data["priority"], 50)

    def test_dedup_endpoint(self):
        """POST /internal/ai/dedup checks duplicates."""
        payload = {
            "complaint": "Big pothole on main market road near school"
        }
        response = self.client.post("/internal/ai/dedup", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("isDuplicate", data)
        self.assertIn("similarity", data)
        self.assertIsInstance(data["isDuplicate"], bool)
        self.assertIsInstance(data["similarity"], float)

    def test_chatbot_matched_message(self):
        """POST /internal/ai/chatbot/message returns FAQ answer for valid inquiry."""
        payload = {
            "message": "How can I check the status of my complaint?"
        }
        response = self.client.post("/internal/ai/chatbot/message", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("response", data)
        self.assertTrue(data["matched"])
        self.assertIn("Track Status", data["response"])

    def test_chatbot_unmatched_fallback_message(self):
        """POST /internal/ai/chatbot/message returns exact fallback when no match exists."""
        payload = {
            "message": "What is the capital of Jupiter?"
        }
        response = self.client.post("/internal/ai/chatbot/message", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("response", data)
        self.assertFalse(data["matched"])
        self.assertEqual(data["response"], "Want to report this as a problem instead?")

    def test_feedback_endpoint(self):
        """POST /internal/ai/feedback records corrections."""
        payload = {
            "complaint": "Road street light blinking continuously",
            "predicted_category": "urban_development",
            "correct_category": "energy",
            "timestamp": "2026-09-06T01:00:00Z"
        }
        response = self.client.post("/internal/ai/feedback", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("total_records", data)
        self.assertGreaterEqual(data["total_records"], 1)


if __name__ == "__main__":
    unittest.main()
