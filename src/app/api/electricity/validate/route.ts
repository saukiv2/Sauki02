import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateCustomer, parseDisco } from '@/lib/interswitch';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


const validateSchema = z.object({
  disco: z.string().min(1, 'DisCo required'),
  meterNo: z.string().min(3, 'Meter number required'),
});

/**
 * POST /api/electricity/validate
 * Validate customer meter number
 *
 * Request:
 * { disco: "IKEJA", meterNo: "12345678901" }
 *
 * Response:
 * { customerName, outstandingBalance, minimumAmount, customerCode }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const { disco: discoInput, meterNo } = validateSchema.parse(body);

    // Parse disco code
    const disco = parseDisco(discoInput);

    // Validate with Interswitch
    const customer = await validateCustomer(meterNo, disco);

    return NextResponse.json({
      success: true,
      data: {
        customerName: customer.customerName,
        meterNo,
        disco,
        outstandingBalance: (customer.outstandingBalance / 100).toFixed(2),
        minimumAmount: (customer.minimumAmount / 100).toFixed(2),
        customerCode: customer.customerCode,
      },
    });
  } catch (error) {
    console.error('Electricity validation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    const message = (error as Error).message || 'Validation failed';
    return NextResponse.json(
      { message },
      { status: 400 }
    );
  }
}
