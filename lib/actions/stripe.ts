'use server';

import Stripe from 'stripe';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

const CartItemSchema = z.object({
  productId: z.string().uuid(),
  qty: z.coerce.number().int().positive().max(1000),
});

const CreateCheckoutSessionSchema = z.object({
  items: z.array(CartItemSchema).min(1, 'Carrinho vazio'),
  customerEmail: z.string().email().optional().or(z.literal('')),
});

export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionSchema>;

type ProductRow = {
  id: string;
  name: string;
  price: number;
  stock: number;
  active: boolean | null;
};

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY não configurada');
  }

  return new Stripe(secretKey, {} as any);
}

export async function createCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<string> {
  const parsed = CreateCheckoutSessionSchema.parse(input);
  const normalizedItems = Object.values(
    parsed.items.reduce<Record<string, z.infer<typeof CartItemSchema>>>(
      (accumulator, item) => {
        const existing = accumulator[item.productId];

        if (existing) {
          existing.qty += item.qty;
        } else {
          accumulator[item.productId] = { ...item };
        }

        return accumulator;
      },
      {}
    )
  );

  const productIds = normalizedItems.map((item) => item.productId);
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, price, stock, active')
    .in('id', productIds)
    .eq('active', true);

  if (error) {
    throw new Error(`Erro ao consultar produtos: ${error.message}`);
  }

  const productsById = new Map<string, ProductRow>(
    (products ?? []).map((product) => [product.id, product as ProductRow])
  );

  for (const item of normalizedItems) {
    const product = productsById.get(item.productId);

    if (!product) {
      throw new Error('Um ou mais produtos não estão mais disponíveis');
    }

    if (item.qty > product.stock) {
      throw new Error(`Estoque insuficiente para ${product.name}`);
    }
  }

  const stripe = getStripeClient();
  const currency = 'brl';
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = normalizedItems.map(
    (item) => {
      const product = productsById.get(item.productId)!;

      return {
        quantity: item.qty,
        price_data: {
          currency,
          unit_amount: Math.round(Number(product.price) * 100),
          product_data: {
            name: product.name,
          },
        },
      };
    }
  );

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancelado`,
    customer_email: parsed.customerEmail || undefined,
    client_reference_id: parsed.customerEmail || undefined,
    metadata: {
      cart_items: JSON.stringify(normalizedItems),
      customer_email: parsed.customerEmail || '',
    },
    payment_intent_data: {
      metadata: {
        cart_items: JSON.stringify(normalizedItems),
        customer_email: parsed.customerEmail || '',
      },
    },
  });

  if (!session.url) {
    throw new Error('Não foi possível criar a sessão de checkout');
  }

  return session.url;
}