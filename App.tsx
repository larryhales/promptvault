import React, { useState, useEffect, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { Prompt, Category, SortOption } from './types';
import { SAMPLE_PROMPTS } from './data';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { PromptCard } from './components/PromptCard';
import { PromptDetail } from './components/PromptDetail';
import { PromptForm } from './components/PromptForm';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './hooks/useAuth';
import {
  isSupabaseConfigured,
  fetchPrompts,
  subscribeToPrompts,
  addPrompt,
  updatePrompt,
  deletePrompt,
  incrementCopyCount,
  getFavorites,
  toggleFavorite,
} from './services/supabase';
import { BookMarked, AlertTriangle } from 'lucide-react';

const LOCAL_PROMPTS_KEY = 'prompt_vault_data';
const LOCAL_FAVS_KEY = 'prompt_vault_favorites';

export default function App() {
  const { user, profile, isAdmin, signIn, signUp, signInWithGoogle, signOut } = useAuth();

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Load prompts
  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchPrompts()
        .then(data => { setPrompts(data); setLoading(false); })
        .catch(err => { console.error(err); setLoading(false); });
      const unsub = subscribeToPrompts(setPrompts);
      return unsub;
    } else {
      const saved = localStorage.getItem(LOCAL_PROMPTS_KEY);
      setPrompts(saved ? JSON.parse(saved) : SAMPLE_PROMPTS);
      setLoading(false);
    }
  }, []);

  // Persist to localStorage in local mode
  useEffect(() => {
    if (!isSupabaseConfigured() && !loading) {
      localStorage.setItem(LOCAL_PROMPTS_KEY, JSON.stringify(prompts));
    }
  }, [prompts, loading]);

  // Load favorites
  useEffect(() => {
    if (user && isSupabaseConfigured()) {
      getFavorites(user.id).then(setFavorites);
    } else {
      const saved = localStorage.getItem(LOCAL_FAVS_KEY);
      setFavorites(saved ? JSON.parse(saved) : []);
    }
  }, [user]);

  // Deep-link to a prompt via ?promptId=
  useEffect(() => {
    if (!loading && prompts.length > 0) {
      const id = new URLSearchParams(window.location.search).get('promptId');
      if (id) {
        const found = prompts.find(p => p.id === id);
        if (found) setSelectedPrompt(found);
      }
    }
  }, [loading, prompts]);

  // Filtered + sorted prompts
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return prompts
      .filter(p => {
        if (showFavoritesOnly && !favorites.includes(p.id)) return false;
        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
        if (selectedTools.length > 0 && !selectedTools.some(t => p.tools?.includes(t))) return false;
        if (selectedModels.length > 0 && !selectedModels.some(m => p.testedModels?.includes(m))) return false;
        if (q) {
          return (
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.tags.some(t => t.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return (b.copyCount || 0) - (a.copyCount || 0);
        if (sortBy === 'category') return a.category.localeCompare(b.category);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [prompts, searchQuery, selectedCategory, selectedTools, selectedModels, sortBy, favorites, showFavoritesOnly]);

  const handleSave = async (data: Omit<Prompt, 'id' | 'createdAt' | 'likes'>) => {
    try {
      if (isSupabaseConfigured()) {
        if (editingPrompt) {
          await updatePrompt(editingPrompt.id, data);
          toast.success('Prompt updated!');
        } else {
          await addPrompt(data);
          toast.success('Prompt added!');
        }
      } else {
        if (editingPrompt) {
          setPrompts(prev => prev.map(p => p.id === editingPrompt.id ? { ...p, ...data } : p));
          toast.success('Prompt updated!');
        } else {
          const newPrompt: Prompt = {
            ...data,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            likes: 0,
          };
          setPrompts(prev => [newPrompt, ...prev]);
          toast.success('Prompt added!');
        }
      }
      setIsFormOpen(false);
      setEditingPrompt(undefined);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this prompt?')) return;
    try {
      if (isSupabaseConfigured()) {
        await deletePrompt(id);
      } else {
        setPrompts(prev => prev.filter(p => p.id !== id));
      }
      setSelectedPrompt(null);
      toast.success('Prompt deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleToggleFavorite = async (promptId: string) => {
    const isFav = favorites.includes(promptId);
    const updated = isFav
      ? favorites.filter(id => id !== promptId)
      : [...favorites, promptId];
    setFavorites(updated);

    if (user && isSupabaseConfigured()) {
      await toggleFavorite(user.id, promptId, isFav).catch(console.error);
    } else {
      localStorage.setItem(LOCAL_FAVS_KEY, JSON.stringify(updated));
    }
  };

  const handleCopy = async (promptId: string) => {
    toast.success('Copied to clipboard!');
    if (isSupabaseConfigured()) {
      await incrementCopyCount(promptId).catch(() => {});
      setPrompts(prev => prev.map(p => p.id === promptId ? { ...p, copyCount: (p.copyCount || 0) + 1 } : p));
    } else {
      setPrompts(prev => prev.map(p => p.id === promptId ? { ...p, copyCount: (p.copyCount || 0) + 1 } : p));
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(prompts, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'promptvault-export.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Prompts exported!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data)) {
          setPrompts(data);
          toast.success(`Imported ${data.length} prompts`);
        }
      } catch {
        toast.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const supabaseReady = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontSize: '14px' } }} />

      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        user={user}
        isAdmin={isAdmin}
        onAddPrompt={() => { setEditingPrompt(undefined); setIsFormOpen(true); }}
        onSignIn={() => setShowAuthModal(true)}
        onSignOut={signOut}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavorites={() => setShowFavoritesOnly(v => !v)}
        favoriteCount={favorites.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Setup banner */}
        {!supabaseReady && (
          <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
            <AlertTriangle size={18} className="text-amber-500 shrink-0" />
            <div className="text-sm">
              <span className="font-semibold text-amber-800">Running in local mode.</span>
              <span className="text-amber-700 ml-1">
                Add Supabase credentials to <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code> to enable cloud sync, user accounts, and cross-device access.
              </span>
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
            Real Estate{' '}
            <span className="text-violet-600">AI Prompts</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Structured prompt systems that elevate every part of your business.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterBar
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
            selectedTools={selectedTools}
            onToolsChange={setSelectedTools}
            selectedModels={selectedModels}
            onModelsChange={setSelectedModels}
            totalCount={prompts.length}
            filteredCount={filtered.length}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(prompt => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onOpen={setSelectedPrompt}
                isFavorite={favorites.includes(prompt.id)}
                onToggleFavorite={handleToggleFavorite}
                isAdmin={isAdmin}
                onEdit={p => { setEditingPrompt(p); setIsFormOpen(true); }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookMarked size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No prompts found</h3>
            <p className="text-slate-400 text-sm">Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Admin tools */}
        {isAdmin && (
          <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Admin tools</span>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            >
              Export JSON
            </button>
            <label className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer">
              Import JSON
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 mt-12 py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          <span className="font-semibold text-slate-600">PromptVault</span> · Real Estate AI Prompts ·{' '}
          {supabaseReady ? '☁️ Cloud sync active' : '💾 Local mode'}
        </div>
      </footer>

      {/* Modals */}
      {selectedPrompt && (
        <PromptDetail
          prompt={selectedPrompt}
          isFavorite={favorites.includes(selectedPrompt.id)}
          onToggleFavorite={handleToggleFavorite}
          isAdmin={isAdmin}
          onEdit={() => { setEditingPrompt(selectedPrompt); setSelectedPrompt(null); setIsFormOpen(true); }}
          onDelete={handleDelete}
          onClose={() => setSelectedPrompt(null)}
          onCopy={handleCopy}
        />
      )}

      {isFormOpen && (
        <PromptForm
          initialData={editingPrompt}
          onSave={handleSave}
          onCancel={() => { setIsFormOpen(false); setEditingPrompt(undefined); }}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          signIn={signIn}
          signUp={signUp}
          signInWithGoogle={signInWithGoogle}
        />
      )}
    </div>
  );
}
