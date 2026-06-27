import { useState, useMemo } from 'react'
import TaskList from '../components/TaskList'
import { IconChevronLeft, IconChevronRight, IconX } from '../components/Icons'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS   = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December']

function getTopPriority(tasks) {
  if (tasks.some(t => t.priority === 'high'))   return 'high'
  if (tasks.some(t => t.priority === 'medium')) return 'medium'
  if (tasks.some(t => t.priority === 'low'))    return 'low'
  return null
}

export default function Calendar({ tasks, loading, onEdit, onDelete, onToggle }) {
  const today    = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const [viewYear, setViewYear]       = useState(today.getFullYear())
  const [viewMonth, setViewMonth]     = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)

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

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const formatDate = (day) => {
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return `${viewYear}-${mm}-${dd}`
  }

  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] || []) : []

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const dotColors = { high: '#ff4466', medium: '#f59e0b', low: '#00ff9f' }

  return (
    <div>
      {/* Nav header */}
      <div className="calendar-header">
        <div className="calendar-title">{MONTHS[viewMonth]} {viewYear}</div>
        <div className="calendar-nav">
          <button className="btn btn-secondary" onClick={prevMonth} style={{ padding: '6px 12px' }}>
            <IconChevronLeft size={16} />
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()) }}
            style={{ padding: '6px 14px', fontSize: 13 }}
          >
            Today
          </button>
          <button className="btn btn-secondary" onClick={nextMonth} style={{ padding: '6px 12px' }}>
            <IconChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="calendar-grid" style={{ marginBottom: 24 }}>
        <div className="calendar-weekdays">
          {WEEKDAYS.map(d => <div key={d} className="calendar-weekday">{d}</div>)}
        </div>
        <div className="calendar-days">
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} className="calendar-day empty" />
            const dateStr  = formatDate(day)
            const dayTasks = tasksByDate[dateStr] || []
            const topPri   = getTopPriority(dayTasks)
            const isToday  = dateStr === todayStr
            const isSelected = dateStr === selectedDate

            return (
              <div
                key={dateStr}
                className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              >
                <div className="calendar-day-num">{day}</div>
                {topPri && (
                  <div className="calendar-dots">
                    <div className="calendar-dot" style={{ background: dotColors[topPri], boxShadow: `0 0 5px ${dotColors[topPri]}` }} />
                    {dayTasks.length > 1 && (
                      <span style={{ fontSize: 9, color: 'var(--color-text-secondary)' }}>+{dayTasks.length - 1}</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected date tasks */}
      {selectedDate && (
        <div>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center' }}>
            Tasks on {selectedDate}
            <button
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
              onClick={() => setSelectedDate(null)}
            >
              <IconX size={16} />
            </button>
          </div>
          <TaskList
            tasks={selectedTasks}
            loading={false}
            error={null}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            emptyMessage="No tasks due on this date."
          />
        </div>
      )}

      {!selectedDate && (
        <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13, padding: '20px 0' }}>
          Click a day to view tasks due on that date.
        </div>
      )}
    </div>
  )
}
