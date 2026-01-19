from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Laudo(Base):
    __tablename__ = "laudo"
    id = Column(Integer, primary_key=True)
    titulo = Column(String(255))
    conteudo = Column(Text)
    status = Column(String(50), nullable=False)
    data_criacao = Column(DateTime, default=datetime.utcnow)
    data_atualizacao = Column(DateTime)
    audios = relationship("Audio", cascade="all, delete")
    exames = relationship("Exame", cascade="all, delete")

class Audio(Base):
    __tablename__ = "audio"
    id = Column(Integer, primary_key=True)
    laudo_id = Column(Integer, ForeignKey("laudo.id"))
    caminho_arquivo = Column(Text)
    duracao = Column(Integer)
    data_upload = Column(DateTime, default=datetime.utcnow)

class Exame(Base):
    __tablename__ = "exame"
    id = Column(Integer, primary_key=True)
    laudo_id = Column(Integer, ForeignKey("laudo.id"))
    tipo_arquivo = Column(String(20))
    caminho_arquivo = Column(Text)
    data_upload = Column(DateTime, default=datetime.utcnow)
