import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager

load_dotenv(".env")
SQLALCHEMY_DATABASE_URL = os.environ["DATABASE_URL"]
DB_TIMEOUT = os.environ["DB_TIMEOUT"]
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={
                       'connect_timeout': DB_TIMEOUT})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# SessionLocal.configure(bind=engine)


@contextmanager
def get_session():
    """Provide a transactional scope around a series of operations."""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()
