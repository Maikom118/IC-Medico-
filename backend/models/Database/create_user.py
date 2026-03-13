"""
Utilitário para criar/resetar senhas de médicos e secretárias no banco.

Uso:
    python create_user.py medico "Dr. João Silva" joao@email.com minhasenha
    python create_user.py secretaria "Maria Santos" maria@email.com minhasenha
"""

import sys
import os

# Garante que o módulo 'app' é encontrado
sys.path.insert(0, os.path.dirname(__file__))

from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.database import engine
from app.models import Medico, Secretaria

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_or_update_user(role: str, nome: str, email: str, senha: str):
    with Session(engine) as db:
        senha_hash = hash_password(senha)

        if role == "medico":
            user = db.query(Medico).filter(Medico.email == email).first()
            if user:
                user.senha_hash = senha_hash
                user.nome = nome
                print(f"[✓] Médico '{nome}' atualizado com nova senha.")
            else:
                user = Medico(nome=nome, email=email, senha_hash=senha_hash)
                db.add(user)
                print(f"[✓] Médico '{nome}' criado com sucesso.")

        elif role == "secretaria":
            user = db.query(Secretaria).filter(Secretaria.email == email).first()
            if user:
                user.senha_hash = senha_hash
                user.nome = nome
                print(f"[✓] Secretária '{nome}' atualizada com nova senha.")
            else:
                user = Secretaria(nome=nome, email=email, senha_hash=senha_hash)
                db.add(user)
                print(f"[✓] Secretária '{nome}' criada com sucesso.")
        else:
            print(f"[✗] Role inválida: '{role}'. Use 'medico' ou 'secretaria'.")
            sys.exit(1)

        db.commit()
        print(f"    Email: {email}")
        print(f"    Hash:  {senha_hash}")


if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Uso: python create_user.py <medico|secretaria> <nome> <email> <senha>")
        sys.exit(1)

    _, role, nome, email, senha = sys.argv
    create_or_update_user(role, nome, email, senha)
