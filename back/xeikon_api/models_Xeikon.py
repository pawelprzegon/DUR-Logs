from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey, ForeignKeyConstraint, PrimaryKeyConstraint
from sqlalchemy.orm import relationship

Base = declarative_base()

'''Models for each Xeikon unit table'''


class Xeikon(Base):
    __tablename__ = "xeikon"
    id = Column(Integer, primary_key=True)
    unit = Column(String(10), nullable=False, unique=True)
    serial = Column(Integer, nullable=False)  # TUTAJ MUSI BYĆ UNIQUE
    date = Column(DateTime, nullable=False)
    suma_A3 = Column(Integer, nullable=False)
    suma_gram = Column(Integer, nullable=False)
    dvl = relationship('DVL',  backref='xeikon')
    fuser = relationship('Fuser', backref='xeikon')

    def __repr__(self):
        return f"Xeikon ({self.unit}, {self.last_raport_date}, {self.printed}, {self.dvl}, {self.fuser})"


class XeikonDetails(Base):
    __tablename__ = 'xeikon_Details'
    id = Column(Integer, primary_key=True)
    unit = Column(String(10), ForeignKey('xeikon.unit'), nullable=False,)
    printed = Column(Integer, nullable=False)
    toner = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)

    def __repr__(self):
        return f"Xeikon ({self.unit}, {self.date}, {self.printed}, {self.toner})"


class Toner(Base):
    __tablename__ = "xeikon_Toner"
    id = Column(Integer, primary_key=True)
    unit = Column(String(10), ForeignKey('xeikon.unit'), nullable=False)
    Cyan = Column(Integer, nullable=False)
    Magenta = Column(Integer, nullable=False)
    Yellow = Column(Integer, nullable=False)
    Black = Column(Integer, nullable=False)
    White = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)

    def __repr__(self):
        return f"Toner ({self.unit}, {self.cyan}, {self.magenta}, {self.yellow}, {self.black}, {self.white})"


class DVL(Base):
    __tablename__ = 'xeikon_DVL'
    __table_args__ = (PrimaryKeyConstraint(
        "unit", "color", name="DVL_unit_color"),)
    unit = Column(String(10), ForeignKey('xeikon.unit'), nullable=False)
    color = Column(String(15), nullable=False)
    current = Column(Integer, nullable=False)
    replaced_total = Column(Integer, nullable=False)
    replace_dates = relationship("DVLRepl", backref='xeikon_DVL')

    def __repr__(self):
        return f"DVL ({self.unit}, {self.color}, {self.current}, {self.replaced_total}, {self.replace_dates})"


class DVLRepl(Base):
    __tablename__ = "xeikon_DVL_Repl"
    __table_args__ = (ForeignKeyConstraint(['unit', 'color'],
                                           ['xeikon_DVL.unit', 'xeikon_DVL.color']),)
    id = Column(Integer, primary_key=True)
    unit = Column(String(10))
    color = Column(String(10), nullable=False)
    date = Column(DateTime, nullable=False)
    quantity = Column(Integer, nullable=False)

    def __repr__(self):
        return f"xeikon_DVL_Repl ({self.unit}, {self.color}, {self.date}, {self.quantity})"


class Fuser(Base):
    __tablename__ = 'xeikon_Fuser'
    id = Column(Integer, primary_key=True)
    unit = Column(String(10), ForeignKey('xeikon.unit'),
                  nullable=False, unique=True)
    current = Column(Integer, nullable=False)
    replaced_total = Column(Integer, nullable=False)

    def __repr__(self):
        return f"xeikon_Fuser ({self.unit}, {self.current}, {self.replaced_total})"


class Clicks(Base):
    __tablename__ = 'xeikon_Clicks'
    id = Column(Integer, primary_key=True)
    unit = Column(String(10), ForeignKey('xeikon.unit'), nullable=False)
    color = Column(Integer, nullable=False)
    bw = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)
