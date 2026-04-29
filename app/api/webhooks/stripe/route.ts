import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

type CartItem = {
  productId: string;
  qty: number;
};

type ProductRow = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY não configurada');
  }

  return new Stripe(secretKey, {} as any);
}

async function sendConfirmationEmail(payload: {
  email: string;
  orderId: string;
  total: number;
  items: Array<{ name: string; qty: number; price: number }>;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    console.warn('Resend não configurado; email de confirmação não será enviado.');
    return;
  }

  const htmlItems = payload.items
    .map(
      (item) =>
        `<li>${item.qty}x ${item.name} - R$ ${(item.price * item.qty).toFixed(2)}</li>`
    )
    .join('');

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [payload.email],
      subject: `Confirmação do pedido ${payload.orderId.slice(0, 8)}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111">
          <h2>Seu pedido foi confirmado</h2>
          <p>Pedido: <strong>${payload.orderId.slice(0, 8)}</strong></p>
          <p>Total: <strong>R$ ${payload.total.toFixed(2)}</strong></p>
          <p>Itens:</p>
          <ul>${htmlItems}</ul>
          <p>Obrigado por comprar no blogFascinatus.</p>
        </div>
      `,
      text: `Seu pedido ${payload.orderId.slice(0, 8)} foi confirmado. Total: R$ ${payload.total.toFixed(
        2
      )}.`,
    }),
  });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const paymentIntentId =
    typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;

  if (!paymentIntentId) {
    throw new Error('checkout.session.completed sem payment_intent');
  }

  const parsedItems = JSON.parse(session.metadata?.cart_items || '[]') as CartItem[];
  if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
    throw new Error('checkout.session.completed sem itens no metadata');
  }

  const customerEmail =
    session.customer_details?.email || session.customer_email || session.metadata?.customer_email;

  if (!customerEmail) {
    throw new Error('checkout.session.completed sem email do cliente');
  }

  const { data: existingOrder, error: existingError } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('stripe_payment_id', paymentIntentId)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Erro ao verificar idempotência: ${existingError.message}`);
  }

  if (existingOrder) {
    return;
  }

  const productIds = parsedItems.map((item) => item.productId);
  const { data: products, error: productsError } = await supabaseAdmin
    .from('products')
    .select('id, name, price, stock')
    .in('id', productIds);

  if (productsError) {
    throw new Error(`Erro ao consultar produtos: ${productsError.message}`);
  }

  const productMap = new Map<string, ProductRow>(
    (products ?? []).map((product) => [product.id, product as ProductRow])
  );

  const orderItems = parsedItems.map((cartItem) => {
    const product = productMap.get(cartItem.productId);

    if (!product) {
      throw new Error(`Produto não encontrado no webhook: ${cartItem.productId}`);
    }

    return {
      product_id: product.id,
      quantity: cartItem.qty,
      price_at_purchase: Number(product.price),
      name: product.name,
    };
  });

  const total = orderItems.reduce(
    (sum, item) => sum + Number(item.price_at_purchase) * item.quantity,
    0
  );

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert([
      {
        customer_email: customerEmail,
        items: orderItems,
        total,
        status: 'paid',
        stripe_payment_id: paymentIntentId,
      },
    ])
    .select('id')
    .single();

  if (orderError) {
    if (String(orderError.message).includes('duplicate key')) {
      return;
    }

    throw new Error(`Erro ao criar order: ${orderError.message}`);
  }

  for (const item of orderItems) {
    const product = productMap.get(item.product_id)!;
    const nextStock = Math.max(product.stock - item.quantity, 0);

    const { error: stockError } = await supabaseAdmin
      .from('products')
      .update({ stock: nextStock })
      .eq('id', item.product_id);

    if (stockError) {
      console.error(`Erro ao atualizar stock do produto ${item.product_id}:`, stockError.message);
    }
  }

  await sendConfirmationEmail({
    email: customerEmail,
    orderId: order.id,
    total,
    items: orderItems.map((item) => ({
      name: item.name,
      qty: item.quantity,
      price: Number(item.price_at_purchase),
    })),
  });
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET não configurada' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid webhook signature';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    void handleCheckoutSessionCompleted(session).catch((error) => {
      console.error('Erro ao processar checkout.session.completed:', error);
    });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}