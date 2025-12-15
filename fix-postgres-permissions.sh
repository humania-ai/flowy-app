#!/bin/bash

echo "🔧 Arreglando permisos de PostgreSQL para Flowy"
echo "=================================="

# Verificar si PostgreSQL está corriendo
if ! pg_isready -q; then
    echo "🔄 Iniciando PostgreSQL..."
    brew services start postgresql 2>/dev/null || sudo systemctl start postgresql 2>/dev/null
    sleep 3
fi

# Conectar a PostgreSQL y dar permisos
echo "🗄️ Conectando a PostgreSQL y configurando permisos..."

psql -U postgres -d flowy_db -c "
-- Dar permisos de creación al usuario flowy_user
GRANT CREATE ON DATABASE flowy_db TO flowy_user;

-- Dar permisos en todas las tablas existentes
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO flowy_user;

-- Dar permisos en todas las secuencias existentes
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO flowy_user;

-- Dar permisos en el esquema publico
GRANT ALL PRIVILEGES ON SCHEMA public TO flowy_user;

-- Hacer que flowy_user sea el dueño de los objetos que cree
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO flowy_user;

-- Dar permisos de conexión
GRANT CONNECT ON DATABASE flowy_db TO flowy_user;

-- Salir
\q
"

echo "✅ Permisos configurados exitosamente!"
echo ""
echo "📋 Resumen:"
echo "   - Usuario: flowy_user"
echo "   - Base de datos: flowy_db"
echo "   - Permisos: CREATE, ALL PRIVILEGES"
echo "   - Esquema: public"
echo ""
echo "🚀 Ahora ejecuta:"
echo "   npm run db:push"
echo "   npm run db:generate"
echo "   npm run dev"
echo ""
echo "🎯 El usuario flowy_user ahora debería poder acceder sin problemas"