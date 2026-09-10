"""
Samvad-Setu - 100% Offline AI Engine Demo
Demonstrates all civic intelligence components running locally without internet or external APIs.
"""

import sys
import os

# Set working directory to ai_chatbot
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.classifier import classify as local_classify
from app.duplicate import check_duplicate
from app.severity import assess_severity_and_priority
from app.department import get_department
from app.chatbot import answer_faq_query, get_faq_chatbot

def print_separator(title=""):
    print("\n" + "=" * 65)
    if title:
        print(f" {title.upper()}")
        print("=" * 65)

def main():
    print_separator("SAMVAD-SETU 100% OFFLINE AI ENGINE DEMO")
    print("STATUS: Operating entirely in OFFLINE mode (Local ML + FAISS + Rules)")
    print("NO External Paid APIs (Gemini/OpenAI) required.")

    # -------------------------------------------------------------
    # DEMO 1: OFFLINE FAQ CHATBOT
    # -------------------------------------------------------------
    print_separator("1. OFFLINE FAQ CHATBOT (SentenceTransformers + FAISS)")
    bot = get_faq_chatbot()
    
    faq_queries = [
        "What should I do if there is no water supply in my locality?",
        "Who fixes broken street lights?",
        "Can I book movie tickets here?"
    ]
    
    for q in faq_queries:
        res = bot.search_faq(q)
        print(f"\n[Citizen Query]: \"{q}\"")
        print(f" -> Matched FAQ?  : {res['matched']} (Similarity Score: {res['similarity']})")
        print(f" -> Bot Response  : \"{res['answer']}\"")

    # -------------------------------------------------------------
    # DEMO 2: OFFLINE COMPLAINT CLASSIFIER
    # -------------------------------------------------------------
    print_separator("2. OFFLINE COMPLAINT CLASSIFICATION (Local TF-IDF + Logistic Regression)")
    
    sample_complaints = [
        "Drinking water pipeline is broken and leaking for 3 days",
        "Transformer burst and electricity is completely out in ward 4",
        "Primary health center doctor is absent and no medicines available"
    ]
    
    for text in sample_complaints:
        pred = local_classify(text)
        print(f"\n[Complaint]: \"{text}\"")
        print(f" -> Predicted Category : {pred['category']}")
        print(f" -> Confidence Score   : {pred['confidence']}")
        print(f" -> Needs Human Review?: {pred['confidence'] < 0.70}")

    # -------------------------------------------------------------
    # DEMO 3: EMERGENCY SAFETY LAYER & PRIORITY CALCULATION
    # -------------------------------------------------------------
    print_separator("3. EMERGENCY SAFETY LAYER & DETERMINISTIC PRIORITY")
    
    safety_tests = [
        ("Normal Issue", "Pothole on main road causing slow traffic", 0, 1.0),
        ("Life Emergency", "Big fire and gas cylinder blast near crowded market!", 2, 0.5)
    ]
    
    for label, text, dup_count, recency in safety_tests:
        sev_pri = assess_severity_and_priority(
            text=text,
            duplicate_count=dup_count,
            recency=recency
        )
        print(f"\n[{label}]: \"{text}\"")
        print(f" -> Severity Level : {sev_pri['severity']}")
        print(f" -> Priority Score : {sev_pri['priority']}/100 (Formula: S + D + R)")

    # -------------------------------------------------------------
    # DEMO 4: OFFLINE DUPLICATE DETECTION
    # -------------------------------------------------------------
    print_separator("4. OFFLINE DUPLICATE COMPLAINT DETECTION (FAISS Vector Index)")
    
    dup_test = "Drinking water pipe is broken"
    dup_res = check_duplicate(dup_test, threshold=0.80)
    print(f"\n[Checking Query]: \"{dup_test}\"")
    print(f" -> Is Duplicate? : {dup_res['isDuplicate']}")
    print(f" -> Similarity    : {dup_res['similarity']}")
    if dup_res['matchedComplaintText']:
        print(f" -> Matched Text  : \"{dup_res['matchedComplaintText']}\"")

    # -------------------------------------------------------------
    # DEMO 5: DETERMINISTIC DEPARTMENT ROUTING
    # -------------------------------------------------------------
    print_separator("5. DETERMINISTIC DEPARTMENT ROUTING (Lookup Table)")
    
    cats = ["water", "energy", "healthcare", "urban_development"]
    for c in cats:
        dept = get_department(c)
        print(f" -> Category: {c:18} ===> Responsible: {dept}")

    print_separator("DEMO COMPLETE: ALL 5 SYSTEMS RAN 100% LOCALLY")

if __name__ == "__main__":
    main()
