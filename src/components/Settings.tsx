import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Settings as SettingsIcon, Zap, AlignLeft, ArrowDownAZ, FileMinus } from 'lucide-react';
import { ProcessingOptions } from '../types';
import { PRESET_FILTERS, PREDEFINED_PROMPTS } from '../constants';

interface SettingsProps {
  options: ProcessingOptions;
  setOptions: React.Dispatch<React.SetStateAction<ProcessingOptions>>;
}

export const Settings: React.FC<SettingsProps> = ({ options, setOptions }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleIgnoreChange = (val: string) => {
    const patterns = val.split(',').map(s => s.trim()).filter(Boolean);
    setOptions(prev => ({ ...prev, ignorePatterns: patterns }));
  };
  
  const applyPreset = (presetName: keyof typeof PRESET_FILTERS) => {
    setOptions(prev => ({ ...prev, ignorePatterns: PRESET_FILTERS[presetName] }));
  };

  return (
    <div className="border border-slate-800 rounded-lg bg-slate-900/50 overflow-hidden mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2 text-slate-300">
          <SettingsIcon size={18} />
          <span className="font-medium">Configuration & Filters</span>
        </div>
        {isOpen ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
      </button>

      {isOpen && (
        <div className="p-4 border-t border-slate-800 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Section: Prepend Prompt */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Prepend Instruction (Optional)
            </label>
            <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
               <select 
                 className="bg-slate-950 border border-slate-700 rounded-md p-2 text-sm text-slate-200 w-full focus:ring-2 focus:ring-brand-500 outline-none"
                 value={options.prependPrompt || ''}
                 onChange={(e) => setOptions(prev => ({ ...prev, prependPrompt: e.target.value }))}
               >
                 {PREDEFINED_PROMPTS.map(p => (
                   <option key={p.id} value={p.value}>{p.label}</option>
                 ))}
               </select>
            </div>
          </div>

          {/* Section: Output Formatting Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <AlignLeft size={16} className="text-brand-500" />
                 <label htmlFor="includeTree" className="text-sm text-slate-300 cursor-pointer select-none">
                   Include File Tree in Output
                 </label>
               </div>
               <input 
                  type="checkbox" 
                  id="includeTree"
                  checked={options.includeFileTree}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeFileTree: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-brand-500 focus:ring-brand-500"
                />
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <ArrowDownAZ size={16} className="text-brand-500" />
                 <label htmlFor="foldersFirst" className="text-sm text-slate-300 cursor-pointer select-none">
                   Sort: Folders before Files
                 </label>
               </div>
               <input 
                  type="checkbox" 
                  id="foldersFirst"
                  checked={options.foldersFirst}
                  onChange={(e) => setOptions(prev => ({ ...prev, foldersFirst: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-brand-500 focus:ring-brand-500"
                />
            </div>
          </div>

          {/* Dotfiles Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <FileMinus size={16} className="text-brand-500" />
                 <label htmlFor="useGitIgnore" className="text-sm text-slate-300 cursor-pointer select-none">
                   Respect .gitignore
                 </label>
               </div>
               <input 
                  type="checkbox" 
                  id="useGitIgnore"
                  checked={options.useGitIgnore}
                  onChange={(e) => setOptions(prev => ({ ...prev, useGitIgnore: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-brand-500 focus:ring-brand-500"
                />
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <FileMinus size={16} className="text-brand-500" />
                 <label htmlFor="useRepomixIgnore" className="text-sm text-slate-300 cursor-pointer select-none">
                   Respect .repomixignore
                 </label>
               </div>
               <input 
                  type="checkbox" 
                  id="useRepomixIgnore"
                  checked={options.useRepomixIgnore}
                  onChange={(e) => setOptions(prev => ({ ...prev, useRepomixIgnore: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-brand-500 focus:ring-brand-500"
                />
            </div>
          </div>

          {/* Section: Quick Presets */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-1">
              <Zap size={14} className="text-yellow-400"/> Quick Filter Presets
            </label>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => applyPreset('DEFAULT')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-mono text-slate-300 border border-slate-700 transition-colors"
              >
                Full
              </button>
              <button 
                onClick={() => applyPreset('DOCS_ONLY')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-mono text-slate-300 border border-slate-700 transition-colors"
              >
                Docs Only
              </button>
              <button 
                onClick={() => applyPreset('CODE_ONLY')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-mono text-slate-300 border border-slate-700 transition-colors"
              >
                Code Only
              </button>
              <button 
                onClick={() => applyPreset('TESTS_ONLY')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-mono text-slate-300 border border-slate-700 transition-colors"
              >
                Tests Only
              </button>
            </div>
          </div>

          {/* Section: Manual Patterns */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Additional Ignore Patterns (comma separated)
            </label>
            <textarea
              className="w-full h-24 bg-slate-950 border border-slate-700 rounded-md p-3 text-sm font-mono text-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none"
              value={options.ignorePatterns.join(', ')}
              onChange={(e) => handleIgnoreChange(e.target.value)}
              placeholder="node_modules, .git, *.png..."
            />
            <p className="text-xs text-slate-500 mt-2">
              Supports wildcards (*.png) and negation (!*.md).
            </p>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-slate-950 rounded border border-slate-800 mt-4">
            <input 
              type="checkbox" 
              id="removeComments"
              checked={options.removeComments}
              onChange={(e) => setOptions(prev => ({ ...prev, removeComments: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-slate-900"
            />
            <label htmlFor="removeComments" className="text-sm text-slate-300 cursor-pointer select-none">
              Remove code comments (Experimental)
            </label>
          </div>
        </div>
      )}
    </div>
  );
};