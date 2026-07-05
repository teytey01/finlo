import { useState, useRef } from 'react'
import { IconX, IconSave, IconPlus, IconLoader, IconAlertTriangle, IconTrash, IconCheck } from './Icons'
import { useSettings } from '../context/SettingsContext'

const CATEGORIES  = ['Work', 'Personal', 'Study', 'Other']
const PRIORITIES  = ['low', 'medium', 'high']
const PriColors   = { low: '#00ff9f', medium: '#f59e0b', high: '#ff4466' }

export default function TaskForm({ task, onSave, onClose, defaultDate }) {
  const { settings } = useSettings()

  // Core fields
  const [title, setTitle]       = useState(task?.title || '')
  const [description, setDesc]  = useState(task?.description || '')
  const [priority, setPriority] = useState(task?.priority    || settings.defaultPriority || 'medium')
  const [category, setCategory] = useState(task?.category    || settings.defaultCategory || 'Work')
  const [dueDate, setDueDate]   = useState(task?.due_date    || defaultDate || '')

  // Extended fields
  const [timeEst, setTimeEst]   = useState(task?.time_estimate || 0)
  const [tags, setTags]         = useState(Array.isArray(task?.tags) ? task.tags : [])
  const [tagInput, setTagInput] = useState('')
  const [subtasks, setSubtasks] = useState(Array.isArray(task?.subtasks) ? task.subtasks : [])
  const [subInput, setSubInput] = useState('')
  const [attachments, setAttachments] = useState(Array.isArray(task?.attachments) ? task.attachments : [])

  const fileRef = useRef(null)

  const [error, setError]   = useState('')
  const [saving, setSaving] = useState(false)
  const [tab, setTab]       = useState('basic') // 'basic' | 'extended'

  // ── Tags ──────────────────────────────────────────────────────────────────
  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) { setTags(prev => [...prev, t]); setTagInput('') }
  }
  const removeTag = (t) => setTags(prev => prev.filter(x => x !== t))

  // ── Subtasks ──────────────────────────────────────────────────────────────
  const addSubtask = () => {
    const t = subInput.trim()
    if (t) { setSubtasks(prev => [...prev, { text: t, done: false }]); setSubInput('') }
  }
  const toggleSubtask = (i) => setSubtasks(prev => prev.map((s, idx) => idx===i ? {...s, done:!s.done} : s))
  const removeSubtask = (i) => setSubtasks(prev => prev.filter((_, idx) => idx !== i))

  // ── Attachments ───────────────────────────────────────────────────────────
  const MAX_FILE_MB = 5
  const MAX_TOTAL_MB = 12

  const compressImage = (file) => new Promise((resolve) => {
    // Non-image files: just read as-is
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => resolve({ name: file.name, type: file.type, data: ev.target.result, size: file.size })
      reader.readAsDataURL(file)
      return
    }
    // Images: draw onto canvas and re-encode at reduced quality
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const MAX_DIM = 1200
      let { width, height } = img
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height)
        width  = Math.round(width  * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      const data = canvas.toDataURL('image/jpeg', 0.75)
      resolve({ name: file.name, type: 'image/jpeg', data, size: Math.round(data.length * 0.75) })
    }
    img.src = url
  })

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files)
    e.target.value = ''
    const newAttachments = [...attachments]

    for (const file of files) {
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setError(`"${file.name}" exceeds ${MAX_FILE_MB} MB limit.`)
        continue
      }
      const att = await compressImage(file)

      // Check total payload size
      const totalBytes = newAttachments.reduce((s, a) => s + (a.data?.length || 0), 0) + att.data.length
      if (totalBytes > MAX_TOTAL_MB * 1024 * 1024) {
        setError(`Total attachments exceed ${MAX_TOTAL_MB} MB. Remove some files first.`)
        break
      }
      newAttachments.push(att)
    }
    setAttachments(newAttachments)
  }

  const removeAttachment = (i) => setAttachments(prev => prev.filter((_, idx) => idx !== i))

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim())             { setError('Title is required.'); setTab('basic'); return }
    if (title.trim().length > 100) { setError('Title must be 100 characters or fewer.'); setTab('basic'); return }
    setError('')
    setSaving(true)
    try {
      await onSave({
        title: title.trim(), description, priority, category,
        due_date: dueDate || null,
        time_estimate: Number(timeEst) || 0,
        tags, subtasks,
        // Strip data from attachments that are too large as a final safety check
        attachments: attachments.map(a => ({
          name: a.name,
          type: a.type,
          data: a.data,
        })),
      })
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('JSON') || msg.includes('payload') || msg.includes('large')) {
        setError('Attachments are too large. Remove some files and try again.')
        setTab('extended')
      } else {
        setError(msg || 'Something went wrong.')
      }
    } finally {
      setSaving(false)
    }
  }

  const charLen   = title.length
  const charClass = charLen > 100 ? 'over' : charLen > 80 ? 'warn' : ''
  const doneSubs  = subtasks.filter(s => s.done).length

  return (
    <>
      <div className="form-panel-overlay" onClick={onClose}/>
      <div className="form-panel">
        <div className="form-panel-header">
          <h2 className="form-panel-title">{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="icon-btn" onClick={onClose}><IconX size={16}/></button>
        </div>

        {/* Tab switcher */}
        <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--color-border)', background:'var(--color-sidebar)' }}>
          {['basic','extended'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }} style={{
              padding:'10px 20px', background:'none', border:'none', cursor:'pointer',
              fontSize:13, fontWeight:600,
              color: tab===t ? 'var(--color-neon-blue)' : 'var(--color-text-secondary)',
              borderBottom: tab===t ? '2px solid var(--color-neon-blue)' : '2px solid transparent',
              transition:'all 0.15s',
            }}>
              {t === 'basic' ? 'Basic' : 'Extended'}
              {t === 'extended' && (tags.length + subtasks.length + attachments.length > 0) && (
                <span style={{ marginLeft:6, padding:'1px 6px', borderRadius:10, background:'var(--color-neon-blue)', color:'#fff', fontSize:10 }}>
                  {tags.length + subtasks.length + attachments.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
          <div className="form-panel-body">

            {/* ── BASIC TAB ─────────────────────────────────────────────── */}
            {tab === 'basic' && <>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" type="text" value={title} onChange={e=>setTitle(e.target.value)}
                  placeholder="What needs to be done?" maxLength={120} autoFocus/>
                <div className={`char-count ${charClass}`}>{charLen}/100</div>
                {error && (
                  <div className="form-error" style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <IconAlertTriangle size={13} color="var(--color-neon-pink)"/> {error}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={description} onChange={e=>setDesc(e.target.value)}
                  placeholder="Add details (optional)..." rows={3}/>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <div className="priority-group">
                  {PRIORITIES.map(p => (
                    <button key={p} type="button" className={`priority-btn ${priority===p?`active-${p}`:''}`} onClick={()=>setPriority(p)}>
                      <span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', background:PriColors[p], marginRight:6 }}/>
                      {p.charAt(0).toUpperCase()+p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={category} onChange={e=>setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)}
                  style={{ colorScheme:'dark' }}/>
              </div>
            </>}

            {/* ── EXTENDED TAB ──────────────────────────────────────────── */}
            {tab === 'extended' && <>

              {/* Time estimate */}
              <div className="form-group">
                <label className="form-label">Time Estimate (hours)</label>
                <input className="form-input" type="number" min={0} max={999} step={0.5}
                  value={timeEst} onChange={e => setTimeEst(e.target.value)}
                  placeholder="e.g. 2.5"
                  style={{ width:140 }}/>
              </div>

              {/* Tags */}
              <div className="form-group">
                <label className="form-label">Tags / Labels</label>
                <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap' }}>
                  {tags.map((t,i) => (
                    <span key={i} style={{
                      display:'inline-flex', alignItems:'center', gap:4,
                      padding:'3px 10px', borderRadius:20, fontSize:12,
                      background:'rgba(0,212,255,0.1)', color:'var(--color-neon-blue)',
                      border:'1px solid rgba(0,212,255,0.2)',
                    }}>
                      {t}
                      <button type="button" onClick={() => removeTag(t)}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'inherit', padding:0, display:'flex' }}>
                        <IconX size={11}/>
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <input className="form-input" style={{ flex:1 }} value={tagInput}
                    onChange={e=>setTagInput(e.target.value)}
                    onKeyDown={e => { if(e.key==='Enter'){e.preventDefault();addTag()} }}
                    placeholder="Add a tag, press Enter"/>
                  <button type="button" className="btn btn-secondary" style={{ padding:'0 12px' }} onClick={addTag}>
                    <IconPlus size={14}/>
                  </button>
                </div>
              </div>

              {/* Subtasks */}
              <div className="form-group">
                <label className="form-label">
                  Subtasks
                  {subtasks.length > 0 && (
                    <span style={{ marginLeft:8, fontSize:11, color:'var(--color-text-secondary)', fontWeight:400 }}>
                      {doneSubs}/{subtasks.length} done
                    </span>
                  )}
                </label>
                {subtasks.length > 0 && (
                  <div style={{ marginBottom:8, height:3, background:'var(--color-border)', borderRadius:2 }}>
                    <div style={{ height:'100%', borderRadius:2, width:`${(doneSubs/subtasks.length)*100}%`, background:'var(--color-neon-blue)', transition:'width 0.3s' }}/>
                  </div>
                )}
                <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:8 }}>
                  {subtasks.map((s,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', background:'var(--color-surface-2)', borderRadius:8 }}>
                      <button type="button" onClick={() => toggleSubtask(i)}
                        style={{
                          width:18, height:18, borderRadius:4, border:`2px solid ${s.done?'var(--color-neon-blue)':'var(--color-border)'}`,
                          background: s.done ? 'var(--color-neon-blue)' : 'transparent',
                          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                        }}>
                        {s.done && <IconCheck size={10} color="#fff"/>}
                      </button>
                      <span style={{ flex:1, fontSize:13, color:'var(--color-text-primary)', textDecoration: s.done?'line-through':'none', opacity: s.done?0.6:1 }}>
                        {s.text}
                      </span>
                      <button type="button" onClick={() => removeSubtask(i)}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-text-secondary)', display:'flex' }}>
                        <IconX size={13}/>
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <input className="form-input" style={{ flex:1 }} value={subInput}
                    onChange={e=>setSubInput(e.target.value)}
                    onKeyDown={e => { if(e.key==='Enter'){e.preventDefault();addSubtask()} }}
                    placeholder="Add subtask, press Enter"/>
                  <button type="button" className="btn btn-secondary" style={{ padding:'0 12px' }} onClick={addSubtask}>
                    <IconPlus size={14}/>
                  </button>
                </div>
              </div>

              {/* Attachments */}
              <div className="form-group">
                <label className="form-label">Attachments <span style={{ fontWeight:400, color:'var(--color-text-secondary)' }}>(max 2 MB each)</span></label>
                <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:8 }}>
                  {attachments.map((a,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 12px', background:'var(--color-surface-2)', borderRadius:8, border:'1px solid var(--color-border)' }}>
                      <span style={{ fontSize:12, color:'var(--color-text-primary)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {a.name}
                      </span>
                      {a.type.startsWith('image/') && (
                        <img src={a.data} alt={a.name} style={{ width:32, height:32, objectFit:'cover', borderRadius:4 }}/>
                      )}
                      <button type="button" onClick={() => removeAttachment(i)}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-neon-pink)', display:'flex' }}>
                        <IconTrash size={13}/>
                      </button>
                    </div>
                  ))}
                </div>
                <input ref={fileRef} type="file" multiple style={{ display:'none' }} onChange={handleFileChange}/>
                <button type="button" className="btn btn-secondary" style={{ gap:8 }} onClick={() => fileRef.current.click()}>
                  <IconPlus size={14}/> Attach File
                </button>
              </div>
            </>}

          </div>

          <div className="form-panel-footer">
            <button type="submit" className="btn btn-primary" style={{ flex:1 }} disabled={saving}>
              {saving
                ? <><IconLoader size={15} color="#fff"/> Saving...</>
                : task
                  ? <><IconSave size={15} color="#fff"/> Save Changes</>
                  : <><IconPlus size={15} color="#fff"/> Add Task</>
              }
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </>
  )
}
