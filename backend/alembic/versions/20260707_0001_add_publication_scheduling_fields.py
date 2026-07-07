"""add publication scheduling fields

Revision ID: 20260707_0001
Revises:
Create Date: 2026-07-07 00:00:01
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260707_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("publications", sa.Column("scheduled_for", sa.DateTime(timezone=True), nullable=True))
    op.add_column("publications", sa.Column("queued_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column(
        "publications",
        sa.Column("schedule_released_at", sa.DateTime(timezone=True), nullable=True),
    )
    if op.get_context().dialect.name == "postgresql":
        with op.get_context().autocommit_block():
            op.create_index(
                "ix_publications_status_scheduled_for",
                "publications",
                ["status", "scheduled_for"],
                unique=False,
                postgresql_concurrently=True,
            )
        return
    op.create_index(
        "ix_publications_status_scheduled_for",
        "publications",
        ["status", "scheduled_for"],
        unique=False,
    )


def downgrade() -> None:
    if op.get_context().dialect.name == "postgresql":
        with op.get_context().autocommit_block():
            op.drop_index(
                "ix_publications_status_scheduled_for",
                table_name="publications",
                postgresql_concurrently=True,
            )
    else:
        op.drop_index("ix_publications_status_scheduled_for", table_name="publications")
    op.drop_column("publications", "schedule_released_at")
    op.drop_column("publications", "queued_at")
    op.drop_column("publications", "scheduled_for")
