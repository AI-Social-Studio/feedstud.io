from typing import Callable

import httpx

from app.application.ports import ContentGenerator
from app.application.prompts.platform_prompts import SYSTEM_PROMPT, build_generate_prompt
from app.application.prompts.refine_prompts import (
    REFINE_SYSTEM_PROMPT,
    build_refine_prompt,
)
from app.domain.entities import AiExecution, GeneratedPost, GeneratedPostResult
from app.domain.exceptions import ContentGenerationError, RefineError
from app.domain.value_objects import Platform, RefineAction
from app.infrastructure.ai.openrouter_types import (
    OpenRouterCompletionResponse,
    OpenRouterCompletionTrace,
    OpenRouterGenerationResponse,
    OpenRouterRequestMessage,
)
from app.infrastructure.ai.output import clamp_platform_text, parse_post_output


class OpenRouterContentGenerator(ContentGenerator):
    def __init__(
        self,
        api_key: str,
        model: str,
        max_tokens: int,
        temperature: float,
        site_url: str,
        app_name: str,
    ) -> None:
        if not api_key:
            raise ContentGenerationError(platform="*", reason="OPENROUTER_API_KEY is not configured")
        self._client = httpx.AsyncClient(
            base_url="https://openrouter.ai/api/v1",
            timeout=60,
            headers={
                "Authorization": f"Bearer {api_key}",
                "HTTP-Referer": site_url,
                "X-OpenRouter-Title": app_name,
            },
        )
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
        trace = await self._call(
            kind="generate",
            system=SYSTEM_PROMPT,
            user=user,
            platform=platform,
            action=None,
            on_error=lambda reason: ContentGenerationError(platform=platform.value, reason=reason),
        )
        text = parse_post_output(trace.completion.choices[0].message.content or "").text
        post = GeneratedPost(platform=platform, text=clamp_platform_text(platform, text.strip()))
        execution = self._build_execution(trace, kind="generate", platform=platform, action=None)
        execution.response_text = post.text
        return GeneratedPostResult(post=post, trace=execution)

    async def refine(
        self,
        platform: Platform,
        text: str,
        action: RefineAction,
    ) -> GeneratedPostResult:
        user = build_refine_prompt(platform, text, action)
        trace = await self._call(
            kind="refine",
            system=REFINE_SYSTEM_PROMPT,
            user=user,
            platform=platform,
            action=action,
            on_error=lambda reason: RefineError(
                platform=platform.value, action=action.value, reason=reason
            ),
        )
        parsed = parse_post_output(trace.completion.choices[0].message.content or "")
        post = GeneratedPost(platform=platform, text=clamp_platform_text(platform, parsed.text.strip()))
        execution = self._build_execution(trace, kind="refine", platform=platform, action=action)
        execution.response_text = post.text
        return GeneratedPostResult(post=post, trace=execution)

    async def _call(
        self,
        *,
        kind: str,
        system: str,
        user: str,
        platform: Platform,
        action: RefineAction | None,
        on_error: Callable[[str], Exception],
    ) -> OpenRouterCompletionTrace:
        messages = [
            OpenRouterRequestMessage(role="system", content=system),
            OpenRouterRequestMessage(role="user", content=user),
        ]
        payload = {
            "model": self._model,
            "max_tokens": self._max_tokens,
            "temperature": self._temperature,
            "response_format": {"type": "json_object"},
            "messages": [message.model_dump() for message in messages],
        }

        try:
            response = await self._client.post("/chat/completions", json=payload)
            if response.is_error:
                raise RuntimeError(f"OpenRouter {response.status_code}: {response.text[:500]}")
            raw_completion = response.json()
            completion = OpenRouterCompletionResponse.model_validate(raw_completion)
            content = completion.choices[0].message.content or ""
            parsed = parse_post_output(content)
            if not parsed.text.strip():
                raise ValueError("Model returned empty text")
        except Exception as exc:
            raise on_error(str(exc)) from exc

        generation = await self._fetch_generation_details(completion.id)
        return OpenRouterCompletionTrace(
            provider="openrouter",
            requested_model=self._model,
            system_prompt=system,
            user_prompt=user,
            messages=messages,
            completion=completion,
            generation=generation,
            raw_completion=raw_completion,
            raw_generation=generation.model_dump(mode="json") if generation else None,
        )

    async def _fetch_generation_details(
        self,
        generation_id: str,
    ) -> OpenRouterGenerationResponse | None:
        try:
            response = await self._client.get("/generation", params={"id": generation_id})
            if response.is_error:
                return None
            return OpenRouterGenerationResponse.model_validate(response.json())
        except Exception:
            return None

    def _build_execution(
        self,
        trace: OpenRouterCompletionTrace,
        *,
        kind: str,
        platform: Platform,
        action: RefineAction | None,
    ) -> AiExecution:
        choice = trace.completion.choices[0]
        usage = trace.completion.usage
        generation = trace.generation.data if trace.generation else None
        return AiExecution(
            provider=trace.provider,
            requested_model=trace.requested_model,
            kind=kind,
            status="success",
            system_prompt=trace.system_prompt,
            user_prompt=trace.user_prompt,
            messages_json=[message.model_dump(mode="json") for message in trace.messages],
            platform=platform.value,
            action=action.value if action else None,
            openrouter_generation_id=trace.completion.id,
            generation_request_id=generation.request_id if generation else None,
            generation_upstream_id=generation.upstream_id if generation else None,
            resolved_model=trace.completion.model,
            resolved_provider=trace.completion.provider,
            response_text=choice.message.content,
            response_reasoning=choice.message.reasoning,
            response_reasoning_details_json=(
                [detail.model_dump(mode="json") for detail in choice.message.reasoning_details]
                if choice.message.reasoning_details
                else None
            ),
            finish_reason=choice.finish_reason,
            native_finish_reason=choice.native_finish_reason,
            usage_prompt_tokens=usage.prompt_tokens if usage else None,
            usage_completion_tokens=usage.completion_tokens if usage else None,
            usage_total_tokens=usage.total_tokens if usage else None,
            usage_cost=usage.cost if usage else None,
            usage_is_byok=usage.is_byok if usage else None,
            usage_cached_tokens=(
                usage.prompt_tokens_details.cached_tokens
                if usage and usage.prompt_tokens_details
                else None
            ),
            usage_cache_write_tokens=(
                usage.prompt_tokens_details.cache_write_tokens
                if usage and usage.prompt_tokens_details
                else None
            ),
            usage_reasoning_tokens=(
                usage.completion_tokens_details.reasoning_tokens
                if usage and usage.completion_tokens_details
                else None
            ),
            usage_prompt_cost=(
                usage.cost_details.upstream_inference_prompt_cost
                if usage and usage.cost_details
                else None
            ),
            usage_completion_cost=(
                usage.cost_details.upstream_inference_completions_cost
                if usage and usage.cost_details
                else None
            ),
            usage_total_upstream_cost=(
                usage.cost_details.upstream_inference_cost if usage and usage.cost_details else None
            ),
            generation_latency_ms=generation.latency if generation else None,
            generation_time_ms=generation.generation_time if generation else None,
            generation_tokens_prompt=generation.tokens_prompt if generation else None,
            generation_tokens_completion=generation.tokens_completion if generation else None,
            generation_native_tokens_prompt=generation.native_tokens_prompt if generation else None,
            generation_native_tokens_completion=(
                generation.native_tokens_completion if generation else None
            ),
            generation_native_tokens_reasoning=(
                generation.native_tokens_reasoning if generation else None
            ),
            generation_native_tokens_cached=generation.native_tokens_cached if generation else None,
            generation_total_cost=generation.total_cost if generation else None,
            generation_provider_name=generation.provider_name if generation else None,
            generation_origin=generation.origin if generation else None,
            generation_data_region=generation.data_region if generation else None,
            generation_provider_responses_json=(
                [response.model_dump(mode="json") for response in generation.provider_responses]
                if generation and generation.provider_responses
                else None
            ),
            raw_completion_response_json=trace.raw_completion,
            raw_generation_response_json=trace.raw_generation,
        )
