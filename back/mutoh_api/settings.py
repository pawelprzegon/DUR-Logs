from sqlalchemy.exc import SQLAlchemyError
from fastapi_sqlalchemy import db
from fastapi import status, HTTPException
from mutoh_api.models_Mutoh import Mutoh as Mh
from mutoh_api.models_Mutoh import MutohSettings as MutSet


def mutoh_update_settings(target):
    '''updating Mutoh Settings table with new target'''
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
    '''function to recalculate for each row in db new target'''
    data = db.session.query(Mh).all()
    for each in data:
        each.target_reached = round(each.suma_m2/int(target), 2)*100
        db.session.commit()


def add_default_target_to_db():
    '''created default target if there is no entry in target table'''
    default_target = MutSet(
        target=19000
    )
    db.session.add(default_target)
    db.session.commit()
    return db.session.query(MutSet).first()


def update_SN(unit, sn):
    '''function to update serial number'''
    try:
        if exists := db.session.query(Mh).filter(Mh.unit == unit).first():
            exists.sn = sn
        db.session.commit()
        return {'status': f'successfully updated sn {sn} for {unit}'}
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
