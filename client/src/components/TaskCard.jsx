import { IconEdit, IconTrash, IconCheck, IconClock, IconAlertTriangle } from './Icons'

function PriorityBadge({ priority }) {
  const dots = { high: '#ff4466', medium: '#f59e0b', low: '#00ff9f' }
  return (
    <span className={`badge-priority badge-${priority}`}>
      <span style={{
        display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
        background: dots[priority], marginRight: 5, flexShrink: 0,
      }} />
      {priority}
    </span>
  )
}

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const today = new Date().toISOString().split('T')[0]
  const isOverdue  = task.status === 'active' && task.due_date && task.due_date < today
  const isDueToday = task.status === 'active' && task.due_date && task.due_date.startsWith(today)

  return (
    <div className={`task-card ${task.status === 'completed' ? 'completed' : ''}`}>
      <button
        className={`task-checkbox ${task.status === 'completed' ? 'checked' : ''}`}
        onClick={() => onToggle(task.id)}
        title={task.status === 'completed' ? 'Mark active' : 'Mark complete'}
      >
        {task.status === 'completed' && <IconCheck size={12} color="#fff" />}
      </button>

      <div className="task-body">
        <div className="task-title">{task.title}</div>
        {task.description && (
          <div className="task-desc">{task.description}</div>
        )}
        <div className="task-meta">
          <PriorityBadge priority={task.priority} />
          <span className="category-tag">{task.category}</span>
          {task.due_date && (
            <span className={`task-date ${isOverdue ? 'overdue' : ''}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {isOverdue
                ? <IconAlertTriangle size={11} color="var(--color-neon-pink)" />
                : <IconClock size={11} color={isDueToday ? 'var(--color-medium)' : 'currentColor'} />
              }
              {task.due_date}
            </span>
          )}
        </div>
      </div>

      <div className="task-actions">
        <button className="icon-btn" onClick={() => onEdit(task)} title="Edit">
          <IconEdit size={14} color="currentColor" />
        </button>
        <button className="icon-btn delete" onClick={() => onDelete(task)} title="Delete">
          <IconTrash size={14} color="currentColor" />
        </button>
      </div>
    </div>
  )
}
