export default function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div className={`stat-card ${color}`}>
      <span className="stat-icon">
        {Icon && <Icon size={22} color="currentColor" />}
      </span>
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${color}`}>{value}</div>
    </div>
  )
}
