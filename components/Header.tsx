import React from 'react';
import { Search, Plus, BookMarked, LogOut, User, ChevronDown } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  user: any;
  isAdmin: boolean;
  onAddPrompt: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  favoriteCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery, onSearchChange,
  user, isAdmin,
  onAddPrompt, onSignIn, onSignOut,
  showFavoritesOnly, onToggleFavorites, favoriteCount,
}) => {
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <BookMarked size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">
            Prompt<span className="text-violet-600">Vault</span>
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search prompts, tags..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {/* Favorites toggle */}
          <button
            onClick={onToggleFavorites}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              showFavoritesOnly
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>♥</span>
            <span className="hidden sm:inline">Saved</span>
            {favoriteCount > 0 && (
              <span className="bg-rose-100 text-rose-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {favoriteCount}
              </span>
            )}
          </button>

          {/* Admin: add prompt */}
          {isAdmin && (
            <button
              onClick={onAddPrompt}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Prompt</span>
            </button>
          )}

          {/* Auth */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition"
              >
                <div className="w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center">
                  <User size={12} className="text-violet-600" />
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {user.email?.split('@')[0]}
                </span>
                {isAdmin && (
                  <span className="hidden sm:inline text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                )}
                <ChevronDown size={14} />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    {isAdmin && <p className="text-xs font-semibold text-violet-600">Admin</p>}
                  </div>
                  <button
                    onClick={() => { onSignOut(); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
