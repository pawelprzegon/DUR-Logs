from typing import List
from fastapi_sqlalchemy import db
import mutoh_api.schema as schema
from mutoh_api.update import update_Mutoh_data
from mutoh_api.settings import mutoh_update_settings, add_default_darget_to_db, update_SN
from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from mutoh_api.models_Mutoh import Mutoh, MutohDetails, MutohSettings
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
    if isinstance(status, bool):
        raise HTTPException(
            status_code=200,
            detail=status,
        )
    else:
        raise HTTPException(
            status_code=500,
            detail='status type error',
        )


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
    if status is True:
        raise HTTPException(
            status_code=403,
            detail='Mutoh update in progress',
        )
    elif response := db.session.query(Mutoh)\
        .order_by(Mutoh.unit)\
            .all():
        return response
    else:
        raise HTTPException(
            status_code=404,
            detail='Not found',
        )


@mutoh_api.get("/mutoh/chart/{unit}/{period}", response_model=List[schema.MutohDetails], tags=["Mutoh"])
async def mutoh_chart(unit, period):
    """
     endpoint: lists specific mutoh summed data(m2/ml) ziped in months and years, including last working day\n
     variable example {unit}: "Mutoh 50"\n
     variable example {period}: "6" - as 6 months
    """

    last_active = db.session.query(func.max(MutohDetails.date)).filter(
        MutohDetails.unit == str(unit)).first()

    last_active = datetime.strptime(str(*last_active), '%Y-%m-%d')
    if period != 'all':
        date_period = last_active + relativedelta(months=-int(period))
    else:
        date_period = last_active + relativedelta(years=-10)

    if response := db.session.query(MutohDetails)\
        .filter(
        MutohDetails.unit == str(unit),
        MutohDetails.date >= date_period)\
        .order_by(MutohDetails.date)\
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
     endpoint: updating target value level 
    """
    if response := mutoh_update_settings(target):
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
        return add_default_darget_to_db()


@mutoh_api.put("/mutoh/sn/{unit}/{sn}", tags=["Mutoh"])
async def mutoh_sn(unit, sn):
    """
     endpoint: update serial number for mutohs units
    """
    if response := update_SN(unit, sn):
        return response
    else:
        raise HTTPException(
            status_code=404,
            detail='Not found',
        )
