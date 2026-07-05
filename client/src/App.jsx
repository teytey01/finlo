import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import RightPanel from './components/RightPanel'
import DolphinMascot from './components/DolphinMascot'
import TaskForm from './components/TaskForm'
import ConfirmModal from './components/ConfirmModal'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Kanban from './pages/Kanban'
import Calendar from './pages/Calendar'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import Tags from './pages/Tags'
import { useTasks } from './hooks/useTasks'
import { useSettings } from './context/SettingsContext'

function ToastIcon({ type }) {
  if (type === 'error')   return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon-pink)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  if (type === 'warning') return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-medium)" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon-blue)" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
}

function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type || 'success'}`}>
          <span className="toast-icon"><ToastIcon type={t.type} /></span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

function AppInner() {
  const location = useLocation()
  const navigate = useNavigate()
  const { tasks, loading, error, fetchTasks, createTask, updateTask, toggleTask, deleteTask } = useTasks()
  const { settings } = useSettings()

  const [toasts, setToasts]         = useState([])
  const [formOpen, setFormOpen]     = useState(false)
  const [editTask, setEditTask]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [searchQuery, setSearchQuery]   = useState('')
  const [formDefaultDate, setFormDefaultDate] = useState(null)

  // Sidebar state: on mobile starts closed, on desktop starts open
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024)
  // Track whether we are in mobile/tablet mode
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const [isTablet, setIsTablet] = useState(() => window.innerWidth >= 768 && window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      setIsMobile(w < 768)
      setIsTablet(w >= 768 && w < 1024)
      if (w >= 1024) setSidebarOpen(true)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isMobile) setSidebarOpen(false)
  }, [location.pathname, isMobile])

  const pageTitles = {
    '/': 'Dashboard',
    '/tasks': 'Tasks',
    '/kanban': 'Kanban Board',
    '/calendar': 'Calendar',
    '/tags': 'Tags',
    '/notifications': "Fin's Alerts",
    '/settings': 'Settings',
  }
  const pageTitle = pageTitles[location.pathname] || 'Finlo'

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

  // Apply auto-archive: hide completed tasks older than 7 days
  const visibleTasks = settings.autoArchive
    ? tasks.filter(t => {
        if (t.status !== 'completed') return true
        return t.updated_at && t.updated_at >= sevenDaysAgo
      })
    : tasks

  // Notification toggles from settings
  const dueTodayTasks = settings.notifDueToday
    ? visibleTasks.filter(t => t.status === 'active' && t.due_date && t.due_date.startsWith(today))
    : []
  const overdueTasks = settings.notifOverdue
    ? visibleTasks.filter(t => t.status === 'active' && t.due_date && t.due_date < today)
    : []

  const notifications = [
    ...dueTodayTasks.map(t => ({ ...t, notifType: 'due' })),
    ...overdueTasks.map(t => ({ ...t, notifType: 'overdue' })),
  ]

  const handleSaveTask = async (payload) => {
    try {
      if (editTask) {
        await updateTask(editTask.id, payload)
        addToast('Task updated successfully.', 'success')
      } else {
        await createTask(payload)
        addToast('Task added! Fin is on it.', 'success')
      }
      setFormOpen(false)
      setEditTask(null)
      fetchTasks()
    } catch (err) {
      addToast(err.message || 'Something went wrong.', 'error')
      throw err
    }
  }

  const handleEdit = (task) => {
    setEditTask(task)
    setFormOpen(true)
  }

  const handleDeleteRequest = (task) => {
    setDeleteTarget(task)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await deleteTask(deleteTarget.id)
      addToast('Task deleted. Gone like a wave.', 'success')
      fetchTasks()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleToggle = async (id) => {
    try {
      const updated = await toggleTask(id)
      if (updated.status === 'completed' && settings.notifCompleted) {
        addToast('Task complete! Fin does a flip!', 'success')
      }
      fetchTasks()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const openAddForm = (date) => {
    setEditTask(null)
    setFormDefaultDate(date || null)
    setFormOpen(true)
  }

  const sharedProps = {
    tasks: visibleTasks, loading, error, fetchTasks,
    onEdit: handleEdit,
    onDelete: handleDeleteRequest,
    onToggle: handleToggle,
    onAddNew: openAddForm,
    onRefresh: fetchTasks,
  }

  return (
    <div className="app-layout">
      <Sidebar
        activePath={location.pathname}
        onNavigate={navigate}
        onAddNew={openAddForm}
        collapsed={isTablet && !sidebarOpen ? true : false}
        onClose={isMobile ? () => setSidebarOpen(false) : undefined}
        mobileOpen={isMobile && sidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
        sidebarOpen={sidebarOpen}
      />

      <div className="main-area">
        <TopBar
          title={pageTitle}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          notifCount={notifications.length}
          onNotifClick={() => navigate('/notifications')}
          onMenuToggle={() => setSidebarOpen(o => !o)}
        />

        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard {...sharedProps} notifications={notifications} showFinTips={settings.finTips} />} />
            <Route path="/tasks" element={<Tasks {...sharedProps} searchQuery={searchQuery} />} />
            <Route path="/kanban" element={<Kanban {...sharedProps} fetchTasks={fetchTasks} />} />
            <Route path="/calendar" element={<Calendar {...sharedProps} fetchTasks={fetchTasks} />} />
            <Route path="/notifications" element={<Notifications tasks={visibleTasks} />} />
            <Route path="/tags" element={<Tags tasks={visibleTasks} onToggle={handleToggle} onEdit={handleEdit} onDelete={handleDeleteRequest} onRefresh={fetchTasks} />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>

      {/* Right panel hidden on mobile/tablet */}
      {!isMobile && !isTablet && <RightPanel notifications={notifications} />}

      <DolphinMascot notifications={notifications} tasks={tasks} />

      {formOpen && (
        <TaskForm
          task={editTask}
          onSave={handleSaveTask}
          onClose={() => { setFormOpen(false); setEditTask(null); setFormDefaultDate(null) }}
          defaultDate={formDefaultDate}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          task={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <Toast toasts={toasts} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}
