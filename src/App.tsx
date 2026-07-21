import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { ControlsBar } from './components/ControlsBar';
import { ContactCard } from './components/ContactCard';
import { ContactListItem } from './components/ContactListItem';
import { ContactFormModal } from './components/ContactFormModal';
import { SupabaseSettingsModal } from './components/SupabaseSettingsModal';
import { SqlGuideModal } from './components/SqlGuideModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

import { Contact, SupabaseConfig, ViewMode } from './types';
import {
  fetchContacts,
  createContact,
  updateContact,
  deleteContact,
  saveLocalContacts,
  getLocalContacts,
  SAMPLE_CONTACTS,
} from './lib/contactsService';
import { getStoredSupabaseConfig, saveSupabaseConfig } from './lib/supabaseClient';
import { Users, Plus, AlertCircle, Database, Sparkles, Check, Info } from 'lucide-react';

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getStoredSupabaseConfig());
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Layout State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSqlGuideModalOpen, setIsSqlGuideModalOpen] = useState(false);

  // Show toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Contacts on startup and when config changes
  const loadContacts = async (cfg?: SupabaseConfig) => {
    setIsLoading(true);
    setErrorMessage(null);
    const configToUse = cfg || supabaseConfig;

    const res = await fetchContacts(configToUse);
    setContacts(res.contacts);

    if (res.error) {
      setErrorMessage(res.error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadContacts();
  }, []);

  // Save new or updated contact
  const handleSaveContact = async (
    contactData: Omit<Contact, 'id'>,
    id?: string
  ) => {
    if (id) {
      // Update
      const res = await updateContact(id, contactData, supabaseConfig);
      if (res.success) {
        showToast('Contato atualizado com sucesso!');
        await loadContacts();
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } else {
      // Create
      const res = await createContact(contactData, supabaseConfig);
      if (res.contact) {
        showToast(
          res.isSupabase
            ? 'Contato salvo no Supabase!'
            : 'Contato salvo no armazenamento local!'
        );
        await loadContacts();
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    }
  };

  // Delete Contact
  const handleConfirmDelete = async () => {
    if (!deletingContact) return;
    const res = await deleteContact(deletingContact.id, supabaseConfig);
    if (res.success) {
      showToast('Contato excluído com sucesso.');
      await loadContacts();
    } else if (res.error) {
      setErrorMessage(res.error);
    }
    setIsDeleteModalOpen(false);
    setDeletingContact(null);
  };

  // Toggle Favorite
  const handleToggleFavorite = async (contact: Contact) => {
    const updatedFav = !contact.favorite;
    // Optimistic UI update
    setContacts((prev) =>
      prev.map((c) => (c.id === contact.id ? { ...c, favorite: updatedFav } : c))
    );

    await updateContact(contact.id, { favorite: updatedFav }, supabaseConfig);
  };

  // Save Supabase Configuration
  const handleSaveSupabaseConfig = (newConfig: SupabaseConfig) => {
    saveSupabaseConfig(newConfig);
    setSupabaseConfig(newConfig);
    showToast(
      newConfig.isConnected
        ? 'Configurações do Supabase salvas e conectadas!'
        : 'Modo local ativado.'
    );
    loadContacts(newConfig);
  };

  // Seed sample data
  const handleSeedSampleData = async () => {
    setIsLoading(true);
    for (const item of SAMPLE_CONTACTS) {
      await createContact(item, supabaseConfig);
    }
    showToast('Contatos de exemplo gerados!');
    await loadContacts();
  };

  // Export CSV
  const handleExportCSV = () => {
    if (contacts.length === 0) {
      showToast('Nenhum contato para exportar.');
      return;
    }

    const headers = ['Nome', 'Telefone', 'E-mail', 'Categoria', 'Favorito', 'Observações'];
    const rows = contacts.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone.replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${c.category}"`,
      c.favorite ? 'Sim' : 'Não',
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `contatos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Arquivo CSV exportado!');
  };

  // Export JSON
  const handleExportJSON = () => {
    if (contacts.length === 0) {
      showToast('Nenhum contato para exportar.');
      return;
    }

    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(contacts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `contatos_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup JSON exportado!');
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            setIsLoading(true);
            for (const item of parsed) {
              if (item.name) {
                await createContact(
                  {
                    name: item.name,
                    phone: item.phone || '',
                    email: item.email || '',
                    category: item.category || 'Geral',
                    favorite: Boolean(item.favorite),
                    notes: item.notes || '',
                  },
                  supabaseConfig
                );
              }
            }
            showToast('Contatos importados com sucesso!');
            await loadContacts();
          } else {
            setErrorMessage('Formato de arquivo JSON inválido. Deve ser uma lista de contatos.');
          }
        } catch (err) {
          setErrorMessage('Erro ao ler arquivo JSON de contatos.');
        }
      };
    }
  };

  // Filtered Contacts Logic
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // Search term match
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        c.name.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.notes && c.notes.toLowerCase().includes(term));

      // Category match
      const matchesCategory =
        selectedCategory === 'ALL' || c.category === selectedCategory;

      // Favorites match
      const matchesFavorites = !onlyFavorites || c.favorite;

      return matchesSearch && matchesCategory && matchesFavorites;
    });
  }, [contacts, searchTerm, selectedCategory, onlyFavorites]);

  const favoriteCount = useMemo(() => contacts.filter((c) => c.favorite).length, [contacts]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-[#FF3E00] selection:text-white">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#FF3E00] text-black font-black uppercase tracking-wider px-5 py-3 shadow-2xl flex items-center gap-3 text-xs animate-in slide-in-from-bottom-5 duration-200">
          <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        config={supabaseConfig}
        totalContacts={contacts.length}
        favoriteCount={favoriteCount}
        onOpenAddModal={() => {
          setEditingContact(null);
          setIsFormModalOpen(true);
        }}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenSqlGuideModal={() => setIsSqlGuideModalOpen(true)}
        onRefresh={() => loadContacts()}
        isLoading={isLoading}
      />

      {/* Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-5 bg-black border border-rose-500 text-xs sm:text-sm text-rose-400 flex items-start justify-between gap-3 font-mono">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 stroke-[3]" />
              <div>
                <strong className="block font-black uppercase tracking-wider">AVISO DO SISTEMA:</strong>
                <p className="mt-1 text-white/80">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-black text-rose-400 uppercase tracking-widest hover:underline shrink-0"
            >
              FECHAR
            </button>
          </div>
        )}

        {/* Supabase Not Configured Info Bar */}
        {!supabaseConfig.isConnected && (
          <div className="p-5 bg-black border border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#FF3E00] text-black shrink-0 font-black">
                <Database className="w-5 h-5 stroke-[3]" />
              </div>
              <div className="text-xs">
                <h4 className="font-black italic uppercase tracking-tighter text-white text-base">
                  MODO DE ARMAZENAMENTO LOCAL ATIVO<span className="text-[#FF3E00]">.</span>
                </h4>
                <p className="text-white/50 font-mono text-[11px] mt-0.5">
                  Conecte seu projeto Supabase (URL + Anon Key) para sincronizar seus dados em nuvem.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setIsSqlGuideModalOpen(true)}
                className="px-4 py-2 bg-black hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest border border-white/20 transition-colors"
              >
                SCRIPT SQL
              </button>
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="px-5 py-2 bg-white hover:bg-[#FF3E00] text-black hover:text-white text-xs font-black uppercase tracking-widest transition-colors duration-200"
              >
                CONECTAR SUPABASE
              </button>
            </div>
          </div>
        )}

        {/* Controls Bar: Search, Category Filters, View Switcher & Export */}
        <ControlsBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onlyFavorites={onlyFavorites}
          onToggleOnlyFavorites={() => setOnlyFavorites(!onlyFavorites)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onExportCSV={handleExportCSV}
          onExportJSON={handleExportJSON}
          onImportJSON={handleImportJSON}
          onSeedSampleData={handleSeedSampleData}
          totalCount={contacts.length}
        />

        {/* Contacts Content Grid/List */}
        <div className="min-h-[350px]">
          {isLoading ? (
            /* Skeleton Loading State */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-44 bg-black border border-white/10 animate-pulse p-6 space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-white/10 w-3/4"></div>
                      <div className="h-3 bg-white/5 w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-10 bg-white/5"></div>
                  <div className="h-10 bg-white/5"></div>
                </div>
              ))}
            </div>
          ) : filteredContacts.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 px-6 bg-black border border-white/20 max-w-lg mx-auto space-y-5">
              <div className="w-16 h-16 bg-[#FF3E00] text-black flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">
                  NENHUM CONTATO ENCONTRADO<span className="text-[#FF3E00]">.</span>
                </h3>
                <p className="text-xs font-mono text-white/50 mt-2 uppercase tracking-wider">
                  {searchTerm || selectedCategory !== 'ALL' || onlyFavorites
                    ? 'Ajuste seus termos de busca ou filtros de categoria.'
                    : 'A lista de contatos está vazia. Crie seu primeiro registro agora!'}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                {contacts.length === 0 ? (
                  <button
                    onClick={handleSeedSampleData}
                    className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-white/10 text-white border border-white/20 text-xs font-black uppercase tracking-widest transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-[#FF3E00]" />
                    <span>GERAR EXEMPLOS</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('ALL');
                      setOnlyFavorites(false);
                    }}
                    className="px-5 py-2.5 bg-black hover:bg-white/10 text-white border border-white/20 text-xs font-black uppercase tracking-widest transition-colors"
                  >
                    LIMPAR FILTROS
                  </button>
                )}

                <button
                  onClick={() => {
                    setEditingContact(null);
                    setIsFormModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white text-black hover:bg-[#FF3E00] hover:text-white text-xs font-black uppercase tracking-widest transition-colors"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>NOVO CONTATO</span>
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onEdit={(c) => {
                    setEditingContact(c);
                    setIsFormModalOpen(true);
                  }}
                  onDelete={(c) => {
                    setDeletingContact(c);
                    setIsDeleteModalOpen(true);
                  }}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {filteredContacts.map((contact) => (
                <ContactListItem
                  key={contact.id}
                  contact={contact}
                  onEdit={(c) => {
                    setEditingContact(c);
                    setIsFormModalOpen(true);
                  }}
                  onDelete={(c) => {
                    setDeletingContact(c);
                    setIsDeleteModalOpen(true);
                  }}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-8 mt-16 text-center text-xs text-white/40 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="uppercase tracking-widest text-[10px]">
            AGENDA DE CONTATOS — <strong className="text-white">SUPABASE DATABASE</strong> & LOCAL STORAGE
          </p>
          <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest font-bold">
            <button
              onClick={() => setIsSqlGuideModalOpen(true)}
              className="text-white/60 hover:text-[#FF3E00] transition-colors"
            >
              SCRIPT SQL
            </button>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="text-white/60 hover:text-[#FF3E00] transition-colors"
            >
              CONFIGURAR BANCO
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ContactFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingContact(null);
        }}
        onSave={handleSaveContact}
        editingContact={editingContact}
      />

      <SupabaseSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={supabaseConfig}
        onSaveConfig={handleSaveSupabaseConfig}
        onOpenSqlGuide={() => setIsSqlGuideModalOpen(true)}
        onContactsUpdated={() => loadContacts()}
      />

      <SqlGuideModal
        isOpen={isSqlGuideModalOpen}
        onClose={() => setIsSqlGuideModalOpen(false)}
        tableName={supabaseConfig.tableName || 'contatos'}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingContact(null);
        }}
        onConfirm={handleConfirmDelete}
        contact={deletingContact}
      />

    </div>
  );
}
