import axios from 'axios';

const FLW_BASE_URL = 'https://api.flutterwave.com/v3';

// Defer reading secret until it's needed
const getFLWSecretKey = () => process.env.FLW_SECRET_KEY || '';

export interface FlutterwavePaymentRequest {
  amount: number;
  currency: string;
  reference: string;
  customer_email: string;
  customer_name: string;
}

/**
 * Initialize Flutterwave payment
 */
export async function initializeFlutterwavePayment(
  payload: FlutterwavePaymentRequest
): Promise<any> {
  try {
    const FLW_SECRET_KEY = getFLWSecretKey();
    const response = await axios.post(
      `${FLW_BASE_URL}/payments`,
      {
        tx_ref: payload.reference,
        amount: payload.amount,
        currency: payload.currency,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/flutterwave/callback`,
        meta: {
          consumer_id: payload.customer_email,
        },
        customer: {
          email: payload.customer_email,
          name: payload.customer_name,
        },
        customizations: {
          title: 'SaukiMart',
          logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Flutterwave initialization error:', error);
    return null;
  }
}

/**
 * Verify Flutterwave transaction
 */
export async function verifyFlutterwaveTransaction(
  transactionId: string
): Promise<any> {
  try {
    const response = await axios.get(
      `${FLW_BASE_URL}/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Flutterwave verification error:', error);
    return null;
  }
}
