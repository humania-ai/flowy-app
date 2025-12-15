#!/bin/bash

echo "🚀 Configuración PostgreSQL para Flowy"
echo "=================================="

# Verificar si PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL no está instalado"
    echo "📥 Instalando PostgreSQL..."
    
    # Para macOS con Homebrew
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install postgresql
        else
            echo "❌ Homebrew no está instalado. Por favor instala Homebrew primero:"
            echo "/bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        fi
    else
        echo "❌ Por favor instala PostgreSQL manualmente"
        exit 1
    fi
else
    echo "✅ PostgreSQL ya está instalado"
fi

# Verificar si PostgreSQL está corriendo
if ! pg_isready -q; then
    echo "🔄 Iniciando PostgreSQL..."
    brew services start postgresql 2>/dev/null || sudo systemctl start postgresql 2>/dev/null || echo "Por favor inicia PostgreSQL manualmente"
    sleep 3
fi

# Crear base de datos y usuario
echo "🗄️ Creando base de datos y usuario..."
createdb flowy_db 2>/dev/null || echo "⚠️  La base de datos ya existe"

# Crear usuario postgres si no existe
psql -U postgres -d template1 -c "CREATE USER flowy_user WITH PASSWORD 'flowy_password';" 2>/dev/null || echo "✅ Usuario flowy_user ya existe"

# Dar permisos al usuario
psql -U postgres -d template1 -c "GRANT ALL PRIVILEGES ON DATABASE flowy_db TO flowy_user;" 2>/dev/null

echo "✅ Configuración completada!"
echo ""
echo "📋 Datos de conexión:"
echo "   Host: localhost"
echo "   Puerto: 5432"
echo "   Base de datos: flowy_db"
echo "   Usuario: flowy_user"
echo "   Contraseña: flowy_password"
echo ""
echo "🔗 URL de conexión:"
echo "   DATABASE_URL=\"postgresql://flowy_user:flowy_password@localhost:5432/flowy_db?schema=public\""
echo ""
echo "📝 Copia esta URL en tu archivo .env:"
echo "   DATABASE_URL=\"postgresql://flowy_user:flowy_password@localhost:5432/flowy_db?schema=public\""
echo ""
echo "🚀 Luego ejecuta:"
echo "   npm run db:push"
echo "   npm run db:generate"
echo "   npm run dev"