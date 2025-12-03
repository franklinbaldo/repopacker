import React, { useState, useRef, useEffect } from 'react';
import { 
  Github, 
  FolderUp, 
  Box, 
  Copy, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  FileCode,
  ArrowRight,
  Loader2,
  Share2,
  History
} from 'lucide-react';

import { Settings } from './components/Settings';
import { TreeVisualizer } from './components/TreeVisualizer';
import { PRESET_FILTERS, TOKEN_LIMIT_DANGER, TOKEN_LIMIT_WARNING } from './constants';
import { processLocalFiles, fetchGithubRepo } from './services/packer';
import { PackResult, ProcessingOptions, ProcessingStatus, ToastMessage } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<'remote' | 'local'>('remote'); 
  const [gitUrl, setGitUrl] = useState('');
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [result, setResult] = useState<PackResult | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [recentRepos, setRecentRepos] = useState<string[]>([]);
  const [options, setOptions] = useState<ProcessingOptions>({
    ignorePatterns: PRESET_FILTERS.CODE_ONLY,
    removeComments: false,
    prependPrompt: '',
    includeFileTree: true,
    foldersFirst: false, // Default: Files first (root files -> folder contents)
    useGitIgnore: true,
    useRepomixIgnore: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load recent repos from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('repopacker_recent_repos');
    if (saved) {
      try {
        setRecentRepos(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent repos", e);
      }
    }
  }, []);

  const addToRecentRepos = (url: string) => {
    setRecentRepos(prev => {
      // Remove duplicates and keep only last 3, putting new one at start
      const filtered = prev.filter(r => r.toLowerCase() !== url.toLowerCase());
      const updated = [url, ...filtered].slice(0, 3);
      localStorage.setItem('repopacker_recent_repos', JSON.stringify(updated));
      return updated;
    });
  };

  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleLocalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setStatus('processing');
    setResult(null);

    try {
      await new Promise(r => setTimeout(r, 100)); // UI refresh
      const packResult = await processLocalFiles(e.target.files, options);
      setResult(packResult);
      setStatus('success');
      addToast('Repository packed successfully!', 'success');
    } catch (err) {
      console.error(err);
      setStatus('error');
      addToast('Failed to process files.', 'error');
    } finally {
       if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoteSubmit = async () => {
    if (!gitUrl.trim()) {
      addToast('Please enter a GitHub URL', 'error');
      return;
    }

    setStatus('processing');
    setResult(null);
    try {
      const packResult = await fetchGithubRepo(gitUrl, options);
      setResult(packResult);
      setStatus('success');
      addToast('Repo packed successfully', 'success');
      addToRecentRepos(gitUrl);
    } catch (err: any) {
      setStatus('error');
      console.error(err);
      addToast(err.message || 'Failed to fetch repository', 'error');
    }
  };

  const copyToClipboard = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.output);
      addToast('Copied to clipboard!', 'success');
    } catch (err) {
      addToast('Failed to copy', 'error');
    }
  };

  const downloadFile = () => {
    if (!result) return;
    const blob = new Blob([result.output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'repopacker-output.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Download started', 'success');
  };

  const sharePack = async () => {
    if (!result) return;
    
    const file = new File([result.output], "repo_context.txt", { type: "text/plain" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'RepoPacker Output',
          text: 'Here is the packed repository context.'
        });
        addToast('Shared successfully', 'success');
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      addToast('Sharing file not supported on this browser. Copied to clipboard instead.', 'info');
      copyToClipboard();
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-right-10 fade-in duration-300 flex items-center gap-2
            ${toast.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
              toast.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
              'bg-brand-500/10 text-brand-400 border border-brand-500/20'}`}>
            {toast.type === 'success' && <CheckCircle2 size={16} />}
            {toast.type === 'error' && <AlertCircle size={16} />}
            {toast.text}
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-brand-900/50">
              <Box size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">RepoPacker</span>
          </div>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
            <Github size={20} />
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-4">
            Turn your Repo into an LLM Prompt.
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Pack your entire codebase into a single, optimized XML file for Claude, ChatGPT, or Gemini. 
            Zero friction, runs entirely in your browser.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 inline-flex">
            <button
              onClick={() => setMode('remote')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                mode === 'remote' 
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Github size={18} />
              Remote Repository
            </button>
            <button
              onClick={() => setMode('local')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                mode === 'local' 
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FolderUp size={18} />
              Local Upload
            </button>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-2xl mb-8 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-brand-500/50 to-transparent opacity-50" />
          
          <div className="mb-8">
            {mode === 'remote' ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={gitUrl}
                    onChange={(e) => setGitUrl(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                  <button 
                    onClick={handleRemoteSubmit}
                    disabled={status === 'processing'}
                    className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'processing' ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                    Pack
                  </button>
                </div>
                
                {recentRepos.length > 0 && (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium uppercase tracking-wider">
                      <History size={12} /> Recent:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentRepos.map((repo, idx) => (
                        <button
                          key={idx}
                          onClick={() => setGitUrl(repo)}
                          className="text-xs bg-slate-950 border border-slate-800 hover:border-brand-500/50 text-slate-400 hover:text-brand-400 px-2 py-1 rounded-md transition-all truncate max-w-[250px]"
                          title={repo}
                        >
                          {repo.replace('https://github.com/', '').replace('github.com/', '')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-slate-700 hover:border-brand-500/50 hover:bg-slate-800/30 rounded-xl p-8 text-center transition-all cursor-pointer group relative"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  onChange={handleLocalUpload}
                  {...({ webkitdirectory: "", directory: "" } as any)}
                />
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-700 transition-colors text-brand-500">
                  <FolderUp size={32} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Drag folder here or click to upload</h3>
                <p className="text-slate-400 text-sm">
                  We'll recursively process all files in the directory.
                </p>
              </div>
            )}
          </div>

          <Settings options={options} setOptions={setOptions} />
        </div>

        {/* Results Area */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-500">
            {/* Stats and Actions Row */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Files</div>
                  <div className="text-2xl font-bold text-white">{result.stats.fileCount}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Tokens</div>
                  <div className={`text-2xl font-bold ${
                    result.stats.tokenCount > TOKEN_LIMIT_DANGER ? 'text-red-400' : 
                    result.stats.tokenCount > TOKEN_LIMIT_WARNING ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {result.stats.tokenCount.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Chars</div>
                  <div className="text-2xl font-bold text-white">{(result.stats.charCount / 1000).toFixed(1)}k</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Ignored</div>
                  <div className="text-2xl font-bold text-slate-400">{result.stats.ignoredFiles}</div>
                </div>
              </div>

              {/* Primary Actions - Prominently Placed */}
              <div className="flex flex-col gap-2 justify-center min-w-[200px] bg-slate-900/50 p-2 rounded-xl border border-slate-800/50">
                <button 
                  onClick={copyToClipboard}
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-900/30"
                >
                  <Copy size={18} /> Copy to Clipboard
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={downloadFile}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all border border-slate-700"
                    title="Download .txt"
                  >
                    <Download size={16} /> Download
                  </button>
                  <button 
                    onClick={sharePack}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all border border-slate-700"
                    title="Share with App"
                  >
                    <Share2 size={16} /> Share
                  </button>
                </div>
              </div>

            </div>

            <div className="grid md:grid-cols-3 gap-6 h-[600px]">
              {/* File Tree */}
              <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-800 bg-slate-950/30 font-medium text-slate-300 flex items-center gap-2">
                  <FolderUp size={16} /> File Structure
                </div>
                <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                  <TreeVisualizer nodes={result.tree} foldersFirst={options.foldersFirst} />
                </div>
              </div>

              {/* Output Preview */}
              <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-800 bg-slate-950/30 flex justify-between items-center">
                   <div className="font-medium text-slate-300 flex items-center gap-2">
                    <FileCode size={16} /> Output Preview
                   </div>
                   <div className="text-xs text-slate-500 font-mono">XML Format</div>
                </div>
                
                <div className="flex-1 overflow-hidden relative group">
                  <textarea 
                    className="w-full h-full bg-slate-950 p-4 font-mono text-sm text-slate-300 resize-none outline-none leading-relaxed"
                    value={result.output}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="mt-20 border-t border-slate-800 py-8 text-center text-slate-600 text-sm">
        <p>RepoPacker &copy; {new Date().getFullYear()}. Runs 100% locally in your browser.</p>
      </footer>
    </div>
  );
};

export default App;