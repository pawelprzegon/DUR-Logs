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
from fastapi import status, HTTPException
from mutoh_api.models_Mutoh import Mutoh as Mh
from mutoh_api.models_Mutoh import Mutoh_details as Mhd
from mutoh_api.models_Mutoh import MutohSettings as MutSet

import shutil

basedir = os.path.abspath(os.path.dirname(__file__))

@dataclass
class MutohItems:
    mutohNumbers: list = field(default_factory=list)
    tst: dict = field(default_factory=dict)
    lines: List[str] = field(init=False)
    archives_file_path: str = f"{basedir}/archives"
    incomming_file_path: str  = f"{basedir}/volumes"
    data_folder: str = f"{incomming_file_path}/**/*.log"
    

    def numbers(self):
        files = glob.glob(self.data_folder, recursive=True)
        for file in files: 
            y = file
            z = y[-21:-19]
            if z == "to": 
                z = y[-17:-15]
            elif z == "NY": 
                z = y[-24:-22]
            self.mutohNumbers.append(z) 
            self.mutohNumbers = sorted(set(self.mutohNumbers))
        return self.mutohNumbers
    
    def unitWithOwnLogs(self):
        all_log_files = glob.glob(self.data_folder, recursive=True)
        for log_file in all_log_files:
            temp = (datetime.fromtimestamp(pathlib.Path(
                log_file).stat().st_mtime)).strftime("%Y-%m-%d %H:%M:%S")
            self.tst[log_file] = temp

    def createLogFilesDict(self):
        self.dct = {f"mutoh_{i}": [] for i in self.mutohNumbers}
        for keys in self.tst: 
            y = keys 
            z = y[-21:-19]
            if z == "to": 
                z = y[-17:-15]
            elif z == "NY":
                z = y[-24:-22]
            for i in self.mutohNumbers:
                if i == z:
                    self.dct[f"mutoh_{i}"].append(keys)
    
    def createPandasDf(self, unit: str):
        last_date = db.session.query(Mh.date).filter(Mh.unit == f"Mutoh {self.mutohNumbers[unit]}").first()
        if last_date is None:
            last_date = datetime.strptime('2000-01-01 00:00:00', '%Y-%m-%d %H:%M:%S')
        else:
            last_date = last_date['date']
        print(last_date)
        self.lines = list(fileinput.FileInput(
            self.dct[f"mutoh_{self.mutohNumbers[unit]}"], encoding="ISO-8859-1"))  # read file
        self.lines = list(set(self.lines))  # remove duplicates
        # put readed data into Pandas DF
        df = pd.DataFrame({"dane": self.lines})
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
        # set column data as data value
        df["Data"] = pd.to_datetime(df["Data"], unit="s")
        # replace empty cells with "NaN" value
        df = df.replace(r"^\s*$", np.nan, regex=True)                                 #get data without rows where are "NaN" cells
        df[["Time", "Copies", "Ink", "Printed"]] = df[["Time", "Copies", "Ink", "Printed"]].apply(
            pd.to_numeric
        )  # make columns numeric
        # find empty cells in column 'Total_Ink' and put there 'Squaremeter' val*4.9
        df["Ink"].fillna((df["Printed"].mul(4.9)), inplace=True)
        df = df.loc[df['Data'] > last_date]
        df["lst_date"] = df["Data"].max()

        df = df.drop(
            [
                # "Data",
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
        df["Data"] = pd.to_datetime(df["Data"].dt.strftime('%m-%Y'))
        new_df = df.groupby(["Data","lst_date"])[
                ["Ink", "Printed"]].sum().reset_index()
        new_df["unit"] = f'Mutoh {self.mutohNumbers[unit]}'
        new_df = new_df.sort_values(by=['Data'])
        
        return new_df
    
    def moveFiles(self, unit):
        
        src_fpath = self.dct[f"mutoh_{self.mutohNumbers[unit]}"]
        dest_fpath = f'{self.archives_file_path}/mutoh_{self.mutohNumbers[unit]}/'
        
        for file in src_fpath:
            try:
                fcreation_date = self.fileName(file)
                os.makedirs(os.path.dirname(dest_fpath+fcreation_date+'/'), exist_ok=True)
                shutil.move(file, dest_fpath+fcreation_date+'/')
            except Exception:
                os.remove(file)
                continue

    def fileName(self, file):
        file_modify_date =  datetime.fromtimestamp(os.path.getmtime(file))
        return (file_modify_date.strftime("%Y_%m"))



@dataclass
class MutohDatabase:
    def add_to_db(self, new_data: dict):
        # create sql connection to database
        conn = sqlite3.connect("mutoh_db.db")
        for key, value in new_data.items():
            # create sql cursor
            table = f"mutoh_{str(key)}"
            value.to_sql(
                table, conn, if_exists="append", index=False, chunksize=500, method="multi"
            )  # send data into database
            c = conn.cursor()
            c.execute(
                f"DELETE FROM {table} where rowid not in (select min(rowid) from {table} group by Data,Total_Ink,Squaremeter)"
            )
            conn.commit()
        conn.close()  # close sql connection

    def add_all_to_db_by_month(self, new_data):
        new_data.Ink = new_data.Ink.round()
        new_data.Printed = new_data.Printed.round()
        for index, row in new_data.iterrows():
            mutoh_data = Mhd(
                unit=row["unit"],
                ink=row["Ink"],
                printed=row["Printed"],
                lst_date=row["lst_date"],
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
        exists.lst_date = row["lst_date"]

    def add_sums_to_db_all(self, new_df) -> dict:
        unit = (new_df["unit"].unique())[0]
        target = target.target if (target := db.session.query(MutSet).first()) else 1
        mutoh_data = {}
        try:
            preparedData = self.sumData(new_df)
            self._insertIntoDB(preparedData, unit, mutoh_data, target)

        except IndexError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=e.orig.args,
            ) from e

    def sumData(self, new_df) -> dict:
        suma_m2 = new_df.sum(numeric_only=True)["Printed"]
        suma_ml = new_df.sum(numeric_only=True)["Ink"]
        lst_date = new_df.iloc[-1]["lst_date"]
        
        return {'suma_m2': suma_m2, 
                'suma_ml': suma_ml,
                'date': lst_date
                }

    def _insertIntoDB(self, preparedData, unit, mutoh_data, target):
        
        if (
            exists := db.session.query(Mh).filter(Mh.unit == str(unit)).first()
        ):
            exists.suma_m2 += int(preparedData.get('suma_m2'))
            exists.suma_ml += int(preparedData.get('suma_ml'))
            exists.lst_date = preparedData.get('date')
            exists.target_reached = round(exists.suma_m2/target, 2)*100
        else:
            mutoh_data[unit] = Mh(
            unit = str(unit),
            suma_m2 = int(preparedData.get('suma_m2')),
            suma_ml = int(preparedData.get('suma_ml')),
            date = preparedData.get('date'),
            target_reached = round(int(preparedData.get('suma_m2'))/target, 2)*100,
            )
            db.session.add(mutoh_data[unit])
            
        db.session.commit()

    def update(self):
        mutoh_items = MutohItems()
        mutoh_numbers = mutoh_items.numbers()
        mutoh_items.unitWithOwnLogs()
        mutoh_items.createLogFilesDict()
        
        print(mutoh_numbers)

        for x in range(len(mutoh_numbers)):
            print(mutoh_numbers[x])
            new_df = mutoh_items.createPandasDf(x)
            print(new_df)
            if not new_df.empty:
                self.add_all_to_db_by_month(new_df)
                self.add_sums_to_db_all(new_df)
        

