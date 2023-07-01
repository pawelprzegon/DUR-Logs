from impala_api.models_Impala import ImpalaSettings as Set
from impala_api.models_Impala import ImpalaFiltersRepl as FRepl
from impala_api.models_Impala import ImpalaBearingsRepl as BRepl
from impala_api.models_Impala import ImpalaDetails as Impd
import pandas as pd
from pandas import DataFrame
from fastapi_sqlalchemy import db
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from fastapi import HTTPException
from db import get_session


def impala_update_target(what, target):
    '''updating target value in database'''
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
    '''function to update one of replacement (filters or bearings) in database
    '''
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
    '''inserts default values for table ImpalaSettings'''
    newThreshold = Set(
        filters=50000,
        bearings=40000
    )
    db.session.add(newThreshold)
    db.session.commit()

    return db.session.query(Set).first()


def get_replacement_data(replacement_type):
    '''get database data into dataframe and change date column type into datetime'''
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
    '''gets all replacements data for each unit'''
    df, repl_df = get_replacement_data(replacement_type)
    units = df['unit'].unique()
    printers = [get_data(df, repl_df, each, replacement_type)
                for each in units]
    with get_session() as session:
        threshold = session.query(Set).first()
        if threshold is None:
            threshold = write_default_threshold_values_to_db()
        return {
            'units': printers,
            'filters_threshold': threshold.filters,
            'bearings_threshold': threshold.bearings,
        }


def get_data(df, repl_df, each, replacement_type) -> dict:
    '''returns dict with filters or bearings data'''
    if replacement_type == 'filters':
        return get_filters_data(df, repl_df, each)
    elif replacement_type == 'bearings':
        return get_bearings_data(df, repl_df, each)


def all_dates_for_color(ff, each, color) -> list:
    '''creating list of dates from locked dataframe.
    After locking dataframe in the loop every date is converted into 
    Unix  timestamp then with tolist() converts date into Ptyhon datetime object.
    Then devides date by 1e9 what convert it into seconds. And at the end .date() 
    extracts the date'''
    result = []
    data = ff['date'].loc[(ff['unit'] == each) & (ff['color'] == color)]
    for _ in data.values:
        _ = datetime.utcfromtimestamp(_.tolist()/1e9).date()
        result.append(_)
    return result


def max_date_for_color(ff, each, color):
    '''gets last date from locked dataframe with credentials (unit and color)'''
    return ff.loc[(ff['unit'] == each) & (ff['color'] == color)].max()['date']


def get_filters_last_date(df, ff, each, color):
    '''finds last date using (max_date_for_color) if exists. If not sets default date. 
    returns dict with data where filter is locked dataframe with summed only numeric 
    columns rounded into 1 digit. Last_replacement is maxDate value converted into date.
    All_replacements are all filters replacement dates for each color'''
    maxDate = (
        datetime.strptime('1990-01-01', '%Y-%m-%d')
        if str(max_date_for_color(ff, each, color)) == 'NaT'
        else max_date_for_color(ff, each, color)
    )
    return {
        'fliter': (df[(df['date'] >= maxDate) & (df['unit'] == each)].sum(
            numeric_only=True)[color]/1000).round(1),
        'last_replacement': maxDate.date(),
        'all_replacements': all_dates_for_color(ff, each, color)
    }


def get_filters_data(df, ff, each) -> dict:
    '''get dict with unit and colors as keys and return of 
    get_filters_last_date as value for each unit and color'''
    colors = ['Black', 'Cyan', 'Magenta', 'Yellow', 'White']
    unit = {'unit': each}

    for color in colors:
        unit[color] = get_filters_last_date(df, ff, each, color)
    return unit


def max_date_for_bearings(bf, each) -> DataFrame:
    '''gets last date from locked dataframe with credentials (unit )'''
    return bf.loc[bf['unit'] == each].max()['date']


def all_dates_for_bearings(bf, each) -> list:
    '''creating list of dates from locked dataframe.
    After locking dataframe in the loop every date is converted into 
    Unix  timestamp then with tolist() converts date into Ptyhon datetime object.
    Then devides date by 1e9 what convert it into seconds. And at the end .date() 
    extracts the date'''
    result = []
    data = bf['date'].loc[bf['unit'] == each]
    for _ in data.values:
        _ = datetime.utcfromtimestamp(_.tolist()/1e9).date()
        result.append(_)
    return result


def get_bearings_data(df, bf, each) -> dict:
    '''finds last date using (max_date_for_bearings) if exists. If not sets default date. 
    returns dict with data where unit is a unit, tys_m2 is locked dataframe with summed only numeric 
    columns rounded into 1 digit. Last_replacement is maxDate value converted into date.
    All_replacements are all bearings replacement dates'''
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
