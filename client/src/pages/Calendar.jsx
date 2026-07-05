import { useState, useMemo, useRef } from 'react'
import TaskList from '../components/TaskList'
import { IconChevronLeft, IconChevronRight, IconX, IconPlus } from '../components/Icons'

const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS   = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December']

function getTopPriority(tasks) {
  if (tasks.some(t => t.priority==='high'))   return 'high'
  if (tasks.some(t => t.priority==='medium')) return 'medium'
  if (tasks.some(t => t.priority==='low'))    return 'low'
  return null
}

const dotColors = { high:'#ff4466', medium:'#f59e0b', low:'#00ff9f' }

export default function Calendar({ tasks, loading, onEdit, onDelete, onToggle, onAddNew, fetchTasks }) {
  const today    = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const [viewYear, setViewYear]         = useState(today.getFullYear())
  const [viewMonth, setViewMonth]       = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)
  const [dragOverDate, setDragOverDate] = useState(null)
  const dragTaskId = useRef(null)

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const tasksByDate = useMemo(() => {
    const map = {}
    tasks.forEach(t => {
      if (t.due_date) {
        if (!map[t.due_date]) map[t.due_date] = []
        map[t.due_date].push(t)
      }
    })
    return map
  }, [tasks])

  const formatDate = (day) => {
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return `${viewYear}-${mm}-${dd}`
  }

  const prevMonth = () => {
    if (viewMonth===0) { setViewYear(y=>y-1); setViewMonth(11) } else setViewMonth(m=>m-1)
  }
  const nextMonth = () => {
    if (viewMonth===11) { setViewYear(y=>y+1); setViewMonth(0) } else setViewMonth(m=>m+1)
  }

  // Click date: if already selected, deselect; otherwise select
  const handleDayClick = (dateStr) => {
    setSelectedDate(prev => prev === dateStr ? null : dateStr)
  }

  // Click the + button on a date: open new task form with that date pre-filled
  const handleCreateOnDate = (e, dateStr) => {
    e.stopPropagation()
    onAddNew(dateStr) // passes the date to TaskForm
  }

  // Drag-to-reschedule
  const handleDragStart = (e, taskId) => {
    dragTaskId.current = taskId
    e.dataTransfer.effectAllowed = 'move'
  }
  const handleDragOver = (e, dateStr) => {
    e.preventDefault()
    setDragOverDate(dateStr)
  }
  const handleDrop = async (e, dateStr) => {
    e.preventDefault()
    const id = dragTaskId.current
    if (!id) return
    try {
      await fetch(`/api/tasks/${id}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ due_date: dateStr }),
      })
      fetchTasks()
    } catch {}
    dragTaskId.current = null
    setDragOverDate(null)
  }
  const handleDragLeave = () => setDragOverDate(null)

  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] || []) : []
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div>
      {/* Header */}
      <div className="calendar-header">
        <div className="calendar-title">{MONTHS[viewMonth]} {viewYear}</div>
        <div className="calendar-nav">
          <button className="btn btn-secondary" onClick={prevMonth} style={{ padding:'6px 12px' }}>
            <IconChevronLeft size={16}/>
          </button>
          <button className="btn btn-secondary" style={{ padding:'6px 14px', fontSize:13 }}
            onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()) }}>
            Today
          </button>
          <button className="btn btn-secondary" onClick={nextMonth} style={{ padding:'6px 12px' }}>
            <IconChevronRight size={16}/>
          </button>
        </div>
      </div>

      {/* Hint */}
      <div style={{ fontSize:11, color:'var(--color-text-secondary)', marginBottom:10, display:'flex', gap:16 }}>
        <span>Click a date to view tasks</span>
        <span>· Click + to add a task on that date</span>
        <span>· Drag a task card below onto a date to reschedule</span>
      </div>

      {/* Grid */}
      <div className="calendar-grid" style={{ marginBottom:24 }}>
        <div className="calendar-weekdays">
          {WEEKDAYS.map(d => <div key={d} className="calendar-weekday">{d}</div>)}
        </div>
        <div className="calendar-days">
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} className="calendar-day empty"/>
            const dateStr    = formatDate(day)
            const dayTasks   = tasksByDate[dateStr] || []
            const topPri     = getTopPriority(dayTasks)
            const isToday    = dateStr === todayStr
            const isSelected = dateStr === selectedDate
            const isDragOver = dateStr === dragOverDate

            return (
              <div
                key={dateStr}
                className={`calendar-day ${isToday?'today':''} ${isSelected?'selected':''}`}
                style={{
                  outline: isDragOver ? `2px solid var(--color-neon-blue)` : undefined,
                  background: isDragOver ? 'rgba(0,212,255,0.08)' : undefined,
                  position: 'relative',
                }}
                onClick={() => handleDayClick(dateStr)}
                onDragOver={e => handleDragOver(e, dateStr)}
                onDrop={e => handleDrop(e, dateStr)}
                onDragLeave={handleDragLeave}
              >
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div className="calendar-day-num">{day}</div>
                  {/* + button appears on hover via CSS group */}
                  <button
                    className="cal-add-btn"
                    onClick={e => handleCreateOnDate(e, dateStr)}
                    title={`Add task on ${dateStr}`}
                  >
                    <IconPlus size={10} color="currentColor"/>
                  </button>
                </div>
                {topPri && (
                  <div className="calendar-dots">
                    <div className="calendar-dot" style={{ background:dotColors[topPri], boxShadow:`0 0 5px ${dotColors[topPri]}` }}/>
                    {dayTasks.length > 1 && (
                      <span style={{ fontSize:9, color:'var(--color-text-secondary)' }}>+{dayTasks.length-1}</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected date task list with draggable cards for rescheduling */}
      {selectedDate && (
        <div>
          <div className="section-title" style={{ display:'flex', alignItems:'center' }}>
            Tasks on {selectedDate}
            <button style={{ marginLeft:'auto', background:'none', border:'none', color:'var(--color-text-secondary)', cursor:'pointer' }}
              onClick={() => setSelectedDate(null)}>
              <IconX size={16}/>
            </button>
          </div>

          {selectedTasks.length === 0 ? (
            <div className="empty-state" style={{ padding:'30px 0' }}>
              <p>No tasks due on this date. Click + on the calendar cell to add one.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {selectedTasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={e => handleDragStart(e, task.id)}
                  style={{ cursor:'grab' }}
                >
                  {/* Reuse existing TaskCard via inline render for drag capability */}
                  <div className={`task-card ${task.status==='completed'?'completed':''}`}>
                    <button className={`task-checkbox ${task.status==='completed'?'checked':''}`} onClick={() => onToggle(task.id)}>
                      {task.status==='completed' && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                    <div className="task-body">
                      <div className="task-title">{task.title}</div>
                      {task.description && <div className="task-desc">{task.description}</div>}
                      <div className="task-meta">
                        <span className={`badge-priority badge-${task.priority}`}>
                          <span style={{ display:'inline-block', width:6, height:6, borderRadius:'50%', background:dotColors[task.priority], marginRight:5 }}/>
                          {task.priority}
                        </span>
                        <span className="category-tag">{task.category}</span>
                        <span style={{ fontSize:11, color:'var(--color-text-secondary)', display:'flex', alignItems:'center', gap:3 }}>
                          <IconClock size={11}/> {task.due_date}
                        </span>
                        <span style={{ fontSize:10, color:'var(--color-text-secondary)', fontStyle:'italic' }}>drag to reschedule</span>
                      </div>
                    </div>
                    <div className="task-actions">
                      <button className="icon-btn" onClick={() => onEdit(task)} title="Edit"><IconEdit size={14}/></button>
                      <button className="icon-btn delete" onClick={() => onDelete(task)} title="Delete"><IconTrash size={14}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <div style={{ textAlign:'center', color:'var(--color-text-secondary)', fontSize:13, padding:'20px 0' }}>
          Click a day to view tasks due on that date.
        </div>
      )}
    </div>
  )
}

// import missing icons used inline
function IconClock({ size=14, color='currentColor' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function IconEdit({ size=14, color='currentColor' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}
function IconTrash({ size=14, color='currentColor' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
}
