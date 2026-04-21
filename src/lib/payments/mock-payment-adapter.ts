import type { PaymentAdapter } from './payment-adapter';

export class MockPaymentAdapter implements PaymentAdapter {
  async authorizePayment(args: {
    amount: number;
    currency: string;
    idempotencyKey: string;
  }): Promise<{ referenceId: string }> {
    const hash = args.idempotencyKey
      .split('')
      .reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) & 0xffffffff, 0);
    const referenceId = `mock_${Math.abs(hash).toString(16).padStart(8, '0')}`;
    return { referenceId };
  }
}
