import os
import shutil
import pandas as pd
from pandas import DataFrame
from datetime import datetime


class CsvBackup:
    def __init__(self, unit: str, logs: list, new_df: DataFrame, save_path: str) -> None:
        self.unit = unit
        self.logs = logs
        self.new_df = new_df
        self.save_path = save_path
        self.backup_file = f'{self.save_path}/mutoh_{self.unit}.csv'

    def get_CSV(self):
        if os.path.isfile(self.backup_file):
            return pd.read_csv(self.backup_file, header=0, index_col=False, parse_dates=['Data'])

    def remove_CSV(self):
        if os.path.isfile(self.backup_file):
            os.remove(self.backup_file)

    def save_csv_backup(self):
        print(self.unit)
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
        for file in self.logs:
            try:
                fcreation_date = self.fileName(file)
                logs_subfolder = (os.path.dirname(file)).split('/')
                logs_subfolder = logs_subfolder[-1]
                logs_backup_path = f"{self.save_path}/logs/{logs_subfolder}/{self.unit}/{fcreation_date}/"
                os.makedirs(os.path.dirname(logs_backup_path), exist_ok=True)
                shutil.move(file, logs_backup_path)
            except Exception as e:
                # os.remove(file)
                print(e)
                continue

    def del_files(self):
        src_fpath = self.dct[f"Mutoh_{self.unit}"]
        for file in src_fpath:
            os.remove(file)
