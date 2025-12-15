import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@flowy.app';
const ADMIN_PASSWORD = 'admin'; // La contraseña en texto plano
const ADMIN_ID = 'temp-admin-id'; // El ID que usas en tu authOptions

async function createAdminUser() {
  console.log('Intentando crear/actualizar el usuario administrador...');

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const adminUser = await prisma.user.upsert({
    where: {
      email: ADMIN_EMAIL,
    },
    update: {
      name: 'Administrador',
      password: hashedPassword,
    },
    create: {
      id: ADMIN_ID, // ¡Importante! Usar el mismo ID
      email: ADMIN_EMAIL,
      name: 'Administrador',
      password: hashedPassword,
    },
  });

  console.log('✅ Usuario administrador creado/actualizado:', adminUser);
}

createAdminUser()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });