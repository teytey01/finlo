import { useState, useEffect, useMemo } from 'react'
import FilterTabs from '../components/FilterTabs'
import SearchBar from '../components/SearchBar'
import TaskList from '../components/TaskList'
import { IconPlus } from '../components/Icons'

export default function Tasks({ tasks, loading, error, onEdit, onDelete, onToggle, onAddNew, searchQuery: globalSearch }) {
  const [status, setStatus]         = useState('')
  const [sort, setSort]             = useState('newest')
  const [localSearch, setLocalSearch] = useState(globalSearch || '')

  useEffect(() => {
    if (globalSearch !== undefined) setLocalSearch(globalSearch)
  }, [globalSearch])

  const filtered = useMemo(() => {
    let list = [...tasks]
    if (localSearch.trim()) {
      list = list.filter(t => t.title.toLowerCase().includes(localSearch.toLowerCase()))
    }
    if (status) list = list.filter(t => t.status === status)
    if (sort === 'oldest') {
      list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    } else if (sort === 'priority') {
      const order = { high: 0, medium: 1, low: 2 }
      list.sort((a, b) => order[a.priority] - order[b.priority])
    } else if (sort === 'due_date') {
      list.sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return a.due_date.localeCompare(b.due_date)
      })
    } else {
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
    return list
  }, [tasks, localSearch, status, sort])

  const hasSearch = localSearch.trim().length > 0
  const emptyMsg = hasSearch
    ? "Fin couldn't find any matching tasks."
    : "No tasks yet. Let Fin help you get started!"

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-title">Tasks</div>
          <div className="page-header-sub">{filtered.length} task{filtered.length !== 1 ? 's' : ''} shown</div>
        </div>
        <button className="btn btn-primary" onClick={onAddNew} style={{ gap: 8 }}>
          <IconPlus size={15} color="#fff" />
          Add Task
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
        <SearchBar value={localSearch} onChange={setLocalSearch} />
        <FilterTabs active={status} onChange={setStatus} />
        <select
          className="sort-select"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="priority">By Priority</option>
          <option value="due_date">By Due Date</option>
        </select>
      </div>

      <TaskList
        tasks={filtered}
        loading={loading}
        error={error}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        emptyMessage={emptyMsg}
      />
    </div>
  )
}
