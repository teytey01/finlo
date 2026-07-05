import TaskCard from './TaskCard'
import { IconWave } from './Icons'
import { DolphinSVG } from './DolphinMascot'

export default function TaskList({ tasks, loading, error, onToggle, onEdit, onDelete, onRefresh, emptyMessage, emptyIcon }) {
  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="ripple-loader">
          <span/><span/><span/>
        </div>
        <div className="loading-text">Fin is fetching your tasks...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-banner">
        <IconWave size={18} color="var(--color-neon-pink)" />
        <span>{error}</span>
      </div>
    )
  }

  if (!tasks.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <DolphinSVG size={64} />
        </div>
        <p>{emptyMessage || "No tasks yet. Let Fin help you get started!"}</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  )
}
