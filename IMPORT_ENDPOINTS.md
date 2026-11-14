# Content Import — Endpoints & Missing Fields


## Endpoints used (in call order)

### 1. Create unit
`POST api/curriculum/units/`

```json
{
  "subject": 12,
  "code": "U11",
  "title": "Unit title",
  "main_goal_description": "string | null",
  "central_question": "string | null",
  "order_index": 5
}
```

### 2. Create lesson
`POST api/curriculum/lessons/`

```json
{
  "unit": 23,
  "code": "U11-L01",
  "title": "Lesson title",
  "description": "string",
  "order_index": 1
}
```

### 3. Create goal
`POST api/curriculum/goals/`

```json
{
  "lesson": 87,
  "goal_type": "conceptual | operational",
  "title": "Goal title",
  "description": "string",
  "order_index": 1
}
```
`order_index` is always `1` for `conceptual`, `2` for `operational`.

### 4. Create skill
`POST api/skills/skills/`

```json
{
  "goal": 142,
  "skill_type": "conceptual | operational",
  "code": "SK-U11-L01-C01",
  "name": "Skill name",
  "description": "string",
  "difficulty": 2,
  "mastery_threshold": 0.8,
  "required_consecutive_correct": 3,
  "order_index": 1
}
```
`mastery_threshold` and `required_consecutive_correct`

### 5. Create content chunk
`POST api/skills/chunks/`

```json
{
  "skill": 310,
  "code": "SK-U11-L01-C01-CH01",
  "chunk_type": "rule | example | practice | error | hint | real_life",
  "title": "string | null",
  "content": "string",
  "difficulty": 1,
  "points": 1,
  "correct_answer": "string | null (practice only)",
  "options": ["string", "..."],
  "time_limit": 60,
  "order_index": 1
}
```

Note: there is also `POST api/skills/prerequisites/` ({ skill, prerequisite }),
but it is **not called** by the import — prerequisite links from the source
file are currently dropped (see below).

## Field gaps by level

Source reference: `M1AF/M1AF.json` (digitized math textbook, grade 1).

### Unit
Accepted by `POST units/`: `subject, code, title, main_goal_description, central_question, order_index`

| Source field | Supported? |
|---|---|
| `description` | ❌ missing |
| `main_skill_domain` | ❌ missing |
| `term` | ❌ missing |
| `competency_ref` | ❌ missing |
| `thumbnail` (image) | ✅ supported on unit only, but not populated by import (source file has no unit image) |

### Lesson
Accepted by `POST lessons/`: `unit, code, title, description, order_index`

| Source field | Supported? |
|---|---|
| `programme_ref` | ❌ missing (new field in latest source file) |
| `week` | ❌ missing (new) |
| `programme_weeks` | ❌ missing (new) |
| `book_exercises` | ❌ missing (new) |

### Goal
Accepted by `POST goals/`: `lesson, goal_type, title, description, order_index`

No gaps — all meaningful source fields are supported.

### Skill
Accepted by `POST skills/`: `goal, skill_type, code, name, description, difficulty, mastery_threshold, required_consecutive_correct, order_index`

| Source field | Supported? |
|---|---|
| `prerequisites` | ❌ not sent (relation exists via a separate endpoint, unused by import) |

### Content chunk — largest gap
Accepted by `POST chunks/`: `skill, code, chunk_type, title, content, difficulty, points, correct_answer, options (string[]), time_limit, order_index`

| Source field | Supported? |
|---|---|
| **`image`** | ❌ **not supported at all** — no image field exists anywhere on chunks |
| **`needs_image`** | ❌ missing |
| **`image_note`** | ❌ missing |
| **`options[]` rich structure** (`{id, text, is_correct, error_category, feedback}` per option) | ⚠️ flattened to plain `string[]` — per-option `is_correct`, `error_category`, and `feedback` are all lost |

## Images — not supported anywhere on chunks

The only image upload supported by the whole system is the unit **thumbnail**
(`POST units/` with `multipart/form-data`, field `thumbnail`). Lessons and
chunks have **no image field** in their API payloads.

The source file (`M1AF.json`) contains **663 images**, each tied to an
individual content chunk (e.g. `images/M1AF-u1-l1-s1-c1.jpg`), illustrating a
drawing from the original textbook page. For many chunks — especially in
early grades — the image **is part of the question itself** (e.g. "is Sidi
behind the tree?" referring to a drawing). Importing the text alone silently
drops this visual content; the exercise may become meaningless or ambiguous
without it.

## Priority summary

**High — functional impact on the learning experience:**
- **Chunk `image`** — top priority: 663 images in the source file, each tied to a specific chunk; many exercises are meaningless without their image
- Per-option `is_correct` / `feedback` (currently flattened away)
- Lesson: `programme_ref`, `week`, `programme_weeks`, `book_exercises`

**Medium — curriculum alignment / categorization:**
- Unit: `term`, `competency_ref`, `main_skill_domain`

**Low — authoring/review metadata only, not needed post-publish:**
- `needs_image`, `image_note` (chunk level)
