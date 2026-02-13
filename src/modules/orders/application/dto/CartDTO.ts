export interface CartItemDTO {
  productId: string;
  productName: string;
  quantity: number;
  priceAtOrder: number;
  subtotal: number;
}

export interface CartDTO {
  id: string;
  userId: string;
  items: CartItemDTO[];
  total: number;
  itemCount: number;
  expiresAt: string;
}

export interface AddToCartDTO {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}
