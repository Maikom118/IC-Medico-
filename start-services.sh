#!/bin/bash

# Script de inicialização dos serviços OCR e Transcrição
echo "🚀 Iniciando serviços IC-Medico..."

# Função para finalizar processos ao receber SIGTERM
cleanup() {
    echo "⚠️  Finalizando serviços..."
    kill $PID_OCR $PID_TRANSCRICAO 2>/dev/null
    wait $PID_OCR $PID_TRANSCRICAO 2>/dev/null
    echo "✅ Serviços finalizados"
    exit 0
}

trap cleanup SIGTERM SIGINT

# Iniciar serviço de Transcrição
echo "📝 Iniciando serviço de Transcrição (porta 8300)..."
cd /app/Transcricao
python3 main.py &
PID_TRANSCRICAO=$!
echo "   PID Transcrição: $PID_TRANSCRICAO"

# Aguardar um momento
sleep 2

# Iniciar serviço de OCR
echo "👁️  Iniciando serviço de OCR (porta 8000)..."
cd /app/OCR
node server.js &
PID_OCR=$!
echo "   PID OCR: $PID_OCR"

echo ""
echo "✅ Serviços iniciados com sucesso!"
echo "   - OCR: http://localhost:8000"
echo "   - Transcrição: http://localhost:8300"
echo ""
echo "📊 Monitorando processos (Ctrl+C para parar)..."

# Aguardar ambos os processos
wait $PID_OCR $PID_TRANSCRICAO
