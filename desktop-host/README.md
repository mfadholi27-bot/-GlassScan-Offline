# GlassScan Desktop Host (experimental)

Windows desktop wrapper for the existing GlassScan PWA with an optional local ChatGPT text assistant.

## What is implemented in this branch
- Electron window with context isolation, sandbox enabled, and Node integration disabled.
- A narrow preload bridge; OAuth credentials are never exposed to the renderer.
- A Windows setup script that clones the official OpenAI Sign in with ChatGPT DevKit locally and builds its `@siwc/local` SDK.
- Main-process integration for sign-in, session status, model listing, document-text requests, and disconnect.
- Electron `safeStorage` adapter for encrypted credential persistence. The app fails closed if OS encryption is unavailable.
- Local assistant UI; user must paste OCR text into the text box. It does not yet read text directly from the scanner iframe.

## Requirements
- Windows 10/11
- Git for Windows
- Node.js 22.12 or later
- Internet access for dependency installation and sign-in

## Setup
From PowerShell:

```powershell
cd path\to\-GlassScan-Offline\desktop-host
npm install
npm run setup:siwc
npm start
```

First setup downloads dependencies and the official DevKit to an ignored `vendor/` folder. It is not committed to this repository. The official DevKit has its own license; review it before redistributing the application.

## Important limits
- This is experimental and not yet tested on the user's Windows device.
- The scanner is hosted in an iframe; OCR text must be copied/pasted into the assistant field manually for now.
- The official DevKit example app is macOS-specific. This host uses the local SDK in Electron on Windows, but Windows OAuth and OS credential-storage behaviour still require real-device verification.
- Only eligible accounts with the separate ChatGPT plan-usage permission can use the AI request feature. The official guide's current example expects Plus or Pro; Go eligibility is not guaranteed.
- This is not an installer or signed release. Do not use it with sensitive documents until you have reviewed the data handling.
- No AI control is added to the public GitHub Pages PWA, and no API key is embedded in browser code.

## Official references
- https://github.com/openai/sign-in-with-chatgpt-devkit
- https://developers.openai.com/cookbook/articles/sign-in-with-chatgpt
- https://developers.openai.com/siwc/token-sharing-open-source
- https://openai.com/policies/sign-in-with-chatgpt-terms/
