import React, { useState } from 'react';
import { File, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { FileNode } from '../types';

interface TreeProps {
  nodes: FileNode[];
  depth?: number;
  foldersFirst?: boolean;
}

const TreeNode: React.FC<{ node: FileNode; depth: number; foldersFirst: boolean }> = ({ node, depth, foldersFirst }) => {
  const [isOpen, setIsOpen] = useState(depth < 1); // Open root level folders by default

  const handleToggle = () => {
    if (node.isDirectory) setIsOpen(!isOpen);
  };

  const isIgnored = node.isIgnored;
  const opacityClass = isIgnored ? 'opacity-40 select-none' : 'opacity-100';
  const textClass = isIgnored ? 'line-through text-slate-500' : 'text-slate-300';

  return (
    <div className="select-none">
      <div 
        className={`flex items-center py-1 px-2 hover:bg-slate-800/50 rounded cursor-pointer transition-colors ${opacityClass}`}
        style={{ paddingLeft: `${depth * 1.25}rem` }}
        onClick={handleToggle}
      >
        <span className="mr-2 text-slate-500">
          {node.isDirectory ? (
             isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
             <div className="w-[14px]" /> 
          )}
        </span>
        
        <span className="mr-2 text-brand-500">
          {node.isDirectory ? (
            isOpen ? <FolderOpen size={16} /> : <Folder size={16} />
          ) : (
            <File size={16} className="text-slate-400" />
          )}
        </span>
        
        <span className={`text-sm font-mono truncate ${textClass}`}>
          {node.name}
        </span>
        
        {isIgnored && <span className="ml-2 text-xs text-slate-600 border border-slate-700 px-1 rounded">ignored</span>}
      </div>

      {node.isDirectory && isOpen && node.children && (
        <div>
          <TreeVisualizer nodes={node.children} depth={depth + 1} foldersFirst={foldersFirst} />
        </div>
      )}
    </div>
  );
};

export const TreeVisualizer: React.FC<TreeProps> = ({ nodes, depth = 0, foldersFirst = false }) => {
  // Sort based on foldersFirst preference
  const sortedNodes = [...nodes].sort((a, b) => {
    if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
    
    if (foldersFirst) {
      return a.isDirectory ? -1 : 1; // Folders first
    } else {
      return a.isDirectory ? 1 : -1; // Files first
    }
  });

  return (
    <div className="flex flex-col">
      {sortedNodes.map((node) => (
        <TreeNode key={node.path} node={node} depth={depth} foldersFirst={foldersFirst} />
      ))}
    </div>
  );
};