import { MockPaymentAdapter } from './mock-payment-adapter';
import type { PaymentAdapter } from './payment-adapter';

export function getPaymentAdapter(): PaymentAdapter {
  return new MockPaymentAdapter();
}

export type { PaymentAdapter } from './payment-adapter';
