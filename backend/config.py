from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://user:password@localhost:5432/feedback_evaluator"

    # OpenAI
    openai_api_key: str = ""

    # Blockchain
    sepolia_rpc_url: str = "https://rpc.sepolia.org"
    backend_private_key: str = ""
    escrow_contract_address: str = ""
    usdc_contract_address: str = ""

    # App
    cors_origins: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
