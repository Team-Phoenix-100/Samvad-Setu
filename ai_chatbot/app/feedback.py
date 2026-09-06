"""
Module: app.feedback
Description: Human review and feedback collection system for Samvad-Setu AI engine.

Rules:
- If classification confidence < 0.70, flag complaint as requiring human review (needsHumanReview = True).
- Records human corrections in dataset/human_feedback.csv for future model retraining.
- Columns: complaint, predicted_category, correct_category, timestamp.
"""

import os
import csv
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

# Confidence threshold below which a prediction needs human review
HUMAN_REVIEW_CONFIDENCE_THRESHOLD = 0.70

FEEDBACK_CSV_COLUMNS = [
    "complaint",
    "predicted_category",
    "correct_category",
    "timestamp"
]


def check_needs_human_review(
    confidence: float,
    threshold: float = HUMAN_REVIEW_CONFIDENCE_THRESHOLD
) -> bool:
    """
    Evaluates whether a classification prediction requires human review.
    
    Args:
        confidence: Classification probability / confidence score (0.0 to 1.0).
        threshold: Confidence cutoff (default: 0.70).
        
    Returns:
        True if confidence < 0.70, otherwise False.
    """
    try:
        score = float(confidence)
    except (ValueError, TypeError):
        return True

    return bool(score < threshold)


def get_default_feedback_csv_path() -> str:
    """Returns the default absolute path to dataset/human_feedback.csv."""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_dir, "dataset", "human_feedback.csv")


def save_human_feedback(
    complaint: str,
    predicted_category: str,
    correct_category: str,
    timestamp: Optional[str] = None,
    csv_path: Optional[str] = None
) -> Dict[str, Any]:
    """
    Stores human correction / ground truth feedback in dataset/human_feedback.csv.
    This data will be used in future retraining loops for active learning.
    
    Args:
        complaint: The raw citizen complaint text.
        predicted_category: The model's initial prediction.
        correct_category: The human-verified correct category.
        timestamp: Optional ISO-format timestamp string (defaults to current UTC).
        csv_path: Optional custom path to target CSV file.
        
    Returns:
        Dict summarizing recorded feedback and total count.
    """
    if not complaint or not isinstance(complaint, str):
        raise ValueError("Complaint text must be a non-empty string.")
    if not correct_category or not isinstance(correct_category, str):
        raise ValueError("Correct category must be a non-empty string.")

    target_path = csv_path or get_default_feedback_csv_path()
    os.makedirs(os.path.dirname(target_path), exist_ok=True)

    if not timestamp:
        timestamp = datetime.now(timezone.utc).isoformat()

    file_exists = os.path.exists(target_path) and os.path.getsize(target_path) > 0

    clean_complaint = complaint.strip()
    clean_predicted = (predicted_category or "").strip().lower()
    clean_correct = correct_category.strip().lower()

    row = [
        clean_complaint,
        clean_predicted,
        clean_correct,
        timestamp
    ]

    with open(target_path, mode="a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
        if not file_exists:
            writer.writerow(FEEDBACK_CSV_COLUMNS)
        writer.writerow(row)

    logger.info(
        f"Recorded human feedback: predicted='{clean_predicted}' -> correct='{clean_correct}' "
        f"in {target_path}"
    )

    total_records = get_feedback_count(target_path)

    return {
        "status": "success",
        "message": "Human feedback recorded successfully.",
        "record": {
            "complaint": clean_complaint,
            "predicted_category": clean_predicted,
            "correct_category": clean_correct,
            "timestamp": timestamp
        },
        "total_records": total_records
    }


def get_feedback_records(csv_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Reads all human feedback records stored in dataset/human_feedback.csv.
    
    Returns:
        List of dictionaries with keys: complaint, predicted_category, correct_category, timestamp.
    """
    target_path = csv_path or get_default_feedback_csv_path()
    if not os.path.exists(target_path):
        return []

    records = []
    with open(target_path, mode="r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            records.append(dict(row))

    return records


def get_feedback_count(csv_path: Optional[str] = None) -> int:
    """Returns the total number of feedback records stored."""
    target_path = csv_path or get_default_feedback_csv_path()
    if not os.path.exists(target_path):
        return 0

    count = 0
    with open(target_path, mode="r", newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        try:
            next(reader)  # skip header
        except StopIteration:
            return 0
        for _ in reader:
            count += 1

    return count


if __name__ == "__main__":
    print("=" * 60)
    print("HUMAN FEEDBACK MODULE TEST")
    print("=" * 60)

    # Test confidence checks
    test_confidences = [0.92, 0.70, 0.69, 0.45, 0.10]
    for c in test_confidences:
        needs_rev = check_needs_human_review(c)
        print(f"Confidence: {c:.2f} -> needsHumanReview: {needs_rev}")

    # Test saving feedback
    res = save_human_feedback(
        complaint="Contaminated dirty water coming from community tap",
        predicted_category="water",
        correct_category="healthcare",
        timestamp="2026-09-06T00:35:00Z"
    )
    print("\nSaved feedback sample result:")
    print(res)
    print(f"Total feedback records: {get_feedback_count()}")
