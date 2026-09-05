"""
Module: app.department
Description: Simple mapping table for civic category to municipal department routing.
Strictly uses a deterministic lookup table without machine learning models.
"""

from typing import Optional, Dict

# ==============================================================================
# OFFICIAL DEPARTMENT MAPPING TABLE
# ==============================================================================
DEPARTMENT_MAPPING: Dict[str, str] = {
    "education": "Education Department",
    "agriculture": "Agriculture Department",
    "healthcare": "Health Department",
    "water": "Water Department",
    "environment": "Environment Department",
    "energy": "Energy Department",
    "urban_development": "Urban Development Department",
    "accessibility": "Accessibility Department",
    "public_admin": "Public Administration Department",
    "rural_livelihoods": "Rural Livelihoods Department"
}

# Synonyms and formatting aliases to handle common user/model variations
DEPARTMENT_ALIASES: Dict[str, str] = {
    # healthcare variations
    "health": "Health Department",
    "medical": "Health Department",
    "hospital": "Health Department",
    # urban development variations
    "urban": "Urban Development Department",
    "urban development": "Urban Development Department",
    "infrastructure": "Urban Development Department",
    "road": "Urban Development Department",
    "roads": "Urban Development Department",
    # public admin variations
    "public admin": "Public Administration Department",
    "public administration": "Public Administration Department",
    "governance": "Public Administration Department",
    # rural livelihoods variations
    "rural livelihoods": "Rural Livelihoods Department",
    "rural livelihood": "Rural Livelihoods Department",
    "rural": "Rural Livelihoods Department",
    # energy variations
    "electricity": "Energy Department",
    "power": "Energy Department",
    # water variations
    "drinking water": "Water Department",
    "jal": "Water Department",
    "pani": "Water Department",
    # environment variations
    "sanitation": "Environment Department",
    "waste": "Environment Department",
    "pollution": "Environment Department",
    # education variations
    "school": "Education Department",
    "college": "Education Department"
}

DEFAULT_DEPARTMENT = "General Administration Department"


def get_department(category: Optional[str]) -> str:
    """
    Recommends the responsible municipal department for a given civic category.
    
    Uses a simple, deterministic mapping table without any ML models.
    
    Args:
        category: The problem category string (e.g. 'education', 'water', 'urban_development').
        
    Returns:
        The designated department name (e.g. 'Education Department').
    """
    if not category or not isinstance(category, str):
        return DEFAULT_DEPARTMENT

    raw_cleaned = category.strip().lower()

    # 1. Exact match in official mapping
    if raw_cleaned in DEPARTMENT_MAPPING:
        return DEPARTMENT_MAPPING[raw_cleaned]

    # 2. Normalized underscore match (e.g., 'urban development' -> 'urban_development')
    underscore_cleaned = raw_cleaned.replace(" ", "_").replace("-", "_")
    if underscore_cleaned in DEPARTMENT_MAPPING:
        return DEPARTMENT_MAPPING[underscore_cleaned]

    # 3. Normalized space match (e.g., 'public_admin' -> 'public admin')
    space_cleaned = raw_cleaned.replace("_", " ").replace("-", " ")
    if space_cleaned in DEPARTMENT_ALIASES:
        return DEPARTMENT_ALIASES[space_cleaned]

    # 4. Check aliases directly
    if raw_cleaned in DEPARTMENT_ALIASES:
        return DEPARTMENT_ALIASES[raw_cleaned]
    if underscore_cleaned in DEPARTMENT_ALIASES:
        return DEPARTMENT_ALIASES[underscore_cleaned]

    # 5. Fallback for unmapped or 'other' categories
    return DEFAULT_DEPARTMENT


if __name__ == "__main__":
    print("=" * 60)
    print("DEPARTMENT MAPPING TABLE DEMO")
    print("=" * 60)
    test_categories = [
        "education",
        "agriculture",
        "healthcare",
        "water",
        "environment",
        "energy",
        "urban_development",
        "accessibility",
        "public_admin",
        "rural_livelihoods",
        # variations
        "Urban Development",
        "health",
        "electricity",
        "other",
        "unknown_category"
    ]
    for cat in test_categories:
        dept = get_department(cat)
        print(f"Category: {cat:20} -> Department: {dept}")
