import { IconSearch, IconX } from './Icons'

export default function SearchBar({ value, onChange, placeholder = 'Search tasks...' }) {
  return (
    <div className="topbar-search" style={{ minWidth: 280 }}>
      <IconSearch size={15} color="var(--color-sidebar-text)" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{ background: 'none', border: 'none', color: 'var(--color-sidebar-text)', cursor: 'pointer', display: 'flex', padding: 0 }}
        >
          <IconX size={14} color="currentColor" />
        </button>
      )}
    </div>
  )
}
