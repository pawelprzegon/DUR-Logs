from fastapi_sqlalchemy import db
from xeikon_api.models_Xeikon import Xeikon, XeikonDetails, Toner,\
    DVL, Fuser, DVLRepl, Clicks
from fastapi_sqlalchemy import db
from sqlalchemy import func
from datetime import datetime


class Database:
    def __init__(self, unit: str, data: dict) -> None:
        self.unit = unit
        self.data = data

    def change_Dt(self, dt):
        dt = datetime.strptime(dt, "%a %b %d %H:%M:%S %Y")
        return dt.strftime("%Y-%m-01")

    def change_Dt_to_date(self, dt):
        dt = datetime.strptime(dt, "%a %b %d %H:%M:%S %Y")
        return dt.strftime("%Y-%m-%d")

    def xeikon(self):
        if (exists := db.session.query(Xeikon).filter(Xeikon.unit == self.unit
                                                      ).first()):
            exists.date = self.data['last_file_datetime']
            exists.serial = self.data['serial']
            exists.suma_A3 = self.data['total_printed']
            exists.suma_gram = self.data['total_toner_all']
        else:
            xeikon_data = Xeikon(
                unit=self.unit,
                serial=self.data['serial'],
                date=self.data['last_file_datetime'],
                suma_A3=self.data['total_printed'],
                suma_gram=self.data['total_toner_all']
            )
            db.session.add(xeikon_data)
        db.session.commit()

    def xeikon_details(self):
        mY = datetime.strptime(self.change_Dt(
            self.data['last_file_datetime']), "%Y-%m-%d")
        prev_data_printed = db.session.query(func.sum(XeikonDetails.printed)).filter(XeikonDetails.unit == self.unit,
                                                                                     XeikonDetails.date < mY).first()[0]
        prev_data_toner = db.session.query(func.sum(XeikonDetails.toner)).filter(XeikonDetails.unit == self.unit,
                                                                                 XeikonDetails.date < mY).first()[0]
        if prev_data_printed is None:
            prev_data_printed = 0
        if prev_data_toner is None:
            prev_data_toner = 0
        if (exists := db.session.query(XeikonDetails).filter(XeikonDetails.unit == self.unit,
                                                             XeikonDetails.date == mY).first()):
            exists.printed = self.data['total_printed'] - prev_data_printed
            exists.toner = self.data['total_toner_all'] - prev_data_toner
        else:
            xeikon_details_data = XeikonDetails(
                unit=self.unit,
                printed=self.data['total_printed'] - prev_data_printed,
                toner=self.data['total_toner_all'] - prev_data_toner,
                date=mY,
            )
            db.session.add(xeikon_details_data)
        db.session.commit()

    def toner(self):
        mY = self.change_Dt(self.data['last_file_datetime'])
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
        for i, (k, v) in enumerate(prev_toner.items()):
            print(i, k, v)
            if v is None:
                prev_toner[k] = 0

        if (exists := db.session.query(Toner).filter(Toner.unit == self.unit, Toner.date == mY).first()):
            exists.cyan = int(self.data['toner_CMYK'].get('Cyan')) - \
                prev_toner.get('cyan')
            exists.magenta = int(self.data['toner_CMYK'].get(
                'Magenta')) - prev_toner.get('magenta')
            exists.yellow = int(self.data['toner_CMYK'].get(
                'Yellow')) - prev_toner.get('yellow')
            exists.black = int(self.data['toner_CMYK'].get(
                'Black')) - prev_toner.get('black')
            exists.white = int(self.data['toner_CMYK'].get(
                'White')) - prev_toner.get('white')
        else:
            toner_data = Toner(
                unit=self.unit,
                Cyan=int(self.data['toner_CMYK'].get(
                    'Cyan')) - prev_toner.get('cyan'),
                Magenta=int(self.data['toner_CMYK'].get('Magenta')) -
                prev_toner.get('magenta'),
                Yellow=int(self.data['toner_CMYK'].get('Yellow')) -
                prev_toner.get('yellow'),
                Black=int(self.data['toner_CMYK'].get('Black')) -
                prev_toner.get('black'),
                White=int(self.data['toner_CMYK'].get('White')) -
                prev_toner.get('white'),
                date=mY,
            )
            db.session.add(toner_data)
        db.session.commit()

    def dvl_repl(self):
        for key, value in self.data['dvl_CMYK'].items():
            if (
                exists := db.session.query(DVL.replaced_total)
                    .filter(DVL.unit == self.unit, DVL.color == key
                            ).first()
            ):
                if exists != None and exists[0] < int(value[1]):
                    dvl_repl_data = DVLRepl(
                        unit=self.unit,
                        color=key,
                        quantity=int(value[1])-exists[0],
                        date=self.data['last_file_datetime']
                    )
                    db.session.add(dvl_repl_data)
                    db.session.commit()

    def dvl(self):
        for key, value in self.data['dvl_CMYK'].items():
            if (
                exists := db.session.query(DVL).filter(DVL.unit == self.unit,
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

    def fuser(self):
        for value in self.data['fuser'].values():
            if (
                exists := db.session.query(Fuser).filter(Fuser.unit == self.unit).first()
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

    def clicks(self):
        mY = self.change_Dt(self.data['last_file_datetime'])

        prev_color = db.session.query(func.sum(Clicks.color)).filter(Clicks.unit == self.unit,
                                                                     Clicks.date < mY).first()[0]
        prev_bw = db.session.query(func.sum(Clicks.bw)).filter(Clicks.unit == self.unit,
                                                               Clicks.date < mY).first()[0]
        if prev_color is None:
            prev_color = 0
        if prev_bw is None:
            prev_bw = 0
        if (
            exists := db.session.query(Clicks).filter(Clicks.unit == self.unit, Clicks.date == mY).first()
        ):
            exists.color = self.data['clicks_color'] - prev_color
            exists.bw = self.data['clicks_BW'] - prev_bw
        else:
            clicks_data = Clicks(
                unit=self.unit,
                color=self.data['clicks_color'] - prev_color,
                bw=self.data['clicks_BW'] - prev_bw,
                date=mY
            )
            db.session.add(clicks_data)
        db.session.commit()
