export default function StatCard({ label, value, color, icon: Icon, onClick }) {
  return (
    <div
      className={`stat-card ${color} ${onClick ? 'stat-card-clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? e => e.key === 'Enter' && onClick() : undefined}
      title={onClick ? `View ${label}` : undefined}
    >
      <span className="stat-icon">
        {Icon && <Icon size={22} color="currentColor" />}
      </span>
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${color}`}>{value}</div>
      {onClick && (
        <div style={{
          position: 'absolute', bottom: 10, right: 12,
          fontSize: 10, color: 'var(--color-text-secondary)',
          letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600,
        }}>
          View all ›
        </div>
      )}
    </div>
  )
}
