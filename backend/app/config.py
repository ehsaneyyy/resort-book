from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = 'postgresql+asyncpg://localhost:5432/resort'
    cors_origins: str = 'http://localhost:5173'
    app_name: str = 'Resort Admin API'

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(',') if o.strip()]

    model_config = {'env_file': '.env', 'env_file_encoding': 'utf-8'}


settings = Settings()
