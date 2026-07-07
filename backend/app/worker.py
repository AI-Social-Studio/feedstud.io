import asyncio
import logging
from uuid import UUID

from app.application.use_cases.generate_jobs import ProcessGenerateJobUseCase
from app.application.use_cases.generate_posts import GeneratePostsUseCase
from app.application.use_cases.publications import ProcessPublicationJobUseCase
from app.core.config import get_settings
from app.infrastructure.db.models import Base
from app.infrastructure.db.repositories import (
    SqlAlchemyAiExecutionRepository,
    SqlAlchemyFileRepository,
    SqlAlchemyGenerateJobRepository,
    SqlAlchemyPublicationRepository,
    SqlAlchemySocialConnectionRepository,
    SqlAlchemyUserMemoryRepository,
)
from app.infrastructure.messaging.rabbitmq import RabbitMqGenerateJobQueue, RabbitMqPublicationJobQueue
from app.interface.dependencies import (
    _content_generator,
    _database,
    _linkedin_asset_preparer,
    _linkedin_publisher,
    _secret_cipher,
    _storage,
)

logger = logging.getLogger(__name__)


async def main() -> None:
    settings = get_settings()
    db = _database()
    await db.create_all(Base.metadata)
    await _storage().ensure_bucket()

    generate_queue = RabbitMqGenerateJobQueue(settings.rabbitmq_url, settings.rabbitmq_generate_queue)
    publication_queue = RabbitMqPublicationJobQueue(
        settings.rabbitmq_url,
        settings.rabbitmq_publication_queue,
    )
    await asyncio.gather(
        generate_queue.consume(_process_generate_job, prefetch_count=settings.rabbitmq_prefetch_count),
        publication_queue.consume(
            _process_publication_job,
            prefetch_count=settings.rabbitmq_prefetch_count,
        ),
    )


async def _process_generate_job(job_id: UUID) -> None:
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
            await ProcessGenerateJobUseCase(jobs=jobs, generator=generate, memory=memory).execute(job_id)
        except Exception:
            logger.exception("Failed to process generate job", extra={"job_id": str(job_id)})
            raise
        return


async def _process_publication_job(publication_id: UUID) -> None:
    async for session in _database().session():
        publications = SqlAlchemyPublicationRepository(session)
        files = SqlAlchemyFileRepository(session)
        connections = SqlAlchemySocialConnectionRepository(session)
        try:
            await ProcessPublicationJobUseCase(
                publications=publications,
                files=files,
                storage=_storage(),
                connections=connections,
                cipher=_secret_cipher(),
                asset_preparer=_linkedin_asset_preparer(),
                publisher=_linkedin_publisher(),
            ).execute(publication_id)
        except Exception:
            logger.exception(
                "Failed to process publication job",
                extra={"publication_id": str(publication_id)},
            )
            raise
        return


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
