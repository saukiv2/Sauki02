import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


/**
 * GET /api/data/plans
 * Get all available data plans
 * 
 * Query parameters:
 * - network: Filter by network (MTN, GLO, AIRTEL)
 * - userType: Filter by price tier (CUSTOMER, AGENT)
 */
export async function GET(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/db');
    
    const { searchParams } = request.nextUrl;
    const network = searchParams.get('network');
    const userType = searchParams.get('userType') || 'CUSTOMER';

    const where: any = {
      isActive: true,
      apiProvider: 'AMIGO',
    };

    if (network) {
      where.network = network.toUpperCase();
    }

    // Get all plans
    const plans = await prisma.dataPlan.findMany({
      where,
      orderBy: [{ network: 'asc' }, { customerPriceKobo: 'asc' }],
    });

    // Format response with appropriate pricing
    const formatted = plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      network: plan.network,
      size: plan.size,
      validity: `${plan.validity} days`,
      type: plan.dataType,
      provider: plan.apiProvider,
      price: userType === 'AGENT' ? plan.agentPriceKobo : plan.customerPriceKobo,
      priceNaira: (
        (userType === 'AGENT' ? plan.agentPriceKobo : plan.customerPriceKobo) / 100
      ).toFixed(2),
      costPrice: plan.costPriceKobo,
      margin:
        userType === 'AGENT'
          ? plan.agentPriceKobo - plan.costPriceKobo
          : plan.customerPriceKobo - plan.costPriceKobo,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
      count: formatted.length,
    });
  } catch (error) {
    console.error('Data plans error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch data plans' },
      { status: 500 }
    );
  }
}
