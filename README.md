# Certificate Generator

A browser-based certificate designer built with React, TypeScript, and Vite. Choose a certificate theme, enter the recipient and organization details, upload logos or signatures, arrange the elements on the canvas, and download the completed certificate as a PDF.

## Features

- Select from several certificate colour templates.
- Guided eight-step setup for logos, organization details, certificate type, recipient, description, date, and signatures.
- Upload multiple logos and signatures.
- Drag certificate elements to set their position.
- Preview the finished certificate before export.
- Export the certificate to PDF in the browser.

## Technology

- React 18 and TypeScript
- Vite
- Tailwind CSS
- `html2canvas` and `jsPDF` for PDF generation
- Lucide React icons

## Requirements

- Node.js 18 or newer
- npm (installed with Node.js)

## Run locally

```bash
git clone https://github.com/<your-username>/certificate-generator.git
cd certificate-generator
npm ci
npm run dev
```

Open the local address displayed by Vite (normally `http://localhost:5173`).

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Create an optimized production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |

## How to use

1. Select a certificate template.
2. Complete the setup steps. Optional details can be skipped.
3. Select **Create Certificate**.
4. Drag the visible handles to arrange logos, text, and signatures.
5. Use **Preview** to check the result, then choose **Download PDF**.

Uploaded images and entered certificate details are used only in the current browser session; this project does not include a backend or database.

## Project structure

```text
src/
  app/
    components/      # Setup wizard, editor, and draggable elements
    App.tsx          # Switches between setup and editor
  styles/            # Global, Tailwind, theme, and font styles
  main.tsx           # Application entry point
```

## GitHub notes

Commit the application source, `package.json`, and `package-lock.json`. Do not commit `node_modules/`, `dist/`, generated PDFs, or local environment files. The included `.gitignore` covers these local/generated files.

## License

Add a license file (for example, MIT) before publishing if you want others to reuse the project.
