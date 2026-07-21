import React, { useState, useEffect } from 'react';
import { X, Database, Key, Globe, CheckCircle2, AlertCircle, Loader2, Code, ArrowUpRight, Save, RefreshCw } from 'lucide-react';
import { SupabaseConfig } from '../types';
import { testSupabaseConnection } from '../lib/supabaseClient';
import { syncLocalContactsToSupabase } from '../lib/contactsService';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SupabaseConfig;
  onSaveConfig: (newConfig: SupabaseConfig) => void;
  onOpenSqlGuide: () => void;
  onContactsUpdated: () => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onOpenSqlGuide,
  onContactsUpdated,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [tableName, setTableName] = useState('contatos');

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    setUrl(config.url || '');
    setAnonKey(config.anonKey || '');
    setTableName(config.tableName || 'contatos');
    setTestResult(null);
    setSyncResult(null);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testSupabaseConnection(url, anonKey, tableName);
    setTestResult(result);
    setTesting(false);
  };

  const handleSave = async () => {
    const isConn = testResult?.success ?? Boolean(url.trim() && anonKey.trim());
    const newCfg: SupabaseConfig = {
      url: url.trim(),
      anonKey: anonKey.trim(),
      tableName: tableName.trim() || 'contatos',
      isConnected: isConn,
    };
    onSaveConfig(newCfg);
    onClose();
  };

  const handleSyncLocalToSupabase = async () => {
    setSyncing(true);
    setSyncResult(null);
    const res = await syncLocalContactsToSupabase({
      url,
      anonKey,
      tableName,
      isConnected: true,
    });
    setSyncing(false);

    if (res.error) {
      setSyncResult(`Erro ao sincronizar: ${res.error}`);
    } else {
      setSyncResult(`${res.count} contatos locais enviados com sucesso para o Supabase!`);
      onContactsUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0A0A0A] border border-white/20 w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FF3E00] text-black font-black">
              <Database className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
                CONFIGURAÇÕES SUPABASE<span className="text-[#FF3E00]">.</span>
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                DATABASE CONNECTION CREDENTIALS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Quick Info Box */}
          <div className="p-4 bg-black border border-white/20 text-xs text-white/80 space-y-2">
            <div className="flex items-center justify-between font-black uppercase tracking-wider text-[#FF3E00]">
              <span className="flex items-center gap-2">
                <Code className="w-4 h-4 stroke-[3]" />
                Precisa criar a tabela no Supabase?
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSqlGuide();
                }}
                className="text-xs font-black text-white hover:text-[#FF3E00] flex items-center gap-1 uppercase underline"
              >
                <span>VER SCRIPT SQL</span>
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
            <p className="text-white/60 font-mono text-[11px] leading-relaxed">
              Encontre a <strong>URL</strong> e a <strong>Chave Anônima (anon key)</strong> no painel do Supabase em: <code className="bg-white/10 px-1.5 py-0.5 border border-white/20 text-white">Project Settings &gt; API</code>.
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            
            {/* Supabase URL */}
            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-white/60 mb-2">
                PROJECT URL (URL DO SUPABASE)
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="HTTPS://XYZCOMPANY.SUPABASE.CO"
                  className="w-full pl-10 pr-4 py-3 bg-black border border-white/20 focus:border-[#FF3E00] text-xs font-mono font-bold text-white placeholder:text-white/20 focus:outline-none uppercase"
                />
              </div>
            </div>

            {/* Supabase Anon Key */}
            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-white/60 mb-2">
                API KEY ANÔNIMA (ANON PUBLIC KEY)
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="password"
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full pl-10 pr-4 py-3 bg-black border border-white/20 focus:border-[#FF3E00] text-xs font-mono font-bold text-white placeholder:text-white/20 focus:outline-none"
                />
              </div>
            </div>

            {/* Nome da Tabela */}
            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-white/60 mb-2">
                NOME DA TABELA NO SUPABASE
              </label>
              <div className="relative">
                <Database className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="contatos"
                  className="w-full pl-10 pr-4 py-3 bg-black border border-white/20 focus:border-[#FF3E00] text-xs font-mono font-bold text-white placeholder:text-white/20 focus:outline-none uppercase"
                />
              </div>
              <p className="text-[10px] font-mono text-white/40 mt-1 uppercase">
                PADRÃO RECOMENDADO: <code className="text-[#FF3E00] font-bold">contatos</code>
              </p>
            </div>

          </div>

          {/* Connection Test Result Feedback */}
          {testResult && (
            <div
              className={`p-4 border text-xs flex items-start gap-3 font-mono ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-400'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 stroke-[3]" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 stroke-[3]" />
              )}
              <div>
                <p className="font-black uppercase tracking-wider">{testResult.success ? 'CONEXÃO BEM-SUCEDIDA!' : 'FALHA NA CONEXÃO'}</p>
                <p className="mt-1 leading-relaxed text-white/80">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Sync Result Feedback */}
          {syncResult && (
            <div className="p-4 bg-white/5 border border-white/20 text-xs font-mono text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF3E00] shrink-0 stroke-[3]" />
              <span className="uppercase tracking-wider">{syncResult}</span>
            </div>
          )}

          {/* Actions: Test, Sync & Disconnect */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !url || !anonKey}
              className="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-white/10 text-white border border-white/20 text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              {testing ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#FF3E00]" />
              ) : (
                <RefreshCw className="w-4 h-4 text-[#FF3E00]" />
              )}
              <span>TESTAR CONEXÃO</span>
            </button>

            {url && anonKey && (
              <button
                type="button"
                onClick={handleSyncLocalToSupabase}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-black hover:bg-[#FF3E00] hover:text-white text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                title="Subir contatos salvos localmente para a nuvem no Supabase"
              >
                {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 stroke-[3]" />}
                <span>SINCRONIZAR LOCAL P/ SUPABASE</span>
              </button>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-black flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white/60 hover:text-white bg-black border border-white/20 transition-colors"
          >
            CANCELAR
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest bg-white text-black hover:bg-[#FF3E00] hover:text-white transition-colors duration-200"
          >
            <Save className="w-4 h-4 stroke-[3]" />
            <span>SALVAR CONFIGURAÇÕES</span>
          </button>
        </div>

      </div>
    </div>
  );
};
