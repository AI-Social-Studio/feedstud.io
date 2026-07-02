import json
from collections.abc import Awaitable, Callable
from uuid import UUID

import aio_pika
from aio_pika.abc import AbstractIncomingMessage

from app.application.ports import GenerateJobQueue


class RabbitMqGenerateJobQueue(GenerateJobQueue):
    def __init__(self, url: str, queue_name: str) -> None:
        self._url = url
        self._queue_name = queue_name

    async def publish(self, job_id: UUID) -> None:
        connection = await aio_pika.connect_robust(self._url)
        async with connection:
            channel = await connection.channel()
            await channel.declare_queue(self._queue_name, durable=True)
            await channel.default_exchange.publish(
                aio_pika.Message(
                    body=json.dumps({"job_id": str(job_id)}).encode("utf-8"),
                    delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
                    content_type="application/json",
                ),
                routing_key=self._queue_name,
            )

    async def consume(
        self,
        handler: Callable[[UUID], Awaitable[None]],
        *,
        prefetch_count: int,
    ) -> None:
        connection = await aio_pika.connect_robust(self._url)
        channel = await connection.channel()
        await channel.set_qos(prefetch_count=prefetch_count)
        queue = await channel.declare_queue(self._queue_name, durable=True)

        async with queue.iterator() as iterator:
            async for message in iterator:
                await self._handle_message(message, handler)

    async def _handle_message(
        self,
        message: AbstractIncomingMessage,
        handler: Callable[[UUID], Awaitable[None]],
    ) -> None:
        async with message.process(requeue=True):
            payload = json.loads(message.body.decode("utf-8"))
            await handler(UUID(payload["job_id"]))
