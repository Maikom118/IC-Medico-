from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime,
    Date
)
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class Paciente(Base):
    __tablename__ = "paciente"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    rg = Column(String(20), unique=True, nullable=False)
    cpf = Column(String(14), unique=True, nullable=True)
    data_nascimento = Column(Date)
    laudos = relationship("Laudo", back_populates="paciente")
   

class Laudo(Base):
    __tablename__ = "laudo"

    id = Column(Integer, primary_key=True, index=True)
    paciente_id = Column(
        Integer,
        ForeignKey("paciente.id", ondelete="CASCADE"),
        nullable=False
    )

    titulo = Column(String(255))
    conteudo = Column(Text)
    status = Column(String(50), nullable=False)

    data_criacao = Column(DateTime, default=datetime.utcnow)
    data_atualizacao = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    paciente = relationship("Paciente", back_populates="laudos")

    audios = relationship(
        "Audio",
        back_populates="laudo",
        cascade="all, delete-orphan"
    )
    exames = relationship(
        "Exame",
        back_populates="laudo",
        cascade="all, delete-orphan"
    )


class Audio(Base):
    __tablename__ = "audio"

    id = Column(Integer, primary_key=True)
    laudo_id = Column(
        Integer,
        ForeignKey("laudo.id", ondelete="CASCADE"),
        nullable=False
    )

    caminho_arquivo = Column(Text, nullable=False)
    duracao = Column(Integer)
    data_upload = Column(DateTime, default=datetime.utcnow)

    laudo = relationship("Laudo", back_populates="audios")


class Exame(Base):
    __tablename__ = "exame"

    id = Column(Integer, primary_key=True)
    laudo_id = Column(
        Integer,
        ForeignKey("laudo.id", ondelete="CASCADE"),
        nullable=False
    )

    tipo_arquivo = Column(String(20), nullable=False)
    caminho_arquivo = Column(Text, nullable=False)
    data_upload = Column(DateTime, default=datetime.utcnow)

    laudo = relationship("Laudo", back_populates="exames")
