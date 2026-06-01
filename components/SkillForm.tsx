import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Skill } from './SkillCard';

interface SkillFormProps {
  initialData?: Skill;
  onSave: (data: Omit<Skill, 'id' | 'created_at' | 'download_count'>) => void;
  onCancel: () => void;
}

const CATEGORIES = ['General', 'Marketing', 'Social Media', 'Transactions', 'Productivity'];

export const SkillForm: React.FC<SkillFormProps> = ({ initialData, onSave, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [fileName, setFileName] = useState(initialData?.file_name || '');
  const [category, setCategory] = useState(initialData?.category || 'General');

  // Auto-generate file name from skill name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialData) {
      setFileName(val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.md');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description, content, file_name: fileName, category });
  };

  const inputClass = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition";
  const labelClass = "block text-xs font-semibold text-slate-600 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-900">
            {initialData ? 'Edit Skill' : 'New Skill'}
          </h2>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <X size={18} />
          </button>
        </div>

        <form id="skill-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className={labelClass}>Skill Name *</label>
              <input required type="text" value={name} onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g., Listing Caption Generator" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>File Name *</label>
            <input required type="text" value={fileName} onChange={e => setFileName(e.target.value)}
              placeholder="listing-caption-generator.md" className={`${inputClass} font-mono`} />
            <p className="text-xs text-slate-400 mt-1">The filename users will download (e.g. my-skill.md)</p>
          </div>

          <div>
            <label className={labelClass}>Description *</label>
            <textarea required rows={2} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="What does this skill do?" className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className={labelClass}>Skill Content * <span className="text-slate-400 font-normal">(the full .md file content)</span></label>
            <textarea
              required
              rows={12}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="# Skill Name&#10;&#10;Paste the full skill file content here..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition resize-none"
            />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button onClick={onCancel}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
            Cancel
          </button>
          <button form="skill-form" type="submit"
            className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition shadow-sm">
            {initialData ? 'Save Changes' : 'Add Skill'}
          </button>
        </div>
      </div>
    </div>
  );
};
