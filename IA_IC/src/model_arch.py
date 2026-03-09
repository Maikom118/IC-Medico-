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
Você é um assistente médico especialista em preenchimento de laudos padronizados.
Sua única função é pegar um TEMPLATE do banco de dados e PREENCHER com os dados ditados pelo médico.

REGRA DE OURO: O laudo final deve ser a cópia EXATA do template fornecido, apenas com os dados do paciente (medidas, localização, lateralidade) atualizados conforme o áudio do médico.

PASSO A PASSO MENTAL (Não escreva isso na saída):
Leia o "HISTÓRICO DE LAUDOS DE REFERÊNCIA" abaixo. Ele contém metadados e o template real.
Ignore os campos "tipo_documento" e "fonte_verdade".
Encontre o texto que está abaixo de "estrutura_modelo:". ESTE É O SEU MOLDE DE TRABALHO.
Copie este molde para o campo 'laudo_estruturado_completo'.
Leia as "INFORMAÇÕES FORNECIDAS PELO MÉDICO".
Substitua os espaços em branco ou atualize as informações do molde (ex: tamanho do nódulo, relógio, distância do mamilo) usando APENAS o que o médico ditou.
Se o médico NÃO citou uma alteração, mantenha o texto padrão original do molde. NÃO invente achados.
LIMPEZA OBRIGATÓRIA: Remova absolutamente todas as tags do sistema, como "" e "". O laudo deve ficar limpo, profissional e pronto para impressão.

=========================================
HISTÓRICO DE LAUDOS DE REFERÊNCIA (TEMPLATES):
{contexto}
=========================================
INFORMAÇÕES FORNECIDAS PELO MÉDICO (DADOS PARA INJETAR NO MOLDE):
{sintomas}
=========================================

REGRAS DE SAÍDA:
Retorne ÚNICA E EXCLUSIVAMENTE um objeto JSON válido.
NÃO escreva NENHUMA palavra fora do JSON.

{format_instructions}
""",
            input_variables=["sintomas", "contexto"],
            partial_variables={
                "format_instructions": self.parser.get_format_instructions()
            }
        )

        self.chain = self.prompt | self.llm | self.parser

    def buscar_chunks_no_banco(self, tipo_exame: str) -> str:
        # 👇 ADICIONE ESTE PRINT AQUI PARA VERMOS O QUE ESTÁ CHEGANDO DO REACT
        print(f"\n🔎 [RAG] O React mandou buscar no banco por: '{tipo_exame}'") 

        try:
            conn = psycopg2.connect(
                host=os.getenv("DB_HOST"),
                database=os.getenv("DB_NAME"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASS")
            )
            cursor = conn.cursor()

            query = """
                SELECT text 
                FROM laudo_chunks 
                WHERE text ILIKE %s 
                LIMIT 3;
            """

            termo_busca = f"%{tipo_exame}%"
            cursor.execute(query, (termo_busca,))
            resultados = cursor.fetchall()

#👇 ADICIONE ESTE PRINT PARA VER SE O BANCO ACHOU ALGO
            print(f"✅ [RAG] O PostgreSQL encontrou {len(resultados)} templates!")

            cursor.close()
            conn.close()

            if not resultados:
                # 👇 ADICIONE ESTE PRINT PARA SABERMOS SE DEU VAZIO
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