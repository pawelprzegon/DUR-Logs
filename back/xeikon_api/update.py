import os.path
import time
import glob
import zipfile
from xeikon_api.insert_into_db import Database
from common.csv_backup import CsvBackup
import pandas as pd

basedir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ARCHIVES_FILES_PATH: str = f"{basedir}/volumes/archiv_xeikon"
DATA_FOLDER: str = f"{basedir}/volumes/xeikon/"
DIRECTORY = ['Xeikon 1', 'Xeikon 2', 'Xeikon 3']


def get_last_log_file(unit):
    '''getting oldest file from directory'''
    data_folder = f"{DATA_FOLDER}/{unit}/**/*.zip"
    all_zip_files = glob.glob(data_folder, recursive=True)
    return max(all_zip_files)


def unzip(last_file):
    '''unziping file and execute get_data function'''
    last_file_datetime = time.ctime(os.path.getmtime(last_file))
    with zipfile.ZipFile(last_file, 'r') as archive:
        with archive.open('Application/Reports/Statistics.csv') as csv_file:
            data = get_data(csv_file, last_file_datetime)
    return data


def get_data(csv_file, last_file_datetime):
    '''filtering credential data form last file into dict'''
    data = {'last_file_datetime': last_file_datetime}
    toner_CMYK = {}
    dvl_CMYK = {}
    fuser = {}
    total_toner_all: int = 0
    trigTONER = 0
    trigDVL = 0
    for row in csv_file:
        row = row.decode('utf-8')
        result = row.split('";"')
        if row.startswith('"Computer name:"'):
            data['computer_name'] = result[1][:-3]
        elif row.startswith('"Serial number:"'):
            data['serial'] = int(result[1][:-3])
        elif row.startswith('"Total Printed:"'):
            data['total_printed'] = int(result[1])
        elif row.startswith('"Color:"'):
            data['clicks_color'] = int(result[1])
        elif row.startswith('"Black and White:"'):
            data['clicks_BW'] = int(result[1])
        elif (row.startswith('"Cyan:') and trigTONER < 5) or \
            (row.startswith('"Magenta:') and trigTONER < 5) or \
            (row.startswith('"Yellow:') and trigTONER < 5) or \
            (row.startswith('"Black:') and trigTONER < 5) or \
                (row.startswith('"XeikonWhite:') and trigTONER < 5):
            if (result[0][1:-1]) == 'XeikonWhite':
                toner_CMYK[result[0][7:-1]] = result[1]
            else:
                toner_CMYK[result[0][1:-1]] = result[1]
            total_toner_all += int(result[1])
            trigTONER += 1
        elif (row.startswith('"X0 (XeikonWhite)') and trigDVL < 5) or \
            (row.startswith('"X1 (Yellow)') and trigDVL < 5) or \
            (row.startswith('"X2 (Cyan)') and trigDVL < 5) or \
            (row.startswith('"X3 (Magenta)') and trigDVL < 5) or \
                (row.startswith('"X4 (Black)') and trigDVL < 5):
            if (result[0][5:-1]) == 'XeikonWhite':
                dvl_CMYK[result[0][11:-1]] = [result[2], result[3]]
            else:
                dvl_CMYK[result[0][5:-1]] = [result[2], result[3]]
            trigDVL += 1
        elif row.startswith('"Standard Fusing Roller:'):
            fuser[result[0][1:]] = [result[2], result[3]]
        data['toner_CMYK'] = toner_CMYK
        data['dvl_CMYK'] = dvl_CMYK
        data['fuser'] = fuser
        data['total_toner_all'] = total_toner_all
    return data


def create_df(data):
    '''creating pandas dataframe form dict'''
    df = pd.DataFrame.from_dict(
        data, orient='index', columns=['value'])
    first_column = df.index
    df.insert(0, 'elements', first_column)
    return df


def update_xeikon_data():
    '''steps for updating with collecting data, commit into db and creating csv backup with moving files'''
    for unit in DIRECTORY:
        print(unit)
        last_file = get_last_log_file(unit)
        data = unzip(last_file)
        for k, v in data.items():
            print(k, v)
        update_db = Database(unit, data)
        update_db.xeikon()
        update_db.xeikon_details()
        update_db.toner()
        update_db.dvl_repl()
        update_db.dvl()
        update_db.fuser()
        update_db.clicks()

        df = create_df(data)
        csv_backup = CsvBackup(
            unit, [last_file], df, ARCHIVES_FILES_PATH)
        csv_backup.save_csv_backup()
        csv_backup.moveFiles()
