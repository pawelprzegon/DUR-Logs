from mutoh_api.models_Mutoh import MutohSettings as MutSet
from mutoh_api.models_Mutoh import MutohDetails as MutDet
from mutoh_api.models_Mutoh import Mutoh as Mh
from fastapi_sqlalchemy import db
from pandas import DataFrame


class Database:
    def __init__(self, df: DataFrame, new_last_db_insert: dict) -> None:
        self.df = df
        self.new_last_db_insert = new_last_db_insert

    def add_to_mutoh_details(self):
        '''commit data into mutoh details table in db'''
        for index, row in self.df.iterrows():
            if (
                exists := db.session.query(MutDet)
                .filter(MutDet.unit == row["unit"], MutDet.date == row["Data"])
                .first()
            ):
                exists.unit = row["unit"]
                exists.ink += row["Ink"]
                exists.printed += row["Printed"]
            else:
                mutoh_data = MutDet(
                    unit=row["unit"],
                    ink=row["Ink"],
                    printed=row["Printed"],
                    date=row["Data"],
                )
                db.session.add(mutoh_data)
            db.session.commit()

    def add_to_mutoh(self) -> dict:
        '''commit data into mutoh table in db'''
        unit_summed_df = self.prepare_data()
        mutoh_data = {}
        for index, row in unit_summed_df.iterrows():
            if (
                exists := db.session.query(Mh).filter(Mh.unit == row["unit"]).first()
            ):
                exists.suma_m2 += int(row["suma_m2"])
                exists.suma_ml += int(row["suma_ml"])
                exists.date = row["date"]
                exists.target_reached = self.calculate_target_reached(
                    exists.suma_m2 + int(row["suma_m2"]))
            else:
                mutoh_data[row["unit"]] = Mh(
                    unit=str(row["unit"]),
                    suma_m2=int(row["suma_m2"]),
                    suma_ml=int(row["suma_ml"]),
                    date=row["date"],
                    target_reached=self.calculate_target_reached(
                        int(row["suma_m2"])),
                )
                db.session.add(mutoh_data[row["unit"]])
            db.session.commit()

    def prepare_data(self) -> DataFrame:
        '''grouping dataframe by unit and suming ink and printed columns'''
        unit_summed_df = self.df.groupby([
            'unit']).sum(["Ink", "Printed"]).reset_index()

        unit_summed_df = unit_summed_df.rename(
            columns={"Ink": "suma_ml", "Printed": "suma_m2"})
        unit_summed_df = unit_summed_df.round({'suma_ml': 0, 'suma_m2': 0})
        unit_summed_df['date'] = unit_summed_df['unit'].map(
            self.new_last_db_insert)
        # self.last_inserts
        return unit_summed_df

    def calculate_target_reached(self, suma_m2):
        '''for each row in db calculating new target reached'''
        target = target.target if (
            target := db.session.query(MutSet).first()) else 1
        return round(suma_m2/target, 2)*100
