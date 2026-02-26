import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getAllDiscos } from '@/lib/interswitch';


/**
 * GET /api/electricity/discos
 * Get list of all available electricity distribution companies
 */
export async function GET(_request: NextRequest) {
  try {
    const discos = getAllDiscos();

    const formatted = discos.map((disco) => ({
      code: disco.code,
      name: disco.name,
      billerId: disco.billerId,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
      count: formatted.length,
    });
  } catch (error) {
    console.error('Get DiscoS error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch DiscoS list' },
      { status: 500 }
    );
  }
}
