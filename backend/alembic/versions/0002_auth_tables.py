"""auth, audit, and rate-limit tables

Revision ID: 0002
Revises: 0001
Create Date: 2026-08-06 09:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


revision: str = '0002'
down_revision: Union[str, Sequence[str], None] = '0001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sqlmodel.sql.sqltypes.AutoString(length=200), nullable=False),
    sa.Column('password_hash', sqlmodel.sql.sqltypes.AutoString(length=300), nullable=False),
    sa.Column('must_change_password', sa.Boolean(), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('password_changed_at', sa.DateTime(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_table('security_events',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('event_type', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
    sa.Column('ip', sqlmodel.sql.sqltypes.AutoString(length=45), nullable=False),
    sa.Column('detail', sqlmodel.sql.sqltypes.AutoString(length=500), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_security_events_created_at', 'security_events', ['created_at'], unique=False)
    op.create_table('rate_limits',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('bucket', sqlmodel.sql.sqltypes.AutoString(length=160), nullable=False),
    sa.Column('window_start', sa.Integer(), nullable=False),
    sa.Column('hits', sa.Integer(), nullable=False),
    sa.Column('limit', sa.Integer(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('bucket', 'window_start', name='uq_rate_limit_bucket_window')
    )
    op.create_index('ix_rate_limits_window_start', 'rate_limits', ['window_start'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_rate_limits_window_start', table_name='rate_limits')
    op.drop_table('rate_limits')
    op.drop_index('ix_security_events_created_at', table_name='security_events')
    op.drop_table('security_events')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
