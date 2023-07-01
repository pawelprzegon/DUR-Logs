import os
import uvicorn
from fastapi_sqlalchemy import DBSessionMiddleware
from sqlalchemy import inspect
from mutoh_api.routers import mutoh_api
from impala_api.routers import impala_api
from xeikon_api.routers import xeikon_api
from latex_api.routers import latex_api
from fastapi import FastAPI
from db import engine
from mutoh_api.models_Mutoh import Base as BaseMutoh
from impala_api.models_Impala import Base as BaseImpala
from xeikon_api.models_Xeikon import Base as BaseXeikon
from latex_api.models_Latex import Base as BaseLatex
from fastapi.middleware.cors import CORSMiddleware
from descriptions import description, tags_metadata


# TODO  add API key - https://joshdimella.com/blog/adding-api-key-auth-to-fast-api

def include_routers(app):
    app.include_router(mutoh_api)
    app.include_router(impala_api)
    app.include_router(xeikon_api)
    app.include_router(latex_api)


def include_middlewares(app):

    app.add_middleware(DBSessionMiddleware, db_url=os.environ["DATABASE_URL"])
    CORS_URL = os.environ["CORS_URL"]
    origins = [CORS_URL]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["POST", "GET", "PUT", "DELETE"],
        allow_headers=["*"],
    )


def check_tables_exist():
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    # Check if tables exist
    return len(tables) > 0


def create_tables_if_not_exists():
    if not check_tables_exist():
        create_tables()


def create_tables():
    BaseMutoh.metadata.create_all(bind=engine)
    BaseImpala.metadata.create_all(bind=engine)
    BaseXeikon.metadata.create_all(bind=engine)
    BaseLatex.metadata.create_all(bind=engine)


def start_application():
    app = FastAPI(
        openapi_tags=tags_metadata,
        title="Artgeist USAGE",
        description=description,)
    include_routers(app)
    include_middlewares(app)
    create_tables_if_not_exists()
    return app


app = start_application()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
