"""
Classifier module to determine complaint category (1 of 10 official categories).

Architecture:
- Baseline: Multilingual TF-IDF (word + character n-grams) + Logistic Regression.
- Upgrade-Ready: Modular design with BaseComplaintClassifier interface and 
  TransformerComplaintClassifier stub/implementation for:
    1) 'distilbert-base-multilingual-cased'
    2) 'ai4bharat/indic-bert' (IndicBERT)
- The model is loaded once (Singleton) to prevent reloading on each request.
"""

import os
import re
import json
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List, Tuple
import pandas as pd
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import FeatureUnion, Pipeline
from sklearn.linear_model import LogisticRegression

logger = logging.getLogger(__name__)

# 10 Official Categories for Samvad-Setu
OFFICIAL_CATEGORIES = [
    "education",
    "agriculture",
    "healthcare",
    "water",
    "environment",
    "energy",
    "urban_development",
    "accessibility",
    "public_admin",
    "rural_livelihoods"
]

CONFIDENCE_THRESHOLD = 0.35  # Below this, classified as 'other' with 0.0 confidence


class BaseComplaintClassifier(ABC):
    """Abstract Base Class for complaint classifiers."""

    @abstractmethod
    def predict(self, text: str) -> Dict[str, Any]:
        """
        Predict the category and confidence for a given text complaint.
        
        Returns:
            Dict with 'category' (str) and 'confidence' (float).
        """
        pass


# ==============================================================================
# BASELINE: Multilingual TF-IDF + Logistic Regression
# ==============================================================================
class TfidfLogisticClassifier(BaseComplaintClassifier):
    """
    Baseline classifier using scikit-learn.
    
    Multilingual support design:
    - Does NOT assume English only.
    - Uses a FeatureUnion of:
        1. Word-level TF-IDF with Unicode regex r'(?u)\b\w+\b' to capture Hindi 
           (Devanagari script), English, and Hinglish tokens.
        2. Character n-grams ('char_wb', range 3-5) which capture subword morphemes,
           inflections in Hindi, romanized Hinglish spelling variations, and typos.
    - Logistic Regression with balanced class weights for calibrated probability outputs.
    """

    def __init__(self, model_dir: Optional[str] = None):
        if model_dir is None:
            # Default to ai_chatbot/models/
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            model_dir = os.path.join(base_dir, "models")
        self.model_dir = model_dir
        self.vectorizer_path = os.path.join(self.model_dir, "tfidf_vectorizer.pkl")
        self.classifier_path = os.path.join(self.model_dir, "complaint_classifier.pkl")
        self.model_path = os.path.join(self.model_dir, "baseline_classifier.joblib")
        self.pipeline: Optional[Pipeline] = None
        self._load_or_train()

    def _build_multilingual_pipeline(self) -> Pipeline:
        """
        Builds a multilingual feature extraction and classification pipeline.
        Combines word-level and subword character-level n-grams for language-agnostic text.
        """
        features = FeatureUnion([
            # Word-level n-grams with Unicode word pattern (English, Hindi script, Hinglish)
            ("word_tfidf", TfidfVectorizer(
                token_pattern=r"(?u)\b\w+\b",
                ngram_range=(1, 2),
                max_features=15000,
                sublinear_tf=True
            )),
            # Subword character n-grams (handles Hindi roots, Hinglish transliteration variants)
            ("char_tfidf", TfidfVectorizer(
                analyzer="char_wb",
                ngram_range=(3, 5),
                max_features=25000,
                sublinear_tf=True
            ))
        ])

        pipeline = Pipeline([
            ("features", features),
            ("clf", LogisticRegression(
                max_iter=1000,
                C=1.0,
                class_weight="balanced",
                random_state=42
            ))
        ])
        return pipeline

    def train(self, dataset_path: Optional[str] = None) -> None:
        """Train the baseline classifier on the complaints dataset and save with joblib."""
        if dataset_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            dataset_path = os.path.join(base_dir, "dataset", "complaints.csv")

        if not os.path.exists(dataset_path):
            raise FileNotFoundError(f"Training dataset not found at {dataset_path}")

        print(f"Loading training data from {dataset_path}...")
        df = pd.read_csv(dataset_path)
        
        # Ensure required columns exist
        if "complaint" not in df.columns or "category" not in df.columns:
            raise ValueError("Dataset must contain 'complaint' and 'category' columns.")

        # Filter and clean
        df = df.dropna(subset=["complaint", "category"])
        X = df["complaint"].astype(str)
        y = df["category"].astype(str)

        print(f"Training multilingual baseline on {len(X)} complaints...")
        self.pipeline = self._build_multilingual_pipeline()
        self.pipeline.fit(X, y)

        os.makedirs(self.model_dir, exist_ok=True)
        # Save vectorizer and classifier separately using joblib as requested
        joblib.dump(self.pipeline.named_steps["features"], self.vectorizer_path)
        joblib.dump(self.pipeline.named_steps["clf"], self.classifier_path)
        # Also save full pipeline for backward compatibility
        joblib.dump(self.pipeline, self.model_path)
        print(f"Saved models via joblib: {self.vectorizer_path}, {self.classifier_path}")

    def _load_or_train(self) -> None:
        """Loads cached model from disk using joblib or trains a new one if missing."""
        # 1. Try loading separate vectorizer and classifier
        if os.path.exists(self.vectorizer_path) and os.path.exists(self.classifier_path):
            try:
                features = joblib.load(self.vectorizer_path)
                clf = joblib.load(self.classifier_path)
                self.pipeline = Pipeline([
                    ("features", features),
                    ("clf", clf)
                ])
                return
            except Exception as e:
                logger.warning(f"Could not load pkl models via joblib: {e}")

        # 2. Try loading baseline_classifier.joblib
        if os.path.exists(self.model_path):
            try:
                self.pipeline = joblib.load(self.model_path)
                # Auto-export the separate pkl files if missing
                if not (os.path.exists(self.vectorizer_path) and os.path.exists(self.classifier_path)):
                    try:
                        joblib.dump(self.pipeline.named_steps["features"], self.vectorizer_path)
                        joblib.dump(self.pipeline.named_steps["clf"], self.classifier_path)
                    except Exception:
                        pass
                return
            except Exception as e:
                logger.warning(f"Could not load cached model from {self.model_path}: {e}")

        # 3. Train if model doesn't exist
        try:
            self.train()
        except Exception as e:
            logger.error(f"Failed to auto-train baseline classifier: {e}")
            self.pipeline = None

    def predict(self, text: str) -> Dict[str, Any]:
        """Predict complaint category and confidence."""
        if not text or not text.strip() or self.pipeline is None:
            return {"category": "other", "confidence": 0.0}

        try:
            # Predict probabilities
            probs = self.pipeline.predict_proba([text.strip()])[0]
            classes = self.pipeline.classes_

            best_idx = probs.argmax()
            best_category = str(classes[best_idx])
            best_confidence = float(probs[best_idx])

            # If confidence is below threshold, fallback to 'other'
            if best_confidence < CONFIDENCE_THRESHOLD:
                return {"category": "other", "confidence": 0.0}

            return {
                "category": best_category,
                "confidence": round(best_confidence, 4)
            }
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return {"category": "other", "confidence": 0.0}


# ==============================================================================
# UPGRADE READY: Transformer Classifier (distilbert-base-multilingual-cased / IndicBERT)
# ==============================================================================
class TransformerComplaintClassifier(BaseComplaintClassifier):
    """
    Transformer-based Multilingual Classifier.

    ============================================================================
    UPGRADE GUIDE:
    ============================================================================
    To upgrade from the TF-IDF baseline to a Deep Learning Transformer:
    
    1. SELECT MODEL ARCHITECTURE:
       - 'distilbert-base-multilingual-cased'
         * 104 languages supported including Hindi, English, and Bengali.
         * Fast inference, lightweight footprint (~540MB).
       
       - 'ai4bharat/indic-bert'
         * Specifically trained for 12 major Indian languages (including Hindi).
         * Excellent representation of Indian linguistic nuances and devanagari script.

    2. FINE-TUNING INSTRUCTIONS:
       Run fine-tuning using Hugging Face Trainer:
       ```python
       from transformers import AutoModelForSequenceClassification, AutoTokenizer, Trainer, TrainingArguments
       model_name = "distilbert-base-multilingual-cased" # or "ai4bharat/indic-bert"
       tokenizer = AutoTokenizer.from_pretrained(model_name)
       model = AutoModelForSequenceClassification.from_pretrained(
           model_name, num_labels=10, id2label=id2label, label2id=label2id
       )
       # Train on dataset/complaints.csv
       # Save weights to models/transformer_classifier/
       ```

    3. ACTIVATING IN PRODUCTION:
       - Set environment variable:
         CLASSIFIER_BACKEND=transformer
         TRANSFORMER_MODEL_PATH=models/transformer_classifier (or HuggingFace model repo)
       The ComplaintClassifier factory will automatically initialize this class.
    ============================================================================
    """

    def __init__(self, model_name_or_path: str = "distilbert-base-multilingual-cased"):
        self.model_name_or_path = model_name_or_path
        self.tokenizer = None
        self.model = None
        self.device = None
        self.id2label = {i: cat for i, cat in enumerate(OFFICIAL_CATEGORIES)}
        self.label2id = {cat: i for i, cat in enumerate(OFFICIAL_CATEGORIES)}
        self._initialize_model()

    def _initialize_model(self) -> None:
        """Initializes Hugging Face tokenizer and model."""
        try:
            import torch
            from transformers import AutoTokenizer, AutoModelForSequenceClassification

            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            logger.info(f"Loading transformer model '{self.model_name_or_path}' on {self.device}...")
            
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name_or_path)
            self.model = AutoModelForSequenceClassification.from_pretrained(
                self.model_name_or_path,
                num_labels=len(OFFICIAL_CATEGORIES)
            ).to(self.device)
            self.model.eval()
            logger.info("Transformer model loaded successfully.")
        except Exception as e:
            logger.warning(
                f"Transformer model '{self.model_name_or_path}' not loaded (expected if fine-tuned weights are not yet saved): {e}"
            )
            self.model = None
            self.tokenizer = None

    def predict(self, text: str) -> Dict[str, Any]:
        """Inference with Transformer model."""
        if not text or not text.strip():
            return {"category": "other", "confidence": 0.0}

        if self.model is None or self.tokenizer is None:
            raise RuntimeError(
                f"Transformer model '{self.model_name_or_path}' is not initialized. "
                "Ensure PyTorch and Transformers are installed and model weights exist."
            )

        import torch

        inputs = self.tokenizer(
            text.strip(),
            padding=True,
            truncation=True,
            max_length=256,
            return_tensors="pt"
        ).to(self.device)

        with torch.no_grad():
            outputs = self.model(**inputs)
            probs = torch.softmax(outputs.logits, dim=1).squeeze()

            best_idx = torch.argmax(probs).item()
            best_confidence = float(probs[best_idx].item())
            best_category = self.id2label.get(best_idx, "other")

        if best_confidence < CONFIDENCE_THRESHOLD:
            return {"category": "other", "confidence": 0.0}

        return {
            "category": best_category,
            "confidence": round(best_confidence, 4)
        }

    def save(self, save_directory: str) -> None:
        """
        Saves transformer model and tokenizer using Hugging Face save_pretrained().
        Strict rule: Do NOT use joblib or pickle for transformer models.
        """
        if self.model is None or self.tokenizer is None:
            raise RuntimeError("Cannot save uninitialized transformer model or tokenizer.")
        os.makedirs(save_directory, exist_ok=True)
        self.model.save_pretrained(save_directory)
        self.tokenizer.save_pretrained(save_directory)
        logger.info(f"Transformer model and tokenizer saved to {save_directory} via save_pretrained().")


# ==============================================================================
# SINGLETON FACTORY & LOADER
# ==============================================================================
_classifier_instance: Optional[BaseComplaintClassifier] = None


def get_classifier() -> BaseComplaintClassifier:
    """
    Returns the singleton instance of the complaint classifier.
    Loads once on the first request and caches in memory.
    
    To switch between baseline and transformer:
    Set CLASSIFIER_BACKEND="transformer" in your environment or .env file.
    Default: "baseline" (TF-IDF + Logistic Regression).
    """
    global _classifier_instance
    if _classifier_instance is None:
        backend = os.getenv("CLASSIFIER_BACKEND", "baseline").lower()
        if backend == "transformer":
            model_path = os.getenv("TRANSFORMER_MODEL_PATH", "distilbert-base-multilingual-cased")
            logger.info(f"Initializing Transformer Complaint Classifier ({model_path})...")
            _classifier_instance = TransformerComplaintClassifier(model_name_or_path=model_path)
        else:
            logger.info("Initializing Multilingual TF-IDF + Logistic Regression Classifier...")
            _classifier_instance = TfidfLogisticClassifier()
            
    return _classifier_instance


def classify(text: str) -> Dict[str, Any]:
    """Helper function to classify complaint text using the singleton classifier."""
    classifier = get_classifier()
    return classifier.predict(text)
