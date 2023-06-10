from typing import List
from fastapi_sqlalchemy import db
import mutoh_api.schema as schema
from mutoh_api.update import update_Mutoh_data
from mutoh_api.settings import mutohUpdateSettings, addDefaultTargetToDb
from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from mutoh_api.models_Mutoh import Mutoh, Mutoh_details, MutohSettings
from datetime import datetime
from dateutil.relativedelta import relativedelta
from sqlalchemy import func

mutoh_api = APIRouter()

status: bool = False


def update():
    global status
    status = True
    update_Mutoh_data()
    print("done!")
    status = False


@mutoh_api.get('/mutoh/status', include_in_schema=False)
def status():
    return status


@mutoh_api.get("/mutoh/update", include_in_schema=False)
async def mutohDataUpdate(background_tasks: BackgroundTasks):
    global status
    if status != True:
        background_tasks.add_task(update)
    status = True
    return {"update status": "in progress refresh website after view minutes"}


@mutoh_api.get("/mutoh", response_model=List[schema.Mutoh], tags=["Mutoh"])
async def mutoh_all():
    """
     endpoint: lists all mutohs summed data(m2/ml)
    """
    if response := db.session.query(Mutoh)\
        .order_by(Mutoh.unit)\
            .all():
        return response
    else:
        raise HTTPException(
            status_code=404,
            detail='Not found',
        )


@mutoh_api.get("/mutoh/chart/{unit}/{period}", response_model=List[schema.Mutoh_details], tags=["Mutoh"])
async def mutoh_chart(unit, period):
    """
     endpoint: lists specific mutoh summed data(m2/ml) ziped in months and years, including last working day\n
     variable example {unit}: "Mutoh 50"\n
     variable example {period}: "6" - as 6 months
    """

    last_active = db.session.query(func.max(Mutoh_details.date)).filter(
        Mutoh_details.unit == str(unit)).first()

    last_active = datetime.strptime(str(*last_active), '%Y-%m-%d')
    if period != 'all':
        date_period = last_active + relativedelta(months=-int(period))
    else:
        date_period = last_active + relativedelta(years=-10)

    if response := db.session.query(Mutoh_details)\
        .filter(
        Mutoh_details.unit == str(unit),
        Mutoh_details.date >= date_period)\
        .order_by(Mutoh_details.date)\
            .all():
        return response
    else:
        raise HTTPException(
            status_code=404,
            detail='Not found',
        )


@mutoh_api.put('/mutoh/target/{target}', tags=["Mutoh"])
async def update_Settings(target):
    """
     endpoint: updating alarm value level for filters and bearings actual quantity(counted from the last exchange, if any)\n
     variable example : "20000"
    """
    if response := mutohUpdateSettings(target):
        return response
    else:
        raise HTTPException(
            status_code=404,
            detail='Not found',
        )


@mutoh_api.get("/mutoh/target", response_model=schema.MutohSettings, tags=["Mutoh"])
async def mutoh_target():
    """
     endpoint: target for mutohs units
    """
    if target := db.session.query(MutohSettings).first():
        return {'target': target.target}
    else:
        return addDefaultTargetToDb()
