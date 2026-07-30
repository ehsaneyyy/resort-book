"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-07-30
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import sqlmodel

revision: str = '0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'rooms',
        sa.Column('id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('type', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('weekend_price', sa.Float(), nullable=True),
        sa.Column('capacity', sa.Integer(), nullable=False),
        sa.Column('beds', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('size', sa.Float(), nullable=True),
        sa.Column('floor', sa.Integer(), nullable=True),
        sa.Column('amenities', sa.JSON(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table(
        'guests',
        sa.Column('id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('email', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('phone', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('address', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('city', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('id_type', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('id_number', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('vip', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('notes', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('total_bookings', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('total_spent', sa.Float(), nullable=False, server_default=sa.text('0')),
        sa.Column('last_stay', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table(
        'bookings',
        sa.Column('id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('guest_id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('room_id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('check_in', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('check_out', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('nights', sa.Integer(), nullable=False),
        sa.Column('adults', sa.Integer(), nullable=False),
        sa.Column('children', sa.Integer(), nullable=True),
        sa.Column('total', sa.Float(), nullable=False),
        sa.Column('status', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('payment_status', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('payment_method', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('source', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('special_requests', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table(
        'seasonalrules',
        sa.Column('id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('start_date', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('end_date', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('adjustment', sa.Float(), nullable=False),
        sa.Column('type', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table(
        'resorts',
        sa.Column('id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('currency', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('phone', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('whatsapp_phone', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('email', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('address', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('check_in_time', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('check_out_time', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('tax_rate', sa.Float(), nullable=True),
        sa.Column('total_rooms', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade() -> None:
    op.drop_table('rooms')
    op.drop_table('guests')
    op.drop_table('bookings')
    op.drop_table('seasonalrules')
    op.drop_table('resorts')
