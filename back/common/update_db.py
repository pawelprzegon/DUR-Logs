from mutoh_api.models_Mutoh import MutohSettings as MutSet
from fastapi_sqlalchemy import db
import pandas as pd
from pandas import DataFrame
from db import engine


class MutohDatabase:
    def __init__(self, df: DataFrame, last_inserts: dict) -> None:
        self.df = df
        self.new_last_db_insert = last_inserts

    def add_to_mutoh_details(self):
        with engine.begin() as connection:
            old_df = pd.read_sql('mutoh_Details', con=connection)

        merged_df = pd.concat(
            [old_df, self.df]).drop_duplicates().reset_index(drop=True)
        merged_df = merged_df.groupby([
            'unit', 'Data']).sum(["Ink", "Printed"]).reset_index()
        print(merged_df)
        with engine.begin() as connection:
            merged_df.to_sql('mutoh_Details', con=connection,
                             if_exists='replace', index=False)

    def add_to_mutoh(self) -> dict:
        self.prepare_summed_data()
        self._insertIntoDB()

    def prepare_summed_data(self):
        self.summed_df = self.df.groupby([
            'unit']).sum(["Ink", "Printed"]).reset_index()

        self.summed_df = self.summed_df.rename(
            columns={"Ink": "suma_ml", "Printed": "suma_m2"})
        self.summed_df = self.summed_df.round({'suma_ml': 0, 'suma_m2': 0})
        # self.last_inserts

        target = target.target if (
            target := db.session.query(MutSet).first()) else 1
        self.summed_df['target_reached'] = round(
            self.summed_df['suma_m2']/target, 2)*100
        # print(self.summed_df)

    def _insertIntoDB(self):
        with engine.begin() as connection:
            old_df = pd.read_sql('mutoh', con=connection)
        merged_df = pd.concat([old_df, self.summed_df]
                              ).drop_duplicates().reset_index(drop=True)
        merged_df = merged_df.groupby(['unit']).sum(
            ["suma_m2", "suma_ml"]).reset_index()
        merged_df['date'] = pd.to_datetime(
            '2023-01-01', format='%Y-%m-%d')
        merged_df['sn'] = 'xc-asfdg44444'
        merged_df = merged_df.drop(['id'], axis=1)
        print(merged_df)
        with engine.begin() as connection:
            merged_df.to_sql('test', con=connection,
                             if_exists='replace', index=False)
        with engine.begin() as connection:
            merged_df.to_sql('mutoh', con=connection,
                             if_exists='replace', index=False)
