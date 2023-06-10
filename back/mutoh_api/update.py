import fileinput
import glob
import os
import pathlib
import sqlite3
from dataclasses import dataclass, field
from datetime import datetime
from typing import List
import numpy as np
import pandas as pd
from fastapi_sqlalchemy import db
from mutoh_api.models_Mutoh import Mutoh as Mh
from mutoh_api.models_Mutoh import Mutoh_details as Mhd
from mutoh_api.models_Mutoh import MutohSettings as MutSet
import shutil


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


def filter_unit_log_files() -> dict:
    tst = {}
    all_log_files = glob.glob(DATA_FOLDER, recursive=True)
    for log_file in all_log_files:
        temp = (datetime.fromtimestamp(pathlib.Path(
            log_file).stat().st_mtime)).strftime("%Y-%m-%d %H:%M:%S")
        tst[log_file] = temp
    return tst


def log_files_to_dict(mutohNumbers: list, tst: dict) -> dict:
    dct = {f"Mutoh {i}": [] for i in mutohNumbers}
    for keys in tst:
        y = keys
        z = y[-21:-19]
        if z == "to":
            z = y[-17:-15]
        elif z == "NY":
            z = y[-24:-22]
        for i in mutohNumbers:
            if i == z:
                dct[f"Mutoh {i}"].append(keys)
    return dct


def create_new_df(logs):
    lines: List[str] = field(init=False)
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
        print(new_last_db_insert)
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
        return new_df, new_last_db_insert
    print(df)
    return df, None


@dataclass
class MutohDatabase:
    def add_to_mutoh_details(self, new_data):
        new_data.Ink = new_data.Ink.round()
        new_data.Printed = new_data.Printed.round()
        for index, row in new_data.iterrows():
            mutoh_data = Mhd(
                unit=row["unit"],
                ink=row["Ink"],
                printed=row["Printed"],
                # lst_date=row["lst_date"],
                date=row["Data"],
            )
            if (
                exists := db.session.query(Mhd)
                .filter(Mhd.unit == row["unit"], Mhd.date == row["Data"])
                .first()
            ):
                self.assign_data(row, exists)
            else:
                db.session.add(mutoh_data)
            db.session.commit()

    def assign_data(self, row, exists):
        exists.unit = row["unit"]
        exists.ink += row["Ink"]
        exists.printed += row["Printed"]
        # exists.lst_date = row["lst_date"]

    def add_to_mutoh(self, new_df, new_last_db_insert) -> dict:
        unit = (new_df["unit"].unique())[0]
        target = target.target if (
            target := db.session.query(MutSet).first()) else 1

        preparedData = self.sumData(new_df, new_last_db_insert)
        self._insertIntoDB(preparedData, unit, target)

    def sumData(self, new_df, new_last_db_insert) -> dict:
        suma_m2 = new_df.sum(numeric_only=True)["Printed"]
        suma_ml = new_df.sum(numeric_only=True)["Ink"]
        return {'suma_m2': suma_m2,
                'suma_ml': suma_ml,
                'date': new_last_db_insert
                }

    def _insertIntoDB(self, preparedData, unit, target):
        mutoh_data = {}
        if (
            exists := db.session.query(Mh).filter(Mh.unit == str(unit)).first()
        ):
            exists.suma_m2 += int(preparedData.get('suma_m2'))
            exists.suma_ml += int(preparedData.get('suma_ml'))
            exists.date = preparedData.get('date')
            exists.target_reached = round(exists.suma_m2/target, 2)*100
        else:
            mutoh_data[unit] = Mh(
                unit=str(unit),
                suma_m2=int(preparedData.get('suma_m2')),
                suma_ml=int(preparedData.get('suma_ml')),
                date=preparedData.get('date'),
                target_reached=round(
                    int(preparedData.get('suma_m2'))/target, 2)*100,
            )
            db.session.add(mutoh_data[unit])
        db.session.commit()


class CsvBackup:
    def __init__(self, unit, logs, new_df) -> None:
        self.unit = unit
        self.logs = logs
        self.new_df = new_df
        self.backup_file = f'{ARCHIVES_FILES_PATH}/mutoh_{self.unit}.csv'

    def get_CSV(self):
        if os.path.isfile(self.backup_file):
            return pd.read_csv(self.backup_file, header=0, index_col=False, parse_dates=['Data'])

    def remove_CSV(self):
        if os.path.isfile(self.backup_file):
            os.remove(self.backup_file)

    def save_csv_backup(self):
        current_data = self.get_CSV()
        if current_data is None or current_data.empty:
            print("brak pliku albo pusty plik csv")
            self.new_df.to_csv(self.backup_file, header='true',
                               index=False, date_format='%Y-%m-%d')

        else:
            self.new_df["Data"] = pd.to_datetime(
                self.new_df["Data"].dt.strftime('%Y-%m-%d'))
            merged_df = pd.concat([current_data, self.new_df]
                                  ).drop_duplicates('Data', keep='last').reset_index(drop=True)
            self.remove_CSV()
            merged_df.to_csv(self.backup_file, header='true',
                             index=False, date_format='%Y-%m-%d')

    def fileName(self, file):
        file_modify_date = datetime.fromtimestamp(os.path.getmtime(file))
        return (file_modify_date.strftime("%Y_%m"))

    def moveFiles(self):
        # print(self.logs)

        for file in self.logs:
            try:
                fcreation_date = self.fileName(file)
                logs_subfolder = (os.path.dirname(file)).split('/')
                logs_subfolder = logs_subfolder[-1]
                logs_backup_path = f"{ARCHIVES_FILES_PATH}/logs/{logs_subfolder}/{self.unit}/{fcreation_date}/"
                os.makedirs(os.path.dirname(logs_backup_path), exist_ok=True)
                shutil.move(file, logs_backup_path)
            except Exception as e:
                # os.remove(file)
                print(f'------> {e} <------')
                continue

    def del_files(self):
        src_fpath = self.dct[f"Mutoh_{self.unit}"]
        for file in src_fpath:
            os.remove(file)


def get_last_insert(unit):
    last_db_insert = db.session.query(Mh.date).filter(
        Mh.unit == unit).first()
    if last_db_insert is None:
        return '2000-01-01 00:00:00'
    else:
        return str(last_db_insert['date'])  # 2021-05-17 11:45:25


def prepare_logs_data():
    mutoh_numbers = get_mutoh_numbers()
    each_unit_log_files = filter_unit_log_files()
    return log_files_to_dict(mutoh_numbers, each_unit_log_files)


def update_Mutoh_data():
    prepared_logs_data = prepare_logs_data()
    for unit, logs in prepared_logs_data.items():

        new_df = create_new_df(logs)
        last_db_insert = get_last_insert(unit)
        new_loc_df, new_last_db_insert = loc_new_df(
            new_df, last_db_insert, unit)
        print(f'unit {unit}')
        print(
            f'last_db_insert: {last_db_insert}  ---> new_last_db_insert: {new_last_db_insert}')
        print(f'new_df: \n{new_loc_df}')
        if not new_loc_df.empty:
            update_db = MutohDatabase()
            update_db.add_to_mutoh_details(new_loc_df)
            update_db.add_to_mutoh(new_loc_df, new_last_db_insert)
            csv_backup = CsvBackup(unit, logs, new_loc_df)
            csv_backup.save_csv_backup()
            csv_backup.moveFiles()
            # mutoh_items.del_files(mutoh_numbers[x])
