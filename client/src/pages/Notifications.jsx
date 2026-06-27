import { IconClock, IconAlertTriangle, IconCheckCircle } from '../components/Icons'
import { DolphinSVG } from '../components/DolphinMascot'

function PriorityBadge({ priority }) {
  const dots = { high: '#ff4466', medium: '#f59e0b', low: '#00ff9f' }
  return (
    <span className={`badge-priority badge-${priority}`}>
      <span style={{
        display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
        background: dots[priority], marginRight: 5,
      }} />
      {priority}
    </span>
  )
}

const typeConfig = {
  due:       { label: 'Due Today',  Icon: IconClock,         color: 'var(--color-neon-blue)',  bg: 'rgba(0,212,255,0.1)'  },
  overdue:   { label: 'Overdue',    Icon: IconAlertTriangle, color: 'var(--color-neon-pink)',  bg: 'rgba(255,68,102,0.1)' },
  completed: { label: 'Completed',  Icon: IconCheckCircle,   color: 'var(--color-neon-green)', bg: 'rgba(0,255,159,0.1)'  },
}

export default function Notifications({ tasks }) {
  const today     = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  const dueTodayTasks    = tasks.filter(t => t.status === 'active' && t.due_date && t.due_date.startsWith(today))
  const overdueTasks     = tasks.filter(t => t.status === 'active' && t.due_date && t.due_date < today)
  const recentlyCompleted = tasks.filter(t =>
    t.status === 'completed' && t.updated_at && (
      t.updated_at.startsWith(today) || t.updated_at.startsWith(yesterday)
    )
  )

  const allNotifications = [
    ...dueTodayTasks.map(t => ({ ...t, notifType: 'due' })),
    ...overdueTasks.map(t => ({ ...t, notifType: 'overdue' })),
    ...recentlyCompleted.map(t => ({ ...t, notifType: 'completed' })),
  ]

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ opacity: 0.85 }}><DolphinSVG size={44} /></div>
          <div>
            <div className="page-header-title">Fin's Alerts</div>
            <div className="page-header-sub">{allNotifications.length} alert{allNotifications.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {allNotifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><DolphinSVG size={72} /></div>
          <p>All clear — Fin has nothing to report. You're crushing it!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {allNotifications.map(n => {
            const cfg = typeConfig[n.notifType]
            return (
              <div key={`${n.id}-${n.notifType}`} className="notification-item">
                <div className={`notification-icon ${n.notifType}`}
                  style={{ background: cfg.bg }}>
                  <cfg.Icon size={18} color={cfg.color} />
                </div>
                <div className="notification-body">
                  <div className="notification-title">{n.title}</div>
                  <div className="notification-meta">
                    <span className={`notification-type ${n.notifType}`}>{cfg.label}</span>
                    <PriorityBadge priority={n.priority} />
                    {n.due_date && (
                      <span className="notification-date" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <IconClock size={11} color="currentColor" />
                        {n.due_date}
                      </span>
                    )}
                    {n.category && <span className="category-tag">{n.category}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
