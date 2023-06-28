from latex_api.models_Latex import Latex, LatexDetails
from pandas import DataFrame
from db import get_session


class Database:
    def __init__(self, df: DataFrame, new_date_job: dict) -> None:
        self.df = df
        self.new_date_job = new_date_job

    def add_to_latex_details(self):
        with get_session() as session:
            for index, row in self.df.iterrows():
                if (
                    exists := session.query(LatexDetails).filter(LatexDetails.date == row["Data"]).first()
                ):
                    exists.printed += row['Printed']
                    exists.ink += row['Ink']*1000
                else:
                    latex_data = LatexDetails(
                        unit=row['Unit'],
                        printed=row['Printed'],
                        ink=row['Ink']*1000,
                        date=row['Data']
                    )
                    session.add(latex_data)
                session.commit()

    def add_to_latex(self):
        summed_df = self.sum_df()
        with get_session() as session:
            if (exists := session.query(Latex).first()):
                exists.suma_m2 += int(summed_df['Printed'])
                exists.suma_ml += int(summed_df['Ink'])
                exists.date = self.new_date_job['new_date']
                exists.lst_job = self.new_date_job['new_job']
            else:
                latex_data = Latex(
                    unit='Latex 3100',
                    suma_m2=int(summed_df['Printed']),
                    suma_ml=int(summed_df['Ink']*1000),
                    date=self.new_date_job['new_date'],
                    lst_job=self.new_date_job['new_job'],
                )
                session.add(latex_data)
            session.commit()

    def sum_df(self):
        return self.df.groupby([
            'Unit']).sum(["Ink", "Printed"]).reset_index()
