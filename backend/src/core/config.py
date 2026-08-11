from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    # Nome e versão da aplicação
    PROJECT_NAME: str = "Plataforma de Eventos e Ingressos"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Banco de Dados
    DATABASE_URL: str

    # Segurança (JWT)
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # API Ticketmaster
    TICKETMASTER_API_KEY: str = ""
    TICKETMASTER_BASE_URL: str = "https://app.ticketmaster.com/discovery/v2"

    # CORS (Origens permitidas para chamar a API)
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origins(self) -> List[str]:
        """Converte a string separada por vírgula em uma lista para o FastAPI"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin]
    # Carrega automaticamente as variáveis do arquivo .env
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()