import React from 'react';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Category, SortOption } from '../types';

const CATEGORIES = ['All', ...Object.values(Category)];
const TOOLS = ['Web Search', 'Image Generation', 'Deep Research', 'Code Interpreter', 'Reasoning'];
const MODELS = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity', 'Grok', 'Midjourney'];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'recent', label: 'Most Recent' },
  { id: 'popular', label: 'Most Copied' },
  { id: 'category', label: 'Category' },
];

interface FilterBarProps {
  selectedCategory: string;
  onCategoryChange: (c: string) => void;
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  selectedTools: string[];
  onToolsChange: (tools: string[]) => void;
  selectedModels: string[];
  onModelsChange: (models: string[]) => void;
  totalCount: number;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategory, onCategoryChange,
  sortBy, onSortChange,
  selectedTools, onToolsChange,
  selectedModels, onModelsChange,
  totalCount, filteredCount,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const toggleTool = (t: string) =>
    onToolsChange(selectedTools.includes(t) ? selectedTools.filter(x => x !== t) : [...selectedTools, t]);

  const toggleModel = (m: string) =>
    onModelsChange(selectedModels.includes(m) ? selectedModels.filter(x => x !== m) : [...selectedModels, m]);

  const activeFilters = selectedTools.length + selectedModels.length;

  return (
    <div className="space-y-3">
      {/* Category pills + sort */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5 flex-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-violet-300 hover:text-violet-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Advanced filters toggle */}
          <button
            onClick={() => setShowAdvanced(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
              showAdvanced || activeFilters > 0
                ? 'bg-violet-50 border-violet-200 text-violet-700'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <SlidersHorizontal size={13} />
            Filters
            {activeFilters > 0 && (
              <span className="bg-violet-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {activeFilters}
              </span>
            )}
          </button>

          {/* Sort */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:border-slate-300 transition">
              <ArrowUpDown size={13} />
              {SORT_OPTIONS.find(s => s.id === sortBy)?.label}
            </button>
            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => onSortChange(opt.id)}
                  className={`w-full text-left px-3 py-2 text-xs transition ${
                    sortBy === opt.id ? 'text-violet-700 font-semibold bg-violet-50' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Required Tools</p>
            <div className="flex flex-wrap gap-1.5">
              {TOOLS.map(t => (
                <button
                  key={t}
                  onClick={() => toggleTool(t)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition border ${
                    selectedTools.includes(t)
                      ? 'bg-violet-50 border-violet-300 text-violet-700'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Tested Models</p>
            <div className="flex flex-wrap gap-1.5">
              {MODELS.map(m => (
                <button
                  key={m}
                  onClick={() => toggleModel(m)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition border ${
                    selectedModels.includes(m)
                      ? 'bg-violet-50 border-violet-300 text-violet-700'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          {activeFilters > 0 && (
            <button
              onClick={() => { onToolsChange([]); onModelsChange([]); }}
              className="text-xs text-rose-500 hover:text-rose-700 transition font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-slate-400">
        Showing {filteredCount} of {totalCount} prompts
      </p>
    </div>
  );
};
