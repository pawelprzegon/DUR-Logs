import sys
import subprocess
import os
import glob
import re
from io import StringIO
import pandas as pd
import numpy as np
from impala_api.models_Impala import Impala as Imp
from impala_api.models_Impala import Impala_details as Impd
from fastapi_sqlalchemy import db
from sqlalchemy import func
from datetime import date


basedir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
incomming_file_path: str = f"{basedir}/volumes/impala"
data_folder: str = f"{incomming_file_path}/**/*.mdb"


def mdb_to_pandas(database_path):
    subprocess.call(["mdb-schema", database_path, "mysql"])
    # Get the list of table names with "mdb-tables"
    table_names = subprocess.Popen(["mdb-tables", "-1", database_path],
                                   stdout=subprocess.PIPE).communicate()[0]
    tables = table_names.splitlines()
    sys.stdout.flush()
    # Dump each table as a stringio using "mdb-export",
    for rtable in tables:
        table = rtable.decode('ISO-8859-1')
        if table == 'Jobs':
            contents = subprocess.Popen(["mdb-export", database_path, table],
                                        stdout=subprocess.PIPE).communicate()[0]
            temp_io = StringIO(contents.decode('ISO-8859-1'))
            print(table)
            return pd.read_csv(
                temp_io,
                low_memory=False,
                usecols=[
                    'ID',
                    'Changed',
                    'Black',
                    'Cyan',
                    'Magenta',
                    'Yellow',
                    'White',
                    'Squaremeter',
                ],
            )
        next
    return None


def sort_multiply_data(df, unit_number, last_db_insert):
    cols = ['Black', 'Cyan', 'Magenta', 'Yellow', 'White']
    df[cols] = df[cols] / 70000000
    df.insert(0, 'unit', f'Impala {unit_number}')
    df['Changed'] = pd.to_datetime(
        df['Changed'], dayfirst=True)
    df = df.sort_values(by=['Changed'])
    df['Total_Ink'] = df[cols].sum(axis=1)
    df["date"] = pd.to_datetime(df["Changed"].dt.strftime('%m-%Y'))
    df = df.replace(r"^\s*$", np.nan, regex=True)
    df[["Black", "Cyan", "Magenta", "Yellow", "White", "Squaremeter", "Total_Ink"]] = df[
        ["Black", "Cyan", "Magenta", "Yellow", "White", "Squaremeter", "Total_Ink"]].apply(
        pd.to_numeric)
    df = df.groupby(["unit", "date"])[
        ["Black", "Cyan", "Magenta", "Yellow", "White", "Squaremeter", "Total_Ink"]].sum().reset_index()
    df = df.sort_values(by=['date'])
    df = df.round(3)
    df = df.loc[df.date > last_db_insert]
    return df


def assign_data(row, exists):
    exists.unit = row["unit"]
    exists.Black = row["Black"]
    exists.Cyan = row["Cyan"]
    exists.Magenta = row["Magenta"]
    exists.Yellow = row["Yellow"]
    exists.White = row["White"]
    exists.Squaremeter = row["Squaremeter"]
    exists.Total_Ink = row["Total_Ink"]
    exists.date = row["date"]


def add_all_to_db_by_month(database):
    for index, row in database.iterrows():
        impala_data = Impd(
            unit=row['unit'],
            Black=row['Black'],
            Cyan=row['Cyan'],
            Magenta=row['Magenta'],
            Yellow=row['Yellow'],
            White=row['White'],
            printed=row["Squaremeter"],
            ink=row["Total_Ink"],
            date=row["date"],
        )
        print(impala_data)
        if (
            exists := db.session.query(Impd)
            .filter(Impd.unit == str(row["unit"]), Impd.date == row["date"])
            .first()
        ):
            assign_data(row, exists)
        else:
            db.session.add(impala_data)
        db.session.commit()


def new_summ_all(unit):
    summed_data = db.session.query(func.sum(Impd.printed).label('sum_printed'), func.sum(
        Impd.ink).label('sum_ink')).filter(Impd.unit == unit).first()
    if (
        exists := db.session.query(Imp).filter(Imp.unit == unit).first()
    ):
        exists.suma_m2 = int(summed_data.sum_printed)
        exists.suma_ml = int(summed_data.sum_ink)
        exists.date = date.today()
    else:
        impala_data = Imp(
            unit=str(unit),
            suma_m2=int(summed_data.sum_printed),
            suma_ml=int(summed_data.sum_ink),
            date=date.today()
        )
        db.session.add(impala_data)
    db.session.commit()


def get_unit_number(file):
    file = file.split('/')[-1]
    return re.findall(r'\d+', file)


def get_last_insert(unit):
    last_db_insert = db.session.query(func.max(Impd.date)).filter(
        Impd.unit == f'Impala {str(unit)}').first()
    if last_db_insert is None:
        return '2000-01-01'
    else:
        return last_db_insert[0].strftime("%Y-%m-%d")


def update():
    files = glob.glob(data_folder, recursive=True)

    for file in files:
        unit_number = get_unit_number(file)
        last_insert = get_last_insert(*unit_number)
        df = mdb_to_pandas(file)
        df = sort_multiply_data(df, *unit_number, last_insert)
        if not df.empty:
            add_all_to_db_by_month(df)
            new_summ_all(f'Impala {str(*unit_number)}')
