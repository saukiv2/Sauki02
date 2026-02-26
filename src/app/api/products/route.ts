import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';


/**
 * GET /api/products
 * Get all active products with pagination
 *
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - categoryId: Filter by category
 * - userType: CUSTOMER or AGENT (for pricing)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const categoryId = searchParams.get('categoryId');
    const userType = searchParams.get('userType') || 'CUSTOMER';

    const where: any = { isActive: true };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Get total count
    const total = await prisma.product.findMany({ where });

    // Get products
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Format response
    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category.name,
      categoryId: p.categoryId,
      description: p.description,
      specs: p.specs,
      images: p.images,
      price:
        userType === 'AGENT'
          ? (p.agentPriceKobo / 100).toFixed(2)
          : (p.customerPriceKobo / 100).toFixed(2),
      priceKobo: userType === 'AGENT' ? p.agentPriceKobo : p.customerPriceKobo,
      stock: p.stockQty,
      inStock: p.stockQty > 0,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
      pagination: {
        page,
        limit,
        total: total.length,
        pages: Math.ceil(total.length / limit),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
