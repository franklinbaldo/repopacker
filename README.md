# RepoPacker

RepoPacker is a tool that allows you to pack your entire codebase into a single, optimized XML file for LLMs like Claude, ChatGPT, or Gemini. It runs entirely in your browser with zero friction.

## Features

-   **Remote Repository Support**: Pack any public GitHub repository.
-   **Local Upload Support**: Drag and drop a folder from your local machine.
-   **Optimized XML Output**: Generates a single XML file containing file content and structure.
-   **Ignore Patterns**: Supports `.gitignore`, `.repomixignore`, and custom ignore patterns.
-   **Token Estimation**: Estimates token count for the packed output.
-   **File Tree Visualization**: Visualizes the file structure of the packed repository.

## Run Locally

**Prerequisites:** Node.js

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Run the app:
    ```bash
    npm run dev
    ```

3.  Open http://localhost:3000 in your browser.

## Deployment

This project is built with Vite and React. You can build it for production using:

```bash
npm run build
```

The output will be in the `dist` directory.
