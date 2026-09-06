# Samvad-Setu AI Chatbot Engine

The `ai_chatbot` service provides multilingual NLP capabilities for the **Samvad-Setu** civic platform:
1. **Complaint Categorization** (10 official categories + multilingual TF-IDF/IndicBERT)
2. **Duplicate Detection** (Multilingual Sentence Transformers + FAISS `IndexFlatIP`)
3. **Severity Assessment & Priority Scoring** (Hardcoded emergency safety layer + fixed deterministic formula)
4. **Department Recommendation** (Deterministic category-to-department lookup table)

---

## ⚡ Task 5: Severity & Priority Engine (`app/severity.py`)

### Canonical Severity Levels
- `Low`
- `Medium`
- `High`
- `Critical`

### 🛡️ Hardcoded Emergency Safety Layer
To guarantee citizen safety, a hardcoded regex pattern layer checks incoming complaint text across English, Hindi (Devanagari), and Hinglish (Romanized).

If **any** emergency keyword is detected, the severity is **forcibly escalated to `"Critical"`**, overriding any machine learning prediction or heuristic:
- **Mandatory keywords**: `contaminated`, `collapse`, `fire`
- **English keywords**: `explosion`, `blast`, `cylinder blast`, `gas leak`, `electrocution`, `live wire`, `toxic`, `poison`, `open manhole`, `trapped`, `drowning`, `fatal`, `casualties`, etc.
- **Hindi (Devanagari)**: `आग`, `भीषण आग`, `विस्फोट`, `धमाका`, `ढह गया`, `गिर गया`, `दूषित पानी`, `जहरीला`, `करंट`, `सिलेंडर ब्लास्ट`, `खुला मैनहोल`, आदि.
- **Hinglish (Romanized)**: `aag`, `visphot`, `blast`, `gir gaya`, `dhah gaya`, `dooshit`, `zeher`, `current lag gaya`, `cylinder phat`, `khula manhole`, etc.

### 📐 Exact Priority Formula (Fixed & Deterministic)
The priority score is calculated using one fixed formula bounded between 1 and 100:

$$\text{Priority} = \min(100, \max(1, S + D + R))$$

Where:
1. **Severity Weight ($S \in \{10, 20, 35, 50\}$)**:
   - **Critical** : $50\text{ points}$
   - **High**     : $35\text{ points}$
   - **Medium**   : $20\text{ points}$
   - **Low**      : $10\text{ points}$

2. **Duplicate Boost ($D \in [0, 25]$)**:
   $$D = \min(25, \text{duplicate\_count} \times 5)$$
   Every additional duplicate report from affected citizens adds $+5$ points (capped at 25 points, reached at 5+ reports).

3. **Recency Score ($R \in [5, 25]$)**:
   Measured by hours elapsed ($t$) since the complaint was filed:
   - $t \le 2\text{ hours}$ : $25\text{ points}$ (immediate emergency response window)
   - $2 < t \le 12\text{ hours}$ : $20\text{ points}$
   - $12 < t \le 24\text{ hours}$ : $15\text{ points}$
   - $24 < t \le 48\text{ hours}$ : $10\text{ points}$
   - $t > 48\text{ hours}$ : $5\text{ points}$

*(Note: The formula is completely deterministic and never changes dynamically).*

### Output Format
```json
{
    "severity": "Critical",
    "priority": 100
}
```

---

## 🏛️ Task 6: Department Recommendation (`app/department.py`)

Department routing uses a deterministic lookup table. **No machine learning models are used.**

### Official Mapping Table

| Complaint Category (`category`) | Recommended Municipal Department |
| :--- | :--- |
| `education` | Education Department |
| `agriculture` | Agriculture Department |
| `healthcare` | Health Department |
| `water` | Water Department |
| `environment` | Environment Department |
| `energy` | Energy Department |
| `urban_development` | Urban Development Department |
| `accessibility` | Accessibility Department |
| `public_admin` | Public Administration Department |
| `rural_livelihoods` | Rural Livelihoods Department |
| *unmapped / other* | *General Administration Department* |

### Normalization & Aliases
The `get_department(category)` function automatically handles:
- Case-insensitivity (e.g. `EDUCATION` $\rightarrow$ `Education Department`)
- Space/hyphen replacement (e.g. `urban development` $\rightarrow$ `Urban Development Department`)
- Aliases (e.g. `health`, `electricity`, `roads`, `sanitation`, `school`)

---

## 🧑‍💼 Task 7: Human Review and Feedback (`app/feedback.py`)

To continuously improve classification quality without deploying unvetted model predictions:

### Human Review Threshold
- If classification confidence is below `0.70` (`confidence < 0.70`):
  - The prediction response automatically flags `needsHumanReview = true`.
  - Enables active learning workflow where municipal reviewers verify uncertain complaints.

### Feedback Storage (`dataset/human_feedback.csv`)
Human corrections and ground-truth labels are recorded in `dataset/human_feedback.csv` for future retraining:
- **Columns**:
  - `complaint` : Raw citizen complaint text.
  - `predicted_category` : Initial model prediction.
  - `correct_category` : Human-verified ground truth category.
  - `timestamp` : ISO 8601 UTC timestamp of the review.

---

## 💬 Task 8: Offline Multilingual FAQ Chatbot (`app/chatbot.py`)

Civic assistance chatbot that provides instant answers to common citizen inquiries without requiring paid external LLM APIs (Gemini/OpenAI).

### Features
1. **Curated Civic Knowledge Base (`chatbot/faq.csv`)**:
   - Contains 50 detailed question-and-answer pairs covering:
     - Reporting complaints, tracking status, and SLA timelines
     - Water supply, contaminated tap water, and tanker requests
     - Electricity blackouts, sparking wires, and streetlights
     - Roads, potholes, pedestrian accessibility, and traffic lights
     - Healthcare, primary health centers, and medicine stockouts
     - Government schools, toilets, and mid-day meal quality
     - Sanitation, missed garbage pickup, and clogged drains
     - Government certificates (caste/income) and pension status
     - Complaint escalation hierarchy and university R&D pipeline
2. **Dedicated FAISS Index (`embeddings/faq.index`)**:
   - Uses the **same** multilingual Sentence Transformer model (`paraphrase-multilingual-MiniLM-L12-v2`).
   - Maintains a **completely separate** index and metadata file (`embeddings/faq_metadata.json`), ensuring zero interference with the complaint duplicate index.
3. **Exact Fallback Contract**:
   - If user query matches an FAQ with cosine similarity $\ge 0.65$: returns the informative FAQ answer.
   - If no good match exists (similarity $< 0.65$ or out-of-domain query): returns **exactly**:
     `"Want to report this as a problem instead?"`

---

## 🔌 Task 9: FastAPI Internal AI Microservice Endpoints

For high-performance inter-process communication with the **Node.js** backend:

### 1. Unified Classification & Triage
- **Endpoint**: `POST /internal/ai/classify`
- **Request Body**:
  ```json
  {
      "complaint": "There is no drinking water in our village"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
      "category": "water",
      "confidence": 0.91,
      "needsHumanReview": false,
      "severity": "High",
      "priority": 60,
      "department": "Water Department"
  }
  ```
- **Unified Logic**:
  - `category` & `confidence`: classified via multilingual NLP.
  - `needsHumanReview`: `true` if `confidence < 0.70`, otherwise `false`.
  - `severity`: canonical level (`Critical`, `High`, `Medium`, `Low`) with automatic safety escalation for emergency keywords (`fire`, `collapse`, `contaminated`, etc.).
  - `priority`: computed using the fixed deterministic formula ($S + D + R \in [1, 100]$).
  - `department`: mapped via deterministic lookup table.

### 2. Duplicate Detection
- **Endpoint**: `POST /internal/ai/dedup`
- **Request Body**:
  ```json
  {
      "complaint": "Huge dangerous pothole near school road"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
      "isDuplicate": true,
      "similarity": 0.9234,
      "matchedComplaintId": "cmp_1042",
      "matchedComplaintText": "Dangerous deep pothole near the school"
  }
  ```

### 3. Multilingual FAQ Chatbot Message
- **Endpoint**: `POST /internal/ai/chatbot/message`
- **Request Body**:
  ```json
  {
      "message": "How can I check the status of my complaint?"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
      "response": "Go to Track Status on the portal or mobile app and enter your grievance ticket ID to see real-time progress and assigned department updates.",
      "matched": true,
      "similarity": 0.8841
  }
  ```
  *(If query is out-of-domain, returns exactly `"Want to report this as a problem instead?"` with `matched: false`).*

### 4. Human Review Feedback
- **Endpoint**: `POST /internal/ai/feedback`
- **Request Body**:
  ```json
  {
      "complaint": "Street light flashing continuously",
      "predicted_category": "urban_development",
      "correct_category": "energy",
      "timestamp": "2026-09-06T01:00:00Z"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
      "status": "success",
      "message": "Human feedback recorded successfully.",
      "total_records": 1
  }
  ```

### 5. Service Health Check
- **Endpoint**: `GET /internal/health`
- **Response** (`200 OK`):
  ```json
  {
      "status": "healthy",
      "service": "samvad-setu-ai-engine",
      "version": "1.0.0"
  }
  ```

---

## 🚀 Public API Reference

### 1. Severity & Priority Assessment
- **Endpoint**: `POST /api/severity`

- **Request Body**:
  ```json
  {
    "text": "Drinking water in ward 4 is contaminated and residents are falling sick.",
    "duplicate_count": 3,
    "recency": 1.0,
    "model_prediction": "Low"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "severity": "Critical",
    "priority": 90
  }
  ```

### 2. Department Recommendation
- **Endpoint**: `POST /api/department`
- **Request Body**:
  ```json
  {
    "category": "healthcare"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "category": "healthcare",
    "department": "Health Department"
  }
  ```

### 3. Classification with Human Review Flag
- **Endpoint**: `POST /api/classify`
- **Request Body**:
  ```json
  {
    "text": "The streetlight on 5th cross is not turning on."
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "category": "energy",
    "confidence": 0.65,
    "needsHumanReview": true
  }
  ```

### 4. Human Feedback / Corrections
- **Endpoint**: `POST /api/feedback`
- **Request Body**:
  ```json
  {
    "complaint": "Dirty contaminated water in tap",
    "predicted_category": "water",
    "correct_category": "healthcare",
    "timestamp": "2026-09-06T00:30:00Z"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "status": "success",
    "message": "Human feedback recorded successfully.",
    "total_records": 1
  }
  ```

### 5. FAQ Chatbot Inquiry
- **Endpoint**: `POST /api/chat`
- **Request Body**:
  ```json
  {
    "user_id": "citizen_123",
    "message": "How do I report a pothole on the road?"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "status": "success",
    "response": "Take a picture of the pothole and upload it under the Urban Development or Public Works Department. GPS tags help road maintenance teams locate it."
  }
  ```

---

## 🧪 Testing

Run test suites using Python's built-in `unittest`:
```powershell
python -m unittest tests/test_severity.py tests/test_department.py tests/test_feedback.py tests/test_faq_chatbot.py -v
```

