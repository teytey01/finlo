import { IconBell, IconClock, IconAlertTriangle } from './Icons'
import { DolphinSVG } from './DolphinMascot'

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

export default function RightPanel({ notifications }) {
  const due     = notifications.filter(n => n.notifType === 'due')
  const overdue = notifications.filter(n => n.notifType === 'overdue')

  return (
    <div className="right-panel">
      <div>
        {/* Header */}
        <div className="right-panel-title">
          <IconBell size={15} color="var(--color-neon-blue)" />
          Live Alerts
        </div>

        {/* Empty state */}
        {notifications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-secondary)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, opacity: 0.6 }}>
              <DolphinSVG size={52} />
            </div>
            <div>All clear — Fin is happy.</div>
          </div>
        )}

        {/* Due Today */}
        {due.length > 0 && (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 600, color: 'var(--color-neon-blue)',
              textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8,
            }}>
              <IconClock size={12} color="var(--color-neon-blue)" />
              Due Today
            </div>
            {due.map(n => (
              <div key={n.id} className="right-notif-item">
                <div className="right-notif-task">{n.title}</div>
                <div className="right-notif-meta">
                  <PriorityBadge priority={n.priority} />
                  {n.due_date && (
                    <span style={{ fontSize: 11, color: 'var(--color-neon-blue)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <IconClock size={11} color="var(--color-neon-blue)" />
                      {n.due_date}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Overdue */}
        {overdue.length > 0 && (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 600, color: 'var(--color-neon-pink)',
              textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 16, marginBottom: 8,
            }}>
              <IconAlertTriangle size={12} color="var(--color-neon-pink)" />
              Overdue
            </div>
            {overdue.map(n => (
              <div key={n.id} className="right-notif-item" style={{ borderColor: 'rgba(255,68,102,0.2)' }}>
                <div className="right-notif-task">{n.title}</div>
                <div className="right-notif-meta">
                  <PriorityBadge priority={n.priority} />
                  {n.due_date && (
                    <span style={{ fontSize: 11, color: 'var(--color-neon-pink)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <IconAlertTriangle size={11} color="var(--color-neon-pink)" />
                      {n.due_date}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6, opacity: 0.5 }}>
          <DolphinSVG size={36} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          Fin is watching over<br />your tasks.
        </div>
      </div>
    </div>
  )
}
