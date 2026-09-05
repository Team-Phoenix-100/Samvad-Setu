"""
Unit tests for app/severity.py.

Tests:
1. Hardcoded emergency keyword safety layer (English, Hindi, Hinglish).
2. Forced escalation to "Critical" regardless of model prediction.
3. Crucial keywords: 'contaminated', 'collapse', 'fire'.
4. Rule-based severity fallback when model prediction is absent.
5. Priority calculation with fixed formula: S + D + R bounded to [1, 100].
6. Exact JSON output structure: {"severity": "...", "priority": ...}.
"""

import unittest
from app.severity import (
    assess_severity,
    calculate_priority,
    assess_severity_and_priority,
    get_severity_and_priority,
    is_emergency,
    SEVERITY_LEVELS
)


class TestEmergencyKeywordSafetyLayer(unittest.TestCase):
    """Tests ensuring emergency keywords trigger mandatory escalation to Critical."""

    def test_mandatory_keywords_escalation(self):
        """Crucial keywords must force Critical even if model prediction is Low."""
        keywords = ["contaminated", "collapse", "fire"]
        for keyword in keywords:
            complaint = f"There is an issue with {keyword} in our area."
            is_em, matched = is_emergency(complaint)
            self.assertTrue(is_em, f"Emergency check failed for: {keyword}")
            self.assertEqual(matched, keyword)

            # Must override model prediction
            res_sev = assess_severity(complaint, model_prediction="Low")
            self.assertEqual(res_sev, "Critical", f"Escalation failed for keyword: {keyword}")

    def test_english_emergency_phrases(self):
        cases = [
            "Massive fire spreading in commercial building",
            "Bridge collapsed after heavy rain",
            "Drinking water supply is completely contaminated",
            "Cylinder blast in residential kitchen",
            "High voltage live wire hanging over street",
            "Open manhole on main road, someone might fall"
        ]
        for text in cases:
            sev = assess_severity(text, model_prediction="Low")
            self.assertEqual(sev, "Critical", f"Failed for: {text}")

    def test_hindi_devanagari_emergency_phrases(self):
        cases = [
            "बाजार में भीषण आग लग गई है",
            "पुल ढह गया और लोग फंस गए हैं",
            "नल में दूषित पानी आ रहा है जिससे लोग बीमार हैं",
            "बिजली का करंट लग रहा है खंभे से",
            "सिलेंडर ब्लास्ट हो गया घर में",
            "सड़क पर खुला मैनहोल है"
        ]
        for text in cases:
            sev = assess_severity(text, model_prediction="Low")
            self.assertEqual(sev, "Critical", f"Failed for Hindi: {text}")

    def test_hinglish_emergency_phrases(self):
        cases = [
            "Ghar ke paas aag lag gayi hai",
            "Purana pool gir gaya hai achanak",
            "Paani bahut dooshit hai peene layaq nahi",
            "Khula taar gir gaya hai current lag sakta hai",
            "Cylinder phat gaya dukan me",
            "Khula manhole hai accident ka khatra"
        ]
        for text in cases:
            sev = assess_severity(text, model_prediction="Low")
            self.assertEqual(sev, "Critical", f"Failed for Hinglish: {text}")

    def test_model_prediction_overridden_when_emergency_present(self):
        """Regardless of model prediction ('Low', 'Medium', 'High'), emergency forces Critical."""
        text = "Water is contaminated with hazardous chemicals."
        for model_pred in ["Low", "Medium", "High"]:
            res = assess_severity(text, model_prediction=model_pred)
            self.assertEqual(res, "Critical")


class TestSeverityFallback(unittest.TestCase):
    """Tests normal severity assignment when no emergency keywords are present."""

    def test_respects_valid_model_prediction(self):
        text = "Street light is not working in sector 4."
        self.assertEqual(assess_severity(text, model_prediction="Low"), "Low")
        self.assertEqual(assess_severity(text, model_prediction="Medium"), "Medium")
        self.assertEqual(assess_severity(text, model_prediction="High"), "High")

    def test_fallback_keywords_when_no_model_prediction(self):
        high_text = "Severe pipeline burst and major roadway flooding near hospital."
        self.assertEqual(assess_severity(high_text, model_prediction=None), "High")

        med_text = "Street light broken and garbage dustbin overflowing."
        self.assertEqual(assess_severity(med_text, model_prediction=None), "Medium")

        low_text = "Minor delay in park maintenance and aesthetic paint request."
        self.assertEqual(assess_severity(low_text, model_prediction=None), "Low")


class TestPriorityFormula(unittest.TestCase):
    """
    Fixed formula: Priority = min(100, max(1, S + D + R))
    S: Critical=50, High=35, Medium=20, Low=10
    D: min(25, dups * 5)
    R: <=2h: 25, 2-12h: 20, 12-24h: 15, 24-48h: 10, >48h: 5
    """

    def test_maximum_priority_critical_fresh_many_duplicates(self):
        # Critical(50) + 5 dups(25) + 0.5h(25) = 100
        p = calculate_priority("Critical", duplicate_count=5, recency=0.5)
        self.assertEqual(p, 100)

    def test_critical_zero_duplicates_fresh(self):
        # Critical(50) + 0 dups(0) + 1.0h(25) = 75
        p = calculate_priority("Critical", duplicate_count=0, recency=1.0)
        self.assertEqual(p, 75)

    def test_high_severity_calculation(self):
        # High(35) + 2 dups(10) + 4h(20) = 65
        p = calculate_priority("High", duplicate_count=2, recency=4.0)
        self.assertEqual(p, 65)

    def test_medium_severity_calculation(self):
        # Medium(20) + 1 dup(5) + 20h(15) = 40
        p = calculate_priority("Medium", duplicate_count=1, recency=20.0)
        self.assertEqual(p, 40)

    def test_low_severity_old_calculation(self):
        # Low(10) + 0 dups(0) + 72h(5) = 15
        p = calculate_priority("Low", duplicate_count=0, recency=72.0)
        self.assertEqual(p, 15)

    def test_priority_bounded_to_100(self):
        # Critical(50) + 10 dups(25) + 0.1h(25) = 100 (capped)
        p = calculate_priority("Critical", duplicate_count=10, recency=0.1)
        self.assertEqual(p, 100)


class TestOutputStructure(unittest.TestCase):
    """Verify exact output schema: {'severity': '...', 'priority': ...}."""

    def test_exact_keys_in_output(self):
        result = assess_severity_and_priority(
            text="Drinking water is contaminated.",
            duplicate_count=2,
            recency=1.0,
            model_prediction="Low"
        )
        self.assertIsInstance(result, dict)
        self.assertIn("severity", result)
        self.assertIn("priority", result)
        self.assertIn(result["severity"], SEVERITY_LEVELS)
        self.assertIsInstance(result["priority"], int)
        self.assertEqual(result["severity"], "Critical")
        self.assertEqual(result["priority"], 85)  # 50 + 10 + 25 = 85

    def test_alias_get_severity_and_priority(self):
        res1 = assess_severity_and_priority("Minor crack in curb", duplicate_count=0, recency=50.0)
        res2 = get_severity_and_priority("Minor crack in curb", duplicate_count=0, recency=50.0)
        self.assertEqual(res1, res2)


if __name__ == "__main__":
    unittest.main()
