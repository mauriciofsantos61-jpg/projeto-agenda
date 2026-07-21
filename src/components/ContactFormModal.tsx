import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Tag, Star, AlignLeft, Save, Loader2 } from 'lucide-react';
import { Contact, CategoryType } from '../types';
import { formatPhoneNumber } from '../lib/contactsService';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contactData: Omit<Contact, 'id'>, id?: string) => Promise<void>;
  editingContact?: Contact | null;
}

const CATEGORIES: CategoryType[] = ['Geral', 'Trabalho', 'Cliente', 'Família', 'Amigos'];

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingContact,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<CategoryType>('Geral');
  const [favorite, setFavorite] = useState(false);
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingContact) {
      setName(editingContact.name || '');
      setPhone(editingContact.phone || '');
      setEmail(editingContact.email || '');
      setCategory(editingContact.category || 'Geral');
      setFavorite(Boolean(editingContact.favorite));
      setNotes(editingContact.notes || '');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setCategory('Geral');
      setFavorite(false);
      setNotes('');
    }
    setErrors({});
  }, [editingContact, isOpen]);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatPhoneNumber(rawValue);
    setPhone(formatted);
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; phone?: string; email?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'O nome do contato é obrigatório.';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Por favor, insira um e-mail válido.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      await onSave(
        {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          category,
          favorite,
          notes: notes.trim(),
        },
        editingContact?.id
      );
      onClose();
    } catch (err) {
      console.error('Erro ao salvar contato:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0A0A0A] border border-white/20 w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FF3E00] text-black font-black">
              <User className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
                {editingContact ? 'EDITAR CONTATO' : 'NOVO CONTATO'}<span className="text-[#FF3E00]">.</span>
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                ENTER IDENTITY METADATA
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

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          
          {/* Nome */}
          <div>
            <label className="block text-[10px] uppercase font-black tracking-widest text-white/60 mb-2">
              NOME COMPLETO <span className="text-[#FF3E00]">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="EX: ANA MARIA SILVA"
                className={`w-full pl-10 pr-4 py-3 bg-black border ${
                  errors.name ? 'border-rose-500' : 'border-white/20 focus:border-[#FF3E00]'
                } text-xs font-bold text-white placeholder:text-white/20 focus:outline-none transition-colors uppercase tracking-wider`}
              />
            </div>
            {errors.name && <p className="text-[10px] font-bold text-rose-400 mt-1 uppercase tracking-wider">{errors.name}</p>}
          </div>

          {/* Telefone & E-mail in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Telefone */}
            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-white/60 mb-2">
                TELEFONE / CELULAR
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(11) 98765-4321"
                  className="w-full pl-10 pr-4 py-3 bg-black border border-white/20 focus:border-[#FF3E00] text-xs font-mono font-bold text-white placeholder:text-white/20 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-white/60 mb-2">
                E-MAIL
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="NOME@EMAIL.COM"
                  className={`w-full pl-10 pr-4 py-3 bg-black border ${
                    errors.email ? 'border-rose-500' : 'border-white/20 focus:border-[#FF3E00]'
                  } text-xs font-mono font-bold text-white placeholder:text-white/20 focus:outline-none transition-colors uppercase`}
                />
              </div>
              {errors.email && <p className="text-[10px] font-bold text-rose-400 mt-1 uppercase tracking-wider">{errors.email}</p>}
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-[10px] uppercase font-black tracking-widest text-white/60 mb-2">
              CATEGORIA
            </label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full pl-10 pr-4 py-3 bg-black border border-white/20 focus:border-[#FF3E00] text-xs font-bold text-white focus:outline-none transition-colors appearance-none uppercase tracking-wider"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-black text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Marcar como Favorito Toggle */}
          <div className="flex items-center justify-between p-4 bg-black border border-white/20">
            <div className="flex items-center gap-3">
              <Star className={`w-4 h-4 ${favorite ? 'text-amber-400 fill-amber-400' : 'text-white/30'}`} />
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-white block">MARCAR COMO FAVORITO</span>
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">DESTAQUE NA LISTA</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFavorite(!favorite)}
              className={`w-12 h-6 flex items-center p-1 border transition-colors ${
                favorite ? 'bg-amber-400 border-amber-400 justify-end' : 'bg-black border-white/20 justify-start'
              }`}
            >
              <div className={`w-4 h-4 ${favorite ? 'bg-black' : 'bg-white/40'}`}></div>
            </button>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-[10px] uppercase font-black tracking-widest text-white/60 mb-2">
              OBSERVAÇÕES (OPCIONAL)
            </label>
            <div className="relative">
              <AlignLeft className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anotações adicionais, cargo, endereço..."
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-black border border-white/20 focus:border-[#FF3E00] text-xs font-medium text-white placeholder:text-white/20 focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-5 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white/60 hover:text-white bg-black border border-white/20 transition-colors"
            >
              CANCELAR
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest bg-white text-black hover:bg-[#FF3E00] hover:text-white transition-colors duration-200 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>SALVANDO...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 stroke-[3]" />
                  <span>{editingContact ? 'ATUALIZAR' : 'SALVAR'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
