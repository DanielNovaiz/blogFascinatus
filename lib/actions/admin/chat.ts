'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSupabaseClient } from '@/lib/admin/auth';
import type { ChatStatus } from '@/types/chat';

export async function getAllChats() {
  const supabase = await getAdminSupabaseClient();

  const { data, error } = await supabase
    .from('support_chats')
    .select('*, admin_users(full_name)')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getChat(chatId: string) {
  const supabase = await getAdminSupabaseClient();

  const { data, error } = await supabase
    .from('support_chats')
    .select('*, chat_messages(*)')
    .eq('id', chatId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateChatStatus(chatId: string, status: ChatStatus, assignedTo?: string) {
  const supabase = await getAdminSupabaseClient();

  const updateData: any = { status };
  if (assignedTo) {
    updateData.assigned_to = assignedTo;
  }

  const { error } = await supabase
    .from('support_chats')
    .update(updateData)
    .eq('id', chatId);

  if (error) throw error;

  revalidatePath('/admin/chat/[chatId]');
}

export async function sendMessage(chatId: string, message: string, adminId: string) {
  const supabase = await getAdminSupabaseClient();

  const { error } = await supabase
    .from('chat_messages')
    .insert({
      chat_id: chatId,
      sender: 'admin',
      sender_id: adminId,
      message,
    });

  if (error) throw error;

  // Update chat updated_at
  await supabase
    .from('support_chats')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', chatId);

  revalidatePath('/admin/chat/[chatId]');
}

export async function markMessagesAsRead(chatId: string) {
  const supabase = await getAdminSupabaseClient();

  const { error } = await supabase
    .from('chat_messages')
    .update({ is_read: true })
    .eq('chat_id', chatId)
    .eq('sender', 'customer');

  if (error) throw error;

  revalidatePath('/admin/chat/[chatId]');
}
