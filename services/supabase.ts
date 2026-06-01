import { createClient } from '@supabase/supabase-js';
import { Prompt, UserProfile } from '../types';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const isSupabaseConfigured = () =>
  Boolean(url && key && url.startsWith('https://'));

export const supabase = isSupabaseConfigured()
  ? createClient(url, key)
  : (null as any);

// Map snake_case DB row → camelCase Prompt
function rowToPrompt(row: any): Prompt {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    content: row.content,
    content2: row.content2 ?? undefined,
    content3: row.content3 ?? undefined,
    content4: row.content4 ?? undefined,
    content5: row.content5 ?? undefined,
    content6: row.content6 ?? undefined,
    content7: row.content7 ?? undefined,
    instructions: row.instructions ?? undefined,
    category: row.category,
    tags: row.tags ?? [],
    tools: row.tools ?? [],
    testedModels: row.tested_models ?? [],
    youtubeUrl: row.youtube_url ?? undefined,
    author: row.author,
    likes: row.likes ?? 0,
    copyCount: row.copy_count ?? 0,
    createdAt: row.created_at,
  };
}

// Map camelCase Prompt → snake_case DB row
function promptToRow(p: Omit<Prompt, 'id' | 'createdAt' | 'likes'>) {
  return {
    title: p.title,
    description: p.description,
    content: p.content,
    content2: p.content2 || null,
    content3: p.content3 || null,
    content4: p.content4 || null,
    content5: p.content5 || null,
    content6: p.content6 || null,
    content7: p.content7 || null,
    instructions: p.instructions || null,
    category: p.category,
    tags: p.tags,
    tools: p.tools ?? [],
    tested_models: p.testedModels ?? [],
    youtube_url: p.youtubeUrl || null,
    author: p.author,
    copy_count: p.copyCount ?? 0,
  };
}

export async function fetchPrompts(): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToPrompt);
}

export function subscribeToPrompts(callback: (prompts: Prompt[]) => void) {
  const channel = supabase
    .channel('prompts-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'prompts' }, () => {
      fetchPrompts().then(callback).catch(console.error);
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export async function addPrompt(data: Omit<Prompt, 'id' | 'createdAt' | 'likes'>) {
  const { error } = await supabase.from('prompts').insert([promptToRow(data)]);
  if (error) throw error;
}

export async function updatePrompt(id: string, data: Omit<Prompt, 'id' | 'createdAt' | 'likes'>) {
  const { error } = await supabase.from('prompts').update(promptToRow(data)).eq('id', id);
  if (error) throw error;
}

export async function deletePrompt(id: string) {
  const { error } = await supabase.from('prompts').delete().eq('id', id);
  if (error) throw error;
}

export async function incrementCopyCount(id: string) {
  await supabase.rpc('increment_copy_count', { prompt_id: id });
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data ?? null;
}

export async function getFavorites(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('favorites')
    .select('prompt_id')
    .eq('user_id', userId);
  return (data ?? []).map((f: any) => f.prompt_id);
}

export async function toggleFavorite(userId: string, promptId: string, currentlyFav: boolean) {
  if (currentlyFav) {
    await supabase.from('favorites').delete().eq('user_id', userId).eq('prompt_id', promptId);
  } else {
    await supabase.from('favorites').insert([{ user_id: userId, prompt_id: promptId }]);
  }
}
