"""
Module: app.severity
Description: Severity classification and priority computation for Samvad-Setu.

================================================================================
PRIORITY FORMULA DOCUMENTATION (FIXED & DETERMINISTIC)
================================================================================
Priority is calculated using a single, fixed formula bounded between 1 and 100:

    Priority = min(100, max(1, S + D + R))

Where:
1. Severity Weight (S) [Points: 10 to 50]:
   - Critical : 50 points
   - High     : 35 points
   - Medium   : 20 points
   - Low      : 10 points

2. Duplicate Boost (D) [Points: 0 to 25]:
   - D = min(25, duplicate_count * 5)
   - Every duplicate report from affected citizens adds +5 points, capped at 25.

3. Recency Score (R) [Points: 5 to 25]:
   - Measured by age in hours (t) since the problem was reported:
       t <= 2 hours       : 25 points (immediate emergency response window)
       2 < t <= 12 hours  : 20 points
       12 < t <= 24 hours : 15 points
       24 < t <= 48 hours : 10 points
       t > 48 hours       : 5 points
   - If normalized freshness (0.0 <= r <= 1.0) is passed instead:
       R = round(r * 25)

Output format:
{
    "severity": "Critical" | "High" | "Medium" | "Low",
    "priority": <integer between 1 and 100>
}
================================================================================
"""

import re
import logging
from typing import Dict, Any, Optional, Tuple, Union, List

logger = logging.getLogger(__name__)

# Canonical Severity Levels
SEVERITY_LEVELS = ["Low", "Medium", "High", "Critical"]

# Fixed Severity Weights
SEVERITY_WEIGHTS: Dict[str, int] = {
    "Critical": 50,
    "High": 35,
    "Medium": 20,
    "Low": 10
}

# ==============================================================================
# HARDCODED EMERGENCY KEYWORDS SAFETY LAYER
# (Forces escalation to "Critical" regardless of model prediction)
# ==============================================================================

# 1. English Emergency Keywords
# Crucial mandatory keywords: "contaminated", "collapse", "fire"
EMERGENCY_KEYWORDS_EN: List[str] = [
    # Core mandatory keywords
    "contaminated",
    "contamination",
    "collapse",
    "collapsed",
    "collapsing",
    "fire",
    "massive fire",
    # Fire & Explosions
    "explosion",
    "blast",
    "cylinder blast",
    "gas cylinder exploded",
    "gas leak",
    "gas leakage",
    "wildfire",
    "flames",
    # Structural & Ground Disasters
    "bridge collapse",
    "building collapse",
    "wall collapse",
    "roof collapse",
    "sinkhole",
    "landslide",
    "cave in",
    # Contamination & Toxic Hazards
    "toxic",
    "poison",
    "poisonous",
    "poisoned",
    "chemical leak",
    "chemical spill",
    "biohazard",
    # Electrical Hazards
    "electrocution",
    "electric shock",
    "live wire",
    "hanging wire",
    "sparking wire",
    "high voltage wire",
    # Fall / Entrapment Hazards
    "open manhole",
    "uncovered manhole",
    "deep open pit",
    "trapped",
    "people trapped",
    # Floods & Fatalities
    "drowning",
    "flash flood",
    "death",
    "fatal",
    "deadly",
    "casualty",
    "casualties"
]

# 2. Hindi (Devanagari) Emergency Keywords
EMERGENCY_KEYWORDS_HI: List[str] = [
    # Fire / Blast
    "आग",
    "भीषण आग",
    "अग्नि",
    "धमाका",
    "विस्फोट",
    "ब्लास्ट",
    "सिलेंडर ब्लास्ट",
    "सिलेंडर फट",
    "गैस रिसाव",
    "गैस लीक",
    # Collapse / Structural
    "ढह गया",
    "ढहने",
    "गिर गया",
    "मकान गिर गया",
    "पुल गिर गया",
    "दीवार गिर गई",
    "छत गिर गई",
    "धंस गया",
    "भूस्खलन",
    # Contamination / Poison
    "दूषित",
    "दूषित पानी",
    "जहरीला",
    "जहर",
    "विषाक्त",
    "केमिकल रिसाव",
    # Electrical
    "करंट",
    "बिजली का करंट",
    "बिजली का झटका",
    "खुला तार",
    "तार टूट",
    "शॉर्ट सर्किट",
    # Open Pit / Trapped / Death
    "खुला मैनहोल",
    "खुला नाला",
    "डूब रहा",
    "लोग फंसे",
    "जानलेवा",
    "मौत",
    "मृत्यु",
    "जान का खतरा"
]

# 3. Hinglish (Romanized) Emergency Keywords
EMERGENCY_KEYWORDS_HINGLISH: List[str] = [
    # Fire / Blast
    "aag",
    "aag lagi",
    "bhisad aag",
    "visphot",
    "dhamaka",
    "blast",
    "cylinder phat",
    "cylinder blast",
    "gas leak",
    "jal raha",
    # Collapse
    "gir gaya",
    "dhah gaya",
    "dhas gaya",
    "makan gir gaya",
    "pool gir gaya",
    "pul gir gaya",
    "chhat gir gayi",
    "deewar gir",
    # Contamination / Poison
    "dooshit",
    "dushit pani",
    "dushit paani",
    "zeher",
    "zahar",
    "jahar",
    "zehrila",
    # Electrical
    "current lag gaya",
    "bijli ka current",
    "khula taar",
    "taar toot gaya",
    "bijli jhatka",
    # Trapped / Hazard
    "khula manhole",
    "khula nala",
    "doob raha",
    "log phanse",
    "trapped",
    "jaan ka khatra",
    "maut"
]

# Consolidated emergency keywords lookup
ALL_EMERGENCY_KEYWORDS: List[str] = (
    EMERGENCY_KEYWORDS_EN + EMERGENCY_KEYWORDS_HI + EMERGENCY_KEYWORDS_HINGLISH
)

# Precompile regex patterns for boundary-aware keyword matching
_EMERGENCY_PATTERNS = [
    (kw, re.compile(r"(?<!\w)" + re.escape(kw) + r"(?!\w)", re.IGNORECASE | re.UNICODE))
    for kw in ALL_EMERGENCY_KEYWORDS
]

# ==============================================================================
# RULE-BASED SEVERITY KEYWORDS (Fallback when no model prediction is provided)
# ==============================================================================
HIGH_KEYWORDS = [
    "severe", "serious", "major", "heavy flooding", "deep pothole",
    "completely blocked", "fully blocked", "road cave", "traffic hazard",
    "transformer burnt", "power blackout", "pipeline burst", "sewage overflow",
    "hospital access blocked", "badi samasya", "bhaari jal-bharaav", "sadak band"
]

MEDIUM_KEYWORDS = [
    "damaged", "broken", "pothole", "leakage", "garbage", "waste",
    "dustbin", "traffic light", "street light", "overflowing", "drain blocked",
    "crack", "dumpster full", "kachra", "gandagi", "toota hua", "kharaab",
    "light band", "paani nahi aa raha", "sadak toot gayi", "gutter jam"
]

LOW_KEYWORDS = [
    "minor", "small", "slight", "delay", "faded paint", "aesthetic",
    "cleanliness query", "noise", "slow", "tree trimming", "chhota",
    "halka", "thoda", "safai request"
]


# ==============================================================================
# CORE FUNCTIONS
# ==============================================================================

def is_emergency(text: str) -> Tuple[bool, Optional[str]]:
    """
    Checks if complaint text contains any hardcoded emergency keyword.
    
    Returns:
        (is_emergency, matched_keyword)
    """
    if not text or not isinstance(text, str):
        return False, None

    clean_text = text.strip()
    for kw, pattern in _EMERGENCY_PATTERNS:
        if pattern.search(clean_text):
            return True, kw

    return False, None


def assess_severity(
    text: str,
    model_prediction: Optional[str] = None
) -> str:
    """
    Assesses complaint severity among: 'Low', 'Medium', 'High', 'Critical'.
    
    SAFETY RULE:
    If any hardcoded emergency keyword is found, severity is FORCIBLY ESCALATED
    to 'Critical', overriding any model prediction.
    
    Otherwise:
    - Uses valid model_prediction if provided.
    - If model_prediction is missing or invalid, applies rule-based keyword heuristics.
    
    Args:
        text: Complaint text description.
        model_prediction: Optional severity string from an external ML model.
        
    Returns:
        Canonical severity string: 'Critical', 'High', 'Medium', or 'Low'.
    """
    # 1. EMERGENCY SAFETY LAYER (Forced Override)
    has_emergency, matched_kw = is_emergency(text)
    if has_emergency:
        logger.warning(
            f"Emergency safety layer triggered by keyword '{matched_kw}'. "
            f"Overriding model prediction '{model_prediction}' -> 'Critical'."
        )
        return "Critical"

    # 2. Check if a valid model prediction was provided
    if model_prediction and isinstance(model_prediction, str):
        canonical_model = model_prediction.strip().capitalize()
        if canonical_model in SEVERITY_LEVELS:
            return canonical_model

    # 3. Fallback: Rule-based keyword heuristics
    if not text or not isinstance(text, str):
        return "Medium"

    text_lower = text.lower()

    # Check High
    for kw in HIGH_KEYWORDS:
        if re.search(r"(?<!\w)" + re.escape(kw) + r"(?!\w)", text_lower):
            return "High"

    # Check Medium
    for kw in MEDIUM_KEYWORDS:
        if re.search(r"(?<!\w)" + re.escape(kw) + r"(?!\w)", text_lower):
            return "Medium"

    # Check Low
    for kw in LOW_KEYWORDS:
        if re.search(r"(?<!\w)" + re.escape(kw) + r"(?!\w)", text_lower):
            return "Low"

    # Default baseline
    return "Medium"


def calculate_priority(
    severity: str,
    duplicate_count: int = 0,
    recency: Union[float, int] = 0.0
) -> int:
    """
    Calculates numerical priority score (1 - 100) using the fixed formula:
    
        Priority = min(100, max(1, S + D + R))
        
    Args:
        severity: One of 'Critical', 'High', 'Medium', 'Low'.
        duplicate_count: Number of duplicate or verified reports (>= 0).
        recency: Age of complaint in hours, or normalized freshness factor (0.0 - 1.0).
        
    Returns:
        Integer priority score between 1 and 100.
    """
    # 1. Severity Weight (S: 10 - 50 pts)
    canonical_sev = (severity or "").strip().capitalize()
    s_weight = SEVERITY_WEIGHTS.get(canonical_sev, 20)  # default to Medium=20

    # 2. Duplicate Boost (D: 0 - 25 pts)
    safe_dup_count = max(0, int(duplicate_count or 0))
    d_boost = min(25, safe_dup_count * 5)

    # 3. Recency Score (R: 5 - 25 pts)
    # Measured by age in hours (t >= 0) since report submission
    safe_recency = max(0.0, float(recency or 0.0))
    if safe_recency <= 2.0:
        r_score = 25  # Brand new / urgent response window (<= 2 hours)
    elif safe_recency <= 12.0:
        r_score = 20  # Same day (2 - 12 hours)
    elif safe_recency <= 24.0:
        r_score = 15  # Within 24 hours
    elif safe_recency <= 48.0:
        r_score = 10  # 1 to 2 days
    else:
        r_score = 5   # Older than 2 days (> 48 hours)

    raw_priority = s_weight + d_boost + r_score
    return min(100, max(1, int(raw_priority)))


def assess_severity_and_priority(
    text: str,
    duplicate_count: int = 0,
    recency: Union[float, int] = 0.0,
    model_prediction: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main entry point for assessing complaint severity and computing priority.
    
    Evaluates emergency safety layer, resolves severity, and applies the
    fixed priority formula.
    
    Returns:
        {
            "severity": "...",
            "priority": ...
        }
    """
    resolved_severity = assess_severity(text, model_prediction=model_prediction)
    priority_score = calculate_priority(
        severity=resolved_severity,
        duplicate_count=duplicate_count,
        recency=recency
    )

    return {
        "severity": resolved_severity,
        "priority": priority_score
    }


# Convenience alias matching required output
def get_severity_and_priority(
    text: str,
    duplicate_count: int = 0,
    recency: Union[float, int] = 0.0,
    model_prediction: Optional[str] = None
) -> Dict[str, Any]:
    """Alias for assess_severity_and_priority."""
    return assess_severity_and_priority(
        text=text,
        duplicate_count=duplicate_count,
        recency=recency,
        model_prediction=model_prediction
    )


if __name__ == "__main__":
    test_cases = [
        ("Drinking water is contaminated in ward 4.", 0, 0.5, "Low"),
        ("Bridge collapse near river side, urgent!", 3, 1.0, None),
        ("Massive fire in market complex.", 5, 0.0, "Medium"),
        ("Ghar ke paas aag lag gayi hai cylinder blast se", 2, 1.5, "Low"),
        ("Nal ka paani bahut dooshit hai aur log beemar pad rahe hain", 4, 3.0, None),
        ("Pul gir gaya hai aur log phanse hain", 6, 0.2, None),
        ("Deep pothole in middle of highway.", 1, 5.0, "High"),
        ("Dustbin overflowing with garbage.", 0, 30.0, None),
        ("Street light faded paint query.", 0, 72.0, "Low")
    ]

    print("=" * 60)
    print("SEVERITY & PRIORITY ENGINE DEMO")
    print("=" * 60)
    for t_text, t_dups, t_rec, t_model in test_cases:
        res = assess_severity_and_priority(
            text=t_text,
            duplicate_count=t_dups,
            recency=t_rec,
            model_prediction=t_model
        )
        print(f"Text: '{t_text}'")
        print(f"Model Pred: {t_model} | Dups: {t_dups} | Recency(hrs): {t_rec}")
        print(f"Result: {res}")
        print("-" * 60)
