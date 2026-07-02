from typing import Any

from pydantic import BaseModel, Field


class OpenRouterReasoningDetail(BaseModel):
    type: str
    text: str | None = None
    format: str | None = None
    index: int | None = None


class OpenRouterMessage(BaseModel):
    role: str
    content: str | None = None
    refusal: str | None = None
    reasoning: str | None = None
    reasoning_details: list[OpenRouterReasoningDetail] | None = None


class OpenRouterChoice(BaseModel):
    index: int
    finish_reason: str | None = None
    native_finish_reason: str | None = None
    message: OpenRouterMessage


class OpenRouterPromptTokenDetails(BaseModel):
    cached_tokens: int | None = None
    cache_write_tokens: int | None = None
    audio_tokens: int | None = None
    video_tokens: int | None = None


class OpenRouterCompletionTokenDetails(BaseModel):
    reasoning_tokens: int | None = None
    image_tokens: int | None = None
    audio_tokens: int | None = None


class OpenRouterCostDetails(BaseModel):
    upstream_inference_cost: float | None = None
    upstream_inference_prompt_cost: float | None = None
    upstream_inference_completions_cost: float | None = None


class OpenRouterUsage(BaseModel):
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    total_tokens: int | None = None
    cost: float | None = None
    is_byok: bool | None = None
    prompt_tokens_details: OpenRouterPromptTokenDetails | None = None
    completion_tokens_details: OpenRouterCompletionTokenDetails | None = None
    cost_details: OpenRouterCostDetails | None = None


class OpenRouterCompletionResponse(BaseModel):
    id: str
    object: str
    created: int
    model: str
    provider: str | None = None
    system_fingerprint: str | None = None
    service_tier: str | None = None
    choices: list[OpenRouterChoice]
    usage: OpenRouterUsage | None = None


class OpenRouterProviderResponse(BaseModel):
    endpoint_id: str | None = None
    id: str | None = None
    is_byok: bool | None = None
    latency: int | None = None
    model_permaslug: str | None = None
    provider_name: str | None = None
    status: int | None = None


class OpenRouterGenerationData(BaseModel):
    created_at: str | None = None
    model: str | None = None
    streamed: bool | None = None
    cancelled: bool | None = None
    latency: int | None = None
    moderation_latency: int | None = None
    generation_time: int | None = None
    tokens_prompt: int | None = None
    tokens_completion: int | None = None
    native_tokens_prompt: int | None = None
    native_tokens_completion: int | None = None
    native_tokens_completion_images: int | None = None
    native_tokens_reasoning: int | None = None
    native_tokens_cached: int | None = None
    origin: str | None = None
    is_byok: bool | None = None
    finish_reason: str | None = None
    native_finish_reason: str | None = None
    usage: float | None = None
    request_id: str | None = None
    api_type: str | None = None
    id: str | None = None
    upstream_id: str | None = None
    total_cost: float | None = None
    upstream_inference_cost: float | None = None
    provider_name: str | None = None
    provider_responses: list[OpenRouterProviderResponse] | None = None
    data_region: str | None = None


class OpenRouterGenerationResponse(BaseModel):
    data: OpenRouterGenerationData


class OpenRouterRequestMessage(BaseModel):
    role: str
    content: str


class OpenRouterCompletionTrace(BaseModel):
    provider: str
    requested_model: str
    system_prompt: str
    user_prompt: str
    messages: list[OpenRouterRequestMessage]
    completion: OpenRouterCompletionResponse
    generation: OpenRouterGenerationResponse | None = None
    raw_completion: dict[str, Any] = Field(default_factory=dict)
    raw_generation: dict[str, Any] | None = None
