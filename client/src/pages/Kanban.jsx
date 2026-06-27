import { IconTrash, IconRefresh, IconCheck, IconAlertTriangle, IconClock } from '../components/Icons'

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

function KanbanCard({ task, onToggle, onDelete }) {
  const today    = new Date().toISOString().split('T')[0]
  const isOverdue = task.status === 'active' && task.due_date && task.due_date < today

  return (
    <div className="kanban-card">
      <div className="kanban-card-title">{task.title}</div>
      {task.description && (
        <div className="kanban-card-desc">{task.description}</div>
      )}
      <div className="kanban-card-footer">
        <span className="category-tag">{task.category}</span>
        {task.due_date && (
          <span style={{
            fontSize: 11,
            color: isOverdue ? 'var(--color-neon-pink)' : 'var(--color-text-secondary)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {isOverdue
              ? <IconAlertTriangle size={11} color="var(--color-neon-pink)" />
              : <IconClock size={11} color="currentColor" />
            }
            {task.due_date}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <button
          className="icon-btn"
          onClick={() => onToggle(task.id)}
          title={task.status === 'completed' ? 'Mark active' : 'Mark complete'}
          style={{ flex: 1, fontSize: 12, gap: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {task.status === 'completed'
            ? <><IconRefresh size={13} color="currentColor" /> Undo</>
            : <><IconCheck size={13} color="currentColor" /> Done</>
          }
        </button>
        <button className="icon-btn delete" onClick={() => onDelete(task)} title="Delete">
          <IconTrash size={14} color="currentColor" />
        </button>
      </div>
    </div>
  )
}

const COLUMNS = [
  { key: 'low',    label: 'Low Priority',    color: 'var(--color-neon-green)', glow: '0 0 8px rgba(0,255,159,0.3)' },
  { key: 'medium', label: 'Medium Priority', color: 'var(--color-medium)',     glow: '0 0 8px rgba(245,158,11,0.3)' },
  { key: 'high',   label: 'High Priority',   color: 'var(--color-neon-pink)',  glow: 'var(--glow-pink)' },
]

export default function Kanban({ tasks, loading, onToggle, onDelete }) {
  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="ripple-loader"><span/><span/><span/></div>
        <div className="loading-text">Loading Kanban...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-title">Kanban Board</div>
          <div className="page-header-sub">Tasks organized by priority</div>
        </div>
      </div>

      <div className="kanban-board">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.priority === col.key)
          return (
            <div key={col.key} className="kanban-column">
              <div className="kanban-col-header">
                <span className="kanban-col-title"
                  style={{ color: col.color, textShadow: col.glow }}>
                  {col.label}
                </span>
                <span className="kanban-count"
                  style={{ color: col.color, borderColor: `${col.color}40` }}>
                  {colTasks.length}
                </span>
              </div>
              <div className="kanban-col-body">
                {colTasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-text-secondary)', fontSize: 13 }}>
                    No tasks here
                  </div>
                ) : (
                  colTasks.map(task => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      onToggle={onToggle}
                      onDelete={onDelete}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
