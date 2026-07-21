import React, { useState } from 'react';
import { Phone, Mail, Star, Edit2, Trash2, MessageCircle, Copy, Check, Tag } from 'lucide-react';
import { Contact } from '../types';
import { getCleanPhoneForWhatsApp } from '../lib/contactsService';

interface ContactCardProps {
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

export const ContactCard: React.FC<ContactCardProps> = ({
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
    <div className="group relative bg-[#0A0A0A] hover:bg-black border border-white/20 hover:border-[#FF3E00] p-6 transition-all duration-300 flex flex-col justify-between">
      
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-5">
          
          <div className="flex items-center gap-4">
            {/* Avatar Block */}
            <div className="w-12 h-12 bg-white text-black font-black text-xl flex items-center justify-center shrink-0 border border-white">
              {getInitials(contact.name)}
            </div>

            <div>
              <h3 className="text-lg font-black italic uppercase tracking-tighter text-white group-hover:text-[#FF3E00] transition-colors line-clamp-1">
                {contact.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/5 border border-white/20 text-white/80 font-mono text-[10px] font-bold uppercase tracking-wider">
                  <Tag className="w-3 h-3 text-[#FF3E00]" />
                  {contact.category}
                </span>
              </div>
            </div>
          </div>

          {/* Favorite Star Button */}
          <button
            onClick={() => onToggleFavorite(contact)}
            className="p-2 border border-white/10 hover:border-amber-400 text-white/40 hover:text-amber-400 transition-colors shrink-0"
            title={contact.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Star
              className={`w-4 h-4 transition-transform ${
                contact.favorite
                  ? 'text-amber-400 fill-amber-400'
                  : 'hover:fill-amber-400/20'
              }`}
            />
          </button>
        </div>

        {/* Info List */}
        <div className="space-y-3 my-4 text-xs">
          
          {/* Phone Row */}
          <div className="flex items-center justify-between bg-black p-3 border border-white/10 hover:border-white/30 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-1.5 bg-[#FF3E00]/10 text-[#FF3E00] shrink-0 border border-[#FF3E00]/20">
                <Phone className="w-4 h-4" />
              </div>
              <span className="font-mono text-white text-xs font-bold tracking-wider truncate">
                {contact.phone || 'NENHUM TELEFONE'}
              </span>
            </div>

            {contact.phone && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => copyToClipboard(contact.phone, 'phone')}
                  className="p-1.5 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  title="Copiar telefone"
                >
                  {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={`https://wa.me/${whatsappCleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                  title="Abrir no WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          {/* Email Row */}
          <div className="flex items-center justify-between bg-black p-3 border border-white/10 hover:border-white/30 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-1.5 bg-white/10 text-white shrink-0 border border-white/20">
                <Mail className="w-4 h-4" />
              </div>
              <span className="font-mono text-white/90 text-xs font-medium tracking-wider truncate">
                {contact.email || 'NENHUM E-MAIL'}
              </span>
            </div>

            {contact.email && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => copyToClipboard(contact.email, 'email')}
                  className="p-1.5 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  title="Copiar e-mail"
                >
                  {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={`mailto:${contact.email}`}
                  className="p-1.5 text-white hover:text-[#FF3E00] bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  title="Enviar e-mail"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          {/* Notes if any */}
          {contact.notes && (
            <div className="p-3 bg-black border border-white/10 text-white/60 text-xs italic font-serif line-clamp-2">
              "{contact.notes}"
            </div>
          )}

        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-3">
        <span className="text-[9px] text-white/30 font-mono uppercase tracking-widest font-bold">
          ID: {contact.id.startsWith('local-') ? 'LOCAL' : contact.id.slice(0, 8)}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(contact)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white hover:text-black bg-white/10 hover:bg-white transition-colors border border-white/20"
          >
            <Edit2 className="w-3 h-3 text-[#FF3E00]" />
            <span>EDITAR</span>
          </button>

          <button
            onClick={() => onDelete(contact)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 transition-colors border border-rose-500/30"
          >
            <Trash2 className="w-3 h-3" />
            <span>EXCLUIR</span>
          </button>
        </div>
      </div>

    </div>
  );
};
