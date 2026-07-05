import { useState, useEffect, useRef } from 'react'
import StatCard from '../components/StatCard'
import TaskList from '../components/TaskList'
import { ActivityLineChart, ProgressBarChart } from '../components/TaskChart'
import { FinInlineCard } from '../components/DolphinMascot'
import {
  IconClipboard, IconZap, IconCheckCircle, IconAlertTriangle,
  IconPlus, IconX
} from '../components/Icons'

// ── Welcome banner ────────────────────────────────────────────────────────────
function WelcomeBanner({ onAddNew }) {
  return (
    <div className="welcome-banner">
      <div className="welcome-banner-scanline" />
      <div className="welcome-content">
        <div className="welcome-subtitle">Welcome to Finlo</div>
        <h2 className="welcome-title">
          Every task creates a <span>ripple.</span>
        </h2>
        <p className="welcome-desc">
          Manage your tasks with Fin — your personal dolphin assistant who keeps you swimming toward your goals.
        </p>
        <button className="btn btn-primary" style={{ marginTop: 20, gap: 8 }} onClick={onAddNew}>
          <IconPlus size={16} color="#fff" />
          Start a new task
        </button>
      </div>
      <div style={{ opacity: 0.08, userSelect: 'none', paddingLeft: 20, flexShrink: 0 }}>
        <svg width="100" height="80" viewBox="0 0 100 80" fill="none">
          <path d="M5 40 Q20 20 35 40 Q50 60 65 40 Q80 20 95 40" stroke="#00d4ff" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M5 55 Q20 35 35 55 Q50 75 65 55 Q80 35 95 55" stroke="#7c3aed" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  )
}

// ── Stat card task modal ──────────────────────────────────────────────────────
const CARD_META = {
  total:     { label: 'All Tasks',       Icon: IconClipboard,     color: '#00d4ff', accentClass: 'blue'   },
  active:    { label: 'Active Tasks',    Icon: IconZap,           color: '#7c3aed', accentClass: 'purple' },
  completed: { label: 'Completed Tasks', Icon: IconCheckCircle,   color: '#00ff9f', accentClass: 'green'  },
  overdue:   { label: 'Overdue Tasks',   Icon: IconAlertTriangle, color: '#ff4466', accentClass: 'red'    },
}

function TaskModal({ cardKey, tasks, onEdit, onDelete, onToggle, onRefresh, onClose }) {
  const meta        = CARD_META[cardKey]
  const overlayRef  = useRef(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Click outside closes
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div className="task-modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="task-modal">
        {/* Header */}
        <div className="task-modal-header">
          <div className="task-modal-title">
            <span style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: `${meta.color}18`,
              border: `1px solid ${meta.color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <meta.Icon size={16} color={meta.color} />
            </span>
            {meta.label}
            <span className="task-modal-count">{tasks.length}</span>
          </div>
          <button
            className="icon-btn"
            onClick={onClose}
            title="Close"
            style={{ flexShrink: 0 }}
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="task-modal-body">
          <TaskList
            tasks={tasks}
            loading={false}
            error={null}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onRefresh={onRefresh}
            emptyMessage="No tasks in this category."
          />
        </div>
      </div>
    </div>
  )
}

// ── Dashboard page ────────────────────────────────────────────────────────────
export default function Dashboard({
  tasks, loading, error,
  onEdit, onDelete, onToggle, onAddNew, onRefresh,
  notifications = [], showFinTips = true,
}) {
  const today = new Date().toISOString().split('T')[0]
  const [openCard, setOpenCard] = useState(null) // 'total' | 'active' | 'completed' | 'overdue' | null

  const total     = tasks.length
  const active    = tasks.filter(t => t.status === 'active').length
  const completed = tasks.filter(t => t.status === 'completed').length
  const overdue   = tasks.filter(t => t.status === 'active' && t.due_date && t.due_date < today).length

  // Tasks shown in the modal based on which card was clicked
  const modalTasks = {
    total:     tasks,
    active:    tasks.filter(t => t.status === 'active'),
    completed: tasks.filter(t => t.status === 'completed'),
    overdue:   tasks.filter(t => t.status === 'active' && t.due_date && t.due_date < today),
  }

  const recentTasks = [...tasks].slice(0, 6)

  // When a task is edited/deleted/toggled from modal, refresh + keep modal open
  const handleModalEdit   = (task) => { onEdit(task); setOpenCard(null) }
  const handleModalDelete = (task) => { onDelete(task) }
  const handleModalToggle = (id)   => { onToggle(id) }

  return (
    <div>
      <WelcomeBanner onAddNew={onAddNew} />

      {/* Fin inline advisor card */}
      {showFinTips && <FinInlineCard notifications={notifications} tasks={tasks} />}

      {/* Stat cards — each is clickable */}
      <div className="stats-row">
        <StatCard
          label="Total Tasks" value={total} color="blue" icon={IconClipboard}
          onClick={() => setOpenCard('total')}
        />
        <StatCard
          label="Active" value={active} color="purple" icon={IconZap}
          onClick={() => setOpenCard('active')}
        />
        <StatCard
          label="Completed" value={completed} color="green" icon={IconCheckCircle}
          onClick={() => setOpenCard('completed')}
        />
        <StatCard
          label="Overdue" value={overdue} color="red" icon={IconAlertTriangle}
          onClick={() => setOpenCard('overdue')}
        />
      </div>

      {/* Charts */}
      <div className="charts-row">
        <ActivityLineChart tasks={tasks} />
        <ProgressBarChart  tasks={tasks} />
      </div>

      {/* Recent tasks */}
      <div className="section-title">Recent Tasks</div>
      <TaskList
        tasks={recentTasks}
        loading={loading}
        error={error}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        onRefresh={onRefresh}
        emptyMessage="No tasks yet. Let Fin help you get started!"
      />

      {/* Task detail modal */}
      {openCard && (
        <TaskModal
          cardKey={openCard}
          tasks={modalTasks[openCard]}
          onEdit={handleModalEdit}
          onDelete={handleModalDelete}
          onToggle={handleModalToggle}
          onRefresh={onRefresh}
          onClose={() => setOpenCard(null)}
        />
      )}
    </div>
  )
}
