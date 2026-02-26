import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const revalidate = 0;


const uploadDir = join(process.cwd(), 'public', 'uploads', 'products');

const productSchema = z.object({
  name: z.string().min(1, 'Product name required'),
  categoryId: z.string().min(1, 'Category required'),
  description: z.string().min(10, 'Description too short'),
  customerPriceKobo: z.number().min(100, 'Price too low'),
  agentPriceKobo: z.number().min(100, 'Agent price too low'),
  stockQty: z.number().min(0, 'Stock cannot be negative'),
  specs: z.record(z.string()).optional(),
});

/**
 * POST /api/products/upload
 * Upload a new product with image processing
 *
 * Content-Type: multipart/form-data
 * Form fields:
 * - name: string
 * - categoryId: string
 * - description: string
 * - customerPriceKobo: number
 * - agentPriceKobo: number
 * - stockQty: number
 * - specs: JSON string (optional)
 * - images: File[] (multiple images)
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin role
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Read multipart form
    const formData = await request.formData();

    // Extract fields
    const name = formData.get('name') as string;
    const categoryId = formData.get('categoryId') as string;
    const description = formData.get('description') as string;
    const customerPriceKobo = parseInt(formData.get('customerPriceKobo') as string);
    const agentPriceKobo = parseInt(formData.get('agentPriceKobo') as string);
    const stockQty = parseInt(formData.get('stockQty') as string);
    const specsJson = formData.get('specs') as string;

    // Validate
    const specs = specsJson ? JSON.parse(specsJson) : {};
    const validated = productSchema.parse({
      name,
      categoryId,
      description,
      customerPriceKobo,
      agentPriceKobo,
      stockQty,
      specs,
    });

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    // Create upload directory if needed
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // Directory might already exist
    }

    // Process and store images
    const imageUrls: string[] = [];
    let fileIndex = 0;

    // Get all files from form
    for (const [key, value] of formData.entries()) {
      if (key === 'images' && value instanceof File) {
        const file = value as File;
        const buffer = await file.arrayBuffer();
        const imageBuffer = Buffer.from(buffer);

        // Convert to WebP
        const webpBuffer = await sharp(imageBuffer)
          .resize(800, 800, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 85 })
          .toBuffer();

        // Generate filename
        const filename = `${uuidv4()}-${fileIndex}.webp`;
        fileIndex++;

        // Save file
        const filepath = join(uploadDir, filename);
        await writeFile(filepath, webpBuffer);

        // Add URL
        imageUrls.push(`/uploads/products/${filename}`);
      }
    }

    if (imageUrls.length === 0) {
      return NextResponse.json(
        { message: 'At least one image required' },
        { status: 400 }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name: validated.name,
        categoryId: validated.categoryId,
        description: validated.description,
        images: imageUrls,
        specs: validated.specs,
        customerPriceKobo: validated.customerPriceKobo,
        agentPriceKobo: validated.agentPriceKobo,
        stockQty: validated.stockQty,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Product uploaded successfully',
      data: {
        id: product.id,
        name: product.name,
        images: product.images,
        price: (product.customerPriceKobo / 100).toFixed(2),
      },
    });
  } catch (error) {
    console.error('Product upload error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: 'Invalid specs JSON' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to upload product' },
      { status: 500 }
    );
  }
}
