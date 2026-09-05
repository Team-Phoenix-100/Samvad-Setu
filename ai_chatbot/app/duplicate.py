"""
Module to check if the same or similar problem was already reported (Duplicate Detection).

Workflow:
complaint -> multilingual embedding -> FAISS similarity search (IndexFlatIP)
          -> compare against previous complaints -> detect possible duplicate.

Key Features:
- Multilingual Sentence Transformer (paraphrase-multilingual-MiniLM-L12-v2 or LaBSE).
  Handles English, Hindi (Devanagari), and Hinglish complaints.
- FAISS IndexFlatIP (Inner Product of L2-normalized embeddings = Cosine Similarity).
- Threshold: approximately 0.85 similarity.
- Persistent index and metadata storage in `embeddings/` directory.
- Model and index loaded ONCE (Singleton pattern) for high-performance inference.
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List, Tuple
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# Default configurations
DEFAULT_SIMILARITY_THRESHOLD = 0.85
DEFAULT_MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
# Alternative high-accuracy bitext model: "sentence-transformers/LaBSE"


class DuplicateDetector:
    """
    Multilingual complaint duplicate detector using Sentence Transformers and FAISS.
    """

    def __init__(
        self,
        model_name: Optional[str] = None,
        embeddings_dir: Optional[str] = None,
        threshold: float = DEFAULT_SIMILARITY_THRESHOLD
    ):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        self.embeddings_dir = embeddings_dir or os.path.join(base_dir, "embeddings")
        os.makedirs(self.embeddings_dir, exist_ok=True)

        self.index_path = os.path.join(self.embeddings_dir, "complaints.index")
        self.metadata_path = os.path.join(self.embeddings_dir, "complaints_metadata.json")

        self.model_name = (
            model_name 
            or os.getenv("EMBEDDING_MODEL_NAME") 
            or DEFAULT_MODEL_NAME
        )
        self.threshold = threshold

        # Lazy loaded components
        self.model = None
        self.index = None
        self.metadata: List[Dict[str, Any]] = []  # Stores [{"id": ..., "text": ..., "category": ...}]
        self.dimension: Optional[int] = None

        # Load resources
        self._load_model()
        self._load_or_build_index()

    def _load_model(self) -> None:
        """Loads the Sentence Transformer model once into memory."""
        try:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading multilingual SentenceTransformer: {self.model_name}...")
            self.model = SentenceTransformer(self.model_name)
            self.dimension = self.model.get_sentence_embedding_dimension()
            logger.info(f"SentenceTransformer loaded successfully (dimension={self.dimension}).")
        except Exception as e:
            logger.error(f"Failed to load SentenceTransformer '{self.model_name}': {e}")
            self.model = None

    def _load_or_build_index(self) -> None:
        """Loads FAISS index and metadata from disk, or builds it from dataset."""
        import faiss

        # 1. Try loading existing index and metadata
        if os.path.exists(self.index_path) and os.path.exists(self.metadata_path):
            try:
                logger.info(f"Loading existing FAISS index from {self.index_path}...")
                self.index = faiss.read_index(self.index_path)
                with open(self.metadata_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
                logger.info(f"Loaded FAISS index with {self.index.ntotal} records.")
                return
            except Exception as e:
                logger.warning(f"Error loading existing FAISS index/metadata: {e}. Rebuilding...")

        # 2. Build index from dataset/complaints.csv if available
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        dataset_path = os.path.join(base_dir, "dataset", "complaints.csv")
        
        if os.path.exists(dataset_path) and self.model is not None:
            self.build_index_from_csv(dataset_path)
        else:
            # Initialize an empty FAISS IndexFlatIP
            if self.dimension:
                self.index = faiss.IndexFlatIP(self.dimension)
                self.metadata = []
                logger.info("Initialized new empty FAISS IndexFlatIP.")

    def build_index_from_csv(self, csv_path: str) -> None:
        """
        Builds and saves the FAISS index and metadata from a complaints CSV file.
        Uses IndexFlatIP with L2-normalized vectors (equivalent to Cosine Similarity).
        """
        import faiss

        if self.model is None:
            raise RuntimeError("SentenceTransformer model is not loaded.")

        logger.info(f"Building FAISS index from dataset: {csv_path}...")
        df = pd.read_csv(csv_path)

        if "complaint" not in df.columns or "id" not in df.columns:
            raise ValueError("CSV must contain 'id' and 'complaint' columns.")

        df = df.dropna(subset=["id", "complaint"])
        texts = df["complaint"].astype(str).tolist()
        ids = df["id"].astype(str).tolist()
        categories = df["category"].astype(str).tolist() if "category" in df.columns else ["other"] * len(texts)

        # Generate embeddings
        logger.info(f"Encoding {len(texts)} complaints...")
        embeddings = self.model.encode(
            texts,
            batch_size=64,
            show_progress_bar=False,
            convert_to_numpy=True,
            normalize_embeddings=True
        ).astype(np.float32)

        # Build FAISS IndexFlatIP (Inner Product on L2-normalized vectors = Cosine Similarity)
        dimension = embeddings.shape[1]
        self.dimension = dimension
        self.index = faiss.IndexFlatIP(dimension)
        self.index.add(embeddings)

        # Build metadata mapping
        self.metadata = [
            {"id": id_val, "text": text_val, "category": cat_val}
            for id_val, text_val, cat_val in zip(ids, texts, categories)
        ]

        # Save index and metadata
        self._save_index_and_metadata()
        logger.info(f"Built and saved FAISS index with {self.index.ntotal} complaints.")

    def _save_index_and_metadata(self) -> None:
        """Persists the FAISS index and metadata to the embeddings/ directory."""
        import faiss

        if self.index is not None:
            faiss.write_index(self.index, self.index_path)
        with open(self.metadata_path, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, ensure_ascii=False, indent=2)

    def add_complaint(self, complaint_id: str, text: str, category: Optional[str] = None) -> None:
        """
        Dynamically adds a new verified complaint into the FAISS index and metadata.
        """
        import faiss

        if not text or not text.strip() or self.model is None:
            return

        embedding = self.model.encode(
            [text.strip()],
            convert_to_numpy=True,
            normalize_embeddings=True
        ).astype(np.float32)

        if self.index is None:
            self.dimension = embedding.shape[1]
            self.index = faiss.IndexFlatIP(self.dimension)
    
        self.index.add(embedding)
        self.metadata.append({
            "id": complaint_id,
            "text": text.strip(),
            "category": category or "other"
        })

        self._save_index_and_metadata()
        logger.info(f"Added complaint {complaint_id} to FAISS index. Total: {self.index.ntotal}")

    def check_duplicate(
        self,
        complaint_text: str,
        threshold: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Checks if a complaint is a duplicate of an existing complaint.

        Args:
            complaint_text: Citizen complaint in English, Hindi, or Hinglish.
            threshold: Similarity threshold (default: 0.85).
        
        Returns:
            Dict matching format:
            {
                "isDuplicate": bool,
                "similarity": float,
                "matchedComplaintId": Optional[str],
                "matchedComplaintText": Optional[str]
            }
        """
        cutoff = threshold if threshold is not None else self.threshold

        if not complaint_text or not complaint_text.strip():
            return {
                "isDuplicate": False,
                "similarity": 0.0,
                "matchedComplaintId": None
            }

        if self.model is None or self.index is None or self.index.ntotal == 0:
            logger.warning("DuplicateDetector index or model not ready for duplicate check.")
            return {
                "isDuplicate": False,
                "similarity": 0.0,
                "matchedComplaintId": None
            }

        # 1. Compute normalized embedding for the incoming complaint
        query_embedding = self.model.encode(
            [complaint_text.strip()],
            convert_to_numpy=True,
            normalize_embeddings=True
        ).astype(np.float32)

        # 2. Perform FAISS Inner Product search (Cosine Similarity)
        # k=1 returns the single closest match
        scores, indices = self.index.search(query_embedding, k=1)

        best_score = float(scores[0][0])
        best_idx = int(indices[0][0])

        if best_idx >= 0 and best_idx < len(self.metadata):
            matched = self.metadata[best_idx]
            is_dup = best_score >= cutoff

            return {
                "isDuplicate": bool(is_dup),
                "similarity": round(best_score, 4),
                "matchedComplaintId": matched["id"] if is_dup else None,
                "matchedComplaintText": matched["text"] if is_dup else None
            }

        return {
            "isDuplicate": False,
            "similarity": 0.0,
            "matchedComplaintId": None
        }


# ==============================================================================
# SINGLETON FACTORY & MODULE INTERFACE
# ==============================================================================
_detector_instance: Optional[DuplicateDetector] = None


def get_duplicate_detector() -> DuplicateDetector:
    """
    Returns the singleton DuplicateDetector instance.
    Loads the Sentence Transformer model and FAISS index ONCE.
    """
    global _detector_instance
    if _detector_instance is None:
        logger.info("Initializing DuplicateDetector singleton...")
        _detector_instance = DuplicateDetector()
    return _detector_instance


def check_duplicate(text: str, threshold: float = DEFAULT_SIMILARITY_THRESHOLD) -> Dict[str, Any]:
    """
    Convenience function to check duplicates using the singleton detector.

    Returns:
        {
            "isDuplicate": true/false,
            "similarity": 0.0,
            "matchedComplaintId": "..."
        }
    """
    detector = get_duplicate_detector()
    return detector.check_duplicate(text, threshold=threshold)
