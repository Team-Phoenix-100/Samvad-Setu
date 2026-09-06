"""
Unit tests for app/feedback.py.

Tests:
1. Confidence threshold rule: confidence < 0.70 flags needsHumanReview = True.
2. Saving human corrections to dataset/human_feedback.csv.
3. Schema and columns validation: complaint, predicted_category, correct_category, timestamp.
4. Total records counting and feedback history retrieval.
"""

import os
import tempfile
import unittest
from app.feedback import (
    check_needs_human_review,
    save_human_feedback,
    get_feedback_records,
    get_feedback_count,
    HUMAN_REVIEW_CONFIDENCE_THRESHOLD,
    FEEDBACK_CSV_COLUMNS
)


class TestHumanReviewConfidenceThreshold(unittest.TestCase):
    """Tests evaluating the confidence < 0.70 human review threshold."""

    def test_threshold_value(self):
        self.assertEqual(HUMAN_REVIEW_CONFIDENCE_THRESHOLD, 0.70)

    def test_confidence_above_or_equal_to_threshold(self):
        """Confidence >= 0.70 does NOT need human review."""
        self.assertFalse(check_needs_human_review(0.70))
        self.assertFalse(check_needs_human_review(0.71))
        self.assertFalse(check_needs_human_review(0.85))
        self.assertFalse(check_needs_human_review(0.99))
        self.assertFalse(check_needs_human_review(1.0))

    def test_confidence_below_threshold(self):
        """Confidence < 0.70 MUST flag needsHumanReview = True."""
        self.assertTrue(check_needs_human_review(0.69))
        self.assertTrue(check_needs_human_review(0.699))
        self.assertTrue(check_needs_human_review(0.50))
        self.assertTrue(check_needs_human_review(0.35))
        self.assertTrue(check_needs_human_review(0.0))

    def test_invalid_confidence_fallback(self):
        """Non-numeric or None confidence should safely default to requiring review."""
        self.assertTrue(check_needs_human_review(None))
        self.assertTrue(check_needs_human_review("invalid"))


class TestHumanFeedbackStorage(unittest.TestCase):
    """Tests saving human corrections to CSV."""

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.test_csv = os.path.join(self.temp_dir.name, "human_feedback_test.csv")

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_save_and_retrieve_feedback(self):
        result = save_human_feedback(
            complaint="Dirty contaminated water in tap",
            predicted_category="water",
            correct_category="healthcare",
            timestamp="2026-09-06T00:30:00Z",
            csv_path=self.test_csv
        )

        self.assertEqual(result["status"], "success")
        self.assertEqual(result["total_records"], 1)
        self.assertEqual(result["record"]["complaint"], "Dirty contaminated water in tap")
        self.assertEqual(result["record"]["predicted_category"], "water")
        self.assertEqual(result["record"]["correct_category"], "healthcare")
        self.assertEqual(result["record"]["timestamp"], "2026-09-06T00:30:00Z")

        # Verify file exists on disk
        self.assertTrue(os.path.exists(self.test_csv))

        # Check records
        records = get_feedback_records(self.test_csv)
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0]["complaint"], "Dirty contaminated water in tap")
        self.assertEqual(records[0]["correct_category"], "healthcare")

        # Check columns match required fields
        for col in FEEDBACK_CSV_COLUMNS:
            self.assertIn(col, records[0])

    def test_multiple_feedback_entries(self):
        save_human_feedback(
            complaint="Issue 1",
            predicted_category="roads",
            correct_category="urban_development",
            csv_path=self.test_csv
        )
        save_human_feedback(
            complaint="Issue 2",
            predicted_category="education",
            correct_category="public_admin",
            csv_path=self.test_csv
        )

        self.assertEqual(get_feedback_count(self.test_csv), 2)
        records = get_feedback_records(self.test_csv)
        self.assertEqual(len(records), 2)
        self.assertEqual(records[1]["complaint"], "Issue 2")

    def test_validation_errors(self):
        with self.assertRaises(ValueError):
            save_human_feedback("", "water", "healthcare", csv_path=self.test_csv)

        with self.assertRaises(ValueError):
            save_human_feedback("Valid complaint", "water", "", csv_path=self.test_csv)


if __name__ == "__main__":
    unittest.main()
