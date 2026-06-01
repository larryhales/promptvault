import React from 'react';
import { Prompt, Category } from '../types';
import {
  X, Copy, Check, Heart, Share2, Edit2, Trash2, Layers,
  Tag, Youtube, ChevronDown, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PromptDetailProps {
  prompt: Prompt;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  onCopy: (id: string) => void;
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

function getYouTubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([^#&?]{11})/);
  return m ? m[1] : null;
}

const CopyButton: React.FC<{ text: string; onCopied?: () => void }> = ({ text, onCopied }) => {
  const [copied, setCopied] = React.useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    onCopied?.();
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
        copied
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200'
      }`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

const PromptBlock: React.FC<{ label: string; content: string; isChain?: boolean; onCopied?: () => void }> = ({
  label, content, isChain, onCopied,
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        {isChain && <Layers size={12} className="text-violet-400" />}
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <CopyButton text={content} onCopied={onCopied} />
    </div>
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
      {content}
    </div>
    {isChain && (
      <div className="flex justify-center py-1">
        <ChevronDown size={16} className="text-slate-300" />
      </div>
    )}
  </div>
);

export const PromptDetail: React.FC<PromptDetailProps> = ({
  prompt, isFavorite, onToggleFavorite,
  isAdmin, onEdit, onDelete, onClose, onCopy,
}) => {
  const steps = [
    prompt.content, prompt.content2, prompt.content3, prompt.content4,
    prompt.content5, prompt.content6, prompt.content7,
  ].filter(Boolean) as string[];

  const isChain = steps.length > 1;

  const handleShare = async () => {
    const url = `${window.location.origin}?promptId=${prompt.id}`;
    if (navigator.share) {
      await navigator.share({ title: prompt.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }
  };

  const ytId = prompt.youtubeUrl ? getYouTubeId(prompt.youtubeUrl) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${CATEGORY_STYLES[prompt.category]}`}>
                {prompt.category}
              </span>
              {isChain && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  <Layers size={11} />
                  {steps.length}-step chain
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">{prompt.title}</h2>
            <p className="text-sm text-slate-400 mt-1">by {prompt.author} · {new Date(prompt.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onToggleFavorite(prompt.id)}
              className={`p-2 rounded-xl transition ${
                isFavorite ? 'text-rose-500 bg-rose-50' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
              }`}
            >
              <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition"
            >
              <Share2 size={16} />
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={onEdit}
                  className="p-2 rounded-xl text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete?.(prompt.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Description */}
          <p className="text-slate-600 leading-relaxed">{prompt.description}</p>

          {/* Instructions */}
          {prompt.instructions && (
            <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-700 mb-1">Usage Instructions</p>
                <p className="text-sm text-amber-700 leading-relaxed">{prompt.instructions}</p>
              </div>
            </div>
          )}

          {/* YouTube */}
          {ytId && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Youtube size={14} className="text-red-500" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Video Tutorial</p>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${ytId}`}
                  title="Tutorial video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Prompt blocks */}
          <div className="space-y-4">
            {steps.map((step, i) => (
              <PromptBlock
                key={i}
                label={isChain ? `Step ${i + 1}${i === steps.length - 1 ? ' — Final' : ''}` : 'Prompt'}
                content={step}
                isChain={isChain && i < steps.length - 1}
                onCopied={() => onCopy(prompt.id)}
              />
            ))}
          </div>

          {/* Tags */}
          {prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
              {prompt.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
