import { useState, useEffect, useRef } from 'react'
import { IconEdit, IconTrash, IconCheck, IconClock, IconAlertTriangle, IconX, IconCheckCircle } from './Icons'

function PriorityBadge({ priority }) {
  const dots = { high: '#ff4466', medium: '#f59e0b', low: '#00ff9f' }
  return (
    <span className={`badge-priority badge-${priority}`}>
      <span style={{ display:'inline-block', width:6, height:6, borderRadius:'50%', background:dots[priority], marginRight:5, flexShrink:0 }}/>
      {priority}
    </span>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '1px', color: 'var(--color-text-secondary)',
        marginBottom: 8, paddingBottom: 6,
        borderBottom: '1px solid var(--color-border)',
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function getFileIcon(type) {
  if (!type) return '📎'
  if (type.startsWith('image/'))                                         return '🖼'
  if (type.includes('pdf'))                                              return '📄'
  if (type.includes('word') || type.includes('doc'))                     return '📝'
  if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) return '📊'
  if (type.includes('zip') || type.includes('rar') || type.includes('7z'))      return '🗜'
  return '📎'
}

function formatSize(base64Length) {
  const bytes = Math.round(base64Length * 0.75)
  if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes > 1024)        return `${Math.round(bytes / 1024)} KB`
  return `${bytes} B`
}

// ── Task Detail Drawer ────────────────────────────────────────────────────────
function TaskDetailDrawer({ task, onEdit, onDelete, onToggle, onSubtaskToggle, onClose }) {
  const overlayRef  = useRef(null)
  const today       = new Date().toISOString().split('T')[0]
  const isOverdue   = task.status === 'active' && task.due_date && task.due_date < today
  const isDueToday  = task.status === 'active' && task.due_date && task.due_date.startsWith(today)

  // Local subtask state — allows optimistic UI while saving
  const [localSubtasks, setLocalSubtasks] = useState(
    Array.isArray(task.subtasks) ? [...task.subtasks] : []
  )
  const [saving, setSaving] = useState(false)

  // Keep in sync if parent task changes
  useEffect(() => {
    setLocalSubtasks(Array.isArray(task.subtasks) ? [...task.subtasks] : [])
  }, [task.subtasks])

  const tags        = Array.isArray(task.tags)        ? task.tags        : []
  const attachments = Array.isArray(task.attachments) ? task.attachments : []
  const doneSubs    = localSubtasks.filter(s => s.done).length

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose()
  }

  // Toggle a subtask and persist immediately
  const handleSubtaskToggle = async (idx) => {
    const updated = localSubtasks.map((s, i) =>
      i === idx ? { text: s.text, done: !s.done } : { text: s.text, done: !!s.done }
    )
    setLocalSubtasks(updated)
    setSaving(true)
    try {
      // Sanitize all fields to plain JSON-safe values only
      const safeTags = (Array.isArray(task.tags) ? task.tags : [])
        .filter(t => typeof t === 'string')

      const safeAttachments = (Array.isArray(task.attachments) ? task.attachments : [])
        .map(a => ({
          name: String(a.name || ''),
          type: String(a.type || ''),
          data: typeof a.data === 'string' ? a.data : '',
        }))

      const payload = {
        title:         String(task.title || ''),
        description:   String(task.description || ''),
        priority:      String(task.priority || 'medium'),
        category:      String(task.category || 'Work'),
        due_date:      task.due_date || null,
        kanban_column: String(task.kanban_column || ''),
        tags:          safeTags,
        subtasks:      updated,
        attachments:   safeAttachments,
        time_estimate: Number(task.time_estimate) || 0,
      }

      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (onSubtaskToggle) onSubtaskToggle()
    } catch (err) {
      console.error('Subtask save failed:', err.message)
      // Revert on failure
      setLocalSubtasks(Array.isArray(task.subtasks) ? task.subtasks.map(s => ({ text: s.text, done: !!s.done })) : [])
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 450,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 18,
        width: '100%', maxWidth: 560,
        maxHeight: '88vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), var(--glow-blue)',
        animation: 'fadeInUp 0.22s ease',
      }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--color-border)',
          gap: 12, flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <PriorityBadge priority={task.priority}/>
              <span className="category-tag">{task.category}</span>
              {task.status === 'completed' && (
                <span style={{ fontSize: 11, color: 'var(--color-neon-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IconCheckCircle size={12} color="var(--color-neon-green)"/> Completed
                </span>
              )}
              {isOverdue && (
                <span style={{ fontSize: 11, color: 'var(--color-neon-pink)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IconAlertTriangle size={12} color="var(--color-neon-pink)"/> Overdue
                </span>
              )}
            </div>
            <div style={{
              fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1.4,
              textDecoration: task.status === 'completed' ? 'line-through' : 'none',
              opacity: task.status === 'completed' ? 0.7 : 1,
            }}>
              {task.title}
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ flexShrink: 0 }}>
            <IconX size={16}/>
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>

          {/* Description */}
          {task.description && (
            <Section title="Description">
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0 }}>
                {task.description}
              </p>
            </Section>
          )}

          {/* Details */}
          <Section title="Details">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
              {task.due_date && (
                <div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Due Date</div>
                  <div style={{
                    fontSize: 13, fontWeight: 500,
                    color: isOverdue ? 'var(--color-neon-pink)' : isDueToday ? 'var(--color-medium)' : 'var(--color-text-primary)',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    {isOverdue
                      ? <IconAlertTriangle size={13} color="var(--color-neon-pink)"/>
                      : <IconClock size={13} color="currentColor"/>
                    }
                    {task.due_date}
                  </div>
                </div>
              )}
              {task.time_estimate > 0 && (
                <div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time Estimate</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <IconClock size={13} color="currentColor"/> {task.time_estimate}h
                  </div>
                </div>
              )}
              <div>
                <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                  {task.created_at ? task.created_at.split(' ')[0] : '—'}
                </div>
              </div>
            </div>
          </Section>

          {/* Tags */}
          {tags.length > 0 && (
            <Section title={`Tags (${tags.length})`}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {tags.map((tag, i) => (
                  <span key={i} style={{
                    fontSize: 12, padding: '4px 14px', borderRadius: 20,
                    background: 'rgba(0,212,255,0.1)', color: 'var(--color-neon-blue)',
                    border: '1px solid rgba(0,212,255,0.3)',
                    fontWeight: 500,
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Subtasks — interactive checkboxes */}
          {localSubtasks.length > 0 && (
            <Section title={`Subtasks (${doneSubs}/${localSubtasks.length}) ${saving ? '· saving…' : ''}`}>
              {/* Progress bar */}
              <div style={{ height: 5, background: 'var(--color-border)', borderRadius: 3, marginBottom: 12 }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${localSubtasks.length ? (doneSubs / localSubtasks.length) * 100 : 0}%`,
                  background: doneSubs === localSubtasks.length ? 'var(--color-neon-green)' : 'var(--color-neon-blue)',
                  boxShadow: doneSubs === localSubtasks.length ? 'var(--glow-green)' : 'var(--glow-blue)',
                  transition: 'width 0.3s, background 0.3s',
                }}/>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {localSubtasks.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => handleSubtaskToggle(i)}
                    className="subtask-row"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px',
                      background: s.done ? 'rgba(0,212,255,0.04)' : 'var(--color-surface-2)',
                      border: `1px solid ${s.done ? 'rgba(0,212,255,0.15)' : 'var(--color-border)'}`,
                      borderRadius: 9,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      userSelect: 'none',
                    }}
                  >
                    {/* Custom checkbox */}
                    <div style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                      background: s.done ? 'var(--color-neon-blue)' : 'transparent',
                      border: `2px solid ${s.done ? 'var(--color-neon-blue)' : 'var(--color-border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: s.done ? 'var(--glow-blue)' : 'none',
                      transition: 'all 0.15s',
                    }}>
                      {s.done && <IconCheck size={11} color="#fff"/>}
                    </div>
                    <span style={{
                      fontSize: 13, flex: 1,
                      color: s.done ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
                      textDecoration: s.done ? 'line-through' : 'none',
                      opacity: s.done ? 0.65 : 1,
                      transition: 'all 0.15s',
                    }}>
                      {s.text}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <Section title={`Attachments (${attachments.length})`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {attachments.map((a, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px',
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 10,
                  }}>
                    {a.type && a.type.startsWith('image/') && a.data ? (
                      <img src={a.data} alt={a.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}/>
                    ) : (
                      <div style={{
                        width: 48, height: 48, borderRadius: 6, flexShrink: 0,
                        background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                      }}>
                        {getFileIcon(a.type)}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                        {a.type || 'File'}{a.data ? ` · ${formatSize(a.data.length)}` : ''}
                      </div>
                    </div>
                    {a.data && (
                      <a href={a.data} download={a.name} onClick={e => e.stopPropagation()}
                        style={{
                          fontSize: 11, color: 'var(--color-neon-blue)', fontWeight: 600,
                          textDecoration: 'none', padding: '5px 12px',
                          background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
                          borderRadius: 6, flexShrink: 0, whiteSpace: 'nowrap',
                        }}>
                        Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

        </div>

        {/* ── Footer ── */}
        <div style={{
          display: 'flex', gap: 10, padding: '16px 24px',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-sidebar)', flexShrink: 0,
        }}>
          <button className="btn btn-primary" onClick={() => { onEdit(task); onClose() }} style={{ flex: 1, gap: 8 }}>
            <IconEdit size={14} color="#fff"/> Edit Task
          </button>
          <button className="btn btn-secondary" onClick={() => onToggle(task.id)} style={{ gap: 8 }}>
            {task.status === 'completed'
              ? <><IconCheck size={14}/> Mark Active</>
              : <><IconCheck size={14}/> Mark Done</>
            }
          </button>
          <button className="icon-btn delete" onClick={() => { onDelete(task); onClose() }} title="Delete task" style={{ width: 40, height: 40 }}>
            <IconTrash size={14}/>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Task Card Row ─────────────────────────────────────────────────────────────
export default function TaskCard({ task, onToggle, onEdit, onDelete, onRefresh }) {
  const [detailOpen, setDetailOpen] = useState(false)

  const today      = new Date().toISOString().split('T')[0]
  const isOverdue  = task.status === 'active' && task.due_date && task.due_date < today
  const isDueToday = task.status === 'active' && task.due_date && task.due_date.startsWith(today)

  const tags        = Array.isArray(task.tags)        ? task.tags        : []
  const subtasks    = Array.isArray(task.subtasks)    ? task.subtasks    : []
  const attachments = Array.isArray(task.attachments) ? task.attachments : []
  const doneSubs    = subtasks.filter(s => s.done).length
  const hasExtended = tags.length > 0 || subtasks.length > 0 || attachments.length > 0 || task.time_estimate > 0

  return (
    <>
      <div
        className={`task-card ${task.status === 'completed' ? 'completed' : ''}`}
        onClick={() => setDetailOpen(true)}
        style={{ cursor: 'pointer' }}
      >
        {/* Checkbox */}
        <button
          className={`task-checkbox ${task.status === 'completed' ? 'checked' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggle(task.id) }}
          title={task.status === 'completed' ? 'Mark active' : 'Mark complete'}
        >
          {task.status === 'completed' && <IconCheck size={12} color="#fff"/>}
        </button>

        <div className="task-body">
          <div className="task-title">{task.title}</div>
          {task.description && <div className="task-desc">{task.description}</div>}

          {/* Extended preview */}
          {hasExtended && (
            <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
              {task.time_estimate > 0 && (
                <span style={{ fontSize: 10, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {task.time_estimate}h
                </span>
              )}
              {tags.length > 0 && (
                <span style={{
                  fontSize: 10, padding: '1px 7px', borderRadius: 20,
                  background: 'rgba(0,212,255,0.08)', color: 'var(--color-neon-blue)',
                  border: '1px solid rgba(0,212,255,0.15)',
                }}>
                  {tags[0]}{tags.length > 1 ? ` +${tags.length - 1}` : ''}
                </span>
              )}
              {subtasks.length > 0 && (
                <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
                  {doneSubs}/{subtasks.length} subtasks
                </span>
              )}
              {attachments.length > 0 && (
                <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
                  {attachments.length} attachment{attachments.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}

          <div className="task-meta">
            <PriorityBadge priority={task.priority}/>
            <span className="category-tag">{task.category}</span>
            {task.due_date && (
              <span className={`task-date ${isOverdue ? 'overdue' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {isOverdue
                  ? <IconAlertTriangle size={11} color="var(--color-neon-pink)"/>
                  : <IconClock size={11} color={isDueToday ? 'var(--color-medium)' : 'currentColor'}/>
                }
                {task.due_date}
              </span>
            )}
            {hasExtended && (
              <span style={{ fontSize: 10, color: 'var(--color-neon-blue)', marginLeft: 'auto', opacity: 0.7 }}>
                View details ›
              </span>
            )}
          </div>
        </div>

        <div className="task-actions" onClick={e => e.stopPropagation()}>
          <button className="icon-btn" onClick={() => onEdit(task)} title="Edit">
            <IconEdit size={14} color="currentColor"/>
          </button>
          <button className="icon-btn delete" onClick={() => onDelete(task)} title="Delete">
            <IconTrash size={14} color="currentColor"/>
          </button>
        </div>
      </div>

      {detailOpen && (
        <TaskDetailDrawer
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
          onSubtaskToggle={onRefresh}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </>
  )
}
