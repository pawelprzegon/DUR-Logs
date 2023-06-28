from impala_api.models_Impala import Impala as Imp
from impala_api.models_Impala import ImpalaDetails as Impd
from fastapi_sqlalchemy import db
from pandas import DataFrame
from sqlalchemy import func
from datetime import date


class Database:
    def __init__(self, df: DataFrame, unit: str) -> None:
        self.df = df
        self.unit = unit

    def assign_data(self, row, exists):
        exists.unit = row["unit"]
        exists.Black = row["Black"]
        exists.Cyan = row["Cyan"]
        exists.Magenta = row["Magenta"]
        exists.Yellow = row["Yellow"]
        exists.White = row["White"]
        exists.Squaremeter = row["Squaremeter"]
        exists.Total_Ink = row["Total_Ink"]
        exists.date = row["date"]

    def add_all_to_db_by_month(self):
        for index, row in self.df.iterrows():
            if (
                exists := db.session.query(Impd)
                .filter(Impd.unit == str(row["unit"]), Impd.date == row["date"])
                .first()
            ):
                self.assign_data(row, exists)
            else:
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
                db.session.add(impala_data)
            db.session.commit()

    def new_summ_all(self):
        summed_data = db.session.query(func.sum(Impd.printed).label('sum_printed'), func.sum(
            Impd.ink).label('sum_ink')).filter(Impd.unit == self.unit).first()
        if (
            exists := db.session.query(Imp).filter(Imp.unit == self.unit).first()
        ):
            exists.suma_m2 = int(summed_data.sum_printed)
            exists.suma_ml = int(summed_data.sum_ink)
            exists.date = date.today()
        else:
            impala_data = Imp(
                unit=self.unit,
                suma_m2=int(summed_data.sum_printed),
                suma_ml=int(summed_data.sum_ink),
                date=date.today()
            )
            db.session.add(impala_data)
        db.session.commit()
