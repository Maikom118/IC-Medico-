import os
import psycopg2
from typing import List
from pydantic import BaseModel, Field

# ⚠️ CARREGA AS VARIÁVEIS DO .ENV ANTES DE TUDO
from dotenv import load_dotenv
load_dotenv()

from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser

# -------- MODELO DE SAÍDA --------
class LaudoMedico(BaseModel):
    paciente_nome: str = Field(description="Nome completo do paciente")
    laudo_estruturado_completo: str = Field(description="O texto do laudo completo, copiando RIGOROSAMENTE as seções, cabeçalhos e formatação do Laudo de Referência fornecido no contexto.")
    diagnostico_hipotese: str = Field(description="Hipótese diagnóstica baseada nos sintomas")
    exames_sugeridos: List[str] = Field(description="Lista de exames complementares")
    recomendacoes: str = Field(description="Orientações médicas detalhadas")
    cid_sugerido: str = Field(description="Código Internacional de Doenças (CID-10)")

# -------- GERADOR RAG --------
class GeradorLaudo:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY não encontrada no ambiente")

        self.llm = ChatGroq(
            model="llama-3.1-8b-instant",
            api_key=api_key,
            temperature=0
        )

        self.parser = JsonOutputParser(pydantic_object=LaudoMedico)

        self.prompt = PromptTemplate(
            template="""
VOCÊ É UM FORMATADOR DE DADOS MÉDICOS. 
SUA RESPOSTA DEVE SER EXCLUSIVAMENTE UM OBJETO JSON VÁLIDO.

INSTRUÇÕES RÍGIDAS:
1. NÃO escreva explicações.
2. NÃO escreva blocos de código (Markdown ```).
3. NÃO escreva saudações ou textos como "Aqui está o seu JSON".
4. NÃO crie scripts Python.
5. Use o template de 'estrutura_modelo' abaixo como base única para o campo 'laudo_estruturado_completo'.

PROCESSO INTERNO:
- Extraia nome e idade de {sintomas}.
- Pegue o texto de 'estrutura_modelo' em {contexto}.
- Preencha o texto com os dados de {sintomas}.
- Devolva apenas o JSON final.

=========================================
MOLDE (CONTEXTO):
{contexto}
=========================================
DADOS DO MÉDICO:
{sintomas}
=========================================

{format_instructions}

RESPOSTA (APENAS JSON):
""",
            input_variables=["sintomas", "contexto"],
            partial_variables={
                "format_instructions": self.parser.get_format_instructions()
            }
        )

        self.chain = self.prompt | self.llm | self.parser

    def buscar_chunks_no_banco(self, tipo_exame: str) -> str:
        print(f"\n🔎 [RAG] O React mandou buscar no banco por: '{tipo_exame}'") 

        try:
            conn = psycopg2.connect(
                host=os.getenv("DB_HOST"),
                database=os.getenv("DB_NAME"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASS")
            )
            cursor = conn.cursor()

            # ⚠️ A MÁGICA ESTÁ AQUI: 
            # Em vez de buscar a frase gigante, pegamos apenas a primeira palavra 
            # (Ex: De "Microlitíase Renal (Abdome)" ele vai buscar só "%Microlitíase%")
            palavras = tipo_exame.replace("(", "").replace(")", "").split()
            palavra_chave = palavras[0] if palavras else "Geral"

            print(f"🎯 [RAG] Filtro flexível! Buscando no banco pela palavra: '{palavra_chave}'")

            query = """
                SELECT text 
                FROM laudo_chunks 
                WHERE text ILIKE %s 
                LIMIT 3;
            """

            termo_busca = f"%{palavra_chave}%"
            cursor.execute(query, (termo_busca,))
            resultados = cursor.fetchall()

            print(f"✅ [RAG] O PostgreSQL encontrou {len(resultados)} templates!")

            cursor.close()
            conn.close()

            if not resultados:
                print("⚠️ [RAG] Nenhum template encontrado. A IA vai ficar sem molde.")
                return "Nenhum laudo de referência encontrado para este tipo de exame no banco de dados."

            chunks_formatados = "\n\n".join([f"Laudo Ref {i+1}:\n{linha[0]}" for i, linha in enumerate(resultados)])
            return chunks_formatados

        except Exception as e:
            print(f"❌ ERRO AO CONECTAR NO POSTGRESQL: {e}")
            return "Erro ao buscar contexto no banco de dados."
        
    def gerar(self, sintomas_paciente: str, tipo_exame: str):
        # 1. O Python vai no banco (PostgreSQL) e puxa os laudos baseados no tipo do exame
        contexto_recuperado = self.buscar_chunks_no_banco(tipo_exame)
        
        # 2. Passamos os sintomas E o contexto do banco para o LLaMA
        return self.chain.invoke({
            "sintomas": sintomas_paciente,
            "contexto": contexto_recuperado
        })


# -------- TESTE DIRETO --------
if __name__ == "__main__":
    gerador = GeradorLaudo()

    print("\nBuscando contexto no banco e gerando laudo...\n")
    
    # Passamos os sintomas E o tipo do exame!
    resultado = gerador.gerar(
        sintomas_paciente="Paciente relata dor pélvica. Útero em AVF, contornos regulares. Endométrio com 5mm.",
        tipo_exame="transvaginal"
    )

    print("\n===== LAUDO GERADO =====\n")
    print(resultado)
    print("\n=======================\n")