import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(255),
  description: z.string().optional().default(''),
  price: z.coerce.number().positive('Preço deve ser positivo'),
  stock: z.coerce.number().int().min(0, 'Stock não pode ser negativo'),
  category: z.string().min(1, 'Categoria obrigatória'),
  active: z.boolean().default(true),
  images: z.array(z.string().url()).optional().default([]),
});

export const UpdateProductSchema = CreateProductSchema.extend({
  id: z.string().uuid(),
});

export const CreatePostSchema = z.object({
  title: z.string().min(1, 'Título obrigatório').max(255),
  slug: z.string().min(1, 'Slug obrigatório').max(255),
  content: z.string().min(1, 'Conteúdo obrigatório'),
  cover_image: z.string().url().optional().nullable(),
  published: z.boolean().default(false),
});

export const UpdatePostSchema = CreatePostSchema.extend({
  id: z.string().uuid(),
});

export const UpdateOrderStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'paid', 'shipped', 'done']),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
