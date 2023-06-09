from sqlalchemy.exc import SQLAlchemyError
from fastapi_sqlalchemy import db
from fastapi import status, HTTPException
from mutoh_api.models_Mutoh import Mutoh as Mh
from mutoh_api.models_Mutoh import MutohSettings as MutSet

def mutohUpdateSettings(target):
    try:
        settings = MutSet(
            target=int(target),
        )
        if (
            exists := db.session.query(MutSet).first()
        ):
            exists.target = int(target)
        else:
            db.session.add(settings)
        db.session.commit()
        update_targets(target)
        return {'status': f'successfully updated target to {int(target)}'}
    
    except SQLAlchemyError as e:
         raise HTTPException(
           status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e.__dict__['orig']),
            ) from e
    except Exception as ex:
        raise HTTPException(
           status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(ex),
            ) from ex
    

def update_targets(target):
    data = db.session.query(Mh).all()
    for each in data:
        each.target_reached = round(each.suma_m2/int(target), 2)*100
        db.session.commit()
        
def addDefaultTargetToDb():
    default_target = MutSet(
        target=19000
    )
    db.session.add(default_target)
    db.session.commit()
    return db.session.query(MutSet).first()