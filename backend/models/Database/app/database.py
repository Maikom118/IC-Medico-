import os
from urllib.parse import quote_plus
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load .env file with explicit UTF-8 encoding
load_dotenv(encoding='utf-8')

# URL-encode credentials to handle special characters and encoding issues
db_user = quote_plus(os.getenv('DB_USER', ''))
db_password = quote_plus(os.getenv('DB_PASSWORD', ''))
db_host = os.getenv('DB_HOST', 'localhost')
db_port = os.getenv('DB_PORT', '5432')
db_name = quote_plus(os.getenv('DB_NAME', ''))

DATABASE_URL = (
    f"postgresql+psycopg2://{db_user}:{db_password}@"
    f"{db_host}:{db_port}/{db_name}"
)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()
