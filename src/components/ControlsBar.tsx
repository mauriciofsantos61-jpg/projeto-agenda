import React from 'react';
import { Search, LayoutGrid, List, Download, Upload, Star, Filter, Sparkles } from 'lucide-react';
import { CategoryType, ViewMode } from '../types';

interface ControlsBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onlyFavorites: boolean;
  onToggleOnlyFavorites: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSeedSampleData: () => void;
  totalCount: number;
}

const CATEGORY_TABS: { label: string; value: string }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Trabalho', value: 'Trabalho' },
  { label: 'Cliente', value: 'Cliente' },
  { label: 'Família', value: 'Família' },
  { label: 'Amigos', value: 'Amigos' },
  { label: 'Geral', value: 'Geral' },
];

export const ControlsBar: React.FC<ControlsBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onlyFavorites,
  onToggleOnlyFavorites,
  viewMode,
  onViewModeChange,
  onExportCSV,
  onExportJSON,
  onImportJSON,
  onSeedSampleData,
  totalCount,
}) => {
  return (
    <div className="bg-[#0A0A0A] border border-white/10 p-5 space-y-5">
      
      {/* Top Search & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, phone or email..."
            className="w-full pl-11 pr-4 py-3 bg-black border border-white/20 focus:border-[#FF3E00] text-sm font-medium text-white placeholder:text-white/20 focus:outline-none transition-colors uppercase tracking-wider"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black tracking-widest text-[#FF3E00] uppercase hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center flex-wrap gap-2 justify-between lg:justify-end">
          
          {/* Favorites Filter Toggle */}
          <button
            onClick={onToggleOnlyFavorites}
            className={`flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest border transition-all ${
              onlyFavorites
                ? 'bg-amber-400 text-black border-amber-400'
                : 'bg-black text-white/60 border-white/20 hover:text-white hover:border-white'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-black text-black' : ''}`} />
            <span>Favoritos</span>
          </button>

          {/* Seed Sample Contacts Button */}
          {totalCount === 0 && (
            <button
              onClick={onSeedSampleData}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#FF3E00]/10 hover:bg-[#FF3E00] text-[#FF3E00] hover:text-white border border-[#FF3E00]/40 text-[10px] font-black uppercase tracking-widest transition-all"
              title="Gerar contatos de exemplo para testar"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gerar Exemplos</span>
            </button>
          )}

          {/* View Mode Grid/List Switcher */}
          <div className="flex items-center bg-black p-1 border border-white/20">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid' ? 'bg-white text-black font-black' : 'text-white/40 hover:text-white'
              }`}
              title="Visualização em Grade"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list' ? 'bg-white text-black font-black' : 'text-white/40 hover:text-white'
              }`}
              title="Visualização em Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Export Dropdown / Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onExportCSV}
              className="p-2.5 text-white/60 hover:text-black hover:bg-white bg-black border border-white/20 transition-all text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"
              title="Exportar CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#FF3E00]" />
              <span className="hidden sm:inline">EXPORT CSV</span>
            </button>

            {/* Import JSON File Hidden Input */}
            <label
              className="p-2.5 text-white/60 hover:text-black hover:bg-white bg-black border border-white/20 transition-all cursor-pointer text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"
              title="Importar contatos de arquivo JSON"
            >
              <Upload className="w-3.5 h-3.5 text-[#FF3E00]" />
              <span className="hidden sm:inline">IMPORT JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={onImportJSON}
                className="hidden"
              />
            </label>
          </div>

        </div>

      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar text-xs">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 flex items-center gap-1.5 shrink-0 mr-2">
          <Filter className="w-3.5 h-3.5 text-[#FF3E00]" />
          CATEGORIA:
        </span>
        {CATEGORY_TABS.map((tab) => {
          const isActive = selectedCategory === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onSelectCategory(tab.value)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest shrink-0 transition-all border ${
                isActive
                  ? 'bg-white text-black border-white'
                  : 'bg-black text-white/50 border-white/10 hover:text-white hover:border-white/30'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

    </div>
  );
};
