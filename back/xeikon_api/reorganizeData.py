from collections import defaultdict
import pandas as pd
from db import get_session


def reorganize_toner_data(response):
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


def reorganize_clicks_data(response):
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


def reorganize_dvl_data(response):
    tst = defaultdict(list)
    result = []
    for each in response:
        data = {
            'current': each.current,
            'replaced': each.replaced_total
        }
        tst[each.unit].append([each.color, data])
    for k, v in tst.items():
        col = ['unit']
        data = [k]
        for each in v:
            col.append(each[0])
            data.append(each[1])
        result.append(dict(zip(col, data)))
    return result


def reorganize_fuser_data(response):
    result = []
    for each in response:
        data = {
            'unit': each.unit,
            'current': each.current,
            'replaced': each.replaced_total
        }
        result.append(data)
    return result
