from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Fallback to local sqlite to ensure execution runs perfectly locally
    DATABASE_URL: str = "sqlite:///./repaysignal.db"
    MODEL_CACHE_DIR: str = "../models_cache"

    class Config:
        env_file = ".env"

settings = Settings()
