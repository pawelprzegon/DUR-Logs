from impala_api.models_Impala import ImpalaSettings as Set
from impala_api.models_Impala import ImpalaFiltersRepl as FRepl
from impala_api.models_Impala import ImpalaBearingsRepl as BRepl
from impala_api.models_Impala import ImpalaDetails as Impd
import pandas as pd
from fastapi_sqlalchemy import db
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from fastapi import HTTPException
from db import get_session


def impala_update_target(what, target):
    try:
        match what:
            case 'filters':
                settings = Set(
                    filters=int(target),
                )
                if (
                    exists := db.session.query(Set).filter(Set.id == 1).first()
                ):

                    exists.filters = int(target)
                else:
                    db.session.add(settings)
            case 'bearings':
                settings = Set(
                    bearings=int(target),
                )
                if (
                    exists := db.session.query(Set).filter(Set.id == 1).first()
                ):
                    exists.bearings = int(target)
                else:
                    db.session.add(settings)

        db.session.commit()
        return {'status': 'successfully updated'}

    except SQLAlchemyError as e:
        return {'status': str(e.__dict__['orig'])}
    except Exception as ex:
        raise HTTPException(
            status_code=500,
            detail=f'Server error when update {str(ex)}',
        ) from ex


def impala_update_replacements(data):
    try:
        what = data[0]
        date = datetime.strptime(data[1], '%Y-%m-%d')
        unit = data[2]
        color = data[3]
        if what == 'bearings':
            settings = BRepl(
                unit=unit,
                date=date
            )

        elif what == 'filters':
            settings = FRepl(
                unit=unit,
                date=date,
                color=color
            )
        db.session.add(settings)
        db.session.commit()
        return {'status': 'succesfully added'}

    except SQLAlchemyError as e:
        return {'status': str(e.__dict__['orig'])}

    except Exception as ex:
        raise HTTPException(
            status_code=500,
            detail=f'Server error when update {str(ex)}',
        ) from ex


def write_default_threshold_values_to_db():
    newThreshold = Set(
        filters=50000,
        bearings=40000
    )
    db.session.add(newThreshold)
    db.session.commit()

    return db.session.query(Set).first()


def get_replacement_data(replacement_type):
    if replacement_type == 'filters':
        with get_session() as session:
            df = pd.read_sql(session.query(Impd).statement, session.bind)
            df['date'] = pd.to_datetime(df['date'])

            ff = pd.read_sql(session.query(FRepl).statement, session.bind)
            ff['date'] = pd.to_datetime(ff['date'])

        return df, ff

    elif replacement_type == 'bearings':
        with get_session() as session:
            df = pd.read_sql(session.query(Impd).statement, session.bind)
            df['date'] = pd.to_datetime(df['date'])

            bf = pd.read_sql(session.query(BRepl).statement, session.bind)
            bf['date'] = pd.to_datetime(bf['date'])

        return df, bf


def impala_replacements(replacement_type) -> dict:
    df, repl_df = get_replacement_data(replacement_type)
    units = df['unit'].unique()
    data_ = {}
    printers = [get_data(df, repl_df, each, replacement_type)
                for each in units]
    # printers = sorted(printers, key=lambda d: print(list(d.unit)))
    with get_session() as session:
        threshold = session.query(Set).first()
        if threshold is None:
            threshold = write_default_threshold_values_to_db()
        return {
            'units': printers,
            'filters_threshold': threshold.filters,
            'bearings_threshold': threshold.bearings,
        }


def get_data(df, repl_df, each, replacement_type):
    if replacement_type == 'filters':
        return get_filters_data(df, repl_df, each)
    elif replacement_type == 'bearings':
        return get_bearings_data(df, repl_df, each)


def all_dates_for_color(ff, each, color):
    result = []
    data = ff['date'].loc[(ff['unit'] == each) & (ff['color'] == color)]
    for _ in data.values:
        _ = datetime.utcfromtimestamp(_.tolist()/1e9).date()
        result.append(_)
    return result


def max_date_for_color(ff, each, color):
    return ff.loc[(ff['unit'] == each) & (ff['color'] == color)].max()['date']


def get_filters_last_date(df, ff, each, color):
    maxDate = (
        datetime.strptime('1990-01-01', '%Y-%m-%d')
        if str(max_date_for_color(ff, each, color)) == 'NaT'
        else max_date_for_color(ff, each, color)
    )
    return {
        'liter': (df[(df['date'] >= maxDate) & (df['unit'] == each)].sum(
            numeric_only=True)[color]/1000).round(1),
        'last_replacement': maxDate.date(),
        'all_replacements': all_dates_for_color(ff, each, color)

    }


def get_filters_data(df, ff, each):
    colors = ['Black', 'Cyan', 'Magenta', 'Yellow', 'White']
    unit = {'unit': each}

    for color in colors:
        unit[color] = get_filters_last_date(df, ff, each, color)
    return unit


def max_date_for_bearings(bf, each):
    return bf.loc[bf['unit'] == each].max()['date']


def all_dates_for_bearings(bf, each):
    result = []
    data = bf['date'].loc[bf['unit'] == each]
    for _ in data.values:
        _ = datetime.utcfromtimestamp(_.tolist()/1e9).date()
        result.append(_)

    return result


def get_bearings_data(df, bf, each):
    maxDate = (
        datetime.strptime('1990-01-01', '%Y-%m-%d')
        if str(max_date_for_bearings(bf, each)) == 'NaT'
        else max_date_for_bearings(bf, each)
    )
    return {
        'unit': each,
        'tys_m2': (df[(df['date'] >= maxDate) & (df['unit'] == each)].sum(
            numeric_only=True)['printed']/1000).round(1),
        'last_replacement': maxDate.date(),
        'all_replacements': all_dates_for_bearings(bf, each)
    }
