export interface FileNode {
  path: string;
  name: string;
  content?: string;
  size: number;
  isDirectory: boolean;
  isIgnored: boolean;
  children?: FileNode[];
}

export interface PackResult {
  stats: {
    fileCount: number;
    charCount: number;
    tokenCount: number; // Estimated
    ignoredFiles: number;
  };
  tree: FileNode[];
  output: string;
}

export interface ProcessingOptions {
  removeComments: boolean;
  ignorePatterns: string[];
  prependPrompt?: string;
  includeFileTree: boolean;
  foldersFirst: boolean;
  useGitIgnore: boolean;
  useRepomixIgnore: boolean;
}

export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}