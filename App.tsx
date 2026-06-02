import React, { useState, useEffect, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { Prompt, SortOption } from './types';
import { Skill } from './components/SkillCard';
import { SAMPLE_PROMPTS } from './data';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { PromptCard } from './components/PromptCard';
import { PromptDetail } from './components/PromptDetail';
import { PromptForm } from './components/PromptForm';
import { SkillCard } from './components/SkillCard';
import { SkillForm } from './components/SkillForm';
import { AdminPanel } from './components/AdminPanel';
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
  fetchSkills,
  addSkill,
  updateSkill,
  deleteSkill,
  incrementSkillDownload,
  logActivity,
  fetchPendingRequestCount,
} from './services/supabase';
import { BookMarked, Puzzle } from 'lucide-react';

const LOCAL_PROMPTS_KEY = 'prompt_vault_data';
const LOCAL_FAVS_KEY = 'prompt_vault_favorites';
type View = 'prompts' | 'skills';

export default function App() {
  const { user, profile, isAdmin, signIn, signUp, signInWithGoogle, signOut } = useAuth();

  // Data
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  // View
  const [currentView, setCurrentView] = useState<View>('prompts');

  // Modals
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | undefined>();
  const [isPromptFormOpen, setIsPromptFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | undefined>();
  const [isSkillFormOpen, setIsSkillFormOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Load prompts
  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchPrompts()
        .then(data => { setPrompts(data); setLoading(false); })
        .catch(() => setLoading(false));
      return subscribeToPrompts(setPrompts);
    } else {
      const saved = localStorage.getItem(LOCAL_PROMPTS_KEY);
      setPrompts(saved ? JSON.parse(saved) : SAMPLE_PROMPTS);
      setLoading(false);
    }
  }, [user]);

  // Load skills
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    fetchSkills().then(setSkills).catch(console.error);
  }, [user]);

  // Load favorites
  useEffect(() => {
    if (!user) return;
    if (isSupabaseConfigured()) {
      getFavorites(user.id).then(setFavorites);
    } else {
      const saved = localStorage.getItem(LOCAL_FAVS_KEY);
      setFavorites(saved ? JSON.parse(saved) : []);
    }
  }, [user]);

  // Persist prompts locally
  useEffect(() => {
    if (!isSupabaseConfigured() && !loading && user) {
      localStorage.setItem(LOCAL_PROMPTS_KEY, JSON.stringify(prompts));
    }
  }, [prompts, loading, user]);

  // Load pending request count for admin badge
  useEffect(() => {
    if (!isAdmin || !isSupabaseConfigured()) return;
    fetchPendingRequestCount().then(setPendingCount);
  }, [isAdmin]);

  // Deep-link
  useEffect(() => {
    if (!loading && prompts.length > 0 && user) {
      const id = new URLSearchParams(window.location.search).get('promptId');
      if (id) {
        const found = prompts.find(p => p.id === id);
        if (found) setSelectedPrompt(found);
      }
    }
  }, [loading, prompts, user]);

  // Log login on auth
  useEffect(() => {
    if (user && isSupabaseConfigured()) {
      logActivity(user.id, user.email, 'login');
    }
  }, [user?.id]);

  // Filtered prompts
  const filteredPrompts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return prompts
      .filter(p => {
        if (showFavoritesOnly && !favorites.includes(p.id)) return false;
        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
        if (selectedTools.length > 0 && !selectedTools.some(t => p.tools?.includes(t))) return false;
        if (selectedModels.length > 0 && !selectedModels.some(m => p.testedModels?.includes(m))) return false;
        if (q) return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return (b.copyCount || 0) - (a.copyCount || 0);
        if (sortBy === 'category') return a.category.localeCompare(b.category);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [prompts, searchQuery, selectedCategory, selectedTools, selectedModels, sortBy, favorites, showFavoritesOnly]);

  // Filtered skills
  const filteredSkills = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return skills;
    return skills.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  }, [skills, searchQuery]);

  // ── Prompt handlers ────────────────────────────────────────────────────────

  const handleSavePrompt = async (data: Omit<Prompt, 'id' | 'createdAt' | 'likes'>) => {
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
        } else {
          setPrompts(prev => [{ ...data, id: Date.now().toString(), createdAt: new Date().toISOString(), likes: 0 }, ...prev]);
        }
        toast.success(editingPrompt ? 'Prompt updated!' : 'Prompt added!');
      }
      setIsPromptFormOpen(false);
      setEditingPrompt(undefined);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    }
  };

  const handleDeletePrompt = async (id: string) => {
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

  const handleCopyPrompt = async (promptId: string, promptTitle: string) => {
    toast.success('Copied to clipboard!');
    if (user && isSupabaseConfigured()) {
      logActivity(user.id, user.email, 'copy_prompt', promptId, promptTitle);
      await incrementCopyCount(promptId).catch(() => {});
    }
    setPrompts(prev => prev.map(p => p.id === promptId ? { ...p, copyCount: (p.copyCount || 0) + 1 } : p));
  };

  const handleToggleFavorite = async (promptId: string) => {
    const isFav = favorites.includes(promptId);
    const updated = isFav ? favorites.filter(id => id !== promptId) : [...favorites, promptId];
    setFavorites(updated);
    if (user && isSupabaseConfigured()) {
      await toggleFavorite(user.id, promptId, isFav).catch(console.error);
    } else {
      localStorage.setItem(LOCAL_FAVS_KEY, JSON.stringify(updated));
    }
  };

  // ── Skill handlers ─────────────────────────────────────────────────────────

  const handleSaveSkill = async (data: Omit<Skill, 'id' | 'created_at' | 'download_count'>) => {
    try {
      if (editingSkill) {
        await updateSkill(editingSkill.id, data);
        toast.success('Skill updated!');
        setSkills(prev => prev.map(s => s.id === editingSkill.id ? { ...s, ...data } : s));
      } else {
        await addSkill({ ...data, download_count: 0 });
        toast.success('Skill added!');
        const updated = await fetchSkills();
        setSkills(updated);
      }
      setIsSkillFormOpen(false);
      setEditingSkill(undefined);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save skill');
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await deleteSkill(id);
      setSkills(prev => prev.filter(s => s.id !== id));
      toast.success('Skill deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleDownloadSkill = async (skill: Skill) => {
    // Trigger file download
    const blob = new Blob([skill.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = skill.file_name;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${skill.file_name}`);

    // Log + increment
    if (user && isSupabaseConfigured()) {
      logActivity(user.id, user.email, 'download_skill', skill.id, skill.name);
      await incrementSkillDownload(skill.id).catch(() => {});
      setSkills(prev => prev.map(s => s.id === skill.id ? { ...s, download_count: s.download_count + 1 } : s));
    }
  };

  const handleAddItem = () => {
    if (currentView === 'prompts') {
      setEditingPrompt(undefined);
      setIsPromptFormOpen(true);
    } else {
      setEditingSkill(undefined);
      setIsSkillFormOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontSize: '14px' } }} />

      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        user={user}
        isAdmin={isAdmin}
        currentView={currentView}
        onViewChange={v => { setCurrentView(v); setSearchQuery(''); }}
        onAddItem={handleAddItem}
        onSignIn={() => setShowAuthModal(true)}
        onSignOut={signOut}
        onOpenAdmin={() => setShowAdminPanel(true)}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavorites={() => setShowFavoritesOnly(v => !v)}
        favoriteCount={favorites.length}
        pendingRequestCount={pendingCount}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── PROMPTS VIEW ── */}
        {currentView === 'prompts' && (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
                Real Estate <span className="text-violet-600">AI Prompts</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-xl mx-auto">
                Structured prompt systems that elevate every part of your business.
              </p>
            </div>

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
                filteredCount={filteredPrompts.length}
              />
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-2xl h-64 animate-pulse" />
                ))}
              </div>
            ) : filteredPrompts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPrompts.map(prompt => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    onOpen={setSelectedPrompt}
                    isFavorite={favorites.includes(prompt.id)}
                    onToggleFavorite={handleToggleFavorite}
                    isAdmin={isAdmin}
                    onEdit={p => { setEditingPrompt(p); setIsPromptFormOpen(true); }}
                    onDelete={handleDeletePrompt}
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
          </>
        )}

        {/* ── SKILLS VIEW ── */}
        {currentView === 'skills' && (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
                Claude <span className="text-violet-600">Skills</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-xl mx-auto">
                Download ready-to-use Claude Code skills for your real estate business.
              </p>
            </div>

            {filteredSkills.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredSkills.map(skill => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    onDownload={handleDownloadSkill}
                    isAdmin={isAdmin}
                    onEdit={s => { setEditingSkill(s); setIsSkillFormOpen(true); }}
                    onDelete={handleDeleteSkill}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Puzzle size={24} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">
                  {searchQuery ? 'No skills match your search' : 'No skills yet'}
                </h3>
                <p className="text-slate-400 text-sm">
                  {isAdmin ? 'Click "Add Skill" to upload the first one.' : 'Check back soon.'}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 mt-12 py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          <span className="font-semibold text-slate-600">PromptVault</span> · Real Estate AI Prompts ·{' '}
          {isSupabaseConfigured() ? '☁️ Cloud sync active' : '💾 Local mode'}
        </div>
      </footer>

      {/* ── Modals ── */}
      {selectedPrompt && (
        <PromptDetail
          prompt={selectedPrompt}
          isFavorite={favorites.includes(selectedPrompt.id)}
          onToggleFavorite={handleToggleFavorite}
          isAdmin={isAdmin}
          onEdit={() => { setEditingPrompt(selectedPrompt); setSelectedPrompt(null); setIsPromptFormOpen(true); }}
          onDelete={handleDeletePrompt}
          onClose={() => setSelectedPrompt(null)}
          onCopy={id => handleCopyPrompt(id, selectedPrompt.title)}
        />
      )}

      {isPromptFormOpen && (
        <PromptForm
          initialData={editingPrompt}
          onSave={handleSavePrompt}
          onCancel={() => { setIsPromptFormOpen(false); setEditingPrompt(undefined); }}
        />
      )}

      {isSkillFormOpen && (
        <SkillForm
          initialData={editingSkill}
          onSave={handleSaveSkill}
          onCancel={() => { setIsSkillFormOpen(false); setEditingSkill(undefined); }}
        />
      )}

      {showAdminPanel && (
        <AdminPanel onClose={() => { setShowAdminPanel(false); fetchPendingRequestCount().then(setPendingCount); }} />
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
