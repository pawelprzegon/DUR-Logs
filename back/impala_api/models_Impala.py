from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


'''Models for each Impala unit table'''


class Impala(Base):
    __tablename__ = "impala"
    id = Column(Integer, primary_key=True)
    unit = Column(String(20), nullable=False, unique=True)
    suma_m2 = Column(Integer, nullable=False)
    suma_ml = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)
    bearings = relationship(
        'ImpalaBearingsRepl',  backref='impala')
    filters = relationship(
        'ImpalaFiltersRepl',  backref='impala')

    def __repr__(self):
        return f"Impala ('{self.unit}', '{self.suma_m2}', '{self.suma_ml}', '{self.date}', '{self.bearings}', '{self.filters}')"


class ImpalaDetails(Base):
    __tablename__ = "impala_Details"
    id = Column(Integer, primary_key=True)
    unit = Column(String(20), nullable=False,)
    Black = Column(Float)
    Cyan = Column(Float)
    Magenta = Column(Float)
    Yellow = Column(Float)
    White = Column(Float)
    printed = Column(Float)
    ink = Column(Float)
    date = Column(Date, nullable=False)

    def __repr__(self):
        return f"Impala_all ('{self.unit}', '{self.printed}', '{self.ink}')"


class ImpalaFiltersRepl(Base):
    __tablename__ = "impala_Filters_Repl"
    id = Column(Integer, primary_key=True)
    unit = Column(String(10), ForeignKey('impala.unit'))
    date = Column(Date, nullable=False)
    color = Column(String(10), nullable=False)

    def __repr__(self):
        return f"Impala_Filters_Repl ('{self.date}')"


class ImpalaBearingsRepl(Base):
    __tablename__ = "impala_Bearings_Repl"
    id = Column(Integer, primary_key=True)
    date = Column(Date, nullable=False)
    unit = Column(String(10), ForeignKey('impala.unit'))

    def __repr__(self):
        return f"Impala_Bearings_Repl ('{self.date}')"


class ImpalaSettings(Base):
    __tablename__ = "impala_Settings"
    id = Column(Integer, primary_key=True)
    filters = Column(Integer, default=50000)
    bearings = Column(Integer, default=40000)

    def __repr__(self):
        return f"Impala_Settings ('{self.id}', '{self.filters}', '{self.bearings}')"
