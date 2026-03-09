import os
from typing import List
import psycopg2
from pydantic import BaseModel, Field

from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser

# -------- MODELO DE SAÍDA --------
class LaudoMedico(BaseModel):
    paciente_nome: str = Field(description="Nome completo do paciente")
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

        # ⚠️ PROMPT ATUALIZADO: Agora ele recebe a variável {contexto}
        self.prompt = PromptTemplate(
            template="""
Você é um assistente médico integrado a um sistema clínico.
Utilize o HISTÓRICO DE LAUDOS DE REFERÊNCIA (Contexto) abaixo para guiar a estrutura, linguagem e formatação do seu laudo.

Siga rigorosamente o pipeline abaixo antes de gerar qualquer resposta:

ETAPA 1  Identificação de dados
Não presuma nem invente informações ausentes. Se não houver nome, deixe vazio.

ETAPA 2  Consulta de padrões clínicos
Utilize os laudos de referência fornecidos abaixo como base.
Respeite integralmente o padrão institucional adotado.

ETAPA 3  Análise clínica
Analise exclusivamente os sintomas e informações fornecidas pelo médico.
Utilize linguagem médica técnica, clara e responsável.

ETAPA 4  Hipóteses diagnósticas
Gere apenas hipóteses diagnósticas clínicas. Sugira CID compatível quando possível. Não forneça diagnóstico definitivo.

ETAPA 5  Exames e condutas
Sugira exames complementares compatíveis com as hipóteses. Indique condutas iniciais seguras e não invasivas. Não prescreva medicamentos.

ETAPA 6  Validação ética e clínica
Verifique consistência clínica do laudo. Caso faltem dados, registre de forma clara e objetiva.

Regras obrigatórias:
- Não invente dados do paciente.
- Baseie-se fortemente nos laudos de referência fornecidos.
- Não substitua a avaliação médica presencial.

=========================================
HISTÓRICO DE LAUDOS DE REFERÊNCIA (Contexto da tabela laudo_chunks):
{contexto}
=========================================

INFORMAÇÕES FORNECIDAS PELO MÉDICO:
{sintomas}

{format_instructions}
""",
            input_variables=["sintomas", "contexto"], # <-- Adicionado 'contexto'
            partial_variables={
                "format_instructions": self.parser.get_format_instructions()
            }
        )

        self.chain = self.prompt | self.llm | self.parser

    def buscar_chunks_no_banco(self, tipo_exame: str) -> str:
        """
        Conecta no PostgreSQL e busca laudos onde a coluna 'text' 
        contenha o tipo do exame especificado.
        """
        try:
            # 1. Conecta ao banco de dados usando as variáveis do .env
            conn = psycopg2.connect(
                host=os.getenv("DB_HOST"),
                database=os.getenv("DB_NAME"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASS")
            )
            cursor = conn.cursor()

            # 2. Faz a busca SQL na coluna 'text'
            # O ILIKE ignora maiúsculas/minúsculas.
            query = """
                SELECT text 
                FROM laudo_chunks 
                WHERE text ILIKE %s 
                LIMIT 3;
            """
            
            # Formata a string para o ILIKE (ex: '%transvaginal%')
            termo_busca = f"%{tipo_exame}%"
            cursor.execute(query, (termo_busca,))
            
            # Pega todos os resultados encontrados
            resultados = cursor.fetchall()

            # 3. Fecha a conexão
            cursor.close()
            conn.close()

            # 4. Se não achar nada, retorna um aviso pro LLaMA saber
            if not resultados:
                return "Nenhum laudo de referência encontrado para este tipo de exame no banco de dados."

            # 5. Formata os resultados (linha[0] acessa o conteúdo da coluna 'text')
            chunks_formatados = "\n\n".join([f"Laudo Ref {i+1}:\n{linha[0]}" for i, linha in enumerate(resultados)])
            return chunks_formatados

        except Exception as e:
            print(f"❌ ERRO AO CONECTAR NO POSTGRESQL: {e}")
            return "Erro ao buscar contexto no banco de dados."

    def gerar(self, sintomas_paciente: str):
        # 1. O Python vai no banco (RAG) e pega a informação da tabela laudo_chunks
        contexto_recuperado = self.buscar_chunks_no_banco(sintomas_paciente)
        
        # 2. Passamos os sintomas E o contexto do banco para o LLaMA
        return self.chain.invoke({
            "sintomas": sintomas_paciente,
            "contexto": contexto_recuperado
        })


# -------- TESTE DIRETO --------
if __name__ == "__main__":
    gerador = GeradorLaudo()

    resultado = gerador.gerar(
        "Paciente com febre alta, dor no corpo, tosse seca e cansaço há 3 dias."
    )

    print("\n===== LAUDO GERADO =====\n")
    print(resultado)
    print("\n=======================\n")
    print("Módulo GeradorLaudo com RAG pronto para uso.")