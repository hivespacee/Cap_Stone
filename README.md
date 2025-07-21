# Chotaa Notion

## Overview

Chotaa Notion is a modern, collaborative document editing platform inspired by Notion, designed for seamless real-time collaboration, organization, and productivity. It features a beautiful, production-ready UI, robust backend, and real-time editing capabilities.

---

## Tech Stack

**Frontend:**
- React (JSX, hooks)
- Vite (fast dev/build)
- Tailwind CSS (utility-first styling)
- Lucide React (icons)
- Firebase (authentication, Firestore, storage)
- Socket.IO (real-time collaboration)
- BlockNote (rich text editor)
- Y-Sweet/Yjs (advanced real-time document sync)

**Backend:**
- Node.js (Bun runtime)
- Express (API server)
- Socket.IO (WebSocket server)
- Firebase Admin SDK (user management, Firestore access)
- CORS, dotenv (config, security)

---

## Features

- **Authentication:** Email/password & Google login, password reset, secure user profiles.
- **Document Management:** Create, edit, delete, organize documents in folders.
- **Real-Time Collaboration:** Multiple users can edit the same document simultaneously, see live cursors and active users.
- **Comments & Sharing:** Add comments, share documents with granular permissions (viewer, editor, admin).
- **Rich Editor:** BlockNote-based editor with formatting, blocks, and collaborative cursors.
- **Dashboard:** Recent documents, quick access, search, and folder navigation.
- **Responsive UI:** Works beautifully on desktop and mobile.
- **Dark/Light Theme:** Toggle between themes for optimal comfort.
- **Notifications:** Toasts for feedback on actions.
- **Profile Management:** User avatars, display names, and settings.

---

## System Design

### High-Level Architecture

```
[ Client (React/Vite) ] <---> [ Backend (Express/Bun) ] <---> [ Firebase (Firestore, Auth) ]
         |                                 |
         |<------ Socket.IO (WebSocket) ----|
         |                                 |
         |<------ REST API (Express) ------|
```

- **Frontend** connects to backend via REST for CRUD and via Socket.IO for real-time events.
- **Backend** acts as a gateway, handling authentication, document updates, and real-time events.
- **Firebase** stores user profiles, documents, folders, and handles authentication.

### Low-Level Design

- **Document Model:** Each document has title, content (BlockNote blocks), roles, members, comments, timestamps.
- **Folder Model:** Folders are user-scoped, contain documents.
- **User Model:** Profile info, avatar, permissions.
- **Socket.IO:** Handles events like `joinDocument`, `leaveDocument`, `documentChange`, `activeUsers`, `cursorUpdate`.
- **Y-Sweet/Yjs:** Provides advanced CRDT-based real-time editing, awareness (cursors, presence).

---

## UI/UX Design

- **Beautiful, Modern UI:** Custom-designed with Tailwind CSS, Rubik font, and Lucide icons for a unique, inviting look.
- **Intuitive Navigation:** Sidebar for folders/documents, dashboard for quick access, modals for actions.
- **Collaborative Indicators:** See who is active, live cursors, and comments.
- **Accessibility:** Keyboard navigation, focus states, readable colors.
- **Responsive:** Adapts to all screen sizes, touch-friendly controls.
- **Animations:** Subtle transitions and feedback for a delightful experience.

---

## Better Ideas & Suggestions

- **Offline Support:** Consider adding local caching for offline editing.
- **Version History:** Implement document versioning and rollback.
- **Notifications:** Push/email notifications for document changes or comments.
- **Integrations:** Add export/import (Markdown, PDF), calendar/task integration.
- **Advanced Permissions:** Share folders, invite via link, granular access control.
- **AI Features:** Smart suggestions, summarization, or grammar checking.
- **Mobile App:** Build a React Native version for mobile-first users.

---

## Getting Started

1. **Install dependencies:**
   - Frontend: `npm install` (or `bun install`)
   - Backend: `bun install`
2. **Configure environment variables:**
   - Frontend: `.env` for Firebase and API base URL
   - Backend: `.env` for Firebase Admin and frontend base URL
3. **Run the project:**
   - Frontend: `npm run dev` (or `bun run dev`)
   - Backend: `bun run`
4. **Access the app:** Open [http://localhost:5173](http://localhost:5173) (or your configured frontend URL).

---

## Folder Structure

```
project/
  frontend/
    src/
      components/
      contexts/
      pages/
      config/
      index.css
      main.jsx
    tailwind.config.js
    index.html
  backend/
    server.js
    package.json
    README.md
  README.md
```

---

## Contributing

- Fork the repo, create a feature branch, submit PRs.
- Follow code style (JSX, Tailwind, Lucide icons).
- Suggest UI/UX improvements or new features!

---


## Credits

- Inspired by Notion, built with love by Team Chotaa Notion.
