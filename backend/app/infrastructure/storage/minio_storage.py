import asyncio
from datetime import timedelta
from typing import BinaryIO
from urllib.parse import urlparse

from minio import Minio
from minio.error import S3Error

from app.application.ports import ObjectStorage


class MinioObjectStorage(ObjectStorage):
    def __init__(
        self,
        endpoint: str,
        access_key: str,
        secret_key: str,
        bucket: str,
        secure: bool,
        public_endpoint: str = "",
    ) -> None:
        self._client = Minio(
            endpoint=endpoint,
            access_key=access_key,
            secret_key=secret_key,
            secure=secure,
        )

        if public_endpoint:
            parsed = urlparse(public_endpoint)
            public_host = parsed.netloc or parsed.path
            public_secure = parsed.scheme == "https"
            self._presign_client = Minio(
                endpoint=public_host,
                access_key=access_key,
                secret_key=secret_key,
                secure=public_secure,
                region="us-east-1",
            )
        else:
            self._presign_client = self._client

        self._bucket = bucket

    async def ensure_bucket(self) -> None:
        await asyncio.to_thread(self._ensure_bucket_sync)

    def _ensure_bucket_sync(self) -> None:
        if not self._client.bucket_exists(self._bucket):
            self._client.make_bucket(self._bucket)

    async def put(self, key: str, data: BinaryIO, size: int, content_type: str) -> None:
        await asyncio.to_thread(
            self._client.put_object,
            self._bucket,
            key,
            data,
            size,
            content_type,
        )

    async def presigned_get_url(self, key: str, expires_seconds: int = 3600) -> str:
        return await asyncio.to_thread(
            self._presign_client.presigned_get_object,
            self._bucket,
            key,
            timedelta(seconds=expires_seconds),
        )

    async def get(self, key: str) -> bytes:
        return await asyncio.to_thread(self._get_sync, key)

    def _get_sync(self, key: str) -> bytes:
        response = self._client.get_object(self._bucket, key)
        try:
            return response.read()
        finally:
            response.close()
            response.release_conn()

    async def delete(self, key: str) -> None:
        try:
            await asyncio.to_thread(self._client.remove_object, self._bucket, key)
        except S3Error:
            pass
