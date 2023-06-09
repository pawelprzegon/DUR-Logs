from typing import List
from fastapi_sqlalchemy import db
import xeikon_api.schema as schema
from fastapi import APIRouter, BackgroundTasks, HTTPException, status, Query
from xeikon_api.update import XeikonDatabase
from xeikon_api.reorganizeData import reorganizeTonerData, \
                                    reorganizeDVLData, reorganizeFuserData, \
                                    reorganizeClicksData
from xeikon_api.models_Xeikon import Xeikon, DVL, Fuser, Toner, \
                                     Xeikon_Details, Clicks
from typing import Optional
from sqlalchemy import func
from datetime import datetime
from dateutil.relativedelta import relativedelta
from db import get_session



xeikon_api = APIRouter()

def update():
    global status
    status = True
    directory = ['Xeikon 1', 'Xeikon 2', 'Xeikon 3']
    for each in directory:
        data = XeikonDatabase(each)
        data.update()
    print("done! ")
    status = False

@xeikon_api.get('/xeikons/status', include_in_schema=False)
def status():
    return status

@xeikon_api.get('/xeikon/update', include_in_schema=False)
async def xeikon_Update(background_tasks: BackgroundTasks):
    global status
    if status != True:
        background_tasks.add_task(update)
    status = True
    return {"xeikons update": "in progress refresh website after view minutes"}


@xeikon_api.get('/xeikon/', response_model=List[schema.Xeikon], tags=["Xeikon"])
async def xeikon_all_data(unit: Optional[str]=None):
    """
     endpoint: list all data for every printer without 'unit' parameter, or for specyfic Xeikon printer with 'unit' parameter\n
     variable example: "Xeikon 2"
    """
    if unit is None:
        if response := db.session.query(Xeikon).all():
            return response 
        else:
            raise HTTPException(
            status_code=404,
            detail='Not found',
            )
    unit = unit.lower()
    if response := db.session.query(Xeikon).filter(Xeikon.unit == unit.capitalize()).all():
        return response
    else:
            raise HTTPException(
            status_code=404,
            detail='Not found',
            )
        

@xeikon_api.get("/xeikon/chart/{unit}/{period}", response_model=List[schema.XeikonDetails], tags=["Xeikon"])
async def xeikon_chart_data(unit, period):
    """
     endpoint: lists specific xeikon summed data(A3/grams) ziped in months and years \n
     variable example: "Xeikon 1"
    """
    
    last_active = db.session.query(func.max(Xeikon_Details.date))\
                    .filter(Xeikon_Details.unit == str(unit)).first()
    last_active = datetime.strptime(str(*last_active), '%Y-%m-%d')
    if period != 'all':
        date_period = last_active + relativedelta(months=-int(period))
    else:
        date_period = last_active + relativedelta(years=-10)

    if response := db.session.query(Xeikon_Details).filter(Xeikon_Details.unit == str(unit)
                                                            ,Xeikon_Details.date >= date_period) \
                                                    .order_by(Xeikon_Details.date).all():
    
        return response
    else:
        raise HTTPException(
        status_code=404,
        detail='Not found',
        )
        
       
@xeikon_api.get('/xeikon/toner/', response_model=List[schema.Toner], tags=["Xeikon"])
def xeikon_Toner_data():
    """
     endpoint: list all Toner [gram] data 
    """
    with get_session() as session:
        if data := session.query(Toner):
            return reorganizeTonerData(data)
        else:
            raise HTTPException(
            status_code=404,
            detail='Not found',
            ) 
        
@xeikon_api.get('/xeikon/toner/chart/{unit}/{period}', response_model=List[schema.TonerDetails], tags=["Xeikon"])
def xeikon_Toner_details(unit, period):
    """
     endpoint: list all Toner [gram] data by month
    """
    last_active = db.session.query(func.max(Toner.date))\
                    .filter(Toner.unit == str(unit)).first()
    last_active = datetime.strptime(str(*last_active), '%Y-%m-%d')
    if period != 'all':
        date_period = last_active + relativedelta(months=-int(period))
    else:
        date_period = last_active + relativedelta(years=-10)
    if response := db.session.query(Toner)\
                .filter(Toner.unit == str(unit), Toner.date >= date_period)\
                .order_by(Toner.unit, Toner.date)\
                .all():
        return response
    else:
        raise HTTPException(
        status_code=404,
        detail='Not found',
        )    
      
    

@xeikon_api.get('/xeikon/dvl/', response_model=List[schema.DVL], tags=["Xeikon"])
async def xeikon_DVL_data():
    """
     endpoint: list all DVL data \n
    """
    if response := db.session.query(DVL).order_by(DVL.unit, DVL.color).all():
        return reorganizeDVLData(response)
    else:
        raise HTTPException(
        status_code=404,
        detail='Not found',
        )  

@xeikon_api.get('/xeikon/fuser/', tags=["Xeikon"])
async def xeikon_Fuser_data():
    """
     endpoint: list all Fuser data \n
    """
    
    if response := db.session.query(Fuser).all():
        return reorganizeFuserData(response)
    else:
        raise HTTPException(
        status_code=404,
        detail='Not found',
        )  
        
@xeikon_api.get('/xeikon/clicks/', response_model=List[schema.Clicks], tags=["Xeikon"])
async def xeikon_Clicks_data():
    """
     endpoint: list all Clicks data \n
    """
    with get_session() as session:
        if result := session.query(Clicks):
            return reorganizeClicksData(result)
        else:
            raise HTTPException(
            status_code=404,
            detail='Not found',
            )     
    
    
    
@xeikon_api.get('/xeikon/clicks/chart/{unit}/{period}', response_model=List[schema.ClicksDetails], tags=["Xeikon"])
async def xeikon_Clicks_data(unit, period):
    """
     endpoint: list all Clicks data \n
    """
    last_active = db.session.query(func.max(Clicks.date))\
                    .filter(Clicks.unit == str(unit)).first()
    last_active = datetime.strptime(str(*last_active), '%Y-%m-%d')
    if period != 'all':
        date_period = last_active + relativedelta(months=-int(period))
    else:
        date_period = last_active + relativedelta(years=-10)
    if result := db.session.query(Clicks)\
                    .filter(Clicks.unit == str(unit), Clicks.date  >= date_period)\
                    .order_by(Clicks.date)\
                    .all():
        return result
    else:
        raise HTTPException(
        status_code=404,
        detail='Not found',
        )