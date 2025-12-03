export const DEFAULT_IGNORE_PATTERNS = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "*.png",
  "*.jpg",
  "*.jpeg",
  "*.gif",
  "*.svg",
  "*.ico",
  "*.pdf",
  "*.zip",
  "*.tar",
  "*.gz",
  ".DS_Store"
];

export const TOKEN_LIMIT_WARNING = 128000; // Warning threshold
export const TOKEN_LIMIT_DANGER = 200000; // Context window danger zone (approx)

export const PRESET_FILTERS = {
  DEFAULT: DEFAULT_IGNORE_PATTERNS,
  DOCS_ONLY: [
    "*",
    "!*.md",
    "!*.txt",
    "!*.rst",
    "!docs/",
    "!documentation/",
    "!LICENSE",
    "!CONTRIBUTING.md",
    "!README.md"
  ],
  CODE_ONLY: [
    ...DEFAULT_IGNORE_PATTERNS,
    "*.md",
    "*.txt",
    "docs/",
    "LICENSE",
    "assets/",
    "images/"
  ],
  TESTS_ONLY: [
    "*",
    "!*.test.ts",
    "!*.test.js",
    "!*.test.tsx",
    "!*.spec.ts",
    "!*.spec.js",
    "!*.spec.tsx",
    "!tests/",
    "!__tests__/"
  ]
};

export const PREDEFINED_PROMPTS = [
  { id: 'none', value: '', label: 'No Prompt (Default)' },
  { id: 'readme', value: 'Based on the codebase provided, write a comprehensive README.md. Include what the project does, how to install it, how to configure it, and examples of usage.', label: 'Write a README' },
  { id: 'wins', value: 'Identify "low-hanging fruit" in this repository—changes that are easy to implement but provide significant value (refactoring, performance, security, or readability).', label: 'Find Easy Wins' },
  { id: 'arch', value: 'Analyze the file structure and code to explain the software architecture. Identify key modules, patterns used, and data flow. Point out any questionable architectural decisions.', label: 'Architecture Review' },
  { id: 'audit', value: 'Perform a security and code quality audit on the following code. Identify potential bugs, security risks, and areas for improvement.', label: 'Code Audit' },
  { id: 'explain', value: 'Explain how this code works, focusing on the main architecture and data flow.', label: 'Explain Codebase' }
];