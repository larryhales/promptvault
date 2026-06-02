import React from 'react';
import { Search, Plus, LogOut, User, ChevronDown, BookMarked, Puzzle, ShieldCheck, LogIn } from 'lucide-react';

type View = 'prompts' | 'skills';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  user: any;
  isAdmin: boolean;
  currentView: View;
  onViewChange: (v: View) => void;
  onAddItem: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenAdmin: () => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  favoriteCount: number;
  pendingRequestCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery, onSearchChange,
  user, isAdmin,
  currentView, onViewChange, onAddItem,
  onSignIn, onSignOut, onOpenAdmin,
  showFavoritesOnly, onToggleFavorites, favoriteCount,
  pendingRequestCount,
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

        {/* Nav tabs */}
        <nav className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50 shrink-0">
          <button
            onClick={() => onViewChange('prompts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              currentView === 'prompts'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookMarked size={14} />
            Prompts
          </button>
          <button
            onClick={() => onViewChange('skills')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              currentView === 'skills'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Puzzle size={14} />
            Skills
          </button>
        </nav>

        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${currentView}...`}
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {/* Favorites (prompts only) */}
          {currentView === 'prompts' && (
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
          )}

          {/* Admin panel button */}
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-violet-700 hover:bg-violet-50 transition"
              title="Admin Panel"
            >
              <ShieldCheck size={16} />
              <span className="hidden sm:inline">Admin</span>
              {pendingRequestCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {pendingRequestCount}
                </span>
              )}
            </button>
          )}

          {/* Add button (admin) */}
          {isAdmin && (
            <button
              onClick={onAddItem}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">
                Add {currentView === 'prompts' ? 'Prompt' : 'Skill'}
              </span>
            </button>
          )}

          {/* User menu or Sign In */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition"
              >
                <div className="w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center">
                  <User size={12} className="text-violet-600" />
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {user.email?.split('@')[0]}
                </span>
                <ChevronDown size={13} />
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
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <LogIn size={15} />
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
