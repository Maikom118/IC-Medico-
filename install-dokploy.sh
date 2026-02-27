#!/bin/bash

# ================================================
# SCRIPT DE INSTALAÇÃO DOKPLOY NA VPS HOSTINGER
# ================================================

echo "🚀 Instalando Dokploy na VPS Hostinger"
echo "========================================"
echo ""

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
   echo "⚠️  Este script precisa ser executado como root"
   echo "   Execute: sudo ./install-dokploy.sh"
   exit 1
fi

# Atualizar sistema
echo "📦 Atualizando sistema..."
apt-get update
apt-get upgrade -y

# Instalar dependências
echo "📦 Instalando dependências..."
apt-get install -y curl git

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "🐳 Instalando Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
else
    echo "✅ Docker já está instalado"
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Instalando Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo "✅ Docker Compose já está instalado"
fi

# Instalar Dokploy
echo "🚀 Instalando Dokploy..."
curl -sSL https://dokploy.com/install.sh | sh

# Verificar instalação
if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo "✅ Dokploy instalado com sucesso!"
    echo "================================================"
    echo ""
    echo "📝 Próximos passos:"
    echo ""
    echo "1. Acesse o painel Dokploy:"
    echo "   http://$(curl -s ifconfig.me):3000"
    echo ""
    echo "2. Crie sua conta de administrador"
    echo ""
    echo "3. Configure seu domínio: iamedbr.com"
    echo ""
    echo "4. Faça deploy dos serviços IC-Medico"
    echo ""
    echo "================================================"
else
    echo ""
    echo "❌ Erro na instalação do Dokploy"
    echo "   Verifique os logs acima para mais detalhes"
    exit 1
fi

# Configurar firewall (se ufw estiver instalado)
if command -v ufw &> /dev/null; then
    echo ""
    echo "🔒 Configurando firewall..."
    ufw allow 22/tcp     # SSH
    ufw allow 80/tcp     # HTTP
    ufw allow 443/tcp    # HTTPS
    ufw allow 3000/tcp   # Dokploy
    ufw allow 8000/tcp   # OCR
    ufw allow 8100/tcp   # Backend
    ufw allow 8300/tcp   # Transcrição
    echo "✅ Firewall configurado"
fi

echo ""
echo "🎉 Instalação completa!"
echo ""
echo "Dokploy está rodando em:"
echo "http://$(curl -s ifconfig.me):3000"
echo ""
