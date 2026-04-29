'use server';

import { createServerClient } from '@/lib/auth-utils';
import { CreatePostSchema, UpdatePostSchema } from './schemas';
import { revalidatePath } from 'next/cache';

export async function getPosts() {
  const supabase = await createServerClient();

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Erro ao buscar posts: ' + error.message);
  }

  return posts || [];
}

export async function createPost(formData: FormData) {
  const supabase = await createServerClient();

  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const content = formData.get('content') as string;
  const cover_image = formData.get('cover_image') as string || null;
  const published = formData.get('published') === 'on';

  const validation = CreatePostSchema.safeParse({
    title,
    slug,
    content,
    cover_image,
    published,
  });

  if (!validation.success) {
    return {
      error: validation.error.errors[0]?.message || 'Erro de validação',
    };
  }

  const { data, error } = await supabase
    .from('posts')
    .insert([validation.data])
    .select()
    .single();

  if (error) {
    return { error: 'Erro ao criar post: ' + error.message };
  }

  revalidatePath('/admin/posts');
  revalidatePath('/blog');

  return { data, error: null };
}

export async function updatePost(id: string, formData: FormData) {
  const supabase = await createServerClient();

  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const content = formData.get('content') as string;
  const cover_image = formData.get('cover_image') as string || null;
  const published = formData.get('published') === 'on';

  const validation = UpdatePostSchema.safeParse({
    id,
    title,
    slug,
    content,
    cover_image,
    published,
  });

  if (!validation.success) {
    return {
      error: validation.error.errors[0]?.message || 'Erro de validação',
    };
  }

  const { data, error } = await supabase
    .from('posts')
    .update({
      title: validation.data.title,
      slug: validation.data.slug,
      content: validation.data.content,
      cover_image: validation.data.cover_image,
      published: validation.data.published,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: 'Erro ao atualizar post: ' + error.message };
  }

  revalidatePath('/admin/posts');
  revalidatePath('/blog');

  return { data, error: null };
}

export async function deletePost(id: string) {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: 'Erro ao deletar post: ' + error.message };
  }

  revalidatePath('/admin/posts');
  revalidatePath('/blog');

  return { error: null };
}

export async function uploadPostImage(file: File) {
  const supabase = await createServerClient();

  const timestamp = Date.now();
  const filename = `${timestamp}-${file.name.replace(/\s+/g, '-')}`;
  const path = `posts/${filename}`;

  const { data, error } = await supabase.storage
    .from('posts')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    return { error: 'Erro ao upload de imagem: ' + error.message };
  }

  const publicUrl = supabase.storage
    .from('posts')
    .getPublicUrl(data.path).data.publicUrl;

  return { url: publicUrl, error: null };
}
