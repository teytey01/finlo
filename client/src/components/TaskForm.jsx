import { useState } from 'react'
import { IconX, IconSave, IconPlus, IconLoader, IconAlertTriangle } from './Icons'
import { useSettings } from '../context/SettingsContext'

const CATEGORIES = ['Work', 'Personal', 'Study', 'Other']
const PRIORITIES = ['low', 'medium', 'high']

const PriColors = { low: '#00ff9f', medium: '#f59e0b', high: '#ff4466' }

export default function TaskForm({ task, onSave, onClose }) {
  const { settings } = useSettings()

  const [title, setTitle]       = useState(task?.title || '')
  const [description, setDesc]  = useState(task?.description || '')
  const [priority, setPriority] = useState(task?.priority || settings.defaultPriority || 'medium')
  const [category, setCategory] = useState(task?.category || settings.defaultCategory || 'Work')
  const [dueDate, setDueDate]   = useState(task?.due_date || '')
  const [error, setError]       = useState('')
  const [saving, setSaving]     = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim())             { setError('Title is required.'); return }
    if (title.trim().length > 100) { setError('Title must be 100 characters or fewer.'); return }
    setError('')
    setSaving(true)
    try {
      await onSave({ title: title.trim(), description, priority, category, due_date: dueDate || null })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const charLen   = title.length
  const charClass = charLen > 100 ? 'over' : charLen > 80 ? 'warn' : ''

  return (
    <>
      <div className="form-panel-overlay" onClick={onClose} />
      <div className="form-panel">
        <div className="form-panel-header">
          <h2 className="form-panel-title">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button className="icon-btn" onClick={onClose}><IconX size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div className="form-panel-body">

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                className="form-input"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                maxLength={120}
                autoFocus
              />
              <div className={`char-count ${charClass}`}>{charLen}/100</div>
              {error && (
                <div className="form-error" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IconAlertTriangle size={13} color="var(--color-neon-pink)" />
                  {error}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={description}
                onChange={e => setDesc(e.target.value)}
                placeholder="Add details (optional)..."
                rows={3}
              />
            </div>

            {/* Priority */}
            <div className="form-group">
              <label className="form-label">Priority</label>
              <div className="priority-group">
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`priority-btn ${priority === p ? `active-${p}` : ''}`}
                    onClick={() => setPriority(p)}
                  >
                    <span style={{
                      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                      background: PriColors[p], marginRight: 6, flexShrink: 0,
                    }} />
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Due Date */}
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                className="form-input"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div className="form-panel-footer">
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
              {saving
                ? <><IconLoader size={15} color="#fff" /> Saving...</>
                : task
                  ? <><IconSave size={15} color="#fff" /> Save Changes</>
                  : <><IconPlus size={15} color="#fff" /> Add Task</>
              }
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </>
  )
}
