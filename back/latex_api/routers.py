from fastapi_sqlalchemy import db
from fastapi import APIRouter, BackgroundTasks, HTTPException, status
import latex_api.schema as schema
from typing import List
from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from latex_api.models_Latex import Latex, LatexDetails
from latex_api.update import update_Latex_data
from sqlalchemy import func
from dateutil.relativedelta import relativedelta
from datetime import datetime

latex_api = APIRouter()


status = None


def update_data():
    global status
    status = True
    update_Latex_data()
    print("done! ")
    status = False


@latex_api.get('/latex/status', include_in_schema=False)
async def status():
    return status


@latex_api.get("/latex/update", include_in_schema=False)
async def latexDataUpdate(background_tasks: BackgroundTasks):
    global status
    if status != True:
        background_tasks.add_task(update_data)
    status = True
    return {"latex update": "in progress refresh website after view minutes"}


@latex_api.get("/latex", response_model=List[schema.Latex], response_model_exclude_none=True, tags=["Latex"])
async def latex_all():
    """
     endpoint: lists all latex data, including filters and bearings lists with all replacements datas
    """
    if response := db.session.query(Latex).order_by(Latex.unit).all():
        return response
    else:
        raise HTTPException(
            status_code=404,
            detail='Not found',
        )


@latex_api.get("/latex/chart/{unit}/{period}", response_model=List[schema.Latex_details], tags=["Latex"])
async def latex_chart(unit, period):
    """
     endpoint: lists specific mutoh summed data(m2/ml) ziped in months and years ; -> 
     variable example: "Latex 3100"
    """

    last_active = db.session.query(func.max(LatexDetails.date))\
        .filter(LatexDetails.unit == str(unit)).first()
    print(last_active)
    last_active = datetime.strptime(str(*last_active), '%Y-%m-%d')
    if period != 'all':
        date_period = last_active + relativedelta(months=-int(period))
    else:
        date_period = last_active + relativedelta(years=-10)
    if response := db.session.query(LatexDetails)\
            .filter(LatexDetails.unit == str(unit), LatexDetails.date >= date_period)\
            .order_by(LatexDetails.date).all():
        return response

    else:
        raise HTTPException(
            status_code=404,
            detail='Not found',
        )
