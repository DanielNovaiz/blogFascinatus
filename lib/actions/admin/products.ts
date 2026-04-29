'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSupabaseClient } from '@/lib/admin/auth';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  price: z.number().positive(),
  category: z.string().min(1),
  stock: z.number().int().min(0),
  images: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

export async function createProduct(formData: FormData) {
  const supabase = await getAdminSupabaseClient();
  
  const data = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: parseFloat(formData.get('price') as string),
    category: formData.get('category') as string,
    stock: parseInt(formData.get('stock') as string),
    images: formData.get('images') ? JSON.parse(formData.get('images') as string) : [],
    active: formData.get('active') === 'true',
  };

  const validated = productSchema.parse(data);

  const { error } = await supabase
    .from('products')
    .insert(validated);

  if (error) throw error;

  revalidatePath('/admin/produtos');
  revalidatePath('/produtos');
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await getAdminSupabaseClient();
  
  const data = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: parseFloat(formData.get('price') as string),
    category: formData.get('category') as string,
    stock: parseInt(formData.get('stock') as string),
    images: formData.get('images') ? JSON.parse(formData.get('images') as string) : [],
    active: formData.get('active') === 'true',
  };

  const validated = productSchema.parse(data);

  const { error } = await supabase
    .from('products')
    .update(validated)
    .eq('id', id);

  if (error) throw error;

  revalidatePath('/admin/produtos');
  revalidatePath('/admin/produtos/[id]');
  revalidatePath('/produtos');
  revalidatePath('/produtos/[id]');
}

export async function deleteProduct(id: string) {
  const supabase = await getAdminSupabaseClient();

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;

  revalidatePath('/admin/produtos');
  revalidatePath('/produtos');
}

export async function getProduct(id: string) {
  const supabase = await getAdminSupabaseClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getAllProducts() {
  const supabase = await getAdminSupabaseClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getProductsByCategory(category: string) {
  const supabase = await getAdminSupabaseClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('name');

  if (error) throw error;
  return data;
}
