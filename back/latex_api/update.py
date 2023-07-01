import os
import glob
import pandas as pd
from fastapi_sqlalchemy import db
from pandas import DataFrame
from latex_api.insert_into_db import Database
from latex_api.models_Latex import Latex
from common.csv_backup import CsvBackup

basedir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ARCHIVES_FILES_PATH: str = f"{basedir}/volumes/archiv_latex"
DATA_FOLDER: str = f"{basedir}/volumes/latex/**/*.xls"
path = r'./temp/latex.csv'


def get_CSV():
    '''getting csv file'''
    if os.path.isfile(path):
        return pd.read_csv(path, sep=';', header=0, index_col=False, parse_dates=['Printing Date'],
                           date_parser=lambda x: pd.to_datetime(x, format='%Y-%m-%d'))


def get_log_files() -> list:
    '''list with all files in directory'''
    return glob.glob(DATA_FOLDER, recursive=True)


def get_XLC_data() -> DataFrame:
    '''creates dataframe with data from all xml files'''
    new_df = pd.DataFrame()
    if files := get_log_files():
        data = [pd.read_excel(file) for file in files]
        new_df = pd.concat(data)
        new_df = new_df.drop_duplicates()
        new_df = new_df.rename(columns={
            "ColorConsumption": "Ink",
            "Job Name": "Job",
            "Total Printed Area": "Printed",
            "Printing Date": "Data",
        })
        new_df = new_df.dropna(subset=['Ink'])
        new_df = new_df.loc[:, ['Ink',
                                'Job',
                                'Printed',
                                'Data',
                                ]]
        new_df['Ink'] = new_df['Ink'].str.slice_replace(
            start=10, repl='')
        new_df[['Ink', 'Printed']] = new_df[
            ['Ink', 'Printed']].apply(pd.to_numeric)
        new_df['Data'] = pd.to_datetime(
            new_df['Data'], dayfirst=True)
        new_df.index = pd.RangeIndex(len(new_df.index))
        new_df['Unit'] = 'Latex 3100'
        new_df['Printed'] = new_df['Printed'].mask(
            new_df['Printed'].eq(0), ((new_df['Ink'].divide(18))*1000))
    return new_df


def get_old_date_job() -> dict:
    '''gets old_date and old_job query from db'''
    last_db_inserts = db.session.query(Latex).first()
    if last_db_inserts is None:
        return {'old_date': '2000-01-01 00:00:00'}
    return {'old_date': str(last_db_inserts.date),
            'old_job': str(last_db_inserts.lst_job)}


def find_new_job_index(df, old_date_job) -> int:
    '''finds in db index with criteria (find old_job in column Job)'''
    sliced_df = df[df['Job'] == old_date_job['old_job']].index
    return int(sliced_df[0]+1)


def check_date_and_index(df, new_job_index, old_date):
    sliced_df = df.iloc[new_job_index]
    return sliced_df['Data'] == old_date


def get_new_loc_df(df, old_date_job) -> DataFrame:
    '''locking dataframe with credentials (new_date and new_job if exists.
    If not df will be empty) If df empty function returns double None's.
    If df will have some data they will be grouped by Data and Unit and columns Ink and Printed will be summed'''
    if 'job' not in old_date_job:
        df = df.loc[df['Data'] > old_date_job['old_date']]
    else:
        new_job_index = find_new_job_index(df, old_date_job)
        if check := check_date_and_index(
            df, new_job_index, old_date_job['old_date']
        ):
            df = df[new_job_index:]
        else:
            df = df.loc[df['Data'] > old_date_job['date']]
    if df.empty:
        return None, None
    df_with_dt = df.copy()
    df_with_dt["Data"] = pd.to_datetime(
        df["Data"].dt.strftime('%Y-%m'))
    return (
        df_with_dt.groupby(["Data", "Unit"])[
            ["Printed", "Ink"]
        ]
        .sum()
        .reset_index()
    )


def get_new_date_job(df) -> dict:
    '''getting data from last row from columns Job and Date from dataframe'''
    new_last_db_insert = df['Data'].max()
    last_row = df.iloc[-1]
    new_last_job = last_row['Job']
    return {'new_date': new_last_db_insert, 'new_job': new_last_job}


def update_Latex_data():
    '''steps for updating with collecting data, commit into db and creating csv backup with moving files'''
    new_df = get_XLC_data()
    if new_df is not None:
        old_date_job = get_old_date_job()
        new_loc_df = get_new_loc_df(new_df, old_date_job)
        new_date_job = get_new_date_job(new_df)

        if new_loc_df is not None:
            print(
                f"old_date_job: {old_date_job['old_date']}--->new date:{new_date_job['new_date']}")

            update_db = Database(new_loc_df, new_date_job)
            update_db.add_to_latex_details()
            update_db.add_to_latex()

            csv_backup = CsvBackup(
                'Latex 3100', get_log_files(), new_loc_df, ARCHIVES_FILES_PATH)
            csv_backup.save_csv_backup()
            csv_backup.moveFiles()
