import { useState, useEffect, useRef } from 'react'
import { useColumns } from '../hooks/useTasks'
import { IconTrash, IconRefresh, IconCheck, IconAlertTriangle, IconClock, IconPlus, IconEdit, IconX, IconSave } from '../components/Icons'

// ── Priority badge ────────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const dots = { high: '#ff4466', medium: '#f59e0b', low: '#00ff9f' }
  return (
    <span className={`badge-priority badge-${priority}`}>
      <span style={{ display:'inline-block', width:6, height:6, borderRadius:'50%', background:dots[priority], marginRight:5 }}/>
      {priority}
    </span>
  )
}

// ── Kanban task card (draggable) ──────────────────────────────────────────────
function KanbanCard({ task, onToggle, onDelete, onEdit, onDragStart }) {
  const today = new Date().toISOString().split('T')[0]
  const isOverdue = task.status === 'active' && task.due_date && task.due_date < today
  const subtasks  = Array.isArray(task.subtasks) ? task.subtasks : []
  const done      = subtasks.filter(s => s.done).length
  const tags      = Array.isArray(task.tags) ? task.tags : []

  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={e => onDragStart(e, task.id)}
      style={{ cursor: 'grab', opacity: task.status === 'completed' ? 0.55 : 1 }}
    >
      {/* Title */}
      <div className="kanban-card-title" style={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
        {task.title}
      </div>

      {/* Description */}
      {task.description && (
        <div className="kanban-card-desc">{task.description}</div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:6 }}>
          {tags.map((tag, i) => (
            <span key={i} style={{
              fontSize:10, padding:'2px 7px', borderRadius:20,
              background:'rgba(0,212,255,0.1)', color:'var(--color-neon-blue)',
              border:'1px solid rgba(0,212,255,0.2)',
            }}>{tag}</span>
          ))}
        </div>
      )}

      {/* Subtask progress */}
      {subtasks.length > 0 && (
        <div style={{ marginBottom:6 }}>
          <div style={{ fontSize:10, color:'var(--color-text-secondary)', marginBottom:3 }}>
            {done}/{subtasks.length} subtasks
          </div>
          <div style={{ height:3, background:'var(--color-border)', borderRadius:2 }}>
            <div style={{
              height:'100%', borderRadius:2,
              width: `${(done/subtasks.length)*100}%`,
              background:'var(--color-neon-blue)',
              boxShadow:'var(--glow-blue)',
              transition:'width 0.3s'
            }}/>
          </div>
        </div>
      )}

      {/* Footer row */}
      <div className="kanban-card-footer" style={{ marginBottom:8 }}>
        <PriorityBadge priority={task.priority}/>
        {task.time_estimate > 0 && (
          <span style={{ fontSize:10, color:'var(--color-text-secondary)', display:'flex', alignItems:'center', gap:3 }}>
            <IconClock size={10} color="currentColor"/>
            {task.time_estimate}h
          </span>
        )}
        {task.due_date && (
          <span style={{ fontSize:10, color: isOverdue ? 'var(--color-neon-pink)' : 'var(--color-text-secondary)', display:'flex', alignItems:'center', gap:3 }}>
            {isOverdue ? <IconAlertTriangle size={10} color="var(--color-neon-pink)"/> : <IconClock size={10} color="currentColor"/>}
            {task.due_date}
          </span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:5 }}>
        <button className="icon-btn" onClick={() => onEdit(task)} title="Edit" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:4, fontSize:11 }}>
          <IconEdit size={12}/> Edit
        </button>
        <button className="icon-btn" onClick={() => onToggle(task.id)} title={task.status==='completed'?'Undo':'Done'}
          style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:4, fontSize:11 }}>
          {task.status==='completed' ? <><IconRefresh size={12}/> Undo</> : <><IconCheck size={12}/> Done</>}
        </button>
        <button className="icon-btn delete" onClick={() => onDelete(task)} title="Delete">
          <IconTrash size={12}/>
        </button>
      </div>
    </div>
  )
}

// ── Column header with inline edit / delete / reorder ────────────────────────
function ColumnHeader({ col, onRename, onDelete, onMoveLeft, onMoveRight, isFirst, isLast }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal]         = useState(col.title)

  const commit = () => {
    if (val.trim() && val.trim() !== col.title) onRename(col.id, val.trim(), col.color)
    setEditing(false)
  }

  const COLOR_OPTIONS = ['#00d4ff','#7c3aed','#00ff9f','#ff4466','#f59e0b','#e2e8f0']

  return (
    <div className="kanban-col-header" style={{ flexDirection:'column', alignItems:'stretch', gap:8, padding:'14px 16px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        {/* Color dot */}
        <span style={{ width:10, height:10, borderRadius:'50%', background:col.color, boxShadow:`0 0 6px ${col.color}`, flexShrink:0 }}/>

        {editing ? (
          <input
            autoFocus
            value={val}
            onChange={e => setVal(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if(e.key==='Enter') commit(); if(e.key==='Escape') setEditing(false) }}
            style={{
              flex:1, background:'var(--color-surface-2)', border:'1px solid var(--color-neon-blue)',
              borderRadius:6, color:'#fff', fontSize:13, fontWeight:600, padding:'3px 8px', outline:'none',
            }}
          />
        ) : (
          <span className="kanban-col-title" style={{ color:col.color, flex:1, fontSize:13, fontWeight:700 }}
            onDoubleClick={() => setEditing(true)} title="Double-click to rename">
            {col.title}
          </span>
        )}

        <div style={{ display:'flex', gap:3, marginLeft:'auto' }}>
          {!isFirst && (
            <button className="icon-btn" style={{ width:22, height:22 }} onClick={onMoveLeft} title="Move left">‹</button>
          )}
          {!isLast && (
            <button className="icon-btn" style={{ width:22, height:22 }} onClick={onMoveRight} title="Move right">›</button>
          )}
          <button className="icon-btn" style={{ width:22, height:22 }} onClick={() => setEditing(true)} title="Rename">
            <IconEdit size={11}/>
          </button>
          <button className="icon-btn delete" style={{ width:22, height:22 }} onClick={() => onDelete(col.id)} title="Delete column">
            <IconTrash size={11}/>
          </button>
        </div>
      </div>

      {/* Color swatches */}
      {editing && (
        <div style={{ display:'flex', gap:5, paddingLeft:16 }}>
          {COLOR_OPTIONS.map(c => (
            <button key={c} onClick={() => { onRename(col.id, val.trim()||col.title, c) }}
              style={{
                width:16, height:16, borderRadius:'50%', background:c, border:'none', cursor:'pointer',
                outline: col.color===c ? `2px solid #fff` : 'none',
                boxShadow: col.color===c ? `0 0 6px ${c}` : 'none',
              }}/>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Add Column button ─────────────────────────────────────────────────────────
function AddColumnPanel({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')

  const submit = () => {
    if (title.trim()) { onAdd(title.trim()); setTitle(''); setOpen(false) }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{
      minWidth:200, height:48, borderRadius:12, border:'2px dashed var(--color-border)',
      background:'transparent', color:'var(--color-text-secondary)', cursor:'pointer',
      display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:13,
      transition:'all 0.2s', alignSelf:'flex-start',
    }}
    onMouseOver={e=>e.currentTarget.style.borderColor='var(--color-neon-blue)'}
    onMouseOut={e=>e.currentTarget.style.borderColor='var(--color-border)'}
    >
      <IconPlus size={15}/> Add Column
    </button>
  )

  return (
    <div style={{
      minWidth:200, background:'var(--color-surface)', border:'1px solid var(--color-neon-blue)',
      borderRadius:12, padding:14, display:'flex', flexDirection:'column', gap:8, alignSelf:'flex-start',
      boxShadow:'var(--glow-blue)',
    }}>
      <input
        autoFocus
        className="form-input" placeholder="Column name..."
        value={title} onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if(e.key==='Enter') submit(); if(e.key==='Escape') setOpen(false) }}
        style={{ padding:'7px 10px' }}
      />
      <div style={{ display:'flex', gap:6 }}>
        <button className="btn btn-primary" style={{ flex:1, padding:'6px 0', fontSize:12 }} onClick={submit}>
          <IconSave size={13}/> Add
        </button>
        <button className="btn btn-secondary" style={{ padding:'6px 10px', fontSize:12 }} onClick={() => setOpen(false)}>
          <IconX size={13}/>
        </button>
      </div>
    </div>
  )
}

// ── Main Kanban page ──────────────────────────────────────────────────────────
export default function Kanban({ tasks, loading, onToggle, onDelete, onEdit, onAddNew, fetchTasks }) {
  const { columns, fetchColumns, createColumn, updateColumn, reorderColumns, deleteColumn } = useColumns()
  const dragTaskId  = useRef(null)
  const dragOverCol = useRef(null)

  // ── Filters ───────────────────────────────────────────────────────────────
  const [filterPriority, setFilterPriority] = useState([]) // [] = all
  const [filterStatus,   setFilterStatus]   = useState([]) // [] = all

  const today = new Date().toISOString().split('T')[0]

  const toggleFilter = (arr, setArr, val) => {
    setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val])
  }

  const clearFilters = () => { setFilterPriority([]); setFilterStatus([]) }

  const isFiltered = filterPriority.length > 0 || filterStatus.length > 0

  // Apply filters to a task list
  const applyFilters = (list) => {
    return list.filter(t => {
      // Priority filter
      if (filterPriority.length > 0 && !filterPriority.includes(t.priority)) return false

      // Status filter
      if (filterStatus.length > 0) {
        const isOverdue = t.status === 'active' && t.due_date && t.due_date < today
        const taskStatus = isOverdue ? 'overdue' : t.status === 'completed' ? 'completed' : 'active'
        if (!filterStatus.includes(taskStatus)) return false
      }
      return true
    })
  }

  useEffect(() => { fetchColumns() }, [])

  // Drag task
  const handleDragStart = (e, taskId) => { dragTaskId.current = taskId; e.dataTransfer.effectAllowed = 'move' }
  const handleDragOver  = (e, colTitle) => { e.preventDefault(); dragOverCol.current = colTitle }
  const handleDrop = async (e, colTitle) => {
    e.preventDefault()
    const id = dragTaskId.current
    if (!id) return
    try {
      await fetch(`/api/tasks/${id}/move`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kanban_column: colTitle })
      })
      fetchTasks()
    } catch {}
    dragTaskId.current = null
  }

  // Column operations
  const handleAddCol    = async (title) => { await createColumn({ title }); fetchColumns() }
  const handleRenameCol = async (id, title, color) => { await updateColumn(id, { title, color }); fetchColumns() }
  const handleDeleteCol = async (id) => {
    if (!window.confirm('Delete this column? Tasks in it will become unassigned.')) return
    await deleteColumn(id); fetchColumns(); fetchTasks()
  }
  const handleMoveCol = async (idx, dir) => {
    const copy = [...columns]
    const swap = idx + dir
    if (swap < 0 || swap >= copy.length) return
    const order = copy.map((c, i) => {
      if (i === idx)  return { id: c.id, position: copy[swap].position }
      if (i === swap) return { id: c.id, position: copy[idx].position }
      return { id: c.id, position: c.position }
    })
    await reorderColumns(order)
  }

  if (loading) return (
    <div className="loading-wrapper">
      <div className="ripple-loader"><span/><span/><span/></div>
      <div className="loading-text">Loading Kanban...</div>
    </div>
  )

  const PRIORITY_CHIPS = [
    { val: 'high',   label: 'High',   activeClass: 'active-high'   },
    { val: 'medium', label: 'Medium', activeClass: 'active-medium' },
    { val: 'low',    label: 'Low',    activeClass: 'active-low'    },
  ]

  const STATUS_CHIPS = [
    { val: 'active',    label: 'Active'    },
    { val: 'completed', label: 'Completed' },
    { val: 'overdue',   label: 'Overdue'   },
  ]

  // Count how many tasks pass the current filters (across all columns)
  const totalVisible = applyFilters(tasks).length

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-title">Kanban Board</div>
          <div className="page-header-sub">Drag tasks between columns · Double-click a column to rename</div>
        </div>
        <button className="btn btn-primary" onClick={onAddNew} style={{ gap: 8 }}>
          <IconPlus size={14}/> Add Task
        </button>
      </div>

      {/* ── Filter bar ── */}
      <div className="kanban-filter-bar">
        <span className="kanban-filter-label">Priority:</span>
        <div className="kanban-filter-group">
          {PRIORITY_CHIPS.map(chip => (
            <button
              key={chip.val}
              className={`kanban-filter-chip ${filterPriority.includes(chip.val) ? chip.activeClass : ''}`}
              onClick={() => toggleFilter(filterPriority, setFilterPriority, chip.val)}
            >
              <span style={{
                display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                background: chip.val === 'high' ? '#ff4466' : chip.val === 'medium' ? '#f59e0b' : '#00ff9f',
                marginRight: 5,
              }}/>
              {chip.label}
            </button>
          ))}
        </div>

        <div className="kanban-filter-divider"/>

        <span className="kanban-filter-label">Status:</span>
        <div className="kanban-filter-group">
          {STATUS_CHIPS.map(chip => (
            <button
              key={chip.val}
              className={`kanban-filter-chip ${filterStatus.includes(chip.val) ? 'active' : ''}`}
              onClick={() => toggleFilter(filterStatus, setFilterStatus, chip.val)}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {isFiltered && (
          <>
            <span className="kanban-active-count">{totalVisible} task{totalVisible !== 1 ? 's' : ''} shown</span>
            <button
              className="btn btn-secondary"
              onClick={clearFilters}
              style={{ padding: '5px 12px', fontSize: 12, gap: 5 }}
            >
              <IconX size={12}/> Clear
            </button>
          </>
        )}
      </div>

      {/* ── Board ── */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', overflowX: 'auto', paddingBottom: 12 }}>
        {columns.map((col, idx) => {
          // All tasks that belong to this column (unfiltered — drag targets remain visible)
          const rawColTasks = tasks.filter(t =>
            t.kanban_column === col.title || (!t.kanban_column && idx === 0)
          )
          // Filtered view for display
          const colTasks = applyFilters(rawColTasks)

          return (
            <div
              key={col.id}
              className="kanban-column"
              style={{ minWidth: 260, flex: '0 0 260px' }}
              onDragOver={e => handleDragOver(e, col.title)}
              onDrop={e => handleDrop(e, col.title)}
            >
              <ColumnHeader
                col={col}
                onRename={handleRenameCol}
                onDelete={handleDeleteCol}
                onMoveLeft={() => handleMoveCol(idx, -1)}
                onMoveRight={() => handleMoveCol(idx, 1)}
                isFirst={idx === 0}
                isLast={idx === columns.length - 1}
              />

              {/* Count badge — shows filtered / total */}
              <div style={{ padding: '6px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {isFiltered && rawColTasks.length !== colTasks.length && (
                  <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
                    {colTasks.length}/{rawColTasks.length}
                  </span>
                )}
                <span className="kanban-count" style={{ color: col.color, borderColor: `${col.color}40`, marginLeft: 'auto' }}>
                  {colTasks.length}
                </span>
              </div>

              <div className="kanban-col-body" style={{ minHeight: 120 }}>
                {colTasks.length === 0 ? (
                  <div style={{
                    textAlign: 'center', padding: '20px 0',
                    color: 'var(--color-text-secondary)', fontSize: 13,
                    border: '2px dashed var(--color-border)', borderRadius: 8,
                  }}>
                    {isFiltered ? 'No matching tasks' : 'Drop tasks here'}
                  </div>
                ) : (
                  colTasks.map(task => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      onDragStart={handleDragStart}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}

        <AddColumnPanel onAdd={handleAddCol}/>
      </div>
    </div>
  )
}
