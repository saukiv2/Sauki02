import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';


const updateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  customerPriceKobo: z.number().optional(),
  agentPriceKobo: z.number().optional(),
  stockQty: z.number().optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/products/:id
 * Get product details
 *
 * Query parameters:
 * - userType: CUSTOMER or AGENT (for pricing)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        orderItems: {
          select: { orderId: true },
          take: 0,
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        category: product.category.name,
        categoryId: product.categoryId,
        description: product.description,
        specs: product.specs,
        images: product.images,
        customerPrice: (product.customerPriceKobo / 100).toFixed(2),
        agentPrice: (product.agentPriceKobo / 100).toFixed(2),
        stock: product.stockQty,
        inStock: product.stockQty > 0,
        isActive: product.isActive,
        createdAt: product.createdAt,
      },
    });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/products/:id
 * Update product (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin role
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = updateSchema.parse(body);

    const product = await prisma.product.update({
      where: { id: params.id },
      data: validated,
    });

    return NextResponse.json({
      success: true,
      message: 'Product updated',
      data: {
        id: product.id,
        name: product.name,
        price: (product.customerPriceKobo / 100).toFixed(2),
      },
    });
  } catch (error) {
    console.error('Update product error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to update product' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/:id
 * Delete product (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin role
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { message: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
