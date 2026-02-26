import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || !quantity) {
      return NextResponse.json(
        { message: 'Product ID and quantity are required' },
        { status: 400 }
      );
    }

    // TODO: Add to cart
    // 1. Verify token
    // 2. Get user ID from token
    // 3. Add item to cart in database

    return NextResponse.json(
      {
        message: 'Item added to cart',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
