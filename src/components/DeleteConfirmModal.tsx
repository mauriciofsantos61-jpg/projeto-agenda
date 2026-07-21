import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Contact } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contact: Contact | null;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  contact,
}) => {
  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0A0A0A] border border-white/20 w-full max-w-md shadow-2xl overflow-hidden p-6 text-center space-y-5">
        
        <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/40 text-rose-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 stroke-[3]" />
        </div>

        <div>
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">
            EXCLUIR CONTATO<span className="text-[#FF3E00]">?</span>
          </h3>
          <p className="text-xs font-mono text-white/60 mt-2">
            CONFIRMA A REMOÇÃO DE <strong className="text-white font-black uppercase">"{contact.name}"</strong>? ESTA AÇÃO É IRREVERSÍVEL.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white/60 hover:text-white bg-black border border-white/20 transition-colors"
          >
            CANCELAR
          </button>

          <button
            onClick={onConfirm}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-500 text-white transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4 stroke-[3]" />
            <span>EXCLUIR</span>
          </button>
        </div>

      </div>
    </div>
  );
};
