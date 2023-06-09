import sys
import subprocess
import os
from io import StringIO
import pandas as pd
import numpy as np
from impala_api.models_Impala import Impala as Imp
from impala_api.models_Impala import Impala_details as Impd
from fastapi_sqlalchemy import db



VERBOSE = True


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


def sort_multiply_data(df, unit_number):
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


def add_sums_to_db_all() -> dict:
    impala_data = {}  # create dictionary with each mutoh sum of m2 and ink
    try:
        from dotenv import load_dotenv
        from sqlalchemy import create_engine

        load_dotenv(".env")
        SQLALCHEMY_DATABASE_URL = os.environ["DATABASE_URL"]
        engine = create_engine(SQLALCHEMY_DATABASE_URL)
        import sqlalchemy as dbs

        # engine = db.create_engine("postgresql://docker:docker@database:5432/mutoh")

        df = pd.read_sql_query(
            sql=dbs.select(
                [
                    Impd.unit,
                    Impd.printed,
                    Impd.ink,
                    Impd.date
                ]
            ),
            con=engine,
        )
        df2 = df["unit"].unique()
        for unit in df2:
            suma_m2 = df[df["unit"] == unit].sum(numeric_only=True)["printed"]
            suma_ml = df[df["unit"] == unit].sum(numeric_only=True)["ink"]
            date = df[df["unit"] == unit].max()["date"]

            impala_data = Imp(
                unit=str(unit),
                suma_m2=int(suma_m2),
                suma_ml=int(suma_ml),
                date=date
            )

            if (
                exists := db.session.query(Imp).filter(Imp.unit == str(unit)).first()
            ):
                exists.suma_m2 = int(suma_m2)
                exists.suma_ml = int(suma_ml)
                exists.date = date
            else:
                db.session.add(impala_data)
            db.session.commit()

    except IndexError:
        impala_data = [0, 0, 0, 0]
        return impala_data


def update():
    for _ in range(1, 5):
        db = mdb_to_pandas(f"/app/impala_api/volumes/AmberDB_{_}.mdb")
        db = sort_multiply_data(db, _)
        add_all_to_db_by_month(db)
    add_sums_to_db_all()



