# Finlo — "Every task creates a ripple."

Finlo is a full-stack task management app featuring **Fin**, your personal dolphin assistant who keeps you on track with smart priority and deadline alerts. Built with a dark neon aesthetic, Finlo makes managing tasks feel alive.

---

## Features

### Pages
| Page | Description |
|------|-------------|
| **Dashboard** | Welcome banner, Fin's inline advisor card, stat cards, activity line chart, progress bar chart, recent tasks |
| **Tasks** | Full task list with live search, status filter tabs, sort dropdown, add/edit/delete/complete |
| **Kanban Board** | Tasks grouped into three columns by priority — Low, Medium, High |
| **Calendar** | Monthly grid built in plain React; task dots colored by priority; click a date to filter tasks |
| **Fin's Alerts** | Full notification history — due today, overdue, and recently completed tasks |
| **Settings** | Profile, appearance, notifications, task defaults, and about section — all changes apply live |

### Fin the Dolphin
- Animated SVG mascot drawn entirely with SVG shapes — no image files
- Floats with a CSS keyframe animation at all times
- **Inline advisor card** on the Dashboard (inspired by the Tarsi reference) — dolphin avatar on the left, speech bubble on the right, contextual message based on task status
- **Floating corner mascot** on all other pages — click to toggle a rounded speech bubble
- Speech bubble is a proper chat-bubble shape with a CSS triangle tail
- Message adapts: idle / all clear / tasks due today / overdue / all complete
- Auto-dismisses after 5 seconds; click again to reopen

### Settings (fully functional)
| Setting | What it does |
|---------|-------------|
| Display Name & Role | Updates live in the sidebar |
| Theme (Dark / Darker) | Instantly swaps all background CSS variables |
| Accent Color | 5 neon swatches — changes highlights, glows, and active states across the entire app instantly |
| Compact View | Tightens task card padding via a CSS variable, applied immediately |
| Due Today Alerts | Toggles due-today tasks in the notification panel and badge count |
| Overdue Alerts | Toggles overdue tasks in all notification surfaces |
| Completion Toast | Controls the "Fin does a flip!" toast on task complete |
| Fin's Tips | Shows or hides the Fin advisor card on the Dashboard |
| Default Priority | Pre-selects priority in the new task form |
| Default Category | Pre-selects category in the new task form |
| Auto-Archive | Hides completed tasks older than 7 days from all views |

### Responsive Layout
| Breakpoint | Behavior |
|------------|----------|
| Desktop (≥ 1024px) | Full three-column layout: sidebar + content + right panel |
| Tablet (768–1023px) | Hamburger button toggles sidebar between full and 64px icon-only rail; right panel hidden |
| Mobile (< 768px) | Sidebar slides in as a full-screen drawer with backdrop overlay; closes on navigation; right panel hidden |

### UI Details
- All icons are inline SVGs — no emoji, no icon font
- Wave/ripple CSS loading animation matches the Finlo brand
- Toast notifications (bottom-left, auto-dismiss 3s) for every create, update, delete, complete action
- Confirmation modal before delete: "Fin will miss it."
- Error banner: "Fin ran into a wave. Please try again."
- Empty state shows the Fin dolphin SVG with a contextual message

---

## Prerequisites

- Node.js v18+
- npm

---

## Setup

### Backend — Express + SQLite

```bash
cd server
npm install
node index.js
```

Server runs at `http://localhost:3001`

> The SQLite database file (`server/db/finlo.db`) is created automatically on first run.

### Frontend — React + Vite

```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## API Endpoints

Base URL: `/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks. Query params: `search`, `status`, `priority`, `sort` |
| POST | `/api/tasks` | Create a task. Body: `title` (required), `description`, `priority`, `category`, `due_date` |
| PUT | `/api/tasks/:id` | Update a task by ID |
| PATCH | `/api/tasks/:id/toggle` | Toggle status between `active` and `completed` |
| DELETE | `/api/tasks/:id` | Delete a task by ID |
| GET | `/api/health` | Health check — returns `{ status: "ok", app: "Finlo" }` |

### Sort options (`?sort=`)
| Value | Behavior |
|-------|----------|
| `newest` | Most recently created first (default) |
| `oldest` | Oldest created first |
| `priority` | High → Medium → Low |
| `due_date` | Earliest due date first, nulls last |

---

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  status      TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed')),
  priority    TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
  category    TEXT DEFAULT 'Work',
  due_date    TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

---

## Folder Structure

```
FINLO/
├── README.md
│
├── server/
│   ├── db/
│   │   ├── init.js          # Database setup and schema creation
│   │   └── finlo.db         # SQLite database (auto-created on first run)
│   ├── routes/
│   │   └── tasks.js         # All task CRUD routes
│   ├── index.js             # Express server entry point
│   └── package.json
│
└── client/
    ├── public/
    │   └── favicon.svg      # Dolphin SVG favicon
    ├── src/
    │   ├── components/
    │   │   ├── ConfirmModal.jsx
    │   │   ├── DolphinMascot.jsx   # Fin — inline card + floating corner mascot
    │   │   ├── FilterTabs.jsx
    │   │   ├── Icons.jsx           # All SVG icons (no emoji, no icon font)
    │   │   ├── RightPanel.jsx
    │   │   ├── SearchBar.jsx
    │   │   ├── Sidebar.jsx         # Responsive: full / icon-rail / mobile drawer
    │   │   ├── StatCard.jsx
    │   │   ├── TaskCard.jsx
    │   │   ├── TaskChart.jsx       # Recharts line + bar charts
    │   │   ├── TaskForm.jsx        # Slide-in add/edit panel
    │   │   ├── TaskList.jsx
    │   │   └── TopBar.jsx
    │   ├── context/
    │   │   └── SettingsContext.jsx  # Global settings state + CSS variable injection
    │   ├── hooks/
    │   │   └── useTasks.js         # All API calls
    │   ├── pages/
    │   │   ├── Calendar.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Kanban.jsx
    │   │   ├── Notifications.jsx
    │   │   ├── Settings.jsx
    │   │   └── Tasks.jsx
    │   ├── App.jsx                 # Root layout, routing, sidebar state
    │   ├── main.jsx                # Entry point, wraps SettingsProvider
    │   └── index.css               # Global styles, CSS variables, responsive breakpoints
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Design Tokens

| CSS Variable | Default Value | Usage |
|---|---|---|
| `--color-sidebar` | `#0d1117` | Sidebar background |
| `--color-bg` | `#0a0f1e` | Main background |
| `--color-surface` | `#111827` | Card background |
| `--color-accent` / `--color-neon-blue` | `#00d4ff` | Primary neon accent (user-configurable) |
| `--color-accent-2` | `#7c3aed` | Secondary purple accent |
| `--color-high` | `#ff4466` | High priority — neon pink |
| `--color-medium` | `#f59e0b` | Medium priority — amber |
| `--color-low` | `#00ff9f` | Low priority — neon green |
| `--color-border` | `#1e2d45` | Border color |
| `--task-card-padding` | `16px` | Controlled by Compact View setting |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, React Router 6 |
| Charts | Recharts 2 |
| Backend | Express 4, Node.js |
| Database | SQLite via better-sqlite3 |
| Styling | Plain CSS with CSS custom properties |
| Icons | Hand-written inline SVGs |

---

## Credits

**Fin the dolphin** — always swimming toward your goals.

> "Every task creates a ripple."
