import React, { useState } from 'react';
import { Prompt, Category } from '../types';
import { X, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface PromptFormProps {
  initialData?: Prompt;
  onSave: (data: Omit<Prompt, 'id' | 'createdAt' | 'likes'>) => void;
  onCancel: () => void;
}

const TOOLS = ['Web Search', 'Image Generation', 'Deep Research', 'Code Interpreter', 'Reasoning'];
const MODELS = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity', 'Grok', 'Midjourney'];

const Toggle: React.FC<{
  label: string; items: string[]; selected: string[];
  color: 'violet' | 'sky';
  onToggle: (item: string) => void;
}> = ({ label, items, selected, color, onToggle }) => (
  <div>
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{label}</p>
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => (
        <button
          key={item}
          type="button"
          onClick={() => onToggle(item)}
          className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
            selected.includes(item)
              ? color === 'violet'
                ? 'bg-violet-50 border-violet-300 text-violet-700'
                : 'bg-sky-50 border-sky-300 text-sky-700'
              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  </div>
);

export const PromptForm: React.FC<PromptFormProps> = ({ initialData, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState<Category>(initialData?.category || Category.OTHER);
  const [author, setAuthor] = useState(initialData?.author || 'Admin');
  const [tags, setTags] = useState(initialData?.tags.join(', ') || '');
  const [youtubeUrl, setYoutubeUrl] = useState(initialData?.youtubeUrl || '');
  const [instructions, setInstructions] = useState(initialData?.instructions || '');
  const [selectedTools, setSelectedTools] = useState<string[]>(initialData?.tools || []);
  const [selectedModels, setSelectedModels] = useState<string[]>(initialData?.testedModels || []);
  const [showAdvanced, setShowAdvanced] = useState(
    !!(initialData?.content2 || initialData?.instructions || initialData?.youtubeUrl)
  );

  const [steps, setSteps] = useState<string[]>([
    initialData?.content || '',
    ...[initialData?.content2, initialData?.content3, initialData?.content4,
        initialData?.content5, initialData?.content6, initialData?.content7]
      .filter(Boolean) as string[],
  ]);

  const addStep = () => setSteps(s => [...s, '']);
  const removeStep = (i: number) => setSteps(s => s.filter((_, idx) => idx !== i));
  const updateStep = (i: number, val: string) => setSteps(s => s.map((x, idx) => idx === i ? val : x));

  const toggleTool = (t: string) =>
    setSelectedTools(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const toggleModel = (m: string) =>
    setSelectedModels(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      category,
      author,
      content: steps[0] || '',
      content2: steps[1] || undefined,
      content3: steps[2] || undefined,
      content4: steps[3] || undefined,
      content5: steps[4] || undefined,
      content6: steps[5] || undefined,
      content7: steps[6] || undefined,
      instructions: instructions || undefined,
      youtubeUrl: youtubeUrl || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      tools: selectedTools,
      testedModels: selectedModels,
      copyCount: initialData?.copyCount || 0,
    });
  };

  const inputClass = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition";
  const labelClass = "block text-xs font-semibold text-slate-600 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-900">
            {initialData ? 'Edit Prompt' : 'New Prompt'}
          </h2>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form id="prompt-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Title + Author */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className={labelClass}>Title *</label>
              <input required type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Luxury Listing Description" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Author</label>
              <input type="text" value={author} onChange={e => setAuthor(e.target.value)}
                placeholder="Admin" className={inputClass} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description *</label>
            <textarea required rows={2} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="What does this prompt do?" className={`${inputClass} resize-none`} />
          </div>

          {/* Category + Tags */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value as Category)}
                className={inputClass}>
                {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Tags (comma-separated)</label>
              <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                placeholder="listing, copywriting, luxury" className={inputClass} />
            </div>
          </div>

          {/* Tools + Models */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-4 border border-slate-200">
            <Toggle label="Required Tools" items={TOOLS} selected={selectedTools} color="violet" onToggle={toggleTool} />
            <Toggle label="Tested Models" items={MODELS} selected={selectedModels} color="sky" onToggle={toggleModel} />
          </div>

          {/* Prompt Steps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelClass + ' mb-0'}>
                Prompt{steps.length > 1 ? 's (Chain)' : ''} *
              </label>
              {steps.length < 7 && (
                <button type="button" onClick={addStep}
                  className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium transition">
                  <Plus size={13} /> Add step
                </button>
              )}
            </div>

            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-500">
                      {steps.length > 1 ? `Step ${i + 1}${i === steps.length - 1 ? ' (Final)' : ''}` : 'Prompt'}
                    </span>
                    {i > 0 && (
                      <button type="button" onClick={() => removeStep(i)}
                        className="text-slate-400 hover:text-rose-500 transition">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <textarea
                    required={i === 0}
                    rows={i === 0 ? 6 : 4}
                    value={step}
                    onChange={e => updateStep(i, e.target.value)}
                    placeholder={i === 0 ? 'Enter your prompt here...' : `Enter step ${i + 1}...`}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Advanced (YouTube + Instructions) */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(v => !v)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition font-medium"
            >
              {showAdvanced ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              {showAdvanced ? 'Hide' : 'Show'} optional fields
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className={labelClass}>YouTube Tutorial URL</label>
                  <input type="url" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Usage Instructions</label>
                  <textarea rows={2} value={instructions} onChange={e => setInstructions(e.target.value)}
                    placeholder="How should users use this prompt? Step-by-step notes..." className={`${inputClass} resize-none`} />
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button onClick={onCancel}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
            Cancel
          </button>
          <button form="prompt-form" type="submit"
            className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition shadow-sm">
            {initialData ? 'Save Changes' : 'Add Prompt'}
          </button>
        </div>
      </div>
    </div>
  );
};
