from anthropic import AsyncAnthropic

from app.application.ports import ContentGenerator
from app.application.prompts.platform_prompts import SYSTEM_PROMPT, build_generate_prompt
from app.application.prompts.refine_prompts import (
    REFINE_SYSTEM_PROMPT,
    build_refine_prompt,
)
from app.domain.entities import AiExecution, GeneratedPost, GeneratedPostResult
from app.domain.exceptions import ContentGenerationError, RefineError
from app.domain.value_objects import Platform, RefineAction
from app.infrastructure.ai.output import PostOutput, clamp_platform_text


class AnthropicContentGenerator(ContentGenerator):
    def __init__(
        self,
        api_key: str,
        model: str,
        max_tokens: int,
        temperature: float,
    ) -> None:
        if not api_key:
            raise ContentGenerationError(platform="*", reason="ANTHROPIC_API_KEY is not configured")
        self._client = AsyncAnthropic(api_key=api_key)
        self._model = model
        self._max_tokens = max_tokens
        self._temperature = temperature

    async def generate(
        self,
        platform: Platform,
        raw_text: str,
        image_urls: list[str],
    ) -> GeneratedPostResult:
        user = build_generate_prompt(raw_text, image_urls, platform)
        trace, text = await self._call(
            kind="generate",
            platform=platform.value,
            system=SYSTEM_PROMPT,
            user=user,
            on_error=lambda reason, trace: ContentGenerationError(
                platform=platform.value,
                reason=reason,
                trace=trace,
            ),
        )
        post = GeneratedPost(platform=platform, text=clamp_platform_text(platform, text))
        trace.response_text = post.text
        return GeneratedPostResult(post=post, trace=trace)

    async def refine(
        self,
        platform: Platform,
        text: str,
        action: RefineAction,
    ) -> GeneratedPostResult:
        user = build_refine_prompt(platform, text, action)
        trace, result = await self._call(
            kind="refine",
            platform=platform.value,
            action=action.value,
            system=REFINE_SYSTEM_PROMPT,
            user=user,
            on_error=lambda reason, trace: RefineError(
                platform=platform.value,
                action=action.value,
                reason=reason,
                trace=trace,
            ),
        )
        post = GeneratedPost(platform=platform, text=clamp_platform_text(platform, result))
        trace.response_text = post.text
        return GeneratedPostResult(post=post, trace=trace)

    async def _call(
        self,
        *,
        kind: str,
        platform: str,
        system: str,
        user: str,
        on_error,
        action: str | None = None,
    ) -> tuple[AiExecution, str]:
        trace = self._build_trace(
            kind=kind,
            platform=platform,
            system=system,
            user=user,
            action=action,
        )
        try:
            response = await self._client.messages.parse(
                model=self._model,
                max_tokens=self._max_tokens,
                temperature=self._temperature,
                system=system,
                messages=[{"role": "user", "content": user}],
                output_format=PostOutput,
            )
        except Exception as exc:
            trace.error_message = str(exc)
            raise on_error(str(exc), trace) from exc

        trace.usage_prompt_tokens = getattr(response.usage, "input_tokens", None)
        trace.usage_completion_tokens = getattr(response.usage, "output_tokens", None)
        if trace.usage_prompt_tokens is not None or trace.usage_completion_tokens is not None:
            trace.usage_total_tokens = (trace.usage_prompt_tokens or 0) + (
                trace.usage_completion_tokens or 0
            )
        trace.usage_cached_tokens = getattr(response.usage, "cache_read_input_tokens", None)
        trace.usage_cache_write_tokens = getattr(
            response.usage,
            "cache_creation_input_tokens",
            None,
        )

        parsed = response.parsed_output
        if parsed is None or not parsed.text.strip():
            trace.status = "error"
            trace.error_message = "Model returned empty text"
            raise on_error("Model returned empty text", trace)
        return trace, parsed.text.strip()

    def _build_trace(
        self,
        *,
        kind: str,
        platform: str,
        system: str,
        user: str,
        action: str | None,
    ) -> AiExecution:
        return AiExecution(
            provider="anthropic",
            requested_model=self._model,
            kind=kind,
            status="success",
            system_prompt=system,
            user_prompt=user,
            messages_json=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            platform=platform,
            action=action,
            resolved_model=self._model,
            resolved_provider="anthropic",
        )
