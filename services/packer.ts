import { FileNode, PackResult, ProcessingOptions } from '../types';
import { DEFAULT_IGNORE_PATTERNS } from '../constants';

// Simple in-memory cache for GitHub requests
const REQUEST_CACHE = new Map<string, Promise<any>>();

const fetchCached = (url: string, type: 'json' | 'text', forceRefresh = false) => {
  if (!forceRefresh && REQUEST_CACHE.has(url)) {
    return REQUEST_CACHE.get(url);
  }

  const promise = fetch(url).then(async res => {
    if (!res.ok) {
      throw { status: res.status, statusText: res.statusText };
    }
    return type === 'json' ? res.json() : res.text();
  });

  REQUEST_CACHE.set(url, promise);
  return promise;
};

// Helper to parse .gitignore/.repomixignore content
const parseIgnoreContent = (content: string): string[] => {
  return content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(pattern => pattern.endsWith('/') ? pattern.slice(0, -1) : pattern);
};

// Robust glob-like matcher
const isIgnored = (path: string, patterns: string[]): boolean => {
  let ignored = false;
  
  for (const pattern of patterns) {
    const isNegation = pattern.startsWith('!');
    const cleanPattern = isNegation ? pattern.slice(1).trim() : pattern.trim();
    
    if (!cleanPattern) continue;

    let matches = false;
    
    if (cleanPattern === '*') {
      matches = true;
    }
    else if (path === cleanPattern) {
      matches = true;
    }
    else if (path.split('/').includes(cleanPattern)) {
      matches = true;
    }
    else if (path.includes(`/${cleanPattern}/`)) {
      matches = true;
    }
    else if (path.startsWith(`${cleanPattern}/`)) {
      matches = true;
    }
    else if (cleanPattern.startsWith('*.')) {
      const ext = cleanPattern.slice(1);
      matches = path.endsWith(ext);
    }
    else if (path.endsWith(`/${cleanPattern}`)) {
      matches = true;
    }

    if (matches) {
      ignored = !isNegation;
    }
  }
  
  return ignored;
};

const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

const escapeCDATA = (str: string) => {
  return str.replace(/