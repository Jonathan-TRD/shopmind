export type AuthorizePaymentArgs = {
  amount: number;
  currency: string;
  idempotencyKey: string;
};

export type AuthorizePaymentResult = {
  referenceId: string;
};

export interface PaymentAdapter {
  authorizePayment(args: AuthorizePaymentArgs): Promise<AuthorizePaymentResult>;
}
