import { prisma } from '../src/lib/db';
import * as bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Hash the admin password with saltRounds=12
    const passwordHash = await bcrypt.hash('Admin@SaukiMart2026', 12);

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@saukimart.online' },
    });

    if (existingAdmin) {
      console.log('✓ Admin user already exists');
    } else {
      // Create the admin user
      const admin = await prisma.user.create({
        data: {
          fullName: 'SaukiMart Admin',
          email: 'admin@saukimart.online',
          phone: '+234-admin-001',
          passwordHash,
          role: 'ADMIN',
          isVerified: true,
          isSuspended: false,
          agentApplicationPending: false,
        },
      });

      console.log('✓ Admin user created:', admin.email);

      // Create empty wallet for admin
      const wallet = await prisma.wallet.create({
        data: {
          userId: admin.id,
          balanceKobo: 0,
          currency: 'NGN',
          // No virtual account for admin
        },
      });

      console.log('✓ Admin wallet created:', wallet.id);
    }

    // Seed platform settings
    const platformSettings = [
      {
        key: 'electricity_customer_charge_kobo',
        value: '10000',
      },
      {
        key: 'electricity_agent_charge_kobo',
        value: '5000',
      },
      {
        key: 'agent_applications_open',
        value: 'true',
      },
      {
        key: 'maintenance_mode',
        value: 'false',
      },
      {
        key: 'platform_name',
        value: 'SaukiMart',
      },
    ];

    for (const setting of platformSettings) {
      const existingSetting = await prisma.platformSetting.findUnique({
        where: { key: setting.key },
      });

      if (existingSetting) {
        console.log(`✓ Platform setting '${setting.key}' already exists`);
      } else {
        await prisma.platformSetting.create({
          data: setting,
        });
        console.log(`✓ Platform setting '${setting.key}' created`);
      }
    }

    console.log('✅ Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
