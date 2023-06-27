from pydantic import BaseModel
from datetime import date


class Latex(BaseModel):
    unit: str
    suma_m2: int
    suma_ml: int
    date: date

    class Config:
        orm_mode = True


class Latex_details(BaseModel):
    unit: str
    printed: int
    ink: int
    date: date

    class Config:
        orm_mode = True
