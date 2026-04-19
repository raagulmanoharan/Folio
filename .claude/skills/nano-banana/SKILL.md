---
name: nano-banana
description: Generate images using Google's Gemini 2.5 Flash Image ("nano-banana") model. Use when the user asks to create, generate, or edit an image. Requires GEMINI_API_KEY in the environment.
---

# nano-banana

Generate or edit images with Google's `gemini-2.5-flash-image` model (codename "nano-banana") via the Gemini API.

## Prerequisites

- `GEMINI_API_KEY` set in the environment (get one at https://aistudio.google.com/apikey)
- `curl` and `jq` available, OR Python 3 with the `google-genai` package (`pip install google-genai`)

## How to invoke

When the user asks for an image:

1. Turn their request into a concrete prompt (subject, style, composition, lighting).
2. Decide the output path — default to `./generated/<slug>-<timestamp>.png`.
3. Run one of the scripts below via the Bash tool.
4. Report the saved file path back to the user.

## Script: curl + jq

```bash
PROMPT="$1"
OUT="$2"
mkdir -p "$(dirname "$OUT")"
curl -s -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg p "$PROMPT" '{contents:[{parts:[{text:$p}]}]}')" \
| jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data' \
| base64 -d > "$OUT"
```

## Script: Python (supports image-to-image edits)

```python
import sys, pathlib, base64
from google import genai

client = genai.Client()
prompt = sys.argv[1]
out = pathlib.Path(sys.argv[2])
inputs = [prompt]
for ref in sys.argv[3:]:
    inputs.append(genai.types.Part.from_bytes(
        data=pathlib.Path(ref).read_bytes(),
        mime_type="image/png",
    ))
resp = client.models.generate_content(
    model="gemini-2.5-flash-image",
    contents=inputs,
)
for part in resp.candidates[0].content.parts:
    if part.inline_data:
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(part.inline_data.data)
        print(out)
        break
```

## Notes

- Output is PNG with a SynthID watermark.
- For edits, pass one or more reference image paths as extra arguments.
- Keep prompts descriptive — nano-banana follows detailed instructions well.
- If `GEMINI_API_KEY` is missing, stop and ask the user to set it rather than retrying.
