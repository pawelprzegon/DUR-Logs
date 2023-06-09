from sqlalchemy import Column, Integer, String, DateTime, Date
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

'''Models for each Mutoh unit table'''


class Mutoh(Base):
    __tablename__ = "mutoh"
    id = Column(Integer, primary_key=True)
    unit = Column(String(15), nullable=False, unique=True)
    sn = Column(String(20), nullable=False, default="xx-xxx0000")
    suma_m2 = Column(Integer, nullable=False)
    suma_ml = Column(Integer, nullable=False)
    date = Column(DateTime, nullable=False)
    target_reached = Column(Integer, nullable=False)

    def __repr__(self):
        return f"Mutoh ({self.unit}, {self.sn}, {self.suma_m2}, {self.suma_ml}, {self.date}, {self.target_reached})"


class MutohDetails(Base):
    __tablename__ = "mutoh_Details"
    id = Column(Integer, primary_key=True)
    unit = Column(String(15), nullable=False, unique=False)
    printed = Column(Integer, nullable=False)
    ink = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)
    # lst_date = Column(DateTime, nullable=False)

    def __repr__(self):
        return f"Mutoh ({self.unit}, {self.printed}, {self.ink}, {self.date})"


class MutohSettings(Base):
    __tablename__ = "mutoh_Settings"
    id = Column(Integer, primary_key=True)
    target = Column(Integer, default=19000)

    def __repr__(self):
        return f"FiltersRepl ('{self.id}', '{self.target}')"
