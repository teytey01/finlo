import { IconDashboard, IconTasks, IconKanban, IconCalendar, IconBell, IconSettings, IconPlus, IconUser, IconX, IconTag } from './Icons'
import { useSettings } from '../context/SettingsContext'

function DolphinLogo() {
  return (
    <img
      src="/fin.png"
      alt="Fin"
      width={34}
      height={34}
      style={{ objectFit: 'contain', display: 'block' }}
    />
  )
}

const navItems = [
  { path: '/',              label: 'Dashboard',     Icon: IconDashboard },
  { path: '/tasks',         label: 'Tasks',         Icon: IconTasks },
  { path: '/kanban',        label: 'Kanban',        Icon: IconKanban },
  { path: '/calendar',      label: 'Calendar',      Icon: IconCalendar },
  { path: '/tags',          label: 'Tags',          Icon: IconTag },
  { path: '/notifications', label: 'Notifications', Icon: IconBell },
  { path: '/settings',      label: 'Settings',      Icon: IconSettings },
]

/**
 * Props:
 *  activePath   — current route
 *  onNavigate   — navigate(path)
 *  onAddNew     — open task form
 *  isMobile     — boolean
 *  isTablet     — boolean
 *  sidebarOpen  — boolean (controlled by App)
 *  onClose      — callback to close sidebar (mobile/tablet)
 */
export default function Sidebar({ activePath, onNavigate, onAddNew, isMobile, isTablet, sidebarOpen, onClose }) {
  const { settings } = useSettings()

  // Collapsed icon-rail mode: tablet AND sidebar is toggled closed
  const iconOnly = isTablet && !sidebarOpen

  // Mobile drawer: hidden off-screen unless open
  const hiddenMobile = isMobile && !sidebarOpen

  const handleNav = (path) => {
    onNavigate(path)
    if (isMobile && onClose) onClose()
  }

  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      {isMobile && sidebarOpen && (
        <div className="sidebar-backdrop" onClick={onClose} />
      )}

      <div className={`sidebar ${iconOnly ? 'sidebar-icon-only' : ''} ${hiddenMobile ? 'sidebar-hidden' : ''} ${isMobile ? 'sidebar-drawer' : ''}`}>

        {/* Header */}
        <div className="sidebar-logo">
          <div style={{ flexShrink: 0 }}><DolphinLogo /></div>
          {!iconOnly && <span className="sidebar-logo-text">Finlo</span>}
          {/* X button on mobile */}
          {isMobile && sidebarOpen && (
            <button className="sidebar-close-btn" onClick={onClose} title="Close">
              <IconX size={16} color="var(--color-sidebar-text)" />
            </button>
          )}
        </div>

        {!iconOnly && <p className="sidebar-tagline">Every task creates a ripple.</p>}
        {!iconOnly && <div className="sidebar-section-label">Main Menu</div>}

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(({ path, label, Icon }) => (
            <div
              key={path}
              className={`nav-item ${activePath === path ? 'active' : ''} ${iconOnly ? 'nav-item-centered' : ''}`}
              onClick={() => handleNav(path)}
              title={iconOnly ? label : undefined}
            >
              <span className="nav-icon">
                <Icon size={18} color={activePath === path ? 'var(--color-neon-blue)' : 'currentColor'} />
              </span>
              {!iconOnly && <span>{label}</span>}
            </div>
          ))}
        </nav>

        {/* Add task */}
        <button
          className={`sidebar-add-btn ${iconOnly ? 'sidebar-add-btn-icon' : ''}`}
          onClick={() => { onAddNew(); if (isMobile && onClose) onClose() }}
          title={iconOnly ? 'Add New Task' : undefined}
        >
          <IconPlus size={18} color="#fff" />
          {!iconOnly && 'Add New Task'}
        </button>

        {/* User */}
        <div className={`sidebar-user ${iconOnly ? 'sidebar-user-icon' : ''}`}>
          <div className="sidebar-avatar" style={{ flexShrink: 0 }}>
            <IconUser size={16} color="#fff" />
          </div>
          {!iconOnly && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{settings.displayName}</div>
              <div className="sidebar-user-role">{settings.role}</div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
