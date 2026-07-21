import React from 'react';
import { Database, Plus, Code, Settings, Users, Star, Layers, RefreshCw } from 'lucide-react';
import { SupabaseConfig } from '../types';

interface NavbarProps {
  config: SupabaseConfig;
  totalContacts: number;
  favoriteCount: number;
  onOpenAddModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenSqlGuideModal: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  totalContacts,
  favoriteCount,
  onOpenAddModal,
  onOpenSettingsModal,
  onOpenSqlGuideModal,
  onRefresh,
  isLoading,
}) => {
  return (
    <header className="bg-[#0A0A0A] border-b border-white/10 text-white sticky top-0 z-30 shadow-2xl backdrop-blur-md bg-[#0A0A0A]/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF3E00] text-black flex items-center justify-center font-black">
              <Users className="w-5 h-5 text-black stroke-[3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">
                  AGENDA<span className="text-[#FF3E00]">.</span>
                </h1>
                <span className="text-[9px] font-black tracking-[0.2em] uppercase px-2 py-0.5 bg-[#FF3E00]/10 text-[#FF3E00] border border-[#FF3E00]/30">
                  SUPABASE
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold hidden sm:block mt-0.5">
                DATABASE IDENTITY MANAGER
              </p>
            </div>
          </div>

          {/* Center Stats Badges */}
          <div className="hidden md:flex items-center gap-6 font-mono text-xs text-white/60">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 border border-white/10">
              <Users className="w-3.5 h-3.5 text-[#FF3E00]" />
              <span className="text-[10px] uppercase tracking-wider">TOTAL: <strong className="text-white font-black text-sm">{totalContacts}</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 border border-white/10">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-[10px] uppercase tracking-wider">FAVORITOS: <strong className="text-white font-black text-sm">{favoriteCount}</strong></span>
            </div>
          </div>

          {/* Right Action Buttons & Status */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Connection Status Badge */}
            <button
              onClick={onOpenSettingsModal}
              title={config.isConnected ? 'Conectado ao Supabase' : 'Usando armazenamento local. Clique para conectar ao Supabase'}
              className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border transition-all ${
                config.isConnected
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/40'
                  : 'bg-[#FF3E00]/10 border-[#FF3E00]/40 text-[#FF3E00] hover:bg-[#FF3E00]/20'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.isConnected ? 'bg-emerald-400' : 'bg-[#FF3E00]'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${config.isConnected ? 'bg-emerald-500' : 'bg-[#FF3E00]'}`}></span>
              </span>
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {config.isConnected ? 'SUPABASE' : 'LOCAL ENGINE'}
              </span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Atualizar lista de contatos"
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#FF3E00]' : ''}`} />
            </button>

            {/* SQL Guide Button */}
            <button
              onClick={onOpenSqlGuideModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white border border-white/20 transition-colors"
              title="Ver script SQL para criar a tabela no Supabase"
            >
              <Code className="w-3.5 h-3.5 text-[#FF3E00]" />
              <span>SQL SCRIPT</span>
            </button>

            {/* Config Button */}
            <button
              onClick={onOpenSettingsModal}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 border border-white/20 transition-colors"
              title="Configurações do Supabase"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Add Contact Primary Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-[0.15em] bg-white text-black hover:bg-[#FF3E00] hover:text-white transition-colors duration-200"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">NOVO CONTATO</span>
              <span className="sm:hidden">NOVO</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
