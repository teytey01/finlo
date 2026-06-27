import StatCard from '../components/StatCard'
import TaskList from '../components/TaskList'
import { ActivityLineChart, ProgressBarChart } from '../components/TaskChart'
import { FinInlineCard } from '../components/DolphinMascot'
import { IconClipboard, IconZap, IconCheckCircle, IconAlertTriangle, IconPlus } from '../components/Icons'

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

export default function Dashboard({ tasks, loading, error, onEdit, onDelete, onToggle, onAddNew, notifications = [], showFinTips = true }) {
  const today = new Date().toISOString().split('T')[0]

  const total     = tasks.length
  const active    = tasks.filter(t => t.status === 'active').length
  const completed = tasks.filter(t => t.status === 'completed').length
  const overdue   = tasks.filter(t => t.status === 'active' && t.due_date && t.due_date < today).length

  const recentTasks = [...tasks].slice(0, 6)

  return (
    <div>
      <WelcomeBanner onAddNew={onAddNew} />

      {/* Fin inline advisor card — only shown when finTips is on */}
      {showFinTips && <FinInlineCard notifications={notifications} tasks={tasks} />}

      <div className="stats-row">
        <StatCard label="Total Tasks" value={total}     color="blue"   icon={IconClipboard} />
        <StatCard label="Active"      value={active}    color="purple" icon={IconZap} />
        <StatCard label="Completed"   value={completed} color="green"  icon={IconCheckCircle} />
        <StatCard label="Overdue"     value={overdue}   color="red"    icon={IconAlertTriangle} />
      </div>

      <div className="charts-row">
        <ActivityLineChart tasks={tasks} />
        <ProgressBarChart  tasks={tasks} />
      </div>

      <div className="section-title">Recent Tasks</div>
      <TaskList
        tasks={recentTasks}
        loading={loading}
        error={error}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        emptyMessage="No tasks yet. Let Fin help you get started!"
      />
    </div>
  )
}
