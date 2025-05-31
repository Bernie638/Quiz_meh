# Nuclear Exam Data

This directory contains the nuclear engineering question data extracted from the official exam bank.

## Files

- `questions.json` - Main question database (1,319 questions)
- `topics.json` - Topic definitions and metadata
- `images/` - Question images and diagrams

## Data Format

### Questions Structure
Each question follows this format:
```json
{
  "id": 1000,
  "topic": "Valves",
  "page": 1,
  "questionStem": {
    "text": "Question text with formatting preserved",
    "formatting": {
      "superscript": [...],
      "subscript": [...],
      "special_chars": [...]
    },
    "multiline": true
  },
  "givenInformation": {
    "hasTable": true,
    "columns": ["Parameter", "Value"],
    "rows": [["Pressure", "1,200 psia"]],
    "rawText": []
  },
  "answerChoices": {
    "choices": [
      {
        "letter": "A",
        "text": "Answer choice text",
        "formatting": {...}
      }
    ]
  },
  "correctAnswer": "A",
  "images": [
    {
      "filename": "q1000_img0.png",
      "position": "inline"
    }
  ]
}
```

### Topics Structure
```json
{
  "id": "valves",
  "name": "Valves",
  "description": "Safety valves, control valves, and valve operations",
  "questionCount": 102,
  "category": "mechanical"
}
```

## Data Sources

The question data is extracted from the official nuclear engineering exam bank PDF using a custom extraction program that preserves:

- ✅ Multi-line question stems and answers
- ✅ Superscript and subscript formatting
- ✅ Special characters (°, ², ³, etc.)
- ✅ Table structures for given information
- ✅ Image references and positioning
- ✅ Answer choice formatting

## Usage

This data is loaded into the PostgreSQL database during the seeding process and served through the API endpoints.

## Data Integrity

All questions have been validated for:
- Complete answer choices (A, B, C, D)
- Correct answer designation
- Proper formatting preservation
- Image file availability