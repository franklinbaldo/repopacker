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
  return str.replace(/]]>/g, ']]]]><![CDATA[>');
};

export const processLocalFiles = async (
  fileList: FileList,
  options: ProcessingOptions
): Promise<PackResult> => {
  const files: FileNode[] = [];
  let tokenCount = 0;
  let charCount = 0;
  let ignoredFiles = 0;

  const ignorePatterns = [...DEFAULT_IGNORE_PATTERNS];
  if (options.useGitIgnore) {
    // Attempt to find .gitignore in the root (files are flat list but have webkitRelativePath)
    // In a flat FileList from folder upload, we can look for one named ".gitignore"
    // Note: This is a simplification. Real gitignore logic is hierarchical.
    for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].name === '.gitignore') {
            const text = await fileList[i].text();
            ignorePatterns.push(...parseIgnoreContent(text));
        }
    }
  }
  if (options.useRepomixIgnore) {
    for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].name === '.repomixignore') {
            const text = await fileList[i].text();
            ignorePatterns.push(...parseIgnoreContent(text));
        }
    }
  }
  // Add user defined ignores
  if (options.ignorePatterns) {
      ignorePatterns.push(...parseIgnoreContent(options.ignorePatterns));
  }


  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const path = file.webkitRelativePath || file.name;

    // Skip if directory (shouldn't happen with FileList usually but good to check)
    // or if ignored
    if (isIgnored(path, ignorePatterns)) {
        ignoredFiles++;
        continue;
    }

    // Basic binary check (skip images, etc)
    // This is very basic.
    if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/')) {
        ignoredFiles++;
        continue;
    }

    try {
        const content = await file.text();
        // Check for binary content roughly by looking for null bytes
        if (content.includes('\0')) {
             ignoredFiles++;
             continue;
        }

        const tokens = estimateTokens(content);
        tokenCount += tokens;
        charCount += content.length;

        files.push({
            path,
            content: options.removeComments ? content : content, // TODO: Implement remove comments
            type: 'file',
            tokenCount: tokens
        });

    } catch (e) {
        console.warn(`Failed to read ${path}`, e);
        ignoredFiles++;
    }
  }

  const output = generateXML(files, options);

  return {
    output,
    stats: {
        fileCount: files.length,
        tokenCount,
        charCount,
        ignoredFiles
    },
    tree: buildTree(files)
  };
};

export const fetchGithubRepo = async (
    url: string,
    options: ProcessingOptions
): Promise<PackResult> => {
    // Parse URL
    // Supports: https://github.com/user/repo
    // or https://github.com/user/repo/tree/branch

    const urlParts = url.replace('https://github.com/', '').split('/');
    if (urlParts.length < 2) throw new Error('Invalid GitHub URL');

    const owner = urlParts[0];
    const repo = urlParts[1];
    let branch = 'main'; // Default, will try to detect or fallback to master
    let subpath = '';

    if (urlParts.length > 3 && urlParts[2] === 'tree') {
        branch = urlParts[3];
        subpath = urlParts.slice(4).join('/');
    } else {
        // Try to get default branch
        try {
            const repoData = await fetchCached(`https://api.github.com/repos/${owner}/${repo}`, 'json');
            branch = repoData.default_branch || 'main';
        } catch (e) {
            console.warn('Failed to fetch repo info, assuming main', e);
        }
    }

    // Get file tree (recursive)
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
    const treeData = await fetchCached(treeUrl, 'json');

    if (treeData.message === 'Not Found' || !treeData.tree) {
         throw new Error('Repository not found or empty');
    }

    const ignorePatterns = [...DEFAULT_IGNORE_PATTERNS];

    // Check for ignore files first
    const ignoreFiles = treeData.tree.filter((node: any) =>
        node.path === '.gitignore' || node.path === '.repomixignore'
    );

    for (const ignoreNode of ignoreFiles) {
        if (options.useGitIgnore && ignoreNode.path === '.gitignore') {
             const content = await fetchCached(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${ignoreNode.path}`, 'text');
             ignorePatterns.push(...parseIgnoreContent(content));
        }
        if (options.useRepomixIgnore && ignoreNode.path === '.repomixignore') {
             const content = await fetchCached(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${ignoreNode.path}`, 'text');
             ignorePatterns.push(...parseIgnoreContent(content));
        }
    }
     if (options.ignorePatterns) {
      ignorePatterns.push(...parseIgnoreContent(options.ignorePatterns));
     }


    const files: FileNode[] = [];
    let tokenCount = 0;
    let charCount = 0;
    let ignoredFiles = 0;

    // Process files
    // Use Promise.all with concurrency limit ideally, but simple map for now
    // We filter first to avoid too many requests
    const candidateFiles = treeData.tree.filter((node: any) => {
        if (node.type !== 'blob') return false; // files only
        if (subpath && !node.path.startsWith(subpath)) return false;
        if (isIgnored(node.path, ignorePatterns)) {
            ignoredFiles++;
            return false;
        }
        return true;
    });

    // Fetch content in batches
    const BATCH_SIZE = 5;
    for (let i = 0; i < candidateFiles.length; i += BATCH_SIZE) {
        const batch = candidateFiles.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (node: any) => {
            try {
                const content = await fetchCached(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${node.path}`, 'text');
                 // Check binary (null bytes)
                if (content.includes('\0')) {
                    ignoredFiles++;
                    return;
                }

                const tokens = estimateTokens(content);
                tokenCount += tokens;
                charCount += content.length;

                files.push({
                    path: node.path,
                    content,
                    type: 'file',
                    tokenCount
                });
            } catch (e) {
                console.warn(`Failed to fetch ${node.path}`, e);
                ignoredFiles++;
            }
        }));
    }

    const output = generateXML(files, options);

    return {
        output,
        stats: {
            fileCount: files.length,
            tokenCount,
            charCount,
            ignoredFiles
        },
        tree: buildTree(files)
    };
};


const generateXML = (files: FileNode[], options: ProcessingOptions): string => {
    let xml = '';

    if (options.prependPrompt) {
        xml += `${options.prependPrompt}\n\n`;
    }

    xml += `<repository_context>\n`;

    if (options.includeFileTree) {
        xml += `<file_tree>\n${printTree(buildTree(files))}\n</file_tree>\n`;
    }

    // Sort files? options.foldersFirst
    // A simple sort by path works reasonably well
    files.sort((a, b) => a.path.localeCompare(b.path));

    for (const file of files) {
        xml += `<file path="${file.path}">\n<![CDATA[\n${escapeCDATA(file.content)}\n]]>\n</file>\n`;
    }

    xml += `</repository_context>`;
    return xml;
};

// Tree building helper
interface TreeNode {
    name: string;
    path: string;
    type: 'file' | 'folder';
    children?: TreeNode[];
}

const buildTree = (files: FileNode[]): TreeNode[] => {
    const root: TreeNode[] = [];

    for (const file of files) {
        const parts = file.path.split('/');
        let currentLevel = root;
        let currentPath = '';

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isFile = i === parts.length - 1;
            currentPath = currentPath ? `${currentPath}/${part}` : part;

            let existingNode = currentLevel.find(n => n.name === part);

            if (!existingNode) {
                existingNode = {
                    name: part,
                    path: currentPath,
                    type: isFile ? 'file' : 'folder',
                    children: isFile ? undefined : []
                };
                currentLevel.push(existingNode);
            }

            if (!isFile && existingNode.children) {
                currentLevel = existingNode.children;
            }
        }
    }
    return root;
};

const printTree = (nodes: TreeNode[], prefix = ''): string => {
    let output = '';
    nodes.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'folder' ? -1 : 1;
    });

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const isLast = i === nodes.length - 1;
        const marker = isLast ? '└── ' : '├── ';

        output += `${prefix}${marker}${node.name}\n`;

        if (node.children) {
            output += printTree(node.children, `${prefix}${isLast ? '    ' : '│   '}`);
        }
    }
    return output;
};
