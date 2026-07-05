import asyncio
import logging
from uuid import UUID

from app.application.use_cases.generate_jobs import ProcessGenerateJobUseCase
from app.application.use_cases.generate_posts import GeneratePostsUseCase
from app.core.config import get_settings
from app.infrastructure.db.models import Base
from app.infrastructure.db.repositories import (
    SqlAlchemyAiExecutionRepository,
    SqlAlchemyFileRepository,
    SqlAlchemyGenerateJobRepository,
    SqlAlchemyUserMemoryRepository,
)
from app.infrastructure.messaging.rabbitmq import RabbitMqGenerateJobQueue
from app.interface.dependencies import _content_generator, _database, _storage

logger = logging.getLogger(__name__)


async def main() -> None:
    settings = get_settings()
    db = _database()
    await db.create_all(Base.metadata)
    await _storage().ensure_bucket()

    queue = RabbitMqGenerateJobQueue(settings.rabbitmq_url, settings.rabbitmq_generate_queue)
    await queue.consume(_process_job, prefetch_count=settings.rabbitmq_prefetch_count)


async def _process_job(job_id: UUID) -> None:
    async for session in _database().session():
        jobs = SqlAlchemyGenerateJobRepository(session)
        generate = GeneratePostsUseCase(
            generator=_content_generator(),
            files=SqlAlchemyFileRepository(session),
            storage=_storage(),
            executions=SqlAlchemyAiExecutionRepository(session),
        )
        memory = SqlAlchemyUserMemoryRepository(session)
        try:
            await ProcessGenerateJobUseCase(
                jobs=jobs,
                generator=generate,
                memory=memory,
            ).execute(job_id)
        except Exception:
            logger.exception("Failed to process generate job", extra={"job_id": str(job_id)})
            raise
        return


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
