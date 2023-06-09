import os.path, time
import glob
import zipfile
from fastapi_sqlalchemy import db
from xeikon_api.models_Xeikon import Xeikon, Xeikon_Details,Toner,\
                                    DVL, Fuser, DVL_Repl, Clicks
from datetime import datetime
from sqlalchemy import func


basedir = os.path.abspath(os.path.dirname(__file__))

class XeikonDatabase:
    def __init__(self, unit) -> None:
        self.unit = unit
        self.newestFile: str
        self.lastFileDateTime: str
        self.computer_name: str
        self.serial: str
        self.total_printed: int
        self.total_toner_all: int = 0
        self.clicks_color: int
        self.clicks_BW: int
        self.toner_CMYK = {}
        self.dvl_CMYK = {}
        self.fuser = {}
        

    def changeDt(self, dt):
        dt = datetime.strptime(dt, "%a %b %d %H:%M:%S %Y")
        return dt.strftime("%Y-%m-01")
    
    def changeDtToDate(self, dt):
        dt = datetime.strptime(dt, "%a %b %d %H:%M:%S %Y")
        return dt.strftime("%Y-%m-%d")
        
    def fundLatestFile(self):
        file_path = f"{basedir}/volumes/{self.unit}"
        data_folder = f"{file_path}/**/*.zip"
        all_zip_files = glob.glob(data_folder, recursive=True)
        lastFile = max(all_zip_files)
        self.lastFileDateTime = time.ctime(os.path.getmtime(lastFile))
        self.newestFile = lastFile
        print(self.newestFile)
    
    def unzip(self):
        with zipfile.ZipFile(self.newestFile, 'r') as archive:
            with archive.open('Application/Reports/Statistics.csv') as csvRaport:
                self.getData(csvRaport)
            csvRaport.close()
        archive.close()
        
    def getData(self, csvRaport):
        trigTONER = 0
        trigDVL = 0
        for row in csvRaport:
            row = row.decode('utf-8')
            result = row.split('";"')
            if row.startswith('"Computer name:"'): self.computer_name = result[1]
            elif row.startswith('"Serial number:"'): self.serial = int(result[1][:-3])
            elif row.startswith('"Total Printed:"'): self.total_printed = int(result[1])
            elif row.startswith('"Color:"'): self.clicks_color = int(result[1])
            elif row.startswith('"Black and White:"'): self.clicks_BW = int(result[1])
            elif (row.startswith('"Cyan:') and trigTONER < 5) or \
                (row.startswith('"Magenta:') and trigTONER < 5) or \
                (row.startswith('"Yellow:') and trigTONER < 5) or \
                (row.startswith('"Black:') and trigTONER < 5) or \
                (row.startswith('"XeikonWhite:') and trigTONER < 5) :
                    if (result[0][1:-1]) == 'XeikonWhite':
                        self.toner_CMYK[result[0][7:-1]] = result[1]
                    else: 
                        self.toner_CMYK[result[0][1:-1]] = result[1]
                    self.total_toner_all += int(result[1])
                    trigTONER +=1
            elif (row.startswith('"X0 (XeikonWhite)') and trigDVL < 5) or \
                (row.startswith('"X1 (Yellow)') and trigDVL < 5) or \
                (row.startswith('"X2 (Cyan)') and trigDVL < 5) or \
                (row.startswith('"X3 (Magenta)') and trigDVL < 5) or \
                (row.startswith('"X4 (Black)') and trigDVL < 5):
                    if (result[0][5:-1])=='XeikonWhite':
                        self.dvl_CMYK[result[0][11:-1]] = [result[2], result[3]]
                    else:
                        self.dvl_CMYK[result[0][5:-1]] = [result[2], result[3]]
                    trigDVL +=1
            elif row.startswith('"Standard Fusing Roller:'):
                self.fuser[result[0][1:]] = [result[2],result[3]]

                         
    def Xeikon(self):
        if (exists:=db.session.query(Xeikon).filter(Xeikon.unit == self.unit
                                                    ).first()):
                exists.date = self.lastFileDateTime
                exists.serial = self.serial
                exists.suma_A3 = self.total_printed
                exists.suma_gram = self.total_toner_all
        else:
            xeikon_data = Xeikon(
                unit=self.unit,
                serial=self.serial,
                date=self.lastFileDateTime,
                suma_A3=self.total_printed,
                suma_gram=self.total_toner_all
            )
            db.session.add(xeikon_data)
        db.session.commit()
    
    def XeikonDetails(self):
        mY = datetime.strptime(self.changeDt(self.lastFileDateTime), "%Y-%m-%d")
        prev_data_printed = db.session.query(func.sum(Xeikon_Details.printed)).filter(Xeikon_Details.unit == self.unit, 
                                                                               Xeikon_Details.date < mY).first()[0]
        prev_data_toner = db.session.query(func.sum(Xeikon_Details.toner)).filter(Xeikon_Details.unit == self.unit, 
                                                                               Xeikon_Details.date < mY).first()[0]
        if prev_data_printed is None:
            prev_data_printed = 0
        if prev_data_toner is None:
            prev_data_toner = 0
        if (exists:=db.session.query(Xeikon_Details).filter(Xeikon_Details.unit == self.unit, 
                                                             Xeikon_Details.date == mY).first()):
            exists.printed = self.total_printed - prev_data_printed
            exists.toner = self.total_toner_all - prev_data_toner
        else:
            xeikon_details_data = Xeikon_Details(
                unit=self.unit,
                printed=self.total_printed - prev_data_printed,
                toner=self.total_toner_all - prev_data_toner,
                date=mY,
            )
            db.session.add(xeikon_details_data)
        db.session.commit()
    
        
    def Toner(self):
        mY = self.changeDt(self.lastFileDateTime)
        prev_toner = {
            'cyan':
                db.session.query(func.sum(Toner.Cyan))
                .filter(Toner.unit == self.unit, Toner.date <= mY)
                .first()[0],
            'magenta':
                db.session.query(func.sum(Toner.Magenta))
                .filter(Toner.unit == self.unit, Toner.date <= mY)
                .first()[0],
            'yellow':
                db.session.query(func.sum(Toner.Yellow))
                .filter(Toner.unit == self.unit, Toner.date <= mY)
                .first()[0],
            'black':
                db.session.query(func.sum(Toner.Black))
                .filter(Toner.unit == self.unit, Toner.date <= mY)
                .first()[0],
            'white':
                db.session.query(func.sum(Toner.White))
                .filter(Toner.unit == self.unit, Toner.date <= mY)
                .first()[0],
        }
        for i ,(k,v) in enumerate(prev_toner.items()):
            print(i, k, v)
            if v is None:
                prev_toner[k] = 0

        if (exists:=db.session.query(Toner).filter(Toner.unit == self.unit, Toner.date == mY).first()):
                exists.cyan = int(self.toner_CMYK.get('Cyan')) - prev_toner.get('cyan')
                exists.magenta = int(self.toner_CMYK.get('Magenta')) - prev_toner.get('magenta')
                exists.yellow = int(self.toner_CMYK.get('Yellow')) - prev_toner.get('yellow')
                exists.black = int(self.toner_CMYK.get('Black')) - prev_toner.get('black')
                exists.white = int(self.toner_CMYK.get('White')) - prev_toner.get('white')
        else:
            toner_data = Toner(
                unit=self.unit,
                Cyan=int(self.toner_CMYK.get('Cyan')) - prev_toner.get('cyan'),
                Magenta=int(self.toner_CMYK.get('Magenta')) - prev_toner.get('magenta'),
                Yellow=int(self.toner_CMYK.get('Yellow')) - prev_toner.get('yellow'),
                Black=int(self.toner_CMYK.get('Black')) - prev_toner.get('black'),
                White=int(self.toner_CMYK.get('White')) - prev_toner.get('white'),
                date=mY,
            )
            db.session.add(toner_data)
        db.session.commit()

          
    def DVL_Repl(self):
        for key,value in self.dvl_CMYK.items():
            if (
                exists := db.session.query(DVL.replaced_total)
                    .filter(DVL.unit == self.unit
                            ,DVL.color == key
                            ).first()
            ):
                if exists != None and exists[0] < int(value[1]):
                    dvl_repl_data = DVL_Repl(
                        unit=self.unit,
                        color=key,
                        quantity=int(value[1])-exists[0],
                        date=self.lastFileDateTime
                    )
                    db.session.add(dvl_repl_data)
                    db.session.commit()
                
    def DVL(self):
        for key, value in self.dvl_CMYK.items():
            if (
                exists:=db.session.query(DVL).filter(DVL.unit == self.unit, 
                                                     DVL.color == key).first()
            ):
                exists.current = value[0]
                exists.replaced_total = value[1]
            else:
                dvl_data = DVL(
                    unit=self.unit,
                    color=key,
                    current=value[0],
                    replaced_total=value[1],
                )
                db.session.add(dvl_data)
            db.session.commit()
    
    
    def Fuser(self):
        for value in self.fuser.values(): 
            if(
                exists:=db.session.query(Fuser).filter(Fuser.unit == self.unit).first()
            ):
                exists.current = value[0]
                exists.replaced_total = value[1]     
            else:
                fuser_data = Fuser(
                    unit=self.unit,
                    current=value[0],
                    replaced_total=value[1],
                )
                db.session.add(fuser_data)
            db.session.commit()
            
    def Clicks(self):
        mY = self.changeDt(self.lastFileDateTime)
        
        prev_color = db.session.query(func.sum(Clicks.color)).filter(Clicks.unit == self.unit,
                                                                      Clicks.date < mY).first()[0]
        prev_bw = db.session.query(func.sum(Clicks.bw)).filter(Clicks.unit == self.unit,
                                                                      Clicks.date < mY).first()[0]
        if prev_color is None:
            prev_color = 0
        if prev_bw is None:
            prev_bw = 0
        if (
            exists:=db.session.query(Clicks).filter(Clicks.unit == self.unit, Clicks.date == mY).first()
        ):
            exists.color = self.clicks_color - prev_color
            exists.bw = self.clicks_BW - prev_bw
        else:
            clicks_data = Clicks(
                unit=self.unit,
                color=self.clicks_color - prev_color,
                bw=self.clicks_BW - prev_bw,
                date=mY
            )
            db.session.add(clicks_data)
        db.session.commit()
    
    def update(self):
        self.fundLatestFile()
        self.unzip()
        self.Xeikon()
        self.XeikonDetails()
        self.Toner()
        self.DVL_Repl()
        self.DVL()
        self.Fuser()
        self.Clicks()
