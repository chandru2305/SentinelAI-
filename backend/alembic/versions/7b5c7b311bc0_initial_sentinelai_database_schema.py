"""Initial SentinelAI database schema

Revision ID: 7b5c7b311bc0
Revises: 
Create Date: 2026-08-13 18:38:15.420654

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7b5c7b311bc0'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if users table exists before creating
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    if "users" not in tables:
        op.create_table(
            "users",
            sa.Column("id", sa.String(length=36), primary_key=True),
            sa.Column("username", sa.String(length=50), nullable=False, unique=True),
            sa.Column("email", sa.String(length=255), nullable=False, unique=True),
            sa.Column("password_hash", sa.String(length=255), nullable=False),
            sa.Column("role", sa.String(length=20), nullable=False, server_default="analyst"),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        )

    if "threats" not in tables:
        op.create_table(
            "threats",
            sa.Column("id", sa.String(length=36), primary_key=True),
            sa.Column("detected_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("source", sa.String(length=255), nullable=True),
            sa.Column("category", sa.String(length=80), nullable=False),
            sa.Column("rule_name", sa.String(length=120), nullable=False, server_default="general"),
            sa.Column("severity", sa.String(length=20), nullable=False),
            sa.Column("risk_score", sa.Integer(), nullable=False),
            sa.Column("confidence", sa.Integer(), nullable=False),
            sa.Column("priority", sa.String(length=30), nullable=False),
            sa.Column("indicators", sa.JSON(), nullable=False),
            sa.Column("mitre", sa.JSON(), nullable=False),
            sa.Column("recommendation", sa.Text(), nullable=False),
            sa.Column("raw_payload", sa.JSON(), nullable=True),
            sa.Column("resolved", sa.Boolean(), nullable=False, server_default="0"),
            sa.Column("status", sa.String(length=30), nullable=False, server_default="detected"),
            sa.Column("processing_time", sa.Float(), nullable=False, server_default="0.0"),
        )


def downgrade() -> None:
    op.drop_table("threats")
    op.drop_table("users")
