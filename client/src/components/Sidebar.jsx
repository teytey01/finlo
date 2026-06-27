import { IconDashboard, IconTasks, IconKanban, IconCalendar, IconBell, IconSettings, IconPlus, IconUser, IconX } from './Icons'
import { useSettings } from '../context/SettingsContext'

function DolphinLogo() {
  return (
    <svg width="34" height="34" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="62" cy="68" rx="36" ry="22" fill="#00d4ff"/>
      <ellipse cx="62" cy="66" rx="34" ry="19" fill="#00c8f0"/>
      <ellipse cx="56" cy="74" rx="22" ry="11" fill="#b8f0ff" opacity="0.55"/>
      <path d="M22 72 Q6 58 10 78 Q14 88 26 80 Z" fill="#0099bb"/>
      <path d="M22 72 Q6 84 14 96 Q22 92 26 80 Z" fill="#00b8d9"/>
      <path d="M64 46 Q74 28 82 42 Q76 50 64 50 Z" fill="#00aed6"/>
      <ellipse cx="90" cy="66" rx="10" ry="7" fill="#00d4ff"/>
      <path d="M83 71 Q88 76 95 71" stroke="#006688" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="84" cy="62" r="4.5" fill="#0a1628"/>
      <circle cx="85.5" cy="60.5" r="1.6" fill="white"/>
      <ellipse cx="70" cy="56" rx="8" ry="3.5" fill="white" opacity="0.15" transform="rotate(-20 70 56)"/>
    </svg>
  )
}

const navItems = [
  { path: '/',              label: 'Dashboard',     Icon: IconDashboard },
  { path: '/tasks',         label: 'Tasks',         Icon: IconTasks },
  { path: '/kanban',        label: 'Kanban',        Icon: IconKanban },
  { path: '/calendar',      label: 'Calendar',      Icon: IconCalendar },
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
