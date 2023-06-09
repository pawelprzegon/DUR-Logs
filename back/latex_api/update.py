import os
import glob
from latex_api.models_Latex import Latex
import pandas as pd
from datetime import datetime
from db import get_session 
from sqlalchemy.sql import func

basedir = os.path.abspath(os.path.dirname(__file__))
incomming_file_path: str  = f"{basedir}/volumes"
data_folder: str = f"{incomming_file_path}/**/*.xls"
path = r'./temp/latex.csv'

def get_CSV():
    if os.path.isfile(path):
        return pd.read_csv (path, sep=';', header=0, index_col=False, parse_dates=['Printing Date'], 
                        date_parser=lambda x: pd.to_datetime(x, format='%Y-%m-%d'))
    
def get_XLC():
    files = glob.glob(data_folder, recursive=True)
    new_df = pd.DataFrame()
    data = [pd.read_excel(file) for file in files]
    new_df = pd.concat(data)
    new_df = new_df.drop_duplicates()
    new_df = new_df.dropna(subset=['ColorConsumption'])
    new_df = new_df.loc[:,['ColorConsumption', 
                    'Job Name' ,
                    'Total Printed Area', 
                    'Printing Date',
                    ]]
    new_df['ColorConsumption'] = new_df['ColorConsumption'].str.slice_replace(start=10, repl='')
    new_df[['ColorConsumption', 'Total Printed Area']]=new_df[
        ['ColorConsumption', 'Total Printed Area']].apply(pd.to_numeric)
    new_df['Printing Date'] = pd.to_datetime(new_df['Printing Date'], dayfirst=True)
    new_df.index = pd.RangeIndex(len(new_df.index))
    return new_df
    
def update_CSV():  
    current_data = get_CSV()
    new_df = get_XLC()
    
    if current_data is None:
        last_data = datetime.strptime('2000-01-01', '%Y-%m-%d')
    else:
        last_data = [current_data.iloc[-1]['Printing Date'].date(), current_data.iloc[-1]['Job Name']]
        
    df = pd.concat([new_df, current_data])
    df = df.drop_duplicates()

    if os.path.isfile(path):
        os.remove(path)
        
    df.to_csv(path, sep=';', header='true', index=False, date_format='%Y-%m-%d')
    return df, last_data

def get_new_data(df, last_data):
    
    # df["date"] = pd.to_datetime(df["Printing Date"].dt.strftime('%m-%Y'))
    print(last_data)
    print(df)
    if isinstance(last_data, list):
        date = last_data[0]
        file = last_data[1]
        #TODO wyfiltrować poprawnie ostatni element
        df = df.loc[(df['Printing Date'] > str(date)) & (df['Job Name'] ),[
                        'ColorConsumption',  
                        'Total Printed Area', 
                        'Printing Date',
                        ]]


    return df

def insert_Into_Latex_Db(new_data):
    print(new_data)
    ink_liters = new_data['ColorConsumption'].sum()
    m2 = new_data['Total Printed Area'].sum()
    new_data['ColorConsumption'] = new_data['ColorConsumption'].round()
    new_data['Total Printed Area'] = new_data['Total Printed Area'].round()
    last_date = new_data["Printing Date"].max()
    with get_session() as session:
        if (exists := session.query(Latex).first()):
            exists.suma_m2 += int(m2)
            exists.suma_ml += int(ink_liters*1000)
            exists.date=last_date
        else:
            data = Latex(
                unit='Latex L3100',
                suma_m2=int(m2),
                suma_ml=int(ink_liters*1000),
                date=last_date
            )
            session.add(data)
        session.commit()
        
def update():
    df, last_data = update_CSV()
    new_data = get_new_data(df, last_data)
    insert_Into_Latex_Db(new_data)
    