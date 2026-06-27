import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'

function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

function dayLabel(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' })
}

const customTooltipStyle = {
  backgroundColor: '#111827',
  border: '1px solid rgba(0,212,255,0.25)',
  borderRadius: '8px',
  color: '#e2e8f0',
  fontSize: 12,
}

export function ActivityLineChart({ tasks }) {
  const days = getLast7Days()
  const data = days.map(day => ({
    name: dayLabel(day),
    created: tasks.filter(t => t.created_at && t.created_at.startsWith(day)).length,
  }))

  return (
    <div className="chart-card">
      <div className="chart-title">Task Activity (7 days)</div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" tick={{ fill: '#8b95a9', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: '#8b95a9', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={customTooltipStyle} />
          <Line
            type="monotone"
            dataKey="created"
            stroke="#00d4ff"
            strokeWidth={2.5}
            dot={{ fill: '#00d4ff', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#00d4ff', boxShadow: '0 0 8px #00d4ff' }}
            name="Tasks Created"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ProgressBarChart({ tasks }) {
  const days = getLast7Days()
  const data = days.map(day => ({
    name: dayLabel(day),
    active: tasks.filter(t => t.status === 'active' && t.created_at && t.created_at.startsWith(day)).length,
    completed: tasks.filter(t => t.status === 'completed' && t.updated_at && t.updated_at.startsWith(day)).length,
  }))

  return (
    <div className="chart-card">
      <div className="chart-title">Progress Overview (7 days)</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" tick={{ fill: '#8b95a9', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: '#8b95a9', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={customTooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#8b95a9' }} />
          <Bar dataKey="active" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Active" />
          <Bar dataKey="completed" fill="#00d4ff" radius={[4, 4, 0, 0]} name="Completed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
