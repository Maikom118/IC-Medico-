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
Você é um assistente médico automatizado. Sua função é atuar como um preenchedor de templates rigoroso.

Siga rigorosamente o pipeline abaixo:

ETAPA 1  Identificação de dados
Não presuma nem invente informações ausentes. Se não houver nome, deixe vazio.

ETAPA 2  MOLDE ESTRUTURAL (OBRIGATÓRIO)
O HISTÓRICO DE LAUDOS DE REFERÊNCIA abaixo não é uma sugestão, é um TEMPLATE.
Analise os cabeçalhos presentes no contexto (ex: "INDICAÇÃO:", "TÉCNICA:", "ACHADOS:", "CONCLUSÃO:").
Você DEVE gerar o campo 'laudo_estruturado_completo' copiando EXATAMENTE essas mesmas seções.
NÃO CRIE seções novas. NÃO ALTERE a ordem das seções. Apenas preencha o molde com os novos dados.

ETAPA 3  Análise clínica
Preencha o molde utilizando linguagem médica técnica, clara e responsável, baseada exclusivamente nas informações fornecidas pelo médico atual.

ETAPA 4  Validação
Verifique se a estrutura visual gerada está idêntica à estrutura encontrada no banco de dados.

=========================================
HISTÓRICO DE LAUDOS DE REFERÊNCIA (SEU MOLDE OBRIGATÓRIO):
{contexto}
=========================================

INFORMAÇÕES FORNECIDAS PELO MÉDICO (PREENCHA O MOLDE COM ISSO):
{sintomas}

{format_instructions}
""",
            input_variables=["sintomas", "contexto"],
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
            # Conecta ao banco de dados usando as variáveis do .env
            conn = psycopg2.connect(
                host=os.getenv("DB_HOST"),
                database=os.getenv("DB_NAME"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASS")
            )
            cursor = conn.cursor()

            # Faz a busca SQL na coluna 'text' ignorando maiúsculas/minúsculas
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

            # Fecha a conexão
            cursor.close()
            conn.close()

            # Se não achar nada, retorna um aviso pro LLaMA saber
            if not resultados:
                return "Nenhum laudo de referência encontrado para este tipo de exame no banco de dados."

            # Formata os resultados (linha[0] acessa o conteúdo da coluna 'text')
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