from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    # Nome e versão da aplicação
    PROJECT_NAME: str = "TicketOn"
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

    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin]
        
    model_config = SettingsConfigDict(env_file=[".env", "../.env"], extra="ignore")


settings = Settings()