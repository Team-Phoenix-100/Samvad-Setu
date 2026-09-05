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

## 🚀 API Reference

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

---

## 🧪 Testing

Run test suites using Python's built-in `unittest`:
```powershell
python -m unittest tests/test_severity.py tests/test_department.py -v
```
