#!/bin/bash

echo "🔧 Configuración Manual de PostgreSQL para Flowy"
echo "=================================="

# Obtenemos el nombre de usuario actual del sistema operativo
CURRENT_USER=$(whoami)

echo "📋 Verificando instalación de PostgreSQL..."

# Buscar PostgreSQL en ubicaciones comunes
POSTGRES_PATHS=(
    "/usr/local/bin/psql"
    "/usr/bin/psql"
    "/opt/homebrew/bin/psql"
    "/Applications/Postgres.app/Contents/Versions/latest/bin/psql"
)

PSQL_PATH=""
for path in "${POSTGRES_PATHS[@]}"; do
    if [ -f "$path" ]; then
        PSQL_PATH="$path"
        echo "✅ PostgreSQL encontrado en: $PSQL_PATH"
        break
    fi
done

if [ -z "$PSQL_PATH" ]; then
    echo "❌ PostgreSQL no encontrado. Por favor instala PostgreSQL:"
    echo ""
    echo "Opción 1 - Homebrew (macOS):"
    echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    echo ""
    echo "Opción 2 - Descargar directamente:"
    echo "  https://www.postgresql.org/download/macosx/"
    echo ""
    echo "Opción 3 - Docker:"
    echo "  docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15"
    exit 1
fi

echo "🗄️ Iniciando servicio PostgreSQL..."

# Intentar diferentes métodos para iniciar PostgreSQL
if command -v brew &> /dev/null; then
    echo "🍺 Usando Homebrew..."
    brew services start postgresql 2>/dev/null &
    PG_PID=$!
    sleep 3
elif [ -f "/Applications/Postgres.app" ]; then
    echo "🍎 Usando PostgreSQL app..."
    open -a "postgres://localhost:5432" &
    PG_PID=$!
    sleep 3
else
    echo "🔄 Intentando iniciar PostgreSQL manualmente..."
    # Intentar con pg_ctl si está disponible
    if command -v pg_ctl &> /dev/null; then
        pg_ctl -D /usr/local/var/postgresql start 2>/dev/null &
        PG_PID=$!
        sleep 3
    else
        echo "⚠️ No se pudo iniciar PostgreSQL automáticamente"
        echo "Por favor inicia PostgreSQL manualmente y luego presiona Enter para continuar..."
        read -p "Presiona Enter cuando PostgreSQL esté corriendo..."
    fi
fi

echo "🔧 Configurando base de datos y permisos..."

# Esperar a que PostgreSQL esté disponible
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 5

# Verificar si PostgreSQL está corriendo en el puerto 5432
if ! nc -z localhost 5432 &> /dev/null; then
    echo "❌ PostgreSQL no está corriendo en el puerto 5432"
    echo "Por favor inicia PostgreSQL manualmente:"
    echo ""
    echo "Con Homebrew: brew services start postgresql"
    echo "Con PostgreSQL app: open /Applications/Postgres.app"
    echo "Con pg_ctl: pg_ctl -D /usr/local/var/postgresql start"
    echo ""
    echo "Luego presiona Enter para continuar..."
    read -p "Presiona Enter cuando PostgreSQL esté corriendo..."
fi

# Crear base de datos si no existe
echo "🗄️ Creando base de datos flowy_db..."
# CAMBIO CLAVE: Se elimina -U postgres para usar el usuario actual del sistema
 $PSQL_PATH -h localhost -p 5432 -c "CREATE DATABASE flowy_db;" 2>/dev/null

# Crear usuario si no existe
echo "👤 Creando usuario flowy_user..."
# CAMBIO CLAVE: Se elimina -U postgres
 $PSQL_PATH -h localhost -p 5432 -c "CREATE USER flowy_user WITH PASSWORD 'flowy_password';" 2>/dev/null

# Dar permisos
echo "🔐 Configurando permisos..."
# CAMBIO CLAVE: Se elimina -U postgres
 $PSQL_PATH -h localhost -p 5432 -c "
-- Dar todos los permisos al usuario flowy_user
GRANT ALL PRIVILEGES ON DATABASE flowy_db TO flowy_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO flowy_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO flowy_user; -- Corregido para que sea sintácticamente correcto

-- Hacer owner de la base de datos
ALTER DATABASE flowy_db OWNER TO flowy_user;
" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Configuración completada exitosamente!"
    echo ""
    echo "📋 Datos de conexión:"
    echo "   Host: localhost"
    echo "   Puerto: 5432"
    echo "   Base de datos: flowy_db"
    echo "   Usuario: flowy_user"
    echo "   Contraseña: flowy_password"
    echo ""
    echo "🔗 URL de conexión:"
    echo "   postgresql://flowy_user:flowy_password@localhost:5432/flowy_db"
    echo ""
    echo "📝 Actualizando archivo .env..."
    
    # Actualizar el .env con la URL correcta
    if [ -f ".env" ]; then
        # Backup del .env actual
        cp .env .env.backup
        
        # Actualizar la URL de PostgreSQL
        sed -i '' 's|^DATABASE_URL=.*$|DATABASE_URL="postgresql://flowy_user:flowy_password@localhost:5432/flowy_db?schema=public"|' .env
        
        echo "✅ .env actualizado con la URL de PostgreSQL"
    else
        # Crear nuevo .env
        echo "DATABASE_URL=\"postgresql://flowy_user:flowy_password@localhost:5432/flowy_db?schema=public\"" > .env
        echo "✅ .env creado con la URL de PostgreSQL"
    fi
    
    echo ""
    echo "🚀 Ahora ejecuta:"
    echo "   npm run db:push"
    echo "   npm run db:generate"
    echo "   npm run dev"
    echo ""
    echo "🎯 El login debería funcionar perfectamente con PostgreSQL!"
    
else
    echo "❌ Error en la configuración"
    echo "Por favor revisa los mensajes de error arriba"
    exit 1
fi