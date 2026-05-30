# Sentido

**Sentido** is a mobile-first application designed for the identification, naming, and regulation of emotions, built around the psychological framework of **Plutchik's Wheel of Emotions**.

This repository contains the full-stack, production-ready implementation of the mobile application using React Native and Expo. The architecture prioritizes an **offline-first** experience, high-performance visual interactions, and strict data privacy.

---

## 🛠 Tech Stack & Architecture Decisions

The technology stack was chosen to maximize performance on mobile devices, ensure type safety, and provide a seamless offline experience.

### Core Frameworks
*   **React Native & Expo SDK (v52)**: Chosen for cross-platform support (iOS & Android) and the Managed Workflow, which simplifies CI/CD, Over-The-Air updates, and native module management.
*   **TypeScript (Strict Mode)**: Mandatory across the entire project (v5.x) to ensure complete type safety, eliminating `any` and forcing strict null checks.
*   **Expo Router (v4)**: File-based routing providing out-of-the-box native deep linking and simplified navigation structures.

### UI, Animations & Performance
*   **React Native Skia**: Used exclusively for the interactive `EmotionWheel`, `BodyMapCanvas`, and data visualization plots. It guarantees 60fps rendering for complex SVG paths and gradients on the native thread.
*   **React Native Reanimated (v3) & Gesture Handler**: Ensures all layout animations, wheel interactions (zoom, pinch, swipe), and custom bottom sheets (`EmotionSheet`) run entirely on the native UI thread, avoiding JavaScript bridge bottlenecks.
*   **React Hook Form & Zod**: Handles user input and complex data validation without triggering unnecessary re-renders.
*   **Expo Haptics**: Implements standard tactile feedback. `ImpactFeedbackStyle.Light` for wheel sector scrolling, `Medium` for emotion selection, and `NotificationFeedbackType.Success` for completed check-ins to make the app feel physical and responsive.

### State & Data Management
*   **Zustand (v5)**: Chosen over Redux for lightweight, boilerplate-free global state. State is split across specialized stores (`useAppStore`, `useWheelStore`, `useEmotionStore`, `useUserStore`).
*   **TanStack Query (React Query v5)**: Manages server state, caching, and synchronization. Configured with `networkMode: 'offlineFirst'` to query the local SQLite cache first and seamlessly retry background mutations when the network recovers.

### Database & Offline-First Strategy
*   **Expo SQLite & Drizzle ORM**: The app is designed to work completely offline. Core data entities (`local_checkins`, `local_profile`) are stored in an embedded SQLite database. Drizzle ORM is used for type-safe SQL queries, relational operations, and automatic migrations.
*   **Supabase (PostgreSQL)**: Serves as the remote backend. The app implements a custom background sync layer (`sync.ts`) that uploads pending local check-ins when an internet connection is established, resolving conflicts using a last-write-wins strategy based on the `checked_at` timestamp.
*   **Row Level Security (RLS)**: Enforced directly on the Supabase PostgreSQL database to ensure users can only ever access or modify their own emotional data using `auth.uid()`.

### Analytics & Privacy
*   **PostHog**: Chosen for open-source, privacy-focused product analytics.
*   **Privacy by Design**: We explicitly **never log emotional data** in analytics. Tracked telemetry strictly involves UI and flow events (e.g., `checkin_completed`, `wheel_zoomed`), never the actual content.
*   **No AI Integration**: By absolute directive, this project does **not** use any local or external Artificial Intelligence/LLMs for its core logic, insights, or data processing. All insights and computations are mathematically deterministic.

---

## 🧠 Data Sources & Psychological Frameworks

The core logic and static data of Sentido are heavily grounded in established psychological and physiological research, ensuring clinical validity.

### 1. Plutchik's Wheel of Emotions
The entire emotional tree (`src/data/emotions.ts`) maps over 90 distinct emotions based on Robert Plutchik's multi-dimensional model.
*   **8 Primary Sectors**: Joy, Trust, Fear, Surprise, Sadness, Disgust, Anger, Anticipation.
*   **3 Intensity Levels**: Arranged radially. For example, Anger is split into Annoyance (Level 1, outer), Anger (Level 2, middle), and Rage (Level 3, inner).
*   **Dyads (`src/data/dyads.ts`)**: Models complex emotions formed by combining primary sectors (e.g., Joy + Trust = Love; Fear + Surprise = Awe).

### 2. Bodily Maps of Emotions (Nummenmaa et al., 2014)
The `BodyMapCanvas` feature (`src/data/body-map.ts`) relies on the widely cited 2014 study *"Bodily maps of emotions"* by Lauri Nummenmaa, Enrico Glerean, Riitta Hari, and Jari K. Hietanen.
*   **28 Tracked Regions**: The custom SVG silhouette is divided into 28 interactive, touchable regions.
*   **Deterministic Suggestion Engine**: When a user interacts with the body map, the algorithm calculates an overlap score between the tapped regions and the scientifically documented high-activation zones, suggesting the top 5 most likely emotions.
*   **Heatmap Rendering**: Selecting an emotion dynamically paints the Skia silhouette with an interpolated heatmap, representing its physical sensation (from deep blue for deactivation to red for activation).

### 3. Emotion Regulation Techniques
The app maps actionable regulation protocols (`src/data/regulation.ts`) to specific emotional states:
*   **4-7-8 Breathing**: Targeted at high-arousal states like anger and anxiety.
*   **5-4-3-2-1 Grounding**: Used for sensory anchoring during terror or panic.
*   **Somatic Responses**: Recommendations like cold water exposure for intense anger/dissociation or progressive muscle relaxation for generalized tension.

---

## 💾 Core Database Entities

The backend logic operates on a highly normalized structure mirroring the local database:

*   **`profiles`**: Extends Supabase `auth.users` via a trigger. Stores preferences like `preferred_entry_mode`, `notification_time_morning`, and `onboarding_completed`.
*   **`checkins`**: The core operational entity. Stores the `checked_at` timestamp, a JSONB array of `emotions` (recording the emotion ID, chosen intensity, and layer), the situational `context`, valence/arousal scores (calculated at insertion), and a JSONB array of involved `body_regions`.
*   **`user_insights`**: Stores locally generated, deterministic insights (e.g., repeating emotional streaks, contextual correlations) without relying on external APIs.

---

## 🎨 Design System & Aesthetics

*   **Typography**: Relies on `Playfair Display` (Black/Bold) for striking, elegant display headers, paired with `DM Sans` for highly legible body text and `DM Mono` for technical labels.
*   **Motion**: UI transitions use strict, predefined easings (like `springGentle: { damping: 22, stiffness: 150 }`) ensuring animations are fluid but not floaty.
*   **Color Transitions**: The entire UI dynamically tints its accents based on the user's currently active emotion on the wheel, utilizing `useSharedValue` and `withTiming` to interpolate colors globally.

---

## 📂 Directory Architecture

The file structure is strictly organized by domain responsibility:

```text
sentido/
├── app/                  # Expo Router declarative screens
│   ├── (tabs)/           # Main navigation (Check-in, Explore, History, Profile)
│   ├── checkin/          # Specialized entry flows (Body Map, Intensity sliders)
│   ├── emotion/          # Dynamic emotion details route `[id].tsx`
│   ├── onboarding/       # First-time user experience
│   └── auth/             # Sign in/up flows
├── src/
│   ├── components/       # UI Primitives & Domain blocks (Wheel, History Charts)
│   ├── data/             # Static constants mapping the psychological frameworks
│   ├── hooks/            # Encapsulated logic (useBodyMap, useEmotionHistory)
│   ├── services/         # Infrastructure (Drizzle schema, Supabase Auth, Audio)
│   ├── stores/           # Zustand state trees
│   ├── theme/            # Centralized Design System tokens
│   ├── types/            # Strict `.types.ts` interfaces defining data models
│   └── utils/            # Pure, side-effect-free math and validation functions
├── assets/               # Fonts, Audio guides, SVG Skia paths
└── supabase/             # SQL Migrations and Auth config
```

---

## 🚀 Running Locally

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   Node.js 20 LTS
*   `pnpm` v9+ (do not use npm or yarn)
*   Xcode 15+ (for iOS development on macOS) or Android Studio.

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local` and populate the necessary keys:
```properties
EXPO_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
EXPO_PUBLIC_POSTHOG_API_KEY=[key]
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

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
*   Press `i` to open in iOS simulator.
*   Press `a` to open in Android emulator.
*   Press `j` to open the React Native debugger.

### Available Scripts
*   `pnpm type-check`: Runs TypeScript compiler in strict mode without emitting files.
*   `pnpm lint`: Triggers ESLint and Prettier rules.
*   `pnpm supabase:types`: Automatically infers and generates TypeScript types from your Supabase PostgreSQL schema.
*   `pnpm db:studio`: Opens Drizzle Studio to inspect the local SQLite tables visually.
