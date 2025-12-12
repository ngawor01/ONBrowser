# ON Browser

A privacy-focused mobile browser built with React Native and Expo, featuring built-in AdBlock, UserScript support, and comprehensive fingerprint protection.

## Overview

ON Browser is a mobile browser application that prioritizes user privacy with features similar to uBlock Origin and Tampermonkey, along with advanced privacy protections to prevent browser fingerprinting and tracking.

## Key Features

- **WebView-based Browser**: Full web browsing with navigation controls
- **AdBlock**: Built-in ad blocking with homepage ad allowance (like uBlock Origin)
- **UserScripts**: Tampermonkey-style custom JavaScript injection
- **Privacy Suite**: Canvas fingerprint protection, WebGL spoofing, font blocking, audio protection, resolution spoofing, WebRTC blocking, anti-proxy detection, smart timezone, random user agent
- **Tab Management**: Multiple browser tabs with tab manager
- **Bookmarks & History**: Save favorite pages and view browsing history

## Project Structure

```
client/
├── components/      # Reusable UI components
├── constants/       # Theme, colors, typography
├── hooks/           # Custom React hooks
├── lib/             # Storage, privacy scripts
├── navigation/      # React Navigation setup
└── screens/         # App screens
    ├── BrowserScreen.tsx      # Main browser
    ├── TabManagerScreen.tsx   # Tab management
    ├── SettingsScreen.tsx     # Settings menu
    ├── PrivacySuiteScreen.tsx # Privacy toggles
    ├── AdBlockScreen.tsx      # AdBlock settings
    ├── UserScriptScreen.tsx   # UserScript manager
    ├── BookmarksScreen.tsx    # Saved bookmarks
    └── HistoryScreen.tsx      # Browsing history

server/              # Express backend
assets/images/       # App icons and images
```

## Tech Stack

- **Frontend**: React Native with Expo SDK 54
- **Navigation**: React Navigation 7
- **Storage**: AsyncStorage for local persistence
- **WebView**: react-native-webview for browsing
- **Backend**: Express.js

## Design

- Brand colors: Blue (#2196F3) and Green (#4CAF50)
- iOS-style liquid glass interface
- Dark mode support
- Frosted glass effects on toolbars

## Running the App

```bash
npm run all:dev
```

This starts both the Expo development server (port 8081) and Express server (port 5000).

## Recent Changes

- December 11, 2025: Initial implementation of ON Browser with full privacy suite, AdBlock, UserScripts, tab management, bookmarks, and history features.
