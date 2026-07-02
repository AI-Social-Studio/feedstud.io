import asyncio
import json
import logging
from collections.abc import Awaitable, Callable
from uuid import UUID

import aio_pika
from aio_pika.abc import AbstractIncomingMessage, AbstractRobustConnection

from app.application.ports import GenerateJobQueue

logger = logging.getLogger(__name__)


class RabbitMqGenerateJobQueue(GenerateJobQueue):
    def __init__(self, url: str, queue_name: str) -> None:
        self._url = url
        self._queue_name = queue_name
        self._connection: AbstractRobustConnection | None = None
        self._connection_lock = asyncio.Lock()

    async def publish(self, job_id: UUID) -> None:
        connection = await self._get_connection()
        channel = await connection.channel()
        try:
            await channel.declare_queue(self._queue_name, durable=True)
            await channel.default_exchange.publish(
                aio_pika.Message(
                    body=json.dumps({"job_id": str(job_id)}).encode("utf-8"),
                    delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
                    content_type="application/json",
                ),
                routing_key=self._queue_name,
            )
        finally:
            await channel.close()

    async def consume(
        self,
        handler: Callable[[UUID], Awaitable[None]],
        *,
        prefetch_count: int,
    ) -> None:
        connection = await self._get_connection()
        channel = await connection.channel()
        await channel.set_qos(prefetch_count=prefetch_count)
        queue = await channel.declare_queue(self._queue_name, durable=True)

        async with queue.iterator() as iterator:
            async for message in iterator:
                try:
                    await self._handle_message(message, handler)
                except Exception:
                    logger.exception("RabbitMQ message handling failed")

    async def _handle_message(
        self,
        message: AbstractIncomingMessage,
        handler: Callable[[UUID], Awaitable[None]],
    ) -> None:
        async with message.process(requeue=True):
            payload = json.loads(message.body.decode("utf-8"))
            await handler(UUID(payload["job_id"]))

    async def _get_connection(self) -> AbstractRobustConnection:
        async with self._connection_lock:
            if self._connection is None or self._connection.is_closed:
                self._connection = await aio_pika.connect_robust(self._url)
            return self._connection
