import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../types';

const STORAGE_KEY = 'supabase_config_v1';

export function getStoredSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        url: parsed.url || envUrl,
        anonKey: parsed.anonKey || envKey,
        tableName: parsed.tableName || 'contatos',
        isConnected: Boolean(parsed.isConnected),
      };
    }
  } catch (err) {
    console.error('Erro ao ler configuração do Supabase:', err);
  }

  return {
    url: envUrl,
    anonKey: envKey,
    tableName: 'contatos',
    isConnected: Boolean(envUrl && envKey),
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(config?: SupabaseConfig): SupabaseClient | null {
  const cfg = config || getStoredSupabaseConfig();
  if (!cfg.url || !cfg.anonKey) {
    supabaseInstance = null;
    return null;
  }

  try {
    if (!supabaseInstance) {
      supabaseInstance = createClient(cfg.url, cfg.anonKey);
    }
    return supabaseInstance;
  } catch (error) {
    console.error('Erro ao criar cliente Supabase:', error);
    supabaseInstance = null;
    return null;
  }
}

export function resetSupabaseClient(): void {
  supabaseInstance = null;
}

export async function testSupabaseConnection(url: string, anonKey: string, tableName = 'contatos'): Promise<{ success: boolean; message: string }> {
  if (!url.trim() || !anonKey.trim()) {
    return { success: false, message: 'URL e Chave Anônima são obrigatórias.' };
  }

  try {
    const tempClient = createClient(url, anonKey);
    const { data, error } = await tempClient
      .from(tableName)
      .select('count', { count: 'exact', head: true });

    if (error) {
      // Check for table missing
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return { 
          success: false, 
          message: `Conexão efetuada, mas a tabela "${tableName}" não foi encontrada no banco. Crie-a no SQL Editor do Supabase.` 
        };
      }
      return { success: false, message: `Erro no Supabase: ${error.message}` };
    }

    return { success: true, message: `Conexão realizada com sucesso! Tabela "${tableName}" está pronta.` };
  } catch (err: any) {
    return { success: false, message: `Falha na conexão: ${err?.message || 'Verifique as credenciais.'}` };
  }
}
