'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { CreateProductSchema, UpdateProductSchema } from './schemas';
import { revalidatePath, unstable_cache } from 'next/cache';
import { generateEmbeddings } from './semantic-search';

export const getProducts = unstable_cache(
  async () => {
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Erro ao buscar produtos: ' + error.message);
    }

    return products || [];
  },
  ['products-list'],
  { revalidate: 600 }
);

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = formData.get('price') as string;
  const stock = formData.get('stock') as string;
  const category = formData.get('category') as string;
  const active = formData.get('active') === 'on';
  const images = JSON.parse(formData.get('images') as string || '[]');

  const validation = CreateProductSchema.safeParse({
    name,
    description,
    price: parseFloat(price),
    stock: parseInt(stock),
    category,
    active,
    images,
  });

  if (!validation.success) {
    return {
      error: validation.error.errors[0]?.message || 'Erro de validação',
    };
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert([validation.data])
    .select()
    .single();

  if (error) {
    return { error: 'Erro ao criar produto: ' + error.message };
  }

  const embeddingResult = await generateEmbeddings({
    productId: data.id,
    name: validation.data.name,
    description: validation.data.description ?? '',
  });

  if (embeddingResult.error) {
    return { error: embeddingResult.error };
  }

  revalidatePath('/admin/produtos');
  revalidatePath('/produtos');

  return { data, error: null };
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = formData.get('price') as string;
  const stock = formData.get('stock') as string;
  const category = formData.get('category') as string;
  const active = formData.get('active') === 'on';
  const images = JSON.parse(formData.get('images') as string || '[]');

  const validation = UpdateProductSchema.safeParse({
    id,
    name,
    description,
    price: parseFloat(price),
    stock: parseInt(stock),
    category,
    active,
    images,
  });

  if (!validation.success) {
    return {
      error: validation.error.errors[0]?.message || 'Erro de validação',
    };
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .update({
      name: validation.data.name,
      description: validation.data.description,
      price: validation.data.price,
      stock: validation.data.stock,
      category: validation.data.category,
      active: validation.data.active,
      images: validation.data.images,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: 'Erro ao atualizar produto: ' + error.message };
  }

  const embeddingResult = await generateEmbeddings({
    productId: id,
    name: validation.data.name,
    description: validation.data.description ?? '',
  });

  if (embeddingResult.error) {
    return { error: embeddingResult.error };
  }

  revalidatePath('/admin/produtos');
  revalidatePath('/produtos');

  return { data, error: null };
}

export async function deleteProduct(id: string) {
  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: 'Erro ao deletar produto: ' + error.message };
  }

  revalidatePath('/admin/produtos');
  revalidatePath('/produtos');

  return { error: null };
}

export async function uploadProductImage(file: File) {
  const timestamp = Date.now();
  const filename = `${timestamp}-${file.name.replace(/\s+/g, '-')}`;
  const path = `products/${filename}`;

  const { data, error } = await supabaseAdmin.storage
    .from('products')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    return { error: 'Erro ao upload de imagem: ' + error.message };
  }

  // Retorna URL pública
  const publicUrl = supabaseAdmin.storage
    .from('products')
    .getPublicUrl(data.path).data.publicUrl;

  return { url: publicUrl, error: null };
}
