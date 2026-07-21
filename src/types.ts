export type CategoryType = 'Geral' | 'Trabalho' | 'Família' | 'Amigos' | 'Cliente';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  category: CategoryType;
  favorite: boolean;
  notes?: string;
  created_at?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  tableName: string;
  isConnected: boolean;
}

export type ViewMode = 'grid' | 'list';
