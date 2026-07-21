import { Contact, SupabaseConfig } from '../types';
import { getSupabaseClient, getStoredSupabaseConfig } from './supabaseClient';

const LOCAL_STORAGE_CONTACTS_KEY = 'contacts_local_db_v1';

// Format phone helper (Brazilian format or raw)
export function formatPhoneNumber(value: string): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  
  // Format Brazilian phone (10 or 11 digits)
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  } else if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  
  return value;
}

// Format clean phone for WhatsApp link
export function getCleanPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 || digits.length === 10) {
    return `55${digits}`;
  }
  return digits;
}

// Initial sample data if local storage is empty
export const SAMPLE_CONTACTS: Omit<Contact, 'id'>[] = [
  {
    name: 'Ana Silva',
    phone: '(11) 98765-4321',
    email: 'ana.silva@exemplo.com.br',
    category: 'Trabalho',
    favorite: true,
    notes: 'Gerente de Projetos de TI',
    created_at: new Date().toISOString(),
  },
  {
    name: 'Carlos Oliveira',
    phone: '(21) 99887-6655',
    email: 'carlos.oliveira@email.com',
    category: 'Cliente',
    favorite: false,
    notes: 'Interessado na proposta comercial de software',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    name: 'Mariana Costa',
    phone: '(31) 97654-3210',
    email: 'mariana.costa@familia.com',
    category: 'Família',
    favorite: true,
    notes: 'Aniversário em 15 de Outubro',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    name: 'Lucas Pereira',
    phone: '(41) 99123-4567',
    email: 'lucas.pereira@dev.com',
    category: 'Amigos',
    favorite: false,
    notes: 'Desenvolvedor Frontend',
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
];

// Helper to get local contacts
export function getLocalContacts(): Contact[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CONTACTS_KEY);
    if (!raw) {
      // Seed initial sample contacts
      const initial = SAMPLE_CONTACTS.map((c, i) => ({
        ...c,
        id: `local-${Date.now()}-${i}`,
      }));
      localStorage.setItem(LOCAL_STORAGE_CONTACTS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erro ao ler contatos locais:', err);
    return [];
  }
}

export function saveLocalContacts(contacts: Contact[]): void {
  localStorage.setItem(LOCAL_STORAGE_CONTACTS_KEY, JSON.stringify(contacts));
}

// Main API layer that checks Supabase vs LocalStorage
export async function fetchContacts(config?: SupabaseConfig): Promise<{ contacts: Contact[]; isSupabase: boolean; error?: string }> {
  const cfg = config || getStoredSupabaseConfig();
  const supabase = cfg.isConnected ? getSupabaseClient(cfg) : null;

  if (supabase && cfg.isConnected) {
    try {
      const { data, error } = await supabase
        .from(cfg.tableName || 'contatos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Erro ao carregar do Supabase, caindo para local:', error.message);
        return {
          contacts: getLocalContacts(),
          isSupabase: false,
          error: `Erro Supabase: ${error.message}. Exibindo contatos locais.`,
        };
      }

      const formattedData: Contact[] = (data || []).map((item: any) => ({
        id: String(item.id),
        name: item.name || '',
        phone: item.phone || '',
        email: item.email || '',
        category: item.category || 'Geral',
        favorite: Boolean(item.favorite),
        notes: item.notes || '',
        created_at: item.created_at || new Date().toISOString(),
      }));

      return { contacts: formattedData, isSupabase: true };
    } catch (err: any) {
      return {
        contacts: getLocalContacts(),
        isSupabase: false,
        error: `Erro ao conectar: ${err?.message}. Exibindo contatos locais.`,
      };
    }
  }

  return { contacts: getLocalContacts(), isSupabase: false };
}

export async function createContact(
  contactData: Omit<Contact, 'id'>,
  config?: SupabaseConfig
): Promise<{ contact: Contact; isSupabase: boolean; error?: string }> {
  const cfg = config || getStoredSupabaseConfig();
  const supabase = cfg.isConnected ? getSupabaseClient(cfg) : null;

  const newContactPayload = {
    name: contactData.name.trim(),
    phone: contactData.phone.trim(),
    email: contactData.email.trim().toLowerCase(),
    category: contactData.category || 'Geral',
    favorite: Boolean(contactData.favorite),
    notes: contactData.notes?.trim() || '',
    created_at: new Date().toISOString(),
  };

  if (supabase && cfg.isConnected) {
    try {
      const { data, error } = await supabase
        .from(cfg.tableName || 'contatos')
        .insert([newContactPayload])
        .select();

      if (error) {
        throw new Error(error.message);
      }

      if (data && data.length > 0) {
        const item = data[0];
        const savedContact: Contact = {
          id: String(item.id),
          name: item.name,
          phone: item.phone,
          email: item.email,
          category: item.category,
          favorite: Boolean(item.favorite),
          notes: item.notes,
          created_at: item.created_at,
        };
        return { contact: savedContact, isSupabase: true };
      }
    } catch (err: any) {
      console.warn('Falha ao inserir no Supabase, salvando localmente:', err.message);
      // Fallback to local
    }
  }

  // Local Storage Save
  const localContacts = getLocalContacts();
  const newLocalContact: Contact = {
    ...newContactPayload,
    id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  };

  const updated = [newLocalContact, ...localContacts];
  saveLocalContacts(updated);

  return { contact: newLocalContact, isSupabase: false };
}

export async function updateContact(
  id: string,
  contactData: Partial<Omit<Contact, 'id'>>,
  config?: SupabaseConfig
): Promise<{ success: boolean; isSupabase: boolean; error?: string }> {
  const cfg = config || getStoredSupabaseConfig();
  const supabase = cfg.isConnected ? getSupabaseClient(cfg) : null;

  if (supabase && cfg.isConnected && !id.startsWith('local-')) {
    try {
      const { error } = await supabase
        .from(cfg.tableName || 'contatos')
        .update({
          ...(contactData.name && { name: contactData.name.trim() }),
          ...(contactData.phone !== undefined && { phone: contactData.phone.trim() }),
          ...(contactData.email !== undefined && { email: contactData.email.trim().toLowerCase() }),
          ...(contactData.category && { category: contactData.category }),
          ...(contactData.favorite !== undefined && { favorite: contactData.favorite }),
          ...(contactData.notes !== undefined && { notes: contactData.notes.trim() }),
        })
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
      return { success: true, isSupabase: true };
    } catch (err: any) {
      console.warn('Erro ao atualizar no Supabase:', err.message);
    }
  }

  // Local Storage update fallback
  const localContacts = getLocalContacts();
  const updated = localContacts.map((c) =>
    c.id === id ? { ...c, ...contactData } : c
  );
  saveLocalContacts(updated);

  return { success: true, isSupabase: false };
}

export async function deleteContact(
  id: string,
  config?: SupabaseConfig
): Promise<{ success: boolean; isSupabase: boolean; error?: string }> {
  const cfg = config || getStoredSupabaseConfig();
  const supabase = cfg.isConnected ? getSupabaseClient(cfg) : null;

  if (supabase && cfg.isConnected && !id.startsWith('local-')) {
    try {
      const { error } = await supabase
        .from(cfg.tableName || 'contatos')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
      return { success: true, isSupabase: true };
    } catch (err: any) {
      console.warn('Erro ao deletar no Supabase:', err.message);
    }
  }

  // Local Storage delete
  const localContacts = getLocalContacts();
  const updated = localContacts.filter((c) => c.id !== id);
  saveLocalContacts(updated);

  return { success: true, isSupabase: false };
}

export async function syncLocalContactsToSupabase(
  config?: SupabaseConfig
): Promise<{ count: number; error?: string }> {
  const cfg = config || getStoredSupabaseConfig();
  const supabase = cfg.isConnected ? getSupabaseClient(cfg) : null;

  if (!supabase || !cfg.isConnected) {
    return { count: 0, error: 'Supabase não está configurado ou conectado.' };
  }

  const localContacts = getLocalContacts();
  if (localContacts.length === 0) {
    return { count: 0 };
  }

  const payload = localContacts.map((c) => ({
    name: c.name,
    phone: c.phone,
    email: c.email,
    category: c.category,
    favorite: c.favorite,
    notes: c.notes || '',
    created_at: c.created_at || new Date().toISOString(),
  }));

  try {
    const { data, error } = await supabase
      .from(cfg.tableName || 'contatos')
      .insert(payload)
      .select();

    if (error) {
      return { count: 0, error: error.message };
    }

    return { count: data ? data.length : payload.length };
  } catch (err: any) {
    return { count: 0, error: err?.message || 'Erro ao sincronizar contatos.' };
  }
}
