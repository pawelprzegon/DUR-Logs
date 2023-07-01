from collections import defaultdict
import pandas as pd
from db import get_session


def get_summed_toner_data(response):
    '''sum data for each toner'''
    with get_session() as session:
        result = []
        df = pd.read_sql(response.statement, session.bind)
        units = df['unit'].unique()
        for unit in units:
            cyan = df.loc[df['unit'] == unit, 'Cyan'].sum()
            magenta = df.loc[df['unit'] == unit, 'Magenta'].sum()
            yellow = df.loc[df['unit'] == unit, 'Yellow'].sum()
            black = df.loc[df['unit'] == unit, 'Black'].sum()
            white = df.loc[df['unit'] == unit, 'White'].sum()
            data = {
                'unit': unit,
                'Cyan': cyan,
                'Magenta': magenta,
                'Yellow': yellow,
                'Black': black,
                'White': white,
            }
            result.append(data)
        return result


def get_summed_clicks_data(response):
    '''sum data for each clicks data'''
    with get_session() as session:
        result = []
        df = pd.read_sql(response.statement, session.bind)
        units = df['unit'].unique()
        for unit in units:
            color = df.loc[df['unit'] == unit, 'color'].sum()
            bw = df.loc[df['unit'] == unit, 'bw'].sum()
            data = {
                'unit': unit,
                'color': color,
                'bw': bw,
            }
            result.append(data)
        return result


def reorganize_dvl_data(response) -> list:
    '''filtering data and pack as list of dict(dict created as ziped 2 lists)'''
    sorted_data_per_unit = defaultdict(list)
    result = []
    for each in response:
        data = {
            'current': each.current,
            'replaced': each.replaced_total
        }
        sorted_data_per_unit[each.unit].append([each.color, data])
    for k, v in sorted_data_per_unit.items():
        col = ['unit']
        data = [k]
        for each in v:
            col.append(each[0])
            data.append(each[1])
        result.append(dict(zip(col, data)))
    return result


def reorganize_fuser_data(response):
    '''filtering data and pack as list of dicts'''
    result = []
    for each in response:
        data = {
            'unit': each.unit,
            'current': each.current,
            'replaced': each.replaced_total
        }
        result.append(data)
    return result
