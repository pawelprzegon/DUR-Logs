from sqlalchemy import Column, Integer, String, Date, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Latex(Base):
    __tablename__ = 'latex'
    id = Column(Integer, primary_key=True)
    unit = Column(String(20), nullable=False)
    suma_m2 = Column(Integer, nullable=False)
    suma_ml = Column(Integer, nullable=False)
    date = Column(DateTime, nullable=False)
    lst_job = Column(String)

    def __repr__(self):
        return f"Latex ('{self.unit}, {self.suma_m2}, {self.suma_ml}, {self.date}')"


class Latex_details(Base):
    __tablename__ = "latex_Details"
    id = Column(Integer, primary_key=True)
    unit = Column(String(20), nullable=False)
    printed = Column(Integer, nullable=False)
    ink = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)

    def __repr__(self):
        return f"Latex_all ('{self.unit}, {self.printed}, {self.ink}, {self.date}')"
