import asyncio
import logging
from datetime import datetime, timezone

from app.application.use_cases.publications import ReleaseScheduledPublicationsUseCase
from app.core.config import get_settings
from app.infrastructure.db.repositories import SqlAlchemyPublicationRepository
from app.infrastructure.messaging.rabbitmq import RabbitMqPublicationJobQueue
from app.interface.dependencies import _database

logger = logging.getLogger(__name__)


async def main() -> None:
    settings = get_settings()
    queue = RabbitMqPublicationJobQueue(
        settings.rabbitmq_url,
        settings.rabbitmq_publication_queue,
    )

    while True:
        try:
            released_count = await _release_due_publications(
                queue=queue,
                limit=settings.publication_scheduler_batch_size,
            )
            if released_count > 0:
                logger.info(
                    "Scheduled publication release loop completed",
                    extra={"count": released_count},
                )
        except Exception:
            logger.exception("Scheduled publication release loop failed")

        await asyncio.sleep(settings.publication_scheduler_poll_seconds)


async def _release_due_publications(*, queue: RabbitMqPublicationJobQueue, limit: int) -> int:
    async for session in _database().session():
        use_case = ReleaseScheduledPublicationsUseCase(
            publications=SqlAlchemyPublicationRepository(session),
            queue=queue,
        )
        return await use_case.execute(now=datetime.now(timezone.utc), limit=limit)
    return 0


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
