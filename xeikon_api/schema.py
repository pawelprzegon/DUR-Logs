from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import List, Optional



#Xeikon
class DVLRepl(BaseModel):
    current: int
    replaced: int
    
class DVL(BaseModel):
    unit: str
    Cyan: DVLRepl
    Magenta: DVLRepl
    Yellow: DVLRepl
    Black: DVLRepl
    White: DVLRepl
    
    
    
class TonerDetails(BaseModel):
    unit: str
    Cyan: int
    Magenta: int
    Yellow: int
    Black: int
    White: int
    date: date
    class Config:
        orm_mode = True
        
class Toner(BaseModel):
    unit: str
    Cyan: int
    Magenta: int
    Yellow: int
    Black: int
    White: int
    _date: date
    class Config:
        orm_mode = True

class ClicksDetails(BaseModel):
    unit: str
    color: int
    bw: int
    date: date
    class Config:
        orm_mode = True
        
class Clicks(BaseModel):
    unit: str
    color: int
    bw: int
    class Config:
        orm_mode = True


        
class Xeikon(BaseModel):
    unit: str
    serial: str
    suma_A3: int
    suma_gram: int
    date: date
    class Config:
        orm_mode = True


class XeikonDetails(BaseModel):
    unit: str
    printed: int
    toner: int
    date: date
    class Config:
        orm_mode = True

