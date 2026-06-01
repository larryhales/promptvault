import React from 'react';
import { Download, Edit2, Trash2, FileText } from 'lucide-react';

export interface Skill {
  id: string;
  name: string;
  description: string;
  content: string;
  file_name: string;
  category: string;
  download_count: number;
  created_at: string;
}

const CATEGORY_STYLES: Record<string, string> = {
  'Marketing':     'bg-violet-50 text-violet-700 border-violet-200',
  'Social Media':  'bg-sky-50 text-sky-700 border-sky-200',
  'Transactions':  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Productivity':  'bg-orange-50 text-orange-700 border-orange-200',
  'General':       'bg-slate-50 text-slate-600 border-slate-200',
};

interface SkillCardProps {
  skill: Skill;
  onDownload: (skill: Skill) => void;
  isAdmin?: boolean;
  onEdit?: (skill: Skill) => void;
  onDelete?: (id: string) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({
  skill, onDownload, isAdmin, onEdit, onDelete,
}) => {
  const style = CATEGORY_STYLES[skill.category] || CATEGORY_STYLES['General'];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-200 flex flex-col group overflow-hidden">
      <div className="p-5 flex-1 flex flex-col gap-3">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${style}`}>
            {skill.category}
          </span>
          {isAdmin && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit?.(skill)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition"
              >
                <Edit2 size={13} />
              </button>
              <button
                onClick={() => onDelete?.(skill.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Icon + Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-center shrink-0">
            <FileText size={18} className="text-violet-600" />
          </div>
          <h3 className="font-semibold text-slate-900 leading-snug group-hover:text-violet-700 transition-colors">
            {skill.name}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed flex-1">
          {skill.description}
        </p>

        {/* File name */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5">
          <FileText size={11} />
          {skill.file_name}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Download size={11} />
          {skill.download_count} downloads
        </span>
        <button
          onClick={() => onDownload(skill)}
          className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
        >
          <Download size={13} />
          Download
        </button>
      </div>
    </div>
  );
};
