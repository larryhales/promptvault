import React from 'react';
import { Prompt, Category } from '../types';
import { Layers, Tag, Heart, Copy, Edit2, Trash2, Youtube } from 'lucide-react';

interface PromptCardProps {
  prompt: Prompt;
  onOpen: (prompt: Prompt) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isAdmin?: boolean;
  onEdit?: (prompt: Prompt) => void;
  onDelete?: (id: string) => void;
}

const CATEGORY_STYLES: Record<Category, string> = {
  [Category.MARKETING]:       'bg-violet-50 text-violet-700 border-violet-200',
  [Category.SOCIAL_MEDIA]:    'bg-sky-50 text-sky-700 border-sky-200',
  [Category.TRANSACTIONS]:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  [Category.IMAGE_GENERATION]:'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  [Category.COACHING]:        'bg-amber-50 text-amber-700 border-amber-200',
  [Category.PRODUCTIVITY]:    'bg-orange-50 text-orange-700 border-orange-200',
  [Category.AI_SEARCH]:       'bg-indigo-50 text-indigo-700 border-indigo-200',
  [Category.OTHER]:           'bg-slate-50 text-slate-600 border-slate-200',
};

function stepCount(p: Prompt) {
  return 1 + (p.content2 ? 1 : 0) + (p.content3 ? 1 : 0) + (p.content4 ? 1 : 0)
    + (p.content5 ? 1 : 0) + (p.content6 ? 1 : 0) + (p.content7 ? 1 : 0);
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt, onOpen, isFavorite, onToggleFavorite, isAdmin, onEdit, onDelete,
}) => {
  const steps = stepCount(prompt);
  const isChain = steps > 1;

  return (
    <div
      onClick={() => onOpen(prompt)}
      className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-200 flex flex-col cursor-pointer group overflow-hidden"
    >
      {/* Card body */}
      <div className="p-5 flex-1 flex flex-col gap-3">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${CATEGORY_STYLES[prompt.category]}`}>
              {prompt.category}
            </span>
            {isChain && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                <Layers size={10} />
                {steps} steps
              </span>
            )}
            {prompt.youtubeUrl && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-600 border border-red-200">
                <Youtube size={10} />
                Video
              </span>
            )}
          </div>

          {/* Admin actions */}
          {isAdmin && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={e => { e.stopPropagation(); onEdit?.(prompt); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition"
              >
                <Edit2 size={13} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); onDelete?.(prompt.id); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-900 text-base leading-snug group-hover:text-violet-700 transition-colors line-clamp-2">
          {prompt.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
          {prompt.description}
        </p>

        {/* Prompt preview */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex-1">
          <p className="text-xs text-slate-500 font-mono line-clamp-3 leading-relaxed">
            {prompt.content}
          </p>
        </div>

        {/* Tags */}
        {prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {prompt.tags.slice(0, 4).map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                <Tag size={9} />
                {tag}
              </span>
            ))}
            {prompt.tags.length > 4 && (
              <span className="text-[11px] text-slate-400">+{prompt.tags.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {prompt.testedModels && prompt.testedModels.length > 0 && (
            <span className="truncate max-w-[140px]">
              {prompt.testedModels.slice(0, 3).join(' · ')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Copy size={11} />
            {prompt.copyCount || 0}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onToggleFavorite(prompt.id); }}
            className={`p-1.5 rounded-lg transition ${
              isFavorite
                ? 'text-rose-500 bg-rose-50 hover:bg-rose-100'
                : 'text-slate-300 hover:text-rose-400 hover:bg-rose-50'
            }`}
          >
            <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  );
};
