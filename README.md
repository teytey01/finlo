# Finlo — "Every task creates a ripple."

Finlo is a full-stack task management web application featuring **Fin**, your personal dolphin assistant who keeps you on track with smart priority and deadline alerts. Built with a dark neon aesthetic, Finlo combines practical task management with an interactive, customizable experience across seven fully functional pages.

---

## Features

### Pages

| Page | Description |
|------|-------------|
| **Dashboard** | Welcome banner, Fin's inline advisor card, clickable stat cards, 7-day activity line chart, progress bar chart, recent tasks |
| **Tasks** | Full task list with live search, status filter tabs, sort dropdown, add/edit/delete/complete, click any task to view full details |
| **Kanban Board** | User-customizable columns with drag-and-drop; filters for Priority and Status |
| **Calendar** | Interactive monthly grid — click + to create a task on a date, drag tasks to reschedule |
| **Tags** | Tag cloud showing all unique tags across tasks; click a tag to filter its tasks |
| **Fin's Alerts** | Full notification history — due today, overdue, and recently completed tasks |
| **Settings** | Profile, appearance, notifications, task defaults, and about — all changes apply live |

---

### Dashboard — Clickable Stat Cards

All four stat cards are interactive:

| Card | Shows |
|------|-------|
| Total Tasks | All tasks |
| Active | Tasks with status `active` |
| Completed | Tasks with status `completed` |
| Overdue | Active tasks past their due date |

Clicking a card opens a centered modal overlay showing matching tasks with full edit, complete, and delete actions. Close by clicking the X, clicking outside the modal, or pressing Escape.

---

### Task Detail View

Clicking any task card anywhere in the app opens a full detail drawer showing:

- Title, priority badge, category, status label (Completed / Overdue)
- Description
- Due date, time estimate, created date
- **Tags** — displayed as neon cyan pills
- **Subtasks** — interactive checkboxes that save immediately to the database; progress bar shows completion ratio
- **Attachments** — image attachments show a thumbnail preview; other files show a type icon; each has a Download button

The detail drawer has footer actions: Edit Task, Mark Done/Active, Delete.

---

### Kanban Board — Customizable Columns

- **Add columns** — click "Add Column", type a name, press Enter
- **Rename columns** — double-click a column title or click the edit icon; press Enter to confirm
- **Recolor columns** — pick from 6 neon color swatches while editing
- **Reorder columns** — use ‹ › arrow buttons to move columns left or right
- **Delete columns** — tasks in the deleted column become unassigned
- **Drag tasks between columns** — drag any card and drop into another column; persists to the database

**Filters:**

| Filter | Options |
|--------|---------|
| Priority | High · Medium · Low (multi-select) |
| Status | Active · Completed · Overdue (multi-select) |

Filters are combinable. Column count badges show `filtered/total` when active. A "Clear" button resets all filters. Drag and drop continues to work normally when filters are applied.

---

### Calendar — Interactive

- **Click + on a date cell** (appears on hover) — opens the task form with that date pre-filled
- **Click a date** — shows all tasks due on that day below the calendar
- **Drag a task card** onto any calendar cell to reschedule its due date

---

### Tags Page

- Lists every unique tag used across all tasks as a **tag cloud**
- Chips are sized proportionally based on task count; each shows a count badge
- Click a tag chip to filter and view all tasks with that tag
- Click again or "Clear filter" to return to the full cloud
- Shows how many tasks have no tags at all

---

### Task Properties — Extended

The task form has two tabs: **Basic** and **Extended**.

**Basic tab:**
- Title (required, max 100 characters with live counter)
- Description
- Priority — Low / Medium / High
- Category — Work / Personal / Study / Other
- Due Date

**Extended tab:**
- **Time Estimate** — in hours (e.g. 2.5); shown as a preview on task cards and in the detail view
- **Tags / Labels** — freeform tags, shown as neon pills; browsable on the Tags page
- **Subtasks** — checklist items; toggle done/undone directly in the detail drawer without opening the edit form; progress bar on card preview and detail view
- **Attachments** — attach any file up to 5 MB (images auto-compressed); images show thumbnails; all files have a Download button in the detail view

---

### Fin the Dolphin — Mascot

Fin's image is loaded from `/public/fin.png` — replace this file to use your own image.

- **Inline advisor card** on the Dashboard — Fin's image on the left, speech bubble on the right; message adapts based on task status (idle / due today / overdue / all complete / all clear)
- **Floating corner mascot** on all other pages — click to toggle a rounded chat bubble with a CSS triangle tail; auto-dismisses after 5 seconds
- Both the sidebar logo and all mascot appearances use the same `fin.png` image

---

### Settings — Fully Functional

| Setting | What it does |
|---------|-------------|
| Display Name & Role | Updates live in the sidebar |
| Theme (Dark / Darker) | Instantly swaps all background CSS variables |
| Accent Color | 5 neon swatches — changes highlights, glows, and active states across the entire app instantly |
| Compact View | Tightens task card padding via a CSS variable, applied immediately |
| Due Today Alerts | Toggles due-today tasks in the notification panel and badge count |
| Overdue Alerts | Toggles overdue tasks in all notification surfaces |
| Completion Toast | Controls the toast message on task complete |
| Fin's Tips | Shows or hides the Fin advisor card on the Dashboard |
| Default Priority | Pre-selects priority in the new task form |
| Default Category | Pre-selects category in the new task form |
| Auto-Archive | Hides completed tasks older than 7 days from all views |

---

### Responsive Layout

| Breakpoint | Behavior |
|------------|----------|
| Desktop ≥ 1024px | Full layout: sidebar + content + right panel |
| Tablet 768–1023px | Hamburger toggles sidebar between full and 64px icon-only rail; right panel hidden |
| Mobile < 768px | Sidebar slides in as a full-screen drawer with backdrop; closes on navigation; right panel hidden |

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

> The SQLite database (`server/db/finlo.db`) is created automatically on first run. Existing databases are migrated automatically — new columns are added without losing data.

### Frontend — React + Vite

```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## Custom Mascot Image

To replace Fin's dolphin image with your own:

1. Copy your image file to `client/public/fin.png`
2. That's it — all three locations (sidebar logo, dashboard card, floating mascot) will use it automatically

---

## API Endpoints

Base URL: `/api`

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks. Query params: `search`, `status`, `priority`, `sort` |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task (includes tags, subtasks, attachments, time_estimate) |
| PATCH | `/api/tasks/:id/toggle` | Toggle status between `active` and `completed` |
| PATCH | `/api/tasks/:id/move` | Move task to a kanban column or reschedule due date |
| DELETE | `/api/tasks/:id` | Delete a task |

### Kanban Columns

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/columns` | List all columns ordered by position |
| POST | `/api/columns` | Create a new column |
| PUT | `/api/columns/:id` | Rename or recolor a column |
| PATCH | `/api/columns/reorder` | Reorder columns — body: `{ order: [{ id, position }] }` |
| DELETE | `/api/columns/:id` | Delete a column |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Returns `{ status: "ok", app: "Finlo" }` |

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
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  title          TEXT NOT NULL,
  description    TEXT DEFAULT '',
  status         TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed')),
  priority       TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
  category       TEXT DEFAULT 'Work',
  due_date       TEXT,
  kanban_column  TEXT DEFAULT '',
  tags           TEXT DEFAULT '[]',        -- JSON array of strings
  subtasks       TEXT DEFAULT '[]',        -- JSON array of { text, done }
  attachments    TEXT DEFAULT '[]',        -- JSON array of { name, type, data }
  time_estimate  INTEGER DEFAULT 0,        -- hours
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kanban_columns (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  title    TEXT NOT NULL,
  color    TEXT DEFAULT '#00d4ff',
  position INTEGER DEFAULT 0
);
```

Default kanban columns seeded on first run: **To Do**, **In Progress**, **Done**

---

## Folder Structure

```
FINLO/
├── README.md
├── .gitignore
│
├── server/
│   ├── db/
│   │   ├── init.js             # Database setup, schema, auto-migration
│   │   └── finlo.db            # SQLite database (auto-created)
│   ├── routes/
│   │   ├── tasks.js            # Task CRUD + move route
│   │   └── columns.js          # Kanban column CRUD + reorder
│   ├── index.js                # Express entry point (20 MB body limit)
│   └── package.json
│
└── client/
    ├── public/
    │   ├── fin.png             # Mascot image (replace with your own)
    │   └── favicon.svg         # Fallback favicon
    ├── src/
    │   ├── components/
    │   │   ├── ConfirmModal.jsx
    │   │   ├── DolphinMascot.jsx   # Fin inline card + floating mascot (uses fin.png)
    │   │   ├── FilterTabs.jsx
    │   │   ├── Icons.jsx           # All SVG icons including IconTag
    │   │   ├── RightPanel.jsx
    │   │   ├── SearchBar.jsx
    │   │   ├── Sidebar.jsx         # Responsive; uses fin.png for logo
    │   │   ├── StatCard.jsx        # Clickable — opens task modal
    │   │   ├── TaskCard.jsx        # Click to open full detail drawer
    │   │   ├── TaskChart.jsx
    │   │   ├── TaskForm.jsx        # Basic + Extended tabs
    │   │   ├── TaskList.jsx
    │   │   └── TopBar.jsx
    │   ├── context/
    │   │   └── SettingsContext.jsx
    │   ├── hooks/
    │   │   └── useTasks.js         # API calls for tasks + columns
    │   ├── pages/
    │   │   ├── Calendar.jsx        # Interactive: click to create, drag to reschedule
    │   │   ├── Dashboard.jsx       # Clickable stat cards with task modals
    │   │   ├── Kanban.jsx          # Custom columns + drag-drop + filters
    │   │   ├── Notifications.jsx
    │   │   ├── Settings.jsx
    │   │   ├── Tags.jsx            # Tag cloud + filter tasks by tag
    │   │   └── Tasks.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
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
| `--color-high` | `#ff4466` | High priority |
| `--color-medium` | `#f59e0b` | Medium priority |
| `--color-low` | `#00ff9f` | Low priority |
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
| State | useState + useEffect + Context API |

---

## Credits

**Fin the dolphin** — always swimming toward your goals.

> "Every task creates a ripple."
