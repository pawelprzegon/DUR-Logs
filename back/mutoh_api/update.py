import fileinput
import glob
import os
import numpy as np
import pandas as pd
from fastapi_sqlalchemy import db
from mutoh_api.models_Mutoh import Mutoh_details as MutDet
from mutoh_api.models_Mutoh import Mutoh as Mh
from common.update_db import Database
from common.csv_backup import CsvBackup

# basedir = os.path.abspath(os.path.dirname(__file__))
basedir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ARCHIVES_FILES_PATH: str = f"{basedir}/volumes/archiv_mutoh"
DATA_FOLDER: str = f"{basedir}/volumes/mutoh/**/*.log"


def get_mutoh_numbers() -> list:
    mutohNumbers = []
    files = glob.glob(DATA_FOLDER, recursive=True)
    for file in files:
        y = file
        z = y[-21:-19]
        if z == "to":
            z = y[-17:-15]
        elif z == "NY":
            z = y[-24:-22]
        mutohNumbers.append(z)
    return sorted(set(mutohNumbers))


def get_log_files() -> list:
    return glob.glob(DATA_FOLDER, recursive=True)


def unit_logFiles_to_dict(mutohNumbers: list, log_files: list) -> dict:
    unit_logFiles_dict = {f"Mutoh {i}": [] for i in mutohNumbers}
    for log_file in log_files:
        y = log_file
        z = y[-21:-19]
        if z == "to":
            z = y[-17:-15]
        elif z == "NY":
            z = y[-24:-22]
        for i in mutohNumbers:
            if i == z:
                unit_logFiles_dict[f"Mutoh {i}"].append(log_file)
    return unit_logFiles_dict


def create_new_df(logs):
    lines = []
    lines = list(fileinput.FileInput(
        logs, encoding="ISO-8859-1"))  # read file
    lines = list(set(lines))  # remove duplicates
    # put readed data into Pandas DF
    df = pd.DataFrame({"dane": lines})
    df = df.drop_duplicates()
    fileinput.close()
    df = (
        df["dane"]
        .str.split("\t", expand=True)
        .rename(
            columns={
                0: "Data",
                1: "Autonest",
                2: "User",
                3: "Ip",
                4: "Time",
                5: "Copies",
                6: "Ink",
                7: "lst_date",
                8: "Media",
                9: "Printed",
                10: "Status",
            }
        )
    )  # rename columns in Pandas DF
    df = df.sort_values(by=["Data"], ascending=True)  # sort data
    df["Data"] = pd.to_datetime(df["Data"], unit="s")
    return df


def loc_new_df(df, last_db_insert: str, unit):
    df = df.loc[df['Data'] > last_db_insert]
    if not df.empty:
        new_last_db_insert = df['Data'].max()
        df = df.replace(r"^\s*$", np.nan, regex=True)
        df[["Time", "Copies", "Ink", "Printed"]] = df[["Time", "Copies",
                                                       "Ink", "Printed"]].apply(pd.to_numeric)  # make columns numeric
        df["Ink"].fillna((df["Printed"].mul(4.9)), inplace=True)
        df = df.drop(
            [
                "Autonest",
                "User",
                "Ip",
                "Time",
                "Copies",
                "Media",
                "Status",
            ],
            axis=1,
        )
        df["Data"] = pd.to_datetime(df["Data"].dt.strftime('%Y-%m'))
        new_df = df.groupby(["Data"])[
            ["Ink", "Printed"]].sum().reset_index()
        new_df["unit"] = unit
        new_df = new_df.sort_values(by=['Data'])
        new_df.Ink = new_df.Ink.round()
        new_df.Printed = new_df.Printed.round()
        return new_df, new_last_db_insert
    return df, None


def get_last_insert(unit):
    last_db_insert = db.session.query(Mh.date).filter(
        Mh.unit == unit).first()

    # last_db_insert = None
    if last_db_insert is None:
        return '2000-01-01 00:00:00'
    else:
        return str(last_db_insert['date'])  # 2021-05-17 11:45:25


def prepare_unit_logFiles_dict():
    mutoh_numbers = get_mutoh_numbers()
    log_files = get_log_files()
    return unit_logFiles_to_dict(mutoh_numbers, log_files)


def update_Mutoh_data():
    all_data = pd.DataFrame()
    last_inserts = {}
    unit_logFiles_dict = prepare_unit_logFiles_dict()
    for unit, logs in unit_logFiles_dict.items():
        new_df = create_new_df(logs)
        last_db_insert = get_last_insert(unit)
        new_loc_df, new_last_db_insert = loc_new_df(
            new_df, last_db_insert, unit)
        all_data = pd.concat([all_data, new_loc_df]).reset_index(drop=True)
        last_inserts[unit] = new_last_db_insert
        print(
            f'{unit} last_db_insert: {last_db_insert}--->new:{new_last_db_insert}')
        # print(f'unit {unit}')
        # print(
        #     f'last_db_insert: {last_db_insert}  ---> new_last_db_insert: {new_last_db_insert}')
        # print(f'new_df: \n{new_loc_df}')
    print(all_data)
    print(all_data.empty)
    if not all_data.empty:
        update_db = Database(all_data, last_inserts)
        update_db.update(MutDet)
        update_db.update(Mh)
        for unit, logs in unit_logFiles_dict.items():
            csv_backup = CsvBackup(unit, logs, all_data, ARCHIVES_FILES_PATH)
            csv_backup.save_csv_backup()
            csv_backup.moveFiles()
        # mutoh_items.del_files(mutoh_numbers[x])
