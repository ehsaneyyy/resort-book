from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = 'sqlite+aiosqlite:///./resort.db'
    cors_origins: str = 'http://localhost:5173'
    app_name: str = 'Resort Admin API'
    environment: str = 'development'
    jwt_secret: str = ''
    jwt_expiry_minutes: int = 480
    admin_email: str = ''
    admin_password: str = ''
    rate_limit_writes: int = 30
    rate_limit_window: int = 60
    rate_limit_auth_failures: int = 10
    rate_limit_global_auth_failures: int = 50
    max_body_bytes: int = 1_000_000
    seed_enabled: bool = False

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(',') if o.strip()]

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith('sqlite')

    @property
    def is_production(self) -> bool:
        return self.environment == 'production'

    model_config = {'env_file': '.env', 'env_file_encoding': 'utf-8'}


settings = Settings()
