import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';


/**
 * POST /api/data/seed
 * Seed data plans into database (development only)
 * 
 * Authorization: x-user-role header must be ADMIN
 */
export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { message: 'Seed endpoint not available in production' },
        { status: 403 }
      );
    }

    // Check admin role
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Sample data plans
    const dataPlanData = [
      // MTN Plans
      {
        name: 'MTN 100MB',
        network: 'MTN',
        size: '100MB',
        validity: 1,
        dataType: 'SME',
        apiProvider: 'AMIGO',
        amigoNetworkId: 1,
        amigoPlanId: 101,
        customerPriceKobo: 10000, // ₦100
        agentPriceKobo: 9500,
        costPriceKobo: 8500,
      },
      {
        name: 'MTN 500MB',
        network: 'MTN',
        size: '500MB',
        validity: 7,
        dataType: 'SME',
        apiProvider: 'AMIGO',
        amigoNetworkId: 1,
        amigoPlanId: 102,
        customerPriceKobo: 40000, // ₦400
        agentPriceKobo: 38000,
        costPriceKobo: 35000,
      },
      {
        name: 'MTN 1GB',
        network: 'MTN',
        size: '1GB',
        validity: 30,
        dataType: 'SME',
        apiProvider: 'AMIGO',
        amigoNetworkId: 1,
        amigoPlanId: 103,
        customerPriceKobo: 70000, // ₦700
        agentPriceKobo: 66500,
        costPriceKobo: 60000,
      },
      {
        name: 'MTN 2GB',
        network: 'MTN',
        size: '2GB',
        validity: 30,
        dataType: 'SME',
        apiProvider: 'AMIGO',
        amigoNetworkId: 1,
        amigoPlanId: 104,
        customerPriceKobo: 120000, // ₦1,200
        agentPriceKobo: 114000,
        costPriceKobo: 105000,
      },
      // GLO Plans
      {
        name: 'GLO 100MB',
        network: 'GLO',
        size: '100MB',
        validity: 1,
        dataType: 'SME',
        apiProvider: 'AMIGO',
        amigoNetworkId: 2,
        amigoPlanId: 201,
        customerPriceKobo: 10000,
        agentPriceKobo: 9500,
        costPriceKobo: 8500,
      },
      {
        name: 'GLO 500MB',
        network: 'GLO',
        size: '500MB',
        validity: 7,
        dataType: 'SME',
        apiProvider: 'AMIGO',
        amigoNetworkId: 2,
        amigoPlanId: 202,
        customerPriceKobo: 40000,
        agentPriceKobo: 38000,
        costPriceKobo: 35000,
      },
      {
        name: 'GLO 1GB',
        network: 'GLO',
        size: '1GB',
        validity: 30,
        dataType: 'SME',
        apiProvider: 'AMIGO',
        amigoNetworkId: 2,
        amigoPlanId: 203,
        customerPriceKobo: 65000, // ₦650
        agentPriceKobo: 61750,
        costPriceKobo: 56000,
      },
      // AIRTEL Plans
      {
        name: 'AIRTEL 100MB',
        network: 'AIRTEL',
        size: '100MB',
        validity: 1,
        dataType: 'SME',
        apiProvider: 'AMIGO',
        amigoNetworkId: 4,
        amigoPlanId: 401,
        customerPriceKobo: 10000,
        agentPriceKobo: 9500,
        costPriceKobo: 8500,
      },
      {
        name: 'AIRTEL 500MB',
        network: 'AIRTEL',
        size: '500MB',
        validity: 7,
        dataType: 'SME',
        apiProvider: 'AMIGO',
        amigoNetworkId: 4,
        amigoPlanId: 402,
        customerPriceKobo: 40000,
        agentPriceKobo: 38000,
        costPriceKobo: 35000,
      },
      {
        name: 'AIRTEL 1GB',
        network: 'AIRTEL',
        size: '1GB',
        validity: 30,
        dataType: 'SME',
        apiProvider: 'AMIGO',
        amigoNetworkId: 4,
        amigoPlanId: 403,
        customerPriceKobo: 65000,
        agentPriceKobo: 61750,
        costPriceKobo: 56000,
      },
    ];

    // Clear existing plans
    await prisma.dataPlan.deleteMany({});

    // Create new plans
    const result = await prisma.dataPlan.createMany({
      data: dataPlanData,
    });

    return NextResponse.json({
      success: true,
      message: `Seeded ${result.count} data plans`,
      count: result.count,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { message: 'Failed to seed data plans' },
      { status: 500 }
    );
  }
}
