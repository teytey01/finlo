const TABS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

export default function FilterTabs({ active, onChange }) {
  return (
    <div className="filter-tabs">
      {TABS.map(tab => (
        <button
          key={tab.value}
          className={`filter-tab ${active === tab.value ? 'active' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
