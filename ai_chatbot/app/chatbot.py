"""
Module: app.chatbot
Description: Offline FAQ Chatbot for Samvad-Setu citizens using Multilingual Embeddings and FAISS.

Architecture:
- Uses the SAME multilingual Sentence Transformer model as duplicate detection:
  'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'.
- Maintains a SEPARATE FAISS index ('embeddings/faq.index' and 'embeddings/faq_metadata.json').
- Does NOT mix with the complaint duplicate index.
- Uses IndexFlatIP with L2-normalized embeddings (Cosine Similarity).
- If similarity >= threshold (default: 0.65), returns the matching FAQ answer.
- If similarity < threshold (no good match), returns EXACTLY:
  "Want to report this as a problem instead?"
- Zero paid LLM API dependency; completely offline & local.
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List, Tuple
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# Default configurations
DEFAULT_FAQ_SIMILARITY_THRESHOLD = 0.65
DEFAULT_MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
FALLBACK_RESPONSE = "Want to report this as a problem instead?"


class FAQChatbot:
    """
    Multilingual FAQ Chatbot engine utilizing Sentence Transformers and FAISS.
    Maintains an independent FAISS index specifically for civic FAQs.
    """

    def __init__(
        self,
        model_name: Optional[str] = None,
        embeddings_dir: Optional[str] = None,
        faq_csv_path: Optional[str] = None,
        threshold: float = DEFAULT_FAQ_SIMILARITY_THRESHOLD
    ):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

        self.embeddings_dir = embeddings_dir or os.path.join(base_dir, "embeddings")
        os.makedirs(self.embeddings_dir, exist_ok=True)

        # SEPARATE index and metadata files dedicated exclusively to FAQs
        self.index_path = os.path.join(self.embeddings_dir, "faq.index")
        self.metadata_path = os.path.join(self.embeddings_dir, "faq_metadata.json")

        self.faq_csv_path = faq_csv_path or os.path.join(base_dir, "chatbot", "faq.csv")
        self.model_name = (
            model_name
            or os.getenv("EMBEDDING_MODEL_NAME")
            or DEFAULT_MODEL_NAME
        )
        self.threshold = threshold

        # Lazy loaded components
        self.model = None
        self.index = None
        self.metadata: List[Dict[str, str]] = []  # [{"question": ..., "answer": ...}]
        self.dimension: Optional[int] = None

        # Initialize model and FAISS index
        self._load_model()
        self._load_or_build_index()

    def _load_model(self) -> None:
        """Loads SentenceTransformer model once into memory."""
        try:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading multilingual SentenceTransformer for FAQ Chatbot: {self.model_name}...")
            self.model = SentenceTransformer(self.model_name)
            self.dimension = self.model.get_sentence_embedding_dimension()
            logger.info(f"FAQ SentenceTransformer loaded successfully (dimension={self.dimension}).")
        except Exception as e:
            logger.error(f"Failed to load SentenceTransformer '{self.model_name}': {e}")
            self.model = None

    def _load_or_build_index(self) -> None:
        """Loads existing FAQ FAISS index or builds from chatbot/faq.csv."""
        import faiss

        # 1. Try loading existing index and metadata from disk
        if os.path.exists(self.index_path) and os.path.exists(self.metadata_path):
            try:
                logger.info(f"Loading existing FAQ FAISS index from {self.index_path}...")
                self.index = faiss.read_index(self.index_path)
                with open(self.metadata_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
                logger.info(f"Loaded FAQ FAISS index with {self.index.ntotal} records.")
                return
            except Exception as e:
                logger.warning(f"Error loading existing FAQ index/metadata: {e}. Rebuilding...")

        # 2. Build index from chatbot/faq.csv if available
        if os.path.exists(self.faq_csv_path) and self.model is not None:
            self.build_index_from_csv(self.faq_csv_path)
        else:
            if self.dimension:
                self.index = faiss.IndexFlatIP(self.dimension)
                self.metadata = []
                logger.info("Initialized new empty FAQ FAISS IndexFlatIP.")

    def build_index_from_csv(self, csv_path: str) -> None:
        """
        Builds and saves the FAQ FAISS index and metadata from faq.csv.
        Embeds FAQ questions using IndexFlatIP with L2-normalized vectors (Cosine Similarity).
        """
        import faiss

        if self.model is None:
            raise RuntimeError("SentenceTransformer model is not loaded.")

        logger.info(f"Building FAQ FAISS index from: {csv_path}...")
        df = pd.read_csv(csv_path)

        if "question" not in df.columns or "answer" not in df.columns:
            raise ValueError("CSV must contain 'question' and 'answer' columns.")

        df = df.dropna(subset=["question", "answer"])
        questions = df["question"].astype(str).tolist()
        answers = df["answer"].astype(str).tolist()

        logger.info(f"Encoding {len(questions)} FAQ questions...")
        embeddings = self.model.encode(
            questions,
            batch_size=32,
            show_progress_bar=False,
            convert_to_numpy=True,
            normalize_embeddings=True
        ).astype(np.float32)

        dimension = embeddings.shape[1]
        self.dimension = dimension

        # IndexFlatIP with normalized vectors = Cosine Similarity
        self.index = faiss.IndexFlatIP(dimension)
        self.index.add(embeddings)

        self.metadata = [
            {"question": q, "answer": a}
            for q, a in zip(questions, answers)
        ]

        # Persist to disk
        faiss.write_index(self.index, self.index_path)
        with open(self.metadata_path, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, ensure_ascii=False, indent=2)

        logger.info(
            f"Successfully built FAQ FAISS index with {self.index.ntotal} items. "
            f"Saved to {self.index_path}"
        )

    def search_faq(
        self,
        query: str,
        threshold: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Searches the FAQ index for the best match to a user's question.
        
        Args:
            query: Citizen inquiry string.
            threshold: Cosine similarity cutoff (default: 0.65).
            
        Returns:
            Dict containing:
            {
                "answer": "...",
                "matched": bool,
                "similarity": float,
                "matched_question": Optional[str]
            }
        """
        cutoff = self.threshold if threshold is None else threshold

        if not query or not isinstance(query, str) or not query.strip():
            return {
                "answer": FALLBACK_RESPONSE,
                "matched": False,
                "similarity": 0.0,
                "matched_question": None
            }

        # Fallback if model or index is unavailable
        if self.model is None or self.index is None or self.index.ntotal == 0:
            return {
                "answer": FALLBACK_RESPONSE,
                "matched": False,
                "similarity": 0.0,
                "matched_question": None
            }

        clean_query = query.strip()
        query_embedding = self.model.encode(
            [clean_query],
            convert_to_numpy=True,
            normalize_embeddings=True
        ).astype(np.float32)

        # Search nearest neighbor (k=1)
        scores, indices = self.index.search(query_embedding, k=1)
        best_score = float(scores[0][0])
        best_idx = int(indices[0][0])

        if best_idx >= 0 and best_idx < len(self.metadata) and best_score >= cutoff:
            matched_item = self.metadata[best_idx]
            return {
                "answer": matched_item["answer"],
                "matched": True,
                "similarity": round(best_score, 4),
                "matched_question": matched_item["question"]
            }

        return {
            "answer": FALLBACK_RESPONSE,
            "matched": False,
            "similarity": round(best_score, 4) if best_idx >= 0 else 0.0,
            "matched_question": None
        }

    def get_response(
        self,
        query: str,
        threshold: Optional[float] = None
    ) -> str:
        """
        Returns the FAQ answer if matched sufficiently well,
        otherwise returns exactly:
        'Want to report this as a problem instead?'
        """
        result = self.search_faq(query, threshold=threshold)
        return result["answer"]


# ==============================================================================
# SINGLETON FACTORY & MODULE CONVENIENCE INTERFACE
# ==============================================================================
_chatbot_instance: Optional[FAQChatbot] = None


def get_faq_chatbot() -> FAQChatbot:
    """
    Returns the singleton FAQChatbot instance.
    Loads the Sentence Transformer model and FAQ FAISS index ONCE.
    """
    global _chatbot_instance
    if _chatbot_instance is None:
        logger.info("Initializing FAQChatbot singleton...")
        _chatbot_instance = FAQChatbot()
    return _chatbot_instance


def answer_faq_query(query: str, threshold: float = DEFAULT_FAQ_SIMILARITY_THRESHOLD) -> str:
    """
    Convenience function to get an answer from the FAQ chatbot singleton.
    
    Returns:
        FAQ answer string, or 'Want to report this as a problem instead?'
    """
    bot = get_faq_chatbot()
    return bot.get_response(query, threshold=threshold)


if __name__ == "__main__":
    print("=" * 60)
    print("FAQ CHATBOT DEMO")
    print("=" * 60)

    bot = get_faq_chatbot()

    test_queries = [
        "How do I submit a complaint?",
        "Where can I check status of my grievance?",
        "Nal me ganda paani aa raha hai",
        "Street light kharab hai kaun thik karega?",
        "What is the capital of Australia?",
        "xyz random gibberish 12345"
    ]

    for q in test_queries:
        res = bot.search_faq(q)
        print(f"Query    : '{q}'")
        print(f"Matched  : {res['matched']} (Similarity: {res['similarity']})")
        print(f"Answer   : {res['answer']}")
        print("-" * 60)
