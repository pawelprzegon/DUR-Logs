from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import List, Optional


class Mutoh(BaseModel):
    unit: str
    sn: str
    suma_m2: int
    suma_ml: int
    date: datetime
    target_reached: int

    class Config:
        orm_mode = True


class Mutoh_details(BaseModel):
    unit: str
    printed: int
    ink: int
    date: date

    class Config:
        orm_mode = True


class MutohSettings(BaseModel):
    target: int

    class Config:
        orm_mode = True
