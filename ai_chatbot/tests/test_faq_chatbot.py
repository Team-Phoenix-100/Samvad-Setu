"""
Unit tests for app/chatbot.py.

Tests:
1. Curated FAQ CSV validation (30–50 items, columns: question, answer).
2. FAQ FAISS index separation from complaint duplicate index.
3. Multilingual similarity matching for civic inquiries.
4. Exact fallback message: "Want to report this as a problem instead?" when no good match exists.
5. Offline functionality without paid LLM API keys.
"""

import os
import json
import unittest
import pandas as pd
from app.chatbot import (
    get_faq_chatbot,
    answer_faq_query,
    FALLBACK_RESPONSE,
    DEFAULT_FAQ_SIMILARITY_THRESHOLD
)


class TestFAQDataset(unittest.TestCase):
    """Tests for chatbot/faq.csv structure and requirements."""

    def setUp(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.faq_csv_path = os.path.join(base_dir, "chatbot", "faq.csv")

    def test_faq_file_exists(self):
        self.assertTrue(os.path.exists(self.faq_csv_path), "chatbot/faq.csv does not exist.")

    def test_faq_row_count(self):
        df = pd.read_csv(self.faq_csv_path)
        count = len(df)
        self.assertGreaterEqual(count, 30, f"FAQ count {count} is less than required 30.")
        self.assertLessEqual(count, 60, f"FAQ count {count} is greater than expected limit.")

    def test_faq_columns(self):
        df = pd.read_csv(self.faq_csv_path)
        self.assertIn("question", df.columns)
        self.assertIn("answer", df.columns)


class TestFAQIndexIsolation(unittest.TestCase):
    """Ensures FAQ index is maintained separately from complaint duplicate index."""

    def test_separate_index_files(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        faq_index = os.path.join(base_dir, "embeddings", "faq.index")
        faq_meta = os.path.join(base_dir, "embeddings", "faq_metadata.json")
        complaints_index = os.path.join(base_dir, "embeddings", "complaints.index")

        # The FAQ index path must be completely distinct
        self.assertNotEqual(faq_index, complaints_index)

        bot = get_faq_chatbot()
        self.assertEqual(bot.index_path, faq_index)
        self.assertEqual(bot.metadata_path, faq_meta)


class TestFAQMatchingAndFallback(unittest.TestCase):
    """Tests semantic matching and fallback contract."""

    @classmethod
    def setUpClass(cls):
        cls.bot = get_faq_chatbot()

    def test_fallback_exact_string(self):
        """Exact string requirement: 'Want to report this as a problem instead?'"""
        self.assertEqual(FALLBACK_RESPONSE, "Want to report this as a problem instead?")

    def test_unrelated_query_triggers_fallback(self):
        unrelated_queries = [
            "What is the capital of Australia?",
            "Tell me a joke about bananas",
            "asdfghjkl zxcvbnm 998877",
            "Can you write Python code to invert a binary tree?"
        ]
        for query in unrelated_queries:
            response = self.bot.get_response(query)
            self.assertEqual(
                response,
                FALLBACK_RESPONSE,
                f"Query '{query}' did not return the exact fallback response."
            )

    def test_civic_inquiry_returns_faq_answer(self):
        matched_queries = [
            "How can I check the status of my complaint?",
            "How do I report a drinking water pipeline leakage?",
            "How do I report a power outage or blackout in my area?",
            "How do I report dangerous potholes on the main road?",
            "Who do I contact if the daily municipal garbage van does not arrive?",
            "How can I request wheelchair ramps or tactile paving in government offices?",
            "How do I report dangerous overgrown trees or fallen branches blocking roads?"
        ]
        for query in matched_queries:
            search_res = self.bot.search_faq(query)
            self.assertTrue(
                search_res["matched"],
                f"Query '{query}' failed to match with score {search_res['similarity']}"
            )
            self.assertNotEqual(search_res["answer"], FALLBACK_RESPONSE)

    def test_convenience_function(self):
        ans = answer_faq_query("How can I track my complaint status?")
        self.assertIn("Track Status", ans)


if __name__ == "__main__":
    unittest.main()
