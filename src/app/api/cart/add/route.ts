import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * POST /api/cart/add
 * Validate product for adding to cart
 * Note: Cart is managed client-side via React Context
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { message: 'Product ID and valid quantity are required' },
        { status: 400 }
      );
    }

    // Get user ID from middleware
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { prisma } = await import('@/lib/db');
    const { z } = await import('zod');

    // Validate inputs
    const addToCartSchema = z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1).max(999),
    });

    const validatedData = addToCartSchema.parse({ productId, quantity });

    // Verify product exists and is in stock
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
      select: {
        id: true,
        name: true,
        customerPriceKobo: true,
        stockQty: true,
        images: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    if (!product.stockQty || product.stockQty < validatedData.quantity) {
      return NextResponse.json(
        { message: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Return product details for client-side cart
    return NextResponse.json(
      {
        message: 'Product validated',
        product: {
          id: product.id,
          name: product.name,
          price: product.customerPriceKobo,
          image: product.images?.[0] || '',
          quantity: validatedData.quantity,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Add to cart error:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { message: 'Invalid input data' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
