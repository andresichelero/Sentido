<div align="center">
  <img src="assets/images/icon.png" width="120" alt="Sentido Logo" />
  <h1>Sentido</h1>
  <p><b>A mobile-first application for identifying, naming, and regulating emotions.</b></p>
  
  <p>
    <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue.svg" alt="Platforms" />
    <img src="https://img.shields.io/badge/Framework-React%20Native%20%7C%20Expo-black.svg" alt="Framework" />
    <img src="https://img.shields.io/badge/TypeScript-Strict-blue.svg" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Status-Active-success.svg" alt="Status" />
  </p>
</div>

<br/>

## 📱 About the App

**Sentido** is built around the psychological framework of **Plutchik's Wheel of Emotions**. This repository contains the full-stack, production-ready implementation of the mobile application. The architecture prioritizes an **offline-first** experience, high-performance visual interactions, and strict data privacy.

<br/>
<p align="center">
  <img src="assets/animations/wheel.gif" width="300" alt="Sentido Emotion Wheel Demo" />
</p>
<br/>

## ✨ Key Features & Data Sources

*   **Interactive Emotion Wheel:** A high-performance, zoomable, and rotatable 60fps SVG wheel mapping 90+ emotions. Built using Plutchik's model with 3 intensity levels and complex dyads.
*   **Bodily Maps of Emotions:** An interactive SVG body map that suggests emotions based on physiological sensations (based on Nummenmaa et al., 2014).
*   **Actionable Regulation Techniques:** Built-in grounding exercises (like 4-7-8 breathing and 5-4-3-2-1 grounding) linked to specific high-arousal emotions.
*   **Offline-First & Auto-Sync:** Fully functional without an internet connection using local SQLite. Automatically syncs with Supabase when online.
*   **Privacy-Centric:** All emotion data is strictly personal. No external AI APIs are used to interpret your feelings. Analytics only track anonymous UI interactions.

## 🛠 Tech Stack & Architecture

### Core Frameworks
*   **[React Native & Expo SDK (v56)](https://expo.dev/)**: Cross-platform development with Managed Workflow for simplified CI/CD, Over-The-Air updates, and native module management.
*   **TypeScript (Strict Mode)**: Mandatory across the entire project to ensure complete type safety.
*   **Expo Router (v4)**: File-based routing providing out-of-the-box native deep linking.

### UI, Animations & Performance
*   **React Native Skia**: Used exclusively for the interactive Emotion Wheel, BodyMapCanvas, and data visualization plots.
*   **React Native Reanimated (v4) & Gesture Handler**: Fluid layout and interaction animations on the native UI thread, avoiding JavaScript bridge bottlenecks.
*   **Expo Haptics**: Standard tactile feedback to make the app feel physical and responsive.
*   **Zod & React Hook Form**: Robust data validation and form handling.

### State & Data Management
*   **Zustand (v5)**: Lightweight, modular global state, split across specialized stores.
*   **TanStack Query (React Query v5)**: Manages server state, caching, and synchronization with an `offlineFirst` strategy.
*   **Expo SQLite & Drizzle ORM**: Local embedded database and type-safe SQL for the offline experience.
*   **Supabase (PostgreSQL)**: Remote backend with Row Level Security (RLS) ensuring users only access their own data.

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### 1. Prerequisites
Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v20 LTS recommended)
*   **`pnpm`** (v9+) - *Do not use npm or yarn.*
*   [Xcode 15+](https://developer.apple.com/xcode/) (for iOS simulator) or [Android Studio](https://developer.android.com/studio) (for Android emulator).

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/sentido.git
cd sentido
pnpm install
```

### 3. Environment Variables
Create a `.env.local` file by copying the example:
```bash
cp .env.example .env.local
```
Fill in the necessary Supabase and PostHog keys in your `.env.local` file.

### 4. Database Initialization
Run the Drizzle Kit scripts to generate and apply SQLite migrations locally:
```bash
pnpm db:generate
pnpm db:migrate
```

### 5. Start the Server
Launch the Expo development server:
```bash
pnpm start
```
*   Press `i` to open in **iOS simulator**.
*   Press `a` to open in **Android emulator**.
*   Press `j` to open the React Native debugger.

#### Available Scripts
*   `pnpm type-check`: Runs TypeScript compiler in strict mode without emitting files.
*   `pnpm lint`: Triggers ESLint and Prettier rules.
*   `pnpm supabase:types`: Automatically infers and generates TypeScript types from your Supabase PostgreSQL schema.
*   `pnpm db:studio`: Opens Drizzle Studio to inspect the local SQLite tables visually.

## 📂 Directory Architecture
The file structure is strictly organized by domain responsibility:

```text
sentido/
├── app/                  # Expo Router declarative screens & flows
├── src/
│   ├── components/       # UI Primitives & Domain blocks (Wheel, Charts)
│   ├── data/             # Static constants & psychological frameworks
│   ├── hooks/            # Encapsulated logic 
│   ├── services/         # Infrastructure (Drizzle schema, Auth, Audio)
│   ├── stores/           # Zustand state trees
│   ├── theme/            # Centralized Design System tokens
│   ├── types/            # Strict TypeScript interfaces
│   └── utils/            # Pure functions and validation helpers
├── assets/               # Fonts, Audio guides, SVG Skia paths
└── supabase/             # SQL Migrations and Auth config
```

## 🙏 Acknowledgments

*   **Anatomical SVG Paths**: The high-fidelity SVG paths used in the interactive Body Map (Sentido's Heatmap) were extracted and adapted from the excellent open-source project [vulovix/body-muscles](https://github.com/vulovix/body-muscles) (see demo: [vulovix.github.io/body-muscles](https://vulovix.github.io/body-muscles/)). Their meticulously mapped anatomical vectors serve as the foundational rendering engine for our UI's hit-testing and aura effects.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License
This project is licensed under the terms of the MIT license. See [LICENSE](LICENSE) for details.
