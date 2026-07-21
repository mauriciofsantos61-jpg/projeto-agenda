import React, { useState } from 'react';
import { Phone, Mail, Star, Edit2, Trash2, MessageCircle, Copy, Check } from 'lucide-react';
import { Contact } from '../types';
import { getCleanPhoneForWhatsApp } from '../lib/contactsService';

interface ContactListItemProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onToggleFavorite: (contact: Contact) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Trabalho: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  Cliente: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  Família: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  Amigos: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  Geral: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
};

export const ContactListItem: React.FC<ContactListItemProps> = ({
  contact,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [copiedField, setCopiedField] = useState<'phone' | 'email' | null>(null);

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const copyToClipboard = (text: string, field: 'phone' | 'email') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const categoryStyle = CATEGORY_COLORS[contact.category] || CATEGORY_COLORS.Geral;
  const whatsappCleanPhone = getCleanPhoneForWhatsApp(contact.phone);

  return (
    <div className="group bg-[#0A0A0A] hover:bg-black border border-white/20 hover:border-[#FF3E00] p-4 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      
      {/* Left: Avatar & Name */}
      <div className="flex items-center gap-3 min-w-[220px]">
        <button
          onClick={() => onToggleFavorite(contact)}
          className="text-white/40 hover:text-amber-400 transition-colors p-1"
          title={contact.favorite ? 'Favorito' : 'Marcar como favorito'}
        >
          <Star
            className={`w-4 h-4 ${
              contact.favorite ? 'text-amber-400 fill-amber-400' : ''
            }`}
          />
        </button>

        <div className="w-10 h-10 bg-white text-black font-black text-sm flex items-center justify-center shrink-0 border border-white">
          {getInitials(contact.name)}
        </div>

        <div>
          <h4 className="text-sm font-black italic uppercase tracking-tighter text-white group-hover:text-[#FF3E00] transition-colors">
            {contact.name}
          </h4>
          <span className="inline-block text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-white/5 border border-white/20 text-white/70">
            {contact.category}
          </span>
        </div>
      </div>

      {/* Middle: Phone & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs w-full sm:w-auto flex-1 max-w-xl">
        {/* Phone */}
        <div className="flex items-center justify-between bg-black px-3 py-2 border border-white/10 hover:border-white/30 transition-colors">
          <div className="flex items-center gap-2 truncate">
            <Phone className="w-3.5 h-3.5 text-[#FF3E00] shrink-0" />
            <span className="font-mono text-white text-xs font-bold tracking-wider truncate">{contact.phone || 'NENHUM TELEFONE'}</span>
          </div>
          {contact.phone && (
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button
                onClick={() => copyToClipboard(contact.phone, 'phone')}
                className="p-1 text-white/40 hover:text-white transition-colors"
                title="Copiar"
              >
                {copiedField === 'phone' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
              <a
                href={`https://wa.me/${whatsappCleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="flex items-center justify-between bg-black px-3 py-2 border border-white/10 hover:border-white/30 transition-colors">
          <div className="flex items-center gap-2 truncate">
            <Mail className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="font-mono text-white/80 truncate text-[11px] font-medium tracking-wider">{contact.email || 'NENHUM E-MAIL'}</span>
          </div>
          {contact.email && (
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button
                onClick={() => copyToClipboard(contact.email, 'email')}
                className="p-1 text-white/40 hover:text-white transition-colors"
                title="Copiar"
              >
                {copiedField === 'email' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button
          onClick={() => onEdit(contact)}
          className="p-2 text-white/60 hover:text-black hover:bg-white border border-white/20 transition-all"
          title="Editar contato"
        >
          <Edit2 className="w-4 h-4 text-[#FF3E00]" />
        </button>
        <button
          onClick={() => onDelete(contact)}
          className="p-2 text-rose-400 hover:text-white hover:bg-rose-600 border border-rose-500/30 transition-all"
          title="Excluir contato"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
