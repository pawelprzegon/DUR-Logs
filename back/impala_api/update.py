import sys
import subprocess
import os
import glob
import re
from io import StringIO
import pandas as pd
import numpy as np
from impala_api.models_Impala import ImpalaDetails as Impd
from fastapi_sqlalchemy import db
from sqlalchemy import func
from datetime import date
from impala_api.insert_into_db import Database
from common.csv_backup import CsvBackup


basedir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ARCHIVES_FILES_PATH: str = f"{basedir}/volumes/archiv_impala"
DATA_FOLDER: str = f"{basedir}/volumes/impala/**/*.mdb"


def create_new_df(database_path):
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


def loc_new_df(df, unit_number, last_db_insert):
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


def get_unit_number(file):
    file = file.split('/')[-1]
    return re.findall(r'\d+', file)


def get_last_insert(unit):
    last_db_insert = db.session.query(func.max(Impd.date)).filter(
        Impd.unit == f'Impala {str(unit)}').first()
    print(last_db_insert)
    if last_db_insert[0] is None:
        return '2000-01-01'
    else:
        return last_db_insert[0].strftime("%Y-%m-%d")

# TODO sprawdzić dla impali last_data_insert


def update_Impala_data():
    files = glob.glob(DATA_FOLDER, recursive=True)

    for file in files:
        print(file)
        unit_number = get_unit_number(file)
        last_insert = get_last_insert(*unit_number)
        new_df = create_new_df(file)
        new_df = loc_new_df(new_df, *unit_number, last_insert)
        if not new_df.empty:
            update_db = Database(new_df,
                                 f'Impala {str(*unit_number)}')
            update_db.add_all_to_db_by_month()
            update_db.new_summ_all()

            csv_backup = CsvBackup(
                f'Impala_{str(*unit_number)}', [file], new_df, ARCHIVES_FILES_PATH)
            csv_backup.save_csv_backup()
            csv_backup.moveFiles()
