from typing import List
from fastapi_sqlalchemy import db
from sqlalchemy import func
import impala_api.schema as schema
from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from impala_api.models_Impala import Impala, Impala_details, ImpalaSettings
from impala_api.update import update_Impala_data
from impala_api.replacements import impalaUpdateReplacements, impalaReplacements, impalaUpdateTarget
from datetime import datetime
from dateutil.relativedelta import relativedelta


impala_api = APIRouter()

status = None


def update_data():
    global status
    status = True
    update_Impala_data()
    print("done! ")
    status = False


@impala_api.get('/impala/status', include_in_schema=False)
async def status():
    return status


@impala_api.get("/impala/update", include_in_schema=False)
async def impalaDataUpdate(background_tasks: BackgroundTasks):
    global status
    if status != True:
        background_tasks.add_task(update_data)
    status = True
    return {"impala update": "in progress refresh website after view minutes"}


@impala_api.get("/impala", response_model=List[schema.Impala], response_model_exclude_none=True, tags=["Impala"])
async def impala_all():
    """
     endpoint: lists all impalas data, including filters and bearings lists with all replacements datas
    """
    if response := db.session.query(Impala).order_by(Impala.unit).all():
        return response
    elif status is True:
        raise HTTPException(
            status_code=403,
            detail='Impala update in progress',
        )
    else:
        raise HTTPException(
            status_code=404,
            detail='Not found',
        )


@impala_api.get("/impala/chart/{unit}/{period}", response_model=List[schema.Impala_details], tags=["Impala"])
async def impala_chart(unit, period):
    """
     endpoint: lists specific mutoh summed data(m2/ml) ziped in months and years ; -> 
     variable example: "Impala 1"
    """
    last_active = db.session.query(func.max(Impala_details.date))\
                    .filter(Impala_details.unit == str(unit)).first()
    last_active = datetime.strptime(str(*last_active), '%Y-%m-%d')
    if period != 'all':
        date_period = last_active + relativedelta(months=-int(period))
    else:
        date_period = last_active + relativedelta(years=-10)
    if response := db.session.query(Impala_details)\
            .filter(Impala_details.unit == str(unit), Impala_details.date >= date_period)\
            .order_by(Impala_details.date).all():
        return response

    else:
        raise HTTPException(
            status_code=404,
            detail='Not found',
        )


@impala_api.put("/impala/replacements/{what}&{date}&{unit}&{color}", tags=["Impala"])
async def impala_Replacements_Update(what, date, unit, color):
    """
     endpoint: add new replacement data for filters or bearings
     unit: Impala 1
     what: filters / bearings
     date: date
     color: Black (if needed)
    """

    return impalaUpdateReplacements([what, date, unit, color], tags=["Impala"])


@impala_api.get("/impala/replacements/", tags=["Impala"])
async def impala_Replacements():
    """
     endpoint: gets all replacements datas for filters and bearings(if any)
    """
    return impalaReplacements()


@impala_api.put('/impala/settings/{what}&{target}', tags=["Impala"])
async def update_Settings(what, target):
    """
     endpoint: updating alarm value level for filters and bearings actual quantity(counted from the last exchange, if any)
     'what': filters / bearings
     'target': int value
    """
    return impalaUpdateTarget(what, target)


@impala_api.get('/impala/settings/', response_model=schema.ImpalaSettings, include_in_schema=False, tags=["Impala"])
async def read_Settings():
    if response := db.session.query(ImpalaSettings).first():
        return response
    else:
        raise HTTPException(
            status_code=404,
            detail='Not found',
        )
