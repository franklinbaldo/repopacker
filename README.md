<div align="center">

![RepoPacker Banner](public/banner.png)

# RepoPacker

**Turn your entire codebase into an LLM prompt** — Zero friction, runs 100% in your browser.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-franklinbaldo.github.io/repopacker-0ea5e9?style=for-the-badge)](https://franklinbaldo.github.io/repopacker/)
[![GitHub](https://img.shields.io/badge/GitHub-RepoPacker-181717?style=for-the-badge&logo=github)](https://github.com/franklinbaldo/repopacker)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

</div>

---

## ✨ What is RepoPacker?

RepoPacker is a powerful developer tool that **packs your entire codebase** (local or remote) into a single, optimized XML/text file designed for consumption by Large Language Models like **Claude**, **ChatGPT**, and **Gemini**.

Perfect for:
- 🤖 Feeding full context to AI coding assistants
- 📚 Code reviews and documentation
- 🔍 Codebase analysis and understanding
- 📦 Sharing project structure with teammates

### 🎯 Key Features

- **🌐 Remote & Local Support** - Fetch from GitHub URLs or upload local folders
- **🎨 Smart Filtering** - Preset filters for code-only, documentation, or custom patterns
- **📊 Token Estimation** - Real-time token counting with warnings for LLM limits
- **🌳 File Tree Visualization** - Interactive tree view of your repository structure
- **⚙️ Customizable Options** - Remove comments, add prompts, respect .gitignore
- **🔒 Privacy First** - Everything runs in your browser, no server uploads
- **📋 Multiple Export Options** - Copy to clipboard, download, or share directly

---

## 🚀 Live Demo

**Try it now:** [franklinbaldo.github.io/repopacker](https://franklinbaldo.github.io/repopacker/)

### Example Usage

1. **Remote Repository**: Paste any GitHub URL (e.g., `https://github.com/facebook/react`)
2. **Local Upload**: Click to select a folder from your computer
3. **Configure Settings**: Choose filters, toggle features
4. **Pack & Export**: Copy to clipboard or download the optimized output

---

## 📦 Installation & Development

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**

### Quick Start

```bash
# Clone the repository
git clone https://github.com/franklinbaldo/repopacker.git
cd repopacker

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

---

## 🛠️ Tech Stack

<div align="center">

| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool & Dev Server |
| **TailwindCSS** | Styling (via CDN) |
| **Lucide Icons** | Icon Library |

</div>

---

## ⚙️ Configuration Options

RepoPacker provides extensive customization through the Settings panel:

| Option | Description | Default |
|--------|-------------|---------|
| **Ignore Patterns** | File/folder patterns to exclude (supports wildcards) | Code Only preset |
| **Remove Comments** | Strip comments from source files | Off |
| **Prepend Prompt** | Add custom instructions at the beginning | Empty |
| **Include File Tree** | Generate visual file structure | On |
| **Folders First** | Sort folders before files in tree | Off |
| **Use .gitignore** | Respect repository's .gitignore rules | On |
| **Use .repomixignore** | Support custom ignore file | On |

### Preset Filters

- **Code Only** - Excludes node_modules, build artifacts, media files
- **Documentation** - Includes only markdown and doc files
- **Custom** - Define your own ignore patterns

---

## 📋 Output Format

RepoPacker generates XML-formatted output optimized for LLM consumption:

```xml
<files_summary>
  <purpose>Repository context for LLM processing</purpose>
  <source_identifier>repository-name</source_identifier>
  <statistics>
    <files_count>42</files_count>
    <total_characters>150000</total_characters>
    <estimated_tokens>35000</estimated_tokens>
  </statistics>
</files_summary>

<file_tree>
  [Visual representation of directory structure]
</file_tree>

<file path="src/App.tsx">
  [File contents]
</file>
...
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style
- Use conventional commits (feat:, fix:, docs:, etc.)
- Test your changes thoroughly
- Update documentation as needed

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by tools like [Repomix](https://github.com/yamadashy/repomix)
- Built with modern web technologies
- Community feedback and contributions

---

<div align="center">

**Made with ❤️ by [Franklin Baldo](https://github.com/franklinbaldo)**

[⭐ Star this repo](https://github.com/franklinbaldo/repopacker) if you find it useful!

</div>
