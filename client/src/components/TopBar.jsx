import { IconSearch, IconBell } from './Icons'

function HamburgerIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
}

export default function TopBar({ title, searchQuery, onSearch, notifCount, onNotifClick, onMenuToggle }) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="topbar">
      {/* Hamburger — visible on mobile/tablet */}
      <button
        className="topbar-menu-btn"
        onClick={onMenuToggle}
        title="Toggle menu"
        aria-label="Toggle sidebar"
      >
        <HamburgerIcon size={20} color="currentColor" />
      </button>

      <div className="topbar-title">
        <h1>{title}</h1>
        <div className="topbar-date">{dateStr}</div>
      </div>

      <div className="topbar-search">
        <IconSearch size={15} color="var(--color-sidebar-text)" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={e => onSearch(e.target.value)}
        />
      </div>

      <button className="topbar-icon-btn" onClick={onNotifClick} title="Notifications">
        <IconBell size={18} color="currentColor" />
        {notifCount > 0 && (
          <span className="badge">{notifCount > 9 ? '9+' : notifCount}</span>
        )}
      </button>
    </div>
  )
}
