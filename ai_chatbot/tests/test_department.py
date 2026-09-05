"""
Unit tests for app/department.py.

Tests:
1. Exact mapping of all 10 official categories to designated municipal departments.
2. Case insensitivity and whitespace / hyphen normalization.
3. Fallback to default department for unmapped categories.
4. Function signature: get_department(category).
"""

import unittest
from app.department import get_department, DEPARTMENT_MAPPING, DEFAULT_DEPARTMENT


class TestDepartmentRecommendation(unittest.TestCase):
    """Tests for department recommendation mapping."""

    def test_official_categories_exact_mapping(self):
        """All 10 official categories must map to exact municipal departments."""
        expected = {
            "education": "Education Department",
            "agriculture": "Agriculture Department",
            "healthcare": "Health Department",
            "water": "Water Department",
            "environment": "Environment Department",
            "energy": "Energy Department",
            "urban_development": "Urban Development Department",
            "accessibility": "Accessibility Department",
            "public_admin": "Public Administration Department",
            "rural_livelihoods": "Rural Livelihoods Department",
        }
        for category, dept in expected.items():
            self.assertEqual(
                get_department(category),
                dept,
                f"Mapping failed for category: '{category}'"
            )

    def test_case_insensitivity(self):
        self.assertEqual(get_department("EDUCATION"), "Education Department")
        self.assertEqual(get_department("Water"), "Water Department")
        self.assertEqual(get_department("HealthCare"), "Health Department")
        self.assertEqual(get_department("URBAN_DEVELOPMENT"), "Urban Development Department")

    def test_formatting_variations(self):
        self.assertEqual(get_department("urban development"), "Urban Development Department")
        self.assertEqual(get_department("urban-development"), "Urban Development Department")
        self.assertEqual(get_department("public admin"), "Public Administration Department")
        self.assertEqual(get_department("rural livelihoods"), "Rural Livelihoods Department")

    def test_synonyms_and_aliases(self):
        self.assertEqual(get_department("health"), "Health Department")
        self.assertEqual(get_department("electricity"), "Energy Department")
        self.assertEqual(get_department("power"), "Energy Department")
        self.assertEqual(get_department("sanitation"), "Environment Department")
        self.assertEqual(get_department("school"), "Education Department")
        self.assertEqual(get_department("drinking water"), "Water Department")

    def test_unmapped_and_edge_cases(self):
        self.assertEqual(get_department("other"), DEFAULT_DEPARTMENT)
        self.assertEqual(get_department("unknown_topic"), DEFAULT_DEPARTMENT)
        self.assertEqual(get_department(""), DEFAULT_DEPARTMENT)
        self.assertEqual(get_department(None), DEFAULT_DEPARTMENT)


if __name__ == "__main__":
    unittest.main()
