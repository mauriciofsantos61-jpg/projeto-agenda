import React, { useState } from 'react';
import { X, Code, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface SqlGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableName?: string;
}

export const SqlGuideModal: React.FC<SqlGuideModalProps> = ({
  isOpen,
  onClose,
  tableName = 'contatos',
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- 1. Criar a tabela de contatos no Supabase
CREATE TABLE IF NOT EXISTS ${tableName} (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  category TEXT DEFAULT 'Geral',
  favorite BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar a Segurança por Nível de Linha (RLS)
ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;

-- 3. Criar Políticas de Acesso Público (Permite leitura, criação, alteração e exclusão)
CREATE POLICY "Permitir Leitura Pública" 
  ON ${tableName} FOR SELECT USING (true);

CREATE POLICY "Permitir Inserção Pública" 
  ON ${tableName} FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir Atualização Pública" 
  ON ${tableName} FOR UPDATE USING (true);

CREATE POLICY "Permitir Deleção Pública" 
  ON ${tableName} FOR DELETE USING (true);
`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0A0A0A] border border-white/20 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FF3E00] text-black font-black">
              <Terminal className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
                SCRIPT SQL SUPABASE<span className="text-[#FF3E00]">.</span>
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                DATABASE INITIALIZATION CODE
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
          
          {/* Step by Step instructions */}
          <div className="space-y-3 text-xs text-white/70">
            <h3 className="font-black italic uppercase tracking-wider text-white text-sm">Passo a Passo Rápido:</h3>
            <ol className="list-decimal pl-4 space-y-2 text-white/70 font-mono text-xs">
              <li>
                Acesse o painel do seu projeto no{' '}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF3E00] font-bold hover:underline inline-flex items-center gap-1 uppercase"
                >
                  Supabase Dashboard <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>No menu lateral esquerdo, clique no ícone <strong className="text-white font-bold">SQL Editor</strong>.</li>
              <li>Clique no botão <strong className="text-white font-bold">+ New Query</strong>.</li>
              <li>Cole o código SQL abaixo na caixa de texto.</li>
              <li>Clique no botão <strong className="text-[#FF3E00] font-bold">Run</strong> no canto inferior direito para criar a tabela.</li>
            </ol>
          </div>

          {/* SQL Code Box */}
          <div className="relative group bg-black border border-white/20 overflow-hidden">
            
            {/* Code Box Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/10 text-xs">
              <span className="font-mono text-white/50 text-[10px] font-bold uppercase tracking-widest">script_supabase.sql</span>
              <button
                onClick={copySql}
                className="flex items-center gap-2 px-3 py-1 bg-white text-black hover:bg-[#FF3E00] hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>COPIADO!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 stroke-[3]" />
                    <span>COPIAR SCRIPT</span>
                  </>
                )}
              </button>
            </div>

            {/* Code View */}
            <pre className="p-4 text-xs font-mono text-[#FF3E00] overflow-x-auto leading-relaxed max-h-72 custom-scrollbar bg-black">
              {sqlCode}
            </pre>

          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-black flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-black uppercase tracking-widest bg-white text-black hover:bg-[#FF3E00] hover:text-white transition-colors"
          >
            ENTENDIDO
          </button>
        </div>

      </div>
    </div>
  );
};
