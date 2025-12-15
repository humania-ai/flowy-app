#!/bin/bash

echo "🔧 Arreglando permisos de PostgreSQL para Flowy"
echo "=================================="

# Verificar si PostgreSQL está corriendo
if ! pg_isready -q; then
    echo "🔄 Iniciando PostgreSQL..."
    brew services start postgresql 2>/dev/null || {
        echo "❌ No se pudo iniciar PostgreSQL con Homebrew"
        echo "📥 Intentando con launchd..."
        launchctl load -w org.postgresql.postgres 2>/dev/null || {
            echo "❌ No se pudo iniciar PostgreSQL"
            echo "Por favor inicia PostgreSQL manualmente:"
            echo "  brew services start postgresql"
            echo "O: sudo systemctl start postgresql"
            exit 1
        }
    }
    sleep 2
fi

# Conectar a PostgreSQL y dar permisos
echo "🗄️ Conectando a PostgreSQL y configurando permisos..."

# Usar psql con un here document para ejecutar comandos
psql -U postgres -d flowy_db -h localhost -p 5432 -c "
-- Dar permisos de creación al usuario flowy_user
GRANT CREATE ON DATABASE flowy_db TO flowy_user;

-- Dar permisos en todas las tablas existentes
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO flowy_user;

-- Dar permisos en todas las secuencias existentes
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO flowy_user;

-- Dar permisos en todos los esquemas existentes
GRANT ALL PRIVILEGES ON ALL SCHEMAS TO flowy_user;

-- Hacer que flowy_user sea el dueño de los objetos que cree
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT flowy_user;

-- Dar permisos de conexión
GRANT CONNECT ON DATABASE flowy_db TO flowy_user;

-- Salir
\q
" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Permisos configurados exitosamente!"
    echo ""
    echo "📋 Resumen:"
    echo "   - Usuario: flowy_user"
    echo "   - Base de datos: flowy_db"
    echo "   - Puerto: 5432"
    echo "   - Host: localhost"
    echo ""
    echo "🚀 Ahora ejecuta:"
    echo "   npm run db:push"
    echo "   npm run db:generate"
    echo "   npm run dev"
    echo ""
    echo "🎯 El usuario flowy_user ahora debería poder acceder sin problemas"
else
    echo "❌ Error al configurar permisos"
    echo "Por favor intenta manualmente:"
    echo "  psql -U postgres -d flowy_db -h localhost -p 5432"
    echo "  Luego ejecuta los comandos GRANT manualmente"
    exit 1
fi