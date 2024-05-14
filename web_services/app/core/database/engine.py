# Third Party
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# First Party
from app.core.settings import settings as s

DATABASE_URL = f"postgresql://{s.POSTGRES_USER}:{s.POSTGRES_PASSWORD}@{s.POSTGRES_HOST}/{s.APP_CODE_NAME}"

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autoflush=False, autocommit=False, bind=engine)
