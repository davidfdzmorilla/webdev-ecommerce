'use server';

import { getRedis } from '@/shared/infrastructure/redis';
import { cookies } from 'next/headers';
import { Price } from '@/modules/catalog/domain/value-objects/Price';

export interface CartItem {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: Price;
}

interface CartData {
  items: CartItem[];
}

const CART_COOKIE_NAME = 'cart_session';
const CART_EXPIRY = 60 * 60 * 24 * 7; // 7 days

async function getCartKey(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(CART_COOKIE_NAME)?.value;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    cookieStore.set(CART_COOKIE_NAME, sessionId, {
      httpOnly: true,
      maxAge: CART_EXPIRY,
      path: '/',
    });
  }

  return `cart:${sessionId}`;
}

export async function getCart(): Promise<CartData> {
  const redis = await getRedis();
  const key = await getCartKey();
  const data = await redis.get(key);

  if (!data) {
    return { items: [] };
  }

  return JSON.parse(data);
}

export async function addToCart(item: Omit<CartItem, 'quantity'> & { quantity?: number }): Promise<void> {
  const redis = await getRedis();
  const key = await getCartKey();
  const cart = await getCart();

  const existingItem = cart.items.find((i) => i.productId === item.productId);

  if (existingItem) {
    existingItem.quantity += item.quantity || 1;
  } else {
    cart.items.push({
      ...item,
      quantity: item.quantity || 1,
    });
  }

  await redis.setEx(key, CART_EXPIRY, JSON.stringify(cart));
}

export async function updateCartItem(productId: string, quantity: number): Promise<void> {
  const redis = await getRedis();
  const key = await getCartKey();
  const cart = await getCart();

  const item = cart.items.find((i) => i.productId === productId);

  if (item) {
    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.productId !== productId);
    } else {
      item.quantity = quantity;
    }
  }

  await redis.setEx(key, CART_EXPIRY, JSON.stringify(cart));
}

export async function removeFromCart(productId: string): Promise<void> {
  await updateCartItem(productId, 0);
}

export async function clearCart(): Promise<void> {
  const redis = await getRedis();
  const key = await getCartKey();
  await redis.del(key);
}

export async function getCartTotal(): Promise<Price> {
  const cart = await getCart();
  return cart.items.reduce((total, item) => {
    return total.add(item.unitPrice.multiply(item.quantity));
  }, Price.create(0));
}
