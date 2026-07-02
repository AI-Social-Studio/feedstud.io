import json

from pydantic import BaseModel

from app.domain.value_objects import Platform


class PostOutput(BaseModel):
    text: str


def parse_post_output(raw: str) -> PostOutput:
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:].strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("Model returned invalid JSON output")
    try:
        payload = json.loads(cleaned[start : end + 1])
    except json.JSONDecodeError as exc:
        raise ValueError("Model returned invalid JSON output") from exc
    return PostOutput.model_validate(payload)


def clamp_platform_text(platform: Platform, text: str) -> str:
    if len(text) <= platform.char_limit:
        return text
    return text[: platform.char_limit].rstrip()
