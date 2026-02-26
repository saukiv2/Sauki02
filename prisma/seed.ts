import { prisma } from '../src/lib/db';
import * as bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Hash the admin password with saltRounds=12
    const passwordHash = await bcrypt.hash('Admin@2026', 12);

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { phone: '09000000000' },
    });

    if (existingAdmin) {
      console.log('✓ Admin user already exists');
    } else {
      // Create the admin user (using phone-based auth)
      const admin = await prisma.user.create({
        data: {
          fullName: 'SaukiMart Admin',
          email: 'admin@saukimart.local',
          phone: '09000000000',
          passwordHash,
          role: 'ADMIN',
          isVerified: true,
          isSuspended: false,
          agentApplicationPending: false,
        },
      });

      console.log('✓ Admin user created');
      console.log(`  Phone: ${admin.phone}`);
      console.log(`  Password: Admin@2026`);

      // Create empty wallet for admin
      const wallet = await prisma.wallet.create({
        data: {
          userId: admin.id,
          balanceKobo: 10000000, // 100,000 naira for testing
          currency: 'NGN',
        },
      });

      console.log(`✓ Admin wallet created with ₦100,000 balance`);
    }

    // Seed sample data plans if not exists
    const mtmPlanCount = await prisma.dataPlan.count({
      where: { network: 'MTN' },
    });

    if (mtmPlanCount === 0) {
      console.log('\n📱 Seeding data plans...');
      
      const plans = [
        // MTN Plans
        { name: 'MTN 100MB', network: 'MTN', size: '100MB', validity: 1, amigoNetworkId: 1, amigoPlanId: 5000, customerPriceKobo: 10000, agentPriceKobo: 9500 },
        { name: 'MTN 1GB', network: 'MTN', size: '1GB', validity: 30, amigoNetworkId: 1, amigoPlanId: 1001, customerPriceKobo: 70000, agentPriceKobo: 66000 },
        { name: 'MTN 2GB', network: 'MTN', size: '2GB', validity: 30, amigoNetworkId: 1, amigoPlanId: 6666, customerPriceKobo: 130000, agentPriceKobo: 123000 },
        { name: 'MTN 5GB', network: 'MTN', size: '5GB', validity: 30, amigoNetworkId: 1, amigoPlanId: 3333, customerPriceKobo: 300000, agentPriceKobo: 285000 },
        // Glo Plans
        { name: 'GLO 100MB', network: 'GLO', size: '100MB', validity: 1, amigoNetworkId: 2, amigoPlanId: 218, customerPriceKobo: 10000, agentPriceKobo: 9500 },
        { name: 'GLO 1GB', network: 'GLO', size: '1GB', validity: 30, amigoNetworkId: 2, amigoPlanId: 217, customerPriceKobo: 65000, agentPriceKobo: 61000 },
        { name: 'GLO 5GB', network: 'GLO', size: '5GB', validity: 30, amigoNetworkId: 2, amigoPlanId: 222, customerPriceKobo: 280000, agentPriceKobo: 266000 },
        // Airtel Plans
        { name: 'AIRTEL 100MB', network: 'AIRTEL', size: '100MB', validity: 1, amigoNetworkId: 4, amigoPlanId: 539, customerPriceKobo: 10000, agentPriceKobo: 9500 },
        { name: 'AIRTEL 1GB', network: 'AIRTEL', size: '1GB', validity: 30, amigoNetworkId: 4, amigoPlanId: 400, customerPriceKobo: 70000, agentPriceKobo: 66000 },
        { name: 'AIRTEL 5GB', network: 'AIRTEL', size: '5GB', validity: 30, amigoNetworkId: 4, amigoPlanId: 391, customerPriceKobo: 320000, agentPriceKobo: 304000 },
      ];

      for (const plan of plans) {
        await prisma.dataPlan.create({
          data: {
            name: plan.name,
            network: plan.network,
            size: plan.size,
            validity: plan.validity,
            dataType: 'SME',
            apiProvider: 'AMIGO',
            amigoNetworkId: plan.amigoNetworkId,
            amigoPlanId: plan.amigoPlanId,
            customerPriceKobo: plan.customerPriceKobo,
            agentPriceKobo: plan.agentPriceKobo,
            costPriceKobo: Math.floor(plan.customerPriceKobo * 0.8),
            isActive: true,
          },
        });
      }
      console.log(`✓ Added ${plans.length} data plans`);
    }

    // Seed product categories
    const categoryCount = await prisma.category.count();
    if (categoryCount === 0) {
      console.log('\n🏷️ Seeding product categories...');
      
      const categories = [
        { name: 'Smartphones', icon: '📱' },
        { name: 'Laptops', icon: '💻' },
        { name: 'Tablets', icon: '📲' },
        { name: 'Accessories', icon: '🎧' },
        { name: 'Power Banks', icon: '🔋' },
        { name: 'Chargers', icon: '⚡' },
      ];

      for (const cat of categories) {
        await prisma.category.create({ data: cat });
      }
      console.log(`✓ Added ${categories.length} categories`);
    }

    console.log('\n✅ Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
