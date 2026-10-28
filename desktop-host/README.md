# GlassScan Desktop Host (experimental)

This folder is an isolated Windows desktop-host scaffold on the `feature/chatgpt-local-host` branch. It does not alter the deployed GitHub Pages PWA.

## Current state
- Electron window opens the existing GlassScan GitHub Pages app.
- Renderer isolation is enabled: context isolation, sandbox, and Node integration disabled.
- The preload exposes only a non-sensitive status marker.
- **ChatGPT authentication and AI requests are not implemented yet.** No fake sign-in button is shown and no credentials are collected.

## Run on Windows
Requires Node.js (LTS) and npm.

```powershell
cd desktop-host
npm install
npm start
```

This is a development scaffold, not a signed installer. First launch requires internet access because it loads the hosted PWA.

## Next implementation gate
Before adding ChatGPT plan usage, integrate the official OpenAI Sign in with ChatGPT DevKit in the local Node process and verify the supported SDK interfaces, OAuth callback, state/nonce/PKCE, token validation and refresh, and OS-protected credential storage. Do not expose tokens to the renderer, URL, logs, or repository. The current official example is macOS-specific, so Windows compatibility must be validated before claiming support.

Official references:
- https://github.com/openai/sign-in-with-chatgpt-devkit
- https://developers.openai.com/siwc/token-sharing-open-source
- https://developers.openai.com/siwc/token-sharing-open-source/sign-in

ChatGPT plan eligibility depends on the account and the integration's current eligibility rules. Do not assume Go eligibility from a successful identity sign-in.
