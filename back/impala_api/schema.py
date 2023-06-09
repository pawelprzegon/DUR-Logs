from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import List, Optional


# Impala

class Impala_details(BaseModel):
    unit: str
    printed: float
    ink: float
    date: date
    class Config:
        orm_mode = True


class ImpalaSettings(BaseModel):
    filters: int
    bearings: int
    class Config:
        orm_mode = True
        
class ImpalaFiltersRepl(BaseModel):
    unit: str
    date: date
    color: str
    class Config:
        orm_mode = True
    
class ImpalaBearingsRepl(BaseModel):
    unit: str
    date: date
    class Config:
        orm_mode = True
        

class Impala(BaseModel):
    unit: str
    suma_m2: int
    suma_ml: int
    date: date
    filters: List[ImpalaFiltersRepl] = []
    bearings: List[ImpalaBearingsRepl] = []
    class Config:
        orm_mode = True
        

