export type CartLine = {
  productId: string;
  sku: string;
  name: string;
  unitPrice: number;
  imageUrl: string | null;
  quantity: number;
};

export type CartPayload = Omit<CartLine, 'quantity'>;
